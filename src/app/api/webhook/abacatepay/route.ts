import { NextResponse } from "next/server";

import { CREDIT_PACKS, isValidPackType } from "@/data/credit-packs";
import { verifyWebhookSignature } from "@/server/lib/abacatepay";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";
import { sendPaymentConfirmed } from "@/server/lib/resend";

import type { NextRequest } from "next/server";

// ============================================================
// Webhook payload types (loosely typed — AbacatePay may add fields)
// ============================================================

interface WebhookPayload {
  id: string;
  event: string;
  apiVersion: number;
  devMode: boolean;
  data: {
    // AbacatePay v2 nests checkout data inside data.checkout (not data directly)
    checkout: {
      id: string;
      externalId: string;
      amount: number;
      status: string;
      customerId: string;
    };
    payerInformation?: {
      method?: string;
    };
  };
}

// ============================================================
// POST /api/webhook/abacatepay
// Handles checkout.completed events from AbacatePay v2.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // 0. Capture raw body for debugging (temporary — remove after webhook works)
    const rawBody = await req.text();
    await prisma.$executeRawUnsafe(
      "INSERT INTO webhook_debug (body) VALUES ($1)",
      rawBody.slice(0, 2000),
    );

    // 1. Signature validation (v2: x-webhook-signature header, base64 HMAC-SHA256)
    const signature = req.headers.get("x-webhook-signature") || "";

    // Log full payload structure for debugging (no sensitive data — just keys and IDs)
    let parsedForLog: Record<string, unknown> = {};
    try {
      parsedForLog = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      // If parse fails, log raw body length only
    }
    logger.info(
      {
        hasSignature: !!signature,
        bodyLength: rawBody.length,
        topLevelKeys: Object.keys(parsedForLog),
        event: parsedForLog.event,
        dataKeys: parsedForLog.data ? Object.keys(parsedForLog.data as object) : [],
        dataId: (parsedForLog.data as Record<string, unknown>)?.id,
        dataExternalId: (parsedForLog.data as Record<string, unknown>)?.externalId,
        dataStatus: (parsedForLog.data as Record<string, unknown>)?.status,
      },
      "Webhook raw payload structure",
    );

    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn("Invalid webhook signature");
      return NextResponse.json({ error: "Assinatura invalida" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as WebhookPayload;

    if (body.devMode) {
      logger.info({ eventId: body.id }, "Webhook received in devMode");
    }

    if (body.event !== "checkout.completed") {
      return NextResponse.json({ ok: true });
    }

    // 3. Payment lookup: try externalId first, fallback to checkout ID
    // AbacatePay v2 nests checkout data inside data.checkout
    const checkout = body.data?.checkout;
    const externalId = checkout?.externalId;
    const checkoutId = checkout?.id;

    logger.info(
      { event: body.event, checkoutId, externalId: externalId || "empty", devMode: body.devMode },
      "Webhook payload received",
    );

    // UUID regex to avoid Prisma error on non-UUID externalId
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let payment =
      externalId && isUuid.test(externalId)
        ? await prisma.payment.findUnique({ where: { id: externalId } })
        : null;

    if (payment) {
      logger.info({ method: "externalId", paymentId: payment.id }, "Payment found");
    }

    // Fallback 1: lookup by abacatepayCheckoutId if externalId missing or not found
    if (!payment && checkoutId) {
      payment = await prisma.payment.findFirst({
        where: { abacatepayCheckoutId: checkoutId },
      });
      if (payment) {
        logger.info({ method: "checkoutId", paymentId: payment.id }, "Payment found via fallback");
      }
    }

    // Fallback 2: lookup most recent pending payment by amount (last resort)
    if (!payment && checkout?.amount) {
      payment = await prisma.payment.findFirst({
        where: {
          status: "pending",
          amountCents: checkout?.amount ?? 0,
        },
        orderBy: { createdAt: "desc" },
      });
      if (payment) {
        logger.warn(
          { method: "amount-fallback", paymentId: payment.id, amount: checkout?.amount ?? 0 },
          "Payment found via amount fallback — externalId/checkoutId lookup failed",
        );
      }
    }

    if (!payment) {
      logger.warn({ externalId, checkoutId }, "Payment not found for webhook");
      return NextResponse.json(
        {
          error: "Payment not found",
          debug: {
            externalId,
            checkoutId,
            event: body.event,
            dataKeys: Object.keys(body.data || {}),
          },
        },
        { status: 404 },
      );
    }

    // 4. Idempotency: skip if already paid
    if (payment.status === "paid") {
      logger.info({ externalId }, "Duplicate webhook, skipping");
      return NextResponse.json({ ok: true });
    }

    // 5. Validate pack type
    if (!isValidPackType(payment.packType)) {
      logger.error({ packType: payment.packType }, "Invalid pack type");
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const pack = CREDIT_PACKS[payment.packType as keyof typeof CREDIT_PACKS];

    // 6. Extract payment method from payerInformation (v2 path)
    const method = body.data?.payerInformation?.method || "pix";

    // 7. Atomic transaction: mark paid + create credits + upgrade tier + convert lead
    await prisma.$transaction(async (tx) => {
      // 7a. Mark payment as paid
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          method,
        },
      });

      // 7b. Create credit pack
      await tx.creditPack.create({
        data: {
          clerkUserId: payment.clerkUserId,
          paymentId: payment.id,
          packType: payment.packType,
          total: pack.credits,
          remaining: pack.credits,
        },
      });

      // 7c. If reading exists, upgrade to premium and debit 1 credit
      if (payment.readingId) {
        await tx.reading.update({
          where: { id: payment.readingId },
          data: { tier: "premium" },
        });

        // Debit 1 credit from the pack just created
        const newPack = await tx.creditPack.findFirst({
          where: { paymentId: payment.id },
        });
        if (newPack && newPack.remaining > 0) {
          await tx.creditPack.update({
            where: { id: newPack.id },
            data: { remaining: newPack.remaining - 1 },
          });
        }
      }

      // 7d. Mark lead as converted
      const reading = payment.readingId
        ? await tx.reading.findUnique({ where: { id: payment.readingId } })
        : null;
      if (reading?.leadId) {
        await tx.lead.update({
          where: { id: reading.leadId },
          data: { converted: true },
        });
      }
    });

    logger.info(
      {
        paymentId: payment.id,
        checkoutId: checkout?.id,
        packType: payment.packType,
      },
      "Payment processed",
    );

    // 8. Send email (non-blocking)
    const profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: payment.clerkUserId },
      include: { lead: true },
    });
    if (profile?.lead?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const readingUrl = payment.readingId
        ? `${baseUrl}/ler/resultado/${payment.readingId}`
        : `${baseUrl}/conta/leituras`;
      sendPaymentConfirmed(profile.lead.email, profile.lead.name, readingUrl);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error.message : String(error),
        route: "/api/webhook/abacatepay",
      },
      "Webhook error",
    );
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

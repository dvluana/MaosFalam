import { NextResponse } from "next/server";

import { CREDIT_PACKS, isValidPackType } from "@/data/credit-packs";
import { validateWebhookSignature } from "@/server/lib/abacatepay";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";
import { sendPaymentConfirmed } from "@/server/lib/resend";

import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-abacatepay-signature") || "";

    if (!validateWebhookSignature(rawBody, signature)) {
      logger.warn("Invalid webhook signature");
      return NextResponse.json({ error: "Assinatura invalida" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as {
      event: string;
      data: {
        billing_id: string;
        method?: string;
      };
    };

    if (body.event !== "billing.paid") {
      return NextResponse.json({ ok: true });
    }

    const billingId = body.data.billing_id;

    // Find payment by billing ID
    const payment = await prisma.payment.findFirst({
      where: { abacatepayBillingId: billingId },
    });

    if (!payment) {
      logger.warn({ billingId }, "Payment not found for billing");
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Idempotent: skip if already paid
    if (payment.status === "paid") {
      logger.info({ billingId }, "Duplicate webhook, skipping");
      return NextResponse.json({ ok: true });
    }

    if (!isValidPackType(payment.packType)) {
      logger.error({ packType: payment.packType }, "Invalid pack type");
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const pack = CREDIT_PACKS[payment.packType as keyof typeof CREDIT_PACKS];

    // Atomic transaction: mark paid + create credits + upgrade tier + convert lead
    await prisma.$transaction(async (tx) => {
      // 1. Mark payment as paid
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          method: body.data.method || "pix",
        },
      });

      // 2. Create credit pack
      await tx.creditPack.create({
        data: {
          clerkUserId: payment.clerkUserId,
          paymentId: payment.id,
          packType: payment.packType,
          total: pack.credits,
          remaining: pack.credits,
        },
      });

      // 3. If reading exists, upgrade to premium and debit 1 credit
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

      // 4. Mark lead as converted
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
        billingId,
        packType: payment.packType,
      },
      "Payment processed",
    );

    // Send email (non-blocking)
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

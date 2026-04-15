import { NextResponse } from "next/server";
import { z } from "zod";

import type { PackType } from "@/data/credit-packs";
import { CREDIT_PACKS, isValidPackType } from "@/data/credit-packs";
import { createCheckout, createCustomer, resolveProductId } from "@/server/lib/abacatepay";
import { getClerkUser } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";
import { rateLimit } from "@/server/lib/rate-limit";

const schema = z.object({
  pack_type: z.string(),
  reading_id: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  let step = "init";
  try {
    step = "auth";
    const user = await getClerkUser();

    step = "rate-limit";
    if (!rateLimit(`purchase:${user.id}`, 5)) {
      return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
    }

    step = "parse-body";
    const body = await req.json();
    const data = schema.parse(body);

    step = "validate-pack";
    if (!isValidPackType(data.pack_type)) {
      return NextResponse.json({ error: "Pacote invalido" }, { status: 400 });
    }

    const pack = CREDIT_PACKS[data.pack_type];

    // Ensure user profile exists
    step = "find-profile";
    let profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!profile) {
      step = "create-profile";
      profile = await prisma.userProfile.create({
        data: { clerkUserId: user.id },
      });
    }

    // AbacatePay customer: create if missing, else reuse
    let customerId = profile.abacatepayCustomerId;

    if (!customerId) {
      step = "create-customer";
      customerId = await createCustomer(user.email, user.name);
      step = "save-customer-id";
      await prisma.userProfile.update({
        where: { clerkUserId: user.id },
        data: { abacatepayCustomerId: customerId },
      });
    }

    // v2 flow: create Payment FIRST (pending), then checkout with externalId=payment.id
    step = "create-payment";
    const payment = await prisma.payment.create({
      data: {
        clerkUserId: user.id,
        readingId: data.reading_id,
        packType: data.pack_type,
        amountCents: pack.price_cents,
        status: "pending",
      },
    });

    step = "resolve-product";
    const productId = await resolveProductId(data.pack_type as PackType);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
    }

    step = "create-checkout";
    const checkout = await createCheckout({
      productId,
      customerId,
      externalId: payment.id,
      returnUrl: `${baseUrl}/creditos`,
      completionUrl: data.reading_id
        ? `${baseUrl}/ler/resultado/${data.reading_id}?paid=1`
        : `${baseUrl}/conta/leituras?purchased=1`,
    });

    // Update Payment with checkout ID for reference
    step = "update-payment";
    await prisma.payment.update({
      where: { id: payment.id },
      data: { abacatepayCheckoutId: checkout.id },
    });

    logger.info(
      {
        clerkUserId: user.id,
        packType: data.pack_type,
        checkoutId: checkout.id,
        paymentId: payment.id,
      },
      "Checkout created",
    );

    return NextResponse.json({ checkout_url: checkout.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        err: errMsg,
        step,
        route: "/api/credits/purchase",
      },
      `purchase error at [${step}]: ${errMsg}`,
    );
    return NextResponse.json({ error: "Erro interno", detail: errMsg, step }, { status: 500 });
  }
}

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
  cpf: z.string().min(11).max(14).optional(),
  reading_id: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getClerkUser();

    if (!rateLimit(`purchase:${user.id}`, 5)) {
      return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    if (!isValidPackType(data.pack_type)) {
      return NextResponse.json({ error: "Pacote invalido" }, { status: 400 });
    }

    const pack = CREDIT_PACKS[data.pack_type];

    // Ensure user profile exists
    let profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          clerkUserId: user.id,
          cpf: data.cpf,
        },
      });
    }

    // Create AbacatePay customer if needed (v2: only email required, no CPF gate)
    let customerId = profile.abacatepayCustomerId;
    if (!customerId) {
      customerId = await createCustomer(user.email, user.name);
      await prisma.userProfile.update({
        where: { clerkUserId: user.id },
        data: {
          abacatepayCustomerId: customerId,
          ...(data.cpf && { cpf: data.cpf }),
        },
      });
    }

    // v2 flow: create Payment FIRST (pending), then checkout with externalId=payment.id
    const payment = await prisma.payment.create({
      data: {
        clerkUserId: user.id,
        readingId: data.reading_id,
        packType: data.pack_type,
        amountCents: pack.price_cents,
        status: "pending",
      },
    });

    const productId = await resolveProductId(data.pack_type as PackType);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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
    logger.error(
      {
        err: error instanceof Error ? error.message : String(error),
        route: "/api/credits/purchase",
      },
      "Erro na rota",
    );
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

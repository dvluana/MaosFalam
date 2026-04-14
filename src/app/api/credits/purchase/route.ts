import { NextResponse } from "next/server";
import { z } from "zod";

import { CREDIT_PACKS, isValidPackType } from "@/data/credit-packs";
import { createBilling, createCustomer } from "@/server/lib/abacatepay";
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

    // Create AbacatePay customer if needed
    let customerId = profile.abacatepayCustomerId;
    if (!customerId && data.cpf) {
      const customer = await createCustomer(user.name, user.email, data.cpf);
      customerId = customer.id;
      await prisma.userProfile.update({
        where: { clerkUserId: user.id },
        data: {
          abacatepayCustomerId: customerId,
          cpf: data.cpf,
        },
      });
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "CPF necessario para primeiro pagamento" },
        { status: 400 },
      );
    }

    // Create billing
    const billing = await createBilling(customerId, data.pack_type, pack, data.reading_id);

    // Save pending payment
    await prisma.payment.create({
      data: {
        clerkUserId: user.id,
        readingId: data.reading_id,
        abacatepayBillingId: billing.id,
        packType: data.pack_type,
        amountCents: pack.price_cents,
        status: "pending",
      },
    });

    logger.info(
      {
        clerkUserId: user.id,
        packType: data.pack_type,
        billingId: billing.id,
      },
      "Billing created",
    );

    return NextResponse.json({ checkout_url: billing.url });
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

import { NextResponse } from "next/server";

import { getClerkUserId } from "@/server/lib/auth";
import { debitCreditFIFO } from "@/server/lib/debit-credit";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const clerkUserId = await getClerkUserId();

    const reading = await prisma.reading.findUnique({ where: { id } });

    if (!reading || !reading.isActive) {
      return NextResponse.json({ error: "Leitura nao encontrada" }, { status: 404 });
    }

    // Ownership check: reading must belong to this user
    if (reading.clerkUserId !== clerkUserId) {
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
    }

    // Idempotent: already premium
    if (reading.tier === "premium") {
      const packs = await prisma.creditPack.findMany({
        where: { clerkUserId, remaining: { gt: 0 } },
      });
      const credits_remaining = packs.reduce((sum, p) => sum + p.remaining, 0);
      return NextResponse.json({ ok: true, already_premium: true, credits_remaining });
    }

    // Debit 1 credit (race-safe raw SQL, FIFO) then upgrade reading tier.
    // These two operations are intentionally not wrapped in a $transaction because
    // the raw SQL debit is already atomic. If the reading update fails after a
    // successful debit, the user can retry — the upgrade route is idempotent via
    // the already_premium check above.
    const debit = await debitCreditFIFO(clerkUserId);

    if (!debit.debited) {
      return NextResponse.json({ error: "Sem creditos" }, { status: 402 });
    }

    await prisma.reading.update({
      where: { id },
      data: { tier: "premium" },
    });

    const packs = await prisma.creditPack.findMany({
      where: { clerkUserId, remaining: { gt: 0 } },
    });
    const credits_remaining = packs.reduce(
      (sum: number, p: { remaining: number }) => sum + p.remaining,
      0,
    );

    logger.info(
      { readingId: id, clerkUserId, packId: debit.packId, credits_remaining },
      "Reading upgraded to premium",
    );

    return NextResponse.json({
      ok: true,
      tier: "premium",
      credits_remaining,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/reading/[id]/upgrade" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { getClerkUserId } from "@/server/lib/auth";
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

    // Debit 1 credit FIFO + upgrade tier in atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const pack = await tx.creditPack.findFirst({
        where: { clerkUserId, remaining: { gt: 0 } },
        orderBy: { createdAt: "asc" },
      });

      if (!pack) {
        return { ok: false as const };
      }

      await tx.creditPack.update({
        where: { id: pack.id },
        data: { remaining: pack.remaining - 1 },
      });

      await tx.reading.update({
        where: { id },
        data: { tier: "premium" },
      });

      const packs = await tx.creditPack.findMany({
        where: { clerkUserId, remaining: { gt: 0 } },
      });
      const credits_remaining = packs.reduce(
        (sum: number, p: { remaining: number }) => sum + p.remaining,
        0,
      );

      return { ok: true as const, credits_remaining };
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Sem creditos" }, { status: 402 });
    }

    logger.info(
      { readingId: id, clerkUserId, credits_remaining: result.credits_remaining },
      "Reading upgraded to premium",
    );

    return NextResponse.json({
      ok: true,
      tier: "premium",
      credits_remaining: result.credits_remaining,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/reading/[id]/upgrade" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

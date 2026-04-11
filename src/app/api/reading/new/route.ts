import { NextResponse } from "next/server";
import { z } from "zod";

import { getClerkUserId } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

const schema = z.object({
  target_name: z.string().min(2).max(100),
  target_gender: z.enum(["female", "male"]),
  is_self: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const clerkUserId = await getClerkUserId();
    const body = await req.json();
    const data = schema.parse(body);

    // Debit 1 credit FIFO in transaction
    const result = await prisma.$transaction(async (tx) => {
      const pack = await tx.creditPack.findFirst({
        where: { clerkUserId, remaining: { gt: 0 } },
        orderBy: { createdAt: "asc" },
      });

      if (!pack) {
        return { ok: false, error: "Sem creditos" };
      }

      await tx.creditPack.update({
        where: { id: pack.id },
        data: { remaining: pack.remaining - 1 },
      });

      // Sum remaining credits
      const packs = await tx.creditPack.findMany({
        where: { clerkUserId, remaining: { gt: 0 } },
      });
      const remaining = packs.reduce(
        (sum: number, p: { remaining: number }) => sum + p.remaining,
        0,
      );

      return { ok: true, credits_remaining: remaining };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 402 });
    }

    logger.info(
      {
        clerkUserId,
        target: data.target_name,
        credits_remaining: result.credits_remaining,
      },
      "Credit debited for new reading",
    );

    return NextResponse.json({
      ok: true,
      credits_remaining: result.credits_remaining,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/reading/new" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { getClerkUserId } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

export async function GET() {
  try {
    const clerkUserId = await getClerkUserId();

    const packs = await prisma.creditPack.findMany({
      where: { clerkUserId },
      orderBy: { createdAt: "asc" },
    });

    const balance = packs.reduce(
      (sum: number, p: { remaining: number }) => sum + Math.max(0, p.remaining),
      0,
    );

    return NextResponse.json({
      balance,
      packs: packs.map(
        (p: {
          id: string;
          packType: string;
          total: number;
          remaining: number;
          createdAt: Date;
        }) => ({
          id: p.id,
          pack_type: p.packType,
          total: p.total,
          remaining: p.remaining,
          created_at: p.createdAt,
        }),
      ),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/user/credits" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

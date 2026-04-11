import { NextResponse } from "next/server";

import { getClerkUserId } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

export async function GET() {
  try {
    const clerkUserId = await getClerkUserId();

    const readings = await prisma.reading.findMany({
      where: { clerkUserId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      readings: readings.map(
        (r: {
          id: string;
          targetName: string;
          tier: string;
          report: unknown;
          createdAt: Date;
        }) => ({
          id: r.id,
          target_name: r.targetName,
          tier: r.tier,
          report: r.report,
          created_at: r.createdAt,
        }),
      ),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/user/readings" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

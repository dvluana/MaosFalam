import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

import type { NextRequest } from "next/server";

const uuidSchema = z.string().uuid();

export async function GET(_req: NextRequest, context: { params: Promise<unknown> }) {
  try {
    const { id } = (await context.params) as { id: string };

    const uuidResult = uuidSchema.safeParse(id);
    if (!uuidResult.success) {
      return NextResponse.json({ error: "Leitura nao encontrada" }, { status: 404 });
    }

    const reading = await prisma.reading.findUnique({
      where: { id },
    });

    if (!reading) {
      return NextResponse.json({ error: "Leitura nao encontrada" }, { status: 404 });
    }

    if (!reading.isActive) {
      return NextResponse.json({ error: "Essa leitura foi desativada" }, { status: 410 });
    }

    return NextResponse.json({
      reading: {
        id: reading.id,
        target_name: reading.targetName,
        target_gender: reading.targetGender,
        tier: reading.tier,
        report: reading.report,
        created_at: reading.createdAt,
      },
    });
  } catch (error) {
    logger.error(
      { err: error instanceof Error ? error.message : String(error), route: "/api/reading/[id]" },
      "Erro na rota",
    );
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

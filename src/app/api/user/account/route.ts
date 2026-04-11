import { NextResponse } from "next/server";
import { z } from "zod";

import { getClerkUserId } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

const schema = z.object({
  confirm: z.literal("EXCLUIR"),
});

export async function DELETE(req: Request) {
  try {
    const clerkUserId = await getClerkUserId();
    const body = await req.json();
    schema.parse(body);

    // Soft delete: deactivate all readings
    await prisma.reading.updateMany({
      where: { clerkUserId },
      data: { isActive: false },
    });

    logger.info({ clerkUserId }, "Account soft-deleted");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Confirme digitando EXCLUIR" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/user/account" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

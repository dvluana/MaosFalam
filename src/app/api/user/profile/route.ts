import { NextResponse } from "next/server";
import { z } from "zod";

import { getClerkUser } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

export async function GET() {
  try {
    const user = await getClerkUser();

    const profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: user.id },
    });

    return NextResponse.json({
      clerk_user_id: user.id,
      name: user.name,
      email: user.email,
      cpf: profile?.cpf || null,
      phone: profile?.phone || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "GET /api/user/profile" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

const updateSchema = z.object({
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().min(10).max(20).optional(),
});

export async function PUT(req: Request) {
  try {
    const user = await getClerkUser();
    const body = await req.json();
    const data = updateSchema.parse(body);

    await prisma.userProfile.upsert({
      where: { clerkUserId: user.id },
      create: {
        clerkUserId: user.id,
        cpf: data.cpf,
        phone: data.phone,
      },
      update: {
        ...(data.cpf !== undefined && { cpf: data.cpf }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });

    logger.info({ clerkUserId: user.id }, "Profile updated");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "PUT /api/user/profile" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

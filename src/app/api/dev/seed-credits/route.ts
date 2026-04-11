import { NextResponse } from "next/server";

import { getClerkUserId } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/dev/seed-credits
 *
 * Staging-only endpoint. Creates 100 test credits for the authenticated user.
 * Idempotent: returns 200 { already_seeded: true } if the user already has credits.
 *
 * Guarded by NEXT_PUBLIC_ENV_LABEL === "Testes" — only available in staging.
 */
export async function POST() {
  // Guard: only available in staging environment
  if (process.env.NEXT_PUBLIC_ENV_LABEL !== "Testes") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  try {
    const clerkUserId = await getClerkUserId();

    // Idempotent: check if user already has any credit packs (even depleted ones count as "seeded")
    const existing = await prisma.creditPack.findFirst({
      where: { clerkUserId },
    });

    if (existing) {
      return NextResponse.json({ ok: true, already_seeded: true });
    }

    // CreditPack requires a UserProfile FK — upsert it first
    await prisma.userProfile.upsert({
      where: { clerkUserId },
      create: { clerkUserId },
      update: {},
    });

    await prisma.creditPack.create({
      data: {
        clerkUserId,
        packType: "staging_seed",
        total: 100,
        remaining: 100,
      },
    });

    logger.info({ clerkUserId }, "Staging credits seeded");

    return NextResponse.json({ ok: true, already_seeded: false, credits: 100 }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/dev/seed-credits" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

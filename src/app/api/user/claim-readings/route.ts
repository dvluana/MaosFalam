import { NextResponse } from "next/server";

import { getClerkUser } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 15;

/**
 * POST /api/user/claim-readings
 *
 * Links anonymous readings (created before registration) to the authenticated user.
 * Matches leads and readings by email address and updates clerkUserId.
 * Idempotent: WHERE clerkUserId IS NULL prevents double-claiming.
 */
export async function POST() {
  try {
    const clerkUser = await getClerkUser();

    // Find all unclaimed leads with matching email
    const leads = await prisma.lead.findMany({
      where: {
        email: clerkUser.email,
        clerkUserId: null,
      },
      select: { id: true },
    });

    if (leads.length === 0) {
      return NextResponse.json({ claimed_count: 0 });
    }

    const leadIds = leads.map((l) => l.id);

    // Update leads: set clerkUserId + converted flag
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        clerkUserId: clerkUser.id,
        converted: true,
      },
    });

    // Update unclaimed readings that belong to these leads
    const updated = await prisma.reading.updateMany({
      where: {
        leadId: { in: leadIds },
        clerkUserId: null,
      },
      data: { clerkUserId: clerkUser.id },
    });

    logger.info(
      { clerkUserId: clerkUser.id, claimed_count: updated.count, leadIds },
      "Readings claimed",
    );

    return NextResponse.json({ claimed_count: updated.count });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error(
      {
        err: error instanceof Error ? error.message : String(error),
        route: "/api/user/claim-readings",
      },
      "Erro na rota",
    );
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { getClerkUser } from "@/server/lib/auth";
import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";

export async function GET() {
  try {
    const clerkUser = await getClerkUser();

    // Fetch readings directly linked to this Clerk user
    const claimedReadings = await prisma.reading.findMany({
      where: { clerkUserId: clerkUser.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // Safety net: also find unclaimed readings linked via email match
    // (claim-readings should handle most cases, but this catches edge cases)
    const leads = await prisma.lead.findMany({
      where: { email: clerkUser.email },
      select: { id: true },
    });

    let unclaimedReadings: typeof claimedReadings = [];

    if (leads.length > 0) {
      const leadIds = leads.map((l) => l.id);
      unclaimedReadings = await prisma.reading.findMany({
        where: {
          leadId: { in: leadIds },
          clerkUserId: null,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Merge and deduplicate by id, then sort by createdAt desc
    const seenIds = new Set<string>();
    const allReadings = [...claimedReadings, ...unclaimedReadings].filter((r) => {
      if (seenIds.has(r.id)) return false;
      seenIds.add(r.id);
      return true;
    });

    allReadings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      readings: allReadings.map(
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
      // CREDIT-07: only count readings made with this Clerk account,
      // not unclaimed anonymous readings matched by email
      reading_count: claimedReadings.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }
    logger.error({ error, route: "/api/user/readings" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";
import { rateLimit } from "@/server/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 10;

import type { NextRequest } from "next/server";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  gender: z.enum(["female", "male"]),
  session_id: z.string().min(10).max(64),
  email_opt_in: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`lead:${ip}`, 10)) {
      return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    // Check if this email already has a Clerk account
    const clerk = await clerkClient();
    const existingUsers = await clerk.users.getUserList({ emailAddress: [data.email] });
    if (existingUsers.totalCount > 0) {
      logger.info({ route: "/api/lead/register" }, "Lead email has existing Clerk account");
      return NextResponse.json({ existing_account: true, lead_id: null }, { status: 200 });
    }

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        gender: data.gender,
        sessionId: data.session_id,
        emailOptIn: data.email_opt_in,
      },
    });

    logger.info({ leadId: lead.id }, "Lead registered");

    return NextResponse.json({ lead_id: lead.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    logger.error({ error, route: "/api/lead/register" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

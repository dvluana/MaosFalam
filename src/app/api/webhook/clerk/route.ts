import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { logger } from "@/server/lib/logger";
import { prisma } from "@/server/lib/prisma";
import { sendWelcome } from "@/server/lib/resend";

// ============================================================
// Clerk webhook payload types (subset for user.created)
// ============================================================

interface ClerkEmailAddress {
  email_address: string;
}

interface ClerkUserPayload {
  type: string;
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: ClerkEmailAddress[];
  };
}

// ============================================================
// POST /api/webhook/clerk
// Handles user.created events from Clerk.
// Requires CLERK_WEBHOOK_SECRET env var (svix signing secret).
// ============================================================

export async function POST(req: Request) {
  try {
    // 1. Verify webhook signature via svix
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      logger.error({}, "CLERK_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const rawBody = await req.text();
    const svixId = req.headers.get("svix-id") ?? "";
    const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
    const svixSignature = req.headers.get("svix-signature") ?? "";

    const wh = new Webhook(secret);
    let payload: ClerkUserPayload;

    try {
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkUserPayload;
    } catch {
      logger.warn("Invalid Clerk webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Event filtering: only process user.created
    if (payload.type !== "user.created") {
      return NextResponse.json({ ok: true });
    }

    // 3. Extract user info
    const email = payload.data.email_addresses?.[0]?.email_address;
    const firstName = payload.data.first_name || "voce";

    if (!email) {
      logger.info({ clerkUserId: payload.data.id }, "Clerk user.created without email, skipping");
      return NextResponse.json({ ok: true });
    }

    // 4. Look up lead by email for opt-in check
    const lead = await prisma.lead.findFirst({
      where: { email },
    });

    // 5. Send welcome email only if lead opted in
    if (lead?.emailOptIn === true) {
      sendWelcome(email, firstName);
      logger.info({ clerkUserId: payload.data.id }, "Welcome email queued");
    } else {
      logger.info({ clerkUserId: payload.data.id }, "Lead not opted in, skipping welcome email");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error.message : String(error),
        route: "/api/webhook/clerk",
      },
      "Clerk webhook error",
    );
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

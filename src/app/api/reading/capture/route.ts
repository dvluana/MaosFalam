import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { debitCreditFIFO } from "@/server/lib/debit-credit";
import { logger } from "@/server/lib/logger";
import { analyzeHand } from "@/server/lib/openai";
import { prisma } from "@/server/lib/prisma";
import { rateLimit } from "@/server/lib/rate-limit";
import { sendLeadReading } from "@/server/lib/resend";
import { selectBlocks } from "@/server/lib/select-blocks";

export const runtime = "nodejs";
export const maxDuration = 30; // GPT-4o can take up to 15s

import type { NextRequest } from "next/server";

const schema = z.object({
  photo_base64: z.string().min(100),
  session_id: z.string().min(10).max(64),
  lead_id: z.string().uuid().optional(),
  target_name: z.string().min(2).max(100),
  target_gender: z.enum(["female", "male"]),
  is_self: z.boolean(),
  dominant_hand: z.enum(["right", "left"]).default("right"),
  element_hint: z.enum(["fire", "water", "earth", "air"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`capture:${ip}`, 5)) {
      return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
    }

    const body = await req.json();

    // Limits request body to 2MB — base64 JPEG at 1024px is ~150KB, so 2MB gives headroom
    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Imagem muito grande" }, { status: 413 });
    }

    const data = schema.parse(body);

    // 1. Analyze with GPT-4o
    const attributes = await analyzeHand(data.photo_base64, data.dominant_hand, data.element_hint);

    // 2. Check confidence
    if (attributes.confidence < 0.3) {
      logger.info({ confidence: attributes.confidence }, "Low confidence, rejecting");
      return NextResponse.json(
        {
          error: "Suas linhas estao timidas hoje. Tente de novo com mais luz.",
          code: "LOW_CONFIDENCE",
        },
        { status: 422 },
      );
    }

    // 3. Select blocks
    const report = selectBlocks(attributes, data.target_name, data.target_gender);

    // 4. Determine tier server-side via atomic credit debit.
    //    The client cannot influence this — credit_used is not in the schema.
    const { userId: clerkUserId } = await auth();

    let tier: "free" | "premium" = "free";
    if (clerkUserId) {
      const debit = await debitCreditFIFO(clerkUserId);
      if (debit.debited) {
        tier = "premium";
      }
    }

    // 5. Save reading
    const reading = await prisma.reading.create({
      data: {
        leadId: data.lead_id,
        sessionId: data.session_id,
        targetName: data.target_name,
        targetGender: data.target_gender,
        isSelf: data.is_self,
        attributes: JSON.parse(JSON.stringify(attributes)),
        report: JSON.parse(JSON.stringify(report)),
        tier,
        clerkUserId: clerkUserId ?? undefined,
        confidence: attributes.confidence,
      },
    });

    logger.info(
      {
        readingId: reading.id,
        element: attributes.element,
        confidence: attributes.confidence,
      },
      "Reading created",
    );

    // 6. Send email to lead (non-blocking)
    if (data.lead_id) {
      const lead = await prisma.lead.findUnique({
        where: { id: data.lead_id },
      });
      if (lead?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        sendLeadReading(lead.email, lead.name, `${baseUrl}/ler/resultado/${reading.id}`);
      }
    }

    return NextResponse.json({
      reading_id: reading.id,
      report,
      tier,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    logger.error(
      {
        err: error instanceof Error ? error.message : String(error),
        route: "/api/reading/capture",
      },
      "Erro na rota",
    );
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

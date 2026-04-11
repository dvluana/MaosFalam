import { NextResponse } from "next/server";
import { z } from "zod";

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
  lead_id: z.string().uuid(),
  target_name: z.string().min(2).max(100),
  target_gender: z.enum(["female", "male"]),
  is_self: z.boolean(),
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
    const attributes = await analyzeHand(data.photo_base64);

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

    // 4. Save reading
    const reading = await prisma.reading.create({
      data: {
        leadId: data.lead_id,
        sessionId: data.session_id,
        targetName: data.target_name,
        targetGender: data.target_gender,
        isSelf: data.is_self,
        attributes: JSON.parse(JSON.stringify(attributes)),
        report: JSON.parse(JSON.stringify(report)),
        tier: "free",
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

    // 5. Send email to lead (non-blocking)
    const lead = await prisma.lead.findUnique({
      where: { id: data.lead_id },
    });
    if (lead?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      sendLeadReading(lead.email, lead.name, `${baseUrl}/ler/resultado/${reading.id}`);
    }

    return NextResponse.json({
      reading_id: reading.id,
      report,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    logger.error({ error, route: "/api/reading/capture" }, "Erro na rota");
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

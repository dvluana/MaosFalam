import { z } from "zod";

import type { HandAttributes, HandElement } from "@/types/hand-attributes";

import { logger } from "./logger";

// System prompt in English — neutral terms avoid cultural bias in element classification
const PROMPT = `You are a hand shape classifier for palmistry analysis.

Examine the palm photo and classify the hand into ONE of four structural types based on observable geometric features. Use ONLY the visual indicators listed below. Do not use palmistry knowledge, element names, or cultural associations.

TYPE A — Square and robust palm, short thick fingers, short or no visible knuckle nodes, wide thick palm
TYPE B — Square palm proportions, noticeably long fingers with visible prominent knuckle joints, finger length clearly exceeds palm width
TYPE C — Square palm (width roughly equals length), fingers short relative to palm (finger length under 75% of palm length), NOT thick/robust
TYPE D — Visibly rectangular palm (palm length clearly greater than width), fingers long and thin, narrow palm

For each type, count how many of its indicators you can see in the photo.

Also analyze the four major palm lines and other features as instructed in the schema.

Return the type with the most matching indicators as primary_type.
Return the type with the second-most matching indicators as secondary_type (or "none" if clearly dominated by primary).
Include your indicator count reasoning in type_reasoning (e.g. "A:4 B:1 C:1 D:2").`;

// --- JSON Schema (for GPT-4o Structured Outputs) ---
// Record<MountKey, MountState> and Record<RareSignKey, boolean> must be expanded
// as fixed properties — strict mode rejects additionalProperties with schema.

const MOUNT_STATE_ENUM = ["pronounced", "normal", "flat"] as const;

const HAND_ATTRIBUTES_SCHEMA = {
  type: "object",
  properties: {
    primary_type: { type: "string", enum: ["A", "B", "C", "D"] },
    secondary_type: { type: "string", enum: ["A", "B", "C", "D", "none"] },
    type_reasoning: { type: "string" },
    heart: {
      type: "object",
      properties: {
        variation: {
          type: "string",
          enum: [
            "long_straight",
            "long_curved",
            "long_deep_curved",
            "short_straight",
            "short_curved",
            "medium_straight",
            "medium_curved",
            "faint",
          ],
        },
        modifiers: {
          type: "array",
          items: {
            type: "string",
            enum: ["fork_end", "island", "break", "ends_index", "ends_middle", "deep"],
          },
        },
      },
      required: ["variation", "modifiers"],
      additionalProperties: false,
    },
    head: {
      type: "object",
      properties: {
        variation: {
          type: "string",
          enum: [
            "long_straight",
            "long_curved",
            "long_deep_curved",
            "short_straight",
            "short_curved",
            "medium_straight",
            "medium_curved",
            "faint",
          ],
        },
        modifiers: {
          type: "array",
          items: { type: "string", enum: ["fork_moon", "touches_life", "island", "break"] },
        },
      },
      required: ["variation", "modifiers"],
      additionalProperties: false,
    },
    life: {
      type: "object",
      properties: {
        variation: {
          type: "string",
          enum: [
            "long_deep",
            "long_faint",
            "short_deep",
            "short_faint",
            "curved_wide",
            "curved_tight",
            "broken_restart",
            "chained",
          ],
        },
      },
      required: ["variation"],
      additionalProperties: false,
    },
    fate: {
      type: "object",
      properties: {
        variation: {
          type: "string",
          enum: ["present_deep", "present_faint", "broken", "multiple", "late_start", "absent"],
        },
      },
      required: ["variation"],
      additionalProperties: false,
    },
    venus: {
      type: "object",
      properties: {
        mount: { type: "string", enum: ["pronounced", "flat"] },
        cinturao: { type: "boolean" },
      },
      required: ["mount", "cinturao"],
      additionalProperties: false,
    },
    mounts: {
      type: "object",
      properties: {
        jupiter: { type: "string", enum: MOUNT_STATE_ENUM },
        saturn: { type: "string", enum: MOUNT_STATE_ENUM },
        apollo: { type: "string", enum: MOUNT_STATE_ENUM },
        mercury: { type: "string", enum: MOUNT_STATE_ENUM },
        mars: { type: "string", enum: MOUNT_STATE_ENUM },
        moon: { type: "string", enum: MOUNT_STATE_ENUM },
      },
      required: ["jupiter", "saturn", "apollo", "mercury", "mars", "moon"],
      additionalProperties: false,
    },
    rare_signs: {
      type: "object",
      properties: {
        star_jupiter: { type: "boolean" },
        mystic_cross: { type: "boolean" },
        ring_solomon: { type: "boolean" },
        sun_line: { type: "boolean" },
        intuition_line: { type: "boolean" },
        protection_marks: { type: "boolean" },
      },
      required: [
        "star_jupiter",
        "mystic_cross",
        "ring_solomon",
        "sun_line",
        "intuition_line",
        "protection_marks",
      ],
      additionalProperties: false,
    },
    confidence: { type: "number" },
  },
  required: [
    "primary_type",
    "secondary_type",
    "type_reasoning",
    "heart",
    "head",
    "life",
    "fate",
    "venus",
    "mounts",
    "rare_signs",
    "confidence",
  ],
  additionalProperties: false,
} as const;

// --- Zod schema (safety net after GPT-4o response) ---
// Mirrors HAND_ATTRIBUTES_SCHEMA exactly — no element field (injected server-side after parse)
const MountStateSchema = z.enum(["pronounced", "normal", "flat"]);

export const HandAttributesSchema = z.object({
  primary_type: z.enum(["A", "B", "C", "D"]),
  secondary_type: z.enum(["A", "B", "C", "D", "none"]),
  type_reasoning: z.string(),
  heart: z.object({
    variation: z.enum([
      "long_straight",
      "long_curved",
      "long_deep_curved",
      "short_straight",
      "short_curved",
      "medium_straight",
      "medium_curved",
      "faint",
    ]),
    modifiers: z.array(
      z.enum(["fork_end", "island", "break", "ends_index", "ends_middle", "deep"]),
    ),
  }),
  head: z.object({
    variation: z.enum([
      "long_straight",
      "long_curved",
      "long_deep_curved",
      "short_straight",
      "short_curved",
      "medium_straight",
      "medium_curved",
      "faint",
    ]),
    modifiers: z.array(z.enum(["fork_moon", "touches_life", "island", "break"])),
  }),
  life: z.object({
    variation: z.enum([
      "long_deep",
      "long_faint",
      "short_deep",
      "short_faint",
      "curved_wide",
      "curved_tight",
      "broken_restart",
      "chained",
    ]),
  }),
  fate: z.object({
    variation: z.enum([
      "present_deep",
      "present_faint",
      "broken",
      "multiple",
      "late_start",
      "absent",
    ]),
  }),
  venus: z.object({
    mount: z.enum(["pronounced", "flat"]),
    cinturao: z.boolean(),
  }),
  mounts: z.object({
    jupiter: MountStateSchema,
    saturn: MountStateSchema,
    apollo: MountStateSchema,
    mercury: MountStateSchema,
    mars: MountStateSchema,
    moon: MountStateSchema,
  }),
  rare_signs: z.object({
    star_jupiter: z.boolean(),
    mystic_cross: z.boolean(),
    ring_solomon: z.boolean(),
    sun_line: z.boolean(),
    intuition_line: z.boolean(),
    protection_marks: z.boolean(),
  }),
  confidence: z.number().min(0).max(1),
});

// --- Type → Element mapping ---
const TYPE_TO_ELEMENT: Record<"A" | "B" | "C" | "D", HandElement> = {
  A: "earth",
  B: "air",
  C: "fire",
  D: "water",
};

/** Maps GPT-4o type code to palmistry element. Deterministic — same type always same element. */
export function deriveElement(primaryType: "A" | "B" | "C" | "D"): HandElement {
  return TYPE_TO_ELEMENT[primaryType];
}

/**
 * Returns secondary element or null.
 * null when secondary_type is "none" or matches primary (degenerate case).
 * Only inject into HandAttributes when not null.
 */
export function deriveSecondaryElement(
  secondaryType: "A" | "B" | "C" | "D" | "none",
  primaryType: "A" | "B" | "C" | "D",
): HandElement | null {
  if (secondaryType === "none") return null;
  if (secondaryType === primaryType) return null;
  return TYPE_TO_ELEMENT[secondaryType];
}

// --- analyzeHand ---
export async function analyzeHand(
  photoBase64: string,
  dominantHand: "right" | "left",
): Promise<HandAttributes> {
  const handLabel = dominantHand === "right" ? "direita" : "esquerda";
  const dominanceContext = `Esta e a mao ${handLabel} da pessoa. E a mao dominante (a que ela escreve com). Analise considerando a orientacao correta da palma. Ignore tatuagens, henna, nail art, aneis, pulseiras e qualquer acessorio visivel. Analise APENAS as linhas naturais da palma, montes, e sinais quiromanticos.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-2024-08-06", // minimum version for Structured Outputs
      messages: [
        { role: "system", content: PROMPT },
        {
          role: "user",
          content: [
            // dominanceContext first: hand orientation + accessory exclusion (dynamic, per-request)
            { type: "text" as const, text: dominanceContext },
            // text-before-image: primes extraction (per OpenAI vision docs)
            { type: "text" as const, text: "Analyze this palm." },
            {
              type: "image_url" as const,
              image_url: { url: `data:image/jpeg;base64,${photoBase64}`, detail: "high" as const },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "hand_attributes",
          strict: true,
          schema: HAND_ATTRIBUTES_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    // AI-04: never log photoBase64 in error path
    logger.error({ status: response.status }, "OpenAI API error");
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string | null; refusal: string | null } }>;
  };

  const choice = data.choices[0].message;

  // Handle model refusal (Structured Outputs adds this field)
  if (choice.refusal) {
    logger.warn({ refusal: choice.refusal }, "GPT-4o refused to analyze hand");
    throw new Error("GPT-4o refused: low confidence image");
  }

  if (!choice.content) {
    throw new Error("GPT-4o returned empty content");
  }

  // Zod parse as safety net
  const parsed = HandAttributesSchema.safeParse(JSON.parse(choice.content));
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, "GPT-4o response failed Zod validation");
    throw new Error("Invalid hand attributes from GPT-4o");
  }

  const raw = parsed.data;

  // Derive element server-side — never crosses GPT-4o
  const element = deriveElement(raw.primary_type);
  const secondaryElement = deriveSecondaryElement(raw.secondary_type, raw.primary_type);

  const attributes: HandAttributes = {
    ...raw,
    element,
    ...(secondaryElement !== null ? { secondary_element: secondaryElement } : {}),
  };

  // AI-04: log only element and confidence (not primary_type/reasoning — intermediate data)
  logger.info({ element: attributes.element, confidence: attributes.confidence }, "Hand analyzed");

  return attributes;
}

import { z } from "zod";

import type { HandAttributes } from "@/types/hand-attributes";

import { logger } from "./logger";

const PROMPT = `Voce e um analisador especializado em quiromancia. Analise esta foto de palma e retorne APENAS JSON valido seguindo o schema abaixo. Nao inclua markdown, backticks, nem texto fora do JSON.

Schema esperado:
{
  "element": "fire" | "water" | "earth" | "air",

  "heart": {
    "variation": "long_straight" | "long_curved" | "long_deep_curved" | "short_straight" | "short_curved" | "medium_straight" | "medium_curved" | "faint",
    "modifiers": ["fork_end", "island", "break", "ends_index", "ends_middle", "deep"]
  },

  "head": {
    "variation": "long_straight" | "long_curved" | "long_deep_curved" | "short_straight" | "short_curved" | "medium_straight" | "medium_curved" | "faint",
    "modifiers": ["fork_moon", "touches_life", "island", "break"]
  },

  "life": {
    "variation": "long_deep" | "long_faint" | "short_deep" | "short_faint" | "curved_wide" | "curved_tight" | "broken_restart" | "chained"
  },

  "fate": {
    "variation": "present_deep" | "present_faint" | "broken" | "multiple" | "late_start" | "absent"
  },

  "venus": {
    "mount": "pronounced" | "flat",
    "cinturao": true | false
  },

  "mounts": {
    "jupiter": "pronounced" | "normal" | "flat",
    "saturn": "pronounced" | "normal" | "flat",
    "apollo": "pronounced" | "normal" | "flat",
    "mercury": "pronounced" | "normal" | "flat",
    "mars": "pronounced" | "normal" | "flat",
    "moon": "pronounced" | "normal" | "flat"
  },

  "rare_signs": {
    "star_jupiter": true | false,
    "mystic_cross": true | false,
    "ring_solomon": true | false,
    "sun_line": true | false,
    "intuition_line": true | false,
    "protection_marks": true | false
  },

  "confidence": 0.0 a 1.0
}

Regras:
- heart.variation: combine comprimento (short/medium/long) + curvatura (straight/curved/deep_curved). Se profundidade fraca, use "faint"
- heart.modifiers: inclua apenas os presentes. fork_end=bifurcacao no final, island=ilhas, break=interrupcoes, ends_index/ends_middle=onde termina, deep=profundidade acentuada
- head.variation: mesma logica do coracao. deep_curved=queda pro Monte da Lua
- head.modifiers: fork_moon=bifurcacao pro Monte da Lua, touches_life=toca linha da vida
- life.variation: combine comprimento+profundidade. curved_wide/tight=arco. broken_restart=interrupcao com recomeço. chained=encadeada
- fate.variation: absent se nao presente. late_start=comeca no meio da palma. multiple=varias linhas
- mounts: avalie por volume aparente e sombras
- rare_signs: so reporte com confianca media-alta. Falso positivo pior que falso negativo
- confidence: baseado na qualidade da foto`;

// --- JSON Schema (for GPT-4o Structured Outputs) ---
// Record<MountKey, MountState> and Record<RareSignKey, boolean> must be expanded
// as fixed properties — strict mode rejects additionalProperties with schema.

const MOUNT_STATE_ENUM = ["pronounced", "normal", "flat"] as const;

const HAND_ATTRIBUTES_SCHEMA = {
  type: "object",
  properties: {
    element: { type: "string", enum: ["fire", "water", "earth", "air"] },
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
    "element",
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
const MountStateSchema = z.enum(["pronounced", "normal", "flat"]);

export const HandAttributesSchema = z.object({
  element: z.enum(["fire", "water", "earth", "air"]),
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

// --- analyzeHand ---
export async function analyzeHand(
  photoBase64: string,
  dominantHand: "right" | "left",
  elementHint?: "fire" | "water" | "earth" | "air",
): Promise<HandAttributes> {
  const handLabel = dominantHand === "right" ? "direita" : "esquerda";
  const dominanceContext = `Esta e a mao ${handLabel} da pessoa. E a mao dominante (a que ela escreve com). Analise considerando a orientacao correta da palma. Ignore tatuagens, henna, nail art, aneis, pulseiras e qualquer acessorio visivel. Analise APENAS as linhas naturais da palma, montes, e sinais quiromanticos.`;

  const elementHintText = elementHint
    ? `Elemento da mao ja determinado por landmarks: ${elementHint}. Nao precisa classificar elemento — foque nas linhas, montes e sinais.`
    : null;

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
            // optional element hint from MediaPipe landmark geometry (pre-analysis)
            ...(elementHintText ? [{ type: "text" as const, text: elementHintText }] : []),
            // text-before-image: primes extraction (per OpenAI vision docs)
            { type: "text" as const, text: "Analise esta palma." },
            {
              type: "image_url" as const,
              image_url: { url: `data:image/jpeg;base64,${photoBase64}`, detail: "high" as const },
            },
          ],
        },
      ],
      max_tokens: 1500,
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

  const attributes = parsed.data;

  // AI-04: log only element and confidence
  logger.info({ element: attributes.element, confidence: attributes.confidence }, "Hand analyzed");

  return attributes;
}

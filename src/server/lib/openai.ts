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
- element: determine pela proporcao palma/dedos (quadrada+curtos=terra, quadrada+longos=ar, longa+curtos=fogo, longa+longos=agua)
- heart.variation: combine comprimento (short/medium/long) + curvatura (straight/curved/deep_curved). Se profundidade fraca, use "faint"
- heart.modifiers: inclua apenas os presentes. fork_end=bifurcacao no final, island=ilhas, break=interrupcoes, ends_index/ends_middle=onde termina, deep=profundidade acentuada
- head.variation: mesma logica do coracao. deep_curved=queda pro Monte da Lua
- head.modifiers: fork_moon=bifurcacao pro Monte da Lua, touches_life=toca linha da vida
- life.variation: combine comprimento+profundidade. curved_wide/tight=arco. broken_restart=interrupcao com recomeço. chained=encadeada
- fate.variation: absent se nao presente. late_start=comeca no meio da palma. multiple=varias linhas
- mounts: avalie por volume aparente e sombras
- rare_signs: so reporte com confianca media-alta. Falso positivo pior que falso negativo
- confidence: baseado na qualidade da foto`;

export async function analyzeHand(photoBase64: string): Promise<HandAttributes> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${photoBase64}`,
                detail: "high",
              },
            },
            { type: "text", text: "Analise esta palma." },
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    logger.error({ status: response.status }, "OpenAI API error");
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = data.choices[0].message.content;
  const attributes: HandAttributes = JSON.parse(content);

  logger.info(
    {
      element: attributes.element,
      confidence: attributes.confidence,
    },
    "Hand analyzed",
  );

  return attributes;
}

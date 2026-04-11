# Phase 3: AI Pipeline - Research

**Researched:** 2026-04-10
**Domain:** GPT-4o Structured Outputs + Zod validation + selectBlocks hardening
**Confidence:** HIGH

---

<phase_requirements>

## Phase Requirements

| ID    | Description                                                                                 | Research Support                                                                     |
| ----- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| AI-01 | Wrapper sends photo base64 to GPT-4o with Structured Outputs (json_schema, not json_object) | JSON Schema derived from HandAttributes; strict mode rules documented below          |
| AI-02 | Prompt returns HandAttributes valid per src/types/hand-attributes.ts                        | Prompt already matches schema; text-before-image ordering improves accuracy          |
| AI-03 | Photo never stored — processed and discarded                                                | No changes needed to storage layer; photo only touches analyzeHand() as a parameter  |
| AI-04 | Logs register only element and confidence, never the photo                                  | Pino logger already filters; must NOT log photoBase64 in any path (error or success) |

</phase_requirements>

---

## Summary

The current `src/server/lib/openai.ts` uses `response_format: { type: "json_object" }`, which returns valid JSON but does not enforce field types or enum values. A single bad GPT-4o response — a string where an integer is expected, an unknown enum value, or a missing required field — propagates silently into `selectBlocks` and causes a crash or garbage output. The fix is three layered changes:

1. Switch to `response_format: { type: "json_schema", json_schema: { strict: true, ... } }` — GPT-4o will refuse to return output that violates the schema at the field level.
2. Add a Zod parse of the GPT-4o response before calling `selectBlocks` — catches any edge case the Structured Outputs layer misses.
3. Harden `selectBlocks` with null-safe block lookups — if a variation is unknown, return a fallback block instead of throwing.

The `HandAttributes` type uses `Record<MountKey, MountState>` and `Record<RareSignKey, boolean>`. The OpenAI JSON Schema strict mode requires `additionalProperties: false`, which means these Record types must be expanded as fixed `properties` objects in the schema (each key listed explicitly). The TypeScript type is unchanged; only the JSON Schema representation must be flattened.

**Primary recommendation:** Derive the `HAND_ATTRIBUTES_SCHEMA` constant by manually expanding the Record types as fixed properties, pin the model to `gpt-4o-2024-08-06`, and wrap the entire GPT-4o call + Zod parse in a dedicated `parseHandAttributes()` function.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict. Sem `any`.
- Componentes: funcoes + export default.
- Tailwind pra estilos. CSS custom so pra canvas/particles.
- `no-console: error` no ESLint — use Pino logger only.
- Front com mocks primeiro. Hook useMock() pra transicao pro backend.
- 1 componente = 1 responsabilidade = 1 arquivo.
- Logica de dados (fetch, transformacao) fica em hooks, nao em componentes.
- Nao criar abstracoes "pra caso precise no futuro". Extraia quando precisar.

---

## Standard Stack

### Core (already installed)

| Library   | Version  | Purpose                               | Why Standard                                                   |
| --------- | -------- | ------------------------------------- | -------------------------------------------------------------- |
| raw fetch | built-in | GPT-4o API calls                      | Correct per STACK.md; no openai SDK needed for single endpoint |
| zod       | 4.3.6    | Runtime validation of GPT-4o response | Already installed; strict mode enforces types at runtime       |
| pino      | 10.3.1   | Structured logging                    | Already configured with PII redact                             |

### No new packages required

All packages needed for Phase 3 are already installed. No `npm install` step.

---

## Architecture Patterns

### File to modify

```
src/server/lib/openai.ts    # switch response_format + add Zod parse
src/data/blocks/            # add _fallback entries to HEART_BLOCKS, HEAD_BLOCKS, LIFE_BLOCKS, FATE_BLOCKS
src/server/lib/select-blocks.ts  # harden buildLineSection to use fallback
```

### Pattern 1: Structured Outputs JSON Schema (strict mode)

**What:** Replace `response_format: { type: "json_object" }` with `response_format: { type: "json_schema", json_schema: { name, strict: true, schema } }`.

**Strict mode rules (verified against OpenAI docs):**

- Every object MUST have `"additionalProperties": false`
- Every property MUST be listed in `"required"` (all fields required in strict mode)
- `Record<K, V>` types CANNOT use `additionalProperties` with a schema — must be expanded as explicit fixed properties
- Supported: `string`, `number`, `boolean`, `array`, `object`, `enum`
- Unsupported: `oneOf`, `anyOf` (do not use in schema)
- Model must be pinned to `gpt-4o-2024-08-06` or later (this version introduced Structured Outputs)

**Critical: HandAttributes Record expansion**

The TypeScript types `mounts: Record<MountKey, MountState>` and `rare_signs: Record<RareSignKey, boolean>` must be expressed as objects with explicit properties in JSON Schema:

```typescript
// Source: OpenAI Structured Outputs docs — strict mode requires no dynamic keys
const MOUNTS_SCHEMA = {
  type: "object",
  properties: {
    jupiter: { type: "string", enum: ["pronounced", "normal", "flat"] },
    saturn: { type: "string", enum: ["pronounced", "normal", "flat"] },
    apollo: { type: "string", enum: ["pronounced", "normal", "flat"] },
    mercury: { type: "string", enum: ["pronounced", "normal", "flat"] },
    mars: { type: "string", enum: ["pronounced", "normal", "flat"] },
    moon: { type: "string", enum: ["pronounced", "normal", "flat"] },
  },
  required: ["jupiter", "saturn", "apollo", "mercury", "mars", "moon"],
  additionalProperties: false,
} as const;

const RARE_SIGNS_SCHEMA = {
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
} as const;
```

**Full HAND_ATTRIBUTES_SCHEMA:**

```typescript
export const HAND_ATTRIBUTES_SCHEMA = {
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
          items: {
            type: "string",
            enum: ["fork_moon", "touches_life", "island", "break"],
          },
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

    mounts: MOUNTS_SCHEMA,
    rare_signs: RARE_SIGNS_SCHEMA,

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
```

### Pattern 2: Zod schema as safety net

**What:** Parse GPT-4o response through Zod before calling `selectBlocks`. Even with Structured Outputs, Zod provides TypeScript narrowing and a clean error path.

**Zod v4 syntax (installed version):**

```typescript
import { z } from "zod";

const HeartVariationSchema = z.enum([
  "long_straight",
  "long_curved",
  "long_deep_curved",
  "short_straight",
  "short_curved",
  "medium_straight",
  "medium_curved",
  "faint",
]);

const HeadVariationSchema = z.enum([
  "long_straight",
  "long_curved",
  "long_deep_curved",
  "short_straight",
  "short_curved",
  "medium_straight",
  "medium_curved",
  "faint",
]);

const MountStateSchema = z.enum(["pronounced", "normal", "flat"]);

export const HandAttributesSchema = z.object({
  element: z.enum(["fire", "water", "earth", "air"]),
  heart: z.object({
    variation: HeartVariationSchema,
    modifiers: z.array(
      z.enum(["fork_end", "island", "break", "ends_index", "ends_middle", "deep"]),
    ),
  }),
  head: z.object({
    variation: HeadVariationSchema,
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
```

### Pattern 3: selectBlocks fallback hardening

**What:** `buildLineSection` in `select-blocks.ts` calls `blocks[variation]` and silently gets `undefined` if GPT-4o returns an unknown variation. The result is empty strings for `opening`, `body_past`, `body_present` — garbage output, no crash.

**Current behavior:** `blocks[variation]` returns `undefined`; `pickRandom(undefined)` throws or returns `undefined!`. The spread `{ ...measurement }` on `measurements[variation] ?? {}` already has a fallback but block lookup does not.

**Fix:** Add a `_fallback` key to each block map (HEART_BLOCKS, HEAD_BLOCKS, LIFE_BLOCKS, FATE_BLOCKS) and use it as default:

```typescript
function buildLineSection(
  key: string,
  variation: string,
  modifiers: readonly string[],
  blocks: Record<string, LineBlocks>,
  modifierBlocks: Record<string, TextBlock>,
  measurements: Record<string, MeasurementSet>,
): ReportSection {
  const lineBlock = blocks[variation] ?? blocks["_fallback"];
  // If even _fallback is missing, log warn and use empty strings
  const sectionOpening = lineBlock ? pickRandom(lineBlock.opening) : "";
  // ...rest unchanged
}
```

The `_fallback` block content should be a generic non-crashing text that passes brand voice (cigana voz). Log the unknown variation at `warn` level (without PII) so drift can be tracked.

### Pattern 4: Content ordering in message array

**What:** Text instruction should precede the image in the `content` array. GPT-4o processes content sequentially — text-first primes the extraction task.

**Current (suboptimal):** `[{ type: "image_url" }, { type: "text" }]`
**Correct:** `[{ type: "text", text: "Analise esta palma." }, { type: "image_url", ... }]`

This is already noted in STACK.md as a MEDIUM confidence improvement.

### Pattern 5: Model pinning

**What:** Pin to `gpt-4o-2024-08-06` (the first version supporting Structured Outputs). The current code uses `"gpt-4o"` without version — this may point to a newer snapshot that changes behavior.

```typescript
model: "gpt-4o-2024-08-06",  // minimum version for Structured Outputs
```

### Pattern 6: Log discipline (AI-04)

**What:** `analyzeHand()` must NEVER log `photoBase64`. Current code logs only `element` and `confidence` on success — this is correct. The error path must also avoid logging the photo:

```typescript
// CORRECT — error path
logger.error({ status: response.status }, "OpenAI API error");  // no photoBase64

// WRONG — never do this
logger.error({ photo: photoBase64, ... }, "OpenAI API error");
```

### Anti-Patterns to Avoid

- **Using `json_object` mode:** Allows valid JSON with wrong types. Switch to `json_schema`.
- **Skipping Zod after Structured Outputs:** Even with strict mode, Zod provides TypeScript narrowing. Both layers serve different purposes.
- **Dynamic `additionalProperties` schema for Record types:** Strict mode does not support `additionalProperties: { type: "string" }` — must use explicit properties.
- **Logging `photoBase64` on error:** Violates AI-04. The error handler must never log the photo.
- **Storing `photoBase64` in any variable that outlives the function call:** AI-03 requires photo be processed and discarded.

---

## Don't Hand-Roll

| Problem                           | Don't Build                  | Use Instead                               | Why                                                                                |
| --------------------------------- | ---------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Schema enforcement at API call    | Pre/post string manipulation | GPT-4o Structured Outputs (json_schema)   | Model refuses to return output violating the schema — catches issues before Zod    |
| Runtime type validation           | Manual field checks          | Zod parse                                 | Zod provides exhaustive type narrowing, clear error messages, and TypeScript types |
| JSON Schema from TypeScript types | Manual derivation            | Manual derivation (no automated tool yet) | `zod-to-json-schema` exists but adds a dependency; derive once, maintain manually  |

---

## Common Pitfalls

### Pitfall 1: Record Types Break Strict Mode

**What goes wrong:** `additionalProperties` with a schema value (e.g., `additionalProperties: { type: "string" }`) is not supported in strict mode. The API returns a 400 error: "additionalProperties must be false when strict is true."

**Why it happens:** TypeScript's `Record<K, V>` maps to `additionalProperties` in JSON Schema. OpenAI strict mode disallows this.

**How to avoid:** Expand every `Record` as explicit fixed properties with `additionalProperties: false`. For `HandAttributes`: expand `mounts` (6 keys) and `rare_signs` (6 keys) as fixed property objects.

**Warning signs:** API returns 400 with schema validation error before GPT-4o processes the image.

---

### Pitfall 2: All Fields Must Be Required in Strict Mode

**What goes wrong:** If any property is omitted from the `required` array, the API rejects the schema with "all properties must be required in strict mode."

**Why it happens:** Strict mode enforces completeness. Optional fields in strict mode must use a union with null (`{ type: ["string", "null"] }`) but that syntax is also unsupported. The workaround: make all fields required and use sensible defaults in the Zod fallback.

**How to avoid:** List every property in `required`. For arrays like `modifiers`, an empty array `[]` is a valid "no modifiers" response — this is already how the prompt is designed.

**Warning signs:** API returns 400 "all properties of an object schema must be required."

---

### Pitfall 3: selectBlocks Silent Garbage on Missing Variation

**What goes wrong:** `blocks[variation]` returns `undefined` when GPT-4o returns a variation not in the block map. `pickRandom(undefined)` throws `Cannot read properties of undefined`. The reading 500s.

**Why it happens:** GPT-4o with Structured Outputs enforces enum values, so this should only happen if the schema definition drifts from the block maps. But it's a correctness guarantee, not an absolute one.

**How to avoid:** Add `_fallback` keys to every block map. Use `blocks[variation] ?? blocks["_fallback"]` in `buildLineSection`. Log the unknown variation at `warn` level without PII.

**Warning signs:** 500 errors on `/api/reading/capture` that don't correlate with network failures.

---

### Pitfall 4: GPT-4o model Version Drift

**What goes wrong:** `model: "gpt-4o"` (no version) points to OpenAI's "latest" snapshot. OpenAI may update what snapshot `gpt-4o` points to, changing extraction behavior or adding/removing Structured Outputs support without notice.

**Why it happens:** Developers use the convenience alias instead of a pinned version.

**How to avoid:** Always use `model: "gpt-4o-2024-08-06"` (minimum version for Structured Outputs, verified to work).

**Warning signs:** Intermittent failures that started on a specific date without code changes.

---

### Pitfall 5: Photo Size / Vercel Body Limit

**What goes wrong:** Full-resolution phone photo = 3-8MB JPEG = 4-11MB base64. Vercel's default body limit is 4.5MB — the request 413s before reaching GPT-4o.

**Why it happens:** Camera pipeline captures at native device resolution. Base64 encoding adds ~33% overhead.

**How to avoid (client-side, Phase 3 is server-only):** This is addressed in the camera pipeline phase. For the server wrapper, add a defensive size check and a clear error response. The prompt already assumes a resized image.

**Warning signs:** 413 errors on `/api/reading/capture` from production mobile devices.

---

## Code Examples

### Complete updated analyzeHand() — reference pattern

```typescript
// src/server/lib/openai.ts
import { z } from "zod";
import type { HandAttributes } from "@/types/hand-attributes";
import { logger } from "./logger";

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
export async function analyzeHand(photoBase64: string): Promise<HandAttributes> {
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
            // text-before-image: primes extraction (per OpenAI vision docs)
            { type: "text", text: "Analise esta palma." },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${photoBase64}`, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 1500,
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
```

### selectBlocks fallback hardening pattern

```typescript
// In buildLineSection (select-blocks.ts)
// Source: derived from PITFALLS.md Pitfall 10

function buildLineSection(
  key: string,
  variation: string,
  modifiers: readonly string[],
  blocks: Record<string, LineBlocks>,
  modifierBlocks: Record<string, TextBlock>,
  measurements: Record<string, MeasurementSet>,
): ReportSection {
  const meta = resolveMeta(key);

  // Fallback to _fallback key if variation not found
  const lineBlock = blocks[variation] ?? blocks["_fallback"];
  if (!lineBlock && blocks[variation] === undefined) {
    // Log variation drift without PII
    logger.warn({ axis: key, variation }, "Unknown variation, no fallback block found");
  }

  const sectionOpening = lineBlock ? pickRandom(lineBlock.opening) : "";
  const bodyPast = lineBlock ? pickRandom(lineBlock.body_past) : "";
  const bodyPresent = lineBlock ? pickRandom(lineBlock.body_present) : "";

  // ...rest unchanged
}
```

---

## State of the Art

| Old Approach                               | Current Approach                                         | When Changed | Impact                                            |
| ------------------------------------------ | -------------------------------------------------------- | ------------ | ------------------------------------------------- |
| `response_format: { type: "json_object" }` | `response_format: { type: "json_schema", strict: true }` | Aug 2024     | Model enforces enum/type constraints at API level |
| `model: "gpt-4o"` (floating)               | `model: "gpt-4o-2024-08-06"` (pinned)                    | Ongoing      | Prevents silent behavior changes                  |
| Post-parse `JSON.parse()` without Zod      | `HandAttributesSchema.safeParse()` after GPT-4o response | Phase 3      | TypeScript narrows correctly; clear error path    |
| Image before text in content array         | Text instruction before image                            | Aug 2024     | Measurably improves extraction accuracy           |

**Deprecated/outdated:**

- `response_format: { type: "json_object" }`: Valid JSON guaranteed, schema NOT enforced. Use `json_schema` with strict mode instead.

---

## Open Questions

1. **`_fallback` block content**
   - What we know: `buildLineSection` needs a `_fallback` entry per block map
   - What's unclear: What should the fallback text say? Generic cigana voice, neutral
   - Recommendation: Write a single generic fallback per axis (heart, head, life, fate) that passes brand voice. Example for heart: `{ opening: { content: "...", alt: "...", alt2: "..." }, body_past: {...}, body_present: {...} }`. The planner should create one fallback block per axis as part of the task.

2. **Zod v4 `z.enum()` syntax check**
   - What we know: Zod v4 installed (4.3.6); `z.enum(["a","b"])` is correct v4 syntax
   - What's unclear: No breaking change here vs v3 for enum arrays
   - Recommendation: Use `z.enum([...])` — confirmed correct in v4.

---

## Environment Availability

Step 2.6: SKIPPED for external services (GPT-4o is a remote API — no local probe possible). The `OPENAI_API_KEY` env var is required at runtime and must be present in `.env.local`.

| Dependency     | Required By   | Available   | Version | Fallback                                    |
| -------------- | ------------- | ----------- | ------- | ------------------------------------------- |
| OPENAI_API_KEY | analyzeHand() | Must be set | —       | None — reading capture will fail without it |
| zod            | Validation    | ✓           | 4.3.6   | —                                           |
| pino           | Logging       | ✓           | 10.3.1  | —                                           |

---

## Validation Architecture

### Test Framework

| Property           | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| Framework          | Vitest 3.x                                                      |
| Config file        | `vitest.config.ts`                                              |
| Quick run command  | `npm run test -- --run src/server/lib/__tests__/openai.test.ts` |
| Full suite command | `npm run test`                                                  |

### Phase Requirements to Test Map

| Req ID | Behavior                                             | Test Type | Automated Command                                                                       | File Exists? |
| ------ | ---------------------------------------------------- | --------- | --------------------------------------------------------------------------------------- | ------------ |
| AI-01  | `analyzeHand()` uses json_schema response_format     | unit      | `npm run test -- --run src/server/lib/__tests__/openai.test.ts`                         | No — Wave 0  |
| AI-02  | Zod validates GPT-4o response matches HandAttributes | unit      | `npm run test -- --run src/server/lib/__tests__/openai.test.ts`                         | No — Wave 0  |
| AI-03  | Photo not stored in any variable post-parse          | unit      | Static analysis (grep for photoBase64 assignments) + test that return type has no photo | No — Wave 0  |
| AI-04  | Logs contain only element + confidence               | unit      | Pino writable stream test pattern (same as logger.test.ts)                              | No — Wave 0  |

### Sampling Rate

- **Per task commit:** `npm run test -- --run src/server/lib/__tests__/openai.test.ts`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/server/lib/__tests__/openai.test.ts` — covers AI-01, AI-02, AI-03, AI-04
  - Mock `fetch` to return a valid GPT-4o response body
  - Mock `fetch` to return a malformed response (missing field) — assert Zod error thrown
  - Mock `fetch` to return a refusal — assert error thrown
  - Assert that `logger.info` receives `{ element, confidence }` and nothing else
  - Assert that `logger.error` does not receive `photoBase64`
- [ ] `src/server/lib/__tests__/select-blocks.test.ts` (extend existing if present) — covers fallback behavior
  - Call `selectBlocks` with an attributes object that has an unknown variation for one axis
  - Assert return value is a valid `ReportJSON` (no throw, no empty sections)

---

## Sources

### Primary (HIGH confidence)

- [OpenAI Structured Outputs docs](https://developers.openai.com/api/docs/guides/structured-outputs) — strict mode rules, additionalProperties: false requirement, all fields required, supported models
- [OpenAI Structured Outputs intro cookbook](https://cookbook.openai.com/examples/structured_outputs_intro) — API call structure verified
- [OpenAI introducing Structured Outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/) — gpt-4o-2024-08-06 as minimum supported version
- `src/types/hand-attributes.ts` — HandAttributes type (source of truth for schema)
- `src/server/lib/openai.ts` — current wrapper (what to modify)
- `src/server/lib/select-blocks.ts` — block lookup pattern (where fallback must be added)
- `.planning/research/PITFALLS.md` — Pitfalls 5, 6, 10 directly relevant

### Secondary (MEDIUM confidence)

- [OpenAI community: additionalProperties must be false in strict mode](https://community.openai.com/t/schema-additionalproperties-must-be-false-when-strict-is-true/929996) — confirms Record type limitation
- [OpenAI community: strict=true requires all fields in required](https://community.openai.com/t/strict-true-and-required-fields/1131075) — confirms all-required constraint
- [OpenAI vision docs](https://developers.openai.com/api/docs/guides/images-vision) — text-before-image ordering (STACK.md Gotcha 7)
- `.planning/research/STACK.md` — Gotcha 7 (text-before-image), raw fetch pattern confirmed

---

## Metadata

**Confidence breakdown:**

- JSON Schema construction: HIGH — OpenAI strict mode rules verified via official docs + community
- Zod v4 syntax: HIGH — installed version confirmed (4.3.6), z.enum() syntax unchanged from v3
- selectBlocks fallback: HIGH — code analyzed directly, pattern is straightforward
- Model pinning: HIGH — gpt-4o-2024-08-06 is the documented minimum for Structured Outputs
- Content ordering improvement: MEDIUM — per OpenAI vision docs (text-before-image)

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (30 days — OpenAI API is relatively stable, Zod v4 is stable)

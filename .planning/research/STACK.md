# Stack Research

**Domain:** MaosFalam v1.4 — Element Classification, MediaPipe Validation, Mixed-Hand Support
**Researched:** 2026-04-18
**Confidence:** HIGH (all claims verified against official docs and existing codebase)

---

## Context

This is an ADDITIVE research document for milestone v1.4. The full stack is already established
(Next.js 16.2.3, React 19, Tailwind v4, GPT-4o raw fetch, MediaPipe 0.10.34, Prisma 7, Clerk v7,
Zod v4). No new packages are required for any v1.4 feature.

Research focus: what changes to how the EXISTING stack is used, not what to add.

---

## What v1.4 Changes (and What It Does Not)

| Feature                                           | What changes                                                      | Package impact                                |
| ------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| GPT-4o multi-indicator classification             | Prompt text + JSON schema shape + Zod schema                      | None — raw fetch stays                        |
| MediaPipe validation improvements (jitter, angle) | Constants in `useCameraPipeline.ts` + remove `computeElementHint` | None — same `@mediapipe/tasks-vision@0.10.34` |
| Image quality optimization                        | `captureFrame()` quality param + canvas resize logic              | None — browser Canvas API                     |
| Mixed-hand element support                        | TypeScript types + `selectBlocks` data blocks                     | None                                          |
| Body size limit 4MB                               | `next.config.ts` configuration                                    | None                                          |

**No new npm packages. No version bumps. No new services.**

---

## Recommended Stack (v1.4 additions only)

### Core Technologies (unchanged — documented for reference)

| Technology                | Version             | Purpose                                       | Status                                 |
| ------------------------- | ------------------- | --------------------------------------------- | -------------------------------------- |
| `@mediapipe/tasks-vision` | 0.10.34             | Hand detection client-side                    | No change needed                       |
| OpenAI GPT-4o (raw fetch) | `gpt-4o-2024-08-06` | Palm analysis with Structured Outputs         | Prompt changes only                    |
| Zod                       | 4.3.6               | Input validation + GPT-4o response safety net | Schema additions only                  |
| Next.js App Router        | 16.2.3              | API routes + config                           | `next.config.ts` change for body limit |

### Supporting Libraries (unchanged)

All currently installed. No additions for v1.4.

---

## GPT-4o: Multi-Indicator Classification Changes

### What changes in `src/server/lib/openai.ts`

**Current approach:** GPT-4o receives a single `element` field: `"fire" | "water" | "earth" | "air"`.
The model produces one output, non-deterministically. MediaPipe element hint is passed as a note in
the prompt but the schema still asks for a single `element` string.

**v1.4 approach:** The JSON schema changes to capture _how_ the model classifies:

```typescript
// New schema fields (added to HAND_ATTRIBUTES_SCHEMA)
primary_type: { type: "string", enum: ["A", "B", "C", "D"] },
secondary_type: { type: "string", enum: ["A", "B", "C", "D", "none"] },
type_reasoning: { type: "string" }   // free-form, for debugging
```

The `element` field is removed from the GPT-4o schema. Instead, a server-side function
`deriveElement(primary_type, secondary_type)` maps types to elements:

```typescript
// Type → element mapping (server-side, deterministic)
// A = square palm + short fingers = Earth
// B = square palm + long fingers = Air
// C = long palm + short fingers = Fire
// D = long palm + long fingers = Water
```

This makes classification more robust because:

- Multi-indicator prompt gives GPT-4o 6-7 visual anchors per type (not just "classify fire/water/earth/air")
- `primary_type + secondary_type` captures "mostly Fire but with Air tendencies" for mixed-hand support
- `type_reasoning` is logged for debugging without any PII (just palm geometry observations)

**Structured Outputs compatibility:** The existing `response_format: { type: "json_schema", json_schema: { strict: true } }`
pattern is preserved. Strict mode requires all new fields in `required[]` and `additionalProperties: false` — already
enforced by the current implementation. Adding fields follows the same pattern.

**Confidence:** HIGH — OpenAI Structured Outputs schema requirements verified, strict: true
requires `additionalProperties: false` on all nested objects. Current code already follows this.

### What changes in the prompt text

The system prompt in `PROMPT` constant gains the multi-indicator instruction block describing
what "Type A/B/C/D" means visually (palm shape ratio, finger length ratio, knuckle visibility,
skin texture, finger taper, etc.). The model is asked to evaluate 6-7 indicators per type and
output which type best matches, plus a secondary type if significant divergence exists.

The `elementHintText` path changes: instead of "element already determined, skip classification",
it becomes "MediaPipe measured palm ratio X, finger ratio Y — use this as your primary geometric
indicator alongside the visual ones." This way MediaPipe geometry informs but does not override.

### What changes in `deriveElement()` server-side

New function in `src/server/lib/openai.ts` (or `src/server/lib/element-classifier.ts`):

```typescript
export function deriveElement(
  primaryType: "A" | "B" | "C" | "D",
  secondaryType: "A" | "B" | "C" | "D" | "none",
): { primary_element: HandElement; secondary_element: HandElement | null };
```

This is a pure lookup function, deterministic, zero I/O. Same performance contract as `selectBlocks`.

---

## MediaPipe: Validation Improvements

### What changes in `src/lib/mediapipe.ts`

**Remove `computeElementHint`** — with the multi-indicator GPT-4o approach, the binary element
hint from landmark geometry is replaced by passing raw ratios to the prompt. The function is
deleted (not just unused — removing prevents accidental re-use).

The landmark geometry ratios (palmRatio, fingerRatio) are still useful as _inputs to the prompt_,
so a new lightweight function replaces it:

```typescript
export function computePalmRatios(
  worldLandmarks: Array<{ x: number; y: number; z: number }>,
): { palmRatio: number; fingerRatio: number } | undefined;
```

This returns raw measurements rather than a classified element. The camera pipeline passes these
to the photo-store or directly to the capture POST payload.

**Jitter buffer size:** Current `STABLE_FRAMES_REQUIRED = 5` and `JITTER_THRESHOLD = 0.025`.
Per PROJECT.md, target is "buffer 5 frames, jitter 2.5%" — these are already correct. No change
needed to constants.

**Angle threshold:** Current `MAX_ANGLE_DEG = 45`. Per PROJECT.md, target is "angle < 25°".
Change `MAX_ANGLE_DEG` from 45 to 25 in `useCameraPipeline.ts`. This is a single constant change.

**Confidence:** HIGH — both thresholds are pure numeric constants, no API involved.

### What does NOT change in `@mediapipe/tasks-vision`

- `HandLandmarker` configuration (same model, same WASM URL, same GPU delegate)
- `validateLandmarks()` (isOpen, isCentered checks unchanged)
- `detectHandedness()` (unchanged)
- `drawHandLandmarks()` (unchanged)
- `captureFrame()` (quality change, see below)
- Library version stays at 0.10.34 (latest as of 2026-04-18, confirmed via npm)

---

## Image Quality: Optimization Changes

### What changes in `captureFrame()` (src/lib/mediapipe.ts)

**Current quality:** `0.82` (hardcoded default parameter)
**Target quality:** `0.92`

The `captureFrame` function signature already accepts a `quality` parameter. The change is
updating the default from `0.82` to `0.92` and updating the call site in `useCameraPipeline.ts`.

**Why 0.92 matters for classification:** GPT-4o `detail: "high"` processes images by tiling.
Fine palm lines (1-3px wide) sit at the boundary of tile resolution. Higher JPEG quality reduces
compression artifacts on line edges, improving detection accuracy for faint lines and rare signs.

### What changes for max 2048px

**Current:** `captureFrame` draws the full video resolution to canvas (typically 1280x960 from
`getUserMedia` constraints). At 0.92 quality, 1280x960 produces ~250KB base64. Acceptable.

If a device captures at higher than 2048px (rare on current constraint of 1280px), the canvas
should cap the longest dimension at 2048px before encoding. Implementation: check
`video.videoWidth` and `video.videoHeight` before drawing; if either exceeds 2048, scale down.
Use the browser's native Canvas 2D drawImage scaling (no new library needed — canvas scales by
default when `canvas.width` is set smaller than the source).

```typescript
// Inside captureFrame(), before ctx.drawImage:
const MAX_DIM = 2048;
const scale = Math.min(1, MAX_DIM / Math.max(video.videoWidth, video.videoHeight));
canvas.width = Math.round(video.videoWidth * scale);
canvas.height = Math.round(video.videoHeight * scale);
```

**Why NOT to use createImageBitmap for resizing:** `createImageBitmap` with resize options has
inconsistent browser support (Firefox bug 1363861, resizeQuality still limited). Plain canvas
`drawImage` with scaled dimensions is universally supported and synchronous — no async overhead.

**Why NOT to use the `pica` library:** `pica` is a high-quality Lanczos resizing library. It's
overkill here — the camera is already outputting at a human-readable scale; we're capping at
2048px as a safeguard, not resizing aggressively. Canvas bilinear scaling at these dimensions
is imperceptibly different from Lanczos for JPEG palm photos.

**Confidence:** HIGH — Canvas 2D API, universally supported.

### What changes for body size limit 4MB

**Current:** The route has a manual `2MB` check (`bodyStr.length > 2 * 1024 * 1024`).
**Target:** 4MB to accommodate `detail: "high"` with 2048px at 0.92 quality (~500KB base64).

Two changes needed:

1. Update the manual check in `src/app/api/reading/capture/route.ts` from `2 * 1024 * 1024` to `4 * 1024 * 1024`

2. Add body size limit in `next.config.ts` for the App Router. App Router uses
   `experimental.serverActions.bodySizeLimit`, but for API routes (not Server Actions), the limit
   is controlled differently. In Next.js App Router, `route.ts` API routes use
   `export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }` — but this is Pages
   Router syntax and does NOT work in App Router.

For App Router API routes, the request body is read via `req.json()` — there is no built-in
body size config per-route. The manual check (`bodyStr.length > 4MB`) IS the size limit.
Next.js App Router does not enforce a default body size limit on route.ts handlers at the
application level (Vercel may have a 4.5MB serverless function payload limit at the platform
level, which is already our ceiling).

**Conclusion:** The only needed change is updating the manual size check from 2MB to 4MB.
No `next.config.ts` change required for API routes.

**Confidence:** MEDIUM — confirmed via Next.js GitHub discussions (issue #57501, #53087) that
App Router API routes (`route.ts`) do not have equivalent bodyParser config. The manual check
is the correct mechanism.

---

## Mixed-Hand Element Support

### What changes in `src/types/hand-attributes.ts`

```typescript
// Add to HandAttributes interface
secondary_element?: "fire" | "water" | "earth" | "air" | null;
```

The field is optional for backward compatibility — existing readings stored as JSONB in Neon
will not have `secondary_element`. The frontend renders as pure primary when the field is absent.

### What changes in `src/types/report.ts` (or wherever ReportJSON is defined)

```typescript
// In the element section of ReportJSON
element: {
  key: "fire" | "water" | "earth" | "air";
  secondary_key?: "fire" | "water" | "earth" | "air" | null;
  // ... existing fields
}
```

### What changes in `src/data/blocks/`

Two new content block arrays, no new schema shape:

- `ELEMENT_BRIDGE` — 12 strings (3 per element × 4 elements), used when `secondary_element` exists.
  Renders in `ElementSection` between primary and secondary descriptions.
- `ELEMENT_EXCLUSIVITY_MIXED` — 12 strings, describes the mix as a character trait.
  Used in `HandSummary` when `secondary_element` is present and differs from primary.

These are static data, no new type needed — same pattern as existing `ELEMENT_LABELS`, `ELEMENT_INTROS`, etc.

### What changes in `src/server/lib/select-blocks.ts`

`selectBlocks()` gains awareness of `secondary_element`. When present, it selects from
`ELEMENT_BRIDGE` and `ELEMENT_EXCLUSIVITY_MIXED` arrays (by seed based on reading ID) and
includes them in the report. When absent, report is identical to current behavior.

### Backward compatibility guarantee

Old readings in Neon have `attributes.element` but no `attributes.secondary_element`. The type
uses `?` optional field. Every component that reads `secondary_element` must guard:

```typescript
// Frontend pattern
const secondary = reading.report.element.secondary_key ?? null;
if (secondary && secondary !== primary) {
  // render mixed UI
}
```

No database migration required — JSONB fields are schema-free in Postgres. Old rows simply
lack the key, new rows include it. `Prisma.JsonValue` typing handles this correctly.

---

## What NOT to Add

| Avoid                                                    | Why                                                                                           | Use Instead                                                       |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `openai` npm SDK                                         | Adds ~150KB for a single endpoint call. Already using raw fetch correctly.                    | Continue with raw fetch to `/v1/chat/completions`                 |
| `pica` or `sharp`                                        | Image resizing is a single safeguard cap at 2048px. Canvas drawImage handles it natively.     | Browser Canvas 2D `drawImage` with scaled dimensions              |
| `createImageBitmap` for resize                           | Inconsistent browser support for `resizeWidth`/`resizeHeight` options                         | Canvas 2D synchronous scaling                                     |
| New MediaPipe version bump                               | 0.10.34 is the current npm latest. No breaking changes needed, no new APIs required for v1.4. | Stay at 0.10.34                                                   |
| Separate element classifier service                      | `deriveElement()` is a pure lookup, runs in <1ms, fits naturally in `openai.ts`               | Keep in-process                                                   |
| `additionalProperties: true` on new GPT-4o schema fields | Breaks Structured Outputs strict mode — model will fail validation                            | Always add to `required[]` and keep `additionalProperties: false` |

---

## Alternatives Considered

| Decision                                               | Alternative                                                   | Why Not                                                                                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove `computeElementHint`, pass raw ratios to prompt | Keep `computeElementHint` and pass classified element as hint | The multi-indicator prompt needs raw geometry, not a pre-classified label that collapses 6 indicators into 1. Pre-classification loses signal.                            |
| `deriveElement()` server-side pure function            | Keep element in GPT-4o output                                 | GPT-4o non-determinism on element classification was the motivating problem. Moving derivation server-side via type mapping makes it deterministic once types are stable. |
| Canvas drawImage for 2048px cap                        | `createImageBitmap` with resize options                       | Browser support gaps in Firefox (bug 1363861). Canvas drawImage is universally supported and synchronous.                                                                 |
| Optional `secondary_element` with null guard           | Separate `HandAttributesV2` type                              | Optional field avoids needing a discriminated union or version field. JSONB handles absent keys naturally.                                                                |

---

## Version Compatibility

| Package                           | Compatible With        | Notes                                                                                                                                     |
| --------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `@mediapipe/tasks-vision 0.10.34` | Browser Canvas 2D API  | No conflicts. WASM + GPU delegate path unchanged.                                                                                         |
| OpenAI `gpt-4o-2024-08-06`        | Zod 4.3.6              | Structured Outputs strict mode requires all schema fields in `required[]`. Zod schema must mirror the JSON schema.                        |
| `zod ^4.3.6`                      | TypeScript strict      | New `primary_type`, `secondary_type`, `type_reasoning` fields added to `HandAttributesSchema`. Use `z.enum(["A","B","C","D"])` for types. |
| Next.js 16.2.3 App Router         | Manual body size check | App Router `route.ts` does not support `bodyParser.sizeLimit` config. Manual `bodyStr.length` check is the mechanism.                     |

---

## Installation

No new packages. All changes are to existing code.

```bash
# Nothing to install for v1.4

# After TypeScript type changes, verify:
npm run type-check

# After data block additions, run tests:
npm test -- --run

# Full check before pushing:
npm run check
```

---

## Sources

- OpenAI Structured Outputs docs — `strict: true`, `additionalProperties: false`, `required[]` requirements. HIGH confidence. [developers.openai.com/api/docs/guides/structured-outputs](https://developers.openai.com/docs/guides/structured-outputs)
- OpenAI Vision docs — `detail: "high"` tiles at 512px, token cost scaling. MEDIUM confidence. [openai-hd4n6.mintlify.app/docs/guides/images](https://openai-hd4n6.mintlify.app/docs/guides/images)
- npm registry — `@mediapipe/tasks-vision` latest is 0.10.34 as of 2026-04-18. HIGH confidence. [npmjs.com/package/@mediapipe/tasks-vision](https://www.npmjs.com/package/@mediapipe/tasks-vision)
- MDN Canvas API — `drawImage` scaling behavior, universally supported. HIGH confidence.
- Next.js GitHub discussions #57501, #53087, #68409 — App Router `route.ts` does not support `bodyParser.sizeLimit`. Manual check is the mechanism. MEDIUM confidence.
- Existing codebase audit — `src/lib/mediapipe.ts`, `src/server/lib/openai.ts`, `src/hooks/useCameraPipeline.ts`, `src/types/hand-attributes.ts`, `package.json`. HIGH confidence.
- Firefox bug 1363861 — `createImageBitmap` resize options incomplete support. HIGH confidence.

---

_Stack research for: MaosFalam v1.4 (element classification, MediaPipe validation, mixed-hand, image quality)_
_Researched: 2026-04-18_

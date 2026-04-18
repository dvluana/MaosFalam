# Architecture Research

**Domain:** MaosFalam v1.4 — multi-indicator element classification, MediaPipe validation tightening, mixed-element support
**Researched:** 2026-04-18
**Confidence:** HIGH (all integration points derived from direct codebase inspection of the 12 files that change)

---

## Standard Architecture

### System Overview: What Changes in v1.4

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (browser)                         │
├─────────────────────────────────────────────────────────────┤
│  useCameraPipeline.ts                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ MediaPipe loop (rAF)                                 │    │
│  │  validateLandmarks                                   │    │
│  │  angle < 25deg (was 45)                              │    │
│  │  jitter buffer 5 frames at 0.025                     │    │
│  │  [REMOVED: computeElementHint / elementSamplesRef]   │    │
│  │  captureFrame(video, canvas, mirrored, 0.92)         │    │
│  │  [REMOVED: setElementHint(hint)]                     │    │
│  └───────────────────────┬─────────────────────────────┘    │
│                           │                                  │
│  photo-store.ts           │                                  │
│  ┌────────────┐           │                                  │
│  │ _photo ←───┘           │                                  │
│  │ [REMOVED: _elementHint]│                                  │
│  └────────────┘           │                                  │
│                           │                                  │
│  /ler/scan page           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ getPhoto() → POST /api/reading/capture               │    │
│  │ payload: no element_hint field                       │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     SERVER (API route)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/reading/capture                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Zod schema: no element_hint field                    │    │
│  │ body limit: 4MB (was 2MB)                            │    │
│  │ analyzeHand(photo, dominant_hand)                    │    │
│  │   GPT-4o multi-indicator prompt:                     │    │
│  │   Types A/B/C/D x 6-7 indicators                    │    │
│  │   → { primary_type, secondary_type, type_reasoning,  │    │
│  │        heart, head, life, fate, ... confidence }     │    │
│  │   deriveElement(primary_type) → element              │    │
│  │   deriveElement(secondary_type) → secondary_element? │    │
│  │   return HandAttributes                              │    │
│  │ [REMOVED: element override from element_hint]        │    │
│  │ selectBlocks(attrs, name, gender)                    │    │
│  │   → picks ELEMENT_BRIDGE if secondary_element        │    │
│  │   → ReportJSON.element.secondary_key + .bridge       │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Neon/Prisma: readings.attributes (JSONB)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ HandAttributes: secondary_element?: HandElement NEW  │    │
│  │ ReportJSON.element: secondary_key? + bridge? NEW     │    │
│  │ Old rows: missing both fields, render without them   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  src/data/blocks/element.ts                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ELEMENT_BRIDGE (12 strings, one per element pair)    │    │
│  │ ELEMENT_EXCLUSIVITY_MIXED (12 strings) NEW           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  src/components/reading/                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ElementHero: optional secondary element display      │    │
│  │ ElementSection: bridge text when secondary present   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component                                   | Responsibility                                         | Status in v1.4                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/mediapipe.ts`                      | Hand detection, frame capture, angle/jitter validation | MODIFIED — delete `computeElementHint` + `dist3D`; raise default quality to 0.92                                                                                                                 |
| `src/hooks/useCameraPipeline.ts`            | Camera state machine, MediaPipe rAF loop               | MODIFIED — delete element sampling code; remove `setElementHint` call; reduce `MAX_ANGLE_DEG` from 45 to 25                                                                                      |
| `src/lib/photo-store.ts`                    | Ephemeral photo storage between camera and scan pages  | MODIFIED — delete `_elementHint`, `setElementHint`, `getElementHint`                                                                                                                             |
| `src/server/lib/openai.ts`                  | GPT-4o wrapper, prompt, JSON schema, Zod parse         | HEAVILY MODIFIED — new multi-indicator prompt; new JSON schema (`primary_type`/`secondary_type`/`type_reasoning`); `deriveElement()` function; updated Zod schema; `secondary_element` in return |
| `src/types/hand-attributes.ts`              | TypeScript contract for GPT-4o output                  | MODIFIED — add `secondary_element?: HandElement`                                                                                                                                                 |
| `src/types/report.ts`                       | TypeScript contract for reading output                 | MODIFIED — add `element.secondary_key?: HandElement` and `element.bridge?: string`                                                                                                               |
| `src/server/lib/select-blocks.ts`           | Block selection engine, pure function                  | MODIFIED — consume `secondary_element`; pick `ELEMENT_BRIDGE` block; write `secondary_key` + `bridge` to report                                                                                  |
| `src/data/blocks/element.ts`                | Element text content                                   | MODIFIED — add `ELEMENT_BRIDGE` (12 strings) and `ELEMENT_EXCLUSIVITY_MIXED` (12 strings)                                                                                                        |
| `src/data/blocks/index.ts`                  | Block re-exports                                       | MODIFIED — export new constants                                                                                                                                                                  |
| `src/app/api/reading/capture/route.ts`      | Capture API route                                      | MODIFIED — remove `element_hint` from Zod schema; remove element override block; raise body limit to 4MB                                                                                         |
| `src/components/reading/ElementHero.tsx`    | Full-page element reveal component                     | MODIFIED — accept/render optional `secondary_key` from `element` prop                                                                                                                            |
| `src/components/reading/ElementSection.tsx` | Reading card element display                           | MODIFIED — render `bridge` text when `element.bridge` present                                                                                                                                    |

---

## Recommended Project Structure

No new files or folders. All changes are in-place within the existing structure:

```
src/
├── lib/
│   ├── mediapipe.ts          # MODIFIED: delete computeElementHint, dist3D
│   └── photo-store.ts        # MODIFIED: delete elementHint slot
│
├── hooks/
│   └── useCameraPipeline.ts  # MODIFIED: remove element sampling, tighten angle
│
├── server/lib/
│   └── openai.ts             # HEAVILY MODIFIED: new prompt + schema + deriveElement
│
├── types/
│   ├── hand-attributes.ts    # MODIFIED: secondary_element?
│   └── report.ts             # MODIFIED: element.secondary_key? + element.bridge?
│
├── data/blocks/
│   ├── element.ts            # MODIFIED: ELEMENT_BRIDGE, ELEMENT_EXCLUSIVITY_MIXED
│   └── index.ts              # MODIFIED: export new constants
│
├── app/api/reading/capture/
│   └── route.ts              # MODIFIED: drop element_hint, raise body limit
│
└── components/reading/
    ├── ElementHero.tsx        # MODIFIED: secondary element display
    └── ElementSection.tsx     # MODIFIED: bridge text display
```

---

## Architectural Patterns

### Pattern 1: Server-Side Semantic Element Classification (replaces client-side geometric hint)

**What:** GPT-4o receives a prompt that describes hand types using named Types (A/B/C/D) mapped to 6-7 visual indicators each. It returns `primary_type` + optional `secondary_type`. A pure `deriveElement()` function maps type letters to element keys server-side. No client involvement in classification.

**When to use:** Classification that requires visual context and proportional judgment beyond landmark joint positions.

**Trade-offs:** Removes the client-server coupling (no more element_hint in payload). Adds ~100 tokens to prompt. Eliminates the non-determinism of MediaPipe overriding GPT-4o with incorrect geometric ratios.

**Sketch of new openai.ts structure:**

```typescript
// New fields in HAND_ATTRIBUTES_SCHEMA (GPT-4o JSON Schema)
primary_type: { type: "string", enum: ["A", "B", "C", "D"] },
secondary_type: { type: "string", enum: ["A", "B", "C", "D", "none"] },
type_reasoning: { type: "string" },  // brief reasoning, for logging only

// Derivation — pure function, no I/O
function deriveElement(type: "A" | "B" | "C" | "D"): HandElement {
  // A = Fire (square palm, short fingers < palm height)
  // B = Water (rectangular long palm, long slender fingers)
  // C = Earth (wide square palm, short thick fingers)
  // D = Air (square palm, long fingers, visible knuckles/joints)
  return { A: "fire", B: "water", C: "earth", D: "air" }[type];
}

// analyzeHand() returns HandAttributes with:
//   element = deriveElement(primary_type)
//   secondary_element = deriveElement(secondary_type) when secondary_type !== "none"
```

### Pattern 2: Additive Optional Fields for Mixed-Element Support (backward-compatible JSONB)

**What:** New fields `secondary_element` in `HandAttributes` and `secondary_key` + `bridge` in `ReportJSON.element` are optional (`?`). Existing readings stored in Neon lack these fields. The frontend guards every access with `?.` so old readings render without errors.

**When to use:** Any time the stored JSONB contract expands in a way that doesn't apply to all readings.

**Trade-offs:** No Neon migration required. TypeScript enforces correct optional handling at compile time. `selectBlocks` must not assume the field exists when re-reading stored attributes.

**Type changes:**

```typescript
// src/types/hand-attributes.ts
export interface HandAttributes {
  element: "fire" | "water" | "earth" | "air";
  secondary_element?: "fire" | "water" | "earth" | "air";  // NEW
  // ... rest unchanged
}

// src/types/report.ts
element: {
  key: HandElement;
  intro: string;
  body: string;
  secondary_key?: HandElement;  // NEW — present when GPT-4o identifies mixed hand
  bridge?: string;              // NEW — ELEMENT_BRIDGE text for mixed display
};
```

### Pattern 3: Validation-Only MediaPipe (strict responsibility boundary)

**What:** MediaPipe is a photo quality gate only — validates hand angle, palm spread, centering, and stability. It no longer classifies element. `computeElementHint`, `dist3D`, `elementSamplesRef`, `elementSamplesRequired`, and the `elementMode()` helper are all deleted. `photo-store.ts` loses its element hint slot.

**When to use:** This is the right scope for MediaPipe's capabilities. Geometric ratios from 21 joint landmarks cannot reliably distinguish element types across the full diversity of hand shapes.

**Threshold changes in useCameraPipeline.ts:**

```typescript
// Before
const MAX_ANGLE_DEG = 45;
const ELEMENT_SAMPLES_REQUIRED = 8; // DELETE entirely

// After
const MAX_ANGLE_DEG = 25; // tighter angle = flatter palm = better GPT-4o read
// ELEMENT_SAMPLES_REQUIRED: deleted
// elementSamplesRef: deleted
// elementMode() function: deleted
// setElementHint(hint) call in capture: deleted
```

### Pattern 4: Image Quality Upgrade (capture quality + body limit)

**What:** `captureFrame` quality parameter raised from 0.82 to 0.92. Body limit in the capture route raised from 2MB to 4MB to accommodate the larger JPEG. GPT-4o `detail: "high"` is already set and unchanged.

**When to use:** Line detail on palms (Linhas do Coração, Cabeça, Vida, Destino) requires higher resolution. Fine lines, fork points, and islands are missed at lower quality.

**Implementation:**

```typescript
// src/lib/mediapipe.ts: captureFrame() — raise quality default
export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  mirrored: boolean,
  quality = 0.92,  // was 0.82
): string { ... }

// src/app/api/reading/capture/route.ts — raise body limit
if (bodyStr.length > 4 * 1024 * 1024) {  // was 2MB
  return NextResponse.json({ error: "Imagem muito grande" }, { status: 413 });
}
```

---

## Data Flow

### New Classification Flow (v1.4)

```
/ler/camera
  useCameraPipeline MediaPipe rAF loop:
    validateLandmarks(landmarks) → isOpen, isCentered, angleDeg
    if angleDeg > 25: camera_adjusting (tighter than before)
    jitter buffer: 5 frames, JITTER_THRESHOLD 0.025 (unchanged)
    [NO element hint sampling — deleted]
    stable for 1500ms → camera_stable
    captureFrame(video, canvas, mirrored, quality=0.92)
    photo-store.setPhoto(base64)
    [NO setElementHint — deleted]
    router.push("/ler/scan")

/ler/scan
  getPhoto()
  clearPhotoStore()  [no elementHint to clear]
  POST /api/reading/capture {
    photo_base64,
    session_id,
    lead_id?,
    target_name,
    target_gender,
    is_self,
    dominant_hand,
    [NO element_hint field — deleted]
  }

/api/reading/capture (server)
  body limit: 4MB
  Zod schema: no element_hint field
  analyzeHand(photo_base64, dominant_hand):
    GPT-4o multi-indicator prompt → structured output:
      { primary_type: "A"|"B"|"C"|"D",
        secondary_type: "A"|"B"|"C"|"D"|"none",
        type_reasoning: string,
        heart: { variation, modifiers },
        head: { variation, modifiers },
        life: { variation },
        fate: { variation },
        venus: { mount, cinturao },
        mounts: { jupiter, saturn, apollo, mercury, mars, moon },
        rare_signs: { ... },
        confidence: 0-1 }
    Zod parse + validation
    deriveElement(primary_type) → element
    if secondary_type !== "none": deriveElement(secondary_type) → secondary_element
    log: { element, secondary_element?, confidence }
    return HandAttributes { element, secondary_element?, ... }
  [NO element override from element_hint — deleted]
  selectBlocks(attrs, name, gender):
    reads attrs.secondary_element
    if secondary_element: picks ELEMENT_BRIDGE[`${el}_${secondary_el}`]
    report.element.secondary_key = secondary_el
    report.element.bridge = bridgeText
    all other sections unchanged
  prisma.reading.create({ attributes, report, ... })
  return { reading_id, report, tier }

/ler/resultado/[id]
  ElementHero:
    element.key → primary display (unchanged)
    element.secondary_key? → secondary badge if present (NEW)
  ElementSection:
    element.bridge? → rendered below body if present (NEW)
  [all other sections: ReadingSection, ElementGlyph, etc — unchanged]
```

### Removed Data Flow (what disappears entirely in v1.4)

```
// DELETED:
computeElementHint(worldLandmarks) → HandElement
elementSamplesRef.push(el) → elementMode() → setElementHint(hint)
photo-store: _elementHint, setElementHint(), getElementHint()
POST payload: element_hint field
route.ts: if (element_hint) { finalAttributes.element = element_hint }
route.ts: logger.info "Element overridden by MediaPipe"
```

---

## Build Order (with dependency tracking)

Each step can be verified with `npm run type-check` before proceeding.

**Step 1: Types** — zero deps, zero breaking changes

- `src/types/hand-attributes.ts` — add `secondary_element?: HandElement`
- `src/types/report.ts` — add `element.secondary_key?` and `element.bridge?`

**Step 2: Data blocks** — depends on Step 1 types

- `src/data/blocks/element.ts` — add `ELEMENT_BRIDGE` Record (12 strings, keyed by `"fire_water"` etc.) and `ELEMENT_EXCLUSIVITY_MIXED` Record (12 strings)
- `src/data/blocks/index.ts` — export `ELEMENT_BRIDGE`, `ELEMENT_EXCLUSIVITY_MIXED`

**Step 3: GPT-4o wrapper** — depends on Steps 1 + 2

- `src/server/lib/openai.ts` — rewrite prompt with Types A/B/C/D and 6-7 indicators; expand JSON schema and Zod schema with `primary_type`, `secondary_type`, `type_reasoning`; add `deriveElement()` function; update `analyzeHand()` return to include `secondary_element`

**Step 4: Block engine** — depends on Steps 1 + 2 + 3

- `src/server/lib/select-blocks.ts` — read `secondary_element` from attributes; look up `ELEMENT_BRIDGE`; write `secondary_key` and `bridge` into assembled report

**Step 5: Capture API route** — depends on Steps 1 + 3 + 4

- `src/app/api/reading/capture/route.ts` — remove `element_hint` from Zod schema; delete element override block and its logger call; raise body limit to 4MB

**Step 6: MediaPipe client** — independent of Steps 1-5, parallelizable with Step 7

- `src/lib/mediapipe.ts` — delete `computeElementHint()`, `dist3D()`; update `captureFrame` quality default to 0.92
- `src/lib/photo-store.ts` — delete `_elementHint`, `setElementHint`, `getElementHint`
- `src/hooks/useCameraPipeline.ts` — delete all element sampling (`elementSamplesRef`, `ELEMENT_SAMPLES_REQUIRED`, `elementMode()`, `setElementHint(hint)` call); update `MAX_ANGLE_DEG` from 45 to 25; remove import of `computeElementHint` and `setElementHint`

**Step 7: Frontend display** — depends on Steps 1 + 4, parallelizable with Step 6

- `src/components/reading/ElementHero.tsx` — update props type to accept `element` with optional `secondary_key`; render secondary element badge/line when present
- `src/components/reading/ElementSection.tsx` — render `element.bridge` below existing body when present; no new props needed (reads from `element` object already in props)

**Integration test after all steps:** Full camera flow (open camera, wave hand, auto-capture) through scan to result. Confirm `secondary_key` appears in report for a mixed-element hand photo. Confirm old reading URLs still render without errors.

---

## Scaling Considerations

| Scale         | Architecture Adjustments                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| 0-1k users    | Current setup unchanged. Body limit at 4MB poses no issue. In-memory rate limit sufficient.               |
| 1k-100k users | GPT-4o cost increases ~40% (longer prompt, higher quality image). Rate limit Map needs Upstash migration. |
| 100k+ users   | GPT-4o call queuing (Inngest/QStash). No architecture changes from this milestone needed before then.     |

---

## Anti-Patterns

### Anti-Pattern 1: Client-Side Element Override

**What people do:** Use MediaPipe geometric ratios to pre-classify element, send as `element_hint` to override GPT-4o.

**Why it's wrong:** MediaPipe sees 21 joint positions, not palm flesh volume, knuckle prominence, or finger thickness. Ratio thresholds (palmHeight/palmWidth > 1.1) fail on hands that don't fit the Western palmistry model. Testing showed incorrect element assignment in ~30% of cases.

**Do this instead:** Let GPT-4o classify using semantic visual indicators (Types A/B/C/D). It has the image context that MediaPipe's landmark coordinates lack. Use MediaPipe only for photo quality validation (angle, spread, stability).

### Anti-Pattern 2: Mutating Existing ReportJSON Fields for Mixed Elements

**What people do:** Change `element.key` to `"fire+air"` or add a parallel `mixed_element` field at the top level.

**Why it's wrong:** All frontend consumers of `element.key` expect `HandElement` type. A composite string breaks type narrowing. A top-level field breaks the `ReportJSON` contract and requires changes to every component that renders the report.

**Do this instead:** Add `secondary_key?: HandElement` and `bridge?: string` as optional fields inside the existing `element` object. Frontend guards access with `?.`. Old readings lack the fields and render unchanged.

### Anti-Pattern 3: Keeping Element Sampling in useCameraPipeline

**What people do:** Leave `elementSamplesRef` in the detection loop "in case we want it later."

**Why it's wrong:** Dead code in a tight rAF loop adds noise and maintenance burden. The element hint path is completely removed from the server. Dead client code that produces a value nobody reads is a bug waiting to happen.

**Do this instead:** Delete cleanly. If geometric pre-classification is ever re-introduced, it will be a deliberate feature with its own branch, not dead code.

### Anti-Pattern 4: Raising Body Limit Without Checking It

**What people do:** Raise the body limit constant without keeping the explicit size check.

**Why it's wrong:** At quality 0.92, a 1280x960 JPEG is typically 400-700KB. The 4MB limit gives 5-6x headroom for unusual images (high-texture skin, upload path). Without the explicit check, a 10MB upload bypasses the guard and fails opaquely inside OpenAI with a confusing error.

**Do this instead:** Keep `if (bodyStr.length > 4 * 1024 * 1024)` explicitly in `route.ts` with a clear 413 response. Optional: add a warn log at 2MB to monitor real-world photo sizes.

---

## Integration Points

### External Services

| Service                | Integration                                                     | What Changes in v1.4                                                                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GPT-4o (OpenAI)        | `src/server/lib/openai.ts` — structured outputs via JSON schema | Prompt rewritten with Types A/B/C/D and 6-7 visual indicators. JSON schema adds `primary_type`, `secondary_type`, `type_reasoning`. Zod schema adds same. `analyzeHand()` return includes `secondary_element?`. |
| MediaPipe Tasks Vision | `src/lib/mediapipe.ts` + `useCameraPipeline.ts`                 | `computeElementHint` and `dist3D` deleted. Detection loop simplified (no sampling). Angle threshold tightened from 45 to 25 degrees. Capture quality 0.82 → 0.92.                                               |
| Neon/Prisma            | `readings` table, `attributes` + `report` JSONB columns         | No schema migration required. New fields stored as additional JSONB keys in existing columns. Reads of old rows missing new keys return `undefined`, handled by optional typing.                                |

### Internal Boundaries

| Boundary                                      | Communication                         | What Changes                                                                                                      |
| --------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `useCameraPipeline` → `photo-store`           | Direct import, module-level singleton | `setElementHint` call deleted. Only `setPhoto` remains. Import of `computeElementHint` from mediapipe.ts deleted. |
| `/ler/scan` → `route.ts`                      | HTTP POST, Zod schema                 | `element_hint` removed from both client payload (reading-client.ts) and server schema.                            |
| `openai.ts` → `select-blocks.ts`              | `HandAttributes` type                 | `secondary_element?: HandElement` added to the shared type.                                                       |
| `select-blocks.ts` → `data/blocks/element.ts` | Named exports                         | `ELEMENT_BRIDGE` and `ELEMENT_EXCLUSIVITY_MIXED` are new exports consumed by `selectBlocks`.                      |
| `select-blocks.ts` → `types/report.ts`        | `ReportJSON` contract                 | `element.secondary_key` and `element.bridge` are new optional fields in the assembled report.                     |
| `route.ts` → `components/reading/`            | `ReportJSON` via API response         | Frontend guards `?.` on both new fields. No breaking change for old readings.                                     |

---

## Sources

- Direct codebase inspection: `src/lib/mediapipe.ts`, `src/lib/photo-store.ts`, `src/hooks/useCameraPipeline.ts`, `src/server/lib/openai.ts`, `src/types/hand-attributes.ts`, `src/types/report.ts`, `src/server/lib/select-blocks.ts`, `src/data/blocks/element.ts`, `src/app/api/reading/capture/route.ts`, `src/components/reading/ElementHero.tsx`, `src/components/reading/ElementSection.tsx`
- `.planning/PROJECT.md` — v1.4 milestone requirements and constraints
- `docs/architecture.md` — pipeline and data flow reference (v1.2 state)

---

_Architecture research for: MaosFalam v1.4 element classification refactor_
_Researched: 2026-04-18_

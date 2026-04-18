# Feature Landscape

**Domain:** AI palmistry reading app — element classification accuracy milestone (v1.4)
**Researched:** 2026-04-18
**Confidence:** HIGH — codebase fully read, milestone scope from PROJECT.md, prior art in git stash described in context

---

## Scope Note

This is a **subsequent milestone** research file. The features below address only what is NEW in v1.4.
Existing features (GPT-4o pipeline, selectBlocks engine, MediaPipe hand detection, camera UI, credit system, auth) are already built and validated.

---

## Table Stakes

Features required for the milestone to be considered correct. Missing any of these = element classification is still unreliable.

| Feature                                                                      | Why Required                                                                                                                                                                                             | Complexity | Depends On                                                            |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| GPT-4o multi-indicator prompt                                                | Single `element` field from current prompt is non-deterministic. Multi-indicator prompt (Types A/B/C/D x 6-7 visual indicators) produces consistent, auditable results                                   | HIGH       | openai.ts, HandAttributes type                                        |
| `primary_type` + `secondary_type` in GPT-4o output                           | Captures ambiguous hands (many hands are blends). Enables mixed-element reading path                                                                                                                     | MEDIUM     | HandAttributes schema, Zod schema, JSON schema for Structured Outputs |
| `type_reasoning` field (optional, internal)                                  | Debugging only — lets developer audit GPT-4o classification logic without re-running. Never shown to user                                                                                                | LOW        | HandAttributes type                                                   |
| `deriveElement()` server-side function                                       | Converts GPT-4o's raw type label (A/B/C/D) to domain element (fire/water/earth/air) deterministically on server. GPT-4o no longer returns `element` directly — it returns `primary_type`                 | MEDIUM     | select-blocks.ts or openai.ts                                         |
| Remove `computeElementHint` from camera pipeline                             | MediaPipe landmarks cannot reliably classify hand type (palm/finger proportions are screen-space, not anatomy). The existing hint corrupts GPT-4o when it conflicts. Removing it simplifies the pipeline | LOW        | mediapipe.ts, useCameraPipeline.ts, photo-store.ts                    |
| Jitter threshold tightened to 2.5%                                           | Current JITTER_THRESHOLD = 0.025 is already 2.5%. Confirm this is correct and the 5-frame buffer (STABLE_FRAMES_REQUIRED) is sufficient for mobile                                                       | LOW        | useCameraPipeline.ts                                                  |
| Angle validation tightened to 25 degrees                                     | Current MAX_ANGLE_DEG = 45. Reducing to 25 means only nearly-vertical palms pass. Fewer captures of tilted hands = better GPT-4o accuracy on lines                                                       | LOW        | useCameraPipeline.ts                                                  |
| JPEG quality raised to 0.92                                                  | Current captureFrame() uses quality 0.82. GPT-4o line detection improves with higher quality. Still within 4MB body limit at mobile resolutions                                                          | LOW        | mediapipe.ts captureFrame()                                           |
| Max image dimension 2048px                                                   | Mobile cameras can produce 4000+ px images. Downscale before base64 encoding to keep payload within body limit and reduce GPT-4o latency                                                                 | MEDIUM     | mediapipe.ts captureFrame() — needs canvas resize logic               |
| GPT-4o `detail: "high"` confirmed                                            | Already set. Ensure it stays set after prompt refactor. Low detail loses line information                                                                                                                | LOW        | openai.ts                                                             |
| API body limit raised to 4MB                                                 | Current limit unknown. Base64 of 2048px JPEG at 0.92 quality = ~1.5-2MB. Need headroom                                                                                                                   | LOW        | next.config.ts or API route                                           |
| `HandAttributes.secondary_element` field                                     | New optional field. Present when GPT-4o identifies secondary_type. Absent on pure hands and on all legacy readings                                                                                       | MEDIUM     | hand-attributes.ts, HandAttributesSchema                              |
| Backward compatibility: readings without `secondary_element` render normally | All existing readings in Neon have no secondary_element. Frontend must handle undefined gracefully                                                                                                       | LOW        | Reading components, ReportJSON type                                   |

---

## Differentiators

Features that improve the product experience beyond classification correctness.

| Feature                                                    | Value Proposition                                                                                                                                                                      | Complexity | Depends On                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------- |
| Mixed-element reading blocks (ELEMENT_BRIDGE)              | 12 strings that acknowledge the secondary element in the reading narrative. Example: "Fogo com traços de Água. Você sente mais do que aparenta." Pure-element hands skip this entirely | MEDIUM     | data/blocks/element.ts, selectBlocks()         |
| Mixed-element exclusivity copy (ELEMENT_EXCLUSIVITY_MIXED) | 12 strings for the portrait.exclusivity field when secondary is present. Replaces the generic pure-element exclusivity copy                                                            | LOW        | data/blocks/element.ts, selectBlocks()         |
| `ReportJSON.element.secondary_key` field                   | Exposes secondary element to frontend for display in ElementHero and HandSummary. Optional, absent on pure hands                                                                       | LOW        | report.ts ReportJSON type                      |
| `ReportJSON.element.bridge` field                          | Rendered ELEMENT_BRIDGE text. Optional, absent when no secondary                                                                                                                       | LOW        | report.ts ReportJSON interface                 |
| ElementHero/ElementSection with secondary display          | Visual: secondary element badge or secondary label alongside primary. Only shows when secondary_key is present                                                                         | MEDIUM     | components/reading/ElementHero, ElementSection |
| HandSummary with mixed exclusivity                         | When secondary_element is present, HandSummary shows mixed exclusivity copy instead of pure-element copy                                                                               | LOW        | components/reading/HandSummary or equivalent   |

---

## Anti-Features

Features to explicitly NOT build in this milestone.

| Feature                                                      | Why Requested                           | Why Problematic                                                                                                                                                                                                        | Alternative                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| MediaPipe element classification (keep `computeElementHint`) | "It was already built, might be useful" | Screen-space landmark ratios do not reflect actual palm anatomy. Camera angle, distance, and phone hold all distort measurements. The hint has been observed to conflict with GPT-4o and bias it toward wrong elements | Remove entirely. GPT-4o with multi-indicator prompt on high-quality image is more accurate than geometric heuristics on 2D landmarks |
| Tertiary element                                             | "Some hands have three influences"      | Three-element classification has no established palmistry basis. It fragments the reading narrative with no clear content to back it up. Primary + secondary covers the range                                          | Keep secondary optional. If secondary is absent, reading is pure-element                                                             |
| Re-run GPT-4o if confidence is low on element field          | "Auto-retry for better accuracy"        | Each call costs ~R$0.07 and adds 5-10s latency. Confidence is already checked post-parse. Low-confidence images need better photos, not more API calls                                                                 | Reject below threshold (existing behavior). Improve capture quality via angle/jitter constraints                                     |
| Store `type_reasoning` in Neon                               | "Could be useful for analytics"         | JSONB payload in `readings.attributes` grows. Reasoning is debugging text, not product data. It would be queried zero times in practice                                                                                | Log type_reasoning in server log (Pino, no PII) at debug level only. Do not persist                                                  |
| Client-side element pre-hint to GPT-4o                       | "Speed up classification"               | The whole point of removing computeElementHint is that client-side geometric classification is unreliable. Sending it as a hint anchors GPT-4o to a potentially wrong answer                                           | Let GPT-4o classify independently from the image                                                                                     |
| UI badge for element type codes (A/B/C/D)                    | "Show users the type"                   | Internal classification types (A/B/C/D) are implementation details. Users see Fire/Water/Earth/Air. Exposing internal codes breaks the mystique                                                                        | Map types to elements on server. Frontend never sees type codes                                                                      |

---

## Feature Dependencies

```
[GPT-4o multi-indicator prompt]
    requires: updated HAND_ATTRIBUTES_SCHEMA (JSON schema for Structured Outputs)
    requires: updated HandAttributesSchema (Zod)
    requires: updated HandAttributes type (primary_type, secondary_type, type_reasoning)
    produces: primary_type + secondary_type + type_reasoning in analyzed attributes

[deriveElement() server function]
    requires: primary_type from GPT-4o output
    produces: HandAttributes.element (mapped from type code)
    consumed by: selectBlocks()

[HandAttributes.secondary_element]
    requires: secondary_type from GPT-4o output
    requires: deriveElement() to map type code to element
    produces: optional secondary_element on HandAttributes
    consumed by: selectBlocks() for ELEMENT_BRIDGE and ELEMENT_EXCLUSIVITY_MIXED

[selectBlocks() — mixed element path]
    requires: HandAttributes.secondary_element (optional)
    requires: ELEMENT_BRIDGE blocks (12 strings)
    requires: ELEMENT_EXCLUSIVITY_MIXED blocks (12 strings)
    produces: ReportJSON.element.secondary_key (optional)
    produces: ReportJSON.element.bridge (optional)
    produces: portrait.exclusivity = mixed copy when secondary present

[ReportJSON.element.secondary_key + bridge]
    consumed by: ElementHero component (secondary badge)
    consumed by: HandSummary component (mixed exclusivity text)
    backward compat: undefined = pure element, existing components render normally

[captureFrame() improvements]
    requires: canvas resize logic for max 2048px
    requires: quality 0.92 instead of 0.82
    produces: better image quality for GPT-4o line detection

[Remove computeElementHint]
    requires: remove setElementHint call from useCameraPipeline
    requires: remove elementHint from photo-store reads
    requires: remove elementHintText from openai.ts analyzeHand()
    requires: update HandElement export (no longer used by camera)
    no downstream dependencies after removal

[Angle validation 25deg]
    requires: MAX_ANGLE_DEG = 25 in useCameraPipeline.ts
    produces: fewer tilted-palm captures

[Jitter threshold 5-frame buffer]
    already at JITTER_THRESHOLD = 0.025, STABLE_FRAMES_REQUIRED = 5
    verify no change needed (likely already correct)

[Backward compatibility]
    secondary_element is optional in HandAttributes (undefined on old readings)
    secondary_key is optional in ReportJSON.element
    all reading components must handle undefined gracefully (no crash, no visual artifact)
```

---

## MVP Definition for This Milestone

### Launch With (v1.4)

- [ ] Updated GPT-4o prompt: semantic multi-indicator (Types A/B/C/D x 6-7 visual indicators)
- [ ] Updated HAND_ATTRIBUTES_SCHEMA (JSON schema): primary_type, secondary_type, type_reasoning fields
- [ ] Updated HandAttributesSchema (Zod): parse primary_type, secondary_type, type_reasoning
- [ ] Updated HandAttributes type: primary_type, secondary_type?, type_reasoning? fields
- [ ] `deriveElement()` function: maps primary_type A/B/C/D to fire/water/earth/air
- [ ] HandAttributes.secondary_element: derived from secondary_type via deriveElement(), optional
- [ ] Remove `computeElementHint` from mediapipe.ts (function deleted)
- [ ] Remove `setElementHint` from useCameraPipeline.ts
- [ ] Remove `getElementHint()` from scan page and photo-store reads
- [ ] Remove `elementHintText` from openai.ts analyzeHand()
- [ ] captureFrame() quality 0.92, max 2048px resize
- [ ] MAX_ANGLE_DEG = 25 in useCameraPipeline.ts
- [ ] ELEMENT_BRIDGE blocks: 12 strings covering all 12 primary+secondary combos (fire+water, fire+earth, fire+air, water+fire, etc.)
- [ ] ELEMENT_EXCLUSIVITY_MIXED blocks: 12 strings
- [ ] selectBlocks() mixed-element path: populates element.secondary_key, element.bridge, mixed exclusivity
- [ ] ReportJSON.element type updated: secondary_key?, bridge? (optional)
- [ ] ElementHero/ElementSection: renders secondary_key when present (badge or label)
- [ ] HandSummary or equivalent: renders mixed exclusivity when secondary present
- [ ] All reading components: handle undefined secondary_key without crashing

### Defer to Later

- [ ] Upstash rate limiting migration — in-memory Map still sufficient
- [ ] AbacatePay payment — separate milestone, already deferred
- [ ] Resend email — separate milestone, already deferred
- [ ] Left vs right comparative reading — v3+

---

## Complexity Notes

| Area                             | Complexity | Reason                                                                                                                                                                                                                                                     |
| -------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GPT-4o prompt rewrite            | HIGH       | Structured Outputs JSON schema must be updated in lockstep with Zod schema and TypeScript types. Three files must be consistent or runtime parse fails silently. Multi-indicator prompt requires palmistry domain knowledge to phrase indicators correctly |
| deriveElement() mapping          | LOW        | Pure deterministic function. Types A/B/C/D map 1:1 to elements. No logic branching                                                                                                                                                                         |
| Remove computeElementHint        | LOW        | Delete function, remove callers, remove field from photo-store. No data migration needed                                                                                                                                                                   |
| captureFrame() image resize      | MEDIUM     | Canvas 2D resize is straightforward but must preserve aspect ratio, handle portrait vs landscape, and not introduce EXIF rotation bugs on iOS                                                                                                              |
| ELEMENT_BRIDGE copy (12 strings) | MEDIUM     | Content work. Each of 12 primary+secondary pairs needs a distinct, authentic-sounding cigana voice line. Formulaic pairs that feel copy-pasted will be obvious                                                                                             |
| Mixed-element frontend           | MEDIUM     | Secondary badge is additive (no redesign). HandSummary conditional is low-risk. Main concern is backward compat with undefined secondary_key on old readings                                                                                               |
| Angle validation change          | LOW        | One constant in useCameraPipeline.ts. Already have the validation logic                                                                                                                                                                                    |

---

## Edge Cases and Expected Behaviors

### Classification edge cases

- **Pure hand (no secondary):** GPT-4o returns secondary_type = null or omits it. Zod schema must allow optional. HandAttributes.secondary_element = undefined. selectBlocks() skips bridge and mixed exclusivity. ReportJSON.element has no secondary_key or bridge fields. Frontend renders pure-element reading.

- **Ambiguous photo (low confidence + mixed types):** Confidence < 0.3 → reject (existing behavior). Confidence 0.3-0.7 with mixed types → use primary only, skip secondary to avoid compounding uncertainty. Only include secondary when confidence >= 0.7 and secondary_type is present.

- **Same element primary and secondary:** GPT-4o could return primary_type = "A" (fire) and secondary_type = "A" (also fire). deriveElement() produces same element for both. This is a pure hand. Treat as pure, skip bridge.

- **Legacy readings:** All readings before v1.4 have no secondary_element in stored attributes JSONB. GET /api/reading/[id] returns them as-is. Frontend must not crash when element.secondary_key is undefined.

- **Upload path (no MediaPipe):** Without computeElementHint, the upload path sends photo with no element pre-hint. GPT-4o classifies purely from image. This was already the intended behavior. Remove any remaining elementHint handling from the upload code path too.

### Camera validation edge cases

- **Hand at exactly 25 degrees:** Angle validation is `angleDeg > MAX_ANGLE_DEG`. At exactly 25 degrees the hand is accepted. This is correct boundary behavior.

- **Hand oscillating near 25 degrees:** User holds hand slightly tilted and it wobbles between 24-26 degrees. Jitter detection will catch the movement (positions changing) so camera_stable won't trigger. User must hold still long enough for 5 consecutive frames at valid angle.

- **Very small hands:** Younger users or small-handed users. 2048px max dimension and 0.92 quality should provide sufficient detail. MediaPipe landmarks still work at full resolution before downscale.

- **Very dark skin:** High contrast lines are harder for GPT-4o. Brightness validation (if implemented) helps. The angle constraint (25 deg) also helps because it ensures the palm faces the camera more directly, improving line visibility.

### Mixed-element content edge cases

- **All 12 primary+secondary combos must have content:** fire+water, fire+earth, fire+air, water+fire, water+earth, water+air, earth+fire, earth+water, earth+air, air+fire, air+water, air+earth. Asymmetric pairs (fire+water vs water+fire) need distinct copy because the dominant element changes meaning.

- **Bridge text length:** Should be 1-2 sentences, same length as ELEMENT_BODY modifiers. Too long and it overwhelms the pure-element content. Too short and it feels like an afterthought.

- **Secondary element display in UI:** The secondary badge should be visually subordinate to primary. Same color palette but at reduced opacity or smaller size. If the UI promotes secondary too strongly, users may feel they got "two elements" and expect two full readings.

---

## Sources

- `.planning/PROJECT.md` — milestone target features, what's already built, constraints
- `src/server/lib/openai.ts` — current GPT-4o prompt, HAND_ATTRIBUTES_SCHEMA, analyzeHand() signature
- `src/lib/mediapipe.ts` — computeElementHint() implementation, captureFrame() quality
- `src/hooks/useCameraPipeline.ts` — JITTER_THRESHOLD, STABLE_FRAMES_REQUIRED, MAX_ANGLE_DEG
- `src/lib/photo-store.ts` — elementHint storage that will be removed
- `src/types/hand-attributes.ts` — current HandAttributes interface
- `src/types/report.ts` — current ReportJSON interface, element shape
- `src/data/blocks/element.ts` — existing ELEMENT_INTRO, ELEMENT_BODY, ELEMENT_IMPACT blocks
- `src/server/lib/select-blocks.ts` — selectBlocks() imports and structure
- `docs/palmistry.md` — hand type classification table (fire/water/earth/air by palm and finger proportions)

---

_Feature research for: MaosFalam v1.4 — Element Classification_
_Researched: 2026-04-18_

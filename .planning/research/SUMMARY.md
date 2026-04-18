# Project Research Summary

**Project:** MaosFalam v1.4 — Element Classification, MediaPipe Validation, Mixed-Hand Support
**Domain:** AI palmistry reading — classification accuracy milestone on top of an established production stack
**Researched:** 2026-04-18
**Confidence:** HIGH

## Executive Summary

MaosFalam v1.4 is a focused accuracy milestone on an already-complete product. The full stack (Next.js 16, GPT-4o, MediaPipe, Prisma/Neon, Clerk) is operational. The milestone does not add dependencies or services — it fixes a known classification reliability problem discovered through an experimental session documented in PROJECT.md: GPT-4o's Sparse MoE architecture introduces non-determinism even at temperature=0, and the existing MediaPipe element hint (computeElementHint) was observed to corrupt GPT-4o output in ~30% of cases by anchoring the model to a geometrically-derived element that did not match the visual evidence.

The recommended approach is a four-phase refactor. First, redesign the GPT-4o prompt to use neutral type labels (A/B/C/D) with 6-7 structural indicators each, replace the raw element output with a deterministic server-side deriveElement() function, and add a secondary_type field that enables mixed-element readings. Second, clean up the MediaPipe pipeline: remove all element classification code (computeElementHint, elementSamplesRef, elementMode), restore the disabled handedness inversion for back-camera, and tighten the angle threshold from 45 to 25 degrees with proper hysteresis. Third, extend the block engine and types to support a secondary element path with new ELEMENT_BRIDGE and ELEMENT_EXCLUSIVITY_MIXED content blocks. Fourth, add optional secondary element display to the reading frontend with full backward compatibility for existing readings.

The key risk is schema drift: the GPT-4o JSON Schema (sent to OpenAI), the Zod runtime schema, and the TypeScript HandAttributes type must be updated in lockstep. Any divergence compiles cleanly but causes silent runtime failures. A secondary risk is the jitter buffer: tightening the angle from 45 to 25 degrees without adding hysteresis will cause the camera to oscillate in "adjusting" state indefinitely when the user's hand wobbles near the threshold. Both risks have clear mitigation paths detailed in the research.

## Key Findings

### Recommended Stack

No new packages are required for v1.4. All changes are to existing code within the established stack. The raw fetch to GPT-4o (instead of the openai SDK) and the existing Canvas 2D API for image capture are both confirmed correct choices — adding the openai SDK would add 150KB bundle overhead for no gain, and createImageBitmap has documented Firefox compatibility issues (bug 1363861) that make Canvas drawImage the right tool for the 2048px resize cap.

**Core technologies (role in v1.4):**

- `GPT-4o gpt-4o-2024-08-06`: Primary classifier — prompt rewritten with Type A/B/C/D indicators; element no longer returned raw from API
- `Zod 4.3.6`: Schema validation — must stay in sync with OpenAI JSON Schema; use as source of truth, derive TS types with `z.infer<>`
- `@mediapipe/tasks-vision 0.10.34`: Photo quality gate only — element classification removed entirely; angle threshold tightened to 25 degrees
- `Canvas 2D API (browser)`: Image resize and capture — quality 0.82 to 0.92; max 2048px cap via drawImage scaling
- `Neon/Prisma JSONB`: No migration required — new fields (secondary_element, secondary_key, bridge) added as optional keys to existing columns

### Expected Features

**Must have (table stakes — v1.4 is incomplete without these):**

- GPT-4o multi-indicator prompt with Types A/B/C/D and 6-7 visual indicators per type
- `primary_type` + `secondary_type` + `type_reasoning` in GPT-4o structured output
- `deriveElement()` server-side deterministic mapping from type codes to elements
- Remove `computeElementHint` from camera pipeline entirely (not disabled — deleted)
- Restore handedness inversion for back-camera (currently disabled via code comment)
- Angle threshold tightened from 45 to 25 degrees with stability hysteresis
- JPEG quality raised from 0.82 to 0.92 with body limit raised from 2MB to 4MB
- `HandAttributes.secondary_element` optional field
- Backward compatibility: all existing readings without secondary_element render without crash

**Should have (differentiators that make mixed-element meaningful):**

- ELEMENT_BRIDGE content blocks: 12 strings, one per primary+secondary element pair
- ELEMENT_EXCLUSIVITY_MIXED content blocks: 12 strings for mixed-hand portrait copy
- `ReportJSON.element.secondary_key` and `element.bridge` optional fields in report
- ElementHero secondary element display (subordinate badge, not equal to primary)
- ElementSection bridge text rendered below primary element body

**Defer to later:**

- Upstash rate limiting migration (in-memory Map still sufficient at current scale)
- AbacatePay payment implementation (separate milestone, already scoped)
- Resend email implementation (separate milestone, already scoped)
- Left vs right comparative reading (v3+)
- Tertiary element classification (no palmistry basis for three-element system)

### Architecture Approach

v1.4 is a surgical refactor across 12 existing files with no new files or folders. The central architectural change is moving element classification from a client-side MediaPipe heuristic plus GPT-4o raw output pattern to a fully server-side deterministic pattern: GPT-4o reports structural type observations (A/B/C/D), a pure `deriveElement()` function maps them to elements, and MediaPipe is restricted to photo quality validation only. The build order has strict dependency constraints: types must be updated before data blocks, data blocks before the GPT-4o wrapper, the wrapper before the block engine, and the block engine before the API route.

**Major components and their v1.4 changes:**

1. `src/server/lib/openai.ts` — most complex change: new multi-indicator prompt, JSON schema, Zod schema, deriveElement(), updated analyzeHand() return
2. `src/hooks/useCameraPipeline.ts` + `src/lib/mediapipe.ts` + `src/lib/photo-store.ts` — cleanup: delete element sampling code, restore handedness, tighten angle
3. `src/server/lib/select-blocks.ts` + `src/data/blocks/element.ts` — extension: secondary element path, new content blocks
4. `src/components/reading/ElementHero.tsx` + `src/components/reading/ElementSection.tsx` — additive display with null guards

### Critical Pitfalls

1. **GPT-4o MoE non-determinism at temperature=0** — Design for non-determinism from day one. Never store raw GPT-4o element output. Store primary_type/secondary_type and run deriveElement() server-side. Same type observations always produce the same element regardless of which expert GPT-4o activated.

2. **Prompt wording biases classification** — The experimental session confirmed that using element names (Fogo/Agua/Terra/Ar) in the classification prompt causes GPT-4o to pattern-match on the name rather than analyze geometry. Use neutral Type labels (A/B/C/D) and describe 6-7 structural indicators per type. Map labels to elements only in deriveElement().

3. **Three-schema drift (OpenAI JSON Schema / Zod / TypeScript type)** — All three must be updated atomically in Phase 1. Use Zod as source of truth; derive TypeScript type with z.infer<>. Add a type-level test: `const _: ReportJSON = selectBlocks(mockAttrs, "Test", "female")` that fails at compile time if shapes diverge.

4. **Jitter buffer reset plus 25 degree angle threshold creates unescapable "adjusting" loop** — Add hysteresis: a single frame above 25 degrees should not reset stability. Require N consecutive valid frames before entering stable. Test manually: tilt hand slightly then straighten; should reach camera_stable within 3 seconds.

5. **Backward compat: existing JSONB readings without secondary_element crash frontend** — Every render of `element.secondary_key` must have a null guard (`element.secondary_key &&`). Make secondary_key optional in ReportJSON type, never required. Do not backfill old readings.

## Implications for Roadmap

Based on research, the dependency graph dictates a clear four-phase structure. No phase can be parallelized with its predecessor without risk of type errors or broken integration points.

### Phase 1: GPT-4o Prompt Redesign and Schema Alignment

**Rationale:** Everything downstream depends on the new HandAttributes shape. Types, Zod schemas, and OpenAI JSON Schema must be established before any other file changes. This phase also carries the JPEG quality plus body limit change because it modifies analyzeHand() at the same time.
**Delivers:** New multi-indicator GPT-4o prompt using Type A/B/C/D; deriveElement() function; updated HAND_ATTRIBUTES_SCHEMA, HandAttributesSchema (Zod), and HandAttributes TypeScript type with primary_type, secondary_type, type_reasoning, secondary_element; JPEG quality 0.92; body limit 4MB.
**Addresses:** Table stakes features: multi-indicator prompt, deriveElement(), secondary_element field, image quality upgrade.
**Avoids:** Non-determinism (MoE), prompt bias, schema drift, JPEG quality regression.
**Verification:** `npm run type-check` passes; `npm test` passes; staging test with same photo produces consistent element across 3 runs.

### Phase 2: MediaPipe Validation Refactor

**Rationale:** Can be parallelized with Phase 3 (block engine) but not with Phase 1 — depends on the HandAttributes type changes from Phase 1 to know what to stop populating. The handedness inversion fix is a prerequisite for any validation tightening to be meaningful.
**Delivers:** computeElementHint and dist3D deleted; elementSamplesRef, elementMode, setElementHint removed from useCameraPipeline; photo-store loses element hint slot; handedness inversion restored for back-camera; MAX_ANGLE_DEG from 45 to 25 with hysteresis; computePalmRatios() replaces computeElementHint() for passing raw geometry to prompt.
**Avoids:** MediaPipe element hint still corrupting GPT-4o (Pitfall 2), handedness inversion disabled (Pitfall 6), jitter buffer reset loop at 25 degrees (Pitfall 7).
**Verification:** Back camera + right hand passes handedness; back camera + left hand fails; manual test confirms camera_stable reached within 3s after brief angle correction.

### Phase 3: Block Engine and Content

**Rationale:** Depends on Phase 1 types (secondary_element in HandAttributes) and Phase 1 block structure. Parallelizable with Phase 2. Content copy (ELEMENT_BRIDGE, ELEMENT_EXCLUSIVITY_MIXED) must be written before buildMixedElement() is implemented in selectBlocks — writing copy forces clarity on what the feature actually says.
**Delivers:** ELEMENT_BRIDGE (12 strings, keyed by "fire_water" etc.), ELEMENT_EXCLUSIVITY_MIXED (12 strings), selectBlocks() mixed-element path, ReportJSON.element.secondary_key plus .bridge optional fields, stable seed hash that excludes secondary_element.
**Avoids:** selectBlocks seed broken by new field (Pitfall 9), bridge copy with brand voice violations shipped (Pitfall 10).
**Verification:** Unit test: same attrs with and without secondary_element produce same primary text variation. Brand voice checklist passed on all 24 new strings.

### Phase 4: Frontend Mixed Element Display

**Rationale:** Depends on Phase 3 (ReportJSON type with secondary_key and bridge). Final phase, purely additive UI changes.
**Delivers:** ElementHero secondary element badge (subordinate display), ElementSection bridge text, null guards on all secondary_key access, backward compat verified on pre-v1.4 readings.
**Avoids:** Backward compat crash on old readings (Pitfall 5), secondary_element without null guard.
**Verification:** Load a reading from before v1.4 — no crash, no empty slots. Load a new mixed-element reading — secondary badge and bridge text visible. `npm run type-check` passes with secondary_key as optional.

### Phase Ordering Rationale

- Phase 1 before everything: three-schema sync (OpenAI / Zod / TypeScript) is the highest-risk operation. Establishing it first makes all downstream work type-safe from the start.
- Phase 2 parallelizable with Phase 3 because MediaPipe changes are purely client-side deletions; they do not depend on data block content.
- Content copy (Phase 3) before frontend (Phase 4) because the frontend needs to know what secondary_key and bridge contain before designing the render path.
- The 25 degree angle threshold change and hysteresis (Phase 2) must be validated in staging before Phase 4 ships, because camera stability directly affects the quality of new readings that will show mixed-element UI.

### Research Flags

Phases needing attention during execution:

- **Phase 1 (GPT-4o prompt):** HIGH attention. The multi-indicator prompt wording requires palmistry domain knowledge (docs/palmistry.md) and prompt engineering judgment. Test same photo 3x after each prompt iteration — variance in primary_type indicates prompt needs refinement. Structured Outputs strict mode requirement (additionalProperties: false on all nested objects) must be verified against the current schema before adding fields.
- **Phase 2 (MediaPipe):** MEDIUM attention. Handedness inversion is one line but needs explicit back-camera + left hand + back-camera + right hand manual testing. The hysteresis logic for the 25 degree threshold has no existing pattern in the codebase to reference.
- **Phase 3 (content):** MEDIUM attention. 24 new strings (12 bridge + 12 exclusivity) must all pass the brand-voice checklist. The seed hash exclusion needs a unit test to verify.

Phases with established patterns (lower risk):

- **Phase 4 (frontend):** Standard optional-field null-guard pattern. ElementHero and ElementSection already consume the element object. The change is additive conditional rendering.

## Confidence Assessment

| Area         | Confidence                                          | Notes                                                                                                                                                                                                              |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stack        | HIGH                                                | All changes are to existing code. No new packages. Canvas drawImage and raw fetch patterns verified against official docs and existing codebase.                                                                   |
| Features     | HIGH                                                | Scope derived directly from PROJECT.md and full codebase inspection of all 12 affected files. Experimental session findings documented in PROJECT.md are first-hand evidence.                                      |
| Architecture | HIGH                                                | Build order derived from direct file dependency analysis. All integration points confirmed by reading the source files.                                                                                            |
| Pitfalls     | HIGH (camera/MediaPipe) / MEDIUM (GPT-4o internals) | MediaPipe and camera pitfalls from first-hand codebase analysis. GPT-4o MoE non-determinism is an architectural fact but OpenAI does not explicitly document user-facing temperature=0 behavior for vision models. |

**Overall confidence:** HIGH

### Gaps to Address

- **GPT-4o prompt wording for 6-7 indicators per type:** The exact wording of visual indicators for Type A/B/C/D is not in the research. Use docs/palmistry.md hand shape criteria as the source. Indicators must be phrased as geometric observations (palm proportion, finger length ratio, knuckle visibility, finger thickness) not as element names. Validate in Phase 1 with real photos before proceeding.

- **Hysteresis implementation for 25 degree threshold:** The research recommends hysteresis but does not specify the exact N-frame window. Start with N=3 (3 consecutive valid frames at under 25 degrees required before "stable" state). Adjust if manual testing shows it is too tight or too lenient.

- **ELEMENT_BRIDGE asymmetric pairs:** fire+water and water+fire need distinct copy (dominant element changes meaning). 12 unique strings for 12 pairs. No shortcuts — formulaic copy is detectable by users and breaks brand voice.

- **secondary_element confidence gate:** Research recommends showing secondary_element only when GPT-4o confidence is at or above 0.7. The exact threshold and how to handle the 0.3-0.7 range (primary only vs mixed) should be decided during Phase 1 implementation and documented in a comment in analyzeHand().

## Sources

### Primary (HIGH confidence)

- `src/lib/mediapipe.ts` — first-hand codebase analysis of computeElementHint, captureFrame, dist3D
- `src/hooks/useCameraPipeline.ts` — handedness inversion disabled comment, JITTER_THRESHOLD, STABLE_FRAMES_REQUIRED, MAX_ANGLE_DEG values
- `src/server/lib/openai.ts` — current analyzeHand() with elementHint bias, HAND_ATTRIBUTES_SCHEMA, Zod schema
- `src/server/lib/select-blocks.ts` — seeded PRNG, mulberry32, hashInputs() function
- `.planning/PROJECT.md` — milestone scope, documented experimental session findings
- OpenAI Structured Outputs docs — strict: true requires additionalProperties: false, all fields in required[]
- MDN Canvas API — drawImage scaling, universally supported
- npm registry — @mediapipe/tasks-vision 0.10.34 confirmed as current latest
- MediaPipe Hand Landmarker docs — front vs back camera handedness inversion behavior
- `docs/palmistry.md` — element classification criteria (palm shape + finger proportion)
- `docs/brand-voice.md` — validation checklist for all 24 new content strings

### Secondary (MEDIUM confidence)

- Next.js GitHub discussions #57501, #53087 — App Router route.ts does not support bodyParser.sizeLimit; manual check is the mechanism
- OpenAI GPT-4o Sparse MoE architecture — temperature=0 does not guarantee determinism for MoE models; this is architectural behavior, not explicitly documented as a user-facing guarantee

### Tertiary (needs validation during Phase 1)

- GPT-4o token count increase for multi-indicator prompt — estimated ~100 additional tokens from current prompt; cost impact at scale estimated at ~$0.01-0.02 per reading; track in staging but not a blocker

---

_Research completed: 2026-04-18_
_Ready for roadmap: yes_

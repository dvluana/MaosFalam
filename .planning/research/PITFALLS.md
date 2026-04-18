# Pitfalls Research

**Domain:** AI vision classification (GPT-4o multi-indicator), MediaPipe camera validation, mixed-element support — added to existing palm reading system
**Researched:** 2026-04-18
**Confidence:** HIGH (first-hand experimental session + codebase analysis), MEDIUM (GPT-4o non-determinism specifics from documented session)

---

## Critical Pitfalls

### Pitfall 1: GPT-4o Sparse MoE Non-Determinism Even at temperature=0

**What goes wrong:**
GPT-4o uses a Sparse Mixture of Experts (MoE) architecture. Unlike dense models, different expert subsets activate per request, even with `temperature: 0`. This means identical prompt + identical image can produce different element classifications across calls — "fire" on one call, "earth" on the next. The experimental session discovered this: multi-indicator prompts were tested, results varied, and the source was not prompt wording but architecture-level stochasticity.

**Why it happens:**
Developers assume `temperature: 0` means fully deterministic output. For dense models (GPT-3.5, Claude Haiku), that is largely true. GPT-4o's MoE routing adds non-determinism that `temperature` does not control. OpenAI does not expose a seed parameter for vision calls.

**How to avoid:**
Do not design the system expecting consistent element output from GPT-4o for the same image. Instead:

1. Treat GPT-4o element output as one signal among many, not the authoritative one
2. Use the `primary_type` + `secondary_type` + `type_reasoning` multi-indicator schema so GPT-4o reports its observations, and a deterministic `deriveElement()` function on the server collapses them into the final element — same observations always produce same element
3. Never store `element` from raw GPT-4o output directly. Store the intermediate `primary_type` + `secondary_type` and run `deriveElement()` server-side

This is the exact design v1.4 targets: GPT-4o classifies hand shape indicators (A/B/C/D types), `deriveElement` maps them deterministically.

**Warning signs:**

- Running the same photo through capture twice yields different element values in the DB
- Element shown in sharing card differs from element in the reading body (stale state issue)
- User reports "eu sou Fogo mas apareceu Terra"

**Phase to address:** Phase 1 — GPT-4o prompt redesign. Establish multi-indicator schema before wiring anything else.

---

### Pitfall 2: MediaPipe worldLandmarks Element Hint — Unreliable as Classification Source

**What goes wrong:**
The experimental session confirmed that `computeElementHint` using MediaPipe `worldLandmarks` (3D real-world coordinates in meters) does not reliably classify hand element. The palm/finger ratio heuristic produces internally consistent geometry but does not correlate with the four-element classification system as defined in `docs/palmistry.md`. The hint was biased by hand pose (camera angle, finger spread state) more than by actual hand shape type.

**Why it happens:**
The element classification in palmistry depends on the resting proportions and texture of the hand — not on the geometry of a single frame where the hand is extended flat for capture. A "Water" hand (long rectangular palm, long fine fingers) and an "Air" hand (square palm, long knuckled fingers) can produce similar landmark geometry when both are held open toward the camera.

The current code still calls `computeElementHint` and sends it as `element_hint` to GPT-4o. v1.4 plan is to remove this path and use MediaPipe only for validation.

**How to avoid:**

1. Remove `computeElementHint` from the camera pipeline for classification purposes
2. Remove `elementSamplesRef`, `elementMode`, and `setElementHint` from `useCameraPipeline` detection loop
3. Remove `elementHint` parameter from `analyzeHand` and the "Elemento da mao ja determinado por landmarks" text injected into the GPT-4o prompt — this biases GPT-4o toward a potentially wrong answer
4. MediaPipe's only job is: hand present, correct hand, palm open, centered, angle <25°, stable (no jitter). Nothing else.

**Warning signs:**

- `elementSamplesRef` is still populated in `useCameraPipeline`
- `analyzeHand` still accepts `elementHint` parameter
- `setElementHint` is still called in the capture path
- GPT-4o prompt still contains "Elemento da mao ja determinado por landmarks"

**Phase to address:** Phase 2 — MediaPipe validation refactor. Remove classification path entirely before touching GPT-4o prompt.

---

### Pitfall 3: Prompt Wording Biases GPT-4o Element Classification

**What goes wrong:**
The experimental session tested multiple prompt versions. Wording choices significantly affected element distribution in GPT-4o responses even for the same photo. Prompts that listed characteristics like "palma quadrada, dedos curtos = Terra" caused GPT-4o to bias toward the most prominent characteristic it could identify, ignoring others. Prompts that framed classification as "which of 4 Types does this hand match?" (Type A/B/C/D rather than Fire/Water/Earth/Air) produced more consistent multi-indicator responses.

**Why it happens:**
GPT-4o's vision completion attends to text tokens before image tokens. When the prompt provides a named-element taxonomy with loaded descriptions ("Fogo = intensidade, paixao"), the model pattern-matches on the element name itself rather than doing geometric analysis. Type labels (A/B/C/D) have no pre-training associations and force the model to reason from the indicators.

**How to avoid:**

1. Use neutral type labels (A/B/C/D or Type1/Type2/Type3/Type4) in the vision prompt, not the palmistry element names
2. Ask for 6-7 independent structural indicators (palm shape proportion, finger length ratio, knuckle visibility, finger thickness, palm width vs height, fingertip shape) separately before asking for classification
3. Map types to elements in `deriveElement()` server-side with a lookup table — the mapping never touches GPT-4o
4. Include `type_reasoning` as a required field so GPT-4o must justify its classification (chain-of-thought in the response structure constrains the output)

The Structured Outputs JSON schema must include `primary_type`, `secondary_type`, and `type_reasoning` as required fields, with the existing `element` field removed from the GPT-4o response schema entirely.

**Warning signs:**

- The GPT-4o prompt still uses the words "Fogo", "Agua", "Terra", "Ar" in the classification section
- The response schema still has `element: "fire" | "water" | "earth" | "air"` as a top-level required field
- No `type_reasoning` field in the response schema

**Phase to address:** Phase 1 — GPT-4o prompt redesign.

---

### Pitfall 4: Schema Changes Break Existing Zod Validator and HAND_ATTRIBUTES_SCHEMA

**What goes wrong:**
Adding `primary_type`, `secondary_type`, `type_reasoning` to the GPT-4o response requires changes in three places: the JSON Schema sent to OpenAI (`HAND_ATTRIBUTES_SCHEMA` object in `openai.ts`), the Zod schema (`HandAttributesSchema` in `openai.ts`), and the `HandAttributes` TypeScript type in `src/types/hand-attributes.ts`. If any of these three drift from each other, TypeScript compiles but runtime behavior is undefined — GPT-4o returns data that Zod accepts but that the type system does not model, or vice versa.

Adding `secondary_element` to `HandAttributes` without a matching `secondary_key` in `ReportJSON.element` causes `selectBlocks` to silently ignore the secondary element or crash on the frontend when it tries to render `element.secondary_key` that does not exist.

**Why it happens:**
Three separate schema representations of the same data (OpenAI JSON Schema, Zod schema, TypeScript type) must be kept in sync manually. This is error-prone, especially when iterating fast on prompt design.

**How to avoid:**

1. Make a single source of truth: define the Zod schema first, then derive the OpenAI JSON Schema from it using a converter or by hand-writing them in the same object expression
2. Update all three in the same commit, never in separate PRs
3. Update `ReportJSON` in `src/types/report.ts` at the same time as `HandAttributes` — add `element.secondary_key` and `element.bridge` fields to the report type before `selectBlocks` tries to write them
4. Add a type-level test: `const _: ReportJSON = selectBlocks(mockAttrs, "Test", "female")` in a `.test.ts` file — TypeScript will fail if the output shape diverges from the type

**Warning signs:**

- `HandAttributesSchema.parse()` succeeds but TypeScript reports type error on `.secondary_element`
- `element.secondary_key` missing from `ReportJSON.element` interface
- `selectBlocks` return type does not include `secondary_key` in the element object

**Phase to address:** Phase 1 (GPT-4o prompt redesign) — define new schema as the very first artifact, before any implementation.

---

### Pitfall 5: Backward Compatibility — Existing Readings Without secondary_element Crash Frontend

**What goes wrong:**
Existing readings in the DB have `report.element = { key: "fire", intro: "...", body: "..." }` — no `secondary_key`, no `bridge`. When the frontend is updated to render mixed-element UI (secondary badge, bridge text), it tries to access `report.element.secondary_key` on old readings, gets `undefined`, and either crashes the component or renders nothing where the secondary element should be.

**Why it happens:**
Adding optional fields to JSONB in Postgres does not automatically populate them in existing rows. Existing `report` JSONB blobs are frozen at their creation-time schema. The frontend must handle both old format (no secondary) and new format (with secondary).

**How to avoid:**

1. Make `secondary_key` and `bridge` optional in the `ReportJSON.element` type (not required fields)
2. Add a null check before rendering: `{element.secondary_key && <SecondaryElementBadge ... />}`
3. Do NOT run a migration to backfill old readings — the cost/benefit is wrong. Old readings are "pure" element readings. Accept that only new readings show mixed elements.
4. Add a `version` field to `ReportJSON` (optional, `"1.4"`) to distinguish report format generations if needed for future migrations

**Warning signs:**

- Frontend component accessing `element.secondary_key` without null check
- Type definition making `secondary_key` required instead of optional
- Reported crashes on `/ler/resultado/[id]` for old readings after v1.4 deploy

**Phase to address:** Phase 4 — mixed element frontend. Every render of `secondary_key` must have a null guard.

---

### Pitfall 6: Handedness Inversion Disabled — Still in Production Code

**What goes wrong:**
The current `useCameraPipeline.ts` contains this comment: `// Handedness inversion temporarily disabled for debugging` and maps `rawHandedness === "Left" ? "left" : "right"` without the back-camera inversion logic. This means back-camera users (the default) who hold their right hand (dominant) may be told to switch to the other hand, or the correct hand passes through incorrectly. The current behavior is non-deterministic depending on camera facing mode.

**Why it happens:**
MediaPipe assumes mirrored (selfie camera) input. For back camera (non-mirrored), the handedness label is flipped: MediaPipe "Right" = user's left hand. The inversion was disabled during debugging and never re-enabled. v1.4 must resolve this before shipping new validation logic.

**How to avoid:**

1. Restore the inversion: if `mirroredRef.current === false` (back camera), invert the handedness label before comparing to `dominantHandRef.current`
2. Add a unit test with mock handedness data for both camera modes
3. The fix is one line: `const userHandedness = mirroredRef.current ? (rawHandedness === "Left" ? "left" : "right") : (rawHandedness === "Left" ? "right" : "left")`
4. Test explicitly with back camera + right hand and back camera + left hand before closing

**Warning signs:**

- The comment "temporarily disabled" is still present in the detection loop
- Back-camera users report "mao errada" feedback when they have the correct hand
- Handedness check passes for the wrong hand in back-camera mode

**Phase to address:** Phase 2 — MediaPipe validation refactor. Fix before adding new validation logic.

---

### Pitfall 7: Jitter Buffer Reset on Every Invalid Frame Prevents Stable State

**What goes wrong:**
The current loop calls `resetBuffers()` whenever the hand fails any check (wrong hand, angle, not open, not centered). This resets `landmarkHistoryRef`, `elementSamplesRef`, and `stabilityStartRef`. A user with a slightly tilted hand who then corrects it will restart the 1.5s stability timer from zero every time any validation check fails, even briefly. This creates a frustrating experience where the "Segura..." feedback never appears.

This is not a bug with the existing simple threshold — but when the angle threshold is tightened from 45° to 25° (v1.4 requirement), the reset-on-fail pattern becomes much more aggressive. Minor hand wobble at 24° → reset → 26° → adjusting → 24° → reset → loop forever.

**How to avoid:**

1. Separate buffer reset from state transitions. Only reset `stabilityStartRef` and `landmarkHistoryRef` when the hand fails validation. Do NOT reset if the frame was valid (angle ok, centered, open) but jitter threshold not yet met.
2. Introduce hysteresis on the angle check: consider a hand "stable angle" if it has been under 25° for the last N frames, not just the current frame. A single-frame spike at 26° should not reset stability.
3. The element samples (`elementSamplesRef`) should NOT reset when the hand temporarily fails validation — they are an independent running window. Resetting them means element detection needs to restart from scratch every time the user adjusts.

**Warning signs:**

- Users report the camera never auto-captures despite holding still
- "Segura..." state (camera_stable) is reached then immediately drops back to "camera_adjusting"
- Logs show rapid state oscillation between camera_hand_detected and camera_adjusting

**Phase to address:** Phase 2 — MediaPipe validation refactor. Must verify stability hysteresis works at 25° threshold before shipping.

---

### Pitfall 8: JPEG Quality and Resolution Regression — Existing Working Value Changed

**What goes wrong:**
The current system captures at `quality: 0.82` in `captureFrame()`. The v1.4 target spec says `JPEG 0.92, max 2048px, detail:high, body limit 4MB`. Increasing JPEG quality from 0.82 to 0.92 and resolution from 1280px capture to 2048px max increases payload size by 3-5x. The existing Vercel body limit handling in `/api/reading/capture` was tuned for the current payload size. Changing quality without verifying the body limit in the Next.js route config causes 413 errors in production.

**Why it happens:**
Photo quality parameters look like low-risk changes. Developers increase quality without measuring the output size, and Vercel silently returns 413 before the route handler runs — the error appears as a network failure on the client, not a clear 413.

**How to avoid:**

1. Before changing JPEG quality/resolution, measure actual output size: log `base64.length * 0.75` (bytes) in the scan page for a real phone photo at both settings
2. The body size limit config in the capture route (`export const config`) must be updated to match the new max payload
3. If max 2048px + quality 0.92 exceeds 4MB base64 for real photos, add a client-side size check: if the base64 exceeds a threshold, downscale further before sending
4. The `captureFrame` function currently uses the video's native resolution. Add explicit max-size logic: if `video.videoWidth > 2048`, scale the canvas down before drawing

Current formula for safe payload estimate: `width * height * 3 * quality_factor * 1.33 (base64 overhead)` — a 2048x1536 JPEG at 0.92 quality is approximately 800KB-2MB depending on scene complexity.

**Warning signs:**

- 413 errors on `/api/reading/capture` in staging after quality change
- Console errors like "Request Entity Too Large" in staging logs
- Payload size logs showing >3MB for typical phone photos

**Phase to address:** Phase 1 — GPT-4o prompt redesign (as part of `analyzeHand` changes). Set the quality and body limit at the same time, verify in staging.

---

### Pitfall 9: mixed-element selectBlocks Changes Break the Deterministic Seed

**What goes wrong:**
`selectBlocks` uses a seeded PRNG (`mulberry32`) based on `hashInputs(attributes, name, gender)`. The hash is derived from `JSON.stringify(attributes)`. When `HandAttributes` gains a new field (`secondary_element`), the JSON string changes, the hash changes, and all existing readings that are re-rendered (fetched and passed through `selectBlocks`) will produce different text variation picks than when they were originally saved.

This does not affect stored readings (the report is stored in JSONB and never re-run through `selectBlocks`). But any code path that re-runs `selectBlocks` on existing attributes (e.g., a "regenerate" button, a preview in the account area, or a test that reconstructs a reading) will produce different output.

**Why it happens:**
The seed depends on the full attributes JSON. Any structural change to `HandAttributes` is a breaking change to the seed. Adding `secondary_element: undefined` and `secondary_element: "fire"` produce different hashes even for the same primary analysis.

**How to avoid:**

1. When adding `secondary_element` to `HandAttributes`, exclude it from the seed hash. Compute the hash from a stable subset of fields (the existing fields as of v1.3).
2. Better: add a dedicated `seed_version` field to `HandAttributes` and include it in the hash but keep the other fields stable
3. Document in `select-blocks.ts`: "Do not add new HandAttributes fields to the hash function without considering backward compatibility"
4. The simplest fix: hash only `{ element, heart, head, life, fate, venus, mounts, rare_signs }` explicitly (not full JSON.stringify), so new fields don't affect the seed

**Warning signs:**

- Unit tests for `selectBlocks` that check exact text output start failing after adding `secondary_element`
- Two calls to `selectBlocks` with the same attributes but one has `secondary_element` undefined and the other has it set return different text for the primary element section

**Phase to address:** Phase 3 — selectBlocks + backend changes. Fix seed before adding the field.

---

### Pitfall 10: ELEMENT_BRIDGE and ELEMENT_EXCLUSIVITY_MIXED Block Data Written Without Proofread

**What goes wrong:**
v1.4 adds 12 `ELEMENT_BRIDGE` strings and 12 `ELEMENT_EXCLUSIVITY_MIXED` strings (one per element pair). These are brand voice copy — they need to follow the cigana voice rules exactly (no travessoes, no hedging, second person, palmistry nomenclature, etc.). If the blocks are written quickly as placeholders and shipped, they enter the DB and are served to real users. Changing text blocks after they are in the DB requires either a data migration or a code re-deploy, which is easy but creates a lag.

**Why it happens:**
Backend developers write placeholder copy ("Mao de Fogo com tracos de Agua. Interessante combinacao.") to test the feature and forget to replace it before the phase is marked done.

**How to avoid:**

1. All text blocks must be reviewed against `docs/brand-voice.md` before the phase is closed
2. Write all 12 bridge strings and 12 exclusivity strings before implementing `buildMixedElement()` in `selectBlocks` — writing the copy forces clarity on what the feature actually says
3. Use the brand voice checklist: second person, no travessoes, no emojis, no "energias/vibracoes", nomenclatura real, direct ("Suas maos carregam dois fios", not "Parece que...")
4. Bridge strings must follow the format of existing crossing blocks — short (1-2 sentences), punchy, reveal-not-explain

**Warning signs:**

- Any bridge string containing "—" (em dash), "talvez", "pode ser", or "energias"
- Any bridge string referring to "as pessoas" instead of "voce"
- Bridge strings that explain what mixed elements mean instead of revealing what it means for this specific person

**Phase to address:** Phase 3 — selectBlocks + content. All copy reviewed before the phase is marked complete.

---

## Technical Debt Patterns

| Shortcut                                                                                | Immediate Benefit                         | Long-term Cost                                                                          | When Acceptable                                       |
| --------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Keeping `computeElementHint` in `mediapipe.ts` even after removing it from the pipeline | No code deletion, easier to revert        | Dead code confuses future developers; signals MediaPipe still does classification       | Never — delete it in Phase 2                          |
| Sending `element_hint` to GPT-4o as a "bias" hint                                       | Seemed to reduce some variance in testing | Actually biases GPT-4o toward a possibly-wrong answer, defeating multi-indicator design | Never — remove entirely in Phase 1                    |
| Using `element: "fire"` field name in GPT-4o JSON schema instead of `primary_type`      | Reuses existing schema structure          | Keeps non-determinism at element level; misses the deriveElement architecture           | Never — the multi-indicator schema is the whole point |
| Making `secondary_element` required in HandAttributes from day one                      | Simpler type (no Optional)                | Breaks all existing readings and tests immediately                                      | Never — keep optional, null-guard everywhere          |
| Writing bridge copy inline in selectBlocks as template literals                         | Fast to implement                         | Content never reviewed for brand voice; enters prod as placeholder                      | Never — content is brand-critical                     |

---

## Integration Gotchas

| Integration               | Common Mistake                                                  | Correct Approach                                                                                       |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GPT-4o multi-indicator    | Using element names (Fogo/Agua) in classification prompt        | Use neutral type labels (Type A/B/C/D); map to elements in `deriveElement()` server-side               |
| GPT-4o multi-indicator    | Assuming `temperature: 0` gives deterministic output            | Design for non-determinism: observations → deriveElement, not raw element                              |
| GPT-4o Structured Outputs | Adding fields to Zod schema without updating OpenAI JSON Schema | Both must match exactly; `strict: true` in the schema means any mismatch causes API error              |
| MediaPipe worldLandmarks  | Using 3D coordinates for element classification                 | Only use worldLandmarks for jitter detection (movement between frames); never for shape classification |
| MediaPipe handedness      | Not inverting label for back camera                             | Front camera (mirrored=true): label maps directly. Back camera: invert the label.                      |
| JSONB in Postgres         | Assuming new optional fields auto-appear in old rows            | Old report JSONB is frozen; frontend must null-check all new optional fields                           |
| Zod + TypeScript          | Keeping Zod schema and TS type separate                         | Use Zod schema as the source of truth; derive TS type with `z.infer<typeof HandAttributesSchema>`      |

---

## Performance Traps

| Trap                                                                  | Symptoms                                                                                 | Prevention                                                                                    | When It Breaks                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Higher JPEG quality (0.92) without body limit update                  | 413 errors in production that look like network failures                                 | Measure payload size in staging first; update body limit in Next.js route config              | First real phone photo in prod after quality change               |
| element sampling buffer not cleared on capture                        | Element hint from one session bleeds into next capture if user goes back and tries again | Clear `elementSamplesRef` on `capturedRef.current = true` and on unmount                      | When user taps "Tentar de novo" without page reload               |
| Running `selectBlocks` again on fetched reading attributes            | Re-generates different text due to seed change                                           | Never re-run `selectBlocks` on stored readings; always serve the stored JSONB report directly | Anytime `HandAttributes` schema changes (every milestone)         |
| Multi-indicator JSON schema with 6-7 indicators increases token count | GPT-4o costs go from ~$0.01 to ~$0.02/reading                                            | Design schema efficiently; `type_reasoning` as a short string not a paragraph                 | Scale: at 10K readings/month, $100 vs $200 — acceptable but track |

---

## Security Mistakes

| Mistake                                                                     | Risk                                                                                      | Prevention                                                                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Logging `primary_type`, `secondary_type`, or `type_reasoning` at INFO level | Logs contain model's analysis chain which could be scraped to reverse-engineer the prompt | Log only `element` (derived) and `confidence` — never log the intermediate classification fields |
| Storing the full GPT-4o reasoning chain in the reading DB                   | PII-adjacent: reasoning may mention hand characteristics that are sensitive               | Store only the final `HandAttributes` and the derived `ReportJSON`, not `type_reasoning`         |
| Changing body size limit without reviewing CORS and security headers        | A higher body limit increases attack surface for large-payload denial-of-service          | Match body limit to realistic max photo size; add content-type validation before size check      |

---

## UX Pitfalls

| Pitfall                                                                   | User Impact                                                                                                          | Better Approach                                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Tightening angle threshold to 25° without hysteresis                      | "Camera_adjusting" fires constantly on minor hand wobble; user can never reach stable state                          | Require N consecutive valid frames at <25° before entering stable; single-frame spike should not reset              |
| Showing secondary element badge when confidence is low                    | User with "Ar com tracos de Fogo" at confidence 0.35 gets mixed-element UI that looks authoritative but is guesswork | Only show `secondary_element` when GPT-4o `confidence >= 0.7`; below that, show primary element only                |
| Mixed element UI without explanation anchor                               | Users see "Fogo + Agua" and don't know what the bridge means                                                         | Bridge text (`ELEMENT_BRIDGE`) must appear immediately after the secondary badge, not buried in the premium section |
| Backward-compatible reading showing no secondary element in a new UI slot | Old readings look broken — empty slot where secondary badge should appear in new layout                              | Design new UI components to be additive: secondary badge slot only renders if `secondary_key` is present            |

---

## "Looks Done But Isn't" Checklist

- [ ] **Multi-indicator prompt:** GPT-4o prompt uses Type A/B/C/D labels, not Fogo/Agua/Terra/Ar — verify by reading `PROMPT` constant in `openai.ts`
- [ ] **deriveElement server-side:** `HandAttributes.element` is computed by `deriveElement(primary_type, secondary_type)`, never taken directly from GPT-4o response — verify `analyzeHand` return path
- [ ] **MediaPipe classification removed:** `computeElementHint` is not called in `useCameraPipeline` detection loop — verify `elementSamplesRef` is gone from the hook
- [ ] **element_hint removed from analyzeHand:** `analyzeHand` no longer accepts `elementHint` parameter — verify function signature
- [ ] **Handedness inversion restored:** Back camera inversion is active — verify by checking `mirroredRef.current` branch in handedness check
- [ ] **Angle threshold at 25° with hysteresis:** Single-frame spike above 25° does not reset stability — verify with manual test (tilt slightly then straighten)
- [ ] **secondary_element optional in type:** `HandAttributes.secondary_element` is `HandElement | undefined`, not `HandElement` — verify type definition
- [ ] **secondary_key null-checked in frontend:** Every render of `element.secondary_key` has a null/undefined guard — verify in ElementHero and ElementSection components
- [ ] **JPEG quality update with body limit sync:** `captureFrame` quality updated AND capture route body limit updated in the same change — verify both in one code review
- [ ] **Brand voice on all bridge strings:** All 12 `ELEMENT_BRIDGE` strings pass the brand voice checklist — verify no travessoes, no hedging, second person, nomenclatura real
- [ ] **Seed hash excludes secondary_element:** Adding secondary_element to an existing HandAttributes object does not change the seed hash — verify with a unit test

---

## Recovery Strategies

| Pitfall                                              | Recovery Cost | Recovery Steps                                                                                                                           |
| ---------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Non-deterministic element (GPT-4o raw output stored) | HIGH          | Requires schema migration to store `primary_type`/`secondary_type`; old readings lose secondary; re-derive `element` for all rows        |
| Handedness bug shipped                               | MEDIUM        | Deploy fix immediately; affected readings are stored with wrong element in JSONB — manual correction only possible by re-running capture |
| Bridge copy with brand voice violations shipped      | LOW           | Deploy corrected strings; only future readings get corrected text; old readings are stored in JSONB and unaffected                       |
| Backward-compat crash on old readings                | MEDIUM        | Deploy null-guard fix; no data loss; but users on old readings saw crash in the window between deploy                                    |
| Seed hash changed — text variations shifted          | LOW           | No data loss; stored readings unaffected; add explicit stable-field hash to prevent recurrence                                           |
| JPEG quality increase causes 413 in prod             | LOW           | Revert quality or increase body limit; no data loss; affected capture requests returned error to user                                    |

---

## Pitfall-to-Phase Mapping

| Pitfall                               | Prevention Phase                       | Verification                                                                                         |
| ------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GPT-4o non-determinism (MoE)          | Phase 1: GPT-4o prompt redesign        | Same photo run 3x produces same element via deriveElement even if primary_type varies                |
| Prompt wording biases element         | Phase 1: GPT-4o prompt redesign        | Prompt contains no element names; Type labels only                                                   |
| Schema drift (Zod / OpenAI / TS type) | Phase 1: GPT-4o prompt redesign        | TypeScript strict build passes; Zod schema and OpenAI schema produce identical field sets            |
| MediaPipe element hint still active   | Phase 2: MediaPipe validation refactor | `elementSamplesRef` and `computeElementHint` absent from detection loop                              |
| Handedness inversion disabled         | Phase 2: MediaPipe validation refactor | Back camera + right hand passes handedness check; back camera + left hand fails it                   |
| Jitter reset prevents stable state    | Phase 2: MediaPipe validation refactor | Manual test: tilted then corrected hand reaches camera_stable within 3s                              |
| JPEG quality regression               | Phase 1 (with analyzeHand changes)     | Staging log shows payload <3MB for real phone photo at new quality settings                          |
| Backward compat crash on old readings | Phase 4: mixed element frontend        | Load a reading from before v1.4 on the result page — no crash, no missing UI slots                   |
| Seed hash broken by new field         | Phase 3: selectBlocks                  | Unit test: same attrs with and without secondary_element produce same primary text variation         |
| Bridge copy brand voice violations    | Phase 3: selectBlocks + content        | Manual review against docs/brand-voice.md checklist before phase marked done                         |
| secondary_element without null guard  | Phase 4: mixed element frontend        | Every ElementHero/ElementSection render path passes TypeScript strict with secondary_key as optional |

---

## Sources

- Project `src/lib/mediapipe.ts` — first-hand codebase analysis, HIGH confidence
- Project `src/hooks/useCameraPipeline.ts` — handedness inversion disabled, comment in code, HIGH confidence
- Project `src/server/lib/openai.ts` — current `analyzeHand` with `elementHint` bias, HIGH confidence
- Project `src/server/lib/select-blocks.ts` — seeded PRNG and hash function, HIGH confidence
- Project `.planning/PROJECT.md` — documented experimental session findings ("GPT-4o classifica mas non-deterministic. MediaPipe landmarks nao serve pra classificar. Sessao experimental extensa em git stash."), HIGH confidence
- [OpenAI GPT-4o Sparse MoE architecture](https://openai.com/index/hello-gpt-4o/) — temperature=0 does not guarantee determinism for MoE models, MEDIUM confidence (architectural fact, not explicitly documented as user-facing behavior)
- [OpenAI Structured Outputs strict mode](https://platform.openai.com/docs/guides/structured-outputs) — `strict: true` requires schema and response to match exactly, HIGH confidence
- [MediaPipe Hand Landmarker handedness docs](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) — front vs back camera handedness behavior, HIGH confidence
- `docs/palmistry.md` — element classification criteria (shape + proportion, not frame geometry), HIGH confidence
- `docs/brand-voice.md` — validation checklist for all user-facing text, HIGH confidence

---

_Pitfalls research for: MaosFalam v1.4 — GPT-4o multi-indicator classification, MediaPipe validation, mixed-element support_
_Researched: 2026-04-18_

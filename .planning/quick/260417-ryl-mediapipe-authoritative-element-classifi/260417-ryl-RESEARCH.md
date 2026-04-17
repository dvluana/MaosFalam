# Quick Task: MediaPipe Authoritative Element Classification — Research

**Researched:** 2026-04-17
**Domain:** Element classification pipeline — MediaPipe landmarks vs GPT-4o
**Confidence:** HIGH (all findings from direct code inspection)

---

## Summary

Root cause is confirmed in the debug investigation: GPT-4o vision inference is non-deterministic for
geometric proportions even at temperature=0. The same hand photo returned "fire", "air", and "water"
across three calls. MediaPipe's `computeElementHint` is fully deterministic for the same hand position
and uses precise geometric ratios. The fix is to make MediaPipe authoritative: override
`attributes.element` in the capture route when `element_hint` is present, then strip the element
classification from the GPT-4o prompt to avoid confusion.

**Primary recommendation:** In the capture route, after `analyzeHand()` returns, replace
`attributes.element` with `data.element_hint` when it is present. For the upload path (no MediaPipe),
GPT-4o remains the sole source.

---

## Finding 1: computeElementHint is fully deterministic

**Source:** `src/lib/mediapipe.ts` lines 123-138

```typescript
const isLongPalm = palmHeight / palmWidth > 1.1;
const isLongFingers = fingerLength / palmHeight > 0.95;

if (!isLongPalm && isLongFingers) return "air";
if (!isLongPalm && !isLongFingers) return "earth";
if (isLongPalm && !isLongFingers) return "fire";
return "water"; // isLongPalm && isLongFingers
```

Thresholds: `palmHeight/palmWidth > 1.1` for long palm; `fingerLength/palmHeight > 0.95` for long
fingers. No randomness. Same landmarks = same output, every time.

**Edge cases to consider:**

- Borderline ratios (e.g., ratio = 1.09 vs 1.10): a slight hand tilt between frames could flip the
  classification. However, `computeElementHint` is called at the stable-frame capture moment
  (`lastLandmarksRef.current`), so the hand is already confirmed stable for 1.5s. Tilt variance is low.
- Returns `undefined` if `landmarks.length < 21` or if `palmWidth < 0.01 || palmHeight < 0.01`
  (degenerate geometry). The capture flow only proceeds after MediaPipe validates presence, openness,
  and stability — so reaching capture with degenerate landmarks is not a realistic scenario.
- Upload path: `computeElementHint` is never called. `element_hint` will be `undefined` in the
  capture route for uploads. This is the intended fallback path.

**Confidence: HIGH**

---

## Finding 2: GPT-4o element_hint handling is advisory, not enforced

**Source:** `src/server/lib/openai.ts` lines 306-308

The hint is injected as:

```
"Pre-analise geometrica dos landmarks da mao indica elemento: ${elementHint}. Confirme ou corrija com base na foto."
```

"Confirme ou corrija" explicitly grants GPT-4o permission to override the hint. The prompt rule for
element classification asks GPT-4o to visually estimate "quadrada vs longa" and "curtos vs longos" —
subjective visual judgment that changes between calls. GPT-4o ignores or overrides the hint regularly.

**After the fix:** The element field returned by GPT-4o becomes unused for the camera path (it will be
overridden in the capture route). The GPT-4o prompt instruction for element can be left in place for
now (it causes no harm and serves the upload fallback path), or stripped to simplify. Stripping is
cleaner but requires changing the prompt. Recommendation: strip it — it reduces confusion and saves a
few tokens.

**Confidence: HIGH**

---

## Finding 3: Downstream dependencies on `attributes.element`

`attributes.element` is consumed in exactly two places:

| Location                                  | Usage                                                                                                                                                                         | Impact of override                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `src/server/lib/select-blocks.ts:183`     | `const el = attributes.element` — drives all element blocks (intro, body, impact phrase, compatibility, portrait exclusivity, crossing condition `head_touches_life_x_earth`) | Override must happen BEFORE `selectBlocks()` call |
| `src/app/api/reading/capture/route.ts:95` | `element: attributes.element` in logger.info                                                                                                                                  | Will log the overridden value — correct behavior  |

There is NO `hand_shape` or `hand_type` field anywhere in the current codebase. The old
`docs/palmistry.md` schema has `hand_shape.palm_proportion` and `hand_shape.finger_length`, but the
actual `HandAttributes` type used by the code only has `element` (not `hand_shape`). There is nothing
to fix for `hand_shape` — it does not exist in production code.

**Confidence: HIGH**

---

## Finding 4: Upload path has no MediaPipe

The upload flow in `CameraPageInner` calls `validate()` (MediaPipe in IMAGE mode) but `computeElementHint`
is NOT called in the upload path — only the camera live-capture path calls it via `useCameraPipeline`.
The `photo-store` `elementHint` is only set by `setElementHint()` in the pipeline. For uploads,
`getElementHint()` returns `null`/`undefined`, which means `element_hint` is `undefined` in the
capture route.

**Clean handling:** The override logic should be a simple guard:

```typescript
// After analyzeHand():
const finalAttributes = data.element_hint
  ? { ...attributes, element: data.element_hint }
  : attributes;
// Then use finalAttributes everywhere below
```

GPT-4o remains authoritative for uploads. No separate code path needed.

**Confidence: HIGH**

---

## Finding 5: Override strategy — element only, no hand_shape changes needed

The question of whether to also override `hand_shape` sub-fields (`palm_proportion`, `finger_length`)
is moot: **`hand_shape` does not exist in the current `HandAttributes` type**. The `openai.ts` schema
returns only `element`, `heart`, `head`, `life`, `fate`, `venus`, `mounts`, `rare_signs`, `confidence`.
No `hand_shape` field.

The element override is clean and isolated: replace `attributes.element` with `element_hint`. No
consistency concerns with other fields.

**Confidence: HIGH**

---

## Finding 6: Existing readings in DB — no action needed

The 3 readings in Neon develop with inconsistent elements are test data. Existing readings already have
their report JSONB computed and stored — the report does not reference `attributes.element` at read
time; it was baked in at write time. There is no retroactive fix needed. Future readings will be
consistent. No migration required.

**Confidence: HIGH**

---

## Implementation Plan

Three changes, all in the capture route and optionally the GPT-4o prompt:

**Change 1 (required): Override in capture route**

In `src/app/api/reading/capture/route.ts`, after line 47 (`const attributes = await analyzeHand(...)`):

```typescript
// Use MediaPipe element as authoritative source when available (camera path).
// Upload path has no MediaPipe — GPT-4o remains the fallback.
const finalAttributes = data.element_hint
  ? { ...attributes, element: data.element_hint }
  : attributes;
```

Then replace all subsequent `attributes` references with `finalAttributes` (lines 50, 62, 84-85, 95).

**Change 2 (recommended): Strip element from GPT-4o prompt**

In `src/server/lib/openai.ts`, remove the rule line:

```
- element: determine pela proporcao palma/dedos (quadrada+curtos=terra, quadrada+longos=ar, longa+curtos=fogo, longa+longos=agua)
```

And change the element_hint text from "Confirme ou corrija" to a neutral instruction, OR simply keep
the field in the JSON schema but accept that GPT-4o's element output will be ignored for the camera
path. Stripping the prompt rule reduces instruction noise for the camera path.

**Change 3 (optional): Update elementHintText**

If keeping the hint in the prompt, change to "Ignore o campo element para mao de camera — o valor sera
sobrescrito pelo cliente." This is optional and cosmetic.

---

## Common Pitfalls

### Pitfall 1: Applying override after selectBlocks

`selectBlocks()` reads `attributes.element` on its first line. If the override happens after
`selectBlocks()` is called, the report will still use GPT-4o's element. The override MUST precede
`selectBlocks()`.

### Pitfall 2: Mutating the attributes object

Use spread (`{ ...attributes, element: data.element_hint }`) rather than mutating the object in place.
The original `attributes` is passed to `JSON.stringify` for DB storage — overriding with spread
ensures the stored JSONB reflects the final element used in the report.

### Pitfall 3: Forgetting the logger line

Line 95 logs `element: attributes.element`. After the refactor, it should log from `finalAttributes`
to ensure the logged element matches what was actually used.

---

## Sources

- `src/lib/mediapipe.ts` — computeElementHint implementation (HIGH)
- `src/server/lib/openai.ts` — prompt and element_hint handling (HIGH)
- `src/app/api/reading/capture/route.ts` — capture pipeline (HIGH)
- `src/server/lib/select-blocks.ts` — element consumption (HIGH)
- `.planning/debug/element-inconsistency.md` — root cause diagnosis (HIGH)
- `src/app/ler/scan/page.tsx` — element_hint plumbing confirmation (HIGH)

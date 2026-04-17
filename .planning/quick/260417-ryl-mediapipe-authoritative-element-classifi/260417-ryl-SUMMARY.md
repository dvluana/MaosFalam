---
phase: quick
plan: 260417-ryl
subsystem: reading-pipeline
tags: [element-classification, mediapipe, gpt4o, determinism, capture-route]
dependency_graph:
  requires: []
  provides: [deterministic-element-classification-camera-path]
  affects: [src/app/api/reading/capture/route.ts, src/server/lib/openai.ts, src/lib/mediapipe.ts]
tech_stack:
  added: []
  patterns: [override-pattern, finalAttributes-spread]
key_files:
  modified:
    - src/app/api/reading/capture/route.ts
    - src/server/lib/openai.ts
    - src/lib/mediapipe.ts
    - src/server/lib/__tests__/openai.test.ts
decisions:
  - finalAttributes spread pattern — override only element, preserving all other GPT-4o attributes
  - element_hint guard is simple conditional, not a separate code path
  - GPT-4o still returns element field (required by JSON schema) but it is ignored on camera path
  - elementHintText changed from advisory to directive to reduce GPT-4o instruction noise
  - Override happens BEFORE selectBlocks and BEFORE DB write — guaranteed consistency
metrics:
  duration: 5m
  completed: "2026-04-17T23:14:35Z"
  tasks: 1
  files: 4
---

# Quick Task 260417-ryl: MediaPipe Authoritative Element Classification Summary

**One-liner:** MediaPipe `computeElementHint` is now the authoritative source for element classification on the camera path — GPT-4o's non-deterministic geometric inference is overridden before `selectBlocks()` and DB write.

## What Was Done

Root cause: GPT-4o vision inference is non-deterministic for geometric proportion estimation even at temperature=0. The same hand photo returned "fire", "air", and "water" across three calls. MediaPipe's `computeElementHint` computes element deterministically from precise landmark ratios (same hand position = same output every time).

Three changes implemented in one commit:

### 1. Element override in `src/app/api/reading/capture/route.ts`

After `analyzeHand()` returns, a `finalAttributes` spread is created:

```typescript
const finalAttributes = data.element_hint
  ? { ...attributes, element: data.element_hint }
  : attributes;
```

When `element_hint` is present (camera path), the override fires and logs both values for observability:

```typescript
logger.info(
  { gptElement: attributes.element, mediapiElement: data.element_hint },
  "Element overridden by MediaPipe",
);
```

All downstream uses updated to `finalAttributes`: confidence check, `selectBlocks()`, DB `attributes` JSONB, DB `confidence`, and the "Reading created" logger line.

Upload path: `element_hint` is `undefined` → `finalAttributes === attributes` → GPT-4o element used as before. Zero behavior change.

### 2. GPT-4o prompt cleanup in `src/server/lib/openai.ts`

Removed the element classification rule from `PROMPT`:

```
- element: determine pela proporcao palma/dedos (quadrada+curtos=terra, ...)
```

Changed `elementHintText` from advisory ("Confirme ou corrija com base na foto") to directive:

```
Elemento da mao ja determinado por landmarks: ${elementHint}. Nao precisa classificar elemento — foque nas linhas, montes e sinais.
```

GPT-4o still returns an `element` field (required by the JSON schema for the upload fallback path), but no longer receives instructions on how to classify it for the camera path.

### 3. JSDoc update in `src/lib/mediapipe.ts`

Updated `computeElementHint` JSDoc from "client-side pre-hint for GPT-4o confirmation" to:

```
AUTHORITATIVE source for element classification on the camera path.
GPT-4o element is only used as fallback for the upload path (no MediaPipe).
```

### 4. Test fix in `src/server/lib/__tests__/openai.test.ts`

Updated one test assertion that checked for old "Pre-analise" text to check for new "Elemento da mao ja determinado" text.

## Deviations from Plan

**1. [Rule 2 - Missing critical fix] Updated failing test for elementHintText change**

- **Found during:** `npm run test -- --run` after implementing the plan
- **Issue:** Test `injects elementHint text when provided` asserted `toContain("Pre-analise")` — the old advisory wording. After the prompt change, the test failed.
- **Fix:** Updated assertion to `toContain("Elemento da mao ja determinado")` — matches the new directive wording.
- **Files modified:** `src/server/lib/__tests__/openai.test.ts`
- **Commit:** 7eeb24b (same commit — staged together)

## Verification

- `npm run lint` — passed (0 warnings, 0 errors)
- `npm run type-check` — passed (no type errors)
- `npm run build` — passed (all 45 routes compiled)
- `npm run test -- --run` — 163/163 tests pass

## Manual verification (grep)

After the override line (line 51), no bare `attributes` references remain in downstream logic — only `finalAttributes`. The one remaining `attributes.element` reference (line 57) is intentional: it logs the GPT-4o value before override for comparison.

## Self-Check: PASSED

- `src/app/api/reading/capture/route.ts` — modified, override present before selectBlocks ✓
- `src/server/lib/openai.ts` — element rule removed from PROMPT, elementHintText updated ✓
- `src/lib/mediapipe.ts` — JSDoc updated to authoritative ✓
- Commit `7eeb24b` exists ✓
- All checks pass ✓

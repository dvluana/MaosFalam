---
phase: 05-pipeline-refactor
plan: "02"
subsystem: server-pipeline
tags: [openai, element-hint, capture-route, reading-client, tests]
dependency_graph:
  requires: []
  provides: [analyzeHand-elementHint, capture-route-element_hint, reading-client-element_hint]
  affects:
    [src/server/lib/openai.ts, src/app/api/reading/capture/route.ts, src/lib/reading-client.ts]
tech_stack:
  added: []
  patterns: [optional-parameter-forwarding, spread-conditional-content-array]
key_files:
  modified:
    - src/server/lib/openai.ts
    - src/app/api/reading/capture/route.ts
    - src/lib/reading-client.ts
    - src/server/lib/__tests__/openai.test.ts
    - src/app/api/reading/capture/route.test.ts
decisions:
  - "elementHint injected as text in user message (not system prompt) to keep OpenAI caching intact — same pattern as dominanceContext"
  - "Spread conditional array [...(hint ? [item] : [])] keeps content array clean without branching"
  - "element_hint defaults to undefined in Zod schema — no default value, purely optional pass-through"
metrics:
  duration: "2m"
  completed_date: "2026-04-11T19:38:59Z"
  tasks_completed: 2
  files_modified: 5
---

# Phase 05 Plan 02: Element Hint Server Pipeline Summary

Added optional MediaPipe element pre-hint support throughout the server pipeline: `analyzeHand`, the capture route Zod schema, and the `captureReading` client function.

## What Was Built

**One-liner:** Optional `elementHint` parameter wired from `captureReading` client through capture route Zod schema into `analyzeHand` GPT-4o user message.

### analyzeHand (src/server/lib/openai.ts)

- Added optional third parameter: `elementHint?: "fire" | "water" | "earth" | "air"`
- When present, constructs hint text and injects it as a `text` content item between `dominanceContext` and `"Analise esta palma."` in the GPT-4o user message
- When absent, content array remains 3 items (zero regression)
- Uses spread conditional pattern: `...(elementHintText ? [{...}] : [])` for clean array construction

### Capture Route (src/app/api/reading/capture/route.ts)

- Added `element_hint: z.enum(["fire", "water", "earth", "air"]).optional()` to Zod schema
- Updated `analyzeHand` call to forward `data.element_hint` as third argument

### Reading Client (src/lib/reading-client.ts)

- Added `element_hint?: "fire" | "water" | "earth" | "air"` to `captureReading` data type
- No other changes needed — `JSON.stringify(data)` already serializes all fields

## Tests

### openai.test.ts (13 tests, all passing)

- Updated `AI-01: content array has text before image_url` to check last item is `image_url` (order-agnostic, handles optional elementHint)
- Added `injects elementHint text when provided` — verifies 4-item content array with hint at index 1
- Added `omits elementHint text when not provided` — verifies 3-item content array (regression guard)

### route.test.ts (9 tests, all passing)

- Added `element_hint: "fire"` to `validBody`
- Added `passes element_hint to analyzeHand when present`
- Added `passes undefined element_hint when not in body`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The element_hint flows end-to-end from client type through route schema to GPT-4o user message.

## Deferred Items (out of scope)

- `src/lib/__tests__/mediapipe-element-hint.test.ts` — pre-existing lint error (import/order) and TypeScript error (`visibility` property missing in NormalizedLandmark mock) from plan 05-01. Not introduced by this plan.

## Commits

- `6d760e2` — feat(05-02): add elementHint parameter to analyzeHand
- `a5020cd` — feat(05-02): add element_hint to capture route and reading-client

## Self-Check: PASSED

- src/server/lib/openai.ts: FOUND
- src/app/api/reading/capture/route.ts: FOUND
- src/lib/reading-client.ts: FOUND
- commit 6d760e2: FOUND
- commit a5020cd: FOUND

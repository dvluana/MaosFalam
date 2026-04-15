---
phase: 05-pipeline-refactor
plan: "01"
subsystem: lib/mediapipe
tags: [photo-store, mediapipe, element-hint, tdd, unit-tests]
dependency_graph:
  requires: []
  provides: [photo-store, computeElementHint, captureFrame-quality-param]
  affects: [camera/page.tsx, scan/page.tsx, useCameraPipeline.ts]
tech_stack:
  added: []
  patterns: [module-level-singleton, tdd-red-green]
key_files:
  created:
    - src/lib/photo-store.ts
    - src/lib/__tests__/photo-store.test.ts
    - src/lib/__tests__/mediapipe-element-hint.test.ts
  modified:
    - src/lib/mediapipe.ts
decisions:
  - "photo-store uses module-level singleton: survives Next.js App Router soft navigation, type-safe, RAM-only (no browser storage API needed)"
  - "computeElementHint uses INDEX_MCP→PINKY_MCP for palmWidth, WRIST→MIDDLE_MCP for palmHeight, MIDDLE_MCP→MIDDLE_TIP for fingerLength — same math as architecture.md"
  - "captureFrame quality param defaults to 0.82 (from 0.92), reducing live-camera JPEG payload ~40% while staying above GPT-4o safe floor"
  - "NormalizedLandmark requires visibility field in @mediapipe/tasks-vision types — test helper pt() includes it"
metrics:
  duration: "3m"
  completed: "2026-04-11T19:39:40Z"
  tasks_completed: 2
  files_changed: 4
---

# Phase 05 Plan 01: Foundation Primitives (photo-store + element hint) Summary

Typed module-level photo singleton and MediaPipe element classification function with quality reduction, both test-driven.

## What Was Built

**Task 1: photo-store module**

New file `src/lib/photo-store.ts` — typed singleton for ephemeral photo transfer between camera and scan pages. Exports `setPhoto`, `getPhoto`, `setElementHint`, `getElementHint`, `clearPhotoStore`. Works because Next.js App Router does client-side soft navigation without re-evaluating JS modules.

**Task 2: computeElementHint + captureFrame quality**

Added `computeElementHint(landmarks)` to `src/lib/mediapipe.ts`. Uses palm aspect ratio and finger-to-palm ratio to classify hands as fire/water/earth/air (consistent with `docs/architecture.md` math). Returns `undefined` for insufficient or degenerate input. `captureFrame` now accepts an optional `quality` parameter defaulting to `0.82` (was hardcoded `0.92`), reducing live-camera JPEG payload by ~40%.

## Commits

| Task | Hash    | Message                                                                   |
| ---- | ------- | ------------------------------------------------------------------------- |
| 1    | 6a65769 | feat(05-01): add photo-store module with tests                            |
| 2    | ee895cc | feat(05-01): add computeElementHint + reduce captureFrame quality to 0.82 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] NormalizedLandmark requires visibility field**

- **Found during:** Task 2 GREEN phase (type-check)
- **Issue:** `@mediapipe/tasks-vision` NormalizedLandmark type requires `visibility: number` — test fixtures used `{x, y, z}` only
- **Fix:** Added `pt(x, y)` helper in test that includes `visibility: 1`
- **Files modified:** `src/lib/__tests__/mediapipe-element-hint.test.ts`
- **Commit:** ee895cc (included in Task 2 commit)

**2. [Rule 1 - Bug] Import order lint error in test file**

- **Found during:** Task 2 lint check
- **Issue:** `@/lib/mediapipe` import appeared after `@mediapipe/tasks-vision` type import, violating import/order ESLint rule
- **Fix:** Ran `npm run lint -- --fix` which auto-corrected the import order
- **Files modified:** `src/lib/__tests__/mediapipe-element-hint.test.ts`
- **Commit:** ee895cc (included in Task 2 commit)

## Known Stubs

None — this plan creates pure utility modules with no UI rendering or data flow stubs.

## Self-Check: PASSED

- src/lib/photo-store.ts: FOUND
- src/lib/**tests**/photo-store.test.ts: FOUND
- src/lib/**tests**/mediapipe-element-hint.test.ts: FOUND
- Commit 6a65769: FOUND
- Commit ee895cc: FOUND

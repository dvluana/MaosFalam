---
phase: 16-gpt4o-schema-image-quality
plan: "02"
subsystem: image-pipeline
tags: [image-quality, element-hint-removal, photo-store, capture-route]
dependency_graph:
  requires: [16-01]
  provides: [clean-element-hint-pipeline, higher-quality-images]
  affects:
    [capture/route.ts, scan/page.tsx, photo-store.ts, useCameraPipeline.ts, useUploadValidation.ts]
tech_stack:
  added: []
  patterns: [jpeg-0.92, max-2048px, server-derives-element]
key_files:
  created: []
  modified:
    - src/lib/mediapipe.ts
    - src/lib/normalize-image.ts
    - src/lib/photo-store.ts
    - src/lib/reading-client.ts
    - src/app/api/reading/capture/route.ts
    - src/app/ler/scan/page.tsx
    - src/hooks/useCameraPipeline.ts
    - src/hooks/useUploadValidation.ts
    - src/lib/__tests__/photo-store.test.ts
    - src/app/api/reading/capture/route.test.ts
decisions:
  - "element_hint removed end-to-end: GPT-4o now classifies element via neutral type codes (plan 01), no client override needed"
  - "Element sampling loop in useCameraPipeline removed along with setElementHint — dead code with no consumer"
  - "worldLm extraction in useUploadValidation removed since computeElementHint result had no consumer"
  - "attributes added to capture route response JSON for debug/testing per D-05 in CONTEXT.md"
metrics:
  duration: "8 minutes"
  completed: "2026-04-18"
  tasks_completed: 2
  files_modified: 10
---

# Phase 16 Plan 02: Image Quality + Element Hint Removal Summary

JPEG quality raised to 0.92 with 2048px max dimension for better GPT-4o accuracy; element_hint pipeline removed end-to-end across photo-store, scan page, capture route, reading-client, and both camera/upload hooks.

## Tasks Completed

| Task | Name                                                             | Commit  | Files                                                           |
| ---- | ---------------------------------------------------------------- | ------- | --------------------------------------------------------------- |
| 1    | Image quality + photo-store cleanup                              | caea4fa | mediapipe.ts, normalize-image.ts, photo-store.ts + hooks + test |
| 2    | element_hint cleanup in capture route, reading-client, scan page | eb1667a | capture/route.ts, reading-client.ts, scan/page.tsx + test       |

## What Was Built

- `captureFrame` default quality: 0.82 → 0.92
- `normalizeImage`: maxWidth 1280 → 2048, quality 0.85 → 0.92
- `photo-store.ts`: simplified to 3 exports only (`setPhoto`, `getPhoto`, `clearPhotoStore`) — removed `setElementHint`, `getElementHint`, local `HandElement` type
- `capture/route.ts`: body limit 2MB → 4MB; `element_hint` removed from Zod schema; `analyzeHand` called with 2 args; `finalAttributes` block removed; `attributes` added to response JSON
- `reading-client.ts`: `element_hint` removed from `captureReading` param type
- `scan/page.tsx`: `getElementHint` import and `element_hint` call removed
- `useCameraPipeline.ts`: element sampling loop removed (elementSamplesRef, elementMode, ELEMENT_SAMPLES_REQUIRED, computeElementHint import, HandElement import)
- `useUploadValidation.ts`: worldLm extraction and computeElementHint/setElementHint calls removed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed dead element sampling code from useCameraPipeline and useUploadValidation**

- **Found during:** Task 1 — after removing setElementHint from photo-store, two hooks still imported and called it
- **Issue:** `useCameraPipeline.ts` imported `setElementHint`, `computeElementHint`, `HandElement` and had an 8-sample element accumulation loop feeding the removed store. `useUploadValidation.ts` imported `computeElementHint`, `setElementHint`, extracted `worldLm` solely to compute element hint.
- **Fix:** Removed the entire element sampling loop from useCameraPipeline (elementSamplesRef, elementMode function, ELEMENT_SAMPLES_REQUIRED constant, and the worldLandmarks sampling block). Removed worldLm extraction and element hint block from useUploadValidation. Both files' imports updated accordingly.
- **Files modified:** src/hooks/useCameraPipeline.ts, src/hooks/useUploadValidation.ts
- **Commit:** caea4fa

**2. [Rule 1 - Bug] Updated photo-store test and capture route test**

- **Found during:** Task 1 type-check and Task 2 test run
- **Issue:** `photo-store.test.ts` had 3 tests for removed setElementHint/getElementHint. `route.test.ts` had validBody with element_hint and two tests asserting analyzeHand was called with 3 args.
- **Fix:** Simplified photo-store test to 4 tests covering remaining API. Updated route.test.ts: removed element_hint from validBody, merged two element_hint tests into single test asserting 2-arg analyzeHand call.
- **Files modified:** src/lib/**tests**/photo-store.test.ts, src/app/api/reading/capture/route.test.ts
- **Commit:** caea4fa, eb1667a

## Known Stubs

None — `computeElementHint`, `dist3D`, and `HandElement` remain in `src/lib/mediapipe.ts` as planned (Phase 17 removes them). They are exported but no longer imported anywhere in the active pipeline. This is intentional per plan spec.

## Self-Check: PASSED

- src/lib/mediapipe.ts — FOUND, quality = 0.92 at line 180
- src/lib/normalize-image.ts — FOUND, maxWidth = 2048, quality = 0.92
- src/lib/photo-store.ts — FOUND, exports only setPhoto/getPhoto/clearPhotoStore
- src/app/api/reading/capture/route.ts — FOUND, 4MB limit, no element_hint, 2-arg analyzeHand
- src/lib/reading-client.ts — FOUND, no element_hint in type
- src/app/ler/scan/page.tsx — FOUND, no getElementHint, no element_hint in captureReading
- Commit caea4fa — FOUND
- Commit eb1667a — FOUND
- grep element_hint in src/ — 0 results in active code
- npm run lint — PASSED
- npm run type-check — PASSED
- npm run build — PASSED
- npm run test --run — PASSED (166/166)

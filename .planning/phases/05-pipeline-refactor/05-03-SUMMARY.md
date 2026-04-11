---
phase: 05-pipeline-refactor
plan: "03"
subsystem: camera-scan-pipeline
tags: [photo-store, element-hint, race-condition, sessionStorage, scan-gate, mediapipe]
dependency_graph:
  requires: [05-01-photo-store, 05-02-element-hint-server]
  provides: [camera-photoStore-wired, scan-race-condition-fixed, element-hint-end-to-end]
  affects:
    - src/app/ler/camera/page.tsx
    - src/hooks/useCameraPipeline.ts
    - src/app/ler/scan/page.tsx
    - src/app/ler/resultado/[id]/completo/page.tsx
tech_stack:
  added: []
  patterns: [3-effect-gate, rising-edge-setState, module-singleton-store]
key_files:
  modified:
    - src/app/ler/camera/page.tsx
    - src/hooks/useCameraPipeline.ts
    - src/app/ler/scan/page.tsx
    - src/app/ler/resultado/[id]/completo/page.tsx
decisions:
  - "scan_slow triggered at render-time (rising-edge) not in useEffect — avoids react-hooks/set-state-in-effect lint violation, same pattern as forced state"
  - "setProgress(100) moved inside setTimeout callback to avoid synchronous setState in effect body"
  - "lastLandmarksRef stores last valid (correct hand + open + centered) frame landmarks for element hint"
  - "clearPhotoStore() called immediately after getPhoto() in scan — frees memory before long API call"
metrics:
  duration: "8m"
  completed_date: "2026-04-11T19:50:00Z"
  tasks_completed: 2
  files_modified: 4
---

# Phase 05 Plan 03: Camera/Scan Pipeline Wire-Up Summary

Wired photo-store and element hint into the camera/scan pipeline. Eliminated all sessionStorage photo usage. Fixed the scan page race condition where navigation could happen before the API resolved.

## What Was Built

**One-liner:** photo-store integrated into camera/scan pages, elementHint computed from MediaPipe landmarks and forwarded to GPT-4o, scan race condition eliminated via 3-effect gate pattern.

### useCameraPipeline (src/hooks/useCameraPipeline.ts)

- Added imports: `computeElementHint` from mediapipe, `setElementHint` from photo-store, `NormalizedLandmark` type
- Added `lastLandmarksRef` to track last valid landmarks (correct hand, open, centered)
- `lastLandmarksRef.current` updated on every frame that passes all validation checks
- In capture setTimeout: computes element hint from lastLandmarksRef before calling `onCaptured`
- Upload flow correctly does NOT set elementHint (no landmarks available for file uploads)

### camera/page.tsx (src/app/ler/camera/page.tsx)

- Added imports: `clearPhotoStore`, `setPhoto` from photo-store
- Mount effect: `sessionStorage.removeItem("maosfalam_photo")` replaced with `clearPhotoStore()`
- `handleCaptured`: `sessionStorage.setItem` replaced with `setPhoto(photoBase64)`
- `handleUploadConfirm`: replaced with `setPhoto(base64)`
- `handleUploadSelectedFromError`: replaced with `setPhoto(base64)`
- Zero references to `maosfalam_photo` remain

### scan/page.tsx (src/app/ler/scan/page.tsx)

Complete effects rewrite (JSX unchanged):

**Effect 1 — API call:**
- Reads photo via `getPhoto()`, element hint via `getElementHint()`
- Calls `clearPhotoStore()` immediately to free memory
- Passes `element_hint` to `captureReading`
- Stores result in `apiResult` state (ok/error)

**Effect 2 — Animation:**
- Caps progress at 99 (never 100) until apiResult is available
- Sets `animDone = true` after 8 seconds
- Never calls router.push

**scan_slow transition:**
- Rising-edge at render time: `if (animDone && !apiResult && state === "scanning") setState("scan_slow")`
- Avoids react-hooks/set-state-in-effect lint error

**Effect 3 — Gate:**
- Only fires when `animDone && apiResult` are both set
- On error: router.replace to /ler/erro with correct type
- On success: sets sessionStorage for reading_id and impact_phrase, then navigates to /ler/revelacao

### resultado/completo/page.tsx (deviation fix)

- Removed stale `sessionStorage.removeItem("maosfalam_photo")` from "start new reading" button
- The key no longer exists in sessionStorage; photo lives in photoStore which is cleared on camera mount

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed stale maosfalam_photo cleanup in resultado/completo**
- **Found during:** Task 2 final verification (grep -r "maosfalam_photo" src/)
- **Issue:** `src/app/ler/resultado/[id]/completo/page.tsx` had `sessionStorage.removeItem("maosfalam_photo")` in the "start new reading" button handler — a key that no longer exists in sessionStorage after this plan's changes
- **Fix:** Removed the stale cleanup line (photo now lives in module-level photoStore, cleared on camera mount)
- **Files modified:** src/app/ler/resultado/[id]/completo/page.tsx
- **Commit:** f1bf5cb

**2. [Rule 1 - Bug] ESLint react-hooks/set-state-in-effect violations**
- **Found during:** Task 2 lint run
- **Issue 1:** `setProgress(100)` was a synchronous setState inside Effect 3 body — moved into setTimeout callback
- **Issue 2:** `setState("scan_slow")` was in a separate useEffect — replaced with render-time rising-edge (same project pattern used elsewhere for forced state)
- **Files modified:** src/app/ler/scan/page.tsx
- **Commit:** f1bf5cb

## Known Stubs

None. The element_hint flows end-to-end: MediaPipe landmarks → computeElementHint → setElementHint → getElementHint → captureReading → analyzeHand → GPT-4o user message.

## Commits

- `290044a` — feat(05-03): wire photo-store and elementHint into camera pipeline
- `f1bf5cb` — feat(05-03): fix scan page race condition with 3-effect gate pattern

## Self-Check: PASSED

- src/app/ler/camera/page.tsx: FOUND
- src/hooks/useCameraPipeline.ts: FOUND
- src/app/ler/scan/page.tsx: FOUND
- src/app/ler/resultado/[id]/completo/page.tsx: FOUND
- commit 290044a: FOUND
- commit f1bf5cb: FOUND
- Zero "maosfalam_photo" in src/: CONFIRMED
- npm run type-check: PASSED
- npm run lint: PASSED
- npm run build: PASSED
- npm run test (98 tests): PASSED

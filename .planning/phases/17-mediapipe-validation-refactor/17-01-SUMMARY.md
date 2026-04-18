---
phase: 17-mediapipe-validation-refactor
plan: "01"
subsystem: camera-pipeline
tags: [mediapipe, handedness, angle-validation, hysteresis, camera-feedback]
dependency_graph:
  requires: []
  provides: [mediapipe-validation-only, handedness-fix, angle-hysteresis, stability-countdown]
  affects:
    [
      src/lib/mediapipe.ts,
      src/hooks/useCameraPipeline.ts,
      src/components/camera/CameraFeedback.tsx,
      src/app/ler/camera/page.tsx,
    ]
tech_stack:
  added: []
  patterns: [angle-hysteresis-buffer, stability-progress-callback]
key_files:
  created: []
  modified:
    - src/lib/mediapipe.ts
    - src/hooks/useCameraPipeline.ts
    - src/components/camera/CameraFeedback.tsx
    - src/app/ler/camera/page.tsx
  deleted:
    - src/lib/__tests__/mediapipe-element-hint.test.ts
decisions:
  - angleDeg computed from WRIST->MIDDLE_MCP vector vs vertical in screen-space normalized coords
  - angleConsecutiveRef resets in all failure branches (hand loss, wrong hand, centering fail, angle fail)
  - onStabilityProgress destructured from params — safe inside eslint-disable-next-line comment block
  - mediapipe-element-hint.test.ts deleted as it tested the removed computeElementHint function
metrics:
  duration: 18m
  completed_date: "2026-04-18"
  tasks_completed: 3
  files_modified: 4
  files_deleted: 1
---

# Phase 17 Plan 01: MediaPipe Validation Refactor Summary

**One-liner:** MediaPipe restricted to photo-quality gate only — element classification deleted, handedness inversion fixed, 25-degree angle threshold with 3-frame hysteresis buffer, and gold countdown bar during stable window.

## Tasks Completed

| Task | Name                                            | Commit  | Key Files                                                 |
| ---- | ----------------------------------------------- | ------- | --------------------------------------------------------- |
| 1    | Delete element classification from mediapipe.ts | 7c12d7e | src/lib/mediapipe.ts                                      |
| 2    | Fix handedness inversion + 25 deg hysteresis    | 7c12d7e | src/hooks/useCameraPipeline.ts                            |
| 3    | Add countdown progress bar to CameraFeedback    | 2c93d09 | CameraFeedback.tsx, useCameraPipeline.ts, camera/page.tsx |

## What Was Done

### Task 1: mediapipe.ts cleanup

- Deleted `computeElementHint` function and its JSDoc block
- Deleted local `HandElement` type (canonical type lives in `src/types/report.ts`)
- Deleted unused landmark constants `INDEX_MCP`, `MIDDLE_TIP`, `PINKY_MCP` (only used by deleted function)
- Added `angleDeg` field to `ValidLandmarkResult` interface and `validateLandmarks` return
- `angleDeg` computed as `Math.abs(atan2(dx, -dy))` in degrees — 0 = upright palm, grows as hand tilts

### Task 2: useCameraPipeline.ts — handedness + hysteresis

- Removed `computeElementHint` and `setElementHint` imports (no element classification in camera path)
- Removed `NormalizedLandmark` import (no longer needed — `lastLandmarksRef` removed)
- Fixed handedness inversion: back camera (mirrored=false) swaps MediaPipe "Left"→right, front camera maps directly
- Lowered `MAX_ANGLE_DEG` from 45 to 25
- Added `ANGLE_HYSTERESIS_FRAMES = 3` — requires 3 consecutive valid-angle frames before stability accumulates
- Added `angleConsecutiveRef` ref, reset in all rejection branches (no hand, wrong hand, centering, angle)
- Removed element hint computation from capture timeout

### Task 3: CameraFeedback + wiring

- `CameraFeedback` now accepts optional `stabilityProgress?: number` prop
- When provided, renders a 128px gold progress bar below feedback text (Framer Motion animated width)
- `useCameraPipeline` Params interface extended with `onStabilityProgress?: (progress: number) => void`
- Progress emitted during stability accumulation window (`elapsed / STABILITY_MS`), reset to 0 on any failure
- Camera page adds `stabilityProgress` state, passes `onStabilityProgress={setStabilityProgress}`, passes prop to `CameraFeedback` only during `camera_stable`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Added angleDeg computation to validateLandmarks**

- Found during: Task 2
- Issue: Plan referenced `angleDeg` from `validateLandmarks` return but the function didn't return it
- Fix: Added `angleDeg` to `ValidLandmarkResult` interface and computed it in `validateLandmarks`
- Files modified: src/lib/mediapipe.ts
- Commit: 7c12d7e

**2. [Rule 1 - Bug] Deleted mediapipe-element-hint.test.ts**

- Found during: Task 1
- Issue: Test file imported and tested `computeElementHint` which was deleted — caused type-check failure
- Fix: Deleted the test file (function is gone, tests have no target)
- Files deleted: src/lib/**tests**/mediapipe-element-hint.test.ts
- Commit: 7c12d7e

## Verification Results

```
grep computeElementHint|dist3D|HandElement src/lib/mediapipe.ts → PASS (no matches)
grep MAX_ANGLE_DEG src/hooks/useCameraPipeline.ts → = 25
grep angleConsecutiveRef src/hooks/useCameraPipeline.ts → present, reset in resetBuffers equivalent branches
grep "Back camera" src/hooks/useCameraPipeline.ts → mirroredRef.current branch active
npm run lint → PASS (0 warnings)
npm run type-check → PASS (pre-existing TS errors in unrelated routes unchanged)
npm run build → PASS
npm run test --run → 157/157 PASS
```

## Known Stubs

None — all wiring is functional.

## Self-Check: PASSED

- `src/lib/mediapipe.ts` — modified, computeElementHint absent
- `src/hooks/useCameraPipeline.ts` — modified, MAX_ANGLE_DEG=25, angleConsecutiveRef present
- `src/components/camera/CameraFeedback.tsx` — modified, stabilityProgress prop present
- `src/app/ler/camera/page.tsx` — modified, onStabilityProgress wired
- Commit 7c12d7e — verified in git log
- Commit 2c93d09 — verified in git log

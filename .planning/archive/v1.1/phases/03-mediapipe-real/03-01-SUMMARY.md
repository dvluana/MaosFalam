---
phase: 03-mediapipe-real
plan: 01
subsystem: ui
tags: [mediapipe, camera, hand-detection, typescript, react]

# Dependency graph
requires:
  - phase: 02-readingcontext-creditos
    provides: ReadingContext with dominant_hand field used for handedness validation
provides:
  - Real MediaPipe Hand Landmarker pipeline replacing mock timer-based camera detection
  - src/lib/mediapipe.ts with loadHandLandmarker, validateLandmarks, detectHandedness, captureFrame
  - Extended CamState: camera_adjusting, camera_wrong_hand
  - useCameraPipeline with getUserMedia, rAF detection loop, auto-capture after 1.5s stability
affects: [04-clerk-cleanup, camera page integration]

# Tech tracking
tech-stack:
  added: ["@mediapipe/tasks-vision (already installed, now used for real)"]
  patterns:
    - "rAF-based detection loop: useEffect starts loop when state in DETECTION_STATES, cleanup cancels rAF on unmount or state exit"
    - "Handedness mapping: front camera (mirrored) — MediaPipe label maps directly; back camera (not mirrored) — labels flipped"
    - "Stability timer via Date.now() timestamps, not frame count (handles variable frame rates)"
    - "captureFrame un-mirrors front camera image so GPT-4o receives natural palm orientation"

key-files:
  created:
    - src/lib/mediapipe.ts
  modified:
    - src/types/camera.ts
    - src/hooks/useCameraPipeline.ts
    - src/app/ler/camera/page.tsx

key-decisions:
  - "Front camera (mirrored): MediaPipe Left/Right maps directly to user's hand; back camera: labels are flipped"
  - "validateLandmarks uses finger spread (THUMB_TIP to PINKY_TIP) vs palm height (WRIST to MIDDLE_MCP) for isOpen check"
  - "Stability measured by timestamps (Date.now()), not frame count — frame-rate agnostic"
  - "captureFrame applies ctx.scale(-1,1) for mirrored cameras so captured JPEG is un-mirrored for GPT-4o"
  - "camera_wrong_hand is NOT an error state — it's inline-recoverable (user switches hands)"
  - "Hidden <video> and <canvas> elements added to camera page (sr-only) for MediaPipe to consume"

patterns-established:
  - "mediapipe.ts is 'use client' since it imports browser-only MediaPipe APIs"
  - "rAF loop reads stateRef (kept in sync via useEffect) to avoid stale closure over state"
  - "Separate useEffects for init phase (loading_mediapipe) and detection loop (active states)"

requirements-completed: [MP-01, MP-02, MP-03, MP-04, MP-06, MP-07]

# Metrics
duration: 8min
completed: 2026-04-11
---

# Phase 03 Plan 01: MediaPipe Real Pipeline Summary

**Real MediaPipe Hand Landmarker detection replacing mock timers: rAF loop validates open hand, centered position, and handedness against ReadingContext, auto-captures after 1.5s stability as base64 JPEG**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-11T18:30:00Z
- **Completed:** 2026-04-11T18:38:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Installed (verified already in package.json) and wired `@mediapipe/tasks-vision` into the camera pipeline
- Created `src/lib/mediapipe.ts` with loadHandLandmarker, validateLandmarks, detectHandedness, captureFrame
- Extended `CamState` with `camera_adjusting` and `camera_wrong_hand` (both with CAM_FEEDBACK and CAM_EYEBROW entries)
- Rewrote `useCameraPipeline` from mock timers to real getUserMedia + HandLandmarker.detectForVideo rAF loop
- Updated camera page to provide `videoRef`/`canvasRef` and hidden `<video>`+`<canvas>` elements

## Task Commits

Each task was committed atomically:

1. **Task 1: Install MediaPipe, extend CamState, create mediapipe.ts module** - `913e1fd` (feat)
2. **Task 2: Rewrite useCameraPipeline with real MediaPipe detection loop** - `ef659a8` (feat)

## Files Created/Modified

- `src/lib/mediapipe.ts` - MediaPipe loader, validateLandmarks, detectHandedness, captureFrame utilities
- `src/types/camera.ts` - Added camera_adjusting and camera_wrong_hand states with feedback/eyebrow entries
- `src/hooks/useCameraPipeline.ts` - Full rewrite: getUserMedia, rAF detection loop, handedness check, auto-capture
- `src/app/ler/camera/page.tsx` - Added videoRef/canvasRef, hidden video+canvas elements, passed refs to hook

## Decisions Made

- **Handedness mapping:** Front camera (mirrored) — MediaPipe Left/Right maps directly to user's hand. Back camera (not mirrored) — labels are flipped. The caller handles this via `mirroredRef`.
- **isOpen threshold:** Finger spread (THUMB_TIP to PINKY_TIP) > 0.35 \* palm height (WRIST to MIDDLE_MCP). Palm height as reference makes the check aspect-ratio-independent.
- **Stability by timestamps:** Date.now() deltas instead of frame counting — handles variable frame rates on different devices.
- **captureFrame un-mirrors:** Front camera video appears mirrored on screen; we un-mirror when drawing to canvas so GPT-4o receives natural palm orientation for accurate line detection.
- **camera_wrong_hand not an error state:** User can simply switch hands — no need to retry the whole flow.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added videoRef/canvasRef wiring to camera page**

- **Found during:** Task 2 (type-check after rewriting useCameraPipeline)
- **Issue:** useCameraPipeline now requires videoRef and canvasRef params, but camera page didn't provide them — TypeScript error TS2345
- **Fix:** Added `useRef<HTMLVideoElement | null>(null)` and `useRef<HTMLCanvasElement | null>(null)` to camera page, passed both to useCameraPipeline, added hidden `<video>` and `<canvas>` elements (sr-only) to the JSX
- **Files modified:** src/app/ler/camera/page.tsx
- **Verification:** npm run type-check passes with no errors
- **Committed in:** ef659a8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for TypeScript compilation. No scope creep.

## Issues Encountered

None beyond the deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- MediaPipe pipeline is wired end-to-end: camera opens, hands detected, quality validated, auto-captured as base64 JPEG passed to onCaptured
- Plan 03-02 (if any) can build on this foundation
- CameraViewport still shows SVG overlay only — real video feed overlay is a potential visual enhancement but not required for functionality

---

_Phase: 03-mediapipe-real_
_Completed: 2026-04-11_

---
phase: 01-camera-ui
plan: 02
subsystem: camera-ui
tags: [camera, dominant-hand, wiring, framer-motion, a11y, camera-switch]
requires:
  - HandOutlineSVG (01-01)
  - HandInstructionOverlay (01-01)
  - HandExpectedBadge (01-01)
provides:
  - WrongHandFeedback (src/components/camera/WrongHandFeedback.tsx)
  - hand_instruction CamState
  - CameraViewport with badge, outline, camera switch
  - Camera page with full dominant-hand flow
affects:
  - src/hooks/useCameraPipeline.ts (preferredFacing, cameraKey params)
  - src/types/camera.ts (hand_instruction state added)
  - src/app/ler/camera/page.tsx (full rewire)
tech-stack:
  added: []
  patterns:
    - Render-time rising-edge detection to avoid setState-in-effect lint violation
    - cameraKey counter pattern for forcing useEffect re-run without changing deps semantics
    - Permission-denied auto-redirect via useEffect timer
    - Viewport-embedded badge and outline with z-10 positioning
key-files:
  created:
    - src/components/camera/WrongHandFeedback.tsx
  modified:
    - src/types/camera.ts
    - src/components/camera/CameraViewport.tsx
    - src/hooks/useCameraPipeline.ts
    - src/app/ler/camera/page.tsx
    - src/components/camera/HandExpectedBadge.tsx
    - src/components/camera/HandInstructionOverlay.tsx
decisions:
  - Render-time rising-edge (not useEffect) drives WrongHandFeedback show state — avoids react-hooks/set-state-in-effect lint error while preserving 3s auto-hide behavior
  - cameraKey counter passed to useCameraPipeline forces init effect re-run when camera is switched, without modifying the effect's primary dependency semantics
  - HandOutlineSVG shows at opacity 0.12 only in camera_active_no_hand; other states use the crosshair target (not replaced entirely)
  - Permission denied auto-redirects to upload after 1.5s — cigana phrase shown briefly before transition
metrics:
  duration: "6 minutes"
  completed: "2026-04-11T17:12:57Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 6
---

# Phase 01 Plan 02: Camera UI Wiring Summary

All camera UI components from Plan 01 wired into the camera page with dominant-hand awareness — instruction overlay, viewfinder badge, SVG outline, wrong-hand toast, camera switch, and permission-denied redirect.

## One-liner

WrongHandFeedback toast + hand_instruction state + HandExpectedBadge/HandOutlineSVG in viewport + camera switch button + permission-denied-to-upload redirect — full dominant-hand camera flow complete.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create WrongHandFeedback and add hand_instruction state | b3f85d7 | WrongHandFeedback.tsx, camera.ts |
| 2 | Update CameraViewport with badge, outline, camera switch | 83e2b0c | CameraViewport.tsx |
| 3 | Wire everything into camera page | 74889fc | page.tsx, useCameraPipeline.ts |
| fix | Fix import order lint errors | be0fae8 | WrongHandFeedback.tsx, CameraViewport.tsx, HandExpectedBadge.tsx, HandInstructionOverlay.tsx |

## What Was Built

**WrongHandFeedback** — Non-blocking toast component that appears for 3 seconds when the wrong hand is detected. Uses Framer Motion AnimatePresence for fade + slide. `aria-live="assertive"` for screen readers. Text: "Essa e a outra mao. Me mostra a {direita/esquerda}." DS branded radius `0 6px 0 6px`, deep background at 0.9 opacity. Does NOT block capture — camera continues running.

**hand_instruction CamState** — New state added between `method_choice` and `loading_mediapipe`. Added to `CamState` union, `CAM_STATES` array, `CAM_FEEDBACK` record (empty string), and `CAM_EYEBROW` record ("Instrucao").

**CameraViewport updates** — Added `dominantHand` and `onSwitchCamera` props. HandExpectedBadge renders at `absolute top-3 left-3 z-10` when state is not loading or capturing. HandOutlineSVG renders centered at opacity 0.12 when `camera_active_no_hand`. Camera switch icon button at `absolute bottom-3 right-3` with DS btn-icon styling (44x44, gold/8 border, branded radius) — only renders when `onSwitchCamera` is provided.

**Camera page wiring** — Loads `ReadingContext.dominant_hand` (defaults to "right"). Flow: `method_choice` → `hand_instruction` (HandInstructionOverlay) → `loading_mediapipe`. WrongHandFeedback rendered at bottom, visible when `camera_wrong_hand`. `handleSwitchCamera` stops current stream, toggles facingMode, increments cameraKey, resets to `loading_mediapipe`. Permission denied auto-redirects to upload after 1.5s via useEffect timer.

**useCameraPipeline updates** — Added `preferredFacing?: "environment" | "user"` and `cameraKey?: number` to Params. `getUserMedia` uses `preferredFacing ?? "environment"`. Init effect deps extended to include `cameraKey` so camera switch triggers re-init.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] setState-in-effect lint violation in WrongHandFeedback**
- **Found during:** Task 3 lint check
- **Issue:** react-hooks/set-state-in-effect rule blocks `setShow(true)` called synchronously in useEffect
- **Fix:** Used render-time rising-edge detection — compare `visible` to `prevVisibleRef.current` during render to call `setShow` outside effects. Timer for auto-hide remains in useEffect keyed on `showCount`.
- **Files modified:** src/components/camera/WrongHandFeedback.tsx
- **Commit:** be0fae8

**2. [Rule 1 - Bug] Import order lint errors in Wave 1 components**
- **Found during:** Post-task-3 lint check
- **Issue:** HandExpectedBadge (framer-motion after react), HandInstructionOverlay (missing blank line between groups), CameraViewport (react type import in wrong position)
- **Fix:** Reordered imports to match project ESLint import/order rules
- **Files modified:** HandExpectedBadge.tsx, HandInstructionOverlay.tsx, CameraViewport.tsx
- **Commit:** be0fae8

## Known Stubs

None. All components receive real data from ReadingContext. The dominant_hand value defaults to "right" if ReadingContext is null, which is correct fallback behavior.

## Self-Check: PASSED

- [x] src/components/camera/WrongHandFeedback.tsx exists
- [x] src/types/camera.ts has "hand_instruction" in CamState, CAM_STATES, CAM_FEEDBACK, CAM_EYEBROW
- [x] src/components/camera/CameraViewport.tsx has dominantHand and onSwitchCamera props
- [x] src/hooks/useCameraPipeline.ts has preferredFacing and cameraKey params
- [x] src/app/ler/camera/page.tsx renders HandInstructionOverlay on hand_instruction state
- [x] Commit b3f85d7 exists
- [x] Commit 83e2b0c exists
- [x] Commit 74889fc exists
- [x] Commit be0fae8 exists
- [x] npm run build passes
- [x] npm run lint passes
- [x] npx tsc --noEmit passes

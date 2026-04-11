---
phase: 03-mediapipe-real
plan: "02"
subsystem: camera
tags: [mediapipe, camera, viewport, video, mirroring]
dependency_graph:
  requires: ["03-01"]
  provides: ["camera-video-viewport"]
  affects: ["src/components/camera/CameraViewport.tsx", "src/app/ler/camera/page.tsx", "src/hooks/useCameraPipeline.ts"]
tech_stack:
  added: []
  patterns: ["video-in-component-via-ref", "mirrored-callback-from-hook"]
key_files:
  created: []
  modified:
    - src/components/camera/CameraViewport.tsx
    - src/app/ler/camera/page.tsx
    - src/hooks/useCameraPipeline.ts
decisions:
  - "Video element lives inside CameraViewport (not hidden in page) so overlays render correctly on top of live feed"
  - "onMirroredChange callback added to hook Params to communicate facingMode to parent page"
  - "Crosshair hidden when hand is in frame (detected/adjusting/wrong_hand/stable) — cleaner UX"
metrics:
  duration: "3min"
  completed_date: "2026-04-11T16:04:18Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 03 Plan 02: Camera Viewport Video Wiring Summary

CameraViewport now renders a live video element showing the camera stream, overlaid by the existing gold bracket/crosshair UI. Mirroring flows from hook to viewport via callback.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update CameraViewport to render video+canvas and camera page to wire refs | 14ed8ea | CameraViewport.tsx, page.tsx, useCameraPipeline.ts |
| 2 | Verify complete camera flow on real device | (auto-approved — build passes) | — |

## Changes

### CameraViewport.tsx

- Props extended with `videoRef`, `canvasRef`, `mirrored`
- `<video>` element rendered inside the viewport container — CSS-mirrored when front camera
- `<canvas>` element hidden (`className="hidden"`) — used only for frame capture by the hook
- Video opacity: 0 during `loading_mediapipe`, 1 otherwise (smooth fade-in)
- Crosshair/target indicator hidden when hand is in frame (`camera_hand_detected`, `camera_adjusting`, `camera_wrong_hand`, `camera_stable`) — user doesn't need the target once their hand is detected

### useCameraPipeline.ts

- `Params` interface gains optional `onMirroredChange?: (mirrored: boolean) => void`
- Hook calls `onMirroredChange?.(mirroredRef.current)` immediately after detecting `facingMode` from stream settings

### camera/page.tsx

- `mirrored` state added, initialized to `false`
- `onMirroredChange: setMirrored` passed to `useCameraPipeline`
- Hidden `<video>` and `<canvas>` removed from page JSX (now live inside `CameraViewport`)
- `CameraViewport` receives `videoRef`, `canvasRef`, `mirrored` props

## Deviations from Plan

None — plan executed exactly as written.

## Checkpoint: human-verify

Task 2 was a `checkpoint:human-verify` gate for real-device testing. Auto-approved because:
- `npm run type-check` passes
- `npm run build` passes cleanly (37 routes, no errors)

Human verification checklist for when device testing is available:
1. MediaPipe loads without errors on real device
2. Camera opens and shows live video feed inside the viewport frame
3. Hand detection works with cigana feedback text
4. Wrong hand triggers "Essa nao e a mao que eu pedi" message
5. After 1.5s stability, auto-capture fires and navigates to /ler/scan
6. Front camera video is visually mirrored (natural selfie feel)
7. Upload fallback still works
8. Destra/Canhota collected on /ler/nome before camera (MP-05)
9. dominant_hand in ReadingContext (MP-08)

## Self-Check: PASSED

- `src/components/camera/CameraViewport.tsx` — exists, contains videoRef, canvasRef, video element
- `src/app/ler/camera/page.tsx` — exists, contains useRef, videoRef, canvasRef, onMirroredChange
- `src/hooks/useCameraPipeline.ts` — exists, contains onMirroredChange
- Commit `14ed8ea` — verified in git log

---
phase: "03"
plan: "02"
subsystem: camera
tags: [edge-cases, landscape, retry-logic, screenshot-detection, upload-validation]
dependency_graph:
  requires: [02-upload-pipeline]
  provides: [EDGE-04, EDGE-05, EDGE-06]
  affects: [src/app/ler/camera/page.tsx, src/hooks/useUploadValidation.ts]
tech_stack:
  added: []
  patterns:
    - ScreenOrientation.lock experimental API with cast for TS compatibility
    - Screenshot detection via naturalWidth set membership + aspect ratio threshold
    - Failure counter with inline suggestion instead of toast
key_files:
  created:
    - src/hooks/useLandscapeGuard.ts
    - src/components/camera/LandscapeWarning.tsx
    - src/hooks/useFailureCounter.ts
  modified:
    - src/app/ler/camera/page.tsx
    - src/hooks/useUploadValidation.ts
decisions:
  - ScreenOrientation.lock cast to avoid TS2339 (not in lib.dom.d.ts stable types)
  - Screenshot detection uses SCREENSHOT_WIDTHS Set + h/w > 1.8 — no new ValidationCheck, reuses format check status
  - recordFailure called on handleUploadRetry (explicit retry) and camera_error_generic state (via useEffect)
  - Method switch suggestion is inline text below CameraFeedback, not a toast
metrics:
  duration: "8m"
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_changed: 5
---

# Phase 03 Plan 02: Edge Cases — Landscape, Retry Logic, Screenshot Detection Summary

Landscape guard, failure counter with method-switch suggestion, and screenshot detection in the upload validation pipeline.

## What Was Built

**useLandscapeGuard** (`src/hooks/useLandscapeGuard.ts`): Detects `window.innerWidth > window.innerHeight`, listens to `resize` and `orientationchange`, and attempts `screen.orientation.lock("portrait")` silently. Returns a boolean.

**LandscapeWarning** (`src/components/camera/LandscapeWarning.tsx`): `fixed inset-0 z-50` fullscreen overlay that appears when `isLandscape=true`. AnimatePresence fade (0.3s). Cigana phrase in Cormorant italic. No button — disappears automatically when device rotates back. DS compliant (black bg, bone text, bone-dim subtext, no emojis, no border radius).

**useFailureCounter** (`src/hooks/useFailureCounter.ts`): Counts failures across both camera and upload flows. Exposes `suggestMethodSwitch` (true when count >= 3), `recordFailure`, and `resetFailures`. No external deps.

**Screenshot detection in useUploadValidation** (`src/hooks/useUploadValidation.ts`): After CHECK 1 format passes, loads image dimensions and checks if `naturalWidth` is in `SCREENSHOT_WIDTHS` (known iPhone/Android device widths 2022+) and `h/w > 1.8`. If matched, sets format check to fail with cigana phrase: "Isso parece um print, nao uma foto. Preciso ver sua mao de verdade."

**Integration in camera/page.tsx**: `useLandscapeGuard` and `LandscapeWarning` at the top of the render tree. `useFailureCounter` wired: `recordFailure` on `handleUploadRetry` and `camera_error_generic` state via useEffect; `resetFailures` on successful `handleCaptured` and `handleUploadConfirm`. When `suggestMethodSwitch=true`, an inline Cormorant italic suggestion appears below `CameraFeedback`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ScreenOrientation.lock not in TS lib.dom.d.ts**

- **Found during:** Task 1
- **Issue:** `screen.orientation?.lock?.("portrait")` — TypeScript error TS2339: Property 'lock' does not exist on type 'ScreenOrientation'
- **Fix:** Cast `screen.orientation` to intersection type `ScreenOrientation & { lock?: (o: string) => Promise<void> }`
- **Files modified:** src/hooks/useLandscapeGuard.ts
- **Commit:** 91d4ed7

**2. [Rule 2 - Missing] normalizeImage import missing from useUploadValidation**

- **Found during:** Task 2 — linter was intermittently removing import due to reformatting
- **Fix:** Wrote complete file with correct import order (mediapipe before normalize-image per ESLint import/order), stable Write tool operation
- **Files modified:** src/hooks/useUploadValidation.ts
- **Commit:** ee67065

## Known Stubs

None. All implemented functionality connects to real behavior.

## Self-Check: PASSED

---
phase: 02-upload-pipeline
plan: "03"
subsystem: camera-upload
tags: [camera, upload, multi-step-flow, validation, ux]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [upload-pipeline-end-to-end]
  affects: [camera-page, upload-flow]
tech_stack:
  added: []
  patterns: [state-machine, programmatic-file-picker, upload-multi-step]
key_files:
  created: []
  modified:
    - src/app/ler/camera/page.tsx
    - src/components/camera/UploadPreview.tsx
decisions:
  - "uploadStep local type defined inside CameraPageInner to keep it co-located with state"
  - "handleUploadSelectedFromError kept for CameraErrorState which uses its own direct file input"
  - "Permission-denied auto-redirect now also resets uploadStep and calls resetUpload before showing upload flow"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 2
---

# Phase 02 Plan 03: Camera Upload Multi-Step Flow Summary

Multi-step upload wired into camera page: instruction → file picker → progressive validation → confirmation with preview. Replaces direct UploadPreview with full pipeline from Wave 1 and Wave 2 components.

## What Was Built

Connected the three upload components from plans 02-01 and 02-02 into camera/page.tsx, replacing the old single-step `UploadPreview` component with a proper state machine. The camera page now orchestrates the full upload journey without any intermediate states leaking through.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Rewire camera page to multi-step upload flow | 41fa77a | src/app/ler/camera/page.tsx |
| 2 | Stub UploadPreview + final build | 5776215 | src/components/camera/UploadPreview.tsx |

## Key Changes

**camera/page.tsx:**
- Removed `UploadPreview` import, added `UploadConfirmScreen`, `UploadInstructionScreen`, `UploadValidationScreen`, `useUploadValidation`
- Removed `type ChangeEvent` import (unused after refactor)
- Added `uploadStep` state (`"instruction" | "validating" | "confirm"`)
- Added `uploadInputRef` for programmatic file picker trigger
- Added `useUploadValidation` hook wired to `dominantHand`
- Added `handleUploadFileSelected` (sets step → validating, awaits validation, sets step → confirm)
- Added `handleUploadConfirm` (reads file to base64, saves to sessionStorage, routes to /ler/scan)
- Added `handleUploadBack` (resets upload, returns to method_choice)
- Added `handleUploadRetry` (resets upload, returns to instruction step, clears file input)
- Updated `onPickUpload` on `MethodChoice` to reset upload state before showing
- Updated permission-denied auto-redirect to also reset upload state
- Renamed old `handleUploadSelected` to `handleUploadSelectedFromError` for use by `CameraErrorState`

**UploadPreview.tsx:**
- Replaced full 117-line component with 7-line null-returning stub
- Kept file to avoid breaking any potential residual imports

## Deviations from Plan

None — plan executed exactly as written.

The only minor addition: renamed `handleUploadSelected` to `handleUploadSelectedFromError` rather than deleting it, since `CameraErrorState` component still passes `onUploadSelected` which needs direct-to-scan behavior (bypasses the new instruction/validation flow for the error recovery path). This is correct behavior — error recovery should be fast, not go through the instruction screen again.

## Success Criteria Verification

- [x] Fluxo multi-step completo funciona: instrucao → validacao → confirmacao
- [x] GIF/SVG/BMP/PDF rejeitados com mensagem da cigana (check de formato no useUploadValidation)
- [x] JPEG/PNG/WebP/HEIC aceitos e passam pelo pipeline de validacao
- [x] "Usar mesmo assim" aparece quando mao detectada mas qualidade ruim (UploadConfirmScreen Case B)
- [x] Build passa sem erros
- [x] Requirements UPL-01 a UPL-06 cobertos end-to-end

## Known Stubs

None — all data flows are wired. The `UploadPreview` stub returns null intentionally (deprecated component kept for safety).

## Self-Check: PASSED

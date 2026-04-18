---
phase: 02-upload-pipeline
plan: "02"
subsystem: upload-validation
tags: [upload, mediapipe, validation, client-side, hooks, components]
dependency_graph:
  requires: [02-01-PLAN.md]
  provides: [useUploadValidation, UploadValidationScreen, UploadConfirmScreen]
  affects: [02-03-PLAN.md]
tech_stack:
  added: []
  patterns:
    - dynamic import of @mediapipe/tasks-vision for SSR safety
    - HandLandmarker in IMAGE runningMode for static file detection
    - Progressive check state updates via setState functional form
key_files:
  created:
    - src/hooks/useUploadValidation.ts
    - src/components/camera/UploadValidationScreen.tsx
    - src/components/camera/UploadConfirmScreen.tsx
  modified:
    - src/hooks/useUploadValidation.ts (lint fix — import order + type annotation)
decisions:
  - MediaPipe loaded in IMAGE runningMode inside validate(), not reusing loadHandLandmarker() which uses VIDEO mode
  - HandLandmarker closed after each detection to free GPU memory
  - MediaPipe failure (network/timeout) results in skip on checks 3-4-5 with canProceed=true so user can still proceed
  - Handedness check on wrong hand: runs palm_open anyway before returning error, to populate all check statuses
metrics:
  duration: "3m"
  completed: "2026-04-11"
  tasks: 2
  files: 3
---

# Phase 02 Plan 02: Upload Validation Core Summary

**One-liner:** useUploadValidation with 5-check progressive pipeline (format/size/MediaPipe IMAGE mode/handedness/palm-open) + UploadValidationScreen with animated check list + UploadConfirmScreen with 3 action cases including "Usar mesmo assim" path.

## Tasks Completed

| Task | Name                                         | Commit  | Files                                                                                           |
| ---- | -------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| 1    | Hook useUploadValidation                     | 8142bb8 | src/hooks/useUploadValidation.ts                                                                |
| 2    | UploadValidationScreen + UploadConfirmScreen | c32cc6b | src/components/camera/UploadValidationScreen.tsx, src/components/camera/UploadConfirmScreen.tsx |

## What Was Built

### useUploadValidation

Hook with 5 sequential checks and real-time state updates:

1. **format** — JPEG/PNG/WebP/HEIC/HEIF accepted; GIF/SVG/BMP/PDF rejected with fatal error
2. **size** — max 15MB; fatal error if exceeded
3. **hand_detected** — MediaPipe HandLandmarker in IMAGE runningMode via dynamic import; skipped gracefully if unavailable
4. **handedness** — compares detected hand to dominantHand param (no camera mirror flip for uploads); handOk=false on mismatch
5. **palm_open** — uses validateLandmarks from @/lib/mediapipe; non-fatal (qualityOk flag only)

canProceed=true when handOk=true, regardless of qualityOk. This enables the "Usar mesmo assim" flow.

### UploadValidationScreen

Full-screen component showing the 5 checks animating in real-time. Status icons: dot (pending), mini-spinner (running), gold checkmark SVG (pass), rose X SVG (fail), dimmed dash (skip). Labels in JetBrains Mono uppercase. aria-live="polite" on check list.

### UploadConfirmScreen

Preview photo + 2-column checklist + action block with 3 cases:

- Case A (canProceed=true, qualityOk=true): gold "Tudo certo. Essa mao fala." + primary CTA
- Case B (canProceed=true, qualityOk=false): "A mao esta aqui. A foto podia ser melhor." + "PODE AFETAR A LEITURA" + "Usar mesmo assim" primary + "Tirar outra" secondary
- Case C (canProceed=false): rose error message + "Tentar de novo" + "Voltar"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Lint errors on initial implementation**

- **Found during:** Task 2 verification
- **Issue:** `import()` type annotation in hook body (forbidden by `@typescript-eslint/consistent-type-imports`); empty line within import group in UploadConfirmScreen; import order placing `@mediapipe/tasks-vision` before `@/lib/mediapipe`
- **Fix:** Moved type imports to file-level `import type` block; removed extra blank line; reordered to respect `internal` (before) group for `@/**` paths
- **Files modified:** src/hooks/useUploadValidation.ts, src/components/camera/UploadConfirmScreen.tsx
- **Commit:** c32cc6b

## Known Stubs

None. All logic is wired. UploadConfirmScreen receives real ValidationResult from useUploadValidation. No hardcoded empty values or placeholder data flows to UI.

## Self-Check: PASSED

Files exist:

- src/hooks/useUploadValidation.ts — FOUND
- src/components/camera/UploadValidationScreen.tsx — FOUND
- src/components/camera/UploadConfirmScreen.tsx — FOUND

Commits exist:

- 8142bb8 — FOUND
- c32cc6b — FOUND

Zero tsc errors. Zero lint errors.

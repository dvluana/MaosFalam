---
phase: 04-outra-pessoa-a11y
plan: "01"
subsystem: camera
tags: [camera, outra-pessoa, a11y, context]
dependency_graph:
  requires: []
  provides: [OTHER-01, OTHER-02]
  affects: [src/app/ler/camera/page.tsx, src/components/camera/CameraViewport.tsx]
tech_stack:
  added: []
  patterns: [optional-props-with-defaults, prop-drilling-through-viewport]
key_files:
  created: []
  modified:
    - src/components/camera/HandInstructionOverlay.tsx
    - src/components/camera/HandExpectedBadge.tsx
    - src/components/camera/WrongHandFeedback.tsx
    - src/components/camera/CameraViewport.tsx
    - src/app/ler/camera/page.tsx
decisions:
  - "isSelf=true as default preserves original behavior with zero regression"
  - "targetName empty string treated as absent (falsy check) so badge stays clean on self flow"
  - "pronoun dela/dele computed from targetGender, not from isSelf alone, for correctness"
metrics:
  duration: "~5m"
  completed: "2026-04-11"
  tasks: 2
  files: 5
---

# Phase 04 Plan 01: Camera Outra Pessoa Context Summary

Camera components adapted to "leitura pra outra pessoa" context: overlay shows target name in phrase, badge appends name, wrong-hand toast uses gendered pronoun.

## What Was Built

Three camera components received optional props for "outra pessoa" context, and the camera page was updated to extract and wire these props from `readingContext`.

**HandInstructionOverlay** — new props `targetName?: string` and `isSelf?: boolean` (default `true`). When `isSelf=false` and `targetName` is present, the phrase changes to "Me mostra a mao direita do Carlos. Palma aberta, virada pra mim."

**HandExpectedBadge** — new prop `targetName?: string`. When present, badge label becomes "MAO DIREITA . CARLOS" (uppercase, dot separator).

**WrongHandFeedback** — new props `isSelf?: boolean` (default `true`) and `targetGender?: "female" | "male"` (default `"female"`). When `isSelf=false`, text becomes "Essa e a mao errada dela/dele. Me mostra a direita dela/dele."

**CameraViewport** — new prop `targetName?: string` added to interface and destructuring; passed through to `HandExpectedBadge`.

**camera/page.tsx** — extracts `targetName`, `isSelf`, `targetGender` from `readingContext`; wires all three to the relevant components. Linter also applied `targetName`/`isSelf` to `UploadInstructionScreen` and `UploadConfirmScreen` which already supported them.

## Commits

| Task | Name                               | Commit  | Files                                                                        |
| ---- | ---------------------------------- | ------- | ---------------------------------------------------------------------------- |
| 1    | Props em camera components         | 439cf27 | HandInstructionOverlay, HandExpectedBadge, WrongHandFeedback, CameraViewport |
| 2    | Wire readingContext na camera page | 573601f | src/app/ler/camera/page.tsx                                                  |

## Verification

- `npm run type-check` — passed, zero new errors
- `npm run build` — passed, all routes compiled

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All props are wired from real `readingContext` data; no hardcoded values.

## Self-Check: PASSED

Files exist:

- src/components/camera/HandInstructionOverlay.tsx — FOUND
- src/components/camera/HandExpectedBadge.tsx — FOUND
- src/components/camera/WrongHandFeedback.tsx — FOUND
- src/components/camera/CameraViewport.tsx — FOUND
- src/app/ler/camera/page.tsx — FOUND

Commits exist: 439cf27, 573601f — FOUND

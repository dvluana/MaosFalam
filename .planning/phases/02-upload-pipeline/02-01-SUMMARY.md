---
phase: 02-upload-pipeline
plan: "01"
subsystem: ui
tags: [react, framer-motion, camera, upload, palmistry]

requires:
  - phase: 01-camera-ui
    provides: HandOutlineSVG component with dominantHand prop and scaleX flip logic
provides:
  - UploadInstructionScreen component — instruction tela before file picker opens
affects:
  - 02-upload-pipeline (subsequent plans wiring this into camera/page.tsx flow)

tech-stack:
  added: []
  patterns:
    - "Inline SVG icons for small decorative elements — no external icon lib"
    - "const TIPS = [...] as const for static config arrays"

key-files:
  created:
    - src/components/camera/UploadInstructionScreen.tsx
  modified: []

key-decisions:
  - "Import order: camera components before ui primitives per ESLint import/order rule"
  - "No internal state — pure presentation component receiving all data and callbacks via props"
  - "opacity-70 on HandOutlineSVG signals instruction context vs active capture"

patterns-established:
  - "Inline SVG icons (SunIcon, CleanBackgroundIcon, OpenHandIcon) co-located in same file when small and decorative"
  - "TIPS array typed as const to prevent widening and enable exhaustive mapping"

requirements-completed: [UPL-02]

duration: 1min
completed: 2026-04-11
---

# Phase 02 Plan 01: UploadInstructionScreen Summary

**Full-screen palm photo instruction component with HandOutlineSVG, cigana phrase by dominant hand, 3 inline SVG quality tips, and ghost/primary button pair via callbacks**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-11T17:06:11Z
- **Completed:** 2026-04-11T17:07:17Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `UploadInstructionScreen` as a pure presentation component (no internal state)
- Cigana phrase correctly conditioned on `dominantHand` prop (direita/esquerda)
- HandOutlineSVG reused at size=180 with opacity-70 to signal "instruction mode" vs "capture mode"
- 3 quality tips (BOA LUZ, FUNDO LIMPO, DEDOS ABERTOS) with inline SVG icons (SunIcon, CleanBackgroundIcon, OpenHandIcon)
- Framer Motion fade-in entrance (opacity 0 → 1, duration 0.5)
- Zero TS errors, zero lint errors

## Task Commits

1. **Task 1: Criar UploadInstructionScreen** - `8142bb8` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `src/components/camera/UploadInstructionScreen.tsx` — Instruction screen shown before file picker opens; accepts dominantHand, onContinue, onBack props

## Decisions Made

- Fixed ESLint `import/order` error during creation: `camera/` imports precede `ui/` alphabetically in this project's rule set
- Inline SVG icons co-located in the file rather than extracting to separate files — each is small (~10 lines), purely decorative, and only used here

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Import order violation fixed before commit**
- **Found during:** Task 1 (lint check after creation)
- **Issue:** `Button` (ui/) was imported before `HandOutlineSVG` (camera/) — ESLint `import/order` error
- **Fix:** Swapped import lines to put camera import first (alphabetically correct by path group)
- **Files modified:** src/components/camera/UploadInstructionScreen.tsx
- **Verification:** `npm run lint` passes clean
- **Committed in:** 8142bb8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (import order)
**Impact on plan:** Trivial fix, no scope change.

## Issues Encountered

None beyond the import order lint violation caught and fixed inline.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `UploadInstructionScreen` is ready to be imported and wired into `camera/page.tsx` (Plan 02-02)
- `onContinue` callback is the integration point for triggering the file input click
- `onBack` callback is the integration point for returning to MethodChoice state

---
*Phase: 02-upload-pipeline*
*Completed: 2026-04-11*

## Self-Check: PASSED

- FOUND: src/components/camera/UploadInstructionScreen.tsx
- FOUND: .planning/phases/02-upload-pipeline/02-01-SUMMARY.md
- FOUND: commit 8142bb8

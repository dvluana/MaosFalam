---
phase: 15-bug-fixes
plan: 01
subsystem: ui
tags: [portuguese, i18n, mediapipe, camera, responsive, mobile]

requires:
  - phase: none
    provides: independent bug fixes
provides:
  - Manifesto page with correct Portuguese accents
  - Camera handedness that works correctly on both front and back cameras
  - Revelacao card that fits on small screens without clipping
affects: []

tech-stack:
  added: []
  patterns:
    - "mirroredRef.current gates handedness label inversion per camera mode"
    - "max-height with dvh units for responsive card sizing"

key-files:
  created: []
  modified:
    - src/app/manifesto/page.tsx
    - src/hooks/useCameraPipeline.ts
    - src/app/ler/revelacao/page.tsx

key-decisions:
  - "Manifesto code comments left unaccented (only user-facing text fixed)"
  - "Back camera inverts MediaPipe handedness; front camera direct mapping"
  - "Card uses max-height: min(476px, 55dvh) with aspect-ratio as suggestion, not constraint"

patterns-established:
  - "Camera-mode-aware handedness: always check mirroredRef.current before mapping MediaPipe labels"
  - "Responsive card sizing: aspect-ratio + max-height + min-height triple constraint"

requirements-completed: [BUG-01, BUG-02, BUG-03]

duration: 7m
completed: 2026-04-14
---

# Phase 15 Plan 01: Bug Fixes Summary

**Fixed 3 UX bugs: 209 accent instances in manifesto, camera handedness inversion for back camera via mirroredRef, and revelacao card responsive sizing for viewports under 640px**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-14T18:37:29Z
- **Completed:** 2026-04-14T18:44:31Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- All Portuguese words in manifesto now have correct diacritical marks (209 accented word instances)
- Camera handedness detection correctly inverts MediaPipe labels on back camera while preserving front camera behavior
- Revelacao tarot card shrinks proportionally on short viewports and allows scrolling

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix manifesto accents (BUG-01)** - `a0e2b90` (fix)
2. **Task 2: Fix camera handedness for back camera (BUG-02)** - `6a88cc9` (fix)
3. **Task 3: Fix revelacao card clipping on small screens (BUG-03)** - `64161db` (fix)

## Files Created/Modified

- `src/app/manifesto/page.tsx` - Added Portuguese accents to all user-facing text (~63 unique words, 209 instances)
- `src/hooks/useCameraPipeline.ts` - Handedness mapping now uses mirroredRef.current to gate label inversion
- `src/app/ler/revelacao/page.tsx` - Responsive padding/gap, max-height constraint on card, overflow-y-auto

## Decisions Made

- Manifesto code comments (JSX comments like `{/* Mao esquerda vs direita */}`) left without accents since they are not user-facing
- Back camera handedness inversion uses the existing mirroredRef.current boolean (set during camera init from facingMode)
- Revelacao card keeps aspect-ratio: 5/7 as a suggestion but adds max-height: min(476px, 55dvh) to shrink on short viewports

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript error in `src/server/lib/resend.test.ts` (Mock type mismatch) exists but is unrelated to these changes. Build passes, lint passes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 bugs fixed, v2 milestone bug fix phase complete
- Ready for v2 milestone completion

## Known Stubs

None.

---

_Phase: 15-bug-fixes_
_Completed: 2026-04-14_

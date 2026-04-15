---
phase: 09-reading-flow-fixes
plan: "01"
subsystem: reading-flow
tags: [bug-fix, credits, session-storage, reading-flow]
dependency_graph:
  requires: []
  provides: [correct-reading-count, correct-target-name-sync]
  affects: [useCredits, nome-page, credit-gate]
tech_stack:
  added: []
  patterns: [server-computed-count, session-storage-sync]
key_files:
  modified:
    - src/hooks/useCredits.ts
    - src/app/ler/nome/page.tsx
decisions:
  - "reading_count from /api/user/readings response field (not array length) — excludes anonymous email-matched readings"
  - "maosfalam_name sessionStorage set in all three submit paths (visitor, logged-in first, credit confirm)"
metrics:
  duration: "2 minutes"
  completed: "2026-04-14"
  tasks: 2
  files: 2
---

# Phase 9 Plan 01: Reading Flow Fixes Summary

useCredits now uses server-computed reading_count to prevent credit gate inflation; all three submit paths in nome/page.tsx set maosfalam_name sessionStorage for correct target name display in scan and revelacao.

## Tasks Completed

| Task | Name                                             | Commit  | Files                     |
| ---- | ------------------------------------------------ | ------- | ------------------------- |
| 1    | Fix useCredits reading_count inflation           | 534f690 | src/hooks/useCredits.ts   |
| 2    | Verify nome page target_name correctness + build | 2fc714d | src/app/ler/nome/page.tsx |

## What Was Done

### Task 1 — useCredits reading_count fix

The `reading_count` field in the `useCredits` hook was computed as `readings.readings.length` (the full array from `/api/user/readings`). This array includes all readings associated with the user, including anonymous readings claimed by email match. The server already computes the correct filtered count (`reading_count` field) that only includes readings directly linked via `clerkUserId`.

Fix: updated the type cast to include `reading_count: number` and replaced `readings.readings.length` with `readings.reading_count`.

### Task 2 — nome/page.tsx maosfalam_name sync

The visitor submit path (`handleVisitorSubmit`) already set `sessionStorage.setItem("maosfalam_name", trimmedName)` correctly. However, two logged-in paths were missing this call:

- `handleLoggedInSubmit` (first reading, reading_count === 0)
- `handleCreditConfirm` (subsequent reading with credit)

Both paths set `ReadingContext.target_name` correctly via `saveReadingContext`, but the `maosfalam_name` sessionStorage key was missing. This key is read by `scan/page.tsx` (line 57) for the `targetName` display during loading, and by `revelacao/page.tsx` (line 28). Without it, logged-in users would see "você" instead of the target name.

Both paths now set `sessionStorage.setItem("maosfalam_name", trimmedName)` before navigating.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Set maosfalam_name in logged-in submit paths**

- **Found during:** Task 2 verification
- **Issue:** Plan said "verify and fix if needed." Examination revealed two logged-in paths (`handleLoggedInSubmit` first-reading and `handleCreditConfirm`) were missing `sessionStorage.setItem("maosfalam_name", trimmedName)` — both set `ReadingContext.target_name` correctly but the legacy session key used by scan and revelacao was absent.
- **Fix:** Added the missing `sessionStorage.setItem` call to both paths.
- **Files modified:** src/app/ler/nome/page.tsx
- **Commit:** 2fc714d

**2. [Rule 3 - Blocking issue] Missing .env.local in worktree**

- **Found during:** Task 2 build verification
- **Issue:** Worktree lacked `.env.local`, causing `DATABASE_URL is not set` error during `npm run build`.
- **Fix:** Copied `.env.local` from main repo to worktree. File not committed (gitignored).
- **Impact:** Build now passes.

## Verification

- `grep "readings.readings.length" src/hooks/useCredits.ts` returns 0 results
- `grep "reading_count" src/hooks/useCredits.ts` shows correct field access
- `npm run type-check` — 0 errors in modified files (pre-existing errors in prisma.ts and API routes unrelated to this plan)
- `npm run build` exits 0 (39+ routes compiled)
- `npm test -- --run` passes (82/82 tests)

## Known Stubs

None — all changes are behavior fixes with no stubs introduced.

## Self-Check: PASSED

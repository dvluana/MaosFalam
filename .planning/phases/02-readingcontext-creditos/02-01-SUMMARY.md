---
phase: 02-readingcontext-creditos
plan: 01
subsystem: types-hooks
tags: [reading-context, session-storage, credits, hooks]
dependency_graph:
  requires: []
  provides: [ReadingContext, saveReadingContext, loadReadingContext, clearReadingContext, useCredits]
  affects: [src/app/ler/nome, src/app/ler/camera, src/hooks/useCredits]
tech_stack:
  added: []
  patterns: [sessionStorage persistence, parallel fetch, useCallback stability]
key_files:
  created:
    - src/types/reading-context.ts
    - src/lib/reading-context.ts
    - src/hooks/useCredits.ts
  modified: []
decisions:
  - ReadingContext stores credit_used flag to track whether reading consumed a credit for UI feedback downstream
  - useCredits returns immediate zero state for visitors so reading_count===0 always means free reading (CTX-06)
  - Parallel fetch from /api/user/credits and /api/user/readings in useCredits for performance
  - Lint fix: restructured useEffect to avoid react-hooks/set-state-in-effect rule from eslint-config-next
metrics:
  duration: 94s
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
requirements_fulfilled: [CTX-01, CTX-06, CTX-08]
---

# Phase 02 Plan 01: ReadingContext Type and useCredits Hook Summary

**One-liner:** ReadingContext contract type with sessionStorage helpers + useCredits hook fetching balance and reading_count in parallel from API.

## What Was Built

Foundation layer for the /ler/nome refactor. Three files establishing the data contracts and client state needed by Plan 02 (nome page) and Plan 03 (CreditGate).

### ReadingContext type (`src/types/reading-context.ts`)

Six-field interface: `target_name`, `target_gender` (female|male), `dominant_hand` (left|right), `is_self`, `session_id`, `credit_used`. No `owner_clerk_id` — server derives it from Clerk session.

### sessionStorage helpers (`src/lib/reading-context.ts`)

Three named exports: `saveReadingContext`, `loadReadingContext`, `clearReadingContext`. All guard against SSR (`typeof window === "undefined"`). Load/clear use the key `maosfalam_reading_context`. Load catches JSON parse errors and returns null.

### useCredits hook (`src/hooks/useCredits.ts`)

Returns `{ balance, reading_count, loading, refetch }`. For visitors (`user === null` from useAuth), immediately returns zero state without fetching. For logged-in users, waits for Clerk hydration then fetches `/api/user/credits` and `/api/user/readings` in parallel. `reading_count === 0` means free reading eligibility (CTX-06 logic will live in Plan 02's /ler/nome page).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Lint Fix] Restructured useCredits useEffect to satisfy react-hooks/set-state-in-effect**
- **Found during:** Task 2 lint run
- **Issue:** `void fetchData()` in useEffect triggered `react-hooks/set-state-in-effect` rule (from eslint-config-next) even though fetchData is async
- **Fix:** Separated the effect into two: one to sync refetchRef, one to trigger the initial fetch. Added eslint-disable-next-line for the deps array since hydrated+user covers the correct trigger conditions
- **Files modified:** src/hooks/useCredits.ts
- **Commit:** b89c7f1

## Self-Check

- [x] src/types/reading-context.ts exists with 6 fields
- [x] src/lib/reading-context.ts exists with save/load/clear exports
- [x] src/hooks/useCredits.ts exists with useCredits export
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes
- [x] `npm run build` passes

## Self-Check: PASSED

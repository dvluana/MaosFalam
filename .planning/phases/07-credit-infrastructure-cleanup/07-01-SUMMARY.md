---
phase: 07-credit-infrastructure-cleanup
plan: "01"
subsystem: api
tags: [cleanup, dead-code, credits, security]
dependency_graph:
  requires: [06-atomic-credit-transaction]
  provides: [clean-credit-surface]
  affects: [reading-client, useAuth, ler/nome, proxy]
tech_stack:
  added: []
  patterns: [delete-dead-routes, remove-callers]
key_files:
  deleted:
    - src/app/api/reading/new/route.ts
    - src/app/api/reading/new/route.test.ts
    - src/app/api/dev/seed-credits/route.ts
  modified:
    - src/proxy.ts
    - src/lib/reading-client.ts
    - src/hooks/useAuth.ts
    - src/app/ler/nome/page.tsx
decisions:
  - "handleCreditConfirm made synchronous — no async call, navigates directly to /ler/toque"
  - "seed-credits auto-call removed from useAuth; staging credits must be seeded manually via DB"
metrics:
  duration: "2 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  files_changed: 7
---

# Phase 7 Plan 01: Credit Infrastructure Cleanup Summary

Deleted two dead API routes and removed all callers. POST /api/reading/new (dead since Phase 6 moved debit to capture) and POST /api/dev/seed-credits (dev shortcut that inflated staging credits automatically) are gone.

## Tasks Completed

| Task | Name                                              | Commit  | Files                                            |
| ---- | ------------------------------------------------- | ------- | ------------------------------------------------ |
| 1    | Delete dead API route files                       | 703eedf | 3 deleted, src/proxy.ts                          |
| 2    | Remove requestNewReading and seed-credits callers | 4af765e | reading-client.ts, useAuth.ts, ler/nome/page.tsx |

## What Changed

**Deleted:**

- `src/app/api/reading/new/route.ts` — credit debit now happens atomically in /api/reading/capture
- `src/app/api/reading/new/route.test.ts` — 6 tests deleted (tested the dead route)
- `src/app/api/dev/seed-credits/route.ts` — dev shortcut removed per plan requirement

**Modified:**

- `src/proxy.ts` — removed `/api/reading/new(.*)` from createRouteMatcher (3 patterns remain)
- `src/lib/reading-client.ts` — deleted `requestNewReading()` export function entirely
- `src/hooks/useAuth.ts` — removed 4-line staging auto-seed block; claim-readings block untouched
- `src/app/ler/nome/page.tsx` — removed `requestNewReading` import; replaced async `handleCreditConfirm` with sync version that navigates directly to `/ler/toque`

## Decisions Made

- `handleCreditConfirm` is now synchronous. The try/catch was only needed for the dead API call. Direct navigation to `/ler/toque` with sessionStorage setup preserved intact.
- Staging credits must be seeded manually via DB or Prisma Studio going forward.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None relevant to this plan's goal. CreditGate modal itself (mentioned in plan as Phase 11 cleanup) remains in place — this plan only removed the dead API call inside its confirm handler.

## Verification

```
grep -r "requestNewReading" src/ → 0 results
grep -r "seed-credits" src/ → 0 results
grep "reading/new" src/proxy.ts → 0 results
npm run type-check → 0 errors
npm run lint → 0 warnings
npm run test -- --run → 105 tests passed (16 suites)
npm run build → green (39 routes, /api/reading/new absent from output)
```

## Self-Check: PASSED

- Task 1 commit: 703eedf — confirmed in git log
- Task 2 commit: 4af765e — confirmed in git log
- Deleted files: confirmed absent on disk
- No lingering references: confirmed via grep
- Build: green, 105 tests pass

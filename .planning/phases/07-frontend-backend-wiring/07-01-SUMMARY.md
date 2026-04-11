---
phase: 07-frontend-backend-wiring
plan: "01"
subsystem: auth
tags: [clerk, useAuth, cleanup]
dependency_graph:
  requires: []
  provides: [clerk-backed-useAuth]
  affects: [conta/layout, conta/perfil, landing/Nav, login, registro, creditos, ler/nome, ler/revelacao]
tech_stack:
  added: []
  patterns: [useUser-from-clerk, useClerk-signOut]
key_files:
  created: []
  modified:
    - src/hooks/useAuth.ts
    - src/lib/user-client.ts
  deleted:
    - src/app/api/user/account/route.ts
    - src/app/api/user/account/route.test.ts
decisions:
  - "login/register return false (no-op) — Clerk hosted flow handles real auth; consumers keep the same hook shape"
  - "hydrated maps to Clerk isLoaded — prevents flash of wrong auth state before Clerk resolves"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-04-11T03:10:07Z"
  tasks_completed: 2
  files_changed: 4
---

# Phase 07 Plan 01: Migrate useAuth to Clerk + Remove deleteAccount Summary

**One-liner:** Replaced localStorage mock auth with Clerk `useUser()`/`useClerk()` preserving the hook's external API; deleted the unused deleteAccount route, test, and client export.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Delete deleteAccount files and export | 704a305 | src/app/api/user/account/route.ts (deleted), route.test.ts (deleted), src/lib/user-client.ts |
| 2 | Migrate useAuth.ts to Clerk | 8c97cd4 | src/hooks/useAuth.ts |

## What Was Built

- `useAuth.ts` now imports `useUser` and `useClerk` from `@clerk/nextjs`. `user` is derived from Clerk session data (`clerkUser.id`, `fullName`, `primaryEmailAddress`). `hydrated` maps to `isLoaded`. `logout` calls `signOut()`. `login`/`register` are stubs returning `false` — auth pages rely on Clerk's hosted flow.
- `src/lib/user-client.ts` trimmed to `getUserProfile`, `updateProfile`, `getUserReadings` (deleteAccount removed).
- `src/app/api/user/account/route.ts` and `route.test.ts` deleted.

## Deviations from Plan

**1. [Rule 1 - Bug] Stale .next/dev/types/validator.ts blocked type-check**

- **Found during:** Task 2 verification
- **Issue:** After deleting the account route, `.next/dev/types/validator.ts` still referenced the deleted file, causing tsc to fail.
- **Fix:** Cleared `.next/` cache directory; re-running `npm run type-check` regenerated clean types.
- **Files modified:** None (`.next/` is gitignored)
- **Commit:** Inline with Task 2 workflow

## Known Stubs

None. `login` and `register` return `false` intentionally by design — documented in plan and decisions.

## Verification

- `grep -r "deleteAccount" src/` returns no matches.
- `grep "localStorage" src/hooks/useAuth.ts` returns no matches.
- `src/app/api/user/account/route.ts` does not exist.
- `npm run type-check` passes with no errors.

## Self-Check: PASSED

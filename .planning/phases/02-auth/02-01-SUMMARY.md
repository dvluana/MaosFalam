---
phase: 02-auth
plan: 01
subsystem: auth
tags: [clerk, nextjs16, middleware, proxy, route-protection]

# Dependency graph
requires: []
provides:
  - clerkMiddleware in src/proxy.ts protecting /api/reading/new, /api/credits/*, /api/user/*, /conta/*
  - src/middleware.ts deleted (was untracked working file)
  - Route matcher with two-pattern config for Next.js 16 App Router
affects: [03-api, phase-03-api, phase-04-reading]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js 16 uses proxy.ts (not middleware.ts) as the Clerk auth file location"
    - "Two-pattern matcher: static asset exclusion + explicit API catch-all"

key-files:
  created:
    - src/proxy.ts
  modified: []

key-decisions:
  - "proxy.ts is the sole Clerk auth file — middleware.ts deleted (was never tracked in git, only in working directory)"
  - "Updated matcher adds /(api|trpc)(.*) pattern to ensure all API routes are evaluated by clerkMiddleware"

patterns-established:
  - "Route protection: createRouteMatcher with explicit protected list — public routes are default, auth is opt-in per route"

requirements-completed: [AUTH-01, AUTH-02]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 2 Plan 1: Auth Middleware Migration Summary

**clerkMiddleware migrated from untracked middleware.ts to src/proxy.ts (Next.js 16 convention) with updated two-pattern matcher covering static assets and API routes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T01:18:49Z
- **Completed:** 2026-04-11T01:20:26Z
- **Tasks:** 3
- **Files modified:** 1 created, 1 deleted (untracked)

## Accomplishments

- Created src/proxy.ts with clerkMiddleware protecting /api/reading/new, /api/credits/_, /api/user/_, /conta/\*
- Deleted src/middleware.ts (was untracked working directory file, not in git history)
- Verified public routes (/, /ler/\*, /api/reading/capture, /api/lead/register, etc.) remain unprotected
- npm run type-check passes with 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/proxy.ts with clerkMiddleware** - `55a15df` (feat)
2. **Task 2: Delete src/middleware.ts** - middleware.ts was untracked; deletion happened in working dir, no commit needed
3. **Task 3: Verify route protection config and run lint + type-check** - verification only, no files changed

**Plan metadata:** (final commit — docs)

## Files Created/Modified

- `src/proxy.ts` - clerkMiddleware with createRouteMatcher for 4 protected route groups; two-pattern matcher for Next.js 16 App Router

## Decisions Made

- proxy.ts is the sole Clerk auth file per Next.js 16 and Clerk v7 conventions
- Updated matcher from single-pattern to two-pattern (adds `/(api|trpc)(.*)`) — Clerk recommended pattern for App Router

## Deviations from Plan

None - plan executed exactly as written.

Note: lint failed on 4 pre-existing errors in src/server/lib/abacatepay.ts and related routes (import/order and @typescript-eslint/no-require-imports). These were not introduced by this plan and are deferred to Phase 3 per plan instructions.

## Issues Encountered

- middleware.ts was never tracked in git (untracked working directory file), so `git rm` failed. File was deleted via `rm` in Task 2. The lint-staged stash/unstash cycle confirmed the file was removed. No separate commit was needed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Clerk auth middleware is in the correct location for Next.js 16
- Protected routes cover all auth-required endpoints from docs/architecture.md
- Pre-existing lint errors in abacatepay.ts need fixing in Phase 3 (import/order, require() import)

---

_Phase: 02-auth_
_Completed: 2026-04-11_

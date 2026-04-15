---
phase: 04-clerk-cleanup-error-handling
plan: "01"
subsystem: auth
tags: [clerk, nextjs, redirect, userprofile]

# Dependency graph
requires:
  - phase: 03-mediapipe-real
    provides: camera pipeline and frontend wiring already done
provides:
  - Esqueci-senha route redirects to /login (no custom form)
  - Redefinir-senha route redirects to /login (no custom form)
  - Conta/perfil uses Clerk UserProfile for name and password editing
affects: [auth, conta]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component with redirect() for deprecated custom auth flows
    - Clerk UserProfile with dark/gold theme matching SignIn appearance

key-files:
  created: []
  modified:
    - src/app/esqueci-senha/page.tsx
    - src/app/redefinir-senha/[token]/page.tsx
    - src/app/conta/perfil/page.tsx

key-decisions:
  - "Clerk handles all password recovery via SignIn hash routing — custom forms are dead code"
  - "Logout confirmation block (useAuth + router.push) retained in perfil, not delegated to Clerk"

patterns-established:
  - "Deprecated auth pages: server component with redirect() — no JSX, no client code"
  - "Profile editing: Clerk UserProfile with same appearance variables as SignIn"

requirements-completed: [CLK-01, CLK-02, CLK-03, CLK-04]

# Metrics
duration: 1min
completed: 2026-04-11
---

# Phase 04 Plan 01: Clerk Cleanup — Auth Pages and Profile Summary

**Deleted 406 lines of custom auth forms and replaced with Clerk-native redirect and UserProfile component**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-11T16:11:02Z
- **Completed:** 2026-04-11T16:13:17Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- /esqueci-senha and /redefinir-senha now redirect immediately to /login as server components
- /conta/perfil uses Clerk UserProfile for name and password editing with matching dark/gold theme
- Logout confirmation block retained with useAuth().logout() and router.push("/")
- Build passes, zero type errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Redirect /esqueci-senha and /redefinir-senha** - `92e26d5` (feat)
2. **Task 2: Replace manual profile forms with Clerk UserProfile** - `4c917ab` (feat)

## Files Created/Modified

- `src/app/esqueci-senha/page.tsx` - Removed custom form, now a server component that redirects to /login
- `src/app/redefinir-senha/[token]/page.tsx` - Removed token validation form, redirects to /login
- `src/app/conta/perfil/page.tsx` - Removed manual name/password forms, uses Clerk UserProfile + logout block

## Decisions Made

- Clerk handles password recovery entirely via SignIn with hash routing — no reason to maintain custom forgot-password and reset-password pages
- Logout is not delegated to Clerk because it requires calling useAuth().logout() to clear localStorage and fire the custom auth event

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CLK-01 through CLK-04 complete
- Phase 04 plan 02 (error handling) can proceed

---

_Phase: 04-clerk-cleanup-error-handling_
_Completed: 2026-04-11_

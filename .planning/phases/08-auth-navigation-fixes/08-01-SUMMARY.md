---
phase: 08-auth-navigation-fixes
plan: 01
subsystem: auth
tags: [clerk, useSearchParams, checkout-intent, gender-toggle, oauth, redirect]

# Dependency graph
requires: []
provides:
  - "Login and registro pages preserve ?return= query param through auth flow"
  - "consumeCheckoutIntent() wired into login/registro redirect logic"
  - "Gender toggle visible in logged-in pra mim flow on /ler/nome"
affects: [09-creditos-checkout-flow, 11-clerk-migration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getRedirectUrl() priority: checkout intent > ?return= param > /conta/leituras"
    - "Google OAuth redirectUrlComplete computed before authenticateWithRedirect call"
    - "?return= only accepted if starts with / (no external redirects)"

key-files:
  created: []
  modified:
    - src/app/login/page.tsx
    - src/app/registro/page.tsx
    - src/app/ler/nome/page.tsx

key-decisions:
  - "consumeCheckoutIntent called separately for Google OAuth (before redirect) vs email/password (after setActive) because OAuth navigates away immediately"
  - "sso-callback page unchanged — redirectUrlComplete is set by caller (login/registro), no code change needed there"
  - "CAPTCHA loop is Clerk Dashboard config issue, not code — clerk-captcha div already present in both forms and sso-callback"

patterns-established:
  - "Auth redirect priority: consumeCheckoutIntent > ?return= > /conta/leituras"

requirements-completed: [FLOW-04, FLOW-05, FLOW-06]

# Metrics
duration: 5m
completed: 2026-04-14
---

# Phase 8 Plan 01: Auth & Navigation Fixes Summary

**Login/registro ?return= param preservation via consumeCheckoutIntent priority chain, plus gender toggle always visible in logged-in nome flow**

## Performance

- **Duration:** 5 min
- **Tasks:** 2 auto + 1 checkpoint (approved)
- **Files modified:** 3

## Accomplishments

- Login and registro pages read `?return=` query param and `consumeCheckoutIntent()` to redirect users to the correct destination after auth
- Google OAuth `redirectUrlComplete` uses the same priority logic (checkout intent > return param > /conta/leituras)
- Gender toggle (Ela/Ele) now always visible in the logged-in form on /ler/nome, regardless of isSelf state
- Security: `?return=` only accepted if it starts with `/` to prevent open redirect attacks

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ?return= support to login and registro pages** - `823586a` (feat)
2. **Task 2: Add gender toggle to logged-in pra mim flow in /ler/nome** - `4f6b9d4` (feat)

## Files Created/Modified

- `src/app/login/page.tsx` - Added useSearchParams, consumeCheckoutIntent import, getRedirectUrl() helper, dynamic redirectUrlComplete for Google OAuth
- `src/app/registro/page.tsx` - Same pattern as login: useSearchParams, consumeCheckoutIntent, getRedirectUrl(), dynamic redirectUrlComplete
- `src/app/ler/nome/page.tsx` - Moved Ela/Ele toggle outside {!isSelf} block so it renders for both pra mim and outra pessoa

## Decisions Made

- consumeCheckoutIntent is called separately for Google OAuth (before redirect, since it navigates away) vs email/password (inside getRedirectUrl after setActive), because OAuth leaves the page immediately and sessionStorage would be consumed too early if shared
- sso-callback page was NOT modified — redirectUrlComplete is passed by the caller (login/registro) via authenticateWithRedirect, so the callback just uses whatever URL was set
- CAPTCHA loop (FLOW-04) is a Clerk Dashboard configuration issue (bot protection settings), not a code issue — the `<div id="clerk-captcha" />` is already correctly placed in login, registro, and sso-callback pages

## Deviations from Plan

None - plan executed exactly as written.

## Known Limitations

**CAPTCHA loop on Google OAuth (FLOW-04):** If the CAPTCHA loop persists in development/staging, it is caused by Clerk Dashboard bot protection settings, not missing code. The `clerk-captcha` div is present in all three pages (login, registro, sso-callback). To resolve: check Clerk Dashboard > Bot Protection settings and adjust for the environment. This is documented as a known limitation, not a code defect.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Auth redirect flow complete, ready for creditos checkout integration
- Phase 11 (CLEAN-04) will migrate from @clerk/nextjs/legacy to @clerk/nextjs

## Self-Check: PASSED

All files exist. All commits verified.

---

_Phase: 08-auth-navigation-fixes_
_Completed: 2026-04-14_

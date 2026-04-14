---
phase: 14-email-hardening
plan: 01
subsystem: email
tags: [resend, clerk-webhook, svix, email-templates, opt-in]

# Dependency graph
requires:
  - phase: 12-abacatepay-v2-backend
    provides: webhook that triggers payment email
provides:
  - Hardened resend.ts with API key guard, 1x retry, sendWelcome export
  - Clerk webhook at /api/webhook/clerk for user.created events
  - Opt-in gating on lead reading email (sendLeadReading)
affects: [15-bug-fixes]

# Tech tracking
tech-stack:
  added: [svix (transitive via @clerk/nextjs)]
  patterns: [fire-and-forget email with retry, svix webhook verification]

key-files:
  created:
    - src/server/lib/resend.test.ts
    - src/app/api/webhook/clerk/route.ts
    - src/app/api/webhook/clerk/__tests__/route.test.ts
  modified:
    - src/server/lib/resend.ts
    - src/app/api/reading/capture/route.ts
    - src/app/api/reading/capture/route.test.ts
    - src/app/api/webhook/abacatepay/__tests__/route.test.ts

key-decisions:
  - "Opt-in gating at call sites, not inside resend.ts — resend.ts is a pure email sender"
  - "Payment email unconditional (transactional, EMAIL-03 exception)"
  - "svix used via transitive dependency from @clerk/nextjs"

patterns-established:
  - "Email API key guard: check process.env at runtime, skip silently if missing"
  - "Email retry: max 2 attempts, 1s delay, no retry on 4xx"
  - "Clerk webhook: svix verification + event filtering + fire-and-forget email"

requirements-completed: [EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04]

# Metrics
duration: 4min
completed: 2026-04-14
---

# Phase 14 Plan 01: Email & Hardening Summary

**Hardened Resend wrapper with retry and API key guard, Clerk webhook for welcome email, opt-in gating on lead reading email**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-14T18:25:04Z
- **Completed:** 2026-04-14T18:29:40Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Resend wrapper hardened: API key guard (skip silently), 1x retry on transient failure (5xx/network), no retry on 4xx
- sendWelcome() added with brand voice template (voz da cigana)
- Clerk webhook at /api/webhook/clerk handles user.created, sends welcome email only if lead.emailOptIn === true
- Lead reading email (capture route) gated by emailOptIn === true; payment email remains unconditional
- 38 tests across 4 test files pass, build clean, lint clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Harden resend.ts** - `3ed9cfa` (feat) — API key guard, retry, sendWelcome, 9 tests
2. **Task 2: Create Clerk webhook** - `21eae3e` (feat) — user.created handler, svix verification, 5 tests
3. **Task 3: Wire opt-in check** - `a156aff` (feat) — emailOptIn gate on capture route, 3 new tests

## Files Created/Modified

- `src/server/lib/resend.ts` - Hardened email wrapper with retry, API key guard, sendWelcome
- `src/server/lib/resend.test.ts` - 9 unit tests for resend wrapper
- `src/app/api/webhook/clerk/route.ts` - Clerk webhook for user.created event
- `src/app/api/webhook/clerk/__tests__/route.test.ts` - 5 tests for Clerk webhook
- `src/app/api/reading/capture/route.ts` - Added emailOptIn check on sendLeadReading call
- `src/app/api/reading/capture/route.test.ts` - 3 new tests for opt-in gating
- `src/app/api/webhook/abacatepay/__tests__/route.test.ts` - Documented EMAIL-03 exception

## Decisions Made

- Opt-in gating at call sites, not inside resend.ts. resend.ts is a pure email sender; callers decide whether to send.
- Payment email (sendPaymentConfirmed) is unconditional. Per EMAIL-03, transactional emails skip opt-in check.
- svix used via transitive dependency from @clerk/nextjs. No new package install needed.

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

Clerk webhook requires manual configuration:

1. In Clerk Dashboard: Settings > Webhooks > Create endpoint
2. URL: `{BASE_URL}/api/webhook/clerk`
3. Subscribe to: `user.created`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET` env var in Vercel (both production and preview)

Also ensure `RESEND_API_KEY` is set in Vercel env vars when Resend domain is verified.

## Known Stubs

None. All email functions are fully implemented with real Resend API calls. The API key guard means they gracefully skip in environments without RESEND_API_KEY.

## Next Phase Readiness

- Email infrastructure complete for v2 monetization
- Phase 15 (Bug Fixes) can proceed independently

## Self-Check: PASSED

All 7 files verified present. All 3 commit hashes verified in git log.

---

_Phase: 14-email-hardening_
_Completed: 2026-04-14_

---
phase: quick
plan: 260411-qgu
subsystem: reading-premium
tags: [premium, credits, upgrade, staging, auth]
tech-stack:
  added: []
  patterns: [prisma-transaction-fifo, clerk-auth-non-throwing, fire-and-forget-fetch]
key-files:
  created:
    - src/app/api/reading/[id]/upgrade/route.ts
    - src/app/api/dev/seed-credits/route.ts
  modified:
    - src/app/api/reading/capture/route.ts
    - src/lib/reading-client.ts
    - src/components/reading/UpsellSection.tsx
    - src/hooks/useAuth.ts
decisions:
  - auth() from @clerk/nextjs/server used in capture route (non-throwing) — safe to call in unprotected routes, returns null userId if unauthenticated
  - Staging seed idempotency checks for any existing CreditPack (not just remaining > 0) — avoids re-seeding after user spends all credits
  - upgradeReading error format prefixes status code for reliable 401/402 detection without HTTP status access in catch block
metrics:
  duration: 15m
  completed: 2026-04-11
  tasks: 5
  files: 6
---

# Quick Task 260411-qgu: Fluxo Premium Completo (Staging) — Summary

**One-liner:** Direct in-page credit-to-premium upgrade flow with atomic DB transaction and staging auto-seed on first login.

## What Was Built

End-to-end premium upgrade path: logged-in users with credits can unlock a reading with one click. Readings created by users who pre-debited a credit are now born premium. Staging users get 100 test credits automatically on first login.

## Tasks Completed

| Task | Description                                              | Commit  |
| ---- | -------------------------------------------------------- | ------- |
| 1    | PATCH /api/reading/[id]/upgrade endpoint                 | d8de4c1 |
| 2    | Fix capture route — born premium when credit_used        | 939554c |
| 3    | upgradeReading() adapter + credit_used in captureReading | db89c2b |
| 4    | UpsellSection — direct upgrade with loading state        | 69ac59d |
| 5    | Staging auto-seed credits on first login                 | a659f05 |

## Key Decisions

**Upgrade endpoint ownership check:** `reading.clerkUserId === clerkUserId`. Works because:

- Users logged in at capture: capture route now sets clerkUserId (Task 2)
- Anonymous readings later claimed: `claim-readings` sets clerkUserId

**Born-premium on capture:** `auth()` from `@clerk/nextjs/server` is session-based, not middleware-dependent. It safely returns `{ userId: null }` on unauthenticated requests without throwing. No credit debit happens at capture — debit already happened at `/api/reading/new`. This is purely a tier promotion.

**Staging seed idempotency:** Checks `creditPack.findFirst({ where: { clerkUserId } })` without `remaining > 0`. This prevents re-seeding after users spend all staging credits (which would be confusing for testers).

**Error prefix pattern:** `upgradeReading` throws `"${status}: ${message}"`. UpsellSection checks `msg.startsWith("401")` etc. This avoids needing to catch HTTP status codes separately.

## Flow After This Task

### Anonymous visitor upgrading

1. Visits `/ler/resultado/[id]` — sees free result + UpsellSection
2. Clicks "Desbloquear tudo" — not logged in → redirect `/login`
3. After login → claim-readings links reading to account → user returns to result
4. Clicks "Desbloquear tudo" again → `upgradeReading(id)` → PATCH succeeds → redirect `/ler/resultado/[id]/completo`

### Logged-in user with pre-debited credit

1. `/ler/nome` → CreditGate → `POST /api/reading/new` debits credit
2. `/ler/scan` → `captureReading({ credit_used: true })` → capture route detects auth + credit_used → reading born as tier premium
3. User lands directly at `/ler/resultado/[id]` which redirects to `/completo` (tier check passes)

### Staging tester (new account)

1. Signs in (Google or email)
2. `useAuth` fires `POST /api/dev/seed-credits` (fire-and-forget)
3. 100 credits created, `maosfalam_staging_seeded` flag set in localStorage
4. User can immediately do premium readings

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None introduced by this task. `/api/credits/purchase` (AbacatePay) remains a stub from before — out of scope for this task.

## Self-Check

- [x] `src/app/api/reading/[id]/upgrade/route.ts` — created
- [x] `src/app/api/dev/seed-credits/route.ts` — created
- [x] `src/app/api/reading/capture/route.ts` — modified
- [x] `src/lib/reading-client.ts` — modified
- [x] `src/components/reading/UpsellSection.tsx` — modified
- [x] `src/hooks/useAuth.ts` — modified
- [x] Build passes (`npm run build` — 41 routes, 0 errors)

## Self-Check: PASSED

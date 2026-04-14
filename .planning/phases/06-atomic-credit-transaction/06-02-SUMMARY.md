---
phase: 06-atomic-credit-transaction
plan: "02"
subsystem: credits
tags: [security, client-cleanup, atomic-debit, tdd]
dependency_graph:
  requires: [06-01]
  provides: [atomic-debit-in-capture, credit-used-removed]
  affects: [capture-route, reading-context, scan-page, revelacao-page, nome-page, reading-client]
tech_stack:
  added: []
  patterns: [server-determines-tier, sessionStorage-tier-signal, tdd-red-green]
key_files:
  created: []
  modified:
    - src/app/api/reading/capture/route.ts
    - src/app/api/reading/capture/route.test.ts
    - src/types/reading-context.ts
    - src/lib/reading-client.ts
    - src/app/ler/scan/page.tsx
    - src/app/ler/revelacao/page.tsx
    - src/app/ler/nome/page.tsx
    - src/server/lib/debit-credit.test.ts
decisions:
  - "Server determines tier via debitCreditFIFO — client credit_used boolean removed entirely to close security hole"
  - "scan/page.tsx stores maosfalam_reading_tier from API response; revelacao reads it instead of ReadingContext.credit_used"
  - "debit-credit.test.ts userProfile type error fixed inline (Rule 1 auto-fix — pre-existing but blocked type-check)"
metrics:
  duration: "~7 minutes"
  completed: "2026-04-14"
  tasks: 2
  files: 8
---

# Phase 6 Plan 02: Atomic Credit Debit in Capture Route + credit_used Removal Summary

Server-side tier determination via atomic debitCreditFIFO call in /api/reading/capture, eliminating the client-controlled credit_used boolean that was a security vulnerability.

## What Was Built

### Task 1: Atomic debit in /api/reading/capture route (TDD)

**RED:** Added 5 failing tests (CREDIT-01 through CREDIT-05) covering:

- Unauthenticated: tier=free, debitCreditFIFO NOT called
- Authenticated + credits: tier=premium, debitCreditFIFO called with userId
- Authenticated + no credits: tier=free, debitCreditFIFO called but debited=false
- credit_used in body is ignored (not in Zod schema)
- Response includes tier field

**GREEN:** Updated `src/app/api/reading/capture/route.ts`:

- Removed `credit_used` from Zod schema entirely
- Added `debitCreditFIFO` import from `@/server/lib/debit-credit`
- After GPT-4o analysis and block selection: call `auth()`, then `debitCreditFIFO(userId)` if authenticated
- tier = "premium" if debited:true, else "free"
- Return `tier` in response JSON alongside reading_id and report

All 14 capture tests pass (9 existing + 5 new CREDIT-0x tests).

### Task 2: Remove credit_used from client code

**src/types/reading-context.ts**: Removed `credit_used: boolean` field from ReadingContext interface.

**src/lib/reading-client.ts**: Removed `credit_used?: boolean` parameter from captureReading, added `tier?: string` to response type.

**src/app/ler/scan/page.tsx**: Removed `creditUsed` variable and `credit_used` from captureReading call. Added `sessionStorage.setItem("maosfalam_reading_tier", tier ?? "free")` in `.then()` callback.

**src/app/ler/revelacao/page.tsx**: Updated `onContinue` to read `sessionStorage.getItem("maosfalam_reading_tier")` instead of `ctx?.credit_used === true`.

**src/app/ler/nome/page.tsx**: Removed `credit_used` from all three ReadingContext object literals (visitor submit, logged-in first reading, credit gate confirm).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing type error in debit-credit.test.ts**

- **Found during:** Task 2 (type-check run)
- **Issue:** Mock objects included `userProfile` and `payment` fields that don't exist on the Prisma `CreditPack` type (introduced in 06-01)
- **Fix:** Removed `userProfile: undefined as never` and `payment: undefined as never` from 4 mock objects
- **Files modified:** `src/server/lib/debit-credit.test.ts`
- **Commit:** cfbaa7f

**2. [Rule 2 - Missing] Revelacao page needed updating**

- **Found during:** Task 2 (plan already noted this in NOTE section)
- **Issue:** `revelacao/page.tsx` used `ctx?.credit_used === true` to decide premium route — would break silently after ReadingContext removal
- **Fix:** Updated to read `maosfalam_reading_tier` from sessionStorage
- **Files modified:** `src/app/ler/revelacao/page.tsx`
- **Commit:** cfbaa7f

## Tests

| File                                      | Tests                   | Result   |
| ----------------------------------------- | ----------------------- | -------- |
| src/app/api/reading/capture/route.test.ts | 14 (9 existing + 5 new) | All pass |
| Full suite                                | 112                     | All pass |

## Security Impact

Before this plan: client could send `credit_used: true` and get a premium reading without spending a credit. After: tier is determined entirely server-side by `debitCreditFIFO`. The Zod schema rejects `credit_used` as an unknown field, so even a malicious payload cannot influence the outcome.

## Commits

| Hash      | Message                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| `e4d9518` | feat(06-02): atomic debit in /api/reading/capture, remove credit_used from schema  |
| `cfbaa7f` | feat(06-02): remove credit_used from all client code, store tier from API response |

## Known Stubs

None introduced in this plan.

## Self-Check: PASSED

All modified files confirmed present. Both task commits confirmed in git log.

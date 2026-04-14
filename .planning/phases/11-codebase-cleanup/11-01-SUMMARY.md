---
phase: 11-codebase-cleanup
plan: "01"
subsystem: frontend
tags: [cleanup, dead-code, credit-flow, session-storage]
dependency_graph:
  requires: [phase-06-atomic-credit-transaction, phase-07-credit-infrastructure-cleanup]
  provides: [clean-codebase, no-zombie-state]
  affects:
    [
      src/app/ler/nome/page.tsx,
      src/hooks/useAuth.ts,
      src/lib/payment-client.ts,
      src/server/lib/resend.ts,
    ]
tech_stack:
  added: []
  patterns: [direct-navigation-no-modal, atomic-server-debit]
key_files:
  created: []
  modified:
    - src/app/ler/nome/page.tsx
    - src/hooks/useAuth.ts
    - src/lib/payment-client.ts
    - src/server/lib/resend.ts
    - src/app/creditos/page.tsx
    - src/lib/storage-keys.ts
  deleted:
    - src/components/reading/CreditGate.tsx
decisions:
  - "CreditGate modal removed: credit debit is atomic on server (Phase 06), no client confirmation needed"
  - "Clerk legacy migration deferred: @clerk/nextjs main useSignIn returns SignInSignalValue (new signal API), incompatible with current login/registro flow — architectural rewrite required"
  - "STORAGE_KEYS.email and STORAGE_KEYS.pending_reading entries removed from constants — unused after cleanup"
metrics:
  duration: "~8m"
  completed_date: "2026-04-14"
  tasks: 3
  files_changed: 7
  files_deleted: 1
---

# Phase 11 Plan 01: Codebase Cleanup Summary

Remove CreditGate modal and dead code, clean sessionStorage orphan writes. Leaner codebase after Phase 6 atomized credit debit on server.

## Tasks Completed

| #   | Task                                                           | Commit  | Files                                    |
| --- | -------------------------------------------------------------- | ------- | ---------------------------------------- |
| 1   | Remove CreditGate — delete component, strip nome page          | 53b80c5 | CreditGate.tsx (deleted), nome/page.tsx  |
| 2   | Remove dead code — useAuth stubs, purchaseCredits, sendWelcome | 85cee69 | useAuth.ts, payment-client.ts, resend.ts |
| 3   | SessionStorage orphan cleanup                                  | 48568f7 | nome/page.tsx, creditos/page.tsx         |
| 3b  | Remove unused STORAGE_KEYS entries                             | 9497271 | storage-keys.ts                          |

## What Changed

**Task 1 — CreditGate removal:**

- Deleted `src/components/reading/CreditGate.tsx` entirely
- Removed `showCreditGate` state, `confirming` state, `handleCreditConfirm` function from `nome/page.tsx`
- Replaced the "show modal" branch with direct navigation to `/ler/toque` — same logic as the credit-confirm path, just without the intermediate modal
- `handleLoggedInSubmit` now has two branches: first reading (free) and has-credits (direct to toque)

**Task 2 — Dead code removal:**

- `useAuth`: removed `login()` and `register()` stubs that always returned `false`. Return is now `{ user, hydrated, logout }`
- `payment-client.ts`: deleted `purchaseCredits()` — was never imported anywhere in the codebase. Only `getCredits` remains
- `resend.ts`: deleted `sendWelcome()` — was never called. Kept `sendPaymentConfirmed` and `sendLeadReading`

**Task 3 — SessionStorage cleanup:**

- `nome/page.tsx`: removed `sessionStorage.setItem(STORAGE_KEYS.email, trimmedEmail)` — email is sent via `registerLead()` API, never read from sessionStorage downstream
- `creditos/page.tsx`: replaced `maosfalam_pending_reading` getItem/removeItem branch with direct `router.push("/conta/leituras")` — the key was never set anywhere, so the else branch always ran
- `storage-keys.ts`: removed `email` and `pending_reading` entries from constants

## Deviations from Plan

### Deferred — Architectural Change Required

**[Rule 4] Clerk legacy migration (CLEAN-04) deferred**

- **Found during:** Task 3
- **Issue:** `@clerk/nextjs` (non-legacy) exports `useSignIn` returning `SignInSignalValue` — the new Clerk signal-based API. This is NOT compatible with the current login/registro code that destructures `{ signIn, isLoaded, setActive }` and calls `signIn.create()`, `signIn.authenticateWithRedirect()`, etc.
- **Plan assumption was incorrect:** The plan stated "the hooks have the SAME API". They do not — `@clerk/nextjs/legacy` re-exports from `@clerk/react/legacy` (UseSignInReturn discriminated union), while `@clerk/nextjs` re-exports from `@clerk/react` (SignInSignalValue, new signal API)
- **Impact:** login/page.tsx and registro/page.tsx still import from `@clerk/nextjs/legacy`
- **Required for migration:** Rewrite login and registro flows to use the new `SignInSignalValue` signal-based API — different state management pattern
- **Status:** Left as-is. `/legacy` is still available and functional. Migration is a future task

### Auto-fixed Deviation

**[Rule 2 - Missing cleanup] Removed unused STORAGE_KEYS entries**

- **Found during:** Task 3 verification
- **Issue:** After removing `setItem(STORAGE_KEYS.email)` and the `maosfalam_pending_reading` block, the constants `email` and `pending_reading` remained in `storage-keys.ts` with no callers
- **Fix:** Removed both entries from the constants object
- **Files modified:** `src/lib/storage-keys.ts`
- **Commit:** 9497271

## Verification

```
OK: dead exports gone (purchaseCredits, sendWelcome)
OK: no orphan keys (maosfalam_email, maosfalam_pending_reading)
OK: CreditGate gone
DEFERRED: legacy imports (login/registro — architectural change required)
Build: PASS
Tests: 107/107 PASS
```

## Known Stubs

None introduced by this plan.

## Self-Check: PASSED

- `src/components/reading/CreditGate.tsx` — DELETED (confirmed)
- Commit 53b80c5 — exists
- Commit 85cee69 — exists
- Commit 48568f7 — exists
- Commit 9497271 — exists
- Build passes clean
- 107 tests pass

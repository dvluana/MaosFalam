---
phase: 13-frontend-payment-flow
plan: 01
subsystem: payments
tags: [abacatepay, checkout, cpf, payment-client, creditos, frontend]

# Dependency graph
requires:
  - phase: 12-abacatepay-v2-backend
    provides: "POST /api/credits/purchase returns { checkout_url }"
provides:
  - "initiatePurchase() client adapter for checkout flow"
  - "CPF validation and formatting utilities (isValidCPF, formatCPF)"
  - "/creditos page wired to real AbacatePay checkout redirect"
  - "CPF collection on first purchase"
affects: [13-02-upsell-payment-return]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "initiatePurchase -> redirect to hosted checkout (no local payment forms)",
      "CPF collected inline on payment page for first-time buyers",
      "Profile fetch on mount to determine CPF presence",
    ]

key-files:
  created:
    - src/lib/cpf.ts
    - src/lib/__tests__/cpf.test.ts
    - src/lib/__tests__/payment-client.test.ts
  modified:
    - src/lib/payment-client.ts
    - src/app/creditos/page.tsx

key-decisions:
  - "CPF collected on /creditos page inline, not on a separate profile page"
  - "Removed ~300 lines of fake payment UI (PIX QR, card form, method toggle)"
  - "handlePagar is async with useCallback to support await on initiatePurchase"

patterns-established:
  - "Hosted checkout redirect: call API, get URL, window.location.href (no router.push)"
  - "CPF input with progressive formatting via formatCPF on onChange"

requirements-completed: [FRONT-01, FRONT-02, FRONT-03, PAY-07]

# Metrics
duration: 4min
completed: 2026-04-14
---

# Phase 13 Plan 01: Frontend Payment Flow Summary

**initiatePurchase() + CPF validation wired to /creditos page with real AbacatePay checkout redirect, removing all fake payment UI**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-14T18:05:52Z
- **Completed:** 2026-04-14T18:10:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created initiatePurchase() in payment-client.ts that calls POST /api/credits/purchase and returns checkout_url
- Created CPF validation (isValidCPF with real check digit algorithm) and progressive formatting (formatCPF)
- Rewrote /creditos page: removed PIX QR code, card form, payment method toggle, timer, simulated success (~300 lines removed)
- Wired Pagar button to real API call with redirect to AbacatePay hosted checkout
- CPF field appears conditionally for first-time buyers (fetches profile on mount)
- 21 unit tests for payment client and CPF utilities

## Task Commits

Each task was committed atomically:

1. **Task 1: Create initiatePurchase() + CPF utils with tests (TDD)** - `0121f4b` (feat)
2. **Task 2: Rewrite /creditos page with real API integration** - `f820f1c` (feat)

## Files Created/Modified

- `src/lib/cpf.ts` - CPF validation (check digit algorithm) and progressive formatting
- `src/lib/payment-client.ts` - Added initiatePurchase() alongside existing getCredits()
- `src/lib/__tests__/cpf.test.ts` - 13 tests for validation and formatting edge cases
- `src/lib/__tests__/payment-client.test.ts` - 8 tests for API call, body shape, error handling
- `src/app/creditos/page.tsx` - Rewritten: real API integration, CPF collection, no fake payment UI

## Decisions Made

- CPF collected inline on /creditos (below pack summary) for first-time buyers, per PAY-07 "no primeiro pagamento"
- Profile fetched via getUserProfile() on mount to check CPF presence (hasCpf state)
- handlePagar uses useCallback with async to support await and proper error handling
- Error messages in brand voice: "Algo saiu do caminho. Tente de novo." (generic), "Devagar. Tenta de novo daqui a pouco." (429)
- checkout-intent saveCheckoutIntent still passes "pix" as method for backward compatibility with login/registro pages
- readingId passthrough via ?reading= URL param (not checkout-intent), per research recommendation

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All functions are fully implemented with real API calls.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- initiatePurchase() ready for UpsellSection integration (plan 13-02)
- /creditos accepts ?reading= param for upsell flow (plan 13-02)
- Payment return handling (?paid=1, ?purchased=1) needed in plan 13-02

## Self-Check: PASSED

- All 5 files verified on disk
- Both commits (0121f4b, f820f1c) verified in git log
- 21 unit tests pass
- Build passes with zero errors
- Type-check passes

---

_Phase: 13-frontend-payment-flow_
_Completed: 2026-04-14_

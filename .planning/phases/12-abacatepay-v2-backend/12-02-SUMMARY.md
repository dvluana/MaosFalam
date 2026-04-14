---
phase: 12-abacatepay-v2-backend
plan: 02
subsystem: payments
tags: [abacatepay, v2, webhook, checkout, hmac, vitest]

# Dependency graph
requires:
  - "12-01: abacatepay.ts v2 wrapper with verifyWebhookSignature, createCustomer, createCheckout, resolveProductId"
provides:
  - "Webhook handler for checkout.completed (v2 event format)"
  - "16 new tests covering webhook handler and abacatepay.ts wrapper"
affects: [13-frontend-payment-flow, 14-email-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "Webhook loosely typed (no strict Zod on payload) per AbacatePay best practices",
      "Payment lookup by externalId (payment UUID) instead of billing_id",
    ]

key-files:
  created:
    - src/app/api/webhook/abacatepay/__tests__/route.test.ts
    - src/server/lib/__tests__/abacatepay.test.ts
  modified:
    - src/app/api/webhook/abacatepay/route.ts

key-decisions:
  - "Webhook payload loosely typed with TypeScript interface (not Zod) per AbacatePay docs — they may add fields"
  - "Payment found by externalId using findUnique (not findFirst) since externalId equals payment.id (primary key)"
  - "Method extracted from payerInformation.method (v2 path), defaults to pix if absent"

patterns-established:
  - "Webhook test pattern: makeWebhookRequest helper with raw body + signature header"
  - "abacatepay.ts tests: pure crypto for signature, mock fetch for API calls, cache tests via module-level import"

requirements-completed: [PAY-04, PAY-05]

# Metrics
duration: 4min
completed: 2026-04-14
---

# Phase 12 Plan 02: Webhook Handler Rewrite + Tests Summary

**v2 webhook handler for checkout.completed with base64 HMAC-SHA256 signature, externalId payment lookup, and 16 new tests covering the full payment backend**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-14T16:16:50Z
- **Completed:** 2026-04-14T16:21:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Full webhook rewrite for v2: checkout.completed event, x-webhook-signature header, externalId-based payment lookup
- Atomic transaction preserved identically: paid + credit_pack + debit FIFO + tier upgrade + lead conversion
- 7 webhook handler tests covering: invalid sig (401), event filtering, payment not found (404), idempotent duplicate, valid processing, method extraction, email sending
- 9 abacatepay.ts wrapper tests covering: signature validation (4 tests), createCustomer (2 tests), createCheckout (1 test), resolveProductId cache pattern (2 tests)
- Full suite green: 123 tests, type-check pass, build pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite webhook handler + tests** - `648250e` (feat)
2. **Task 2: Unit tests for abacatepay.ts v2 wrapper** - `e45d2d6` (test)

## Files Created/Modified

- `src/app/api/webhook/abacatepay/route.ts` - v2 webhook handler: checkout.completed, x-webhook-signature, externalId lookup, preserved atomic transaction
- `src/app/api/webhook/abacatepay/__tests__/route.test.ts` - 7 test cases for webhook handler
- `src/server/lib/__tests__/abacatepay.test.ts` - 9 test cases for v2 wrapper functions

## Decisions Made

- Webhook payload loosely typed with TypeScript interface (not Zod) per AbacatePay docs — they may add new fields that strict validation would reject
- Payment found by `findUnique({ where: { id: externalId } })` since externalId equals payment.id (primary key), more efficient than findFirst
- Method extracted from `payerInformation.method` (v2 nested path), defaults to `"pix"` if absent
- devMode logged for observability but does not change processing behavior

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed ESLint consistent-type-imports error in test file**

- **Found during:** Task 1 commit (lint-staged)
- **Issue:** Inline `import("next/server").NextRequest` type annotations violated `@typescript-eslint/consistent-type-imports` rule
- **Fix:** Added `import type { NextRequest } from "next/server"` at top, replaced all inline annotations
- **Files modified:** src/app/api/webhook/abacatepay/**tests**/route.test.ts
- **Verification:** ESLint passes, all tests still green
- **Committed in:** 648250e (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** ESLint rule compliance fix only. No scope change.

## Issues Encountered

None.

## Known Stubs

None. All functions are fully implemented.

## User Setup Required

None - webhook handler is ready to receive AbacatePay v2 webhook events once the webhook URL is configured in the AbacatePay dashboard.

## Next Phase Readiness

- Phase 12 complete: AbacatePay v2 backend fully migrated (wrapper + purchase route + webhook + tests)
- Phase 13 (Frontend Payment Flow) can proceed: /creditos page, initiatePurchase, checkout intent wiring
- Phase 14 (Email & Hardening) webhook trigger is ready: sendPaymentConfirmed called non-blocking after successful webhook

---

_Phase: 12-abacatepay-v2-backend_
_Completed: 2026-04-14_

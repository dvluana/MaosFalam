---
phase: 12-abacatepay-v2-backend
plan: 01
subsystem: payments
tags: [abacatepay, v2, checkout, prisma, webhook, pix, card]

# Dependency graph
requires: []
provides:
  - "abacatepay.ts v2 wrapper with createCustomer, createCheckout, resolveProductId, verifyWebhookSignature"
  - "Purchase route using v2 checkout flow (Payment first, then checkout)"
  - "Prisma Payment model with abacatepayCheckoutId (migrated from BillingId)"
  - "ABACATEPAY_EXTERNAL_IDS mapping in credit-packs.ts"
  - "Product setup script for one-time AbacatePay product creation"
affects: [12-02-webhook-rewrite, 13-frontend-payment-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "lazy-fetch product ID resolution with in-memory cache",
      "v2 checkout flow: Payment first then checkout with externalId",
    ]

key-files:
  created:
    - scripts/setup-abacatepay-products.ts
    - prisma/migrations/20260414161022_rename_billing_to_checkout/migration.sql
  modified:
    - src/server/lib/abacatepay.ts
    - src/app/api/credits/purchase/route.ts
    - src/data/credit-packs.ts
    - prisma/schema.prisma
    - src/app/api/webhook/abacatepay/route.ts

key-decisions:
  - "Lazy-fetch resolveProductId with Map cache instead of hardcoded prod_xxx IDs — works across dev/prod without env var"
  - "Customer creation only requires email in v2 — removed CPF gate from purchase route"
  - "Payment created FIRST (pending), then checkout with externalId=payment.id — enables webhook lookup"
  - "verifyWebhookSignature uses fixed public key constant (not env var) with base64 digest"
  - "Product setup script lives in gitignored scripts/ — run locally via npx tsx"

patterns-established:
  - "v2 checkout flow: create Payment (pending) -> resolveProductId -> createCheckout(externalId=payment.id) -> update Payment with checkoutId"
  - "Product ID resolution: lazy-fetch by externalId, cache in module-level Map"

requirements-completed: [PAY-01, PAY-02, PAY-03, PAY-06]

# Metrics
duration: 5min
completed: 2026-04-14
---

# Phase 12 Plan 01: AbacatePay v2 Backend Summary

**AbacatePay v2 wrapper with checkout-based flow (PIX+CARD), lazy product ID resolution, and purchase route reordered to create Payment before checkout**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-14T16:09:30Z
- **Completed:** 2026-04-14T16:14:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Full rewrite of abacatepay.ts for v2 API: createCustomer (email-only), createCheckout (PIX+CARD), resolveProductId (lazy-cache), verifyWebhookSignature (HMAC-SHA256 base64 with fixed public key)
- Purchase route reordered: Payment created first (pending), checkout references payment.id as externalId, Payment updated with checkoutId after
- Prisma migration from abacatepayBillingId to abacatepayCheckoutId applied to Neon develop
- ABACATEPAY_EXTERNAL_IDS added to credit-packs.ts for 4 product mappings
- Product setup script created for one-time AbacatePay product creation

## Task Commits

Each task was committed atomically:

1. **Task 1: Prisma migration + credit-packs mapping + abacatepay.ts v2 rewrite** - `62a0a5d` (feat)
2. **Task 2: Update purchase route for v2 checkout flow** - `5f02a80` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - Payment model: abacatepayCheckoutId replaces abacatepayBillingId
- `prisma/migrations/20260414161022_rename_billing_to_checkout/migration.sql` - Column rename migration
- `src/server/lib/abacatepay.ts` - Full v2 rewrite: 4 exports, lazy product cache, base64 webhook signature
- `src/data/credit-packs.ts` - Added ABACATEPAY_EXTERNAL_IDS mapping
- `src/app/api/credits/purchase/route.ts` - v2 checkout flow: Payment first, email-only customer, checkout URL return
- `src/app/api/webhook/abacatepay/route.ts` - Minimal import/field fixes for v2 compatibility (full rewrite in 12-02)
- `scripts/setup-abacatepay-products.ts` - One-time product creation script (gitignored, run via npx tsx)

## Decisions Made

- Lazy-fetch resolveProductId with Map cache instead of hardcoded prod_xxx IDs — works across dev/prod without env var config
- Customer creation only requires email in v2 — removed CPF gate from purchase route (CPF still saved if provided)
- Payment created FIRST (pending), then checkout with externalId=payment.id — enables webhook to find payment by externalId
- verifyWebhookSignature uses fixed public key constant (not env var) with base64 digest and crypto.timingSafeEqual
- Product setup script lives in gitignored scripts/ directory — not tracked in git, run locally

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed webhook route compilation after v2 migration**

- **Found during:** Task 1 verification (type-check failed)
- **Issue:** Webhook route imported `validateWebhookSignature` (v1 name) and used `abacatepayBillingId` (v1 field) — both removed in v2 rewrite
- **Fix:** Updated import to `verifyWebhookSignature`, changed field to `abacatepayCheckoutId`. Minimal changes only — full webhook rewrite is plan 12-02 scope.
- **Files modified:** src/app/api/webhook/abacatepay/route.ts
- **Verification:** type-check and build pass
- **Committed in:** 5f02a80 (Task 2 commit)

**2. [Rule 3 - Blocking] Setup script excluded from git commit due to gitignored scripts/**

- **Found during:** Task 1 commit (lint-staged ESLint warning on ignored file)
- **Issue:** `scripts/` directory is in `.gitignore`, force-adding the file caused ESLint warning that blocked commit
- **Fix:** Removed from git staging. Script exists locally for manual execution via `npx tsx scripts/setup-abacatepay-products.ts`
- **Files modified:** None (script created but not tracked)
- **Verification:** Commit succeeded without warnings

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for build to pass. No scope creep. Webhook will be fully rewritten in plan 12-02.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

- Run `npx tsx scripts/setup-abacatepay-products.ts` with `ABACATEPAY_API_KEY` set to create the 4 products in AbacatePay
- This is a one-time setup per environment (dev and prod)

## Known Stubs

None. All functions are fully implemented with real API calls.

## Next Phase Readiness

- abacatepay.ts v2 wrapper ready for webhook handler (plan 12-02)
- Purchase route fully functional for frontend integration (phase 13)
- Webhook route needs full rewrite for checkout.completed event (plan 12-02)

---

_Phase: 12-abacatepay-v2-backend_
_Completed: 2026-04-14_

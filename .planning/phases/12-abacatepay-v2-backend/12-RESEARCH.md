# Phase 12: AbacatePay v2 Backend - Research

**Researched:** 2026-04-14
**Domain:** Payment integration (AbacatePay API v1 to v2 migration)
**Confidence:** HIGH

## Summary

Phase 12 migrates the AbacatePay integration from v1 (billing-based, PIX-only) to v2 (checkout-based, PIX+CARD). The codebase already has a complete, working payment pipeline: `abacatepay.ts` wrapper, purchase route, webhook handler, and debit-credit logic. The v2 migration is surgical: 3 files need rewriting (`abacatepay.ts`, purchase route, webhook route), 1 file needs a schema tweak (`schema.prisma`), and the debit-credit logic stays untouched.

The biggest architectural change is that v2 treats products as first-class entities (created once, referenced by ID) instead of inline objects per billing. This means the 4 credit packs need to be created in AbacatePay first, and the checkout references them by `prod_xxx` ID. The webhook event changes from `billing.paid` to `checkout.completed`, and signature validation switches from a per-store secret to a fixed public key with HMAC-SHA256.

**Primary recommendation:** Rewrite `abacatepay.ts` with new v2 functions (`createCustomerV2`, `createCheckout`, `verifyWebhookSignature`), update purchase route to use checkout flow, update webhook to handle `checkout.completed`, and add a one-time product setup script.

<phase_requirements>

## Phase Requirements

| ID     | Description                                          | Research Support                                                                                                                  |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| PAY-01 | abacatepay.ts migrado pra API v2                     | Full API mapping documented below; `createBilling` becomes `createCheckout`, base URL changes to `/v2`, products referenced by ID |
| PAY-02 | 4 produtos criados no AbacatePay                     | Product creation via `/v2/products/create` with externalId mapping to CREDIT_PACKS keys; setup script or manual dashboard         |
| PAY-03 | POST /api/credits/purchase chama createCheckout() v2 | Purchase route changes: billing -> checkout, inline products -> item references, save `chk_xxx` instead of billing_id             |
| PAY-04 | Webhook handler processa checkout.completed          | Event name change, signature validation with fixed public key, header name change to `X-Webhook-Signature`, base64 digest         |
| PAY-05 | Webhook atomico: full credit flow                    | Existing transaction logic in webhook is already correct; needs externalId-based payment lookup instead of billing_id             |
| PAY-06 | methods: ["PIX", "CARD"] no checkout                 | Current code hardcodes `["PIX"]`; v2 defaults to `["PIX", "CARD"]` so just pass it explicitly                                     |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- TypeScript strict, no `any`
- `no-console: error` in ESLint; use Pino logger
- Zod validation on ALL API routes
- Security: CPF never logged, personal data never in logs
- Branch: develop (never commit to main)
- Test with Vitest

## Standard Stack

### Core

| Library           | Version  | Purpose                        | Why Standard                            |
| ----------------- | -------- | ------------------------------ | --------------------------------------- |
| AbacatePay API v2 | v2       | Payment processing             | Only payment provider; project decision |
| Prisma            | 7.7.0    | Database ORM                   | Already in use                          |
| Zod               | 4.3.6    | Input validation               | Already in use                          |
| Pino              | 10.3.1   | Logging                        | Already in use                          |
| Node crypto       | built-in | HMAC-SHA256 webhook validation | Already in use                          |

No new dependencies needed. All changes use existing libraries.

## Architecture Patterns

### Current Payment Flow (v1)

```
User clicks buy → POST /api/credits/purchase
  → createCustomer (if needed) → createBilling (inline products)
  → Save Payment with abacatepay_billing_id
  → Return billing.url to frontend

AbacatePay sends webhook → POST /api/webhook/abacatepay
  → Validate signature (HMAC with WEBHOOK_SECRET)
  → Find payment by billing_id
  → Transaction: mark paid → create credit_pack → debit FIFO → upgrade tier
```

### New Payment Flow (v2)

```
SETUP (one-time): Create 4 products in AbacatePay via /v2/products/create

User clicks buy → POST /api/credits/purchase
  → createCustomer (if needed, only email required now)
  → createCheckout (items reference product IDs, not inline)
  → Save Payment with abacatepayCheckoutId + externalId
  → Return checkout.url to frontend

AbacatePay sends webhook → POST /api/webhook/abacatepay
  → Validate signature (HMAC with FIXED PUBLIC KEY, base64 digest)
  → Check event === "checkout.completed"
  → Find payment by externalId (from checkout's externalId field)
  → Transaction: mark paid → create credit_pack → debit FIFO → upgrade tier
```

### File-by-File Change Map

#### 1. `src/server/lib/abacatepay.ts` (FULL REWRITE)

**Current state:** 87 lines. Three exports: `createCustomer`, `createBilling`, `validateWebhookSignature`.

**Changes needed:**

| Current (v1)                                            | New (v2)                                                                      | Details                                                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `BASE_URL = .../v1`                                     | `BASE_URL = .../v2`                                                           | URL change                                                                      |
| `createCustomer(name, email, cpf)`                      | `createCustomer(email, name?)`                                                | Only email required in v2; name optional; cpf/cellphone optional                |
| `createBilling(customerId, packType, pack, readingId?)` | `createCheckout(productId, customerId, externalId, returnUrl, completionUrl)` | Products by ID, not inline; externalId for payment lookup                       |
| `validateWebhookSignature(body, signature)`             | `verifyWebhookSignature(rawBody, signatureFromHeader)`                        | Fixed public key (hardcoded constant), HMAC-SHA256 with base64 digest (not hex) |
| `AbacateBilling { url, id }`                            | `AbacateCheckout { url, id }`                                                 | Response shape: `data.url`, `data.id`                                           |

**New addition:** Product ID resolver function:

```typescript
// Maps pack type to AbacatePay product ID
const PRODUCT_IDS: Record<PackType, string> = {
  avulsa: "mf_avulsa", // externalId used to look up product
  dupla: "mf_dupla",
  roda: "mf_roda",
  tsara: "mf_tsara",
};
```

**Critical detail — product lookup:** The checkout endpoint takes `items[].id` which is the AbacatePay product `id` (the `prod_xxx` form), NOT the `externalId`. Two options:

1. Hardcode the `prod_xxx` IDs after creating products (fragile)
2. Look up products by externalId via GET `/v2/products/get?externalId=mf_avulsa` at startup or first use, cache the mapping

**Recommendation:** Use env var `ABACATEPAY_PRODUCT_IDS` as JSON map, or a lazy-loaded cache that fetches product IDs by externalId on first checkout. The lazy cache is more resilient. Alternatively, since there are only 4 products that never change, a simple lookup-once-and-cache pattern works fine.

**Webhook signature — CRITICAL DIFFERENCES:**

- v1: `crypto.createHmac("sha256", SECRET).update(body).digest("hex")`
- v2: `crypto.createHmac("sha256", PUBLIC_KEY).update(Buffer.from(body, "utf8")).digest("base64")`
- v1 header: `x-abacatepay-signature`
- v2 header: `X-Webhook-Signature`
- v2 key is a FIXED constant (same for all AbacatePay merchants), not a per-store secret

#### 2. `src/app/api/credits/purchase/route.ts` (MODERATE CHANGES)

**Current state:** 110 lines. Creates customer if needed, creates billing, saves Payment record.

**Changes needed:**

- `createBilling()` call becomes `createCheckout()` call
- Customer creation: only email required now (no CPF needed for customer creation, though CPF still saved in our DB)
- Payment record: store checkout ID instead of billing ID
- `externalId` on checkout should be `payment_${payment.id}` — but payment must be created FIRST to have an ID. Current code creates payment AFTER billing. Need to swap order: create Payment first (status: pending), then create checkout with `externalId = payment.id`.
- Return `checkout_url` from `response.data.url` (same field name, different source)

**Reorder of operations:**

```
Current: createBilling → create Payment → return URL
New:     create Payment → createCheckout(externalId=payment.id) → update Payment with checkoutId → return URL
```

#### 3. `src/app/api/webhook/abacatepay/route.ts` (MODERATE CHANGES)

**Current state:** 145 lines. Validates signature, checks `billing.paid`, finds payment by billing_id, runs atomic transaction.

**Changes needed:**

- Signature validation: switch to `verifyWebhookSignature` with public key
- Event check: `billing.paid` becomes `checkout.completed`
- Payment lookup: by `externalId` from webhook data, not by `billing_id`
- The webhook `data.externalId` corresponds to what we passed in `createCheckout`
- Payment method: from `data.payerInformation.method` (not `data.method`)
- The atomic transaction logic (mark paid, create credit_pack, debit FIFO, upgrade tier, mark lead converted) stays IDENTICAL

**Webhook payload structure (v2):**

```json
{
  "id": "log_xxx",
  "event": "checkout.completed",
  "apiVersion": 2,
  "devMode": false,
  "data": {
    "id": "chk_xxx",
    "externalId": "payment_uuid_here",
    "amount": 1490,
    "status": "PAID",
    "customerId": "cus_xxx",
    "payerInformation": {
      "method": "PIX"
    }
  }
}
```

#### 4. `prisma/schema.prisma` (MINOR CHANGE)

**Current state:** Payment model has `abacatepayBillingId` field.

**Changes needed:**

- Rename `abacatepayBillingId` to `abacatepayCheckoutId` (or add new field and keep old for backward compat)
- Since there are no paid payments yet (stubs), a clean rename is safe
- The index `@@index([abacatepayBillingId])` needs updating too

```prisma
// Before
abacatepayBillingId String?   @map("abacatepay_billing_id") @db.VarChar(100)
@@index([abacatepayBillingId])

// After
abacatepayCheckoutId String?   @map("abacatepay_checkout_id") @db.VarChar(100)
@@index([abacatepayCheckoutId])
```

**Migration:** Prisma will generate a migration that renames the column.

#### 5. `src/server/lib/debit-credit.ts` (NO CHANGES)

Already correct. Uses atomic SQL UPDATE with WHERE remaining > 0. Preserved as-is.

#### 6. `src/data/credit-packs.ts` (MINOR ADDITION)

Add externalId mapping for AbacatePay products:

```typescript
export const ABACATEPAY_EXTERNAL_IDS: Record<PackType, string> = {
  avulsa: "mf_avulsa",
  dupla: "mf_dupla",
  roda: "mf_roda",
  tsara: "mf_tsara",
} as const;
```

#### 7. Product Setup Script (NEW FILE)

One-time script to create the 4 products in AbacatePay. Can be:

- A standalone script `scripts/setup-abacatepay-products.ts` run via `npx tsx`
- Or manual API calls via curl

The script approach is better because it's reproducible and documented.

#### 8. `src/lib/payment-client.ts` (POSSIBLE ADDITION)

Currently only has `getCredits()`. Phase 13 (frontend) will need a `purchaseCredits()` function. This may belong to phase 13 but noting it here for awareness.

### Files NOT Touched

- `src/server/lib/debit-credit.ts` — atomic FIFO debit, already correct
- `src/server/lib/resend.ts` — email sending, called fire-and-forget from webhook
- `src/lib/checkout-intent.ts` — frontend sessionStorage, phase 13 scope
- `src/components/account/BuyCreditsModal.tsx` — frontend, phase 13 scope

## Don't Hand-Roll

| Problem                | Don't Build                | Use Instead                                 | Why                                                           |
| ---------------------- | -------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| Webhook signature      | Custom crypto logic        | AbacatePay's documented HMAC-SHA256 pattern | Exact algorithm documented; any deviation = rejected webhooks |
| Product ID resolution  | Hardcoded prod_xxx strings | Lookup by externalId via API or env var     | Product IDs may differ between dev/prod environments          |
| Credit debit atomicity | New transaction logic      | Existing `debitCreditFIFO`                  | Already battle-tested with race condition handling            |
| Idempotent webhook     | Custom dedup logic         | Existing `payment.status === "paid"` check  | Already in the webhook handler, keep as-is                    |

## Common Pitfalls

### Pitfall 1: Webhook Signature Digest Format

**What goes wrong:** v1 uses hex digest, v2 uses base64 digest. Using hex for v2 = all webhooks rejected as invalid.
**Why it happens:** The `digest()` call looks almost identical; easy to copy-paste and miss the format change.
**How to avoid:** The `verifyWebhookSignature` function must use `.digest("base64")` not `.digest("hex")`.
**Warning signs:** All webhook calls return 401 in testing.

### Pitfall 2: Webhook Header Name Case

**What goes wrong:** v1 header is `x-abacatepay-signature` (lowercase), v2 is `X-Webhook-Signature`. Next.js normalizes headers to lowercase, so read as `x-webhook-signature`.
**Why it happens:** Header name changed between versions.
**How to avoid:** Use `req.headers.get("x-webhook-signature")` (Next.js lowercases all headers).
**Warning signs:** Signature always empty/null.

### Pitfall 3: Product ID vs ExternalId Confusion

**What goes wrong:** Passing `externalId` ("mf_avulsa") as the item ID in checkout creation, but the API expects the AbacatePay `id` ("prod_xxx").
**Why it happens:** The `externalId` is OUR identifier; AbacatePay's `id` is THEIRS.
**How to avoid:** Look up products by externalId first, get the `prod_xxx` ID, use that in checkout items.
**Warning signs:** 400 error on checkout creation.

### Pitfall 4: Payment Creation Order

**What goes wrong:** Creating checkout before Payment record means no `externalId` to pass.
**Why it happens:** Current v1 code creates billing first, then saves payment. V2 needs the reverse because `externalId` is how webhook finds the payment.
**How to avoid:** Create Payment (pending) first, use its UUID as `externalId` in checkout, then update Payment with checkout ID.
**Warning signs:** Webhook can't find payment.

### Pitfall 5: CPF No Longer Required for Customer

**What goes wrong:** Blocking checkout because user has no CPF, but v2 only requires email for customer creation.
**Why it happens:** v1 required name+email+cellphone+taxId; current code has a hard gate on CPF.
**How to avoid:** Remove CPF requirement from purchase route's customer creation gate. Keep CPF collection in our DB but don't block AbacatePay flow on it.
**Warning signs:** Users without CPF can't purchase.

### Pitfall 6: Webhook Secret vs URL Secret

**What goes wrong:** Only implementing HMAC signature validation but forgetting the optional URL secret (Camada 1).
**Why it happens:** v2 has two security layers; HMAC is sufficient but URL secret adds defense-in-depth.
**How to avoid:** Implement both: query param secret + HMAC signature. Or at minimum, HMAC only (documented as acceptable).
**Warning signs:** No issue functionally, but reduced security.

## Code Examples

### v2 Customer Creation

```typescript
// Source: docs/abacatepay-v2.md section 1
export async function createCustomer(email: string, name?: string): Promise<string> {
  const res = await abacateRequest<{ data: { id: string } }>("/customers/create", {
    email,
    ...(name && { name }),
  });
  return res.data.id;
}
```

### v2 Checkout Creation

```typescript
// Source: docs/abacatepay-v2.md section 3
export async function createCheckout(params: {
  productId: string;
  customerId: string;
  externalId: string;
  returnUrl: string;
  completionUrl: string;
}): Promise<{ id: string; url: string }> {
  const res = await abacateRequest<{ data: { id: string; url: string } }>("/checkouts/create", {
    items: [{ id: params.productId, quantity: 1 }],
    methods: ["PIX", "CARD"],
    returnUrl: params.returnUrl,
    completionUrl: params.completionUrl,
    customerId: params.customerId,
    externalId: params.externalId,
  });
  return res.data;
}
```

### v2 Webhook Signature Verification

```typescript
// Source: docs/abacatepay-v2.md section 11
import crypto from "node:crypto";

const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

export function verifyWebhookSignature(rawBody: string, signatureFromHeader: string): boolean {
  const expected = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const A = Buffer.from(expected);
  const B = Buffer.from(signatureFromHeader);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}
```

### v2 Response Wrapper

```typescript
// All v2 responses wrap data in { data: T, error: null, success: true }
interface AbacateResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
}
```

## Prisma Schema Change Detail

### Payment Model — Column Rename

```prisma
// BEFORE (v1)
model Payment {
  abacatepayBillingId String? @map("abacatepay_billing_id") @db.VarChar(100)
  @@index([abacatepayBillingId])
}

// AFTER (v2)
model Payment {
  abacatepayCheckoutId String? @map("abacatepay_checkout_id") @db.VarChar(100)
  @@index([abacatepayCheckoutId])
}
```

**Safety:** No production payments exist yet (stubs). Column rename is safe without data migration.

**Migration command:**

```bash
npx prisma migrate dev --name rename-billing-to-checkout
```

## Recommended Plan Structure

### Single Plan (4-5 tasks)

This phase is cohesive — all changes are tightly coupled and should be in one plan:

**Task 1: Prisma schema migration**

- Rename `abacatepayBillingId` to `abacatepayCheckoutId` in schema
- Run migration
- Regenerate Prisma client

**Task 2: Rewrite abacatepay.ts**

- New base URL (`/v2`)
- New response wrapper type (`AbacateResponse<T>`)
- `createCustomer` — only email required
- `createCheckout` — products by ID, methods PIX+CARD
- `verifyWebhookSignature` — fixed public key, base64 digest
- Product ID resolver (externalId to prod_xxx mapping)
- Add ABACATEPAY_EXTERNAL_IDS to credit-packs.ts

**Task 3: Update purchase route**

- Reorder: create Payment first, then checkout
- Remove CPF gate for AbacatePay customer (keep CPF in our DB)
- Pass `externalId = payment.id` to checkout
- Update Payment record with checkout ID

**Task 4: Update webhook handler**

- New event: `checkout.completed`
- New signature validation with public key
- New header name: `x-webhook-signature`
- Payment lookup by externalId
- Method from `payerInformation.method`
- Atomic transaction stays identical

**Task 5: Product setup script + tests**

- `scripts/setup-abacatepay-products.ts` for creating 4 products
- Unit tests for `verifyWebhookSignature`
- Unit tests for `createCheckout` (mocked fetch)
- Integration-style test for webhook handler flow

## Env Var Changes

| Var                                   | Current          | After                                                       |
| ------------------------------------- | ---------------- | ----------------------------------------------------------- |
| `ABACATEPAY_API_KEY`                  | Same             | Same (works for both v1 and v2)                             |
| `ABACATEPAY_WEBHOOK_SECRET`           | Per-store secret | **REMOVE** (replaced by hardcoded public key)               |
| (new) `ABACATEPAY_WEBHOOK_URL_SECRET` | n/a              | Optional: query param secret for URL-based validation layer |

The fixed public key is NOT an env var — it's a constant in code (same for all AbacatePay merchants).

## Validation Architecture

### Test Framework

| Property           | Value              |
| ------------------ | ------------------ |
| Framework          | Vitest 4.1.3       |
| Config file        | `vitest.config.ts` |
| Quick run command  | `npm run test`     |
| Full suite command | `npm run test`     |

### Phase Requirements to Test Map

| Req ID | Behavior                                         | Test Type | Automated Command                                                | File Exists? |
| ------ | ------------------------------------------------ | --------- | ---------------------------------------------------------------- | ------------ |
| PAY-01 | abacatepay.ts v2 functions                       | unit      | `npx vitest run src/server/lib/__tests__/abacatepay.test.ts -x`  | Wave 0       |
| PAY-02 | Product externalId mapping                       | unit      | `npx vitest run src/data/__tests__/credit-packs.test.ts -x`      | Wave 0       |
| PAY-03 | Purchase route creates checkout                  | unit      | `npx vitest run src/app/api/credits/purchase/route.test.ts -x`   | Wave 0       |
| PAY-04 | Webhook validates signature + checkout.completed | unit      | `npx vitest run src/app/api/webhook/abacatepay/route.test.ts -x` | Wave 0       |
| PAY-05 | Webhook atomic transaction                       | unit      | `npx vitest run src/app/api/webhook/abacatepay/route.test.ts -x` | Wave 0       |
| PAY-06 | methods includes PIX and CARD                    | unit      | `npx vitest run src/server/lib/__tests__/abacatepay.test.ts -x`  | Wave 0       |

### Sampling Rate

- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test && npm run build`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps

- [ ] `src/server/lib/__tests__/abacatepay.test.ts` -- covers PAY-01, PAY-06
- [ ] `src/app/api/credits/purchase/route.test.ts` -- covers PAY-03
- [ ] `src/app/api/webhook/abacatepay/route.test.ts` -- covers PAY-04, PAY-05

## Open Questions

1. **Product ID resolution strategy**
   - What we know: Checkout needs `prod_xxx` IDs, not our `mf_avulsa` externalIds
   - What's unclear: Whether to hardcode prod IDs from env, or lazy-fetch by externalId
   - Recommendation: Lazy-fetch with in-memory cache. On first checkout, call GET `/v2/products/get?externalId=mf_avulsa`, cache the `prod_xxx` ID. Simple, resilient, works across dev/prod.

2. **URL-based webhook secret (Camada 1)**
   - What we know: AbacatePay v2 supports both URL secret and HMAC signature
   - What's unclear: Whether to implement both or just HMAC
   - Recommendation: Implement both. URL secret via env var, HMAC via fixed key. Belt and suspenders.

3. **AbacatePay dev mode for testing**
   - What we know: v2 has `devMode: true/false` in webhook payload; `/v2/transparents/simulate-payment` exists for PIX simulation
   - What's unclear: Whether hosted checkout has a similar simulate mechanism
   - Recommendation: Use AbacatePay dashboard to toggle dev mode. Webhook handler should log `devMode` for observability.

## Sources

### Primary (HIGH confidence)

- `docs/abacatepay-v2.md` — Complete v2 API reference compiled from official docs, covers all endpoints, webhook format, and signature validation
- `prisma/schema.prisma` — Current DB schema, directly read
- All source files directly read from codebase

### Secondary (MEDIUM confidence)

- AbacatePay public key value — from docs/abacatepay-v2.md (compiled from official documentation)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new dependencies, all existing libraries
- Architecture: HIGH — v2 API fully documented in docs/abacatepay-v2.md, all current code read
- Pitfalls: HIGH — derived from concrete code comparison between v1 and v2
- Webhook signature: HIGH — exact code example in docs/abacatepay-v2.md with key and algorithm

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable; AbacatePay v2 is the current API)

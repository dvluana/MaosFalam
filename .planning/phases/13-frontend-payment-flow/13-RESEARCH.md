# Phase 13: Frontend Payment Flow - Research

**Researched:** 2026-04-14
**Domain:** Frontend payment integration (Next.js client -> AbacatePay hosted checkout)
**Confidence:** HIGH

## Summary

The /creditos page currently has a fully designed UI with a tarot card deck for pack selection, payment method toggle (PIX/card), hardcoded PIX QR code, and a local card form. None of this payment UI actually works -- it simulates success with setTimeout. The backend (Phase 12) is complete: POST /api/credits/purchase creates an AbacatePay hosted checkout and returns a `checkout_url`. The frontend needs to be rewired to call this API and redirect to AbacatePay instead of handling payment locally.

The key architectural shift: **AbacatePay handles all payment UI** (PIX QR code, card form, etc.) via their hosted checkout page. The /creditos page no longer needs the PIX/card method toggle, the PIX timer, the card form, or any of the local payment state management. It becomes: select pack -> call API -> redirect to AbacatePay -> user returns via completionUrl.

**Primary recommendation:** Strip the payment method selection and local payment forms from /creditos. Keep the tarot deck pack selector and login modal. Add `initiatePurchase()` to payment-client.ts. Wire the "Pagar" button to call the API and `window.location.href` to the checkout_url. Handle return via `?paid=1` / `?purchased=1` query params on the destination pages.

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                                             | Research Support                                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FRONT-01 | /creditos calls POST /api/credits/purchase and redirects to checkout_url                                | Backend returns `{ checkout_url }`. Remove PIX/card local UI. Wire Button to initiatePurchase() -> redirect.                                                                                                                         |
| FRONT-02 | payment-client.ts exports initiatePurchase(packType, cpf?, readingId?) returning checkout_url           | Only `getCredits()` exists today. Add thin fetch wrapper matching backend schema.                                                                                                                                                    |
| FRONT-03 | checkout-intent wired: not-logged saves intent, after login returns to /creditos with pack pre-selected | checkout-intent.ts already exists and works. Login/registro pages already consume it. Already wired in /creditos mount. Only gap: intent should also store readingId for upsell flow.                                                |
| FRONT-04 | UpsellSection.upgradeReading() functional                                                               | Currently calls PATCH /api/reading/[id]/upgrade which debits a credit. Works if user HAS credits. If 402 (no credits), should redirect to /creditos with readingId context so completionUrl returns to /ler/resultado/[id]/completo. |
| FRONT-05 | completionUrl redirects to correct destination                                                          | Backend already sets completionUrl. Frontend needs ?paid=1 toast on /ler/resultado/[id] and ?purchased=1 toast on /conta/leituras.                                                                                                   |
| PAY-07   | CPF validation (XXX.XXX.XXX-XX or 11 digits) on first payment                                           | Backend accepts optional cpf. Frontend needs CPF input field shown conditionally when user has no cpf on profile. Validate format client-side before sending.                                                                        |

</phase_requirements>

## Standard Stack

### Core (already in project)

| Library       | Version | Purpose                      | Why Standard             |
| ------------- | ------- | ---------------------------- | ------------------------ |
| Next.js       | 16.2.3  | App Router, client pages     | Project framework        |
| Framer Motion | 12.38.0 | Animations on /creditos deck | Already used             |
| Zod           | 4.3.6   | CPF validation schema        | Already used server-side |

### Supporting

| Library            | Version | Purpose                            | When to Use                           |
| ------------------ | ------- | ---------------------------------- | ------------------------------------- |
| checkout-intent.ts | local   | sessionStorage intent preservation | Already exists, needs minor extension |

**No new dependencies required.** Everything needed is already installed.

## Architecture Patterns

### Current /creditos Page Structure (WHAT EXISTS)

The page is a single 1035-line component `CreditosInner` with:

1. **Tarot deck selector** (lines 269-581) -- KEEP as-is, works well
2. **Payment method toggle PIX/card** (lines 642-698) -- REMOVE entirely
3. **"Pagar" button** (lines 701-715) -- REWIRE to call initiatePurchase()
4. **PIX QR code section** (lines 721-751) -- REMOVE entirely
5. **Card form section** (lines 754-799) -- REMOVE entirely
6. **Processing/success/failure states** (lines 801-867) -- SIMPLIFY to just processing + error
7. **Login modal** (lines 869-1031) -- KEEP, already saves checkout intent

### Target Architecture

```
/creditos page:
  1. Tarot deck (unchanged)
  2. Payment summary card (simplified: pack info + CTA button, no method toggle)
  3. CPF field (only if user has no cpf on profile -- first-time buyer)
  4. "Pagar" button -> calls initiatePurchase() -> redirects to AbacatePay
  5. Loading state while API processes
  6. Error state if API fails
  7. Login modal (unchanged)
```

### Pattern: initiatePurchase Flow

```typescript
// src/lib/payment-client.ts
export async function initiatePurchase(
  packType: string,
  cpf?: string,
  readingId?: string,
): Promise<{ checkout_url: string }> {
  const res = await fetch("/api/credits/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pack_type: packType,
      ...(cpf && { cpf }),
      ...(readingId && { reading_id: readingId }),
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return res.json();
}
```

### Pattern: UpsellSection Decision Tree

```
User clicks "Desbloquear tudo":
  1. Not logged in? -> router.push("/login")
  2. Logged in, has credits? -> PATCH /api/reading/[id]/upgrade (existing)
     - Success -> router.push(`/ler/resultado/${id}/completo`)
     - 402 (no credits) -> fall through to step 3
  3. Logged in, no credits? -> router.push(`/creditos?reading=${readingId}`)
     - /creditos detects ?reading= param
     - Passes readingId to initiatePurchase()
     - Backend sets completionUrl to /ler/resultado/[id]?paid=1
     - After payment, user lands on resultado page
     - Page detects ?paid=1, refetches reading (now premium), shows toast
```

### Pattern: Return from AbacatePay

AbacatePay redirects to `completionUrl` after successful payment. The backend already sets:

- With readingId: `/ler/resultado/${readingId}?paid=1`
- Without readingId: `/conta/leituras?purchased=1`

Frontend handling needed:

- `/ler/resultado/[id]` page: detect `?paid=1`, refetch reading, if now premium redirect to `/ler/resultado/[id]/completo` with success toast
- `/conta/leituras` page: detect `?purchased=1`, show success toast

### Pattern: CPF Collection

CPF is only needed for first-time buyers (when `userProfile.cpf` is null). Architecture decision from backend: AbacatePay v2 customer creation only requires email, NOT cpf. CPF is stored for our records but doesn't gate checkout creation.

Flow:

1. On /creditos mount (logged in), fetch user profile to check if cpf exists
2. If no cpf, show CPF input field in the payment summary section
3. Validate client-side: 11 digits (raw) or XXX.XXX.XXX-XX format
4. Send cpf in the initiatePurchase() call
5. Backend stores it on user_profiles

### Anti-Patterns to Avoid

- **Local payment forms:** AbacatePay handles all payment UI. Do NOT keep the card form or PIX QR code.
- **Simulating payment success:** Remove all setTimeout-based success simulation. Success only comes from returning via completionUrl.
- **Polling for payment status:** User returns via redirect, not polling. No need for websockets or polling.

## Don't Hand-Roll

| Problem               | Don't Build                                        | Use Instead                                                            | Why                                                                        |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| CPF validation        | Regex from scratch                                 | Validate format (11 digits + check digit algorithm) as a pure function | CPF has a specific check digit algorithm; simple regex misses invalid CPFs |
| Payment UI            | PIX QR code, card form                             | AbacatePay hosted checkout                                             | They handle PCI compliance, bank integrations, error states                |
| Payment state machine | Complex local state for PIX timer, card processing | Redirect to AbacatePay, handle return query param                      | Simpler, more reliable                                                     |

**Key insight:** The entire payment method toggle, PIX QR section (with timer and copy-to-clipboard), and card form section (~300 lines) should be deleted. AbacatePay's hosted checkout replaces all of it.

## Common Pitfalls

### Pitfall 1: Race condition on return from AbacatePay

**What goes wrong:** User returns to /ler/resultado/[id]?paid=1 but the webhook hasn't processed yet, so reading is still "free".
**Why it happens:** completionUrl redirect happens before webhook fires.
**How to avoid:** On ?paid=1, refetch the reading. If still "free" after first fetch, show a brief "Processando seu pagamento..." state and retry once after 2-3 seconds. If still free after retry, show "Seu pagamento esta sendo confirmado. Recarregue em alguns instantes."
**Warning signs:** User sees the free result page instead of completo after paying.

### Pitfall 2: Checkout intent lost on Google OAuth redirect

**What goes wrong:** Google OAuth redirects to external domain, sessionStorage is preserved (same origin), but the consumeCheckoutIntent() call happens in the wrong order.
**Why it happens:** Google OAuth flow: /creditos -> Google -> /sso-callback -> redirectUrlComplete.
**How to avoid:** Login and registro pages already handle this correctly -- they consume intent and set redirectUrlComplete before the OAuth redirect. Verified in code: both pages call `consumeCheckoutIntent()` inside `handleGoogle()` and build the redirectUrlComplete from it. This already works.

### Pitfall 3: Duplicate pack data (DRY violation)

**What goes wrong:** PACOTES array is duplicated in /creditos page AND BuyCreditsModal with slightly different shapes.
**Why it happens:** Historical -- components were built independently.
**How to avoid:** Both should import from `@/data/credit-packs.ts` and derive display data. However, this is a refactor concern -- not blocking for Phase 13. The pack IDs already match between the components and the backend CREDIT_PACKS.

### Pitfall 4: CPF shown to already-registered users

**What goes wrong:** CPF field appears for users who already provided their CPF.
**Why it happens:** Not checking profile before rendering.
**How to avoid:** Fetch profile on mount, only show CPF field if `profile.cpf` is null.

### Pitfall 5: UpsellSection readingId extraction via window.location

**What goes wrong:** Current code extracts readingId from `window.location.pathname` via regex, which is fragile.
**Why it happens:** Component doesn't receive readingId as a prop.
**How to avoid:** Pass readingId as a prop from the parent page. The parent page already has the id from route params.

## Code Examples

### initiatePurchase (payment-client.ts addition)

```typescript
// Source: matches backend POST /api/credits/purchase schema
export async function initiatePurchase(
  packType: string,
  cpf?: string,
  readingId?: string,
): Promise<{ checkout_url: string }> {
  const res = await fetch("/api/credits/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pack_type: packType,
      ...(cpf && { cpf }),
      ...(readingId && { reading_id: readingId }),
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(`${res.status}: ${body.error ?? "Erro ao iniciar pagamento"}`);
  }
  return res.json() as Promise<{ checkout_url: string }>;
}
```

### CPF validation (pure function)

```typescript
// Source: Brazilian CPF check digit algorithm
export function isValidCPF(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  // All same digits are invalid
  if (/^(\d)\1{10}$/.test(digits)) return false;
  // Check digit validation
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) {
      sum += Number(digits[i]) * (t + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    const check = remainder === 10 ? 0 : remainder;
    if (Number(digits[t]) !== check) return false;
  }
  return true;
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
```

### Handling ?paid=1 return on resultado page

```typescript
// In /ler/resultado/[id]/page.tsx
const searchParams = useSearchParams();
const isPaidReturn = searchParams.get("paid") === "1";

useEffect(() => {
  if (!isPaidReturn || !reading) return;
  // Refetch to check if webhook upgraded tier
  const timer = setTimeout(() => {
    getReading(id).then((r) => {
      if (r?.tier === "premium") {
        router.replace(`/ler/resultado/${id}/completo`);
      }
    });
  }, 2000);
  return () => clearTimeout(timer);
}, [isPaidReturn, reading, id, router]);
```

## State of the Art

| Old Approach (current)                      | New Approach (Phase 13)                         | Impact                                      |
| ------------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| Local PIX QR + card form                    | AbacatePay hosted checkout redirect             | Remove ~300 lines of payment UI code        |
| setTimeout fake success                     | Real API call + redirect                        | Actual payments work                        |
| payment-client.ts has only getCredits()     | Add initiatePurchase()                          | Complete client adapter                     |
| UpsellSection redirects to /creditos on 402 | Redirects to /creditos?reading={id} for context | completionUrl returns user to their reading |

**Removed/deprecated:**

- PIX_CODE constant (hardcoded fake PIX)
- PaymentMethod type ("pix" | "card") -- no longer needed
- PIX timer state management
- Card form state (cardNumber, cardExpiry, cardCvv, cardName)
- "pix_selected", "card_selected" page states
- All payment simulation (processing_payment setTimeout -> payment_success)

## What Stays Unchanged

1. **Tarot deck UI** -- the card pack selector carousel works well, keep it
2. **Login modal** -- already saves checkout intent correctly
3. **checkout-intent.ts** -- already functional, login/registro pages already consume it
4. **BuyCreditsModal** -- works, navigates to /creditos?pacote={id}
5. **useCredits hook** -- works, has refetch()
6. **upgradeReading() in reading-client.ts** -- works for users WITH credits

## Validation Architecture

### Test Framework

| Property           | Value                   |
| ------------------ | ----------------------- |
| Framework          | Vitest 4.1.3            |
| Config file        | vitest.config.ts        |
| Quick run command  | `npm run test -- --run` |
| Full suite command | `npm run test`          |

### Phase Requirements -> Test Map

| Req ID   | Behavior                                                          | Test Type   | Automated Command                                             | File Exists? |
| -------- | ----------------------------------------------------------------- | ----------- | ------------------------------------------------------------- | ------------ |
| FRONT-02 | initiatePurchase returns checkout_url on success, throws on error | unit        | `npx vitest run src/lib/__tests__/payment-client.test.ts -x`  | Wave 0       |
| PAY-07   | isValidCPF validates format and check digits                      | unit        | `npx vitest run src/lib/__tests__/cpf.test.ts -x`             | Wave 0       |
| FRONT-01 | /creditos page calls API on button click (integration)            | manual-only | Manual: click button, verify redirect                         | N/A          |
| FRONT-03 | checkout-intent round-trip (save, consume, redirect)              | unit        | `npx vitest run src/lib/__tests__/checkout-intent.test.ts -x` | Wave 0       |
| FRONT-04 | UpsellSection handles upgrade + no-credits redirect               | manual-only | Manual: test with/without credits                             | N/A          |
| FRONT-05 | ?paid=1 triggers refetch and redirect to /completo                | manual-only | Manual: simulate return URL                                   | N/A          |

### Wave 0 Gaps

- [ ] `src/lib/__tests__/payment-client.test.ts` -- covers FRONT-02 (mock fetch, verify request body)
- [ ] `src/lib/__tests__/cpf.test.ts` -- covers PAY-07 (valid/invalid CPFs, formatting)
- [ ] `src/lib/__tests__/checkout-intent.test.ts` -- covers FRONT-03 (save/read/consume/expiry)

## Open Questions

1. **CPF timing: before or during checkout?**
   - What we know: Backend accepts cpf optionally in /api/credits/purchase. AbacatePay doesn't need it for checkout.
   - What's unclear: Should we collect CPF on /creditos before redirecting, or on /conta/perfil later?
   - Recommendation: Collect on /creditos inline (below pack summary) for first-time buyers. It's a natural spot and avoids a separate step. The requirement PAY-07 explicitly says "no primeiro pagamento."

2. **readingId passthrough via checkout-intent**
   - What we know: Current CheckoutIntent stores pacoteId + method. The UpsellSection flow needs readingId.
   - What's unclear: Should readingId go through checkout-intent (sessionStorage) or URL params?
   - Recommendation: Use URL param `?reading={id}` on /creditos. Simpler than extending checkout-intent. The /creditos page reads it and passes to initiatePurchase(). No sessionStorage needed.

3. **Webhook processing delay**
   - What we know: completionUrl redirect may arrive before webhook processes.
   - What's unclear: How long does AbacatePay take to fire the webhook after checkout?
   - Recommendation: Implement retry-once logic with 2-3s delay on the return page. If still not processed, show a polite "Processing" message. This is a standard pattern for payment redirects.

## Sources

### Primary (HIGH confidence)

- `/src/app/api/credits/purchase/route.ts` -- backend schema and response shape
- `/src/server/lib/abacatepay.ts` -- v2 API wrapper, checkout creation params
- `/src/lib/checkout-intent.ts` -- existing sessionStorage helper
- `/src/app/creditos/page.tsx` -- current 1035-line page, full analysis
- `/src/components/reading/UpsellSection.tsx` -- current upgrade flow
- `/src/lib/reading-client.ts` -- upgradeReading() already exists
- `/src/app/login/page.tsx` -- already consumes checkout intent
- `/src/app/registro/page.tsx` -- already consumes checkout intent

### Secondary (MEDIUM confidence)

- AbacatePay v2 docs -- checkout flow is redirect-based (verified via wrapper code)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - no new dependencies, everything in-project
- Architecture: HIGH - backend is complete and verified, frontend changes are well-scoped
- Pitfalls: HIGH - webhook race condition is the only real risk, mitigation is standard

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable, no external changes expected)

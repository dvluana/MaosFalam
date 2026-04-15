# Credit System, Auth & Logged-In Flow Audit

**Analysis Date:** 2026-04-13

---

## 1. Credit Lifecycle

### 1.1 Credit Creation Paths

**Path A: AbacatePay Webhook (Production)**

- File: `src/app/api/webhook/abacatepay/route.ts`
- Trigger: `billing.paid` event from AbacatePay
- Flow: Validates signature -> finds Payment by billingId -> atomic transaction:
  1. Marks payment `status: "paid"`
  2. Creates CreditPack with `total` and `remaining` from CREDIT_PACKS lookup
  3. If `payment.readingId` exists: upgrades reading to `tier: "premium"` AND debits 1 credit from the newly created pack
  4. Marks associated lead as `converted: true`
- **CONCERN: AbacatePay is NOT integrated.** The `src/server/lib/abacatepay.ts` has real API wrapper code but payment processing is never called from the creditos page (see 1.5 below). The webhook route exists but will never fire until actual billing integration happens.

**Path B: Staging Seed (Dev/Staging only)**

- File: `src/app/api/dev/seed-credits/route.ts`
- Guard: `NEXT_PUBLIC_ENV_LABEL === "Testes"`
- Creates 100 credits with `packType: "staging_seed"`
- Idempotent: skips if user already has `remaining > 0`
- Called automatically from `src/hooks/useAuth.ts` line 51 on every first login in staging

**Path C: Purchase Flow (Intended, NOT wired)**

- File: `src/app/api/credits/purchase/route.ts`
- Full implementation exists: Zod validation, AbacatePay customer creation, billing creation, Payment record creation
- **NEVER CALLED.** The `/creditos` page (`src/app/creditos/page.tsx`) has a complete mock payment UI with fake PIX codes and card forms, but `handlePagar()` (line 226) transitions between page states entirely client-side. It never calls `purchaseCredits()` from `src/lib/payment-client.ts`. The page auto-transitions from `processing_payment` -> `payment_success` after 2 seconds (line 220-224).

### 1.2 Credit Debit Paths

**Path A: Pre-capture debit via `/api/reading/new`**

- File: `src/app/api/reading/new/route.ts`
- Called from: `src/app/ler/nome/page.tsx` -> `handleCreditConfirm()` -> `requestNewReading()`
- Flow: Atomic transaction finds oldest pack with `remaining > 0`, decrements by 1 (FIFO)
- Returns `credits_remaining` for frontend display
- Sets `credit_used: true` in ReadingContext, which flows to `/api/reading/capture` as `credit_used` param
- **Auth required:** Uses `getClerkUserId()`, protected by middleware

**Path B: Post-capture upgrade via `/api/reading/[id]/upgrade`**

- File: `src/app/api/reading/[id]/upgrade/route.ts`
- Called from: `src/components/reading/UpsellSection.tsx` -> `upgradeReading()`
- Flow: Verifies ownership (clerkUserId match), then atomic transaction: debit 1 FIFO credit + set `tier: "premium"`
- Idempotent: returns `already_premium: true` if reading is already premium
- **Auth required:** Uses `getClerkUserId()`, protected by middleware

**Path C: Webhook debit (within creation)**

- File: `src/app/api/webhook/abacatepay/route.ts` (line 88-97)
- When webhook creates a CreditPack AND `payment.readingId` exists, it immediately debits 1 credit from the new pack
- **CONCERN:** This creates a double-debit risk. If a user already debited via `/api/reading/new` (Path A sets `credit_used: true`), then the webhook ALSO debits 1 credit when processing payment for the same reading. There's no guard checking if the credit was already debited for this reading.

### 1.3 Balance Calculation

**Server-side (API):**

- File: `src/app/api/user/credits/route.ts`
- Pattern: `findMany` all packs, then `reduce((sum, p) => sum + Math.max(0, p.remaining), 0)`
- No caching. Fresh DB query every time.

**Client-side (Hook):**

- File: `src/hooks/useCredits.ts`
- Uses `useSyncExternalStore` with module-level store singleton
- Fetches both `/api/user/credits` and `/api/user/readings` in parallel
- `reading_count` is used to determine if this is the first reading (first is free)
- `fetchedForRef` prevents re-fetching for the same userId
- **CONCERN:** `reading_count` comes from `/api/user/readings` which returns ALL readings (including unclaimed ones matched by email). This inflates reading_count for users who had anonymous readings before signing up — they get gated on credits even though they haven't done a logged-in reading before.

**Leituras page (separate fetch):**

- File: `src/app/conta/leituras/page.tsx` (line 377)
- Does its own `getCredits()` call via `src/lib/payment-client.ts`
- This is a SEPARATE fetch from `useCredits()`, causing duplicate API calls on the leituras page

### 1.4 Race Conditions & Atomicity

**FIFO debit is NOT safe under concurrent requests.**

- Both `/api/reading/new` and `/api/reading/[id]/upgrade` use:
  ```
  findFirst({ remaining: { gt: 0 } }) -> update({ remaining: remaining - 1 })
  ```
- This is a classic read-then-write race condition. Two concurrent requests can read the same pack with `remaining: 1`, both see `gt: 0`, both decrement to 0, resulting in 1 credit loss.
- Prisma `$transaction` uses the default isolation level (Read Committed on PostgreSQL), which does NOT prevent this.
- **Fix needed:** Use `UPDATE credit_packs SET remaining = remaining - 1 WHERE remaining > 0 AND ...` as a raw SQL query, or use serializable isolation.

### 1.5 Payment Flow is Entirely Mocked

The `/creditos` page (`src/app/creditos/page.tsx`) is a complete UI with:

- PIX QR code display with countdown timer
- Card payment form (number, expiry, CVV, name)
- State machine: default -> pix_selected/card_selected -> processing_payment -> payment_success
- **BUT:** `handlePagar()` at line 226 never calls any API. It transitions to `pix_selected` or `card_selected` directly. `processing_payment` auto-transitions to `payment_success` after 2 seconds (lines 218-224).
- The PIX code at line 80 is hardcoded: `"00020126580014br.gov.bcb.pix0136a629534e-7693-4846-b028-2c3e7a8e5204"`
- `purchaseCredits()` in `src/lib/payment-client.ts` exists but is imported NOWHERE (only `getCredits()` is used from that file, in `src/app/conta/leituras/page.tsx`).
- `consumeCheckoutIntent()` from `src/lib/checkout-intent.ts` is defined but never imported by any file. `readCheckoutIntent()` is used in creditos page, `saveCheckoutIntent()` is used in creditos page. But the consume-on-login flow described in the JSDoc (login page calls `consumeCheckoutIntent()`) does not exist — the login page has no such call.

---

## 2. Authentication Flow

### 2.1 Auth Architecture

**Middleware:** `src/proxy.ts`

- Uses `clerkMiddleware` from `@clerk/nextjs/server`
- Protected routes: `/api/reading/new(.*)`, `/api/credits/(.*)`, `/api/user/(.*)`, `/conta(.*)`
- Unprotected: `/api/reading/capture`, `/api/reading/[id]`, `/api/lead/register`, `/api/webhook/abacatepay`

**Server-side auth helpers:** `src/server/lib/auth.ts`

- `getClerkUserId()`: Uses `auth()` from `@clerk/nextjs/server` (fast, no network call)
- `getClerkUser()`: Uses `currentUser()` from `@clerk/nextjs/server` (makes network call, returns name+email)

**Client-side auth hook:** `src/hooks/useAuth.ts`

- Wraps `useUser()` and `useClerk()` from `@clerk/nextjs`
- Exposes `{ user, hydrated, login, register, logout }`
- **CONCERN: `login` and `register` are no-op stubs.** They always return `false`. These were holdovers from a custom auth system and are never used — but they exist on the hook return type, creating confusion.
- On first authenticated hydration: fires `/api/user/claim-readings` (fire-and-forget)
- In staging: fires `/api/dev/seed-credits` (fire-and-forget)

### 2.2 Login Page

- File: `src/app/login/page.tsx`
- **CONCERN: Uses `@clerk/nextjs/legacy` import for `useSignIn`.** This is the deprecated legacy package path. Should use `@clerk/nextjs`.
- Google OAuth: `signIn.authenticateWithRedirect()` -> `/sso-callback` -> `/conta/leituras`
- Email/password: `signIn.create()` -> `setActive()` -> `router.push("/conta/leituras")`
- **CONCERN: Always redirects to `/conta/leituras`.** Does NOT consume checkout intent. The `checkout-intent.ts` JSDoc says "o /login chama `consumeCheckoutIntent()`" but this never happens. A user who clicks "Pagar" -> gets login modal -> logs in -> lands on `/conta/leituras` instead of returning to `/creditos` with their selected package.
- **CONCERN: No `?return=` parameter handling.** The creditos page calls `router.push("/login?return=/creditos")` (line 256 of creditos) but the login page ignores query params entirely.

### 2.3 Registration Page

- File: `src/app/registro/page.tsx`
- **Same `@clerk/nextjs/legacy` concern** as login page
- Full email verification flow with `prepareEmailAddressVerification` + `attemptEmailAddressVerification`
- Google OAuth: redirects to `/sso-callback` -> `/conta/leituras`
- After verification: `router.push("/conta/leituras")`
- **Same checkout intent concern** as login — always goes to `/conta/leituras`

### 2.4 SSO Callback

- File: `src/app/sso-callback/page.tsx`
- Renders `<AuthenticateWithRedirectCallback />` from `@clerk/nextjs`
- Redirects to `redirectUrlComplete` set during OAuth init (hardcoded to `/conta/leituras`)

### 2.5 First Login Effects

On first authenticated render, `useAuth.ts` does:

1. **Claim anonymous readings:** POST `/api/user/claim-readings` — matches leads by email, sets `clerkUserId` on leads and readings. Uses localStorage `maosfalam_readings_claimed` flag to prevent re-claiming.
2. **Seed staging credits:** POST `/api/dev/seed-credits` (staging only) — creates 100 credits if user has 0 balance.

- **CONCERN:** The `maosfalam_readings_claimed` flag persists in localStorage forever. If a user logs out and back in, the claim does NOT re-run (flag is cleared on logout in line 64, which is correct). But if the user clears localStorage manually or uses a different browser, it re-runs (which is fine, the endpoint is idempotent).

### 2.6 Password Reset & Account Deletion

**`/esqueci-senha`:** File `src/app/esqueci-senha/page.tsx` — Redirects immediately to `/login`. **No password reset flow implemented.** The architecture doc describes a full flow but it doesn't exist.

**`/redefinir-senha/[token]`:** File `src/app/redefinir-senha/[token]/page.tsx` — Redirects immediately to `/login`. Same non-implementation.

**`/api/user/account` (DELETE):** Listed in architecture doc section 11 as a route that should exist. **Route does not exist.** There is no `src/app/api/user/account/` directory. Account deletion is not implemented.

**Perfil page:** `src/app/conta/perfil/page.tsx` — Has logout button only. "Trocar senha" link goes to `/login#/user/security` which is a Clerk hosted profile URL hack (may or may not work depending on Clerk config). No "Excluir conta" option despite docs/screens.md describing one.

---

## 3. Logged-In Reading Flow

### 3.1 `/ler/nome` (Logged-In Path)

File: `src/app/ler/nome/page.tsx`

**Gates:**

1. `reading_count === 0` -> first reading is free, no credit check (line 177)
2. `balance === 0` -> redirect to `/creditos` (line 201)
3. `balance > 0` -> show CreditGate modal (line 206)

**CreditGate confirm flow:**

1. Calls `requestNewReading()` -> POST `/api/reading/new` (debits 1 credit server-side)
2. Sets `credit_used: true` in ReadingContext
3. Sets legacy sessionStorage keys: `maosfalam_name`, `maosfalam_name_fresh`, `maosfalam_target_gender`, `maosfalam_session_id`
4. Navigates to `/ler/toque`

**CONCERN: `reading_count` inflation.** The `useCredits` hook fetches `/api/user/readings` which includes unclaimed readings matched by email. A visitor who did 3 anonymous readings then signed up would have `reading_count = 3`, triggering the credit gate immediately even though they've never done a paid reading.

**CONCERN: Logged-in user skips email/lead registration.** No lead is created for logged-in users. No `lead_id` is set in sessionStorage. This means the reading's `leadId` will be `undefined` when `/api/reading/capture` is called. The capture route accepts optional `lead_id`, so this works but means logged-in readings have no lead association. The `/api/user/readings` endpoint uses a dual query (clerkUserId + email-matched leads) to compensate, but this is fragile.

**CONCERN: `isSelf` toggle for logged-in users.** When "Pra mim" is selected, name is pre-filled from `user.name`. But the gender defaults to "female" and is NOT extracted from Clerk user data (Clerk doesn't store gender). There's no UI to change gender in "Pra mim" mode — gender toggle only appears when `!isSelf`. So logged-in "Pra mim" readings always use `gender: "female"`.

### 3.2 `/ler/toque` -> `/ler/camera`

- `/ler/toque/page.tsx` checks `maosfalam_name_fresh` sessionStorage flag as a guard
- Camera page (`src/app/ler/camera/page.tsx` line 59) also checks `maosfalam_name_fresh` as entry guard

### 3.3 `/ler/scan`

File: `src/app/ler/scan/page.tsx`

- Reads `photo` from `photo-store` module (NOT sessionStorage)
- Reads `ReadingContext` from sessionStorage via `loadReadingContext()`
- Falls back to individual legacy sessionStorage keys if ReadingContext is null
- Sends `credit_used` to `/api/reading/capture`
- On success: stores `reading_id` and `impact_phrase` in sessionStorage
- Navigates to `/ler/revelacao`

**CONCERN: Photo fallback.** If `getPhoto()` returns empty string (e.g., page refresh clears module-level store), the scan sends an empty `photo_base64` to the API. The Zod schema validates `z.string().min(100)` so it would return 400, but the user sees a generic error page instead of being redirected back to camera.

### 3.4 `/ler/revelacao`

File: `src/app/ler/revelacao/page.tsx`

- Reads `maosfalam_reading_id` and `maosfalam_impact_phrase` from sessionStorage
- Reads `credit_used` from ReadingContext to determine free vs premium path
- If `credit_used === true`: navigates to `/ler/resultado/{id}/completo`
- If `credit_used === false`: navigates to `/ler/resultado/{id}`
- **CONCERN: No guard for missing reading_id.** If `sessionStorage.getItem("maosfalam_reading_id")` is null, the `onContinue` handler (line 66) falls back to `router.replace("/ler/nome")`. This is safe but could happen if the user refreshes the revelacao page.

### 3.5 `/ler/resultado/[id]` (Free Result)

File: `src/app/ler/resultado/[id]/page.tsx`

- Fetches reading from `/api/reading/{id}` (unauthenticated GET)
- Shows element hero, overview, heart section, blurred deck, UpsellSection
- UpsellSection tries inline upgrade via PATCH `/api/reading/{id}/upgrade`

### 3.6 `/ler/resultado/[id]/completo` (Premium Result)

File: `src/app/ler/resultado/[id]/completo/page.tsx`

- Fetches reading, checks `tier !== "premium"` -> redirects to free result
- **CONCERN: No auth check.** Anyone with the UUID can view the complete premium result. The GET `/api/reading/{id}` route has no authentication check. This is by design for share links but means premium content is accessible without login if you know the UUID.

---

## 4. Tier Logic

### 4.1 How a Reading Becomes Premium

**Path A: Pre-capture (logged-in with credits)**

1. `/ler/nome` -> CreditGate confirm -> `requestNewReading()` debits 1 credit
2. `credit_used: true` is set in ReadingContext
3. `/ler/scan` sends `credit_used: true` to `/api/reading/capture`
4. Capture route (line 66): `const tier = clerkUserId && data.credit_used ? "premium" : "free"`
5. Reading is created as premium in the DB

**Path B: Post-capture upgrade**

1. User views free result -> clicks "Desbloquear tudo"
2. `UpsellSection` calls PATCH `/api/reading/{id}/upgrade`
3. Server debits 1 credit FIFO + sets `tier: "premium"` atomically

**Path C: Webhook upgrade (payment for specific reading)**

1. `payment.readingId` exists on the Payment record
2. Webhook sets `tier: "premium"` on the reading + creates CreditPack + debits 1 from it

**CONCERN: `credit_used` is client-controlled.** The `credit_used` field comes from the client request body to `/api/reading/capture`. A malicious client could send `credit_used: true` without actually having debited a credit (or even being logged in — the capture route reads `auth()` optionally, it's not a protected route). The server trusts the client's claim.

### 4.2 Frontend Tier Display

**Free result page** (`src/app/ler/resultado/[id]/page.tsx`):

- Shows heart section + BlurredDeck + UpsellSection
- No auth check needed

**Complete result page** (`src/app/ler/resultado/[id]/completo/page.tsx`):

- Checks `tier !== "premium"` -> redirects to free page
- Shows all sections, crossings, rare signs, compatibility, epilogue

**Saved reading page** (`src/app/conta/leituras/[id]/page.tsx`):

- Shows both free and premium views based on `reading.tier`
- Has UpsellSection for free tier
- **Different layout from public result pages** — simpler, no ElementHero

**ResultStateSwitcher** (`src/components/reading/ResultStateSwitcher.tsx`):

- Dev-only panel (hidden in production)
- Uses tier values `"free" | "completo"` but the DB uses `"free" | "premium"`
- **CONCERN: Naming mismatch.** The switcher uses "completo" as the tier value in URLs but the server returns "premium". This works because the switcher only controls URL paths, not DB queries, but creates confusion.

---

## 5. Dead Code & Inconsistencies

### 5.1 Dead Code

**`src/lib/checkout-intent.ts` — `consumeCheckoutIntent()`:**

- Defined and exported but never imported by any file
- The login page was supposed to call it (per the JSDoc) but never does
- `readCheckoutIntent()` IS used by `/creditos` page
- `saveCheckoutIntent()` IS used by `/creditos` page

**`src/hooks/useAuth.ts` — `login()` and `register()` functions:**

- Always return `false`
- Never called by any component
- Holdovers from pre-Clerk custom auth
- Exported in the hook return value, adding noise to the API

**`src/lib/payment-client.ts` — `purchaseCredits()`:**

- Full implementation that calls `/api/credits/purchase`
- Never imported by any file. Only `getCredits()` from this module is used (by `src/app/conta/leituras/page.tsx`)

**`src/app/api/credits/purchase/route.ts`:**

- Complete POST handler for credit purchase
- Wired to AbacatePay real API
- Never called because creditos page is fully mocked

**`src/server/lib/resend.ts` — `sendWelcome()`:**

- Fully implemented email template
- Never called by any route or hook

**`src/lib/personalize.ts`:**

- Has a `sessionStorage.getItem("maosfalam_name")` call
- Worth checking if it's imported anywhere useful, but the reading pipeline uses ReadingContext primarily

**`/api/user/account` DELETE route:**

- Listed in `docs/architecture.md` (section 11) as an existing route
- **Does not exist.** No directory or file at `src/app/api/user/account/`

### 5.2 State That's Set But Partially Read

**`maosfalam_email` (sessionStorage):**

- Set by `/ler/nome` visitor flow (line 123)
- Never read by any file. The email goes to the lead registration API and is not needed downstream.

**`maosfalam_pending_reading` (sessionStorage):**

- Read by `/creditos` page (line 205) on payment_success to redirect to the reading
- Never SET by any file. The creditos page reads it but nothing writes it. This means the "redirect to completed reading after payment" feature is broken — it always falls through to `/conta/leituras`.

**`maosfalam_lead_id` (sessionStorage):**

- Set by `/ler/nome` visitor flow (line 150) from lead registration response
- Read by `/ler/scan` (line 54) and sent to `/api/reading/capture`
- **NOT set for logged-in users.** Logged-in flow skips lead registration entirely.

### 5.3 Naming & Type Inconsistencies

**Tier naming:**

- Database: `"free" | "premium"` (varchar)
- ResultStateSwitcher: `"free" | "completo"` (URL paths)
- ReadingContext type: `credit_used: boolean` (determines tier)
- UI badge labels: `"Free" | "Completa"` (display)

**Casing inconsistency in API responses:**

- API routes return snake_case: `target_name`, `created_at`, `pack_type`
- Prisma models use camelCase: `targetName`, `createdAt`, `packType`
- Manual mapping in each route (correct but repetitive)

**`@clerk/nextjs/legacy` imports:**

- `src/app/login/page.tsx` line 3: `import { useSignIn } from "@clerk/nextjs/legacy"`
- `src/app/registro/page.tsx` line 3: `import { useSignUp } from "@clerk/nextjs/legacy"`
- These should use `@clerk/nextjs` (non-legacy). The legacy path may stop working in future Clerk updates.

### 5.4 Incomplete or Missing Features (per docs/screens.md)

| Feature                                | Status                | Files                                                    |
| -------------------------------------- | --------------------- | -------------------------------------------------------- |
| Password reset (`/esqueci-senha`)      | Redirects to `/login` | `src/app/esqueci-senha/page.tsx`                         |
| Password redefine (`/redefinir-senha`) | Redirects to `/login` | `src/app/redefinir-senha/[token]/page.tsx`               |
| Account deletion                       | Not implemented       | No route, no UI                                          |
| Real payment processing                | Mocked client-side    | `src/app/creditos/page.tsx`                              |
| Checkout intent consumption on login   | Not implemented       | `src/app/login/page.tsx` missing `consumeCheckoutIntent` |
| Login return URL handling              | Not implemented       | Login ignores `?return=` param                           |
| `maosfalam_pending_reading` setter     | Missing               | Never written, only read                                 |

---

## 6. Security Considerations

### 6.1 `credit_used` Trust Issue

**Risk:** HIGH

- File: `src/app/api/reading/capture/route.ts` (line 27, 66)
- The `credit_used` field is accepted from the client request body
- A user could set `credit_used: true` without being authenticated or having debited any credit
- The server only checks: `clerkUserId && data.credit_used` — if both are truthy, reading is created as premium
- **Fix:** Remove `credit_used` from the request body. Instead, check on the server if a credit was debited for this session/user by querying recent credit pack changes or using a server-side "pending reading" token.

### 6.2 Premium Content Access Without Auth

**Risk:** MEDIUM

- Files: `src/app/api/reading/[id]/route.ts`, `src/app/ler/resultado/[id]/completo/page.tsx`
- The GET `/api/reading/{id}` route returns the full report (including premium sections) regardless of authentication
- The `/completo` page checks `tier === "premium"` and renders everything
- Anyone who guesses or intercepts a reading UUID can view full premium content
- **Mitigation (partial):** UUIDs are random (v4), so guessing is impractical. But URLs in share links, browser history, or analytics could leak them.
- **Fix consideration:** Return only free-tier sections for unauthenticated requests to the reading API, or gate `/completo` behind auth + ownership check.

### 6.3 Rate Limiting Gaps

- `/api/reading/capture`: Rate limited (5/hr per IP)
- `/api/lead/register`: Rate limited (10/hr per IP)
- `/api/credits/purchase`: Rate limited (5/hr per user)
- `/api/reading/[id]/upgrade`: **NOT rate limited.** Could be used to probe for valid reading UUIDs.
- `/api/user/claim-readings`: **NOT rate limited.** Called fire-and-forget but could be abused.
- `/api/dev/seed-credits`: **NOT rate limited.** Guarded by env var but still risky if env var leaks.

### 6.4 Webhook Email Lookup

- File: `src/app/api/webhook/abacatepay/route.ts` (lines 122-131)
- After payment processing, looks up `UserProfile` with `include: { lead: true }` to get email
- **CONCERN:** `UserProfile.leadId` is optional and may be null. The code accesses `profile?.lead?.email` which handles null, but it means payment confirmation emails may silently not send if the user profile has no linked lead.

---

## 7. Data Flow Diagram (Credit Debit)

```
/ler/nome (logged-in, 2nd+ reading)
  |
  v
CreditGate modal (shows balance)
  |
  v
POST /api/reading/new  <--- debits 1 credit (FIFO, atomic txn)
  |
  v
Sets credit_used: true in ReadingContext (sessionStorage)
  |
  v
/ler/toque -> /ler/camera -> /ler/scan
  |
  v
POST /api/reading/capture  <--- reads credit_used from body
  |                              creates reading with tier = credit_used ? "premium" : "free"
  v
/ler/revelacao (reads credit_used to choose free vs completo path)
  |
  v
/ler/resultado/{id}          (if free)
/ler/resultado/{id}/completo (if premium)
```

```
/ler/resultado/{id} (free result, upsell button)
  |
  v
PATCH /api/reading/{id}/upgrade  <--- debits 1 credit + sets tier="premium"
  |
  v
router.push(/ler/resultado/{id}/completo)
```

---

## 8. SessionStorage Key Registry

| Key                          | Set by                      | Read by                                         | Cleared by                               |
| ---------------------------- | --------------------------- | ----------------------------------------------- | ---------------------------------------- |
| `maosfalam_reading_context`  | `/ler/nome` page            | `/ler/scan`, `/ler/revelacao`, `/ler/camera`    | `clearReadingContext()` (never called)   |
| `maosfalam_name`             | `/ler/nome` page            | `/ler/scan`, `/ler/revelacao`, `personalize.ts` | Never                                    |
| `maosfalam_email`            | `/ler/nome` visitor flow    | **NEVER READ**                                  | Never                                    |
| `maosfalam_name_fresh`       | `/ler/nome` page            | `/ler/toque`, `/ler/camera` guards              | `/ler/resultado/completo` cleanup        |
| `maosfalam_target_gender`    | `/ler/nome` page            | `/ler/scan` fallback                            | Never                                    |
| `maosfalam_session_id`       | `/ler/nome` page            | `/ler/scan` fallback                            | Never                                    |
| `maosfalam_lead_id`          | `/ler/nome` visitor flow    | `/ler/scan`                                     | Never                                    |
| `maosfalam_reading_id`       | `/ler/scan` (on success)    | `/ler/revelacao`                                | `/ler/resultado/completo` cleanup        |
| `maosfalam_impact_phrase`    | `/ler/scan` (on success)    | `/ler/revelacao`                                | `/ler/resultado/completo` cleanup        |
| `maosfalam_checkout_intent`  | `/creditos` page            | `/creditos` page                                | `consumeCheckoutIntent()` (never called) |
| `maosfalam_pending_reading`  | **NEVER SET**               | `/creditos` page                                | `/creditos` page                         |
| `maosfalam_readings_claimed` | `useAuth.ts` (localStorage) | `useAuth.ts`                                    | `logout()`                               |

---

## 9. Priority Concerns Summary

### Critical (breaks user flow)

1. **Payment flow is fully mocked** — users cannot actually buy credits. `src/app/creditos/page.tsx` fakes the entire flow. Files: `src/app/creditos/page.tsx`, `src/lib/payment-client.ts`

2. **`credit_used` is client-trustable** — allows free premium readings. Files: `src/app/api/reading/capture/route.ts`

3. **Login does not preserve checkout intent** — users lose their purchase context. Files: `src/app/login/page.tsx`, `src/app/registro/page.tsx`, `src/lib/checkout-intent.ts`

### High (data integrity risk)

4. **FIFO credit debit race condition** — concurrent requests can cause negative balance. Files: `src/app/api/reading/new/route.ts`, `src/app/api/reading/[id]/upgrade/route.ts`

5. **Webhook double-debit risk** — credit debited by `/api/reading/new` AND again by webhook for same reading. File: `src/app/api/webhook/abacatepay/route.ts`

6. **`reading_count` inflation** — claimed anonymous readings count toward gate threshold. Files: `src/hooks/useCredits.ts`, `src/app/api/user/readings/route.ts`

### Medium (UX/quality issues)

7. **`@clerk/nextjs/legacy` imports** — deprecated, may break. Files: `src/app/login/page.tsx`, `src/app/registro/page.tsx`

8. **Gender defaults to "female" for "Pra mim"** logged-in flow. File: `src/app/ler/nome/page.tsx`

9. **Password reset not implemented** — redirects to login. Files: `src/app/esqueci-senha/page.tsx`, `src/app/redefinir-senha/[token]/page.tsx`

10. **Account deletion not implemented** — no route, no UI. Listed in architecture docs.

### Low (cleanup)

11. **Dead exports:** `login()`, `register()` in useAuth; `purchaseCredits()` in payment-client; `consumeCheckoutIntent()` in checkout-intent; `sendWelcome()` in resend.

12. **`maosfalam_email` set but never read.** File: `src/app/ler/nome/page.tsx`

13. **`maosfalam_pending_reading` read but never set.** File: `src/app/creditos/page.tsx`

14. **`clearReadingContext()` defined but never called.** File: `src/lib/reading-context.ts`

---

_Audit complete: 2026-04-13_

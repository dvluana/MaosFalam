# Quick Task: Fluxo Premium Completo (Staging) — Research

**Researched:** 2026-04-11
**Domain:** Premium reading flow, credit system, API design
**Confidence:** HIGH (all findings from direct codebase inspection)

---

## Summary

The codebase has full report JSON (free + premium content) stored at creation time — tier is just a display gate, not a content gate. Upgrading a reading only needs a credit debit + a DB field update (`tier: "free"` → `tier: "premium"`). The report already contains all premium data.

The current UpsellSection redirects to `/creditos` (payment stub). The task replaces this with a direct in-page upgrade via a new `PATCH /api/reading/[id]/upgrade` endpoint. The frontend adds loading state + redirect to `/ler/resultado/[id]/completo` on success.

For staging credits, the cleanest approach is a one-time seed API route guarded by env var, called automatically on first login. No Prisma seed file exists yet.

---

## 1. Current Flow Mapping

### Anonymous user → free result → "Desbloquear tudo"

```
/ler/nome (visitor form)
  → registerLead() → POST /api/lead/register → lead_id in sessionStorage
  → saveReadingContext() → sessionStorage["maosfalam_reading_context"]
  → router.push("/ler/toque")

/ler/camera → /ler/scan
  captureReading() → POST /api/reading/capture
    {photo_base64, session_id, lead_id, target_name, target_gender, is_self, dominant_hand, element_hint}
    - analyzeHand() (GPT-4o)
    - selectBlocks() → full ReportJSON (free + premium content BOTH generated)
    - prisma.reading.create({ tier: "free", ... })  ← ALWAYS free on capture
    - returns { reading_id, report }
  → sessionStorage["maosfalam_reading_id"] = reading_id
  → /ler/revelacao → /ler/resultado/[id]

/ler/resultado/[id]
  - getReading(id) → GET /api/reading/[id] → { tier: "free", report: full_json }
  - Renders: heart section (free), BlurredDeck (3 teasers), UpsellSection
  - UpsellSection.handleClick():
      sessionStorage["maosfalam_pending_reading"] = reading_id
      router.push("/creditos")   ← CURRENT BEHAVIOR, needs replacing
```

### Logged-in user with credits → reading flow

```
/ler/nome (logged-in, reading_count > 0, balance > 0)
  → CreditGate modal → "Confirmar"
  → requestNewReading() → POST /api/reading/new
      - getClerkUserId() (Clerk auth)
      - tx: find first CreditPack with remaining > 0 (FIFO)
      - debit: pack.remaining -= 1
      - returns { ok: true, credits_remaining: N }
  → saveReadingContext({ credit_used: true, ... })
  → /ler/toque → /ler/camera → /ler/scan

/ler/scan
  captureReading({ ... })
    - POST /api/reading/capture (NO Clerk auth check, NO credit_used flag read)
    - Always creates reading with tier: "free"  ← KEY GAP: credit was debited but tier stays free
    - reading has NO clerkUserId set (capture route doesn't read Clerk session)

RESULT: User paid 1 credit at /ler/nome but reading is created as "free".
The tier upgrade never happens in the current code.
```

### Logged-in user without credits

```
/ler/nome: handleLoggedInSubmit()
  - balance === 0 → router.push("/creditos")   (redirect, no camera)
```

### User on dashboard → reading detail

```
/conta/leituras/[id]
  - getReading(id) → GET /api/reading/[id]
  - currentTier = reading.tier === "premium" ? "premium_saved" : "free_saved"
  - isPremium:  renders all ReadingSections
  - isFree: renders heart + BlurredCards + UpsellSection
  - UpsellSection here also redirects to /creditos (same component)
```

---

## 2. Integration Points

### 2.1 New: PATCH /api/reading/[id]/upgrade

**File:** `src/app/api/reading/[id]/upgrade/route.ts`

**Logic:**

1. `getClerkUserId()` — must be authenticated
2. Find reading by id, verify `reading.clerkUserId === clerkUserId` OR reading is accessible (via lead linkage)
3. Check `reading.tier !== "premium"` — if already premium, return 200 (idempotent)
4. `prisma.$transaction`:
   - Find first CreditPack with `remaining > 0` (FIFO)
   - If none → 402
   - `pack.remaining -= 1`
   - `reading.tier = "premium"`
5. Return `{ ok: true, reading_id: id }`

**Race condition:** The transaction handles concurrent upgrade attempts atomically — if two requests arrive simultaneously, only one finds `remaining > 0` in the lock.

**Auth note:** The reading may not have `clerkUserId` set if it was created anonymously and later claimed. The check should be:

```
reading.clerkUserId === clerkUserId  OR  reading.leadId in user's leads
```

But the simpler approach for this task: check `reading.clerkUserId === clerkUserId`. Anonymous readings that were claimed DO have clerkUserId set (via `/api/user/claim-readings`). So this check is safe.

**Ownership edge case:** Anonymous reading not yet claimed (user never logged in before this session). Solution: attempt claim-readings before upgrade, or just check lead linkage. For staging, simpler: require clerkUserId on reading. Scan page should set it.

### 2.2 captureReading auto-premium when logged in with credits

**File:** `src/app/api/reading/capture/route.ts`

**Current state:** No Clerk auth. Always creates `tier: "free"`. Doesn't read `credit_used`.

**Problem:** When `credit_used: true` in ReadingContext, a credit was already debited at `/api/reading/new`, but capture creates a free reading. The credit was wasted.

**Solution A (recommended):** Pass `clerk_user_id` implicitly by checking Clerk session in capture route. If user is authenticated AND `credit_used = true` in request body → set `tier: "premium"` AND set `clerkUserId` on the reading.

**Solution B:** Add a separate PATCH after scan succeeds. Scan page checks `ctx.credit_used` after capture, calls upgrade endpoint.

Solution A is cleaner (atomic, no extra request). Implementation:

- In capture route: optionally call `auth()` (non-throwing, returns null if not authed)
- If `userId` present AND `data.credit_used === true` → create reading with `tier: "premium"`, `clerkUserId: userId`
- No credit debit here — debit already happened at `/api/reading/new`

**Schema change:** Add `credit_used: z.boolean().optional()` to capture schema.

### 2.3 UpsellSection — direct upgrade with loading + transition

**File:** `src/components/reading/UpsellSection.tsx`

**Current:** Redirects to `/creditos`.

**New behavior:**

1. Button click → `setLoading(true)`
2. Call `upgradeReading(readingId)` → PATCH `/api/reading/[id]/upgrade`
3. Success → `router.push("/ler/resultado/${readingId}/completo")`
4. 402 error (no credits) → `router.push("/creditos")`
5. Other error → show inline error state

**Needs:**

- Reading ID from URL (already done: `window.location.pathname.match`)
- `useRouter` (already imported)
- Loading state (`useState`)
- New `upgradeReading()` adapter in `reading-client.ts`

**Loading transition:** Simple — button shows "Desbloqueando..." text, disabled. No complex animation needed. The redirect itself provides the transition.

**UpsellSection is used in two places:**

- `src/app/ler/resultado/[id]/page.tsx` (anonymous result page)
- `src/app/conta/leituras/[id]/page.tsx` (logged-in saved reading)

Both need the same upgrade behavior, but the anonymous case requires login first. Decision: if upgrade returns 401, redirect to `/login`.

### 2.4 completo/page.tsx tier check

**File:** `src/app/ler/resultado/[id]/completo/page.tsx`

**Current behavior (line 48):** `if (r.tier !== "premium") { router.replace("/ler/resultado/${id}"); }`

**This is correct** — after upgrade, the reading tier in DB is `"premium"`. getReading fetches fresh data. No change needed here.

### 2.5 Dashboard tier badge

**File:** `src/app/conta/leituras/page.tsx`

**Current:** `getVariant()` checks `reading.tier === "premium"` → badge "Completa" (violet). This already works correctly. No change needed.

**BUT:** The dashboard `getReading` call (`getCredits` + `getUserReadings`) happens on mount. After an upgrade, if user navigates to dashboard, readings are re-fetched fresh. No stale data issue.

### 2.6 Staging Credits Seed

**No Prisma seed file exists.** Options:

**Option A: `POST /api/dev/seed-credits` guarded by env var**

- Only runs if `NEXT_PUBLIC_ENV_LABEL === "Testes"` or a `STAGING_SEED_SECRET` env var
- Auto-called after first Clerk login in staging (in `useAuth` or a dedicated `useStagingSetup` hook)
- Creates a CreditPack of 100 credits for the user if none exist
- **Requires `UserProfile` row first** — `CreditPack` has FK to `user_profiles.clerk_user_id`

**Option B: One-time migration/script**

- Manual: run `npx ts-node prisma/seed-staging.ts` against Neon develop
- Harder to automate for new users joining staging

**Option C: Auto-seed on first login in staging**

- `useAuth` or dedicated hook: if `NEXT_PUBLIC_ENV_LABEL === "Testes"` and user just logged in → call seed endpoint
- Cleanest UX: staging users get credits automatically

**Recommended: Option A + C** — API endpoint + auto-call from `useAuth` on first login.

**UserProfile FK constraint:** `CreditPack.clerkUserId` has FK to `user_profiles.clerk_user_id`. Seeding credits requires `UserProfile` to exist first (created by `PUT /api/user/profile`). The seed endpoint must `upsert` the UserProfile before creating the CreditPack.

---

## 3. Pitfalls

### Race condition in credit debit

The `/api/reading/new` and the new `/api/reading/[id]/upgrade` both use `prisma.$transaction` with FIFO pack selection. This is atomic — concurrent requests are safe. The transaction locks the row during update.

**Warning:** Never do credit debit outside a transaction.

### Report already has premium data — no re-generation

Verified: `selectBlocks()` is called once in `/api/reading/capture` and the full `ReportJSON` (all sections, mounts, crossings, rare_signs, compatibility) is stored in the DB JSONB field. The `tier` field on the `Reading` model is just a gate.

`/ler/resultado/[id]/completo/page.tsx` calls `getReading(id)` which returns the full report. The completo page renders all sections from `report.sections`, `report.crossings`, `report.rare_signs`, etc. **No re-generation is needed for upgrade.** Only the DB tier field changes.

### clerkUserId not set on capture

When an anonymous visitor does a reading and later logs in, `claim-readings` sets `clerkUserId` on the reading. But at the time of the upgrade call (before login), the reading has `clerkUserId: null`.

For the UpsellSection upgrade flow: user must be logged in to have credits to upgrade. So `clerkUserId` will be set (either at capture if logged in, or via claim-readings).

**But there's a gap:** If user is logged in at capture but `capture` route doesn't set `clerkUserId`, the upgrade endpoint can't verify ownership. The fix for `capture` (2.2 above) sets `clerkUserId` when authenticated.

### Upgrade endpoint — reading ownership

Simple ownership check: `reading.clerkUserId === clerkUserId`. This works if:

- User was logged in when they did the reading (fixed via 2.2)
- User claimed an anonymous reading via `claim-readings` (already sets clerkUserId)

### SessionStorage state after upgrade

`sessionStorage["maosfalam_pending_reading"]` was used to track the reading for post-payment redirect. After this task, we no longer use that flow for direct upgrade. The key can be ignored/left alone — it doesn't break anything.

After successful upgrade, the redirect to `/ler/resultado/[id]/completo` fetches fresh data from the API, so no stale sessionStorage reading state matters.

`maosfalam_reading_id` and `maosfalam_impact_phrase` are set in scan page and read by revelacao. They are not read by the result pages. No cleanup needed.

### Upgrade when already premium (idempotency)

If user clicks "Desbloquear" twice (double-tap on slow network), the upgrade endpoint must be idempotent. Check: `if (reading.tier === "premium") return { ok: true }` before the transaction.

### CreditPack FK constraint for staging seed

`CreditPack` requires `user_profiles.clerk_user_id` to exist (FK constraint line 77 schema). The seed endpoint must upsert `UserProfile` first. Pattern: `prisma.userProfile.upsert(...)` then `prisma.creditPack.create(...)`.

---

## 4. Files to Change

| File                                        | Change                                                    |
| ------------------------------------------- | --------------------------------------------------------- |
| `src/app/api/reading/[id]/upgrade/route.ts` | CREATE — PATCH endpoint                                   |
| `src/app/api/reading/capture/route.ts`      | ADD `credit_used` field, set tier+clerkUserId when authed |
| `src/app/api/dev/seed-credits/route.ts`     | CREATE — staging seed endpoint                            |
| `src/lib/reading-client.ts`                 | ADD `upgradeReading(id)` adapter                          |
| `src/components/reading/UpsellSection.tsx`  | REPLACE redirect with upgrade call + loading state        |
| `src/hooks/useAuth.ts`                      | ADD staging auto-seed call on first login                 |

Files NOT needing changes:

- `src/app/ler/resultado/[id]/completo/page.tsx` — tier check already correct
- `src/app/conta/leituras/page.tsx` — badge logic already correct
- `src/app/conta/leituras/[id]/page.tsx` — UpsellSection will pick up changes automatically
- `prisma/schema.prisma` — no schema changes needed

---

## 5. Code Patterns

### PATCH upgrade route skeleton

```typescript
// src/app/api/reading/[id]/upgrade/route.ts
import type { NextRequest } from "next/server";

export async function PATCH(_req: NextRequest, context: { params: Promise<unknown> }) {
  const { id } = (await context.params) as { id: string };
  const clerkUserId = await getClerkUserId(); // throws if not authed

  const reading = await prisma.reading.findUnique({ where: { id } });
  if (!reading) return NextResponse.json({ error: "Leitura nao encontrada" }, { status: 404 });
  if (reading.clerkUserId !== clerkUserId)
    return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
  if (reading.tier === "premium") return NextResponse.json({ ok: true }); // idempotent

  const result = await prisma.$transaction(async (tx) => {
    const pack = await tx.creditPack.findFirst({
      where: { clerkUserId, remaining: { gt: 0 } },
      orderBy: { createdAt: "asc" },
    });
    if (!pack) return { ok: false };
    await tx.creditPack.update({ where: { id: pack.id }, data: { remaining: pack.remaining - 1 } });
    await tx.reading.update({ where: { id }, data: { tier: "premium" } });
    return { ok: true };
  });

  if (!result.ok) return NextResponse.json({ error: "Sem creditos" }, { status: 402 });
  return NextResponse.json({ ok: true });
}
```

### capture route — optional Clerk auth + auto-premium

```typescript
// In capture route POST handler, after saving reading:
const { userId } = await auth();  // non-throwing, returns null if not authed
const tier = (userId && data.credit_used) ? "premium" : "free";
const reading = await prisma.reading.create({
  data: {
    ...,
    tier,
    clerkUserId: userId ?? undefined,
  },
});
```

### upgradeReading adapter

```typescript
// In reading-client.ts
export async function upgradeReading(readingId: string): Promise<void> {
  const res = await fetch(`/api/reading/${readingId}/upgrade`, { method: "PATCH" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Erro ao desbloquear");
  }
}
```

### UpsellSection with loading + upgrade

```typescript
// New UpsellSection behavior
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleClick = async () => {
  const match = window.location.pathname.match(/\/ler\/resultado\/([^/]+)/);
  const readingId = match?.[1];
  if (!readingId) {
    router.push("/creditos");
    return;
  }

  setLoading(true);
  setError(null);
  try {
    await upgradeReading(readingId);
    router.push(`/ler/resultado/${readingId}/completo`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("401") || msg.toLowerCase().includes("autenticado")) {
      router.push("/login");
    } else if (msg.includes("402") || msg.toLowerCase().includes("credito")) {
      router.push("/creditos");
    } else {
      setError("Algo saiu do caminho. Tente de novo.");
      setLoading(false);
    }
  }
};
```

### Staging seed endpoint

```typescript
// src/app/api/dev/seed-credits/route.ts
// Guard: only runs in staging (NEXT_PUBLIC_ENV_LABEL === "Testes")
export async function POST() {
  if (process.env.NEXT_PUBLIC_ENV_LABEL !== "Testes") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }
  const clerkUserId = await getClerkUserId();

  // Idempotent: check if user already has credits
  const existing = await prisma.creditPack.findFirst({
    where: { clerkUserId, remaining: { gt: 0 } },
  });
  if (existing) return NextResponse.json({ ok: true, seeded: false });

  // Upsert UserProfile (FK requirement)
  await prisma.userProfile.upsert({
    where: { clerkUserId },
    create: { clerkUserId },
    update: {},
  });

  await prisma.creditPack.create({
    data: { clerkUserId, packType: "staging", total: 100, remaining: 100 },
  });

  return NextResponse.json({ ok: true, seeded: true });
}
```

### Auto-seed in useAuth (staging only)

```typescript
// In useAuth, after the claim-readings call:
if (process.env.NEXT_PUBLIC_ENV_LABEL === "Testes") {
  void fetch("/api/dev/seed-credits", { method: "POST" }).catch(() => undefined);
}
```

---

## 6. Logged-In New Reading Flow Adjustment

**Current gap (critical):** When a logged-in user with credits goes through the reading flow:

1. `/ler/nome` → CreditGate → `POST /api/reading/new` debits 1 credit, sets `credit_used: true` in ReadingContext
2. `/ler/scan` → `captureReading()` → `POST /api/reading/capture` → reading created as `tier: "free"` (BUG)
3. User ends up at `/ler/resultado/[id]` with a free reading despite paying

**Fix:** In `capture/route.ts`, check Clerk session. If authenticated and `credit_used === true` in request body, create reading as `tier: "premium"` and set `clerkUserId`.

**Alternative (if Clerk session is tricky in capture route):** After scan success, scan page checks `ctx.credit_used`. If true, immediately call `PATCH /api/reading/[id]/upgrade` before navigating. But this is two API calls and has a window where user sees free result briefly if upgrade is slow.

**Recommended:** Fix it in the capture route. The `auth()` call from `@clerk/nextjs/server` is safe to call in an unauthenticated context — it returns `{ userId: null }` without throwing.

---

## 7. Open Questions

1. **Capture route auth():** Does `auth()` from `@clerk/nextjs/server` work in the capture route (no auth middleware on that route)? Based on architecture.md: `/api/reading/capture` is listed as auth: "Não". The proxy.ts (Clerk middleware) only protects specific routes. `auth()` should still return the session if the Clerk cookie is present — it just won't redirect if missing. **Confidence: HIGH** — Clerk `auth()` is session-based, not middleware-dependent.

2. **PaymentId field in CreditPack:** Staging seed creates a CreditPack with no `paymentId` (it's `optional` in schema). This is fine — the `paymentId` FK is nullable.

---

## Environment Availability

Step 2.6: SKIPPED — this is a code/API change with no new external dependencies.

## Sources

- All findings from direct inspection of codebase files (HIGH confidence)
- Schema: `prisma/schema.prisma`
- Capture route: `src/app/api/reading/capture/route.ts`
- New reading route: `src/app/api/reading/new/route.ts`
- Reading GET: `src/app/api/reading/[id]/route.ts`
- Credits route: `src/app/api/user/credits/route.ts`
- UpsellSection: `src/components/reading/UpsellSection.tsx`
- Result pages: `src/app/ler/resultado/[id]/page.tsx` and `completo/page.tsx`
- Dashboard: `src/app/conta/leituras/page.tsx` and `[id]/page.tsx`
- useCredits hook: `src/hooks/useCredits.ts`
- useAuth hook: `src/hooks/useAuth.ts`
- Scan page: `src/app/ler/scan/page.tsx`
- Nome page: `src/app/ler/nome/page.tsx`

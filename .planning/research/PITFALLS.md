# Pitfalls Research

**Domain:** Next.js 16 backend — Neon + Prisma v7 + Clerk + GPT-4o vision + credit debit
**Researched:** 2026-04-10
**Confidence:** HIGH (Prisma/Neon/Clerk official docs + community verified), MEDIUM (GPT-4o vision specifics)

---

## Critical Pitfalls

### Pitfall 1: Prisma Client Not Using Singleton — Connection Pool Exhaustion in Dev and Prod

**What goes wrong:**
Every hot-reload in development creates a new `PrismaClient` instance with a fresh connection pool. Old pools are never closed. After a few reloads, Neon reports "too many connections" and queries fail silently or timeout. In production on Vercel (serverless), each invocation also risks creating duplicate clients if the module is instantiated at the top level without a global guard.

**Why it happens:**
Developers copy the Prisma quickstart that shows `new PrismaClient()` at the top of a file. In a standard Node server this is fine — one process, one client. Next.js App Router hot-reloads modules but does not re-initialize `globalThis`, so without a singleton guard, each reload adds a new pool.

**How to avoid:**
Use the Prisma-recommended singleton pattern in `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Also set `connection_limit=1` in the DATABASE_URL query string for serverless: `?connection_limit=1`. Neon's free tier supports 20 idle connections total.

**Warning signs:**

- Error `too many clients already` from Neon in dev
- Queries that work once then hang on second request
- Prisma logs showing multiple connection pool initializations

**Phase to address:** Database Setup (Phase 1 — schema + Prisma initialization)

---

### Pitfall 2: Missing DIRECT_URL — Prisma Migrations Fail Against Neon Pooler

**What goes wrong:**
`prisma migrate deploy` and `prisma db push` fail with timeout or SSL errors when run against the pooled connection (PgBouncer). Prisma CLI commands require a direct TCP connection, not a pooled one. The symptom is often a cryptic timeout that looks like a network issue.

**Why it happens:**
Neon provides two connection strings: a pooled one (via PgBouncer, `pooler.neon.tech`) and a direct one (`neon.tech`). Developers set only `DATABASE_URL` to the pooled string because it is listed first in the Neon dashboard.

**How to avoid:**
Always define both env vars:

```env
DATABASE_URL="postgresql://...@ep-xxx.pooler.neon.tech/maosfalam?sslmode=require"
DIRECT_URL="postgresql://...@ep-xxx.neon.tech/maosfalam?sslmode=require"
```

In `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

The adapter uses `DATABASE_URL` at runtime; Prisma CLI uses `DIRECT_URL` for migrations.

**Warning signs:**

- `prisma migrate deploy` hangs for 30s then errors
- `Error: P1001: Can't reach database server at pooler.neon.tech`
- Migrations work locally but fail in CI

**Phase to address:** Database Setup (Phase 1)

---

### Pitfall 3: Clerk in Next.js 16 — middleware.ts Renamed to proxy.ts

**What goes wrong:**
Next.js 16 renamed `middleware.ts` to `proxy.ts`. If you place Clerk's `clerkMiddleware()` in `middleware.ts`, it silently does not run. Protected routes become publicly accessible. `auth()` throws "Clerk can't detect usage of clerkMiddleware()" errors in server components and API routes.

**Why it happens:**
Clerk documentation and community examples still show `middleware.ts`. Most tutorials were written for Next.js ≤15. The rename is a breaking change that affects every auth system that hooks into Next.js middleware.

**How to avoid:**

- Use `src/proxy.ts` (not `src/middleware.ts`)
- Upgrade `@clerk/nextjs` to v6.35.0+ (versions that explicitly support Next.js 16 proxy)
- Test that `auth()` resolves correctly in a protected API route after setup

```typescript
// src/proxy.ts (NOT middleware.ts)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/conta(.*)",
  "/api/reading/new(.*)",
  "/api/user(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Warning signs:**

- Unauthenticated users can reach `/conta/leituras` without redirect
- `auth()` returns `{ userId: null }` in a route you expect to be protected
- No redirect happens on login-required routes

**Phase to address:** Auth Setup (Phase 2 — Clerk integration)

---

### Pitfall 4: Middleware as Sole Auth Guard — CVE-2025-29927 Pattern

**What goes wrong:**
Relying only on `proxy.ts` / `clerkMiddleware()` to protect API routes. A single middleware check for the entire app means that if middleware is bypassed (misconfiguration, wrong matcher, edge case in Next.js router), every protected API route is fully open.

**Why it happens:**
Middleware feels like "one place to protect everything." Developers add `auth().protect()` in proxy.ts and consider auth done. They skip re-verifying identity inside the route handler.

**How to avoid:**
Double-check auth inside every protected route handler. Treat middleware as UX (redirect unauthed users to login), not security:

```typescript
// src/app/api/user/readings/route.ts
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // proceed with userId — never trust client-provided user IDs
}
```

Never accept `clerk_user_id` or `userId` from the request body. Always derive it from `auth()` on the server.

**Warning signs:**

- API routes that accept `userId` in the request body
- Routes that only check auth via cookie without calling `auth()`
- Any route where removing the middleware doesn't trigger an error in tests

**Phase to address:** Auth Setup (Phase 2) + every API route in Phase 3

---

### Pitfall 5: GPT-4o JSON Response — Unstructured Output Crashes selectBlocks

**What goes wrong:**
GPT-4o is prompted to return JSON but occasionally returns Markdown-wrapped JSON (``json { ... }`), partial JSON, or fields with wrong types (`"breaks": "none"` instead of `"breaks": 0`). `JSON.parse()` throws, `selectBlocks` receives malformed `HandAttributes`, and the reading either 500s or silently generates garbage output.

**Why it happens:**
GPT-4o does not guarantee strict JSON output unless you use the Structured Outputs API (`response_format: { type: "json_schema", schema: ... }`). With `response_format: { type: "json_object" }`, the model returns valid JSON but does not validate against your schema. Field types, required fields, and enum values are not enforced.

**How to avoid:**
Use OpenAI Structured Outputs with an explicit JSON Schema matching `HandAttributes`. Pin to a model snapshot that supports it (`gpt-4o-2024-08-06` or later):

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-2024-08-06',
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'hand_attributes',
      strict: true,
      schema: HAND_ATTRIBUTES_SCHEMA, // derive from src/types/
    },
  },
  messages: [...],
})
```

Add a Zod parse of the response before passing to `selectBlocks`. Catch parse errors and route to the low-confidence error page.

Add a fallback in `selectBlocks` for every unknown variation — return a generic safe block rather than throwing.

**Warning signs:**

- Any uncaught `JSON.parse` error in `/api/reading/capture`
- `selectBlocks` throwing "Bloco não encontrado" (already noted in CONCERNS.md as fragile)
- Occasional 500s on the capture route that don't reproduce deterministically

**Phase to address:** GPT-4o integration (Phase 3) + selectBlocks hardening

---

### Pitfall 6: GPT-4o Vision — Photo Too Large, Cost Spikes, Vercel Body Limit

**What goes wrong:**
A phone camera photo at full resolution (4000×3000px) is 3-8MB as JPEG, 10-15MB as base64. This causes three compounding problems:

1. Vercel default body size limit is 4.5MB — the request 413s before reaching GPT-4o
2. GPT-4o processes the image in 512×512 tiles; a 4K image becomes ~30 tiles at high detail = ~5,200 tokens = ~$0.05 per image just for the photo, not counting the response
3. Cold Vercel functions with large payloads have higher initialization time

**Why it happens:**
The camera pipeline captures at the device's native resolution. Base64 encoding adds ~33% overhead. Developers test with small photos locally and don't notice until production with real phone photos.

**How to avoid:**
Resize and compress client-side before sending. In the camera pipeline, after canvas capture:

```typescript
// After capturing from canvas, resize to max 1024px on longest side
const MAX_SIZE = 1024;
const canvas = document.createElement("canvas");
// ... resize logic ...
const base64 = canvas.toDataURL("image/jpeg", 0.85); // 0.85 quality
```

A 1024×768 JPEG at 0.85 quality is ~80-150KB base64. GPT-4o at high detail processes it as 4 tiles = 765 tokens.

Set `detail: 'high'` explicitly — do not let GPT-4o default, as it may choose `low` and miss fine palm lines.

Add `maxBodySize` config in the Next.js route:

```typescript
export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };
```

**Warning signs:**

- 413 errors on `/api/reading/capture` from production
- OpenAI costs higher than ~$0.05/reading (should be ~$0.01-0.02 at 1024px)
- Slow response times on capture (>10s indicates large payload + GPT-4o processing)

**Phase to address:** GPT-4o integration (Phase 3) + camera pipeline (MediaPipe phase)

---

### Pitfall 7: Credit Debit Race Condition — Double Spend

**What goes wrong:**
Two concurrent requests to `/api/reading/new` for the same `clerk_user_id` both read `remaining = 1`, both pass the "has credits" check, both proceed to GPT-4o and debit, resulting in `remaining = -1`. User gets two premium readings for one credit. At scale with 5-credit or 10-credit packs, this is exploitable.

**Why it happens:**
The naive implementation reads balance, checks if > 0, then starts a transaction to debit. Between the read and the debit, a second request from the same user (or a script) can slip in. Even with a `$transaction`, a READ COMMITTED isolation level does not prevent this — two concurrent transactions both see `remaining = 1` before either commits.

**How to avoid:**
Use a single atomic UPDATE with a WHERE guard and check the affected row count:

```typescript
const result = await prisma.$executeRaw`
  UPDATE credit_packs
  SET remaining = remaining - 1
  WHERE clerk_user_id = ${userId}
    AND remaining > 0
    AND id = (
      SELECT id FROM credit_packs
      WHERE clerk_user_id = ${userId} AND remaining > 0
      ORDER BY created_at ASC
      LIMIT 1
    )
  RETURNING id
`;

if (result === 0) {
  return Response.json({ error: "Sem créditos" }, { status: 402 });
}
```

The single UPDATE is atomic at the database level. If two requests race, only one will match the `remaining > 0` condition after the first commits. Never use a read-then-write pattern for financial operations.

Alternatively, use `prisma.$transaction` with `isolationLevel: Prisma.TransactionIsolationLevel.Serializable` and SELECT FOR UPDATE — but the single-UPDATE approach above is simpler and equally safe for this use case.

**Warning signs:**

- `remaining` column goes negative in any row
- User reports getting a premium reading after their last credit should have been consumed
- Two concurrent requests to `/api/reading/new` both return 200

**Phase to address:** Credits API (Phase 3 or payment phase)

---

### Pitfall 8: Neon Cold Start on First Request — User Sees 10s+ Loading

**What goes wrong:**
Neon scales to zero after 5 minutes of inactivity (free tier). The first query after idle wakes up the compute node, which takes 500ms-3s. Combined with Vercel cold start (~200ms) and GPT-4o latency (3-8s), the first reading capture of the day can take 12+ seconds. On mobile, this causes the scan screen's progress bar to stall visually before any progress.

**Why it happens:**
Neon free tier auto-suspends. The behavior is expected but invisible — no error, just latency. Prisma adapter with connection pooler (PgBouncer) masks most cold starts for subsequent queries but not the first one after a full suspend.

**How to avoid:**

- Always use the pooled `DATABASE_URL` at runtime, not the direct URL — PgBouncer maintains warm connections and absorbs most cold starts
- For MVP: accept the first-request latency; the scan screen has a 10s ritual animation that covers it
- If latency becomes a product problem: use Neon's `autosuspend_delay_seconds` API to extend idle timeout (requires paid tier), or add a lightweight warm-up ping on app startup
- Do NOT try to keep Neon warm with a cron job on the free tier — this exhausts the compute hours budget

**Warning signs:**

- First user of the day reports the scan taking much longer than usual
- Pino logs showing DB query taking >2s on otherwise fast queries
- `/api/reading/capture` P99 latency is 10-15x higher than P50

**Phase to address:** Database Setup (Phase 1) — document as known behavior, not a bug

---

### Pitfall 9: auth() vs currentUser() — Wrong Tool, Wrong Cost

**What goes wrong:**
`currentUser()` is called in every protected API route to get the user's name or email. Each call hits Clerk's Backend API and counts toward the Clerk API rate limit (free tier: 10 requests/second). Under load, API routes start getting 429 from Clerk, causing auth failures that look like the user was logged out.

`auth()` returns only the session token claims (userId, sessionId) — no extra API call. `currentUser()` fetches the full user record from Clerk's servers.

**Why it happens:**
Developers want the user's name for personalization or logging and use `currentUser()` as the default in every handler. The Clerk docs show both without clearly explaining the cost difference.

**How to avoid:**

- Use `auth()` for all auth checks and userId extraction in API routes
- Use `currentUser()` only when you genuinely need the user's email or name (e.g., sending a Resend email)
- For MaosFalam: the user's name and gender are in the `leads` table. Fetch from Neon, not from Clerk, for reading-related personalization
- Never call `currentUser()` in a route that is called frequently (e.g., credit balance check)

**Warning signs:**

- Clerk dashboard showing unexpectedly high API call counts
- Intermittent 401s on authenticated routes during traffic spikes
- API route response times spiking whenever personalized content is shown

**Phase to address:** Auth Setup (Phase 2) — establish the rule before writing any route handlers

---

### Pitfall 10: selectBlocks Has No Fallback — Unknown Variation Throws

**What goes wrong:**
GPT-4o returns an attribute value not in the block lookup table (e.g., a typo, a valid-but-unmapped combination, or a confidence-partial response missing a field). `selectBlocks` calls `HEART_BLOCKS[variation]`, gets `undefined`, and throws "Bloco não encontrado". The entire reading capture 500s, the user sees the generic error screen, and one rate limit slot is wasted.

This is already documented in CONCERNS.md as a fragile area — but it becomes load-bearing the moment the backend is real.

**Why it happens:**
The block lookup maps were written to match the palmistry spec exactly. GPT-4o is non-deterministic. Under low confidence (0.3-0.7), it may omit fields or return conservative values that don't map cleanly.

**How to avoid:**
Wrap every block lookup in a try/catch with a safe fallback:

```typescript
function getBlock(
  map: Record<string, ReadingBlock>,
  variation: string,
  fallback: string,
): ReadingBlock {
  const block = map[variation] ?? map[fallback];
  if (!block) throw new Error(`No block for variation: ${variation} or fallback: ${fallback}`);
  return block;
}
```

Define a `_fallback` key in each block map with a generic safe text. Log the unknown variation (without PII) to catch GPT-4o drift over time.

Add Zod validation of `HandAttributes` after the GPT-4o response, before calling `selectBlocks`. Unknown enum values fail fast with a clear error, not a crash inside the block engine.

**Warning signs:**

- Any 500 on `/api/reading/capture` that does not have a clear Zod or network error
- Logs containing "Bloco não encontrado"
- Users hitting the error screen despite having a valid photo

**Phase to address:** GPT-4o integration (Phase 3) — harden `selectBlocks` before wiring to real API

---

## Technical Debt Patterns

| Shortcut                                      | Immediate Benefit                              | Long-term Cost                                                                              | When Acceptable                                                              |
| --------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| In-memory rate limit (Map)                    | Zero setup, works locally                      | Dies on Vercel restart; rate limiting is effectively disabled in production                 | Never in production — migrate to Upstash Redis before first public launch    |
| `sessionStorage` flags for navigation gates   | Simple client-side gating                      | Users can skip name collection; leads table gets empty names                                | Never for lead capture — use server-signed cookies or Clerk session metadata |
| Mock `useMock()` fallback to real API in prod | Easy dev/prod toggle                           | Obscures which path is active; debug confusion                                              | Acceptable during transition; remove mock fallback once backend is validated |
| `tier: 'free'` default on all readings        | Safe default; never accidentally shows premium | Payment webhook must atomically upgrade tier; any webhook failure means paid user sees free | Acceptable — the default is safe. Webhook must be idempotent and retried.    |
| Prisma `$executeRaw` for credit debit         | Atomic single-query debit                      | Raw SQL bypasses Prisma type safety                                                         | Acceptable for this one operation — document clearly, add test               |

---

## Integration Gotchas

| Integration        | Common Mistake                                   | Correct Approach                                                                          |
| ------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Neon + Prisma      | Using direct connection URL at runtime           | Use pooled URL at runtime, direct URL in `DIRECT_URL` for CLI only                        |
| Neon + Prisma      | Importing `ws` separately for WebSocket support  | `@prisma/adapter-neon` bundles everything — do not install `ws` separately                |
| Clerk + Next.js 16 | Placing Clerk config in `middleware.ts`          | Use `proxy.ts`; upgrade `@clerk/nextjs` to v6.35.0+                                       |
| Clerk              | Calling `currentUser()` in every route           | Use `auth()` for userId only; `currentUser()` only when full user record needed           |
| GPT-4o             | Using `response_format: { type: "json_object" }` | Use `response_format: { type: "json_schema" }` with strict schema for typed output        |
| GPT-4o             | Sending full-resolution photo as base64          | Resize to max 1024px and compress to JPEG 0.85 before encoding                            |
| GPT-4o             | Not pinning model version                        | Always pin to `gpt-4o-2024-08-06` or later — `gpt-4o` without version may change behavior |
| AbacatePay webhook | Trusting body values for credit amount           | Always re-fetch billing from AbacatePay API to confirm amount before crediting            |

---

## Performance Traps

| Trap                                         | Symptoms                                                                     | Prevention                                                                    | When It Breaks                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| No Prisma singleton                          | "Too many connections" in dev; queries hang after multiple hot reloads       | Singleton pattern in `src/lib/prisma.ts` with `globalThis` guard              | Immediately in dev; on Vercel under concurrent traffic      |
| `currentUser()` in high-frequency routes     | Intermittent 401s; Clerk rate limit errors                                   | Use `auth()` for userId; `currentUser()` only when needed                     | ~100 concurrent users hitting the same route                |
| Full-resolution photo base64 in request body | 413 errors; $0.10+ per reading; 10-15s response time                         | Resize client-side to 1024px max before sending                               | First real phone photo in production                        |
| In-memory rate limiter on Vercel             | Rate limiting appears to work locally but is bypassed entirely in production | Upstash Redis rate limiter from day one                                       | Every production request (Vercel = new process per request) |
| Neon cold start on free tier                 | First request of the day takes 10s+                                          | Accept for MVP; use pooled connection to minimize; document as known behavior | Free tier after 5min idle — always                          |

---

## Security Mistakes

| Mistake                                        | Risk                                                                        | Prevention                                                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Accepting `userId` or `tier` from request body | Attacker sets their own userId or upgrades tier for free                    | Always derive `userId` from `auth()` on server; `tier` changes only via webhook                          |
| Skipping Zod validation on any API route input | Malformed input reaches business logic; potential injection or crash        | Zod schema first line of every route handler — reject with 400 before any DB call                        |
| Missing idempotency on webhook handler         | Duplicate `billing.paid` events double-credit the user                      | Check `payment.status === 'paid'` before processing; use DB unique constraint on `abacatepay_billing_id` |
| Logging `name`, `email`, or `cpf` via Pino     | Data leak in log aggregator (Vercel logs, Datadog, etc.)                    | Pino config with redact paths; only log `reading_id`, `clerk_user_id` (opaque), action name              |
| `sessionStorage` as navigation gate            | Users skip lead capture; fake `maosfalam_pending_reading` to access results | Server-side session via Clerk metadata or signed cookie; never trust client-side flags for security      |

---

## UX Pitfalls

| Pitfall                                                            | User Impact                                                               | Better Approach                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| No loading state during cold start DB query                        | Scan screen stalls at 0% for 2-3s then jumps; user thinks it crashed      | The existing 10s ritual animation on /ler/scan covers this — do not add a spinner that implies failure                  |
| Hard error on GPT-4o low confidence without useful feedback        | User sees generic error, doesn't know what to fix                         | Route confidence < 0.3 to `/ler/erro?reason=low_confidence` with specific photo tips (light, open hand, flat surface)   |
| Credit consumed before reading completes                           | GPT-4o times out or returns error after credit debited; user loses credit | Debit credit only after reading is successfully saved to DB; rollback on GPT-4o failure                                 |
| `tier: 'free'` reading shown after payment, before webhook fires   | User pays, gets redirected back to free result; appears broken            | Show "Sua leitura completa está sendo preparada..." state while polling for tier upgrade; webhook fires in <5s normally |
| No distinction between "no credits" and "not logged in" on capture | User confused about why they can't proceed                                | Check auth first (redirect to login), then check credits (redirect to /creditos) — separate error states                |

---

## "Looks Done But Isn't" Checklist

- [ ] **Prisma singleton:** `src/lib/prisma.ts` uses `globalThis` guard — verify no second `new PrismaClient()` anywhere in `src/`
- [ ] **Migration setup:** `DIRECT_URL` env var present and `prisma/schema.prisma` has `directUrl` — verify `prisma migrate deploy` works in CI
- [ ] **Clerk in Next.js 16:** Auth file is `src/proxy.ts`, not `src/middleware.ts` — verify protected route returns 401 when called without token
- [ ] **Auth double-check:** Every API route in `/api/user/*` and `/api/reading/new` calls `auth()` directly, not just relies on proxy.ts — verify by temporarily removing proxy.ts and confirming routes still reject
- [ ] **GPT-4o Structured Outputs:** Response parsed through Zod before reaching `selectBlocks` — verify a malformed GPT-4o response returns 422, not 500
- [ ] **Credit debit atomicity:** Single atomic UPDATE used, not read-then-write — verify with two concurrent requests in test
- [ ] **Photo resize:** Camera pipeline sends max 1024px JPEG — verify payload size logged on capture route is under 300KB
- [ ] **Rate limit on Vercel:** Upstash Redis (not in-memory Map) used for `/api/reading/capture` — verify rate limit persists across two separate function invocations
- [ ] **Webhook idempotency:** Sending same `billing.paid` event twice does not double-credit — verify `remaining` count with duplicate webhook test
- [ ] **No PII in logs:** Pino logs for a full reading flow contain no name, email, or cpf — verify by running capture flow and grepping logs

---

## Recovery Strategies

| Pitfall                                        | Recovery Cost | Recovery Steps                                                                                                                         |
| ---------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Connection pool exhaustion (no singleton)      | LOW           | Add singleton pattern, restart dev server; no data loss                                                                                |
| Migrations failing (no DIRECT_URL)             | LOW           | Add `DIRECT_URL` to env, re-run `prisma migrate deploy`                                                                                |
| proxy.ts vs middleware.ts (wrong filename)     | LOW           | Rename file, restart; no data change needed                                                                                            |
| Double-spend race condition (credits negative) | HIGH          | Audit `credit_packs` for `remaining < 0`, manually correct; add constraint `CHECK (remaining >= 0)` to schema; rewrite debit logic     |
| GPT-4o crashes selectBlocks (no fallback)      | MEDIUM        | Add try/catch + fallback blocks; no user data lost but affected readings show as error                                                 |
| Webhook not idempotent (double credit)         | HIGH          | Audit `credit_packs` for duplicates by `payment_id`; add unique constraint on `abacatepay_billing_id`; manually remove duplicate packs |

---

## Pitfall-to-Phase Mapping

| Pitfall                       | Prevention Phase             | Verification                                                                                                         |
| ----------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Prisma singleton              | Phase 1: Database Setup      | Confirm no `new PrismaClient()` outside singleton file; run 10 hot reloads, check connection count in Neon dashboard |
| DIRECT_URL missing            | Phase 1: Database Setup      | Run `prisma migrate deploy` from CI and verify it completes without timeout                                          |
| proxy.ts rename               | Phase 2: Auth Setup          | Hit a protected route without token, verify 401 response (not 200 with empty userId)                                 |
| Middleware as sole auth guard | Phase 2: Auth Setup          | Each route handler must independently verify `userId` via `auth()`                                                   |
| auth() vs currentUser()       | Phase 2: Auth Setup          | Grep codebase for `currentUser()` calls; justify each one                                                            |
| GPT-4o JSON structure         | Phase 3: API Routes          | Force a mock GPT-4o response with missing fields; verify Zod rejects it and route returns 422                        |
| Photo size / Vercel 413       | Phase 3: API Routes + camera | Log payload size on every capture; alert if >500KB                                                                   |
| Credit debit race condition   | Phase 3: API Routes          | Integration test with two concurrent requests; verify only one succeeds                                              |
| Cold start latency            | Phase 1: Database Setup      | Document as known behavior in STATUS.md; verify pooled URL is used                                                   |
| selectBlocks no fallback      | Phase 3: API Routes          | Unit test with unknown variation input; verify fallback block returned, not throw                                    |

---

## Sources

- [Neon + Prisma connection guide](https://neon.com/docs/guides/prisma) — official, HIGH confidence
- [Prisma connection pooling docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool) — official, HIGH confidence
- [Prisma singleton for Next.js](https://www.timsanteford.com/posts/how-to-fix-too-many-database-connections-opened-in-prisma-with-next-js-hot-reload/) — community verified, HIGH confidence
- [Clerk Next.js 16 middleware.ts → proxy.ts](https://medium.com/@amitupadhyay878/next-js-16-update-middleware-js-5a020bdf9ca7) — community, MEDIUM confidence
- [Clerk clerkMiddleware reference](https://clerk.com/docs/reference/nextjs/clerk-middleware) — official, HIGH confidence
- [Clerk auth() reference](https://clerk.com/docs/reference/nextjs/app-router/auth) — official, HIGH confidence
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) — official, HIGH confidence
- [GPT-4o vision token costs](https://developers.openai.com/api/docs/guides/images-vision) — official, HIGH confidence
- [Prisma transactions and isolation levels](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) — official, HIGH confidence
- [Race condition — Prisma discussion #10709](https://github.com/prisma/prisma/discussions/10709) — community verified, MEDIUM confidence
- [Neon cold start and connection latency](https://neon.com/docs/connect/connection-latency) — official, HIGH confidence
- [Prisma v7 migration guide](https://www.buildwithmatija.com/blog/migrate-prisma-v7-nextjs-16-turbopack-fix) — community, MEDIUM confidence
- Project CONCERNS.md — internal audit, HIGH confidence (first-hand codebase analysis)

---

_Pitfalls research for: MaosFalam backend — Neon + Prisma v7 + Clerk + GPT-4o_
_Researched: 2026-04-10_

# Architecture Research

**Domain:** Next.js 16 App Router backend — AI vision pipeline + Neon/Prisma + Clerk auth
**Researched:** 2026-04-10
**Confidence:** HIGH (based on actual codebase inspection + verified package versions)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT (Browser / React)                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │  Pages      │  │  Hooks      │  │  Client Adapters         │ │
│  │ /ler/scan   │→ │ useMock     │→ │ reading-client.ts        │ │
│  │ /conta/...  │  │ useAuth     │  │ user-client.ts           │ │
│  └─────────────┘  └─────────────┘  └────────────┬─────────────┘ │
└───────────────────────────────────────────────── │ ─────────────┘
                                                   │ fetch()
┌──────────────────────────────────────────────────┼─────────────┐
│  MIDDLEWARE (src/middleware.ts)                   │             │
│  Clerk: protect /conta/*, /api/reading/new,      │             │
│         /api/credits/*, /api/user/*              │             │
└──────────────────────────────────────────────────┼─────────────┘
                                                   │
┌──────────────────────────────────────────────────┼─────────────┐
│  API ROUTES (src/app/api/)                        │             │
│  ┌──────────────────┐  ┌────────────────────────┐│             │
│  │ Public routes    │  │ Auth-required routes   ││             │
│  │ /lead/register   │  │ /reading/new           ││             │
│  │ /reading/capture │  │ /user/{profile,credits,││             │
│  │ /reading/[id]    │  │  readings,account}     ││             │
│  └────────┬─────────┘  └───────────┬────────────┘│             │
└───────────┼──────────────────────── │ ────────────┘
            │                         │
┌───────────┼─────────────────────────┼───────────────────────────┐
│  SERVER LIBS (src/server/lib/)      │                           │
│  ┌────────┴──────┐  ┌──────┴──────┐ ┌──────────┐  ┌──────────┐ │
│  │  openai.ts    │  │  prisma.ts  │ │ auth.ts  │  │ logger   │ │
│  │  analyzeHand()│  │  singleton  │ │  Clerk   │  │  Pino    │ │
│  └────────┬──────┘  └──────┬──────┘ └──────────┘  └──────────┘ │
│           │                │                                     │
│  ┌────────┴──────┐  ┌──────┴──────┐ ┌──────────┐               │
│  │ select-blocks │  │  resend.ts  │ │rate-limit│               │
│  │  <1ms, no I/O │  │  email send │ │ in-memory│               │
│  └───────────────┘  └─────────────┘ └──────────┘               │
└──────────────────────────────────────────────────────────────────┘
            │
┌───────────┼──────────────────────────────────────────────────────┐
│  DATA LAYER                                                      │
│  ┌────────┴──────┐  ┌──────────────────────┐                    │
│  │  Neon Postgres│  │ Static blocks         │                    │
│  │  (serverless) │  │ src/data/blocks/*.ts  │                    │
│  │  5 tables     │  │ no I/O — pure TS objs │                    │
│  └───────────────┘  └──────────────────────┘                    │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component                         | Responsibility                                          | Implementation                                      |
| --------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| `src/middleware.ts`               | Auth guard via Clerk on protected routes                | `clerkMiddleware` + `createRouteMatcher`            |
| `src/app/api/*/route.ts`          | HTTP endpoint: validate, orchestrate, respond           | Zod parse → business logic → NextResponse           |
| `src/server/lib/openai.ts`        | Wrap GPT-4o vision API, return `HandAttributes`         | Raw fetch to OpenAI, `response_format: json_object` |
| `src/server/lib/select-blocks.ts` | `HandAttributes + name + gender → ReportJSON`           | Pure function, deterministic, <1ms, zero I/O        |
| `src/server/lib/prisma.ts`        | Prisma client singleton with Neon driver adapter        | `PrismaNeon` adapter, globalThis singleton pattern  |
| `src/server/lib/auth.ts`          | Extract Clerk user ID or full user from request context | `auth()` and `currentUser()` from Clerk             |
| `src/server/lib/rate-limit.ts`    | In-memory IP rate limiting                              | `Map<string, {count, resetAt}>` with TTL            |
| `src/server/lib/resend.ts`        | Send transactional email (non-blocking fire-and-forget) | Resend SDK, called without await in routes          |
| `src/server/lib/logger.ts`        | Structured logging without PII                          | Pino, logs only IDs and actions                     |
| `src/data/blocks/*.ts`            | All reading text content by axis/variation              | TypeScript const objects, imported by select-blocks |

---

## Recommended Project Structure

The structure already exists and is correct. Mapping actual paths to their roles:

```
src/
├── middleware.ts              # Clerk auth gate — runs on every non-static request
│
├── app/api/                   # HTTP surface — one folder per resource
│   ├── lead/register/         # POST — saves lead before reading
│   ├── reading/
│   │   ├── capture/           # POST — photo → AI → report → DB (public, rate-limited)
│   │   ├── [id]/              # GET — fetch reading by UUID (public)
│   │   └── new/               # POST — debit credit FIFO (auth required)
│   ├── user/
│   │   ├── credits/           # GET — balance + pack list (auth required)
│   │   ├── readings/          # GET — history (auth required)
│   │   ├── profile/           # GET + PUT — Clerk-backed profile (auth required)
│   │   └── account/           # DELETE — soft delete (auth required)
│   ├── credits/purchase/      # POST — creates AbacatePay billing (auth required, out of scope)
│   └── webhook/abacatepay/    # POST — payment confirmation (signature-validated)
│
├── server/lib/                # Pure server logic — never imported by client code
│   ├── prisma.ts              # DB client singleton
│   ├── openai.ts              # GPT-4o wrapper
│   ├── select-blocks.ts       # Reading engine (pure function)
│   ├── auth.ts                # Clerk helpers (getClerkUserId, getClerkUser)
│   ├── rate-limit.ts          # In-memory Map rate limiter
│   ├── resend.ts              # Email wrapper
│   ├── abacatepay.ts          # Payment wrapper (future)
│   └── logger.ts              # Pino logger
│
├── lib/                       # Client-side adapters (browser bundle)
│   ├── reading-client.ts      # captureReading, getReading, registerLead, requestNewReading
│   ├── user-client.ts         # getUserProfile, getUserReadings, getUserCredits
│   └── payment-client.ts      # requestPayment, getCheckoutIntent
│
├── data/blocks/               # Static content — pure TS, zero I/O
│   └── *.ts                   # heart, head, life, fate, mounts, rare-signs, crossings...
│
└── types/                     # Shared contracts across all layers
    ├── hand-attributes.ts     # HandAttributes (GPT-4o output shape)
    ├── report.ts              # ReportJSON (selectBlocks output shape)
    └── blocks.ts              # TextBlock, LineBlocks, MeasurementSet
```

### Structure Rationale

- **`src/server/lib/`:** Never imported by client code. Contains secrets (OPENAI_API_KEY, DATABASE_URL). Tree-shaken from browser bundle by Next.js when not in API route context.
- **`src/lib/`:** Client adapters that call API routes. Only layer allowed to use `fetch()` from the browser. Mock-to-real transition point via `useMock()` hook.
- **`src/data/blocks/`:** Static TypeScript objects (not a database). No Prisma, no I/O. Imported only by `select-blocks.ts`. Keeps content editing separate from logic.
- **`src/types/`:** Enforces the contract between GPT-4o response schema, `selectBlocks` input, and `ReportJSON` output. Changing these types propagates type errors immediately.

---

## Architectural Patterns

### Pattern 1: Zod → Validate → Logic

Every API route follows the same entry pattern: Zod schema at the top, parse before any business logic runs.

**What:** Input validation as the first gate, before DB queries or AI calls
**When to use:** Every API route without exception
**Trade-offs:** 400s fail fast (good), Zod error messages are developer-facing (expose to client only after sanitizing)

```typescript
const schema = z.object({
  photo_base64: z.string().min(100),
  lead_id: z.string().uuid(),
  target_name: z.string().min(2).max(100),
  target_gender: z.enum(["female", "male"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = schema.parse(body); // throws ZodError → caught below → 400
  // ... business logic with typed `data`
}
```

### Pattern 2: Prisma Transaction for Credit Debit

Credit operations use `prisma.$transaction()` to prevent double-debit or partial state.

**What:** FIFO credit debit wrapped in a serializable transaction
**When to use:** Any operation that modifies `credit_packs.remaining` or `readings.tier`
**Trade-offs:** Adds latency (~10ms), prevents oversell — always worth it for money operations

```typescript
const result = await prisma.$transaction(async (tx) => {
  const pack = await tx.creditPack.findFirst({
    where: { clerkUserId, remaining: { gt: 0 } },
    orderBy: { createdAt: "asc" }, // FIFO: oldest pack first
  });
  if (!pack) return { ok: false };

  await tx.creditPack.update({
    where: { id: pack.id },
    data: { remaining: pack.remaining - 1 },
  });
  return { ok: true };
});
```

### Pattern 3: Non-Blocking Fire-and-Forget for Email

Email sending happens after the API response is already returned to the client. Don't await it.

**What:** Email call without `await`, so the HTTP response returns immediately
**When to use:** Any notification that doesn't affect the result (post-capture email, post-payment email)
**Trade-offs:** Email failures are silent (acceptable for notifications, not for critical paths). Log errors inside the email wrapper.

```typescript
// After saving reading to DB, return response immediately
const response = NextResponse.json({ reading_id: reading.id, report });

// Fire email without blocking response
sendLeadReading(lead.email, lead.name, readingUrl); // no await

return response;
```

### Pattern 4: Prisma Client Singleton with Neon Driver Adapter

Neon is serverless Postgres. Each Next.js serverless function invocation needs connection reuse — not a new connection per request.

**What:** `globalThis` singleton pattern to reuse the Prisma client across hot reloads in dev and across invocations in production
**When to use:** Always — single file `src/server/lib/prisma.ts`
**Trade-offs:** Only works correctly when `PrismaNeon` adapter handles connection pooling (it does via `@neondatabase/serverless`)

```typescript
// Current implementation (prisma.ts) — correct pattern
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Important:** `prisma/schema.prisma` sets `output = "../src/generated/prisma"`. Generated client lives in `src/generated/prisma/`, not in `node_modules`. Import path is `@/generated/prisma/client`, not `@prisma/client`.

### Pattern 5: Clerk Middleware Chain

Clerk middleware runs before every non-static request. Protected routes call `auth.protect()` which throws a redirect if unauthenticated.

**What:** Route-level auth enforcement in a single place
**When to use:** Add new protected routes to `createRouteMatcher` in `src/middleware.ts`
**Trade-offs:** Protects API routes AND page routes with the same config. If you forget to add a new route, it silently stays public — always check the matcher list when adding auth-required routes.

```typescript
// Current middleware.ts — correct pattern
const isProtectedRoute = createRouteMatcher([
  "/api/reading/new(.*)",
  "/api/credits/(.*)",
  "/api/user/(.*)",
  "/conta(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

**Inside API routes**, extract the user with helpers from `src/server/lib/auth.ts`:

- `getClerkUserId()` — fast, only gets the ID
- `getClerkUser()` — slower, fetches full name + email from Clerk

---

## Data Flow

### Primary Flow: Photo → Report

```
[CameraViewport captures base64]
         ↓
[/ler/scan page calls captureReading() — reading-client.ts]
         ↓
[POST /api/reading/capture]
         ├─ rateLimit(`capture:${ip}`, 5) → 429 if exceeded
         ├─ schema.parse(body) → 400 if invalid
         ├─ analyzeHand(photo_base64) → GPT-4o → HandAttributes
         ├─ confidence < 0.3 → 422 LOW_CONFIDENCE
         ├─ selectBlocks(attributes, name, gender) → ReportJSON [<1ms]
         ├─ prisma.reading.create({ attributes, report, tier: 'free' })
         ├─ sendLeadReading(email) [fire-and-forget, no await]
         └─ return { reading_id, report }
                  ↓
[Client navigates to /ler/resultado/[id]]
[Frontend renders from report in response (NOT a second DB fetch)]
```

### Credit Debit Flow (Authenticated)

```
[User clicks "Nova leitura" — logada]
         ↓
[POST /api/reading/new]  (Clerk middleware → auth.protect())
         ├─ getClerkUserId()
         ├─ schema.parse(body)
         ├─ prisma.$transaction:
         │    ├─ findFirst creditPack WHERE remaining > 0 ORDER BY createdAt ASC
         │    ├─ if none → 402 "Sem creditos"
         │    └─ update creditPack SET remaining -= 1
         └─ return { ok: true, credits_remaining: N }
                  ↓
[Frontend proceeds to camera → capture flow above]
```

### Auth State Flow

```
[Clerk handles login/OAuth — no custom code]
         ↓
[useAuth hook: localStorage sync of { id, name, email }]
[Synced across tabs via custom 'maosfalam:auth' event]
         ↓
[API routes: getClerkUserId() or getClerkUser() from server context]
[No JWT parsing in app code — Clerk middleware handles it]
```

### Report Tier Gate

```
[Reading saved with tier: 'free' always at capture time]
[Report JSON includes ALL sections (free + premium)]
         ↓
[Frontend ResultStateSwitcher checks reading.tier]
[tier === 'free' → renders BlurredCard for premium sections]
[tier === 'premium' → renders ReadingSection for all sections]
         ↓
[Upgrade: payment webhook → prisma.reading.update({ tier: 'premium' })]
[No recomputation of report — same JSONB, just flag changes]
```

---

## Component Boundaries

| Boundary                    | Direction                              | Contract                                 |
| --------------------------- | -------------------------------------- | ---------------------------------------- |
| Client Adapter → API Route  | HTTP (fetch)                           | Typed request body + typed JSON response |
| API Route → Server Lib      | Direct import                          | TypeScript function calls, no HTTP       |
| Server Lib → Neon           | Prisma Client (`@prisma/adapter-neon`) | Typed Prisma queries                     |
| Server Lib → OpenAI         | Raw fetch to `api.openai.com`          | JSON with `response_format: json_object` |
| Server Lib → Clerk          | `@clerk/nextjs/server` imports         | `auth()`, `currentUser()`                |
| Middleware → Clerk          | `clerkMiddleware` wrapper              | Request + response objects               |
| select-blocks → data/blocks | Direct import                          | TypeScript module imports, zero I/O      |

**Hard rule:** `src/server/lib/` is never imported in `src/lib/` (client adapters), `src/components/`, or `src/hooks/`. The boundary is enforced by naming convention — server code stays in `server/`. Next.js also enforces this: server libs that read `process.env` (without `NEXT_PUBLIC_`) are not bundled into the client.

---

## Suggested Build Order (Phase Dependencies)

The following order respects technical dependencies between components:

```
1. Schema + Prisma setup
   └─ prisma/schema.prisma → npx prisma generate → src/generated/prisma/

2. Server lib infrastructure (no business logic)
   ├─ src/server/lib/logger.ts        (Pino — no deps)
   ├─ src/server/lib/prisma.ts        (Prisma client — depends on generated types)
   ├─ src/server/lib/rate-limit.ts    (in-memory Map — no deps)
   └─ src/server/lib/auth.ts          (Clerk helpers — depends on @clerk/nextjs/server)

3. Middleware
   └─ src/middleware.ts               (depends on Clerk package + routes being known)

4. AI + Reading Engine (core business value)
   ├─ src/server/lib/openai.ts        (GPT-4o wrapper — depends on logger)
   └─ src/server/lib/select-blocks.ts (reading engine — depends on data/blocks)

5. Public API routes (no auth required)
   ├─ POST /api/lead/register         (depends on: prisma, rate-limit, logger)
   ├─ POST /api/reading/capture       (depends on: openai, select-blocks, prisma, resend, rate-limit)
   └─ GET  /api/reading/[id]          (depends on: prisma)

6. Auth-required API routes
   ├─ POST /api/reading/new           (depends on: auth, prisma — FIFO credit debit)
   ├─ GET  /api/user/credits          (depends on: auth, prisma)
   ├─ GET  /api/user/readings         (depends on: auth, prisma)
   ├─ GET/PUT /api/user/profile       (depends on: auth, prisma, Clerk)
   └─ DELETE /api/user/account        (depends on: auth, prisma)

7. Client adapters (connect frontend mocks to real API)
   ├─ src/lib/reading-client.ts       (replaces mock captureReading)
   └─ src/lib/user-client.ts          (replaces mock user data)

8. Email (last — depends on external domain config)
   └─ src/server/lib/resend.ts        (sendLeadReading — used by capture route)
```

**Why this order:**

- Prisma schema first because all server libs depend on generated types
- Infrastructure libs before business logic (logger used everywhere)
- Middleware before protected routes (routes don't work correctly without it)
- Public routes before auth routes (capture is the highest value, test it early)
- Client adapters last: frontend already works with mocks, swap in when API is stable

---

## Scaling Considerations

| Scale          | Architecture Adjustments                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0-1k users     | Current setup. In-memory rate limit is fine (single server). Neon free tier handles it.                                                                                                     |
| 1k-10k users   | Move rate limit to Upstash Redis (`@upstash/ratelimit`). In-memory fails on multi-instance Vercel. Consider caching `GET /api/reading/[id]` with `next: { revalidate: 3600 }`.              |
| 10k-100k users | Neon connection pooling via PgBouncer (Neon provides this). OpenAI costs become significant (~R$700/mo at 10k readings). Consider adding a queue (Upstash QStash) to smooth AI call bursts. |
| 100k+ users    | Report generation pipeline moves to async job queue. Webhook processing gets dedicated worker. Database read replicas for /api/user/\* queries.                                             |

### First Bottleneck

Rate limiting via in-memory Map fails at multi-instance deployment. Vercel runs multiple serverless instances. Keys set in one instance are invisible to another. Fix: migrate `rate-limit.ts` to `@upstash/ratelimit` before going to production at any meaningful scale.

---

## Anti-Patterns

### Anti-Pattern 1: Reading report re-fetched from DB on every page load

**What people do:** Save only `reading_id` to client state, re-fetch full report JSON on result page mount
**Why it's wrong:** Adds latency, increases DB load, and the report JSON is already returned by `/api/reading/capture`. The frontend gets the full report in the initial response.
**Do this instead:** Pass `report` in navigation state or cache in `sessionStorage`. Only fetch from `/api/reading/[id]` when restoring a saved reading from `/conta/leituras/[id]`.

### Anti-Pattern 2: Tier upgrade from client

**What people do:** Client sends `{ tier: 'premium' }` to an update endpoint after payment
**Why it's wrong:** Tier is a money gate. Client-controlled upgrade = anyone can skip payment.
**Do this instead:** Tier changes only through the webhook route (`/api/webhook/abacatepay`), which validates AbacatePay signature before touching the DB.

### Anti-Pattern 3: Awaiting email send in request handler

**What people do:** `await sendLeadReading(...)` inside the POST handler before returning
**Why it's wrong:** Email APIs take 200-800ms. The reading capture already spent ~3s on GPT-4o. Adding email latency makes the user wait ~4s for their reading.
**Do this instead:** Fire without await. Errors are caught inside `sendLeadReading()` and logged. The reading was saved — email failure is recoverable.

### Anti-Pattern 4: Importing server libs in client components

**What people do:** `import { prisma } from '@/server/lib/prisma'` in a React component
**Why it's wrong:** Bundles Prisma + database credentials into the browser bundle. Causes build errors and security issues.
**Do this instead:** Server libs are only imported in `src/app/api/*/route.ts` files and other server-only code. Client components call `src/lib/*-client.ts` adapters.

### Anti-Pattern 5: selectBlocks called with async I/O inside it

**What people do:** Adding a DB query or external call inside `selectBlocks` to fetch a block
**Why it's wrong:** `selectBlocks` is a pure function, <1ms, no I/O. Its performance characteristic is a feature. All content lives in `src/data/blocks/` as static TypeScript. The design is intentional.
**Do this instead:** New content goes into `src/data/blocks/*.ts` as TypeScript constants. `selectBlocks` imports them at module load time.

---

## Integration Points

### External Services

| Service       | Integration Pattern                                                    | Notes                                                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OpenAI GPT-4o | Raw `fetch()` in `openai.ts` — no SDK                                  | `response_format: {type: 'json_object'}` enforces JSON output. `detail: 'high'` for vision quality. Prompt tells GPT-4o to return ONLY JSON (no markdown).                           |
| Neon Postgres | `@prisma/adapter-neon` driver adapter + `@neondatabase/serverless`     | Serverless-native connection. No `DATABASE_URL` with `?sslmode=require` needed — Neon adapter handles TLS.                                                                           |
| Clerk         | `@clerk/nextjs` v7 — `clerkMiddleware` + `auth()` / `currentUser()`    | `ClerkProvider` in `app/layout.tsx` for client. Server calls use `auth()` from `@clerk/nextjs/server`. Clerk handles ALL auth emails (reset, verification) — do not implement these. |
| Resend        | `resend` npm SDK in `resend.ts`                                        | Used only for transactional product emails (not auth). Domain `maosfalam.com.br` must be verified in Resend before sending.                                                          |
| AbacatePay    | `abacatepay.ts` wrapper — Bearer token auth to `api.abacatepay.com/v2` | Webhook handler at `/api/webhook/abacatepay` must validate HMAC signature before any DB writes.                                                                                      |

### Internal Boundaries

| Boundary                 | Communication                                       | Notes                                                                                    |
| ------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Frontend → API           | HTTP via `src/lib/*.ts` adapters                    | Never call API directly from components. Adapters are the only fetch() layer.            |
| API Route → selectBlocks | Direct TypeScript import                            | Pure function call. No HTTP, no async, no I/O.                                           |
| API Route → Prisma       | Direct TypeScript import from `@/server/lib/prisma` | Never instantiate PrismaClient inline — always import the singleton.                     |
| API Route → Clerk        | Via `@/server/lib/auth.ts` helpers                  | Wraps `auth()` and `currentUser()` with typed return values.                             |
| Middleware → API Routes  | No direct communication                             | Middleware runs before routes. If `auth.protect()` throws, the API route never executes. |

---

## Key Architecture Decisions (Verified in Code)

| Decision                    | Current State                           | Implication                                                                                                                                  |
| --------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Prisma 7.x (not v6)         | `@prisma/client@^7.7.0` in package.json | `prisma/schema.prisma` uses `generator client { provider = "prisma-client" }` (not `prisma-client-js`) — this is the Prisma 7 provider name. |
| Custom generated output     | `output = "../src/generated/prisma"`    | Import path is `@/generated/prisma/client` not `@prisma/client`. Affects all server lib imports.                                             |
| No OpenAI SDK               | Raw fetch in `openai.ts`                | Avoids SDK version churn. Simpler. Works identically.                                                                                        |
| Clerk v7                    | `@clerk/nextjs@^7.0.12`                 | API is `clerkMiddleware` (not `authMiddleware` which was v4). Server-side uses `auth()` not `getAuth()`.                                     |
| In-memory rate limit        | `Map` in `rate-limit.ts`                | Correct for single-instance MVP. Will fail silently on multi-instance Vercel. Flag for migration before launch.                              |
| Report stored as full JSONB | `readings.report JSONB`                 | Frontend tier logic is purely presentational. No report recomputation on upgrade. Single source of truth.                                    |

---

## Sources

- Actual codebase inspection: `src/server/lib/*.ts`, `src/app/api/**/*.ts`, `src/middleware.ts`, `prisma/schema.prisma`
- Package versions verified: `package.json` (Prisma 7.7, Clerk 7.0.12, Next.js 16.2.3)
- Planned architecture: `docs/architecture.md`
- Project requirements: `.planning/PROJECT.md`
- Codebase analysis: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`

---

_Architecture research for: Next.js 16 App Router backend with Neon/Prisma/Clerk/GPT-4o_
_Researched: 2026-04-10_

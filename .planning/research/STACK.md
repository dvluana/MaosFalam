# Stack Research

**Domain:** Next.js 16 App Router backend — database, auth, AI vision, payments, email
**Researched:** 2026-04-10
**Confidence:** HIGH (verified against official docs and current codebase)

---

## Context

This is an additive research document. The frontend stack (Next.js 16.2.3, React 19.2.4,
Tailwind v4, Framer Motion 12) is already established and not re-researched here. The
codebase already has the backend libraries installed and partially configured. Research
focus: verify the installed versions are correct, document the exact setup patterns for
each integration, and surface gotchas discovered via official docs.

---

## Recommended Stack

### Core Technologies

| Technology                    | Version (installed) | Purpose                | Why Recommended                                                                                                                                                                                                                                           |
| ----------------------------- | ------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router API routes | 16.2.3              | API layer              | Co-located server functions with no separate server process. Vercel deploys each route as an isolated serverless function.                                                                                                                                |
| Prisma ORM                    | 7.7.0               | Database ORM           | Rust-free architecture in v7 makes it lighter in serverless. Type-safe queries from schema. Driver adapter pattern is the required approach for Neon.                                                                                                     |
| @prisma/adapter-neon          | 7.7.0               | Neon connection driver | Official adapter that bundles everything needed for Neon serverless WebSocket connections. Replaces the need for a separate pg or @neondatabase/serverless dependency.                                                                                    |
| @clerk/nextjs                 | 7.0.12              | Auth provider          | 50K users free. Google OAuth + email/password built-in. Session management and JWT validation handled by SDK — zero custom auth code. `clerkMiddleware()` works in both `middleware.ts` (Clerk routes) and the new `proxy.ts` (Next.js 16 network proxy). |
| Zod                           | 4.3.6               | Input validation       | TypeScript-first schema validation. v4 is a breaking change from v3 — the installed version is v4. Every API route input must pass a Zod schema before reaching business logic.                                                                           |
| Pino                          | 10.3.1              | Structured logging     | JSON-format logs in production, colored output in dev via pino-pretty. Fastest Node.js logger. Never log names, emails, CPF — only IDs and actions.                                                                                                       |

### AI Vision

| Technology             | Version              | Purpose              | Why Recommended                                                                                                                                                                                                                                          |
| ---------------------- | -------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAI API (raw fetch) | — (no SDK installed) | GPT-4o palm analysis | The codebase correctly uses a raw `fetch` wrapper rather than the `openai` npm SDK. For a single structured-output call, the SDK adds ~150KB of weight with no benefit. The existing `analyzeHand()` in `src/server/lib/openai.ts` is the right pattern. |
| gpt-4o                 | current              | Palm image analysis  | Best multimodal model for detecting fine lines in a JPEG. Use `response_format: { type: "json_object" }` with system prompt containing the JSON schema. Set `detail: "high"` on the image for line detection accuracy.                                   |

### Database

| Technology      | Version              | Purpose           | Why Recommended                                                                                                                                                                                                         |
| --------------- | -------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neon PostgreSQL | — (external service) | Primary database  | Serverless Postgres with branching for dev/staging. Free tier covers MVP. Connection pooling built in to the adapter.                                                                                                   |
| Prisma Migrate  | (via Prisma 7.7.0)   | Schema migrations | Use `npx prisma migrate dev` for local, `npx prisma migrate deploy` in CI. `prisma.config.ts` must point `datasource.url` to `DIRECT_URL` (unpooled) — Prisma Migrate requires a direct connection, not the pooled one. |

### Payments (deferred, pattern documented)

| Technology    | Version              | Purpose             | Why Recommended                                                                                                                                                                                                            |
| ------------- | -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AbacatePay v2 | — (external service) | PIX + card payments | Brazilian payment processor. The codebase uses a custom fetch wrapper in `src/server/lib/abacatepay.ts`. Base URL: `https://api.abacatepay.com/v2`. Bearer token auth. Webhook validation via HMAC SHA256 on request body. |

### Email (deferred, pattern documented)

| Technology | Version | Purpose             | Why Recommended                                                                                      |
| ---------- | ------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| Resend SDK | 6.10.0  | Transactional email | Simple REST SDK. Never blocks main flow on failure. `From` must use verified domain once configured. |

### Rate Limiting

| Technology    | Version    | Purpose           | Why Recommended                                                                                                                                                                                                                            |
| ------------- | ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| In-memory Map | — (custom) | MVP rate limiting | `src/server/lib/rate-limit.ts`. Zero dependencies, zero latency. Sufficient for MVP since each Vercel function instance is isolated and limits are per-instance. Migrate to `@upstash/ratelimit` + Redis when scaling to multiple regions. |

---

## Critical Gotchas (verified against official docs)

### 1. Prisma 7: `@neondatabase/serverless` is a redundant dependency

**Finding:** `@neondatabase/serverless ^1.0.2` is in `package.json` as a separate dependency. Per Prisma 7 + Neon official docs, `@prisma/adapter-neon` bundles everything needed. Installing `@neondatabase/serverless` separately is harmless but unnecessary weight.

**Action:** Remove `@neondatabase/serverless` from `dependencies` when convenient. Not urgent — it causes no runtime errors, just package bloat.

**Confidence:** HIGH — verified at [neon.com/docs/guides/prisma](https://neon.com/docs/guides/prisma)

---

### 2. Prisma 7: `prisma.config.ts` needs `DIRECT_URL` for migrations

**Finding:** The current `prisma.config.ts` points `datasource.url` to `process.env["DATABASE_URL"]`. Neon provides two connection strings: a pooled URL (with `-pooler` in hostname, for app runtime) and a direct URL (no pooler, for Prisma CLI/migrations).

**Current state:** Schema only has `DATABASE_URL`. Prisma Migrate will fail at deploy time if `DATABASE_URL` is the pooled URL, because Neon's connection pooler (PgBouncer) does not support the `CREATE DATABASE` and DDL transactions that Prisma Migrate uses.

**Fix needed:** Add `DIRECT_URL` env var pointing to Neon's unpooled connection string. Update `prisma.config.ts`:

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"], // unpooled — for migrations
  },
});
```

The application's `PrismaNeon` adapter in `src/server/lib/prisma.ts` should continue using `DATABASE_URL` (pooled) at runtime.

**Confidence:** HIGH — verified at [neon.com/docs/guides/prisma](https://neon.com/docs/guides/prisma) and [prisma.io/docs upgrading to v7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)

---

### 3. Prisma 7: import path is `@/generated/prisma/client`, NOT `@prisma/client`

**Finding (already correct):** The codebase correctly imports from `@/generated/prisma/client`. In Prisma 7, `PrismaClient` is no longer generated into `node_modules/@prisma/client`. The `schema.prisma` correctly sets `output = "../src/generated/prisma"`.

**Status:** Already correct. Document this to prevent accidental regression if a developer writes `import { PrismaClient } from "@prisma/client"` — that import will silently not have the schema types.

**Confidence:** HIGH — verified at [prisma.io upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)

---

### 4. Next.js 16: `middleware.ts` is deprecated, `proxy.ts` is the new network boundary

**Finding:** Next.js 16 introduced `proxy.ts` to replace `middleware.ts`. Key distinction:

- `proxy.ts` — Node.js runtime, for network-level rewrites/redirects/headers. Runs before the app router.
- `middleware.ts` — still supported but deprecated. Will be removed in a future version. Edge runtime use cases only.

**Current state:** The codebase has both files:

- `src/middleware.ts` — Clerk authentication protection (correct, needed for auth logic)
- `src/proxy.ts` — static HTML rewrite for `/manifesto` (correct use of proxy pattern)

The Clerk `clerkMiddleware()` currently lives in `middleware.ts`. Per Clerk docs, for Next.js 16+ this should live in `proxy.ts`. However, the current setup works — `middleware.ts` is still supported, just deprecated. The `proxy.ts` takes precedence for network-level operations.

**Action for later:** When `middleware.ts` is eventually removed by Next.js, migrate `clerkMiddleware()` into `proxy.ts` alongside the static rewrites. The implementation code is identical — only the file changes.

**Confidence:** HIGH — verified at [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16)

---

### 5. Next.js 16: `revalidateTag()` now requires second argument

**Finding:** `revalidateTag(tag)` single-argument form is deprecated. Now requires a `cacheLife` profile: `revalidateTag('tag', 'max')`. This only matters when cache invalidation is used.

**Status:** Not yet relevant — no caching implemented. Document for when it's added.

**Confidence:** HIGH — verified at [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16)

---

### 6. Zod v4: breaking changes from v3

**Finding:** The installed Zod is `^4.3.6` — Zod v4. Critical breaking changes vs v3:

- `z.string().email()` → use `z.email()` (method became top-level)
- `z.string().uuid()` → use `z.guid()` (v4's `z.uuid()` enforces RFC 4122, different from v3)
- `error.errors` → `error.issues`
- `z.record()` now requires two arguments: `z.record(keySchema, valueSchema)`
- Error param replaces `message` param (backward compatible, `message` still works but deprecated)

**Action:** API routes using Zod must use v4 syntax. Do not mix v3 patterns.

**Confidence:** HIGH — verified at [zod.dev/v4/changelog](https://zod.dev/v4/changelog)

---

### 7. OpenAI: raw fetch is correct, SDK not needed

**Finding:** The current `analyzeHand()` uses raw `fetch` to `https://api.openai.com/v1/chat/completions`. The `openai` npm SDK (latest: 6.34.0) is NOT installed, which is correct for this use case.

**Rationale:** The codebase makes a single type of call — structured JSON output from a vision model. Adding the SDK for this adds package weight and complexity without benefit. The existing pattern is correct.

**One improvement:** Put the instruction text before the image in the `content` array. The model processes content sequentially — text-first primes it for what to extract and measurably improves extraction accuracy per OpenAI docs.

**Current order (suboptimal):**

```
content: [{ type: "image_url", ... }, { type: "text", text: "Analise..." }]
```

**Recommended order:**

```
content: [{ type: "text", text: "Analise esta palma." }, { type: "image_url", ... }]
```

**Confidence:** MEDIUM — verified at [developers.openai.com/api/docs/guides/images-vision](https://developers.openai.com/api/docs/guides/images-vision)

---

### 8. Clerk v7: `auth()` is async in Next.js App Router

**Finding:** In `@clerk/nextjs` v7 with Next.js App Router, `auth()` must be called with `await`:

```typescript
const { userId } = await auth(); // v7 pattern
```

**Also confirmed:** `clerkMiddleware()` from `@clerk/nextjs/server` is the correct export. The existing `src/middleware.ts` uses this correctly with `createRouteMatcher`.

**Confidence:** HIGH — verified at [clerk.com/docs/reference/nextjs/clerk-middleware](https://clerk.com/docs/reference/nextjs/clerk-middleware)

---

## Alternatives Considered

| Recommended                     | Alternative        | Why Not                                                                                                                                                                                                                         |
| ------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prisma 7 + @prisma/adapter-neon | Drizzle ORM        | Drizzle is lighter but less mature type inference for JSONB columns. Prisma's type safety for the `attributes` and `report` JSONB fields is better.                                                                             |
| Prisma 7 + @prisma/adapter-neon | Prisma Accelerate  | Accelerate is Prisma's global connection pool CDN — useful at scale, not needed for MVP. The direct Neon adapter is sufficient.                                                                                                 |
| Clerk                           | Auth.js (NextAuth) | Auth.js requires building your own OAuth flows and session storage. Clerk handles Google OAuth, email/password, magic links, and session management with zero custom code. 50K free users covers MVP.                           |
| Clerk                           | Supabase Auth      | Already using Neon, not Supabase. Using Supabase just for auth without Supabase DB creates unnecessary coupling.                                                                                                                |
| Raw fetch for OpenAI            | openai npm SDK     | SDK adds ~150KB for a single endpoint. No streaming needed. No benefit over fetch for this use case.                                                                                                                            |
| In-memory rate limiting         | @upstash/ratelimit | Upstash requires a Redis instance (free tier available). In-memory is sufficient for MVP — Vercel function instances are short-lived and the limits (5 req/hour per IP) tolerate some drift across instances. Migrate at scale. |
| Pino                            | Winston            | Pino is 5-7x faster than Winston for high-throughput JSON logging. Better fit for serverless cold starts.                                                                                                                       |

---

## What NOT to Use

| Avoid                                               | Why                                                                                                                                 | Use Instead                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `import { PrismaClient } from "@prisma/client"`     | Prisma 7 no longer generates to node_modules — this import will have no schema types                                                | `import { PrismaClient } from "@/generated/prisma/client"`                                                   |
| `@neondatabase/serverless` directly                 | Bundled inside `@prisma/adapter-neon` in Prisma 7. Using it directly creates version conflicts and duplicates the connection logic. | Let `@prisma/adapter-neon` manage it                                                                         |
| Pooled `DATABASE_URL` in `prisma.config.ts`         | Prisma Migrate fails against PgBouncer (Neon's connection pooler) — DDL transactions are not supported                              | Add `DIRECT_URL` (unpooled) for `prisma.config.ts`, keep `DATABASE_URL` (pooled) for the app's Prisma client |
| `middleware.ts` for new auth logic (long-term)      | Deprecated in Next.js 16, will be removed in a future version                                                                       | Migrate Clerk logic to `proxy.ts` when feasible                                                              |
| `z.string().email()` / `z.string().uuid()`          | Zod v3 patterns — these methods moved in v4                                                                                         | `z.email()`, `z.guid()`                                                                                      |
| Storing `OPENAI_API_KEY` in any `NEXT_PUBLIC_*` var | Exposes key to client bundle                                                                                                        | Server-only env var, never prefixed with `NEXT_PUBLIC_`                                                      |

---

## Version Compatibility

| Package                       | Compatible With                                             | Notes                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `@clerk/nextjs ^7.0.12`       | Next.js 16.x, React 19                                      | v7 is compatible. `auth()` is async. File should be `proxy.ts` in Next.js 16 but `middleware.ts` still works (deprecated).      |
| `@prisma/adapter-neon ^7.7.0` | `@prisma/client ^7.7.0`                                     | Versions must match exactly. Both are `^7.7.0` — correct.                                                                       |
| `@prisma/adapter-neon ^7.7.0` | `@neondatabase/serverless ^1.0.2`                           | Adapter bundles its own version of the Neon driver. The separately installed `@neondatabase/serverless` is unused but harmless. |
| `zod ^4.3.6`                  | No `@hookform/resolvers` or `zod-to-json-schema` in project | If adding form validation libraries later, verify they support Zod v4 (tRPC v11+, `@hookform/resolvers v4+` required).          |
| `next 16.2.3`                 | Node.js 20.9+                                               | Next.js 16 dropped Node.js 18 support. Current requirement is Node.js 20.9.0 LTS minimum.                                       |
| `pino ^10.3.1`                | `pino-pretty ^13.1.3`                                       | Compatible. Use `pino-pretty` only in dev — set via `transport` option, not in production.                                      |

---

## Installation

All packages are already installed. No new packages required for the backend milestone.

```bash
# Already installed — listed for documentation

# Core backend
npm install @clerk/nextjs @prisma/adapter-neon @prisma/client prisma zod pino pino-pretty

# Prisma code generation (must run after schema changes)
npx prisma generate

# Migrations (uses DIRECT_URL from prisma.config.ts)
npx prisma migrate dev --name init

# Production migration (CI)
npx prisma migrate deploy
```

If adding email or payments later:

```bash
# Already installed
npm install resend
# No SDK for OpenAI or AbacatePay — raw fetch wrappers are the correct pattern
```

---

## Environment Variables (complete list)

```env
# Clerk (auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...   # client-safe, public
CLERK_SECRET_KEY=sk_...                     # server-only

# OpenAI (vision)
OPENAI_API_KEY=sk-...                       # server-only

# Neon PostgreSQL
DATABASE_URL=postgresql://...-pooler...     # pooled — for Prisma client runtime
DIRECT_URL=postgresql://...                 # direct (no -pooler) — for Prisma migrations

# Payments (deferred)
ABACATEPAY_API_KEY=...                      # server-only
ABACATEPAY_WEBHOOK_SECRET=...              # server-only

# Email (deferred)
RESEND_API_KEY=re_...                       # server-only

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # client-safe, public
LOG_LEVEL=debug                             # optional, default: info
```

---

## Sources

- [neon.com/docs/guides/prisma](https://neon.com/docs/guides/prisma) — Prisma 7 + Neon adapter setup, two-URL requirement, no separate @neondatabase/serverless. HIGH confidence.
- [prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) — Prisma 7 breaking changes: import path, prisma.config.ts, driver adapter requirement. HIGH confidence.
- [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16) — proxy.ts vs middleware.ts deprecation, revalidateTag signature change, Node.js 20.9+ requirement. HIGH confidence.
- [clerk.com/docs/reference/nextjs/clerk-middleware](https://clerk.com/docs/reference/nextjs/clerk-middleware) — clerkMiddleware in Next.js 16 proxy.ts, async auth(). HIGH confidence.
- [clerk.com/docs/nextjs/getting-started/quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart) — @clerk/nextjs v7 setup. HIGH confidence.
- [zod.dev/v4/changelog](https://zod.dev/v4/changelog) — Zod v4 breaking changes vs v3. HIGH confidence.
- [developers.openai.com/api/docs/guides/images-vision](https://developers.openai.com/api/docs/guides/images-vision) — Base64 vision input, content array ordering. MEDIUM confidence.
- Codebase audit (`src/server/lib/`, `prisma/schema.prisma`, `prisma.config.ts`, `src/middleware.ts`, `src/proxy.ts`, `package.json`) — current state verification. HIGH confidence.

---

_Stack research for: MaosFalam backend (Next.js 16 App Router + Neon + Clerk + GPT-4o)_
_Researched: 2026-04-10_

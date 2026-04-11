# Phase 1: Foundation - Research

**Researched:** 2026-04-10
**Domain:** Prisma 7 + Neon setup, Pino logging, ESLint no-console, environment variables
**Confidence:** HIGH (all findings verified against official docs and direct codebase audit)

---

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                                                            | Research Support                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| DB-01    | Schema Prisma com 5 tabelas (leads, user_profiles, readings, credit_packs, payments) alinhado com docs/architecture.md | Schema exists but is INCOMPLETE — datasource block missing `url` and `directUrl` fields           |
| DB-02    | Prisma client singleton com Neon adapter (`@prisma/adapter-neon`) e connection pooling                                 | `src/server/lib/prisma.ts` exists with correct singleton — needs minor audit only                 |
| DB-03    | DIRECT_URL configurado pra Prisma migrations (conexao direta, nao pooled)                                              | Two gaps: `schema.prisma` has no `directUrl`, `.env.example` has no `DIRECT_URL`                  |
| DB-04    | Migration inicial roda sem erro (`prisma migrate dev --name init`)                                                     | Blocked until DB-01/DB-03 fixed; also needs `prisma.config.ts` created                            |
| INFRA-01 | Logger Pino configurado com pino-pretty em dev                                                                         | `src/server/lib/logger.ts` exists — missing `redact` config for SEC-07 compliance                 |
| INFRA-02 | .env.example com todas as vars necessarias                                                                             | Exists but missing `DIRECT_URL`                                                                   |
| INFRA-03 | ESLint no-console: error ativo e funcionando                                                                           | Already configured in `eslint.config.mjs` — verify `npm run lint` passes                          |
| SEC-07   | Nenhum dado pessoal (nome, email, CPF) nos logs do Pino                                                                | Logger exists but has no `redact` paths — needs redact config before any API routes log user data |

</phase_requirements>

---

## Summary

Phase 1 is an infrastructure completion phase, not a greenfield build. Most pieces exist but have specific gaps that will cause downstream failures if not fixed now. The primary work is: (1) completing the Prisma schema datasource block with both connection URLs, (2) creating `prisma.config.ts` so the Prisma CLI uses the correct unpooled URL for migrations, (3) adding Pino's `redact` config to satisfy SEC-07 before any API routes ship, and (4) adding `DIRECT_URL` to `.env.example`.

The schema itself (5 tables) matches `docs/architecture.md` section 5 exactly and requires no structural changes. The singleton pattern in `src/server/lib/prisma.ts` is correct. ESLint's `no-console: error` is already active. No new packages need installing.

The critical execution order is: fix schema → create `prisma.config.ts` → add env vars → run `prisma generate` → run `prisma migrate dev`. If `prisma.config.ts` is missing, `prisma migrate dev` will attempt to use the pooled `DATABASE_URL` for DDL, fail against PgBouncer, and produce a cryptic timeout error.

**Primary recommendation:** Fix schema datasource, create `prisma.config.ts` pointing to `DIRECT_URL`, add `redact` to Pino config, update `.env.example`. Then run migrate.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict. No `any`.
- `no-console: error` in ESLint — already active, INFRA-03 is verified before plan is done.
- Tailwind for styles. Custom CSS only for canvas/particles.
- Front with mocks first. `useMock()` hook for backend transition.
- `src/app/preview/*` is exclusively dev playground; do not expose in production.
- Naming: Componentes PascalCase.tsx, hooks useCamelCase.ts, types PascalCase, constants UPPER_SNAKE, folders kebab-case, mocks kebab-case.json.
- Modularization: 1 component = 1 responsibility = 1 file.
- Logica de dados (fetch, transformacao) fica em hooks, nao em componentes.
- Git: develop = free work branch; main = protected; feature/\* only for major/risky changes.
- Ao completar tarefa: atualizar TODO.md e STATUS.md.

---

## Codebase Audit: Current State

This table captures what exists vs what Phase 1 requires:

| File                       | State                              | Gap                                                                 |
| -------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `prisma/schema.prisma`     | Exists, 5 tables correct           | datasource block has no `url`, no `directUrl`                       |
| `prisma/prisma.config.ts`  | DOES NOT EXIST                     | Must create pointing `datasource.url` to `DIRECT_URL`               |
| `src/server/lib/prisma.ts` | Exists, singleton correct          | No gaps — already uses `globalThis` guard                           |
| `src/server/lib/logger.ts` | Exists, pino + pino-pretty         | No `redact` config — SEC-07 violation when any route logs user data |
| `.env.example`             | Exists                             | Missing `DIRECT_URL` entry                                          |
| `eslint.config.mjs`        | Exists, `no-console: error` active | No gap — INFRA-03 already done                                      |

---

## Standard Stack

### Core (all already installed)

| Library              | Version | Purpose                | Why Standard                                                |
| -------------------- | ------- | ---------------------- | ----------------------------------------------------------- |
| Prisma ORM           | 7.7.0   | Database access        | Type-safe queries, driver adapter pattern required for Neon |
| @prisma/adapter-neon | 7.7.0   | Neon WebSocket adapter | Official adapter, bundles Neon serverless driver            |
| @prisma/client       | 7.7.0   | Generated client       | Must match adapter version exactly                          |
| Pino                 | 10.3.1  | Structured logging     | Fastest Node.js logger, JSON in prod, pino-pretty in dev    |
| pino-pretty          | 13.1.3  | Dev log formatting     | Colorized human-readable output in development              |

### Supporting (already installed)

| Library | Version | Purpose          | When to Use                                              |
| ------- | ------- | ---------------- | -------------------------------------------------------- |
| dotenv  | 17.4.1  | Env var loading  | prisma.config.ts needs this for `import 'dotenv/config'` |
| Zod     | 4.3.6   | Input validation | Every API route — out of Phase 1 scope                   |

**No new packages to install for Phase 1.**

---

## Architecture Patterns

### Prisma 7: Two-URL Pattern

Neon provides two connection strings. Each serves a different purpose:

| URL    | Variable       | Hostname pattern                  | Used by                                       |
| ------ | -------------- | --------------------------------- | --------------------------------------------- |
| Pooled | `DATABASE_URL` | `ep-xxx.pooler.neon.tech`         | Prisma client at runtime (PrismaNeon adapter) |
| Direct | `DIRECT_URL`   | `ep-xxx.neon.tech` (no `-pooler`) | Prisma CLI migrations only                    |

The PgBouncer connection pooler (Neon pooled URL) does not support DDL transactions that `prisma migrate` requires. Using it for migrations causes a silent timeout or `P1001` error.

### Pattern 1: Schema Datasource Block (MUST FIX)

Current state is broken — no `url` field at all:

```prisma
// Current (BROKEN — no url field):
datasource db {
  provider = "postgresql"
}
```

Required state:

```prisma
// Required:
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
}
```

**Source:** [neon.com/docs/guides/prisma](https://neon.com/docs/guides/prisma) — HIGH confidence

### Pattern 2: prisma.config.ts (MUST CREATE)

`prisma.config.ts` does not exist. Without it, Prisma CLI falls back to reading the `url` from `schema.prisma`. Since `schema.prisma` should use `DATABASE_URL` (pooled) at runtime, we need `prisma.config.ts` to override the CLI to use `DIRECT_URL`:

```typescript
// prisma/prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"], // unpooled — for CLI only
  },
});
```

**Note:** The `datasource.url` in `prisma.config.ts` overrides the schema's `url` for CLI operations (migrate, db push, studio) but does NOT affect the generated client. The client always uses the schema's `url` at runtime.

**Source:** [prisma.io/docs upgrading-to-prisma-7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) — HIGH confidence

### Pattern 3: Pino Redact Config (MUST ADD — SEC-07)

Current logger has no `redact` configuration. When API routes start logging, any field named `name`, `email`, `cpf`, or `phone` in a log object would appear in plaintext in Vercel logs. SEC-07 requires this never happen.

```typescript
// src/server/lib/logger.ts (required state)
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: ["name", "email", "cpf", "phone", "*.name", "*.email", "*.cpf", "*.phone"],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
```

**Source:** [getpino.io/#redaction](https://getpino.io/#/docs/redaction) — HIGH confidence

### Pattern 4: Prisma Singleton (ALREADY CORRECT)

`src/server/lib/prisma.ts` uses the correct singleton pattern with `globalThis` guard. The `PrismaNeon` adapter takes `{ connectionString }` — this matches the current implementation. No changes needed.

```typescript
// Current state (CORRECT):
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Pattern 5: Import Path (ALREADY CORRECT)

Prisma 7 generates to `src/generated/prisma/` (not `node_modules/@prisma/client`). Current `prisma.ts` already uses `@/generated/prisma/client`. This must never regress.

```typescript
// CORRECT (already in codebase):
import { PrismaClient } from "@/generated/prisma/client";

// WRONG (will silently have no schema types):
import { PrismaClient } from "@prisma/client";
```

### Anti-Patterns to Avoid

- **Pooled URL in prisma.config.ts:** Will cause silent `prisma migrate` failures. DIRECT_URL must be unpooled (`ep-xxx.neon.tech`, no `-pooler` in hostname).
- **Missing redact on Pino:** Any `logger.info({ name: 'user' })` call leaks PII to logs. Must redact before any API routes are written.
- **Running prisma migrate without prisma.config.ts:** CLI will use schema `url` (pooled) and fail or time out on DDL.
- **Importing from `@prisma/client` directly:** Prisma 7 no longer populates this with schema types. Will compile but have no model types.

---

## Don't Hand-Roll

| Problem            | Don't Build              | Use Instead                                    | Why                                                                            |
| ------------------ | ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Connection pooling | Custom pool manager      | `@prisma/adapter-neon` + pooled `DATABASE_URL` | Adapter handles WebSocket lifecycle, connection reuse, and cold start recovery |
| Log redaction      | Manual field filtering   | Pino `redact` option                           | Pino redacts before serialization — custom filtering might miss nested fields  |
| Singleton guard    | Custom module-level flag | `globalThis` pattern                           | Survives Next.js hot reload; any other pattern creates duplicate pools in dev  |

---

## Common Pitfalls

### Pitfall 1: prisma.config.ts Missing

**What goes wrong:** `prisma migrate dev` hangs for 30s then errors with `P1001: Can't reach database server at pooler.neon.tech`. Developer thinks it's a network/credentials issue.

**Why it happens:** Without `prisma.config.ts`, the CLI reads `url` from `schema.prisma`. If that URL points to the PgBouncer pooler, DDL transactions fail.

**How to avoid:** Create `prisma/prisma.config.ts` with `DIRECT_URL` before running any migration command.

**Warning signs:** Timeout or `P1001` errors on `prisma migrate dev` or `prisma db push`.

### Pitfall 2: schema.prisma Missing url Field

**What goes wrong:** Prisma client generation (`prisma generate`) may succeed, but runtime will fail to connect because no database URL is configured in the schema.

**How to avoid:** Add both `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")` to the `datasource db` block.

### Pitfall 3: DIRECT_URL Not in .env.example

**What goes wrong:** New developers copy `.env.example`, set only `DATABASE_URL`, and hit migration failures. No documentation tells them `DIRECT_URL` is needed.

**How to avoid:** Add `DIRECT_URL=` to `.env.example` with a comment explaining its purpose.

### Pitfall 4: Pino Logs PII Before Redact is Configured

**What goes wrong:** A developer writes `logger.info({ userId, name })` in a later phase. Without `redact`, `name` appears in Vercel logs. SEC-07 violated retroactively.

**How to avoid:** Add `redact` config to logger now, in Phase 1, before any API routes are written.

### Pitfall 5: Neon Database Project Not Created Before Migration

**What goes wrong:** `prisma migrate dev` fails with connection refused if the Neon project/database does not yet exist.

**How to avoid:** Create the Neon project and note both connection strings (pooled and direct) before running any Prisma commands. The plan must include a task to provision the Neon database.

---

## Code Examples

### Complete schema.prisma datasource block (required fix)

```prisma
// Source: neon.com/docs/guides/prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### prisma.config.ts (new file to create)

```typescript
// Source: prisma.io/docs/upgrading-to-prisma-7
// prisma/prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
```

### Pino redact configuration (required addition to logger.ts)

```typescript
// Source: getpino.io/#/docs/redaction
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: ["name", "email", "cpf", "phone", "*.name", "*.email", "*.cpf", "*.phone"],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
// REGRA: nunca logar nome, email, CPF, ou qualquer dado pessoal. Só IDs e ações.
```

### Migration commands (execution order)

```bash
# 1. Ensure .env.local has both DATABASE_URL and DIRECT_URL
# 2. Generate Prisma client from schema
npx prisma generate

# 3. Run initial migration (uses DIRECT_URL via prisma.config.ts)
npx prisma migrate dev --name init

# 4. Verify tables exist in Neon
npx prisma studio
```

### .env.example additions

```env
# Banco (Neon)
DATABASE_URL=postgresql://...@ep-xxx.pooler.neon.tech/maosfalam?sslmode=require
DIRECT_URL=postgresql://...@ep-xxx.neon.tech/maosfalam?sslmode=require
```

---

## Environment Availability

| Dependency    | Required By      | Available                     | Version  | Fallback                        |
| ------------- | ---------------- | ----------------------------- | -------- | ------------------------------- |
| Node.js       | All              | Yes                           | v20.19.5 | —                               |
| npm           | All              | Yes                           | 10.8.2   | —                               |
| Prisma CLI    | DB-04 migrations | Yes (v7.7.0 in project)       | 7.7.0    | —                               |
| Neon database | DB-04 migrations | Unknown — not yet provisioned | —        | Must provision before migration |

**Missing dependencies with no fallback:**

- Neon database project: must be created via Neon MCP or Neon dashboard before `prisma migrate dev` can run. The plan must include a task to provision the database and retrieve both connection strings.

**Missing dependencies with fallback:**

- None.

---

## Validation Architecture

### Test Framework

| Property           | Value              |
| ------------------ | ------------------ |
| Framework          | Vitest 4.1.3       |
| Config file        | `vitest.config.ts` |
| Quick run command  | `npm run test`     |
| Full suite command | `npm run test`     |

### Phase Requirements: Test Map

| Req ID   | Behavior                                               | Test Type | Automated Command                    | File Exists?            |
| -------- | ------------------------------------------------------ | --------- | ------------------------------------ | ----------------------- |
| DB-02    | Prisma singleton — no duplicate clients on hot reload  | unit      | `npm run test -- prisma`             | No — Wave 0             |
| INFRA-01 | Pino logger exports `logger` with correct level        | unit      | `npm run test -- logger`             | No — Wave 0             |
| SEC-07   | Pino redacts `name`, `email`, `cpf`, `phone` from logs | unit      | `npm run test -- logger`             | No — Wave 0             |
| INFRA-03 | ESLint no-console rule active                          | lint      | `npm run lint`                       | Yes (eslint.config.mjs) |
| DB-01    | Schema tables match architecture.md                    | manual    | `npx prisma studio` (visual verify)  | N/A                     |
| DB-03    | DIRECT_URL present and schema has directUrl            | manual    | `npx prisma migrate dev --name init` | N/A                     |
| DB-04    | Migration runs without error                           | smoke     | `npx prisma migrate dev --name init` | N/A                     |

### Sampling Rate

- **Per task commit:** `npm run lint && npm run type-check`
- **Per wave merge:** `npm run test`
- **Phase gate:** `npm run lint && npm run type-check && npm run test && npx prisma migrate dev --name init`

### Wave 0 Gaps

- [ ] `src/server/lib/__tests__/logger.test.ts` — covers INFRA-01 and SEC-07 (redact verification)
- [ ] `src/server/lib/__tests__/prisma.test.ts` — covers DB-02 (singleton behavior)

---

## Open Questions

1. **Neon project provisioning**
   - What we know: The plan needs a task to create the Neon project and retrieve connection strings.
   - What's unclear: Whether the user has already created a Neon project or needs to do so from scratch.
   - Recommendation: Plan Wave 0 must include "Provision Neon database" as the first task, with output being `DATABASE_URL` and `DIRECT_URL`.

2. **prisma.config.ts location**
   - What we know: Prisma docs show `prisma.config.ts` at the project root (next to `package.json`), not inside the `prisma/` folder.
   - What's unclear: Whether putting it inside `prisma/` changes CLI behavior.
   - Recommendation: Place at project root (`./prisma.config.ts`) following official Prisma 7 docs. The `schema` path inside it can reference `prisma/schema.prisma` relatively.

3. **Generated Prisma types in git**
   - What we know: `src/generated/prisma/` is committed to the repo (noted in CONCERNS.md).
   - What's unclear: Whether the generated directory exists currently or needs to be regenerated after schema fix.
   - Recommendation: After fixing schema and running `prisma generate`, verify `src/generated/prisma/` is populated. This directory should be committed since Vercel deploy needs it.

---

## Sources

### Primary (HIGH confidence)

- [neon.com/docs/guides/prisma](https://neon.com/docs/guides/prisma) — two-URL pattern, adapter setup, no separate @neondatabase/serverless needed
- [prisma.io/docs/upgrading-to-prisma-7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) — prisma.config.ts format, import path change
- [getpino.io/#/docs/redaction](https://getpino.io/#/docs/redaction) — redact paths format

### Secondary (MEDIUM confidence)

- `.planning/research/STACK.md` — verified stack research from project init (2026-04-10)
- `.planning/research/PITFALLS.md` — pitfall research from project init (2026-04-10)

### Direct Codebase Audit (HIGH confidence)

- `prisma/schema.prisma` — confirmed missing `url` and `directUrl` in datasource
- `prisma/prisma.config.ts` — confirmed does not exist
- `src/server/lib/prisma.ts` — confirmed singleton is correct
- `src/server/lib/logger.ts` — confirmed missing `redact` config
- `.env.example` — confirmed missing `DIRECT_URL`
- `eslint.config.mjs` — confirmed `no-console: error` is active

---

## Metadata

**Confidence breakdown:**

- Schema gaps (DB-01, DB-03): HIGH — direct file audit, no inference
- prisma.config.ts pattern: HIGH — verified against official Prisma 7 docs
- Logger redact pattern: HIGH — verified against official Pino docs
- Neon migration behavior: HIGH — verified against official Neon + Prisma docs
- Neon provisioning task: MEDIUM — known requirement but provisioning steps depend on user's Neon account state

**Research date:** 2026-04-10
**Valid until:** 2026-07-10 (stable stack — Prisma 7 + Neon adapter unlikely to change patterns)

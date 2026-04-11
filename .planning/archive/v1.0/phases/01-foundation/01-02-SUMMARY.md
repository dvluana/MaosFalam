---
phase: 01-foundation
plan: 02
subsystem: database, testing, infra
tags: [prisma, neon, pino, vitest, postgresql, migration]

requires:
  - phase: 01-foundation/01-01
    provides: prisma.config.ts with DIRECT_URL, logger.ts with PII redaction, schema.prisma with 5 models

provides:
  - Unit tests for Pino logger (INFRA-01, SEC-07) — 8 tests covering redact behavior
  - Unit test for Prisma singleton (DB-02) — 3 tests covering globalThis guard pattern
  - Initial Neon migration with all 5 tables (leads, user_profiles, readings, credit_packs, payments)
  - prisma/migrations/20260411010454_init/migration.sql

affects: [02-auth, 03-api-routes, 04-gpt4o, 05-adapters, 06-security]

tech-stack:
  added: []
  patterns:
    - Pino test pattern: use Writable stream + JSON.parse to verify redact behavior without stdout
    - Prisma singleton test pattern: set dummy DATABASE_URL in beforeAll, rely on module cache for identity
    - Prisma 7: url/directUrl removed from schema.prisma — connection config lives in prisma.config.ts only
    - prisma.config.ts loads .env.local (override: false) then .env for Next.js dev convention

key-files:
  created:
    - src/server/lib/__tests__/logger.test.ts
    - src/server/lib/__tests__/prisma.test.ts
    - prisma/migrations/20260411010454_init/migration.sql
    - prisma/migrations/migration_lock.toml
  modified:
    - prisma/schema.prisma
    - prisma.config.ts

key-decisions:
  - "Prisma 7 removes url/directUrl from schema.prisma — datasource block must have provider only; connection handled by prisma.config.ts or PrismaClient constructor adapter"
  - "prisma.config.ts must load .env.local explicitly (dotenv config({path: '.env.local'})) because dotenv/config only loads .env — Next.js dev convention uses .env.local"
  - "Logger tests use a Writable stream to capture JSON output — avoids pino-pretty TTY requirement in vitest jsdom environment"
  - "Prisma singleton tests use dummy DATABASE_URL in beforeAll — module cache guarantees identity without real DB connection"

patterns-established:
  - "Pattern: Remove url/directUrl from prisma/schema.prisma for Prisma 7. All connection config goes in prisma.config.ts datasource.url."
  - "Pattern: prisma.config.ts loads .env.local then .env with override:false for Next.js dev compatibility."
  - "Pattern: Test Pino redaction via Writable stream, not by importing production logger (avoids pino-pretty TTY error)."

requirements-completed: [DB-02, DB-04, INFRA-01, SEC-07]

duration: 4min
completed: 2026-04-11
---

# Phase 01 Plan 02: Tests and Initial Migration Summary

**11 unit tests covering Pino PII redaction and Prisma singleton, plus initial Neon migration creating all 5 tables via Prisma 7.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-11T01:03:06Z
- **Completed:** 2026-04-11T01:06:31Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- 8 logger tests verify Pino redacts name/email/cpf/phone at root and nested object depth (SEC-07, INFRA-01)
- 3 prisma tests verify singleton pattern — same reference on repeated import, globalThis guard works in non-production env (DB-02)
- Initial migration creates all 5 tables in Neon: leads, user_profiles, readings, credit_packs, payments (DB-04)
- Fixed Prisma 7 schema incompatibility (url/directUrl removed from schema.prisma) and .env.local loading in prisma.config.ts

## Task Commits

1. **Task 1: Write logger unit tests** - `dc432b4` (test)
2. **Task 2: Write Prisma singleton unit tests** - `01ceda1` (test)
3. **Task 3: prisma generate + migrate dev** - `2bc2e57` (chore)

## Files Created/Modified

- `src/server/lib/__tests__/logger.test.ts` - 8 tests for Pino logger instance and PII redaction (SEC-07, INFRA-01)
- `src/server/lib/__tests__/prisma.test.ts` - 3 tests for Prisma singleton globalThis guard (DB-02)
- `prisma/schema.prisma` - Removed url/directUrl from datasource block (Prisma 7 requirement)
- `prisma.config.ts` - Added .env.local loading with dotenv config() calls (Next.js dev convention)
- `prisma/migrations/20260411010454_init/migration.sql` - Initial DDL for all 5 tables
- `prisma/migrations/migration_lock.toml` - Migration lock file

## Decisions Made

- Prisma 7 no longer accepts `url` or `directUrl` in `schema.prisma` — removed both fields; datasource block now only contains `provider = "postgresql"`. Connection URL provided to PrismaClient via adapter in `src/server/lib/prisma.ts`, and to CLI via `prisma.config.ts datasource.url`.
- `prisma.config.ts` now loads `.env.local` explicitly because `import "dotenv/config"` only loads `.env`. Next.js convention uses `.env.local` for local dev secrets, so migrations would silently fail without this fix.
- Logger tests create a fresh `testLogger` with a Writable stream to avoid pino-pretty TTY requirement — importing production logger directly would error in vitest jsdom environment.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed url/directUrl from schema.prisma for Prisma 7 compatibility**

- **Found during:** Task 3 (prisma generate)
- **Issue:** `npx prisma generate` exited with P1012 error: "The datasource property `url` is no longer supported in schema files" — Prisma 7 removed these fields entirely from schema.prisma
- **Fix:** Removed `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")` from datasource block in schema.prisma, leaving only `provider = "postgresql"`
- **Files modified:** prisma/schema.prisma
- **Verification:** `npx prisma generate` succeeded with "Generated Prisma Client (7.7.0)"
- **Committed in:** 2bc2e57 (Task 3 commit)

**2. [Rule 1 - Bug] Fixed .env.local loading in prisma.config.ts**

- **Found during:** Task 3 (prisma migrate dev)
- **Issue:** `npx prisma migrate dev --name init` exited with "The datasource.url property is required" because `import "dotenv/config"` only loads `.env`, not `.env.local` where DIRECT_URL is stored
- **Fix:** Replaced `import "dotenv/config"` with explicit `config({ path: ".env.local", override: false })` and `config({ path: ".env", override: false })` calls from the `dotenv` package
- **Files modified:** prisma.config.ts
- **Verification:** `npx prisma generate` shows "injected env (2) from .env.local"; migration ran successfully
- **Committed in:** 2bc2e57 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs: Prisma 7 schema incompatibility + dotenv .env.local loading)
**Impact on plan:** Both fixes necessary for Prisma 7 — the plan was written assuming Prisma v6 behavior. No scope creep.

## Issues Encountered

- Pre-existing lint errors in `src/server/lib/abacatepay.ts`, `src/app/api/credits/purchase/route.ts`, and `src/app/api/webhook/abacatepay/route.ts` prevent `npm run lint` from passing globally. These are unrelated to this plan and already tracked in `deferred-items.md`. Phase 1 gate check for lint (INFRA-03) cannot pass until Phase 3 when those files are fixed.

## User Setup Required

None - no external service configuration required beyond what was already set in .env.local.

## Next Phase Readiness

- All 5 Neon tables created and verified via migration SQL
- 11 tests passing (vitest run exits 0)
- Type-check passes (tsc --noEmit exits 0)
- Phase 1 foundation complete — ready for Phase 02 (auth, Clerk middleware)
- Blocker: pre-existing lint errors in abacatepay files defer `npm run lint` green to Phase 3

## Self-Check: PASSED

- src/server/lib/**tests**/logger.test.ts — FOUND
- src/server/lib/**tests**/prisma.test.ts — FOUND
- prisma/migrations/20260411010454_init/ — FOUND
- commit dc432b4 (logger tests) — FOUND
- commit 01ceda1 (prisma tests) — FOUND
- commit 2bc2e57 (migration) — FOUND

---

_Phase: 01-foundation_
_Completed: 2026-04-11_

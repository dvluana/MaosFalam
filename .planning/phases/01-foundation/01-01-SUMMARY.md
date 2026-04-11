---
phase: 01-foundation
plan: 01
subsystem: database, infra
tags: [prisma, neon, pino, postgresql, env]

requires: []
provides:
  - Prisma schema datasource with two-URL pattern (url + directUrl)
  - prisma.config.ts using DIRECT_URL for CLI migrations (bypasses PgBouncer)
  - Pino logger with PII redaction (name, email, cpf, phone at root and nested)
  - .env.example documenting both DATABASE_URL and DIRECT_URL with comments
affects: [02-auth, 03-api-routes, 04-gpt4o, 05-adapters, 06-security]

tech-stack:
  added: []
  patterns:
    - Two-URL Prisma pattern: DATABASE_URL (pooled) for runtime, DIRECT_URL (direct) for migrations
    - PII redaction via pino redact.paths covering root and nested object fields

key-files:
  created:
    - prisma/schema.prisma
    - prisma.config.ts
    - src/server/lib/logger.ts
    - .env.example
  modified: []

key-decisions:
  - "Two-URL Prisma pattern: DATABASE_URL (pooled, PgBouncer) for runtime client, DIRECT_URL (direct connection) for prisma migrate — prevents P1001 timeout errors on DDL transactions"
  - "Pino redact covers root-level AND nested (*.field) PII paths — logger.info({ user: { name } }) also redacts"
  - ".env.example force-added to git: .gitignore uses .env* glob but example files should be tracked; git add -f used"

patterns-established:
  - "Pattern: DIRECT_URL for all Prisma CLI/migration commands. Never use DATABASE_URL (pooled) for migrations."
  - "Pattern: Pino redact.paths must cover both root and *.field for any PII field added to schema."

requirements-completed: [DB-01, DB-02, DB-03, INFRA-01, INFRA-02, INFRA-03, SEC-07]

duration: 15min
completed: 2026-04-11
---

# Phase 01 Plan 01: Infrastructure Gaps Summary

**Prisma two-URL datasource (pooled runtime + direct migrations), Pino PII redaction, and .env.example documentation — four infrastructure gaps closed before any API routes ship.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-11T00:58:00Z
- **Completed:** 2026-04-11T01:13:00Z
- **Tasks:** 4 (Task 1 pre-completed: Neon already provisioned)
- **Files modified:** 4

## Accomplishments

- Prisma schema datasource now has both `url` (DATABASE_URL, pooled) and `directUrl` (DIRECT_URL, direct) — enables safe serverless migrations
- prisma.config.ts CLI override now uses DIRECT_URL, preventing PgBouncer P1001 timeout on DDL transactions
- Pino logger redacts name/email/cpf/phone at root and nested object depth before serialization — SEC-07 satisfied
- .env.example documents both connection strings with explanatory comments for new developers

## Task Commits

Each task was committed atomically:

1. **Task 2: Fix prisma/schema.prisma datasource block** - `d18a19e` (chore)
2. **Task 3: Fix prisma.config.ts to use DIRECT_URL** - `03b8ee4` (chore)
3. **Task 4: Add redact config to Pino logger (SEC-07)** - `a3d715d` (feat)
4. **Task 5: Add DIRECT_URL to .env.example** - `6f0e6a4` (chore)

## Files Created/Modified

- `prisma/schema.prisma` - PostgreSQL datasource with url + directUrl two-URL pattern; 5 models (Lead, UserProfile, Reading, CreditPack, Payment) unchanged
- `prisma.config.ts` - Prisma CLI override using DIRECT_URL (not pooled) for migrations
- `src/server/lib/logger.ts` - Pino logger with redact config covering name/email/cpf/phone at root and nested object depth
- `.env.example` - Documents both DATABASE_URL (pooled, runtime) and DIRECT_URL (direct, CLI-only) with explanatory comments

## Decisions Made

- Two-URL Prisma pattern chosen: DATABASE_URL (pooled PgBouncer) for runtime Prisma client, DIRECT_URL (direct Neon endpoint) for Prisma CLI migrations. This is required because PgBouncer does not support DDL transactions.
- Pino redact covers both root fields (`name`, `email`) and one-level nested (`*.name`, `*.email`) to handle structured log objects like `{ user: { name } }`.
- `.env.example` force-added to git (`git add -f`) because `.gitignore` uses `.env*` glob, but example template files should be tracked. Contains no real secrets.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Force-added .env.example to git**

- **Found during:** Task 5 (Add DIRECT_URL to .env.example)
- **Issue:** `.gitignore` has `.env*` glob pattern which catches `.env.example`. Staging failed with "paths are ignored by .gitignore".
- **Fix:** Used `git add -f .env.example` since the file is a template (no secrets) and should be version-controlled.
- **Files modified:** .env.example (via force-add)
- **Verification:** File committed successfully at 6f0e6a4
- **Committed in:** 6f0e6a4 (Task 5 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Necessary for correct git tracking of the env template. No scope creep.

## Issues Encountered

- Pre-existing lint errors in `src/server/lib/abacatepay.ts` and `src/app/api/webhook/abacatepay/route.ts` discovered during final `npm run lint`. These are unrelated to this plan's tasks. Logged to `deferred-items.md` for cleanup in Phase 3 when those files are touched.
- `npm run type-check` passed cleanly.

## Next Phase Readiness

- Prisma schema ready for `prisma migrate dev` once Neon connection verified
- Logger ready for use in all API routes — PII-safe from day one
- Plan 01-02 can proceed: Prisma client generation, Clerk middleware, security headers
- Blocker: lint errors in abacatepay files need fixing before `npm run lint` passes globally — defer to Phase 3

---

_Phase: 01-foundation_
_Completed: 2026-04-11_

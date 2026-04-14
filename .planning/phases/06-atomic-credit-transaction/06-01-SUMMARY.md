---
phase: 06-atomic-credit-transaction
plan: "01"
subsystem: credits
tags: [database, safety, race-condition, api, tdd]
dependency_graph:
  requires: []
  provides: [debit-credit-helper, check-constraint, credits-endpoint-reading-count]
  affects: [upgrade-route, credits-endpoint, readings-endpoint]
tech_stack:
  added: [debitCreditFIFO, $queryRawUnsafe]
  patterns: [raw-sql-atomic-update, tdd-red-green]
key_files:
  created:
    - prisma/migrations/20260414000554_check_remaining/migration.sql
    - src/server/lib/debit-credit.ts
    - src/server/lib/debit-credit.test.ts
  modified:
    - src/app/api/reading/[id]/upgrade/route.ts
    - src/app/api/user/credits/route.ts
    - src/app/api/user/credits/route.test.ts
    - src/app/api/user/readings/route.ts
decisions:
  - "Raw SQL $queryRawUnsafe with WHERE remaining > 0 chosen over $transaction for atomic debit — Prisma Read Committed cannot prevent the read-then-write race"
  - "debit and reading.update NOT wrapped in $transaction — raw SQL debit is already atomic; if reading update fails, upgrade is idempotent via already_premium check"
  - "reading_count from /api/user/credits uses prisma.reading.count(clerkUserId) — excludes anonymous claimed readings to prevent credit gate inflation"
  - "MAX_RETRIES=3 recursion guard in debitCreditFIFO prevents infinite loop on sustained concurrent load"
metrics:
  duration: "~3 minutes"
  completed: "2026-04-14"
  tasks: 2
  files: 7
---

# Phase 6 Plan 01: Database Safety Layer + Debit Helper Summary

Race-safe atomic credit debit via raw SQL UPDATE WHERE remaining > 0, backed by CHECK constraint at DB level, with bug fixes for reading_count inflation.

## What Was Built

### Task 1: CHECK constraint + debitCreditFIFO + upgrade route refactor

**Migration** (`prisma/migrations/20260414000554_check_remaining/migration.sql`):

- Adds `CHECK (remaining >= 0)` to `credit_packs` table
- Applied to Neon develop branch via `prisma migrate deploy`
- Second safety layer: even if application code has a bug, DB rejects negative balances

**debitCreditFIFO** (`src/server/lib/debit-credit.ts`):

- Finds oldest pack with `remaining > 0` (FIFO by `createdAt ASC`)
- Atomically decrements with raw SQL: `UPDATE credit_packs SET remaining = remaining - 1 WHERE id = $1 AND remaining > 0 RETURNING id`
- If 0 rows affected (race detected): retries recursively up to MAX_RETRIES=3
- Parameterized query ($1) — no SQL injection risk

**Upgrade route** (`src/app/api/reading/[id]/upgrade/route.ts`):

- Replaced inline `$transaction(findFirst + update)` with `debitCreditFIFO(clerkUserId)`
- Simpler, safer, consistent with reading/new route pattern

### Task 2: Credits endpoint reading_count + readings endpoint fix

**Credits route** (`src/app/api/user/credits/route.ts`):

- Added `reading_count` field alongside `balance` and `packs`
- Uses `prisma.reading.count({ where: { clerkUserId, isActive: true } })` — counts only readings made with this Clerk account
- Parallel fetch with `Promise.all` — no additional latency

**Readings route** (`src/app/api/user/readings/route.ts`):

- Added `reading_count: claimedReadings.length` to response
- Counts only `clerkUserId`-matched readings, not email-matched unclaimed ones

## Deviations from Plan

None — plan executed exactly as written.

## Tests

| File                                   | Tests                  | Result   |
| -------------------------------------- | ---------------------- | -------- |
| src/server/lib/debit-credit.test.ts    | 6                      | All pass |
| src/app/api/user/credits/route.test.ts | 8 (5 existing + 3 new) | All pass |
| Full suite                             | 107                    | All pass |

## Commits

| Hash      | Message                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| `4f8498d` | test(06-01): add failing tests for debitCreditFIFO                                 |
| `7ebe4f5` | feat(06-01): CHECK constraint + race-safe debitCreditFIFO + upgrade route refactor |
| `b2120ac` | fix(06-01): add reading_count to credits endpoint, fix reading_count inflation     |

## Known Stubs

None introduced in this plan.

## Self-Check: PASSED

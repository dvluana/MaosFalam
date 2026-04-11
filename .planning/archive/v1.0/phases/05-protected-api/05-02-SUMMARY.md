---
phase: 05-protected-api
plan: "02"
subsystem: api-tests
tags: [vitest, unit-tests, protected-api, credits, readings]
dependency_graph:
  requires: [05-01]
  provides: [API-05-tests, API-06-tests, API-07-tests]
  affects: [ci]
tech_stack:
  added: []
  patterns: [vi.mock-auth-layer, transaction-callback-mock, snake-case-response-verification]
key_files:
  created:
    - src/app/api/reading/new/route.test.ts
    - src/app/api/user/credits/route.test.ts
    - src/app/api/user/readings/route.test.ts
  modified: []
decisions:
  - "Mock @/server/lib/auth (getClerkUserId) directly instead of @clerk/nextjs/server — routes use auth layer, not Clerk directly"
  - "prisma.$transaction mock calls callback with prisma as tx — mirrors real behavior without Neon connection"
metrics:
  duration: 2min
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_created: 3
---

# Phase 05 Plan 02: Protected API Tests Summary

Unit tests for the 3 protected API routes: credit debit (reading/new), balance query (user/credits), and reading history (user/readings). 17 tests, all passing, no Neon connection required.

## Tasks Completed

| Task | Name                                                                        | Commit  | Files                                                                           |
| ---- | --------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| 1    | Tests for POST /api/reading/new (API-05)                                    | c1e853b | src/app/api/reading/new/route.test.ts                                           |
| 2    | Tests for GET /api/user/credits and GET /api/user/readings (API-06, API-07) | 241a6ac | src/app/api/user/credits/route.test.ts, src/app/api/user/readings/route.test.ts |

## Test Coverage

### POST /api/reading/new (7 tests)

- 200 with single pack (remaining=1 → credits_remaining=0)
- 200 with 2 packs, correct remaining sum after FIFO debit
- FIFO: findFirst called with `orderBy: { createdAt: "asc" }`
- Credit debit updates to `remaining - 1`
- 402 when no packs with remaining > 0
- 401 for unauthenticated (getClerkUserId throws)
- 400 for invalid body (missing target_name)

### GET /api/user/credits (5 tests)

- balance=5 for 2 packs with remaining=3 and remaining=2
- Snake_case response keys (pack_type, created_at)
- balance=0 and empty array for no packs
- remaining=0 pack contributes 0 to balance (Math.max guard)
- 401 for unauthenticated

### GET /api/user/readings (5 tests)

- Returns both readings when 2 active readings exist
- Snake_case mapping (target_name, created_at; no targetName leak)
- Prisma filtered with `{ clerkUserId, isActive: true }`
- Empty array for 0 readings
- 401 for unauthenticated

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Mocked @/server/lib/auth instead of @clerk/nextjs/server**

- **Found during:** Task 1
- **Issue:** Routes use `getClerkUserId()` from the auth layer, not `auth()` from Clerk directly. Mocking Clerk wouldn't intercept the throws.
- **Fix:** `vi.mock("@/server/lib/auth", () => ({ getClerkUserId: vi.fn() }))` — direct mock of the wrapper used by routes.
- **Files modified:** All 3 test files
- **Commit:** c1e853b

## Known Stubs

None.

## Self-Check: PASSED

- src/app/api/reading/new/route.test.ts: FOUND
- src/app/api/user/credits/route.test.ts: FOUND
- src/app/api/user/readings/route.test.ts: FOUND
- Commit c1e853b: FOUND
- Commit 241a6ac: FOUND

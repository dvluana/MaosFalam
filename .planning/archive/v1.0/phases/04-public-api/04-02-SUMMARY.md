---
phase: 04-public-api
plan: 02
subsystem: api-tests
tags: [testing, tdd, api, security]
dependency_graph:
  requires: [04-01]
  provides:
    [
      API-01-proof,
      API-02-proof,
      API-03-proof,
      API-04-proof,
      SEC-01-proof,
      SEC-02-proof,
      SEC-05-proof,
      SEC-06-proof,
    ]
  affects: []
tech_stack:
  added: []
  patterns:
    [
      vi.mock hoisting,
      vi.resetAllMocks + per-test mock setup,
      NextRequest test helper,
      HandAttributes type fixture,
    ]
key_files:
  created:
    - src/app/api/lead/register/route.test.ts
    - src/app/api/reading/capture/route.test.ts
    - src/app/api/reading/[id]/route.test.ts
  modified: []
decisions:
  - "vi.resetAllMocks() resets factory mock return values — must re-apply selectBlocks.mockReturnValue in beforeEach"
  - "Zod v4 strict UUID validation rejects non-compliant UUIDs like 00000000-0000-0000-0000-000000000001 (version digit must be 1-8)"
  - "HandAttributes type import required for strict TypeScript — validAttributes fixture needs explicit annotation"
metrics:
  duration: "6 minutes"
  completed_date: "2026-04-11"
  tasks_completed: 1
  files_created: 3
---

# Phase 04 Plan 02: Route Tests for Public API Endpoints Summary

Route-level tests with mocked Prisma, OpenAI, resend, rate-limit, and select-blocks proving all HTTP contracts for the three public API endpoints.

## Objective

Write 17 tests across 3 test files to prove API-01 through API-04 and SEC-01, SEC-02, SEC-05, SEC-06 are satisfied by the routes fixed in Plan 01.

## Tasks Completed

| Task | Description                                 | Commit  | Files                 |
| ---- | ------------------------------------------- | ------- | --------------------- |
| 1    | Route tests for all 3 public API endpoints  | dbee32a | route.test.ts x3      |
| 1b   | Type fix: HandAttributes fixture annotation | 8aea24e | capture/route.test.ts |

## Tests Written

### lead/register (6 tests)

- API-01: valid body returns 201 + lead_id
- SEC-06: missing name → 400
- SEC-06: invalid email → 400
- SEC-06: session_id < 10 chars → 400
- SEC-02: rateLimit returns false → 429
- Prisma throws → 500

### reading/capture (7 tests)

- API-02: valid body + confident GPT-4o → 200 + reading_id + report
- API-03: confidence < 0.3 → 422 + LOW_CONFIDENCE code
- SEC-06: missing photo_base64 → 400
- SEC-06: invalid UUID lead_id → 400
- SEC-01: rateLimit returns false → 429
- SEC-05: body with tier:'premium' → reading saved with tier:'free'
- analyzeHand throws → 500

### reading/[id] (4 tests)

- API-04: valid UUID, isActive true → 200 + reading object
- API-04: valid UUID, isActive false → 410
- API-04: valid UUID, not found → 404
- non-UUID id → 404 (no DB call made)

**Total: 17 tests, all passing. Full suite: 57/57.**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vi.resetAllMocks() clears factory mock return values**

- **Found during:** Task 1 (capture tests failing with 500)
- **Issue:** `vi.resetAllMocks()` in beforeEach cleared the `selectBlocks.mockReturnValue()` set in the factory. Route called `selectBlocks()` which returned `undefined`, causing `JSON.parse(undefined)` → SyntaxError → 500.
- **Fix:** Import `selectBlocks` in the test and re-apply `vi.mocked(selectBlocks).mockReturnValue(...)` inside `beforeEach` after `resetAllMocks()`.
- **Files modified:** src/app/api/reading/capture/route.test.ts
- **Commit:** dbee32a

**2. [Rule 1 - Bug] Zod v4 UUID validation rejects test fixture UUIDs**

- **Found during:** Task 1 (reading/[id] tests returning 404 instead of 200/410)
- **Issue:** Zod v4 `z.string().uuid()` requires UUID version digit 1-8 and proper variant bits. The fixture UUIDs `00000000-0000-0000-0000-000000000001` fail this validation, so the route returned 404 before querying DB.
- **Fix:** Replace all test UUIDs with crypto-valid UUIDs.
- **Files modified:** src/app/api/reading/capture/route.test.ts, src/app/api/reading/[id]/route.test.ts
- **Commit:** dbee32a

**3. [Rule 2 - Type Safety] HandAttributes fixture missing explicit type annotation**

- **Found during:** npm run type-check after tests passed
- **Issue:** `validAttributes` inferred as `{ heart: { variation: string } }` which conflicts with `HeartVariation` literal union type.
- **Fix:** Import `HandAttributes` and annotate `validAttributes: HandAttributes`.
- **Files modified:** src/app/api/reading/capture/route.test.ts
- **Commit:** 8aea24e

## Requirements Proven

| Requirement                                                           | Test                   | Verdict |
| --------------------------------------------------------------------- | ---------------------- | ------- |
| API-01: POST /api/lead/register saves lead and returns 201            | lead/register test 1   | PASS    |
| API-02: POST /api/reading/capture returns 200 + report on valid input | capture test 1         | PASS    |
| API-03: POST /api/reading/capture returns 422 on low confidence       | capture test 2         | PASS    |
| API-04: GET /api/reading/[id] returns 200/404/410 correctly           | reading/[id] tests 1-3 | PASS    |
| SEC-01: Rate limit 5/h on capture → 429                               | capture test 5         | PASS    |
| SEC-02: Rate limit 10/h on lead → 429                                 | lead/register test 5   | PASS    |
| SEC-05: Tier cannot be set from client                                | capture test 6         | PASS    |
| SEC-06: Zod validation rejects invalid inputs                         | multiple 400 tests     | PASS    |

## Self-Check: PASSED

- FOUND: src/app/api/lead/register/route.test.ts
- FOUND: src/app/api/reading/capture/route.test.ts
- FOUND: src/app/api/reading/[id]/route.test.ts
- FOUND: commit dbee32a (route tests)
- FOUND: commit 8aea24e (type fix)
- npm run test: 57/57 passing
- npm run type-check: exits 0

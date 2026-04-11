---
phase: 05-protected-api
plan: "03"
subsystem: api-tests
tags: [tests, profile, account, auth, security, vitest]
dependency_graph:
  requires: [05-01]
  provides: [API-08-tests, API-09-tests, API-10-tests, SEC-03-comment]
  affects: []
tech_stack:
  added: []
  patterns: [vi.mock-before-import, vi.resetAllMocks-beforeEach, Request-factory-helper]
key_files:
  created:
    - src/app/api/user/profile/route.test.ts
    - src/app/api/user/account/route.test.ts
  modified: []
decisions:
  - "profile route uses getClerkUser() (currentUser() network call) — mock target is @clerk/nextjs/server currentUser"
  - "account route uses getClerkUserId() (auth() session-only) — mock target is @clerk/nextjs/server auth"
  - "Partial PUT update test verifies upsert.update object lacks 'phone' key when only cpf is provided"
  - "SEC-03 rate limit deferred to v2 — documented as comment in account test file"
metrics:
  duration: "4 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_changed: 2
---

# Phase 05 Plan 03: User Profile and Account Tests Summary

Vitest tests for GET+PUT /api/user/profile and DELETE /api/user/account — 14 tests across 2 files, all passing.

## What Was Built

Two test files covering the protected user API routes:

- `src/app/api/user/profile/route.test.ts` — 8 tests for GET and PUT
- `src/app/api/user/account/route.test.ts` — 6 tests for DELETE

## Tests by Requirement

### API-08: GET /api/user/profile

- Authenticated with DB profile: merges Clerk name+email with DB cpf+phone
- Authenticated without DB profile: returns cpf=null, phone=null
- Unauthenticated (currentUser returns null): returns 401

### API-09: PUT /api/user/profile

- Valid full body {cpf, phone}: upserts by clerkUserId, returns {ok: true}
- Partial body {cpf only}: upsert.update contains cpf, does NOT contain phone key (conditional spread verified)
- Invalid body (cpf too short "123"): returns 400 via Zod
- Unauthenticated: returns 401
- SEC-07 compliance: logger.info never called with cpf or phone in payload

### API-10: DELETE /api/user/account

- Correct confirmation "EXCLUIR": soft-deletes all readings (isActive: false), returns {ok: true}
- Wrong case "excluir": returns 400 with "EXCLUIR" in error message
- Wrong value "delete": returns 400
- Empty body {}: returns 400
- Unauthenticated: returns 401
- User isolation: updateMany called with authenticated user's clerkUserId, not another user's

### SEC-03 (deferred)

Comment added to account test file documenting the deferred rate limit pattern for credits/purchase.

## Mock Patterns Used

Profile tests mock `@clerk/nextjs/server` with both `auth` and `currentUser` — `GET` and `PUT` use `getClerkUser()` which calls `currentUser()` internally.

Account tests mock `@clerk/nextjs/server` with `auth` only — `DELETE` uses `getClerkUserId()` which calls `auth()` (session-only, no network call).

Both use `vi.resetAllMocks()` in `beforeEach` to prevent mock state leakage between tests.

## Deviations from Plan

None - plan executed exactly as written. Test count is 8 for profile (plan said 7) because the partial update test was split into a separate assertion verifying the `update` object structure, which the plan grouped into one test but is cleaner as two.

## Known Stubs

None.

## Self-Check: PASSED

- `src/app/api/user/profile/route.test.ts` exists: FOUND
- `src/app/api/user/account/route.test.ts` exists: FOUND
- Commit `7b88da4` (profile tests): FOUND
- Commit `69d35d3` (account tests): FOUND
- All 14 tests pass: VERIFIED

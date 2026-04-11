---
phase: 04-public-api
plan: 01
subsystem: api
tags: [nextjs, zod, rate-limit, prisma, openai, uuid-validation]

requires:
  - phase: 03-ai-pipeline
    provides: analyzeHand() and selectBlocks() with hardened signatures
  - phase: 01-foundation
    provides: Prisma schema, logger, rate-limit utilities
  - phase: 02-auth
    provides: Clerk middleware protecting authenticated routes

provides:
  - POST /api/lead/register — returns 201, rate-limited 10/hr per IP
  - POST /api/reading/capture — 2MB body limit, 413 on oversize, rate-limited 5/hr per IP
  - GET /api/reading/[id] — 404 on non-UUID id, 410 on inactive reading
  - All three routes lint-clean with no console.log

affects:
  - 04-02 (tests for these routes)
  - frontend adapters (src/lib/reading-client.ts)

tech-stack:
  added: []
  patterns:
    - route segment config (runtime nodejs + maxDuration) on API routes needing server features
    - body size guard pattern: JSON.stringify(body).length > threshold before schema parse
    - UUID validation with z.string().uuid().safeParse before any DB query

key-files:
  created: []
  modified:
    - src/app/api/lead/register/route.ts
    - src/app/api/reading/capture/route.ts
    - src/app/api/reading/[id]/route.ts

key-decisions:
  - "lead/register returns 201 (not 200) — REST semantics for resource creation"
  - "Body size guard in capture route uses JSON.stringify(body).length, not Content-Length header — Content-Length can be spoofed or absent in Next.js App Router"
  - "UUID validation in reading/[id] returns 404 (not 400) — avoids leaking route existence to scanners"
  - "Pre-existing lint errors in untracked abacatepay files deferred — outside this plan's scope"

patterns-established:
  - "UUID guard pattern: z.string().uuid().safeParse(id) before prisma.findUnique — prevents DB error on garbage input"
  - "Body size pattern: JSON.stringify(body).length check before schema.parse — avoids parsing oversized payloads"
  - "Route runtime config: export const runtime = nodejs + maxDuration for all API routes"

requirements-completed: [API-01, API-02, API-03, API-04, SEC-01, SEC-02, SEC-04, SEC-05, SEC-06]

duration: 10min
completed: 2026-04-11
---

# Phase 4 Plan 1: Public API Audit Summary

**Three public API routes corrected: lead/register returns 201, capture has 2MB body guard + runtime config, reading/[id] has UUID validation — all lint-clean and type-safe.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-11T02:12:53Z
- **Completed:** 2026-04-11T02:23:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Fixed POST /api/lead/register to return HTTP 201 (was 200) — correct REST semantics for resource creation
- Added 2MB body size guard to POST /api/reading/capture before schema.parse — returns 413 on oversized payloads (prevents large base64 image abuse)
- Added `runtime = "nodejs"` and `maxDuration` config to both POST routes
- Added UUID format validation to GET /api/reading/[id] — returns clean 404 on garbage input instead of Prisma DB error
- Verified all Phase 3 import signatures (analyzeHand, selectBlocks, sendLeadReading) are compatible
- Confirmed all 6 security headers present in next.config.ts
- Zero console.log calls across all three routes

## Task Commits

1. **Task 1: Fix lead/register — 201 status + runtime config** - `6a97e4c` (fix)
2. **Task 2: Fix reading/capture — body size limit + runtime config** - `ad2540b` (fix)
3. **Task 3: Verify reading/[id] + UUID validation** - `46bbcd7` (fix)

## Files Created/Modified

- `src/app/api/lead/register/route.ts` — Added status 201, runtime config
- `src/app/api/reading/capture/route.ts` — Added 2MB body guard, runtime config
- `src/app/api/reading/[id]/route.ts` — Added UUID validation before DB query

## Decisions Made

- `lead/register` returns 201: REST convention for POST that creates a resource
- Body size guard uses `JSON.stringify(body).length` (not Content-Length header) because Content-Length can be absent or spoofed in App Router — serializing and measuring is reliable
- UUID validation returns 404 (not 400) to avoid leaking route structure to scanners

## Deviations from Plan

None — plan executed exactly as written. All three targeted fixes applied cleanly.

The pre-existing lint errors in `src/app/api/credits/purchase/route.ts`, `src/app/api/webhook/abacatepay/route.ts`, and `src/server/lib/abacatepay.ts` are out of scope (untracked files, not modified by this plan). Documented in `deferred-items.md`.

## Issues Encountered

Pre-existing lint errors in untracked abacatepay-related files. These are outside plan scope and documented in `.planning/phases/04-public-api/deferred-items.md` for cleanup before those files are committed.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All three public API routes are correct, lint-clean, and type-safe
- Ready for Plan 04-02: integration tests against these routes
- Deferred: fix lint in abacatepay files before committing that integration

---

_Phase: 04-public-api_
_Completed: 2026-04-11_

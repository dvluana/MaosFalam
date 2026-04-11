---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Ready to execute
stopped_at: Completed 06-client-adapters/06-01-PLAN.md
last_updated: "2026-04-11T02:43:11.057Z"
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 14
  completed_plans: 13
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** Foto da palma entra, leitura personalizada sai. Backend conecta GPT-4o ao motor de leitura e persiste resultados.
**Current focus:** Phase 06 — client-adapters

## Current Position

Phase: 06 (client-adapters) — EXECUTING
Plan: 2 of 2

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
| ----- | ----- | ----- | -------- |
| -     | -     | -     | -        |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

_Updated after each plan completion_
| Phase 01-foundation P01 | 15 | 4 tasks | 4 files |
| Phase 01-foundation P02 | 4 | 3 tasks | 6 files |
| Phase 02-auth P01 | 2 | 3 tasks | 1 files |
| Phase 02-auth P02 | 5 | 2 tasks | 2 files |
| Phase 03-ai-pipeline P02 | 2 | 2 tasks | 5 files |
| Phase 03-ai-pipeline P01 | 2 | 1 tasks | 2 files |
| Phase 03-ai-pipeline P03 | 10 | 2 tasks | 1 files |
| Phase 04-public-api P01 | 10 | 3 tasks | 3 files |
| Phase 04-public-api P02 | 6 | 1 tasks | 3 files |
| Phase 05-protected-api P01 | 7 | 2 tasks | 7 files |
| Phase 05-protected-api P03 | 4 | 2 tasks | 2 files |
| Phase 05-protected-api P02 | 2 | 2 tasks | 3 files |
| Phase 06-client-adapters P01 | 282 | 2 tasks | 6 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Neon + Prisma 7 (not v6): import path is `@/generated/prisma/client`, not `@prisma/client`
- Clerk v7: auth file is `src/proxy.ts` (not `middleware.ts`), `auth()` is async
- Zod v4: breaking syntax changes from v3 (`z.email()` not `z.string().email()`)
- Rate limiting: in-memory Map for MVP, known limitation on Vercel multi-instance (document as debt)
- Payment and email: explicitly deferred to next milestone
- [Phase 01-foundation]: Two-URL Prisma pattern: DATABASE_URL (pooled PgBouncer) for runtime, DIRECT_URL (direct Neon) for migrations — prevents P1001 timeout on DDL
- [Phase 01-foundation]: Pino redact covers root and nested (\*.field) PII paths — logger.info({ user: { name } }) also redacts
- [Phase 01-foundation]: .env.example force-added to git (git add -f): .gitignore .env\* glob catches it but example templates should be tracked
- [Phase 01-foundation]: Prisma 7: url/directUrl removed from schema.prisma — datasource block has provider only, connection config lives in prisma.config.ts
- [Phase 01-foundation]: prisma.config.ts loads .env.local explicitly (override:false) before .env — dotenv/config only loads .env, missing Next.js .env.local convention
- [Phase 01-foundation]: Pino test pattern: use Writable stream + JSON.parse to verify redact — avoids pino-pretty TTY requirement in vitest jsdom
- [Phase 02-auth]: proxy.ts is the sole Clerk auth file — middleware.ts deleted (was never tracked in git)
- [Phase 02-auth]: Updated matcher adds /(api|trpc)(.\*) pattern to ensure all API routes are evaluated by clerkMiddleware
- [Phase 02-auth]: getClerkUserId() uses auth() not currentUser() — auth() is session-only (no network call), currentUser() makes a Clerk API call
- [Phase 02-auth]: Test mock pattern for @clerk/nextjs/server: vi.mock at module level + vi.mocked(await import(...)) for typed refs
- [Phase 03-ai-pipeline]: \_fallback blocks in line block maps use brand voice text — can surface to user on schema drift, not just a dev placeholder
- [Phase 03-ai-pipeline]: json_schema strict mode requires Record<K,V> types expanded as fixed properties — additionalProperties with schema value rejected by OpenAI API
- [Phase 03-ai-pipeline]: gpt-4o-2024-08-06 pinned (not floating gpt-4o) to prevent silent behavior changes from OpenAI snapshot updates
- [Phase 03-ai-pipeline]: Both Structured Outputs and Zod kept: API-level enforcement + TypeScript narrowing serve different purposes
- [Phase 03-ai-pipeline]: openai.test.ts from 03-01 TDD pass already covered AI-01 through AI-04 — no rewrite needed in 03-03
- [Phase 03-ai-pipeline]: vi.mock('../logger') before import establishes clean test isolation pattern for all server lib modules
- [Phase 04-public-api]: lead/register returns 201 (not 200) — REST semantics for resource creation
- [Phase 04-public-api]: Body size guard in capture uses JSON.stringify(body).length — Content-Length header can be absent/spoofed in App Router
- [Phase 04-public-api]: UUID validation in reading/[id] returns 404 not 400 — avoids leaking route existence to scanners
- [Phase 04-public-api]: vi.resetAllMocks() clears factory mock return values — re-apply mocks in beforeEach explicitly
- [Phase 04-public-api]: Zod v4 uuid() rejects non-standard UUIDs (version digit must be 1-8) — use crypto.randomUUID() for test fixtures
- [Phase 05-protected-api]: credits/purchase was already fully implemented with AbacatePay — no 501 stub needed; import order fixed instead
- [Phase 05-protected-api]: import order lint errors in credits/purchase and webhook were auto-fixed (Rule 3) — abacatepay imports must precede auth/logger alphabetically
- [Phase 05-protected-api]: profile route mocks currentUser() (getClerkUser), account route mocks auth() (getClerkUserId) — different auth helpers require different mock targets
- [Phase 05-protected-api]: SEC-03 rate limit for credits/purchase deferred to v2 — documented as comment in account test file
- [Phase 05-protected-api]: Mock @/server/lib/auth (getClerkUserId) directly — routes use auth layer, not Clerk directly
- [Phase 05-protected-api]: prisma.$transaction mock calls callback with prisma as tx — mirrors real behavior without Neon connection
- [Phase 06-client-adapters]: getReading uses reading.id as share_token fallback; share_expires_at hardcoded 2099-12-31; revelacao phrase read from sessionStorage.maosfalam_impact_phrase

### Pending Todos

None yet.

### Blockers/Concerns

- GPT-4o JSON Schema for HandAttributes must be derived from `src/types/hand-attributes.ts` — handle in Phase 3 planning
- `selectBlocks` needs fallback blocks for every axis — handle in Phase 3 planning
- Both `proxy.ts` and `middleware.ts` may exist in codebase; verify and consolidate in Phase 2

## Session Continuity

Last session: 2026-04-11T02:43:11.053Z
Stopped at: Completed 06-client-adapters/06-01-PLAN.md
Resume file: None

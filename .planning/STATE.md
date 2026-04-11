---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase complete — ready for verification
stopped_at: Completed 02-auth/02-02-PLAN.md
last_updated: "2026-04-11T01:23:36.108Z"
progress:
  total_phases: 6
  completed_phases: 2
  total_plans: 4
  completed_plans: 4
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** Foto da palma entra, leitura personalizada sai. Backend conecta GPT-4o ao motor de leitura e persiste resultados.
**Current focus:** Phase 02 — auth

## Current Position

Phase: 02 (auth) — EXECUTING
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

### Pending Todos

None yet.

### Blockers/Concerns

- GPT-4o JSON Schema for HandAttributes must be derived from `src/types/hand-attributes.ts` — handle in Phase 3 planning
- `selectBlocks` needs fallback blocks for every axis — handle in Phase 3 planning
- Both `proxy.ts` and `middleware.ts` may exist in codebase; verify and consolidate in Phase 2

## Session Continuity

Last session: 2026-04-11T01:23:36.104Z
Stopped at: Completed 02-auth/02-02-PLAN.md
Resume file: None

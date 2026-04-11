# Roadmap: MaosFalam Backend

## Overview

The frontend exists and runs on mocks. This milestone replaces mocks with a real backend: Neon database, Clerk auth, GPT-4o vision pipeline, public and protected API routes, and client adapters that switch the frontend from mock data to live responses. Build order is strict — Prisma-generated types are a hard dependency for all server libs, and the AI pipeline is the core product value that everything else supports.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Database schema, Prisma client, logger, and env vars (completed 2026-04-11)
- [x] **Phase 2: Auth** - Clerk middleware, route protection, and server-side auth helpers (completed 2026-04-11)
- [ ] **Phase 3: AI Pipeline** - GPT-4o wrapper, selectBlocks hardening, reading persistence
- [x] **Phase 4: Public API** - Lead capture, reading capture, reading GET, rate limiting, security headers (completed 2026-04-11)
- [ ] **Phase 5: Protected API** - Credit debit, reading history, profile CRUD, account deletion
- [ ] **Phase 6: Client Adapters** - Frontend mock-to-API transition, end-to-end integration

## Phase Details

### Phase 1: Foundation

**Goal**: Infrastructure that every other phase depends on is in place and verified
**Depends on**: Nothing (first phase)
**Requirements**: DB-01, DB-02, DB-03, DB-04, INFRA-01, INFRA-02, INFRA-03, SEC-07
**Success Criteria** (what must be TRUE):

1. `prisma migrate dev --name init` runs without error and all 5 tables exist in Neon
2. A server-side import of the Prisma client connects to Neon and executes a query without exhausting connections across hot-reloads
3. Pino logger is importable in any server file and produces structured output without any name, email, or CPF in log lines
4. `.env.example` documents every required variable and `npm run type-check` passes

**Plans**: 2 plans

Plans:

- [x] 01-01-PLAN.md — Neon provisioning + fix Prisma schema, prisma.config.ts, Pino logger, and .env.example
- [x] 01-02-PLAN.md — Write logger/prisma unit tests and run prisma migrate dev --name init

### Phase 2: Auth

**Goal**: Clerk guards all protected routes and server-side auth helpers are reliable
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):

1. Requests to `/api/user/*` and `/api/reading/new` without a valid Clerk session receive 401
2. Requests to `/api/reading/capture`, `/api/reading/[id]`, and `/api/lead/register` succeed without a session token
3. `getClerkUserId()` returns a valid user ID inside a protected route handler
4. `ClerkProvider` is active in the root layout and the sign-in flow works end-to-end

**Plans**: 2 plans

Plans:

- [x] 02-01-PLAN.md — Migrate clerkMiddleware from middleware.ts to proxy.ts, delete middleware.ts
- [x] 02-02-PLAN.md — Verify and test auth helpers (getClerkUser, getClerkUserId), confirm ClerkProvider in layout

### Phase 3: AI Pipeline

**Goal**: A palm photo enters, a persisted reading exits, and the pipeline never crashes on unexpected GPT-4o output
**Depends on**: Phase 1
**Requirements**: AI-01, AI-02, AI-03, AI-04
**Success Criteria** (what must be TRUE):

1. Sending a valid palm photo base64 to the GPT-4o wrapper returns a typed `HandAttributes` object validated by Zod
2. A GPT-4o response with `confidence < 0.3` routes to the rejection path without calling `selectBlocks`
3. An unrecognized variation in GPT-4o output triggers a fallback block instead of a thrown error
4. The photo is not present in any database record, log line, or response after processing

**Plans**: 3 plans

Plans:

- [x] 03-01-PLAN.md — Fix openai.ts: switch to json_schema Structured Outputs, pin model, add Zod validation
- [x] 03-02-PLAN.md — Harden selectBlocks: add \_fallback blocks to all four line maps, update buildLineSection
- [x] 03-03-PLAN.md — Write unit tests for analyzeHand (AI-01 to AI-04) and selectBlocks fallback

### Phase 4: Public API

**Goal**: The reading funnel works end-to-end without authentication
**Depends on**: Phase 2, Phase 3
**Requirements**: API-01, API-02, API-03, API-04, SEC-01, SEC-02, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):

1. POST /api/lead/register saves a lead to Neon and returns 201; invalid payloads return 400 with Zod errors
2. POST /api/reading/capture returns a saved reading with `tier: free` when confidence >= 0.3, and a cigana-voiced rejection when confidence < 0.3
3. GET /api/reading/[id] returns the reading JSON; a valid but inactive reading returns 410
4. A client that POSTs to /api/reading/capture more than 5 times in an hour receives 429 on the 6th request
5. All API responses include the required security headers (X-Frame-Options, HSTS, Permissions-Policy, etc.)

**Plans**: 2 plans

Plans:

- [x] 04-01-PLAN.md — Audit and fix the 3 existing public API routes (201 status, body size limit, UUID validation, import verification)
- [x] 04-02-PLAN.md — Write route tests proving API-01 through API-04 and SEC-01, SEC-02, SEC-05, SEC-06

### Phase 5: Protected API

**Goal**: Logged-in users can manage credits, readings, and their account
**Depends on**: Phase 2, Phase 4
**Requirements**: API-05, API-06, API-07, API-08, API-09, API-10, SEC-03
**Success Criteria** (what must be TRUE):

1. POST /api/reading/new atomically debits 1 credit FIFO; a second concurrent request with only 1 credit remaining receives 402
2. GET /api/user/credits returns the correct remaining balance and pack list
3. GET /api/user/readings returns only readings belonging to the authenticated user
4. PUT /api/user/profile upserts CPF and phone without exposing them in any log
5. DELETE /api/user/account with body `{"confirmation": "EXCLUIR"}` sets `is_active = false`; without the confirmation string it returns 400

**Plans**: 3 plans

Plans:

- [x] 05-01-PLAN.md — Audit and fix all 5 protected routes (Zod v4 compliance, PII-safe logs, SEC-03 stub)
- [ ] 05-02-PLAN.md — Tests for reading/new (API-05), user/credits (API-06), user/readings (API-07)
- [ ] 05-03-PLAN.md — Tests for user/profile (API-08, API-09) and user/account (API-10)

### Phase 6: Client Adapters

**Goal**: The frontend reads from and writes to real API endpoints; no mock path remains in production
**Depends on**: Phase 4, Phase 5
**Requirements**: ADAPT-01, ADAPT-02, ADAPT-03, ADAPT-04, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):

1. The reading funnel (lead register > camera capture > result) completes against real Neon data with no mock hook active
2. The logged-in area (readings list, profile, credits) displays real data from the protected API
3. No file under `src/` imports from `@/server/*`; `npm run type-check` confirms this
4. `npm run build` passes without errors or type warnings
   **Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase              | Plans Complete | Status      | Completed  |
| ------------------ | -------------- | ----------- | ---------- |
| 1. Foundation      | 2/2            | Complete    | 2026-04-11 |
| 2. Auth            | 2/2            | Complete    | 2026-04-11 |
| 3. AI Pipeline     | 2/3            | In Progress |            |
| 4. Public API      | 2/2            | Complete    | 2026-04-11 |
| 5. Protected API   | 1/3            | In Progress |            |
| 6. Client Adapters | 0/TBD          | Not started | -          |

---
phase: 06-client-adapters
plan: "01"
subsystem: client-adapters
tags: [adapter, api-client, reading, frontend]
dependency_graph:
  requires:
    - 04-public-api/04-01 (POST /api/lead/register)
    - 04-public-api/04-02 (POST /api/reading/capture, GET /api/reading/[id])
  provides:
    - reading-client.ts with registerLead, captureReading, getReading
    - App pages that load data from real API instead of mocks
  affects:
    - src/app/ler/resultado (all sub-routes)
    - src/app/ler/revelacao
    - src/app/compartilhar
tech_stack:
  added: []
  patterns:
    - useEffect + useState pattern for async data loading in client pages
    - Server component fetch with NEXT_PUBLIC_BASE_URL for compartilhar page
    - sessionStorage key maosfalam_impact_phrase for phrase handoff to revelacao
key_files:
  created: []
  modified:
    - src/lib/reading-client.ts
    - src/app/ler/resultado/[id]/page.tsx
    - src/app/ler/resultado/[id]/completo/page.tsx
    - src/app/ler/resultado/[id]/share/page.tsx
    - src/app/ler/revelacao/page.tsx
    - src/app/compartilhar/[token]/page.tsx
decisions:
  - "getReading uses reading.id as share_token fallback since compartilhar/[token] routes use the reading id directly"
  - "share_expires_at hardcoded to 2099-12-31 since architecture.md states readings do not expire"
  - "revelacao phrase initialized via requestAnimationFrame (not synchronous setState) to satisfy react-hooks/set-state-in-effect lint rule"
  - "onContinue in revelacao reads maosfalam_reading_id from sessionStorage; fallback is 'demo'"
metrics:
  duration: "282s"
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 6
---

# Phase 06 Plan 01: Client Adapters Summary

reading-client.ts rewritten with real API calls (registerLead, captureReading, getReading); all 5 app pages migrated from @/server/\* mock imports to async API data loading.

## Tasks Completed

| Task | Description                                       | Commit  |
| ---- | ------------------------------------------------- | ------- |
| 1    | Rewrite reading-client.ts with real API functions | c75e3f1 |
| 2    | Remove @/server/\* imports from 5 app pages       | 9752c08 |

## What Was Built

**Task 1 — reading-client.ts**

Three exported async functions replacing the old mock-based single function:

- `registerLead` — POST /api/lead/register, returns `{ lead_id }`
- `captureReading` — POST /api/reading/capture, returns `{ reading_id, report }`
- `getReading` — GET /api/reading/[id], returns `Reading | null` (null on 404/410)

`getReading` constructs the `Reading` object from the API response, using `reading.id` as `share_token` and a static far-future date for `share_expires_at` (per architecture.md: readings don't expire).

**Task 2 — App pages**

Five pages migrated from direct `@/server/lib/select-blocks` + `@/mocks/hand-attributes` imports:

- `resultado/[id]/page.tsx` — `useEffect` + `useState` pattern; loading state shows `PageLoading`, not-found shows `InvalidReading`, loaded renders with `report.element.key` as element
- `resultado/[id]/completo/page.tsx` — same pattern; builds `data` object from API `Reading`
- `resultado/[id]/share/page.tsx` — same pattern; all canvas/share/copy/download logic preserved
- `revelacao/page.tsx` — removed module-level `selectBlocks` call; phrase now sourced from `sessionStorage.maosfalam_impact_phrase` with fallback brand voice phrase; navigation reads `maosfalam_reading_id` from sessionStorage
- `compartilhar/[token]/page.tsx` — server component; replaced mock `resolveToken` with async `resolveReading` that fetches `/api/reading/${token}` using `NEXT_PUBLIC_BASE_URL`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ESLint react-hooks/set-state-in-effect in revelacao/page.tsx**

- **Found during:** Task 2 commit (lint-staged caught it)
- **Issue:** `setPhrase(...)` called synchronously inside `useEffect` body triggers cascading renders warning
- **Fix:** Wrapped the sessionStorage reads and `setPhrase` call inside `window.requestAnimationFrame` callback (same pattern used in the original file for the name read), satisfying the lint rule
- **Files modified:** `src/app/ler/revelacao/page.tsx`
- **Commit:** 9752c08

## Known Stubs

- `revelacao/page.tsx` onContinue: `hasCredits` check reads `user.credits` via unsafe cast — the `useAuth` hook's user type does not expose `credits`. This is intentional for now; when Clerk auth is wired and the user profile includes credits, this check will be replaced by `GET /api/user/credits`. The path works correctly for the majority case (free user navigates to `/ler/resultado/${readingId}`).

## Self-Check

PASSED

- `src/lib/reading-client.ts` — FOUND
- `src/app/ler/resultado/[id]/page.tsx` — FOUND
- `src/app/compartilhar/[token]/page.tsx` — FOUND
- Commit c75e3f1 — FOUND (Task 1)
- Commit 9752c08 — FOUND (Task 2)

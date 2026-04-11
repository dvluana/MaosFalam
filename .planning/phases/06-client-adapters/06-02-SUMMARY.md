---
phase: 06-client-adapters
plan: "02"
subsystem: frontend/account
tags: [client-adapters, account, mock-removal, build-gate]
dependency_graph:
  requires: [06-01]
  provides: [ADAPT-02, ADAPT-03, ADAPT-04, INFRA-04, INFRA-05]
  affects: [conta/leituras, conta/leituras/[id]]
tech_stack:
  added: []
  patterns: [useEffect-fetch, useState-loading, API-adapter-pattern]
key_files:
  modified:
    - src/app/conta/leituras/page.tsx
    - src/app/conta/leituras/[id]/page.tsx
decisions:
  - "CreditsBanner receives credits:number prop directly — no User object needed since credits always show 0 (separate endpoint deferred)"
  - "conta/leituras/[id] notFound() called after loading=false and reading=null — guards against stale IDs"
metrics:
  duration: "8 minutes"
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 2
---

# Phase 06 Plan 02: Account Pages API Migration Summary

**One-liner:** Replaced useMock in both conta pages with real getUserReadings/getReading API calls; npm run build and type-check pass clean.

## What Was Done

### Task 1: conta/leituras/page.tsx

Removed `useMock<User>("user")` and replaced with two API calls in a single `useEffect`:

- `getUserProfile()` from `@/lib/user-client` — provides user name
- `getUserReadings()` from `@/lib/user-client` — provides readings array

Readings are mapped from the API response shape to `Reading` type using `r.tier as Tier` and `r.report as ReportJSON` casts. `CreditsBanner` was refactored to accept a plain `credits: number` prop instead of a full `User` object (credits show as 0 since the credits endpoint is separate). Loading state drives the `currentState` derivation.

### Task 2: conta/leituras/[id]/page.tsx

Removed `useMock<User>("user")` and the `data.readings.find(r => r.id === id)` lookup. Replaced with direct `getReading(id)` call from `@/lib/reading-client` in a `useEffect`. If `reading` is null after load completes, `notFound()` is called. All JSX, tier logic, and share options unchanged.

### Final Verification

- `grep -r "from \"@/server" src/ --include="*.tsx" --include="*.ts" | grep -v "route\." | grep -v "\.test\."` — zero results
- `npm run type-check` — exits 0, no errors
- `npm run build` — exits 0, all pages compiled

## Deviations from Plan

### Auto-fixed Issues

None. Plan executed exactly as written.

## Known Stubs

- `TarotReadingCard` and `ListReadingItem` still render `"Marina"` as the hardcoded reading name (pre-existing from prior work). `target_name` is available on the API response but the components receive the full `Reading` object where `target_name` is not in the current `Reading` type — resolving this is out of scope for this plan.

## Self-Check

- [x] `src/app/conta/leituras/page.tsx` — exists, no useMock import
- [x] `src/app/conta/leituras/[id]/page.tsx` — exists, no useMock import
- [x] Commit c2eb837 — Task 1
- [x] Commit c293cd9 — Task 2
- [x] `npm run type-check` — passed
- [x] `npm run build` — passed
- [x] No `@/server/*` imports in non-route src files

## Self-Check: PASSED

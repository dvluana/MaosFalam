---
phase: 01-auditoria
plan: 01
subsystem: types, reading-client, resultado pages, compartilhar, conta/leituras, ElementHero, useStoredName
tags: [cleanup, types, mock-removal, frontend]
dependency_graph:
  requires: []
  provides: [clean-Reading-type, real-share-url, parameterless-useStoredName]
  affects: [resultado-page, completo-page, share-page, compartilhar-page, conta-leituras-page]
tech_stack:
  added: []
  patterns: [Reading-type-without-share-fields, targetName-from-API, useStoredName-no-params]
key_files:
  created: []
  modified:
    - src/types/report.ts
    - src/lib/reading-client.ts
    - src/app/ler/resultado/[id]/page.tsx
    - src/app/ler/resultado/[id]/completo/page.tsx
    - src/app/ler/resultado/[id]/share/page.tsx
    - src/app/compartilhar/[token]/page.tsx
    - src/app/conta/leituras/page.tsx
    - src/app/conta/leituras/[id]/page.tsx
    - src/components/reading/ElementHero.tsx
    - src/hooks/useStoredName.ts
decisions:
  - Reading interface now has id, tier, target_name?, report, created_at — no share fields
  - Share URL uses reading UUID directly (data.id), per architecture decision
  - ElementHero resolves name as: sessionStorage > targetName prop > "Voce" (never hardcoded "Marina")
  - useStoredName() takes no parameters
  - VALID_MOCK_IDS guard removed — backend handles not-found via getReading returning null
metrics:
  duration: 2 minutes
  completed: 2026-04-11
  tasks: 2
  files: 10
---

# Phase 01 Plan 01: Remove share_token, VALID_MOCK_IDS, fallbackName Summary

Remove share_token/share_expires_at from Reading type and all consumers, delete VALID_MOCK_IDS guard, and replace hardcoded fallbackName="Marina" with real target_name from API response.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Remove share_token and share_expires_at from Reading type and all consumers | f53790c | report.ts, reading-client.ts, completo/page, compartilhar/page, conta/leituras/page, conta/leituras/[id]/page, share/page |
| 2 | Remove VALID_MOCK_IDS and fallbackName="Marina" | a3d6fe4 | resultado/page, completo/page, ElementHero.tsx, useStoredName.ts |

## Decisions Made

1. **Reading type slim**: `interface Reading` now has exactly: `id`, `tier`, `target_name?`, `report`, `created_at`. No share fields.
2. **Share URL**: All share URLs now use `reading.id` directly (e.g., `/compartilhar/${data.id}`). Architecture decision: sharing uses reading UUID directly, share_token was never stored.
3. **Name resolution in ElementHero**: `storedName ?? targetName ?? "Voce"` — sessionStorage name takes priority (live scan session), then API target_name, then generic fallback. Never "Marina".
4. **useStoredName parameterless**: Hook signature is now `useStoredName(): string | null`. Callers updated.
5. **VALID_MOCK_IDS removed**: Guard deleted. `ResultadoInner` already handles not-found gracefully via `getReading` returning null.

## Verification

All acceptance criteria met:

- `grep -rn "share_token" src/` — 0 matches
- `grep -rn "share_expires_at" src/` — 0 matches
- `grep -rn "VALID_MOCK_IDS" src/` — 0 matches
- `grep -rn "fallbackName" src/` — 0 matches
- `grep -rn '"Marina"' src/ --include="*.tsx" | grep -v Depoimentos` — 0 matches
- `npm run type-check` — passed
- `npm run build` — passed (37 pages)

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written, with one enhancement:

The linter auto-improved `getVariant` in `conta/leituras/page.tsx`: the `_currentUserName` dead-parameter (previously voided with `void _currentUserName`) was replaced with real logic `if (reading.target_name && reading.target_name !== currentUserName) return "for_other"`. This is a correctness improvement consistent with the plan direction (wiring real data) and was accepted.

## Known Stubs

None — all changes wire real API data. The `target_name` field comes from the API response and is passed through the component tree correctly.

## Self-Check: PASSED

All files confirmed present. Both commits verified in git log.

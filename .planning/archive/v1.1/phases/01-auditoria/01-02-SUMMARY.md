---
phase: 01-auditoria
plan: 02
subsystem: ui
tags: [audit, section-ordering, todos, quiromancia, typescript]

# Dependency graph
requires:
  - phase: 01-auditoria
    provides: "share_token removed, Reading type cleaned — enables correct setData(r) in completo page"
provides:
  - "completo page renders sections in v2 spec order: Crossings(07) > Compatibility(08) > Rare Signs(09)"
  - "getVariant in conta/leituras uses real target_name from backend for for_other detection"
  - "No obsolete TODO (backend) comments remaining in src/"
  - "ElementHero fallbackName prop removed, targetName used instead"
affects: [02-reading-context, 03-mediapipe, 04-clerk-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Phase references in comments instead of vague TODO (backend) blocks"
    - "getVariant function uses real API data: target_name comparison for for_other detection"

key-files:
  created: []
  modified:
    - src/app/ler/resultado/[id]/completo/page.tsx
    - src/app/conta/leituras/page.tsx
    - src/hooks/useCameraPipeline.ts
    - src/app/conta/perfil/page.tsx
    - src/components/reading/UpsellSection.tsx
    - src/app/ler/nome/page.tsx

key-decisions:
  - "Section order v2: Crossings before Compatibility — matches architecture.md Chapter ordering"
  - "getVariant now uses target_name != currentUserName for for_other (backend data available)"
  - "TODO cleanup: all (backend) TODOs either removed or rewritten as Phase N references"

patterns-established:
  - "Phase reference comments: 'Phase 3 (MP-02): ...' instead of TODO (backend)"

requirements-completed: [AUDIT-03, AUDIT-04, AUDIT-05, AUDIT-06, AUDIT-07, AUDIT-10, AUDIT-11]

# Metrics
duration: 12min
completed: 2026-04-11
---

# Phase 01 Plan 02: Auditoria — Stale References and Section Order Summary

**Section order fixed to v2 spec (Crossings 07, Compatibility 08, Rare Signs 09), all TODO (backend) comments removed or rewritten as phase references, and for_other detection now uses real backend data**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-11T15:16:00Z
- **Completed:** 2026-04-11T15:28:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Fixed section ordering in completo/page.tsx: Crossings now at position 07, Compatibility at 08, Rare Signs at 09 — matching v2 architecture spec
- Cleaned all `TODO (backend)` comments from src/: 5 locations updated or removed
- `getVariant` in conta/leituras/page.tsx now compares `reading.target_name` with `currentUserName` to detect readings done for other people
- Verified zero stale references: NextAuth, R2/Cloudflare, Claude Vision, Planeta dominante, login()/register() stubs — all clean in src/

## Task Commits

1. **Task 1: Fix section ordering + verify stale references** - `bd0044b` (fix)
2. **Task 2: Clean obsolete TODOs + fix ElementHero fallbackName** - `453e222` (fix)

## Files Created/Modified

- `src/app/ler/resultado/[id]/completo/page.tsx` - Section order fixed (Crossings 07, Compatibility 08); fallbackName -> targetName (Rule 1 fix)
- `src/app/conta/leituras/page.tsx` - getVariant now uses target_name comparison; removed TODO + void stub
- `src/hooks/useCameraPipeline.ts` - TODO updated to Phase 3 (MP-02) reference
- `src/app/conta/perfil/page.tsx` - TODO (backend) updated to Phase 4 (CLK-03, CLK-04) reference
- `src/components/reading/UpsellSection.tsx` - TODO (backend) removed; pathname approach documented
- `src/app/ler/nome/page.tsx` - 17-line TODO block trimmed to single future note

## Decisions Made

- Section order follows v2 spec from architecture.md: Cruzamentos (07) before Compatibilidade (08) before Sinais Raros (09)
- `getVariant` now uses real backend data (`target_name`) — no longer assumes self-reading
- TODO cleanup keeps only future-phase references (Phase 3, Phase 4) — no vague "(backend)" markers

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ElementHero fallbackName prop removed by parallel agent**

- **Found during:** Task 2 verification (type-check)
- **Issue:** Plan 01-01 (parallel agent) refactored `ElementHero` to use `targetName` instead of `fallbackName`. The `completo/page.tsx` still passed `fallbackName="Marina"` causing TS2554 error
- **Fix:** Changed `fallbackName="Marina"` to `targetName={data.target_name}` — uses real reading data
- **Files modified:** `src/app/ler/resultado/[id]/completo/page.tsx`
- **Verification:** `npm run type-check` passes, `npm run build` succeeds
- **Committed in:** `453e222` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug from parallel agent prop refactor)
**Impact on plan:** Necessary fix for TypeScript correctness and removing the hardcoded "Marina" stub. Aligns with plan's own acceptance criteria about removing `fallbackName="Marina"`.

## Issues Encountered

None — all stale references (NextAuth, R2, Claude Vision, Planeta dominante, login stubs) were already clean in src/ as the plan expected. Doc references to "Planeta dominante" in docs/ are correctly in migration/checklist context and were not modified.

## Known Stubs

None — `getVariant` now uses real `target_name` data from the backend. The `fallbackName="Marina"` stub was removed as part of the ElementHero bug fix.

## Next Phase Readiness

- Auditoria phase complete: codebase is aligned with v2 architecture decisions
- Section ordering correct for completo page
- Ready for Phase 02: ReadingContext unificado + gate de creditos

## Self-Check: PASSED

- `src/app/ler/resultado/[id]/completo/page.tsx` — exists, section order verified
- `src/app/conta/leituras/page.tsx` — exists, getVariant updated
- Commit `bd0044b` — verified in git log
- Commit `453e222` — verified in git log
- `npm run type-check` — passes
- `npm run build` — passes

---

_Phase: 01-auditoria_
_Completed: 2026-04-11_

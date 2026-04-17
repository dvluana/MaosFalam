---
phase: quick
plan: 260417-rjx
subsystem: server/reading-engine
tags: [determinism, prng, select-blocks, testing]
dependency_graph:
  requires: []
  provides: [DETERMINISM-01]
  affects: [src/server/lib/select-blocks.ts]
tech_stack:
  added: []
  patterns: [mulberry32 seeded PRNG, closure-based rng injection]
key_files:
  modified:
    - src/server/lib/select-blocks.ts
    - src/server/lib/__tests__/select-blocks.test.ts
decisions:
  - mulberry32 chosen for zero-dependency, fast, well-distributed 32-bit PRNG
  - hashInputs uses djb2-style hash on JSON.stringify(attrs) + name + gender for stable seed
  - rng passed as closure parameter (not global) to keep selectBlocks pure and testable
metrics:
  duration: 8m
  completed: 2026-04-17
  tasks: 1
  files: 2
---

# Quick Task 260417-rjx: Fix pickRandom — Seeded PRNG in selectBlocks

**One-liner:** Replaced Math.random() with mulberry32 seeded PRNG (seed from djb2 hash of attrs+name+gender) so identical HandAttributes always produce identical ReportJSON.

## What Was Done

Task 1 implemented and verified (TDD: RED then GREEN):

**RED:** Added 3 failing determinism tests to `select-blocks.test.ts` that called `selectBlocks` twice with identical inputs and asserted deep equality. Tests failed because `Math.random()` is unseeded.

**GREEN:** Implemented in `select-blocks.ts`:

1. `mulberry32(seed)` — pure seeded PRNG returning a `() => number` closure
2. `hashInputs(attrs, name, gender)` — djb2-style hash over `JSON.stringify(attrs) + "|" + name + "|" + gender`
3. `pickRandom(block, rng)` — signature updated to accept `rng` instead of calling `Math.random()` directly
4. `selectBlocks()` creates `const rng = mulberry32(hashInputs(attributes, name, gender))` at the top
5. `rng` propagated to all 5 internal builders: `buildLineSection`, `buildVenus`, `buildCrossings`, `buildCompatibility`, `buildRareSigns`

## Verification

- `grep -c "Math.random" src/server/lib/select-blocks.ts` → 0
- All 163 tests pass (160 existing + 3 new determinism tests)
- `npm run type-check` passes
- `npm run build` passes

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- src/server/lib/select-blocks.ts — modified, contains `mulberry32`
- src/server/lib/**tests**/select-blocks.test.ts — modified, contains `deterministic`
- Commit 3721805 exists in git log

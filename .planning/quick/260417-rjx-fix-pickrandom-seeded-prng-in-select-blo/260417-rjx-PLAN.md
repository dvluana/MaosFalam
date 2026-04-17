---
phase: quick
plan: 260417-rjx
type: execute
wave: 1
depends_on: []
files_modified:
  - src/server/lib/select-blocks.ts
  - src/server/lib/__tests__/select-blocks.test.ts
autonomous: true
requirements: [DETERMINISM-01]

must_haves:
  truths:
    - "Same HandAttributes + name + gender always produce identical ReportJSON"
    - "pickRandom() uses seeded PRNG instead of Math.random()"
    - "Existing tests still pass (no regression)"
  artifacts:
    - path: "src/server/lib/select-blocks.ts"
      provides: "Seeded PRNG via mulberry32 + hashAttributes"
      contains: "mulberry32"
    - path: "src/server/lib/__tests__/select-blocks.test.ts"
      provides: "Determinism test calling selectBlocks twice with same inputs"
      contains: "deterministic"
  key_links:
    - from: "selectBlocks()"
      to: "pickRandom()"
      via: "rng closure passed as argument"
      pattern: "pickRandom\\(.*rng\\)"
---

<objective>
Replace Math.random() in pickRandom() with a seeded PRNG (mulberry32) so that identical HandAttributes + name + gender always produce identical ReportJSON output.

Purpose: Users resubmitting the same photo were getting different text variations every time because pickRandom() used unseeded Math.random(). This breaks the "same attributes = same report" invariant.

Output: Deterministic select-blocks.ts + test proving determinism.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/server/lib/select-blocks.ts
@src/server/lib/__tests__/select-blocks.test.ts
@src/types/hand-attributes.ts
@src/types/report.ts
@.planning/debug/readings-random-results.md
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement seeded PRNG and update pickRandom</name>
  <files>src/server/lib/select-blocks.ts, src/server/lib/__tests__/select-blocks.test.ts</files>
  <behavior>
    - Test: selectBlocks(VALID_ATTRIBUTES, "Maria", "female") called twice returns deep-equal ReportJSON
    - Test: selectBlocks with different attributes returns different ReportJSON (not trivially identical)
    - Test: selectBlocks with same attributes but different name returns different text (name substitution differs)
  </behavior>
  <action>
    1. Add mulberry32 PRNG function to select-blocks.ts (pure, zero deps):
       ```typescript
       function mulberry32(seed: number): () => number {
         return () => {
           seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
           let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
           t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
           return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
         };
       }
       ```

    2. Add hashInputs function that hashes attributes + name + gender to a stable 32-bit int:
       ```typescript
       function hashInputs(attrs: HandAttributes, name: string, gender: string): number {
         const str = JSON.stringify(attrs) + "|" + name + "|" + gender;
         let hash = 0;
         for (let i = 0; i < str.length; i++) {
           hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
         }
         return hash;
       }
       ```

    3. Change pickRandom signature from `pickRandom(block: TextBlock)` to `pickRandom(block: TextBlock, rng: () => number)`. Replace `Math.random()` with `rng()`.

    4. At the top of selectBlocks(), create the seeded PRNG:
       ```typescript
       const seed = hashInputs(attributes, name, gender);
       const rng = mulberry32(seed);
       ```

    5. Update ALL ~15 callsites of pickRandom inside select-blocks.ts to pass `rng` as second argument. These are in:
       - selectBlocks(): elementIntro, elementBody, impactPhrase fallback, opening, epilogue
       - buildLineSection(): sectionOpening, bodyPast, bodyPresent, modifier pickRandom calls
       - buildVenus(): venusOpening, venusBody, cinturaoText, venusClosing
       - buildCrossings(): crossing body
       - buildCompatibility(): compat body
       - buildRareSigns(): rare sign body

       Since buildLineSection, buildVenus, buildCrossings, buildCompatibility, buildRareSigns are separate functions, pass `rng` as an additional parameter to each.

    6. Add determinism tests to select-blocks.test.ts:
       - "produces deterministic output for identical inputs": call selectBlocks twice with VALID_ATTRIBUTES/"Maria"/"female", assert deep equality
       - "different attributes produce different text variations": call with VALID_ATTRIBUTES and a modified copy (e.g., element: "water"), assert reports are NOT deep-equal
       - "different name produces different substituted text": call with "Maria" vs "Ana", verify opening/element texts differ (name substitution)

    7. Run existing tests to confirm no regression.

    IMPORTANT: Do NOT change the public signature of selectBlocks(). It stays as (attributes, name, gender) => ReportJSON. The rng is internal.

  </action>
  <verify>
    <automated>cd "/Users/luana/Documents/Code Projects/Paritech projs/MaosFalam" && npm run test -- --run src/server/lib/__tests__/select-blocks.test.ts</automated>
  </verify>
  <done>
    - pickRandom() uses seeded PRNG, zero Math.random() calls remain in select-blocks.ts
    - selectBlocks(same inputs) === selectBlocks(same inputs) (deterministic)
    - All existing tests pass
    - New determinism tests pass
    - npm run build succeeds
  </done>
</task>

</tasks>

<verification>
```bash
# 1. No Math.random() in select-blocks.ts
grep -c "Math.random" src/server/lib/select-blocks.ts  # expect: 0

# 2. Tests pass

npm run test -- --run src/server/lib/**tests**/select-blocks.test.ts

# 3. Build passes

npm run build

# 4. Type check

npm run type-check

```
</verification>

<success_criteria>
- Math.random() fully replaced by seeded PRNG in select-blocks.ts
- Same inputs to selectBlocks() always produce identical ReportJSON
- All existing + new tests pass
- Build and type-check pass
</success_criteria>

<output>
After completion, create `.planning/quick/260417-rjx-fix-pickrandom-seeded-prng-in-select-blo/260417-rjx-SUMMARY.md`
</output>
```

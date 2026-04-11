---
phase: 03-ai-pipeline
verified: 2026-04-11T02:10:12Z
status: gaps_found
score: 3/4 success criteria verified
gaps:
  - truth: "An unrecognized variation in GPT-4o output triggers a fallback block instead of a thrown error"
    status: partial
    reason: "Fallback block path works correctly and does not throw. However, the _fallback.body_past block in life.ts contains {{igual}} which is absent from GENDER_MAP. If this path is reached, the rendered text shows the raw marker '{{igual}}' to the user."
    artifacts:
      - path: "src/data/blocks/life.ts"
        issue: "Line 172: body_past.content contains {{igual}} — this marker is not in GENDER_MAP (female or male entries)"
      - path: "src/data/blocks/gender-map.ts"
        issue: "Missing {{igual}} entry in both female and male maps"
    missing:
      - "Add '{{igual}}': 'igual' to GENDER_MAP.female and '{{igual}}': 'igual' to GENDER_MAP.male in src/data/blocks/gender-map.ts"
---

# Phase 03: AI Pipeline Verification Report

**Phase Goal:** A palm photo enters, a persisted reading exits, and the pipeline never crashes on unexpected GPT-4o output
**Verified:** 2026-04-11T02:10:12Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                          | Status   | Evidence                                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sending a valid palm photo base64 to the GPT-4o wrapper returns a typed HandAttributes object validated by Zod | VERIFIED | `analyzeHand()` uses `HandAttributesSchema.safeParse()` after parsing GPT-4o response; 11 tests pass                                                                                                             |
| 2   | A GPT-4o response with confidence < 0.3 routes to the rejection path without calling selectBlocks              | VERIFIED | `capture/route.ts` lines 39-51: returns 422 before `selectBlocks` call on line 54                                                                                                                                |
| 3   | An unrecognized variation in GPT-4o output triggers a fallback block instead of a thrown error                 | PARTIAL  | Fallback wiring is correct (`blocks[variation] ?? blocks["_fallback"]`), but `_fallback` in `life.ts` contains `{{igual}}` which is absent from GENDER_MAP — text renders raw marker to user if this path is hit |
| 4   | The photo is not present in any database record, log line, or response after processing                        | VERIFIED | `photo_base64` is passed only to `analyzeHand()`; `prisma.reading.create` stores only `attributes` and `report`; no photo field in Prisma schema; all logger calls verified by static test                       |

**Score:** 3/4 truths verified

### Required Artifacts

| Artifact                                         | Expected                                       | Status   | Details                                                                                                               |
| ------------------------------------------------ | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/server/lib/openai.ts`                       | GPT-4o wrapper with Structured Outputs + Zod   | VERIFIED | json_schema strict:true, model pinned to gpt-4o-2024-08-06, Zod safeParse                                             |
| `src/server/lib/__tests__/openai.test.ts`        | Unit tests for analyzeHand — AI-01 to AI-04    | VERIFIED | 11 tests, all passing                                                                                                 |
| `src/data/blocks/heart.ts`                       | HEART_BLOCKS with \_fallback entry             | VERIFIED | \_fallback present at line 160; type widened to `HeartVariation \| "_fallback"`                                       |
| `src/data/blocks/head.ts`                        | HEAD_BLOCKS with \_fallback entry              | VERIFIED | \_fallback present at line 158; type widened                                                                          |
| `src/data/blocks/life.ts`                        | LIFE_BLOCKS with \_fallback entry              | STUB     | \_fallback present at line 164; but body_past.content uses `{{igual}}` marker not in GENDER_MAP — renders raw to user |
| `src/data/blocks/fate.ts`                        | FATE_BLOCKS with \_fallback entry              | VERIFIED | \_fallback present at line 124; type widened                                                                          |
| `src/server/lib/select-blocks.ts`                | Hardened buildLineSection with fallback lookup | VERIFIED | `blocks[variation] ?? blocks["_fallback"]` at line 311; logger.warn at line 309                                       |
| `src/server/lib/__tests__/select-blocks.test.ts` | Unit tests for selectBlocks fallback — AI-02   | VERIFIED | 5 tests, all passing                                                                                                  |
| `src/app/api/reading/capture/route.ts`           | API route wiring analyzeHand + selectBlocks    | VERIFIED | Low-confidence gating before selectBlocks; photo not stored in DB or response                                         |

### Key Link Verification

| From                             | To                           | Via                                        | Status   | Details                                                                      |
| -------------------------------- | ---------------------------- | ------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `analyzeHand()`                  | `https://api.openai.com/...` | fetch with json_schema response_format     | VERIFIED | Line 299 in openai.ts; response_format.type = "json_schema"                  |
| `HandAttributesSchema.safeParse` | `HandAttributes` type        | Zod parse of choice.content                | VERIFIED | Line 356 in openai.ts; throws "Invalid hand attributes" on failure           |
| `buildLineSection`               | `blocks["_fallback"]`        | `blocks[variation] ?? blocks["_fallback"]` | VERIFIED | Line 311 in select-blocks.ts                                                 |
| `capture/route.ts` confidence    | `selectBlocks` call          | early return before line 54                | VERIFIED | confidence < 0.3 returns 422 at line 44; selectBlocks on line 54             |
| `prisma.reading.create`          | no photo field               | attributes + report only                   | VERIFIED | Prisma schema has no photo/image column; route stores only parsed attributes |

### Data-Flow Trace (Level 4)

| Artifact                     | Data Variable         | Source                           | Produces Real Data                           | Status      |
| ---------------------------- | --------------------- | -------------------------------- | -------------------------------------------- | ----------- |
| `capture/route.ts`           | `attributes`          | `analyzeHand(data.photo_base64)` | Yes (GPT-4o API)                             | VERIFIED    |
| `capture/route.ts`           | `report`              | `selectBlocks(attributes, ...)`  | Yes (block maps)                             | VERIFIED    |
| `capture/route.ts`           | `reading`             | `prisma.reading.create({...})`   | Yes (DB write)                               | VERIFIED    |
| `select-blocks.ts _fallback` | `lineBlock.body_past` | `LIFE_BLOCKS["_fallback"]`       | PARTIAL — `{{igual}}` marker not substituted | HOLLOW_PROP |

### Behavioral Spot-Checks

| Behavior                              | Command                                                                | Result   | Status |
| ------------------------------------- | ---------------------------------------------------------------------- | -------- | ------ |
| openai.test.ts — 11 tests pass        | `npm run test -- --run src/server/lib/__tests__/openai.test.ts`        | 11/11    | PASS   |
| select-blocks.test.ts — 5 tests pass  | `npm run test -- --run src/server/lib/__tests__/select-blocks.test.ts` | 5/5      | PASS   |
| Full test suite                       | `npm run test -- --run`                                                | 1 failed | FAIL   |
| TypeScript — no errors in phase files | `npm run type-check`                                                   | Clean    | PASS   |

The full test suite failure is in `src/data/blocks/__tests__/blocks-integrity.test.ts` — specifically the `{{igual}}` marker introduced in this phase's `life.ts _fallback` block.

### Requirements Coverage

| Requirement | Source Plan         | Description                                                                         | Status    | Evidence                                                                                                                                      |
| ----------- | ------------------- | ----------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-01       | 03-01               | GPT-4o wrapper uses json_schema Structured Outputs with strict:true, model pinned   | SATISFIED | openai.ts lines 322-329; tests verify json_schema type, strict:true, gpt-4o-2024-08-06                                                        |
| AI-02       | 03-01, 03-02, 03-03 | Zod validates GPT-4o response; unknown variation uses \_fallback block              | PARTIAL   | Zod validation complete; fallback wiring correct; but `{{igual}}` in life \_fallback causes broken substitution                               |
| AI-03       | 03-01               | Photo is not stored in any database record or response                              | SATISFIED | No photo field in Prisma schema; capture route only passes photo to analyzeHand(); static test verifies no logger call contains photo         |
| AI-04       | 03-01               | Logs contain only element and confidence on success; no photoBase64 in any log path | SATISFIED | logger.info receives {element, confidence} only (line 365 openai.ts); logger.error receives {status} only (line 335); tests verify both paths |

### Anti-Patterns Found

| File                      | Line | Pattern                              | Severity | Impact                                                                                                        |
| ------------------------- | ---- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| `src/data/blocks/life.ts` | 172  | `{{igual}}` marker not in GENDER_MAP | Blocker  | If \_fallback path is triggered for an unknown life variation, user sees literal `{{igual}}` in rendered text |

### Human Verification Required

No items require human verification. All success criteria are programmatically verifiable.

### Gaps Summary

One gap blocking full goal achievement:

**Truth 3 (partial):** The fallback block mechanism is correctly wired — `buildLineSection` uses `blocks[variation] ?? blocks["_fallback"]` and logs a warn. However, the `_fallback` block in `src/data/blocks/life.ts` contains the text marker `{{igual}}` in `body_past.content` (and one alt variant). This marker is absent from both `female` and `male` entries of `GENDER_MAP`. At runtime, `replaceGender()` iterates the map entries and skips unknown keys, leaving `{{igual}}` as a visible literal string in the rendered output.

This means the goal "the pipeline never crashes on unexpected GPT-4o output" is met (no throw), but the fallback output is defective — a user reaching the life `_fallback` path would see broken text.

**Fix:** Add `"{{igual}}"` to both `female` and `male` maps in `src/data/blocks/gender-map.ts`:

- `female`: `"{{igual}}": "igual"`
- `male`: `"{{igual}}": "igual"`

(The word "igual" has no gender inflection in Portuguese, so both maps get the same value.)

This was acknowledged as a known issue in `.planning/phases/03-ai-pipeline/deferred-items.md` but was not deferred correctly — it was introduced by Phase 03 Plan 02 work (commit `b140f5a`) and directly breaks a code path that Phase 03 is responsible for delivering.

---

_Verified: 2026-04-11T02:10:12Z_
_Verifier: Claude (gsd-verifier)_

---
phase: 16-gpt4o-schema-image-quality
plan: "01"
subsystem: openai-integration
tags: [gpt4o, element-classification, schema, types]
dependency_graph:
  requires: []
  provides: [HandType, HandElement, deriveElement, deriveSecondaryElement, HandAttributesSchema]
  affects: [capture/route.ts, select-blocks.ts, mocks/hand-attributes.ts]
tech_stack:
  added: []
  patterns: [neutral-type-codes, server-side-derivation, triple-schema-sync]
key_files:
  created: []
  modified:
    - src/types/hand-attributes.ts
    - src/server/lib/openai.ts
    - src/mocks/hand-attributes.ts
    - src/server/lib/__tests__/openai.test.ts
    - src/server/lib/__tests__/select-blocks.test.ts
    - src/app/api/reading/capture/route.test.ts
decisions:
  - "Neutral type codes A/B/C/D prevent GPT-4o from pattern-matching element names instead of analyzing geometry"
  - "element field kept in HandAttributes as derived field so rest of system (select-blocks, report) needs no changes"
  - "secondary_element is optional — only present when secondary_type != none and != primary"
  - "max_tokens increased 1500->2000 to accommodate type_reasoning chain-of-thought"
metrics:
  duration: "4 minutes"
  completed: "2026-04-18"
  tasks_completed: 2
  files_modified: 6
---

# Phase 16 Plan 01: Multi-indicator Element Classification Summary

GPT-4o element classification rewritten using neutral type codes A/B/C/D with geometric indicators, triple-schema sync (OpenAI JSON Schema / Zod / TypeScript), and server-side deriveElement().

## Tasks Completed

| Task | Name                                            | Commit  | Files                                    |
| ---- | ----------------------------------------------- | ------- | ---------------------------------------- |
| 1    | Atualizar HandAttributes type                   | 705ede3 | src/types/hand-attributes.ts             |
| 2    | Reescrever openai.ts com prompt multi-indicador | 705ede3 | src/server/lib/openai.ts + tests + mocks |

## What Was Built

- `HandType = "A" | "B" | "C" | "D"` and `HandElement = "fire" | "water" | "earth" | "air"` exported from `hand-attributes.ts`
- `HandAttributes` updated: `primary_type`, `secondary_type`, `type_reasoning` (from GPT-4o); `element` and `secondary_element?` (derived server-side)
- `PROMPT` rewritten in English with 4 structural types and visual indicator checklists — GPT-4o never sees element names
- `HAND_ATTRIBUTES_SCHEMA` (OpenAI JSON Schema): removed `element`, added `primary_type/secondary_type/type_reasoning`
- `HandAttributesSchema` (Zod): mirrored exactly — no `element` field
- `deriveElement(primaryType)`: A=earth, B=air, C=fire, D=water
- `deriveSecondaryElement(secondaryType, primaryType)`: returns HandElement or null
- `analyzeHand(photoBase64, dominantHand)`: removed `elementHint` param; injects derived fields after Zod parse; max_tokens 2000

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated mocks and tests to match new HandAttributes shape**

- **Found during:** Task 2 type-check
- **Issue:** `src/mocks/hand-attributes.ts`, `src/server/lib/__tests__/select-blocks.test.ts`, `src/app/api/reading/capture/route.test.ts` all had HandAttributes literals missing `primary_type`, `secondary_type`, `type_reasoning`
- **Fix:** Added required fields to all 4 mock entries and 2 test fixtures; updated openai.test.ts GPT mock response to use primary_type/secondary_type instead of element; replaced elementHint tests with test for 3-item user content array; fixed Zod rejection test to use primary_type
- **Files modified:** src/mocks/hand-attributes.ts, src/server/lib/**tests**/openai.test.ts, src/server/lib/**tests**/select-blocks.test.ts, src/app/api/reading/capture/route.test.ts
- **Commit:** 705ede3

## Expected Errors (Plan 02 Scope)

`src/app/api/reading/capture/route.ts(47,81): error TS2554: Expected 2 arguments, but got 3` — `analyzeHand` call still passes `element_hint` as third argument. This will be removed in plan 02 along with `element_hint` from the Zod schema of the capture route.

## Verification

```
npm run lint   — PASSED (0 warnings)
npm run type-check — PASSED (1 expected error in capture/route.ts, plan 02 scope)
npm run test --run — PASSED: 169/169 tests
```

### Success Criteria Check

1. HandAttributes has primary_type: HandType, secondary_type: HandType | "none", type_reasoning: string, secondary_element?: HandElement — PASSED
2. analyzeHand(photoBase64, dominantHand) — no third parameter — PASSED
3. deriveElement("A") === "earth", "B" === "air", "C" === "fire", "D" === "water" — PASSED (verified by test suite)
4. deriveSecondaryElement("none", "A") === null — PASSED
5. HAND_ATTRIBUTES_SCHEMA has no "element" field — PASSED
6. Zod HandAttributesSchema has primary_type/secondary_type/type_reasoning, no element — PASSED
7. npm run type-check passes ignoring capture/route.ts — PASSED

## Self-Check: PASSED

- src/types/hand-attributes.ts — FOUND
- src/server/lib/openai.ts — FOUND
- Commit 705ede3 — FOUND

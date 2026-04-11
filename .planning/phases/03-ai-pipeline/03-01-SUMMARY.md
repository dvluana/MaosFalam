---
phase: 03-ai-pipeline
plan: "01"
subsystem: api
tags: [openai, gpt-4o, structured-outputs, zod, validation, logging]

requires:
  - phase: 01-foundation
    provides: Pino logger with PII redact, TypeScript strict setup
  - phase: 02-auth
    provides: Auth helpers — not directly used here, but in same server/lib/ directory

provides:
  - "analyzeHand() with GPT-4o Structured Outputs (json_schema, strict:true)"
  - "HandAttributesSchema (Zod) exported for downstream tests and callers"
  - "HAND_ATTRIBUTES_SCHEMA (JSON Schema) with Record types expanded for strict mode"

affects:
  - 03-ai-pipeline/03-02 (reading capture API uses analyzeHand)
  - 03-ai-pipeline/03-03 (select-blocks fallback hardening)

tech-stack:
  added: []
  patterns:
    - "GPT-4o Structured Outputs: json_schema + strict:true with all Record types expanded as fixed properties"
    - "Zod safeParse as safety net after Structured Outputs response"
    - "Model pinning: gpt-4o-2024-08-06 (not floating gpt-4o alias)"
    - "Log discipline: logger receives only {element, confidence} on success, {status} on error — never photoBase64"
    - "TDD: test/RED commit -> feat/GREEN commit cycle"

key-files:
  created:
    - src/server/lib/__tests__/openai.test.ts
  modified:
    - src/server/lib/openai.ts

key-decisions:
  - "json_schema strict mode requires Record<K,V> types to be expanded as explicit fixed properties — additionalProperties with schema value is rejected by OpenAI API"
  - "Both Structured Outputs (API-level enforcement) and Zod (TypeScript narrowing + clear error path) are kept — they serve different purposes"
  - "gpt-4o-2024-08-06 pinned (not floating gpt-4o) to prevent silent behavior changes from OpenAI snapshot updates"
  - "text-before-image ordering in content array primes extraction per OpenAI vision docs"

patterns-established:
  - "Structured Outputs pattern: HAND_ATTRIBUTES_SCHEMA + HandAttributesSchema.safeParse() for two-layer enforcement"
  - "Log discipline pattern: no PII or sensitive data (including photoBase64) ever passed to logger"

requirements-completed: [AI-01, AI-02, AI-03, AI-04]

duration: 2min
completed: 2026-04-11
---

# Phase 03 Plan 01: Fix analyzeHand — Structured Outputs + Zod + Log Discipline Summary

**GPT-4o wrapper hardened with json_schema Structured Outputs (strict:true), Zod validation safety net, gpt-4o-2024-08-06 model pin, text-before-image ordering, and photoBase64 log discipline**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T02:01:24Z
- **Completed:** 2026-04-11T02:03:48Z
- **Tasks:** 1 (TDD: RED + GREEN commits)
- **Files modified:** 2

## Accomplishments

- Switched response_format from json_object to json_schema with strict:true — GPT-4o now enforces field types and enum values at the API level, not just at parse time
- Added HAND_ATTRIBUTES_SCHEMA with all Record types (mounts, rare_signs) expanded as explicit fixed properties — strict mode rejects additionalProperties with schema
- Added exported HandAttributesSchema (Zod) — TypeScript narrowing + clear error path after GPT-4o response
- Pinned model to gpt-4o-2024-08-06 (minimum version for Structured Outputs)
- Fixed content array ordering: text before image_url
- Added refusal check and empty content check
- 11 tests covering all four requirements (AI-01, AI-02, AI-03, AI-04)

## Task Commits

TDD task with RED + GREEN commits:

1. **RED — test(03-01): add failing tests for analyzeHand** - `d2ed22e`
2. **GREEN — feat(03-01): fix analyzeHand — Structured Outputs + Zod + log discipline** - `573b11a`

**Plan metadata:** _(docs commit follows)_

_Note: TDD tasks have test commit before implementation commit_

## Files Created/Modified

- `src/server/lib/openai.ts` - Rewritten with json_schema response_format, HAND_ATTRIBUTES_SCHEMA, HandAttributesSchema export, refusal/empty checks, Zod safeParse, log discipline
- `src/server/lib/__tests__/openai.test.ts` - 11 tests covering AI-01 through AI-04

## Decisions Made

- Kept both Structured Outputs and Zod: they serve different purposes (API-level enforcement vs TypeScript narrowing). Removing either weakens the guarantee.
- Expanded Record types manually in HAND_ATTRIBUTES_SCHEMA — zod-to-json-schema would add a dependency, one-time manual derivation is the right call for MVP.

## Deviations from Plan

**[Rule 1 - Bug] Fixed TypeScript error in test file (regex s flag on ES2017 target)**

- **Found during:** Task 1, verification phase
- **Issue:** Test used `/regex/gs` (dotAll flag requires ES2018+). TypeScript target is ES2017, causing TS error TS1501.
- **Fix:** Removed `s` flag from regex — not needed for single-line logger call matching.
- **Files modified:** `src/server/lib/__tests__/openai.test.ts`
- **Verification:** `npm run type-check` returns clean for openai files.
- **Committed in:** d2ed22e (included in RED commit via lint-staged)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug, TypeScript target incompatibility in test file)
**Impact on plan:** Minimal — single character fix in test, no scope change.

## Issues Encountered

None beyond the auto-fixed regex flag.

## User Setup Required

None - no external service configuration required. OPENAI_API_KEY must be present in .env.local for runtime use (pre-existing requirement, not new).

## Known Stubs

None — this plan only modifies the server-side wrapper. No UI components, no data rendering paths.

## Next Phase Readiness

- analyzeHand() is production-ready: Structured Outputs enforced, Zod validated, log-safe
- HandAttributesSchema exported and available for 03-02 (reading capture API) to use directly
- select-blocks fallback hardening (Pitfall 3) deferred to 03-03 per plan structure

---

_Phase: 03-ai-pipeline_
_Completed: 2026-04-11_

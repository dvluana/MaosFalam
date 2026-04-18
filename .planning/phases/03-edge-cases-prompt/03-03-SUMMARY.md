---
phase: "03"
plan: "03"
subsystem: backend/ai
tags: [openai, prompt-engineering, dominant-hand, accessories]
dependency_graph:
  requires: []
  provides: [PROMPT-01, PROMPT-02]
  affects:
    [src/server/lib/openai.ts, src/app/api/reading/capture/route.ts, src/lib/reading-client.ts]
tech_stack:
  added: []
  patterns: [dynamic-user-turn-context, zod-default-retrocompat]
key_files:
  created: []
  modified:
    - src/server/lib/openai.ts
    - src/app/api/reading/capture/route.ts
    - src/lib/reading-client.ts
    - src/server/lib/__tests__/openai.test.ts
decisions:
  - "dominanceContext injected as first text block in user message, not system prompt, to keep system prompt static for OpenAI prompt caching"
  - "dominant_hand uses Zod .default(right) for backward compatibility with existing clients"
metrics:
  duration: "5m"
  completed: "2026-04-11"
  tasks: 2
  files: 4
---

# Phase 03 Plan 03: Dominant Hand and Accessory Exclusion in GPT-4o Prompt Summary

GPT-4o analyzeHand now receives dominant hand context and instructs the model to ignore tattoos, henna, nail art, rings, and accessories — improving line detection accuracy.

## Tasks Completed

| #   | Name                                          | Commit  | Files                                                                                                    |
| --- | --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Atualizar analyzeHand e PROMPT em openai.ts   | 459974a | src/server/lib/openai.ts                                                                                 |
| 2   | Atualizar rota de captura e adapter front-end | 5fbfc6f | src/app/api/reading/capture/route.ts, src/lib/reading-client.ts, src/server/lib/**tests**/openai.test.ts |

## What Was Built

`analyzeHand(photoBase64, dominantHand)` now requires a second parameter indicating which hand is being analyzed. A `dominanceContext` string is injected as the first text block in the GPT-4o user message (before the image), instructing the model to:

1. Use the correct palm orientation for the dominant hand (direita/esquerda)
2. Ignore tattoos, henna, nail art, rings, bracelets, and any accessories
3. Analyze only natural palm lines, mounts, and chirological signs

The system prompt stays static (enabling OpenAI prompt caching). The dynamic context goes in the user turn.

The capture API route's Zod schema now accepts `dominant_hand: "right" | "left"` with `.default("right")` for backward compatibility. The `captureReading` adapter in `reading-client.ts` accepts `dominant_hand` as an optional field.

## Decisions Made

- **Dynamic context in user turn, not system prompt:** System prompt stays cacheable by OpenAI. Per-request data (hand orientation) goes in the user message as a text block before the image.
- **`dominant_hand` defaults to `"right"`:** Zod `.default("right")` ensures existing clients (camera flow without yet sending this field) continue to work without breaking changes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated test assertions for 3-item content array**

- **Found during:** Task 2
- **Issue:** Test `AI-01: content array has text before image_url` asserted `userContent[1].type === "image_url"` but the content array now has 3 items (dominanceContext text, "Analise esta palma." text, image_url).
- **Fix:** Updated assertion to check `userContent[2].type === "image_url"` and added assertion for `userContent[1].type === "text"`.
- **Files modified:** src/server/lib/**tests**/openai.test.ts
- **Commit:** 5fbfc6f

### Out-of-Scope Issues (Deferred)

Pre-existing errors in `src/hooks/useUploadValidation.ts` from a prior plan commit were found and documented in `deferred-items.md`. Not caused by this plan. See `.planning/phases/03-edge-cases-prompt/deferred-items.md`.

## Known Stubs

None. `dominant_hand` flows through the full stack: client adapter -> route -> analyzeHand -> GPT-4o user message.

## Self-Check: PASSED

- [x] src/server/lib/openai.ts modified — analyzeHand signature updated
- [x] src/app/api/reading/capture/route.ts modified — schema + call updated
- [x] src/lib/reading-client.ts modified — captureReading type updated
- [x] src/server/lib/**tests**/openai.test.ts modified — all calls pass "right" as second arg
- [x] Commits 459974a and 5fbfc6f exist
- [x] No TypeScript errors in modified files
- [x] No ESLint errors in modified files

---
phase: quick
plan: 260417-ryl
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/api/reading/capture/route.ts
  - src/server/lib/openai.ts
  - src/lib/mediapipe.ts
autonomous: true
requirements: [ELEMENT-CONSISTENCY]

must_haves:
  truths:
    - "Camera-path readings always use MediaPipe element (deterministic)"
    - "Upload-path readings fall back to GPT-4o element (no MediaPipe available)"
    - "Stored attributes JSONB reflects the final element used in the report"
    - "GPT-4o prompt no longer instructs element classification for camera path"
  artifacts:
    - path: "src/app/api/reading/capture/route.ts"
      provides: "Element override logic before selectBlocks"
      contains: "finalAttributes"
    - path: "src/server/lib/openai.ts"
      provides: "Cleaned GPT-4o prompt without element classification rule"
    - path: "src/lib/mediapipe.ts"
      provides: "Updated JSDoc marking computeElementHint as authoritative"
  key_links:
    - from: "src/app/api/reading/capture/route.ts"
      to: "src/server/lib/select-blocks.ts"
      via: "finalAttributes passed to selectBlocks()"
      pattern: "selectBlocks\\(finalAttributes"
    - from: "src/app/api/reading/capture/route.ts"
      to: "prisma.reading.create"
      via: "finalAttributes stored as JSONB"
      pattern: "attributes.*finalAttributes"
---

<objective>
Make MediaPipe computeElementHint the authoritative source for element classification on the camera path. Override GPT-4o's element output with element_hint in the capture route when present. Keep GPT-4o as fallback for the upload path (no MediaPipe).

Purpose: GPT-4o vision is non-deterministic for geometric proportion estimation -- the same hand photo returned fire, air, and water across three calls. MediaPipe landmarks compute element deterministically from precise geometric ratios.

Output: Consistent element classification for camera-path readings. Upload-path unchanged.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260417-ryl-mediapipe-authoritative-element-classifi/260417-ryl-RESEARCH.md
@.planning/debug/element-inconsistency.md
@src/app/api/reading/capture/route.ts
@src/server/lib/openai.ts
@src/lib/mediapipe.ts

<interfaces>
From src/types/hand-attributes.ts:
```typescript
export interface HandAttributes {
  element: "fire" | "water" | "earth" | "air";
  heart: { variation: string; modifiers: string[] };
  head: { variation: string; modifiers: string[] };
  life: { variation: string };
  fate: { variation: string };
  venus: { mount: string; cinturao: boolean };
  mounts: Record<string, string>;
  rare_signs: Record<string, boolean>;
  confidence: number;
}
```

From src/server/lib/select-blocks.ts line 183:

```typescript
const el = attributes.element; // first line of selectBlocks — must receive overridden value
```

From src/lib/mediapipe.ts:

```typescript
export function computeElementHint(landmarks: NormalizedLandmark[]): HandElement | undefined;
// Returns "fire" | "water" | "earth" | "air" | undefined
```

</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Override element in capture route + clean GPT-4o prompt</name>
  <files>src/app/api/reading/capture/route.ts, src/server/lib/openai.ts, src/lib/mediapipe.ts</files>
  <action>
    **In `src/app/api/reading/capture/route.ts`:**

    After line 47 (`const attributes = await analyzeHand(...)`), add the element override:

    ```typescript
    // MediaPipe element is authoritative for camera path (deterministic geometric ratios).
    // Upload path has no MediaPipe — GPT-4o remains the fallback.
    const finalAttributes = data.element_hint
      ? { ...attributes, element: data.element_hint }
      : attributes;
    ```

    Then replace ALL subsequent references to `attributes` with `finalAttributes`:
    - Line 50: `finalAttributes.confidence` (confidence check)
    - Line 62: `selectBlocks(finalAttributes, ...)` (report generation)
    - Line 84: `attributes: JSON.parse(JSON.stringify(finalAttributes))` (DB storage)
    - Line 88: `confidence: finalAttributes.confidence` (DB storage)
    - Line 95: `element: finalAttributes.element` (logger)
    - Line 96: `confidence: finalAttributes.confidence` (logger)

    Add a log line right after the override to make the override visible:
    ```typescript
    if (data.element_hint) {
      logger.info(
        { gptElement: attributes.element, mediapiElement: data.element_hint },
        "Element overridden by MediaPipe",
      );
    }
    ```

    **In `src/server/lib/openai.ts`:**

    1. Remove the element classification rule from the PROMPT string (line 58):
       Delete: `- element: determine pela proporcao palma/dedos (quadrada+curtos=terra, quadrada+longos=ar, longa+curtos=fogo, longa+longos=agua)`

    2. Change the elementHintText (lines 306-308) from advisory to informational:
       ```typescript
       const elementHintText = elementHint
         ? `Elemento da mao ja determinado por landmarks: ${elementHint}. Nao precisa classificar elemento — foque nas linhas, montes e sinais.`
         : null;
       ```

    The `element` field stays in the JSON schema (GPT-4o must still return it for upload-path fallback), but the prompt no longer instructs GPT-4o how to classify it. GPT-4o will still return a value (required by schema), but for camera path it gets overridden anyway.

    **In `src/lib/mediapipe.ts`:**

    Update the JSDoc on `computeElementHint` (lines 118-122) to reflect the new role:
    ```typescript
    /**
     * Computes hand element type from MediaPipe normalized landmarks.
     * Uses palm aspect ratio (palmHeight/palmWidth) and finger-to-palm length ratio.
     * Returns undefined if landmarks are insufficient or geometry is degenerate.
     *
     * AUTHORITATIVE source for element classification on the camera path.
     * GPT-4o element is only used as fallback for the upload path (no MediaPipe).
     */
    ```

  </action>
  <verify>
    <automated>cd "/Users/luana/Documents/Code Projects/Paritech projs/MaosFalam" && npm run type-check && npm run build</automated>
  </verify>
  <done>
    - capture route uses finalAttributes everywhere after override
    - element_hint present: MediaPipe element used, GPT-4o element logged but discarded
    - element_hint absent (upload): GPT-4o element used as before
    - GPT-4o prompt no longer contains element classification rule
    - mediapipe.ts JSDoc reflects authoritative status
    - Build passes with no type errors
  </done>
</task>

</tasks>

<verification>
1. `npm run type-check` passes — no type errors from spread override
2. `npm run build` passes — no build errors
3. `npm run lint` passes — no lint violations
4. Manual: grep capture route for any remaining bare `attributes` references (should all be `finalAttributes` after the override line, except the initial `const attributes = await analyzeHand(...)`)
</verification>

<success_criteria>

- Camera-path readings use MediaPipe element deterministically
- Upload-path readings fall back to GPT-4o element (unchanged behavior)
- Stored JSONB attributes reflect the final element used
- Logger shows override when it happens (gptElement vs mediapiElement)
- GPT-4o prompt is cleaner (no element classification instruction)
- All checks pass: type-check, build, lint
  </success_criteria>

<output>
After completion, create `.planning/quick/260417-ryl-mediapipe-authoritative-element-classifi/260417-ryl-SUMMARY.md`
</output>

# Phase 5: Pipeline Refactor - Research

**Researched:** 2026-04-11
**Domain:** Next.js App Router page-to-page state transfer, async coordination, MediaPipe geometry
**Confidence:** HIGH

## Summary

This phase fixes three independent problems introduced by the camera/scan pipeline architecture: (1) using sessionStorage as an IPC channel for a ~1-2 MB base64 photo string, (2) a race condition where the scan page navigates to revelacao after 8 seconds regardless of whether the API has resolved, and (3) a missed opportunity to send MediaPipe-computed element hint to GPT-4o.

All three problems are self-contained in the existing code. No new libraries are needed. The primary risk is the state coordination refactor — it changes the sequencing logic in `scan/page.tsx`, which has a single effect that owns both the progress timer and navigation. The pattern chosen to pass the photo (module-level store) must survive Next.js hot module replacement in dev and work correctly under strict Next.js App Router lifecycle constraints.

**Primary recommendation:** Use a typed module-level singleton in `src/lib/photo-store.ts` to transfer the photo between pages; replace the independent timers in scan with a `Promise.all` gate that waits for both the animation floor AND the API promise before navigating.

## Project Constraints (from CLAUDE.md)

- TypeScript strict. No `any`.
- `no-console: error` in ESLint.
- Components: functions + `export default`.
- Tailwind for styles. CSS custom only for canvas/particles.
- Front with mocks first. `useMock()` hook for mock-to-real transition.
- Logica de dados (fetch, transformacao) fica em hooks, nao em componentes.
- Tipos compartilhados em `/src/types/`. Tipos locais no topo do arquivo.
- Naming: hooks `useCamelCase.ts`, libs `kebab-case`, types `PascalCase`.
- `@/` imports always; never relative for src files.
- Import `type` for type-only imports.
- `npm run build` to verify on completion.
- Security: foto nunca armazenada, CPF nunca logado, dados pessoais nunca nos logs.

---

## Problem 1: sessionStorage for Photo (1-2 MB base64)

### What is happening today

`camera/page.tsx` line 97:

```typescript
sessionStorage.setItem("maosfalam_photo", photoBase64);
router.push("/ler/scan");
```

`scan/page.tsx` line 56:

```typescript
const photo = sessionStorage.getItem("maosfalam_photo") ?? "";
```

The same pattern appears in two more places in camera/page.tsx:

- `handleUploadConfirm` (line 138)
- `handleUploadSelectedFromError` (line 183)

### Why this is fragile

sessionStorage has a 5 MB total limit (per tab, not per key). A 1920x1440 JPEG at quality 0.92 encodes to approximately 400-800 KB base64. Under current compression (max 1280px, JPEG 0.85 from Phase 3 EDGE-03), the photo should be well under 200 KB. However:

1. **Stale data risk**: if the user navigates back and retries, the old photo remains until `camera/page.tsx` line 67 clears it on mount. There is a window where a retry could read the wrong photo.
2. **Hard to type**: sessionStorage always returns string. The data is structurally typed but stored untyped.
3. **Two-step decode**: the upload path strips `data:image/jpeg;base64,` prefix manually (line 137, 182) before storing. Any inconsistency here silently sends empty base64.

### Best pattern: module-level singleton (PhotoStore)

In Next.js App Router, each page is a separate React tree but all pages in the same tab share the same JavaScript module namespace (for client-side navigation). A module-level variable survives `router.push()` navigation within the same tab because Next.js does client-side routing — the old page unmounts but the module is not re-evaluated.

**Confidence:** HIGH. This is standard Next.js App Router behavior. Verified by inspecting how Next.js handles soft navigation: it does not reload JS modules on client-side route transitions.

```typescript
// src/lib/photo-store.ts
let _photo: string | null = null;

export function setPhoto(base64: string): void {
  _photo = base64;
}

export function getPhoto(): string {
  return _photo ?? "";
}

export function clearPhoto(): void {
  _photo = null;
}
```

**Tradeoffs vs alternatives:**

| Approach                       | Survives router.push?   | Type-safe? | Size limit? | Survives page reload? |
| ------------------------------ | ----------------------- | ---------- | ----------- | --------------------- |
| sessionStorage                 | Yes                     | No         | 5 MB total  | Yes                   |
| Module singleton               | Yes (soft nav only)     | Yes        | RAM only    | No                    |
| React Context                  | No (unmounts)           | Yes        | RAM only    | No                    |
| URL param                      | No (too large)          | No         | URL limit   | No                    |
| Blob URL (URL.createObjectURL) | No (revoked on unmount) | No         | RAM only    | No                    |

Module singleton is the correct pattern here. The photo only needs to live for the duration of a single reading attempt — from capture to API response. It does not need to survive page reload (if the user reloads on /ler/scan, there is no photo anyway).

**The sessionStorage guard in camera/page.tsx (line 62-68) can then be simplified:** instead of `removeItem("maosfalam_photo")`, call `clearPhoto()` from the module store. The guard stays — it protects against missing name context.

### Where to update

1. `src/lib/photo-store.ts` — new file
2. `src/app/ler/camera/page.tsx` — `handleCaptured`, `handleUploadConfirm`, `handleUploadSelectedFromError`
3. `src/app/ler/scan/page.tsx` — replace `sessionStorage.getItem("maosfalam_photo")`

---

## Problem 2: Race Condition in Scan Page

### What is happening today

The scan page has two independent async operations:

**Timer (progress animation):** `useEffect` at line 101-124. Starts an 80ms interval that increments progress. When progress reaches 100% (after 8 seconds), it calls `router.push("/ler/revelacao")`. This is unconditional — it navigates regardless of API state.

**API call:** `useEffect` at line 50-91. Calls `captureReading(...)`, then on success stores `reading_id` and `impact_phrase` in sessionStorage. There is no coordination with the timer.

**Race condition:** If GPT-4o takes more than 8 seconds (it can take up to 15 seconds per `maxDuration: 30` on the route), the timer navigates to revelacao before `maosfalam_reading_id` is set. Then `revelacao/page.tsx` line 64-68 finds no reading_id and redirects to `/ler/nome` — killing the reading silently.

Additionally, if the API takes less than 8 seconds (e.g., 4 seconds), the user waits a dead 4 more seconds watching the animation finish.

### Correct pattern: Promise.all gate with floor

Both conditions must be true before navigating:

1. Animation has run for at least N seconds (minimum ritual duration — brand experience)
2. API has resolved (either success or error)

The approach is to store the API promise in a ref, store the animation completion in state, and navigate only when both are done.

```typescript
// Pseudocode — the planner will fill exact implementation
const apiPromiseRef = useRef<Promise<ApiResult> | null>(null);
const [animDone, setAnimDone] = useState(false);
const [apiResult, setApiResult] = useState<ApiResult | null>(null);

// Effect 1: start API call, store promise, handle result
useEffect(() => {
  if (didCapture.current) return;
  didCapture.current = true;
  const promise = captureReading({...})
    .then(result => { setApiResult({ ok: true, ...result }); })
    .catch(err => { setApiResult({ ok: false, err }); });
  apiPromiseRef.current = promise;
}, []);

// Effect 2: animation timer — sets animDone when 8s elapses
useEffect(() => {
  const tick = setInterval(() => {
    // increment progress...
    if (progress >= 100) { setAnimDone(true); clearInterval(tick); }
  }, 80);
  return () => clearInterval(tick);
}, []);

// Effect 3: gate — navigate only when both done
useEffect(() => {
  if (!animDone || !apiResult) return;
  if (!apiResult.ok) { /* navigate to error */ return; }
  sessionStorage.setItem("maosfalam_reading_id", apiResult.reading_id);
  sessionStorage.setItem("maosfalam_impact_phrase", ...);
  router.push("/ler/revelacao");
}, [animDone, apiResult]);
```

**scan_slow state:** The existing `scan_slow` phrase already handles the "API taking longer" UX. The progress bar should pause at 98% or continue looping (ticks > 100% are clamped) while waiting for the API. The simplest approach: let the timer cap at 99% (not 100%) until `apiResult` is set, then snap to 100% and navigate.

**Confidence:** HIGH. This is standard Promise coordination. The pattern is identical to "show loading for at least N seconds" patterns used in apps to prevent loading flash (sometimes called "minimum loading duration").

### scan_slow trigger timing

Currently scan_slow changes phrase behavior. With the new pattern:

- After 8 seconds (animDone fires but apiResult is null): switch to `scan_slow` state to show "Suas linhas sao complexas" phrase
- The progress bar stays at 99% until the API resolves

---

## Problem 3: MediaPipe Element Pre-hint for GPT-4o

### Available landmark data

In `useCameraPipeline.ts`, the detection loop has access to `result.landmarks[0]` — an array of 21 `NormalizedLandmark` with `{x, y, z}` in `[0,1]` normalized coordinates.

Currently `captureFrame()` is called at line 319 with only `(video, canvas, mirrored)`. The landmark data is not passed forward.

### Element detection math

From `docs/palmistry.md` and `docs/architecture.md`:

| Element | Palm                  | Fingers                          |
| ------- | --------------------- | -------------------------------- |
| Fire    | Square palm           | Short fingers (<75% palm height) |
| Water   | Long/rectangular palm | Long fingers                     |
| Earth   | Square, wide palm     | Short, thick fingers             |
| Air     | Square palm           | Long fingers, knuckles visible   |

**Landmark indices available:**

- `WRIST` = landmark[0]
- `INDEX_MCP` = landmark[5]
- `MIDDLE_MCP` = landmark[9]
- `PINKY_MCP` = landmark[17]
- `MIDDLE_TIP` = landmark[12]

**Ratio calculations (all normalized coordinates):**

```typescript
// Palm width: distance from INDEX_MCP to PINKY_MCP (horizontal spread)
const palmWidth = dist(landmarks[5], landmarks[17]);

// Palm height: distance from WRIST to MIDDLE_MCP (base to knuckle)
const palmHeight = dist(landmarks[0], landmarks[9]);

// Finger length: distance from MIDDLE_MCP to MIDDLE_TIP
const fingerLength = dist(landmarks[9], landmarks[12]);

// Aspect ratio: > 1.1 = long/rectangular, < 0.95 = square
const palmAspect = palmHeight / palmWidth;

// Finger ratio: > 1.0 = long, < 0.85 = short (relative to palm height)
const fingerRatio = fingerLength / palmHeight;
```

**Element mapping:**

```typescript
function detectElementFromLandmarks(
  landmarks: NormalizedLandmark[],
): "fire" | "water" | "earth" | "air" {
  const palmAspect = palmHeight / palmWidth;
  const fingerRatio = fingerLength / palmHeight;
  const isLongPalm = palmAspect > 1.1;
  const isLongFingers = fingerRatio > 0.95;

  if (!isLongPalm && isLongFingers) return "air"; // square + long
  if (!isLongPalm && !isLongFingers) return "earth"; // square + short
  if (isLongPalm && !isLongFingers) return "fire"; // long + short
  return "water"; // long + long
}
```

**Confidence of this detection:** MEDIUM. The landmark ratios are a geometric approximation of what the full palmistry classification considers (palm vs finger proportions). The actual palmistry also considers palm width and finger thickness, which landmarks don't capture well. This is explicitly why the architecture docs say: "Esse calculo de elemento pode ser feito no client (rapido, gratis) e enviado junto com a foto como pre-hint pro GPT-4o. O GPT-4o confirma ou corrige."

### How to inject the pre-hint

The `analyzeHand` function in `src/server/lib/openai.ts` already accepts `dominantHand` as a second parameter. The pattern established in Phase 3 was to inject dynamic context into the `user` message (not system prompt) to preserve OpenAI caching.

The pre-hint should follow the same pattern — add an optional `elementHint` parameter:

```typescript
export async function analyzeHand(
  photoBase64: string,
  dominantHand: "right" | "left",
  elementHint?: "fire" | "water" | "earth" | "air", // new
): Promise<HandAttributes>;
```

In the user message content array, add the hint as a text item before the image:

```typescript
const hintText = elementHint
  ? `Pre-analise geometrica dos landmarks da mao indica elemento: ${elementHint}. Confirme ou corrija com base na foto.`
  : null;

content: [
  { type: "text", text: dominanceContext },
  ...(hintText ? [{ type: "text", text: hintText }] : []),
  { type: "text", text: "Analise esta palma." },
  { type: "image_url", ... },
]
```

**The Zod schema for the API route** (`capture/route.ts`) must also accept the optional `element_hint` field.

### Upload flow

The upload flow does NOT have landmark data (MediaPipe runs in IMAGE mode for validation but landmark positions are not currently forwarded). For upload, `elementHint` should be `undefined` — GPT-4o determines element from the image alone. This is the correct behavior already.

### The camera flow

In `useCameraPipeline.ts`, when capture fires (line 319), the last known landmarks are in `result.landmarks[0]` from the detection loop. These must be captured at the same frame as the photo. The `onCaptured` callback currently only receives `(photoBase64: string)`. It should be extended to also receive the element hint.

**Pattern:** compute element hint from the stable-frame landmarks, pass it alongside base64 via a modified callback or a separate store entry.

---

## Problem 4: JPEG Quality Reduction 0.92 → 0.82

### Current state

`src/lib/mediapipe.ts` line 129:

```typescript
const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
```

### Impact analysis

JPEG quality 0.92 produces a near-lossless image. Quality 0.82 introduces light quantization artifacts. At the expected image size (max 1280px from EDGE-03 compression), the difference is:

- Q0.92: approximately 150-300 KB base64
- Q0.82: approximately 80-180 KB base64
- Savings: approximately 40% reduction in payload size

**GPT-4o vision analysis:** GPT-4o with `detail: "high"` uses up to 768x768 tiles. Palm lines and mounts are visible at quality 0.82. At quality 0.7 compression artifacts become significant; 0.82 is a safe floor.

**Confidence:** MEDIUM (based on general JPEG quality knowledge + GPT-4o tile size from OpenAI docs). The risk is negligible because EDGE-03 already compresses to max 1280px JPEG 0.85, so the capture quality (0.82 vs 0.92) is only relevant for the live camera path, not the upload path.

**Recommendation:** Change `captureFrame` to accept quality as a parameter with default 0.82.

---

## Architecture Patterns

### Module-level singleton pattern (Next.js App Router)

```
src/lib/photo-store.ts    # new: typed singleton for ephemeral photo
src/lib/reading-client.ts # unchanged: captureReading() stays the same
src/app/ler/camera/page.tsx  # update: 3 places use photoStore instead of sessionStorage
src/app/ler/scan/page.tsx    # update: read from photoStore; fix race condition
src/lib/mediapipe.ts         # update: captureFrame quality param + computeElementHint export
src/hooks/useCameraPipeline.ts # update: pass elementHint to onCaptured
src/server/lib/openai.ts     # update: accept optional elementHint, inject in user message
src/app/api/reading/capture/route.ts # update: accept element_hint in schema
```

### Async gate pattern for scan page

The key insight: use **three** separate effects, not two, in scan/page.tsx:

1. **API effect** — fires once, handles resolve/reject, sets `apiResult` state
2. **Timer effect** — fires once, drives progress bar, sets `animDone` at 100%
3. **Gate effect** — depends on `[animDone, apiResult]`, navigates when both are truthy

This separation is clean, each effect has one responsibility, and the timer never calls `router.push` directly.

### Anti-Patterns to Avoid

- **Passing base64 via URL params**: photo is 100-800 KB. URL has a 2 KB practical limit in most browsers.
- **React Context for photo**: Context unmounts with the page. The scan page is a different React tree from camera.
- **Blob URL across pages**: `URL.createObjectURL` returns an object URL tied to the document. On Next.js soft navigation, the old page unmounts and the URL may be revoked.
- **Awaiting inside the timer interval**: `setInterval` callbacks are synchronous. Putting `await` inside them breaks the mental model and the linting rules.

---

## Don't Hand-Roll

| Problem                  | Don't Build            | Use Instead                               | Why                                       |
| ------------------------ | ---------------------- | ----------------------------------------- | ----------------------------------------- |
| Minimum loading duration | Custom promise race    | `Promise.all([apiPromise, animPromise])`  | Standard JS, no library needed            |
| Element from geometry    | ML model               | Simple ratio math from existing landmarks | Architecture doc prescribes this approach |
| Photo serialization      | Custom binary protocol | Module singleton (string)                 | Photo is already base64 from captureFrame |

---

## Common Pitfalls

### Pitfall 1: Module singleton not cleared between readings

**What goes wrong:** User does a reading, goes back to /ler/nome, starts a second reading. Camera captures new photo, stores it. But if the old photo was never cleared, it could still be in the store if navigation was interrupted.

**How to avoid:** `camera/page.tsx` already clears `maosfalam_photo` from sessionStorage on mount (line 67). The same `clearPhoto()` call should happen there. Scan page should also call `clearPhoto()` immediately after reading the photo (to free memory — base64 strings of this size are significant).

### Pitfall 2: Race condition in the gate effect fires before state updates settle

**What goes wrong:** React batches state updates. If `setApiResult` and `setAnimDone` are called in quick succession (e.g., API resolves just as animation timer fires), the gate effect might run twice.

**How to avoid:** The gate effect has a `return` guard at the top: `if (!animDone || !apiResult) return;`. Running twice is harmless — the second run finds `router.push` already called. Use `didNavigate` ref to prevent double navigation.

### Pitfall 3: onCaptured callback type change breaks useCameraPipeline contract

**What goes wrong:** `onCaptured: (photoBase64: string) => void` is the current type. Changing it to also carry the element hint requires updating the signature everywhere it's typed and called.

**How to avoid:** Two options:

- Option A: `onCaptured: (photoBase64: string, elementHint?: HandElement) => void` — explicit second parameter
- Option B: `photoStore.setElementHint(hint)` in the hook, then camera page reads both from the store

Option B is cleaner — it keeps `onCaptured` unchanged and stores the element hint as a separate field in photo-store. This minimizes the API surface change.

### Pitfall 4: elementHint added to Zod schema but not to capture route test

**What goes wrong:** `src/app/api/reading/capture/route.test.ts` tests the schema parsing. Adding `element_hint` to schema without updating the test will cause the test to pass with the wrong payload shape.

**How to avoid:** Update `route.test.ts` to include `element_hint` in valid payloads and verify it flows to `analyzeHand`.

### Pitfall 5: openai.ts test AI-01 checks content array order

**What goes wrong:** `openai.test.ts` at line 84-88 asserts `[0]=text, [1]=text, [2]=image_url`. Adding the elementHint text would shift everything — the test would fail.

**How to avoid:** Update the test to handle the optional third text item before the image_url. The test should check that `image_url` is the LAST item, not that it's at index [2].

---

## Code Examples

### Module-level photo store

```typescript
// src/lib/photo-store.ts
// Ephemeral in-memory store for the captured palm photo.
// Lives for the duration of a single reading attempt (camera → scan).
// Cleared on camera page mount and after scan reads it.

type HandElement = "fire" | "water" | "earth" | "air";

let _photo: string | null = null;
let _elementHint: HandElement | null = null;

export function setPhoto(base64: string): void {
  _photo = base64;
}

export function getPhoto(): string {
  return _photo ?? "";
}

export function setElementHint(hint: HandElement): void {
  _elementHint = hint;
}

export function getElementHint(): HandElement | undefined {
  return _elementHint ?? undefined;
}

export function clearPhotoStore(): void {
  _photo = null;
  _elementHint = null;
}
```

### Element hint from landmarks

```typescript
// src/lib/mediapipe.ts — add new export
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type HandElement = "fire" | "water" | "earth" | "air";

/**
 * Estimates hand element type from MediaPipe normalized landmarks.
 * Uses palm aspect ratio and finger-to-palm length ratio.
 * Returns undefined if landmarks are insufficient or confidence is low.
 */
export function computeElementHint(landmarks: NormalizedLandmark[]): HandElement | undefined {
  if (landmarks.length < 21) return undefined;

  // Euclidean 2D distance between normalized landmarks
  const d = (a: NormalizedLandmark, b: NormalizedLandmark): number =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const palmWidth = d(landmarks[5], landmarks[17]); // INDEX_MCP → PINKY_MCP
  const palmHeight = d(landmarks[0], landmarks[9]); // WRIST → MIDDLE_MCP
  const fingerLength = d(landmarks[9], landmarks[12]); // MIDDLE_MCP → MIDDLE_TIP

  if (palmWidth < 0.01 || palmHeight < 0.01) return undefined; // degenerate case

  const isLongPalm = palmHeight / palmWidth > 1.1;
  const isLongFingers = fingerLength / palmHeight > 0.95;

  if (!isLongPalm && isLongFingers) return "air";
  if (!isLongPalm && !isLongFingers) return "earth";
  if (isLongPalm && !isLongFingers) return "fire";
  return "water";
}
```

### Scan page gate pattern (pseudocode)

```typescript
// In scan/page.tsx — three effects, clean separation

// State
const [animDone, setAnimDone] = useState(false);
const [apiResult, setApiResult] = useState<
  | { ok: true; reading_id: string; impact_phrase: string }
  | { ok: false; errorType: "low_confidence" | "api_error" }
  | null
>(null);
const didNavigate = useRef(false);

// Effect 1: API call (fires once)
useEffect(() => {
  if (forced || didCapture.current) return;
  didCapture.current = true;
  const photo = getPhoto(); // from photo-store
  clearPhotoStore();        // free memory immediately
  captureReading({ photo_base64: photo, ... })
    .then(({ reading_id, report }) => {
      setApiResult({ ok: true, reading_id, impact_phrase: extractImpactPhrase(report) });
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "";
      setApiResult({
        ok: false,
        errorType: msg.includes("LOW_CONFIDENCE") ? "low_confidence" : "api_error",
      });
    });
}, [forced]);

// Effect 2: Progress animation (fires once, sets animDone)
useEffect(() => {
  if (forced || state === "scan_failed_low_confidence" || state === "scan_failed_api_error") return;
  const start = Date.now();
  const MIN_DURATION = 8000;
  const tick = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct = Math.min(99, (elapsed / MIN_DURATION) * 100); // cap at 99 until API done
    setProgress(pct);
    if (elapsed >= MIN_DURATION) {
      clearInterval(tick);
      setAnimDone(true);
    }
  }, 80);
  return () => clearInterval(tick);
}, [forced]);

// Effect 3: Gate — navigate only when both done
useEffect(() => {
  if (!animDone || !apiResult) return;
  if (didNavigate.current) return;
  didNavigate.current = true;

  if (!apiResult.ok) {
    const path = apiResult.errorType === "low_confidence"
      ? "/ler/erro?type=low_confidence"
      : "/ler/erro?type=api_error";
    router.replace(path);
    return;
  }

  sessionStorage.setItem("maosfalam_reading_id", apiResult.reading_id);
  sessionStorage.setItem("maosfalam_impact_phrase", apiResult.impact_phrase);
  setProgress(100); // snap to 100%
  setTimeout(() => router.push("/ler/revelacao"), 200); // brief visual pause at 100%
}, [animDone, apiResult, router]);
```

### captureFrame with quality parameter

```typescript
// src/lib/mediapipe.ts — updated signature
export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  mirrored: boolean,
  quality = 0.82, // was 0.92
): string {
  // ... existing body unchanged ...
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return dataUrl.replace(/^data:image\/jpeg;base64,/, "");
}
```

---

## State of the Art

| Old Approach                  | Current Approach          | Notes                                              |
| ----------------------------- | ------------------------- | -------------------------------------------------- |
| sessionStorage for photo      | Module singleton          | No browser storage API needed for ephemeral memory |
| Two independent timers (race) | Promise.all gate          | Standard async coordination pattern                |
| Element from image only       | Landmark pre-hint + image | Pre-hint is a soft signal, GPT-4o confirms         |

---

## Environment Availability

Step 2.6: SKIPPED. This phase is purely code refactoring with no new external tools, services, CLIs, or runtimes. All dependencies (Next.js, TypeScript, MediaPipe, OpenAI API) are already in use.

---

## Validation Architecture

### Test Framework

| Property           | Value                                        |
| ------------------ | -------------------------------------------- |
| Framework          | Vitest 4.1.3 + @testing-library/react 16.3.2 |
| Config file        | `vitest.config.ts`                           |
| Quick run command  | `npm run test`                               |
| Full suite command | `npm run test`                               |

### Phase Requirements → Test Map

This phase has no formal requirement IDs (it's a refactor). The behaviors to validate:

| Behavior                                                   | Test Type | Automated Command                                        | File Exists?    |
| ---------------------------------------------------------- | --------- | -------------------------------------------------------- | --------------- |
| photo-store: set/get/clear works correctly                 | unit      | `npm run test -- src/lib/photo-store`                    | No — Wave 0     |
| photo-store: cleared photo returns empty string            | unit      | `npm run test -- src/lib/photo-store`                    | No — Wave 0     |
| computeElementHint: fire for long+short                    | unit      | `npm run test -- src/lib/mediapipe`                      | No — Wave 0     |
| computeElementHint: returns undefined for <21 landmarks    | unit      | `npm run test -- src/lib/mediapipe`                      | No — Wave 0     |
| analyzeHand: elementHint injected as text before image_url | unit      | `npm run test -- src/server/lib/__tests__/openai`        | Exists — update |
| analyzeHand: elementHint absent when undefined             | unit      | `npm run test -- src/server/lib/__tests__/openai`        | Exists — update |
| captureReading route: accepts element_hint field           | unit      | `npm run test -- src/app/api/reading/capture/route.test` | Exists — update |

### Sampling Rate

- **Per task commit:** `npm run test -- --reporter=verbose 2>&1 | tail -20`
- **Per wave merge:** `npm run test`
- **Phase gate:** `npm run build` green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/__tests__/photo-store.test.ts` — covers set/get/clear/elementHint
- [ ] `src/lib/__tests__/mediapipe-element-hint.test.ts` — covers computeElementHint with landmark arrays
- Update `src/server/lib/__tests__/openai.test.ts` — AI-01 content array order test must handle optional elementHint
- Update `src/app/api/reading/capture/route.test.ts` — valid payload should include `element_hint`

---

## Open Questions

1. **scan_slow transition timing with the gate pattern**
   - What we know: `scan_slow` currently changes the phrase set when `phraseIdx` exceeds PHRASES length bound
   - What's unclear: with the gate pattern, there's no timer-based 15s trigger for scan_slow. It should trigger when `animDone === true && apiResult === null` (animation finished but API still pending)
   - Recommendation: add a `useEffect([animDone, apiResult])` that sets `setState("scan_slow")` when `animDone && !apiResult`

2. **elementHint for upload path (IMAGE mode MediaPipe)**
   - What we know: useUploadValidation runs MediaPipe in IMAGE mode and returns `ValidationResult` but does not expose landmarks
   - What's unclear: should we expose landmarks from `useUploadValidation` to compute element hint from upload photos?
   - Recommendation: No. The architecture docs explicitly say the hint is from landmark geometry ("Esse calculo de elemento pode ser feito no client"). Upload validation already does MediaPipe but doesn't need to expose that for the hint. Keep elementHint as undefined for upload flow — GPT-4o handles it from image alone.

3. **captureFrame quality: only camera path or also upload compression?**
   - What we know: upload path uses `canvas.toDataURL` in `normalizeImage` (Phase 3), not `captureFrame`
   - What's unclear: should upload quality also be reduced to 0.82?
   - Recommendation: Phase 3 already set upload compression to JPEG 0.85. Leave upload unchanged; only camera path (captureFrame) reduces from 0.92 to 0.82.

---

## Sources

### Primary (HIGH confidence)

- Source code inspection — `src/app/ler/scan/page.tsx`, `src/app/ler/camera/page.tsx`, `src/lib/mediapipe.ts`, `src/server/lib/openai.ts`, `src/hooks/useCameraPipeline.ts`
- `docs/architecture.md` — element hint rationale and landmark math documented by project author

### Secondary (MEDIUM confidence)

- Next.js App Router module lifetime behavior — verified by understanding that `router.push` performs client-side navigation without reloading JS modules (standard Next.js behavior since v13)
- JPEG quality 0.82 for GPT-4o — based on OpenAI vision docs tile size (768x768 high detail) and general JPEG compression knowledge

### Tertiary (LOW confidence)

- Element detection thresholds (`isLongPalm > 1.1`, `isLongFingers > 0.95`) — reasonable starting values based on palmistry proportions. May need calibration after testing with real hands.

---

## Metadata

**Confidence breakdown:**

- Photo store pattern: HIGH — standard JS module semantics in Next.js client navigation
- Race condition fix: HIGH — the bug is clearly visible in the source; Promise.all is standard
- Element hint math: MEDIUM — ratios are reasonable approximations; GPT-4o is the authoritative classifier
- JPEG quality change: MEDIUM — empirical quality threshold, not GPT-4o-specific documentation

**Research date:** 2026-04-11
**Valid until:** 2026-07-11 (stable: Next.js App Router module semantics, JPEG, Promise.all)

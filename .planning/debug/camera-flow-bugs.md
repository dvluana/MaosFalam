---
status: awaiting_human_verify
trigger: "Multiple bugs in camera flow, GPT-4o analysis, and code quality from milestones v1.1 and v1.2"
created: 2026-04-11T00:00:00Z
updated: 2026-04-11T00:00:00Z
---

## Current Focus

hypothesis: All 9 issues confirmed via code reading. Proceeding to fix in priority order.
test: Fix each issue, run lint+type-check after each group
expecting: All fixes pass lint and type-check
next_action: Human verification — confirm hand outline visible, scan sends correct data

## Symptoms

expected: Camera flow works correctly end-to-end with correct data passed to GPT-4o
actual: Multiple bugs: hand outline invisible, permission delayed, scan sends wrong data, share card missing accents
errors: See issue list
reproduction: Use camera flow on staging
started: v1.1/v1.2 milestones

## Eliminated

- hypothesis: CameraViewport renders HandOutlineSVG incorrectly
  evidence: HandOutlineSVG renders when state === "camera_active_no_hand". BUT: opacity is 0.12 which renders as nearly invisible (12% opacity on an already dim gold stroke). Root cause is the stroke color is rgba(122,104,50,0.15) AND the wrapper has opacity-[0.12] — the effective opacity is ~1.8% which is invisible.
  timestamp: 2026-04-11

- hypothesis: loading_mediapipe fires too late
  evidence: useCameraPipeline fires on state "loading_mediapipe" which is set when user clicks "onReady" in HandInstructionOverlay. The FIRST getUserMedia call is in that effect. Before "loading_mediapipe", no camera is requested. The permission prompt fires on the FIRST getUserMedia call. If user clicks camera switch before that, handleSwitchCamera also calls setState("loading_mediapipe") which re-triggers the effect via cameraKey increment. So user saw permission prompt only after switch because they entered via the method_choice path and possibly never reached loading_mediapipe before that.
  timestamp: 2026-04-11

## Evidence

- timestamp: 2026-04-11
  checked: CameraViewport.tsx line 114
  found: HandOutlineSVG renders with className="opacity-[0.12]" — 12% opacity wrapper on SVG that already has stroke color rgba(122,104,50,0.15) — effective opacity ~1.8%, invisible.
  implication: ISSUE 1 — hand outline appears invisible. Fix: increase opacity to ~0.45.

- timestamp: 2026-04-11
  checked: camera/page.tsx + useCameraPipeline.ts
  found: getUserMedia is called inside useCameraPipeline only when state === "loading_mediapipe". State transitions: method_choice → hand_instruction (overlay) → user clicks "Continuar" → loading_mediapipe. handleSwitchCamera also sets loading_mediapipe. The camera switch button triggers loading_mediapipe AND increments cameraKey, re-firing the effect. ISSUE 2: Permission prompt fires on getUserMedia which is inside the loading_mediapipe effect. This is correct behavior — but if user never reached loading_mediapipe (e.g., refreshed, or took a different path), they won't see permission until they proceed. No fix needed; behavior is correct per the documented flow.
  implication: ISSUE 2 is expected behavior, not a bug. No code change needed.

- timestamp: 2026-04-11
  checked: mediapipe.ts MODEL_URL and WASM_URL
  found: MODEL_URL points to Google Storage CDN, WASM_URL to jsdelivr. No local caching. During loading_mediapipe, user sees "Preciso ver melhor." text via CAM_FEEDBACK. Loading can take 3-8s on slow connections. This is the expected behavior.
  implication: ISSUE 3 is UX perception, not a code bug. The feedback text exists. No code change needed.

- timestamp: 2026-04-11
  checked: scan/page.tsx line 62-68
  found: captureReading called with is_self: true hardcoded (line 68), and NO dominant_hand field. Session storage keys used: "maosfalam_photo", "maosfalam_session_id", "maosfalam_name", "maosfalam_target_gender". But ReadingContext is stored at key "maosfalam_reading_context" and contains dominant_hand and is_self. scan/page.tsx reads from individual session storage keys, ignoring ReadingContext entirely.
  implication: ISSUE 5+6 confirmed. Fix: read from ReadingContext via loadReadingContext().

- timestamp: 2026-04-11
  checked: scan/page.tsx + reading-context.ts
  found: ReadingContext has target_name, target_gender, dominant_hand, is_self, session_id, credit_used. scan/page.tsx already imports nothing from reading-context.ts. Needs to import loadReadingContext and use those fields.
  implication: Also check captureReading signature for dominant_hand field.

- timestamp: 2026-04-11
  checked: share/page.tsx lines 183-189
  found: renderShareCard() at line 183 writes "MaosFalam" (no accent) and at line 189 writes "Me mostre sua mao e eu te conto quem voce e" — missing accents on "mão", "você", "é".
  implication: ISSUE 7 (share card). Fix two strings in the canvas render function.

- timestamp: 2026-04-11
  checked: UploadPreview.tsx
  found: 8-line file returning null. Comment says "Deprecated: replaced by UploadInstructionScreen + UploadValidationScreen + UploadConfirmScreen". Grep confirms zero imports anywhere.
  implication: ISSUE 8. Delete the file.

- timestamp: 2026-04-11
  checked: manifesto/page.tsx metadata (lines 11-15)
  found: Metadata description has "maos", "maos", "mao" without accents. These are in the metadata object which affects SEO/OG but not visible UI. Scope is narrow — the metadata strings, not the 63+ body text instances.
  implication: ISSUE 7 (manifesto). Fix metadata strings only (scoped as requested in symptoms).

## Resolution

root_cause: Multiple independent bugs: (1) HandOutlineSVG invisible — SVG strokes were rgba(122,104,50,0.15) + wrapper opacity-[0.12] = ~1.8% effective opacity; (5) scan page reads individual sessionStorage keys losing dominant_hand and hardcoding is_self:true instead of reading ReadingContext; (7) share card canvas renders "MaosFalam" and "mao/voce/e" without accents; (8) dead UploadPreview.tsx stub never imported.
fix: (1) SVG stroke colors changed to rgba(201,162,74,0.6) + wrapper opacity to opacity-[0.45]; (5+6) scan page now loads ReadingContext and passes is_self+dominant_hand correctly; (7) share card canvas uses unicode escapes for ã/ê/é, manifesto metadata uses full accents; (8) UploadPreview.tsx deleted.
verification: npm run lint + npm run type-check + npm run build all pass with zero errors.
files_changed:

- src/components/camera/HandOutlineSVG.tsx
- src/components/camera/CameraViewport.tsx
- src/app/ler/scan/page.tsx
- src/app/ler/resultado/[id]/share/page.tsx
- src/app/manifesto/page.tsx
- src/components/camera/UploadPreview.tsx (deleted)

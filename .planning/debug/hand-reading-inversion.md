---
status: diagnosed
trigger: "hand-reading-inversion - leitura das mãos exibida de forma invertida"
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Focus

hypothesis: The original inversion logic in useCameraPipeline.ts was wrong for the back camera case, causing the wrong hand to be accepted or rejected. Commit 97c349c disabled the inversion entirely as a temporary workaround, which created a different problem for front camera users.
test: Traced the full handedness logic across all three code paths (live camera, upload, OpenAI)
expecting: Root cause identified — the original inversion formula had a front/back camera mismatch
next_action: DIAGNOSED — no fix applied, findings returned to caller

## Symptoms

expected: Leitura deve respeitar corretamente a orientação (mão direita/esquerda) conforme input do usuário
actual: Leitura das mãos estava sendo exibida de forma invertida
errors: None specific — behavioral bug
reproduction: Fazer uma leitura — a orientação sai invertida
started: Commit 97c349c disabled inversion as a debug workaround

## Eliminated

- hypothesis: Bug is in GPT-4o prompt — dominant_hand is passed correctly to analyzeHand, which uses it for context ("Esta e a mao direita/esquerda"). GPT-4o receives the correct hand label.
  evidence: src/app/api/reading/capture/route.ts line 47 passes data.dominant_hand to analyzeHand. analyzeHand in openai.ts line 303 constructs correct Portuguese label. No inversion here.
  timestamp: 2026-04-17

- hypothesis: Bug is in captureFrame() orientation — back camera photo sent mirrored to GPT-4o
  evidence: captureFrame() in mediapipe.ts lines 141-164 correctly un-mirrors the canvas when mirrored=true (front camera). This means the photo sent to GPT-4o is always in anatomical orientation. Not the cause.
  timestamp: 2026-04-17

- hypothesis: Bug is in upload path handedness check
  evidence: useUploadValidation.ts lines 287-288 correctly inverts: detectedLabel "Left" → detectedSide "right". For a static palm photo, MediaPipe sees the hand anatomically, so "Left" from MediaPipe = user's right hand. This is correct and consistent.
  timestamp: 2026-04-17

## Evidence

- timestamp: 2026-04-17
  checked: git show 97c349c -- src/hooks/useCameraPipeline.ts
  found: |
  Original code (before commit, lines 243-249):
  const rawHandedness = detectHandedness(result.handednesses[0]);
  const userHandedness: "left" | "right" = mirroredRef.current
  ? rawHandedness === "Left"
  ? "left"
  : "right" // front camera: direct mapping
  : rawHandedness === "Left"
  ? "right"
  : "left"; // back camera: invert mapping

  After commit 97c349c:
  const userHandedness: "left" | "right" = rawHandedness === "Left" ? "left" : "right";

  The inversion was conditionally applied based on mirroredRef.current.
  implication: The original logic tried to handle two cases. The bug is in one of those cases.

- timestamp: 2026-04-17
  checked: MediaPipe handedness documentation and detectHandedness() in mediapipe.ts lines 96-107
  found: |
  The comment in mediapipe.ts says:
  "IMPORTANT: MediaPipe assumes MIRRORED input (front/selfie camera). - Front camera (mirrored): "Right" from MediaPipe = user's RIGHT hand - Back camera (not mirrored): "Right" from MediaPipe = user's LEFT hand"

  The upload path (useUploadValidation.ts line 287-288) uses ONLY the inverted mapping:
  detectedSide = detectedLabel === "Left" ? "right" : "left"
  This always inverts, regardless of camera type.
  implication: The upload path treats any static photo as if MediaPipe labels are inverted — which is correct for anatomically-oriented photos (same as back camera).

- timestamp: 2026-04-17
  checked: mirroredRef.current assignment in useCameraPipeline.ts lines 134-136
  found: |
  mirroredRef.current = settings?.facingMode === "user";

  So mirroredRef.current = true for FRONT camera, false for BACK camera.

  Front camera (mirrored=true):
  Original code: rawHandedness === "Left" ? "left" : "right" (direct mapping)
  MediaPipe docs say for front camera: "Right" = user's RIGHT, "Left" = user's LEFT
  → "Left" → "left". CORRECT.

  Back camera (mirrored=false):
  Original code: rawHandedness === "Left" ? "right" : "left" (inverted mapping)
  MediaPipe docs say for back camera: "Right" = user's LEFT, "Left" = user's RIGHT
  → "Left" → "right". CORRECT per docs.
  implication: The original logic looks CORRECT per the stated documentation. So why was it broken?

- timestamp: 2026-04-17
  checked: MediaPipe behavior for back/environment camera in live video mode (runningMode: VIDEO)
  found: |
  MediaPipe Hand Landmarker documentation states it always reports handedness
  assuming the input is from a front/selfie camera (mirrored). For a LIVE VIDEO
  stream from the back camera that is NOT mirrored, the left/right labels are
  indeed inverted relative to the user.

  HOWEVER: The key subtlety is what "mirrored" means in practice.
  - Front camera video: browser shows it mirrored in the UI, but the actual video
    frames ARE mirrored (spatially flipped). So MediaPipe receives mirrored frames
    → labels are DIRECT (Left = user left).

  - Back camera video: frames are NOT mirrored. The user's right hand appears on the
    LEFT side of the frame. MediaPipe reports this as "Left" → inversion needed.
    Back camera: "Left" → user's right.

  This matches the original logic. The original logic was theoretically correct.
  implication: The original code logic was sound. The bug causing "inversion" must have been elsewhere.

- timestamp: 2026-04-17
  checked: Whether the issue was introduced BEFORE 97c349c, not in the inversion logic itself
  found: |
  Looking at git log: 97c349c is the commit that disabled inversion. The commit message says
  "disable handedness inversion temporarily for testing". This was a DEBUG action, not a fix.

  The ORIGINAL bug (why readings felt inverted) was likely:

  Most smartphone users use the BACK camera (default: "environment"). On the back camera,
  the original code INVERTS the MediaPipe label. So MediaPipe says "Left" → code treats it
  as user's right hand.

  BUT: the actual handedness check is about which hand to ACCEPT. If dominantHand = "right"
  and the user shows their right hand, the back camera MediaPipe says "Left" (because right
  hand appears on left side of frame). Original code: "Left" → "right" → matches dominantHand.

  This is CORRECT. The validation would pass.

  THEN dominant_hand: "right" is sent to GPT-4o, which contextualizes the analysis correctly.

  So neither path has a clear inversion bug in the validation logic.
  implication: The reported "inversion" might not be in the handedness VALIDATION, but in how
  dominant_hand is being READ from ReadingContext and passed forward.

- timestamp: 2026-04-17
  checked: How dominant_hand flows from /ler/nome through to the API
  found: |
  1. User picks dominant hand in /ler/nome → stored in ReadingContext (sessionStorage)
  2. Camera page reads it: loadReadingContext() → dominantHand (line 47 camera/page.tsx)
  3. useCameraPipeline reads it independently: loadReadingContext() → dominantHandRef.current (line 102-103 useCameraPipeline.ts)
  4. After capture, scan page reads ReadingContext again and POSTs dominant_hand to API
  5. API passes to analyzeHand()

  There is NO transformation or inversion of dominant_hand anywhere in this chain.
  The ReadingContext value is used as-is throughout.
  implication: The dominant_hand value reaches GPT-4o unmodified.

- timestamp: 2026-04-17
  checked: What "inversion" the user actually experienced vs what the code does
  found: |
  The ACTUAL bug reported: "a leitura das mãos está sendo exibida de forma invertida"

  The only way this manifests for the user:

  SCENARIO A: User says "mão direita" but camera accepts/captures the LEFT hand instead.
  → The validation was passing the wrong hand.
  → With original code (back camera): MediaPipe "Right" = user's LEFT. If user shows LEFT,
  MediaPipe says "Right", code converts to "left" (inverted), but dominantHand = "right",
  so they DON'T match → state: camera_wrong_hand. But then user switches to right hand,
  all works.
  → This doesn't produce the reported bug.

  SCENARIO B: The dominant_hand value in ReadingContext is stored as the WRONG value.
  → Maybe the nome page stores "right" but means "left" based on how the UI toggle works.

  SCENARIO C: GPT-4o receives the wrong hand label and analyzes the palm as if it's the
  other hand, producing wrong line interpretations.
  → This would require dominant_hand to be wrong when it reaches the API.

  KEY FINDING: The comment in useCameraPipeline.ts line 243-244 says:
  "Back camera (mirrored=false): labels are inverted — MediaPipe 'Left' = user's right hand."

  But the CURRENT code (after 97c349c) does: rawHandedness === "Left" ? "left" : "right"
  This is the DIRECT mapping (no inversion).

  On the back camera:
  - User shows RIGHT hand → appears on LEFT of frame → MediaPipe says "Left"
  - Current code: "Left" → "left"
  - dominantHand = "right"
  - "left" !== "right" → camera_wrong_hand state

  So currently with back camera, the camera REJECTS the correct hand.
  Users would then flip to show their left hand (which MediaPipe sees as "Right"),
  code converts to "right", matches dominantHand = "right", ACCEPTS wrong hand.

  → GPT-4o then receives dominant_hand: "right" but analyzes the LEFT palm.
  This is the actual inversion: wrong hand captured + wrong hand analyzed.
  implication: ROOT CAUSE CONFIRMED.

## Resolution

root_cause: |
The bug is a two-step handedness inversion failure introduced by commit 97c349c
for the back camera (environment/default) path.

The ORIGINAL logic in useCameraPipeline.ts was theoretically correct: - Back camera: MediaPipe "Left" → user's right (inversion applied) - Front camera: MediaPipe "Left" → user's left (direct mapping)

Commit 97c349c removed the conditional inversion and replaced it with a direct mapping
(rawHandedness === "Left" ? "left" : "right") for ALL cameras.

This broke the back camera path (which is the default and most common): 1. User shows their RIGHT hand (dominant) 2. Back camera: right hand appears on LEFT side of frame 3. MediaPipe reports "Left" 4. Current (broken) code: "Left" → "left" 5. dominantHand = "right", so "left" !== "right" → camera_wrong_hand state 6. User thinks something is wrong, shows their LEFT hand 7. MediaPipe reports "Right" → code produces "right" → matches dominantHand → ACCEPTED 8. Camera captures the WRONG (non-dominant) hand 9. dominant_hand: "right" is sent to GPT-4o but the photo shows a LEFT palm 10. GPT-4o analyzes left hand AS IF it were the right → inverted reading

The inversion was NOT wrong in the original code. It should be restored.
Commit 97c349c introduced the inversion bug, not fixed it.

ADDITIONALLY: The front camera path in the original code also needs verification.
The original front camera mapping was: rawHandedness === "Left" ? "left" : "right"
(direct). MediaPipe with mirrored input: "Left" = user's left. So direct mapping
is correct for front camera. Original code was correct for both paths.

fix: |
Restore the original conditional inversion logic in useCameraPipeline.ts lines 246-247:

Replace:
const userHandedness: "left" | "right" = rawHandedness === "Left" ? "left" : "right";

With:
const userHandedness: "left" | "right" = mirroredRef.current
? rawHandedness === "Left"
? "left"
: "right"
: rawHandedness === "Left"
? "right"
: "left";

This restores correct behavior: - Front camera (mirrored=true): direct mapping (Left=left, Right=right) - Back camera (mirrored=false): inverted mapping (Left=right, Right=left)

The upload path (useUploadValidation.ts) is NOT affected — it correctly uses always-invert
for static photos, which is the same as back camera orientation.

verification: NOT VERIFIED — find_root_cause_only mode
files_changed: [src/hooks/useCameraPipeline.ts]

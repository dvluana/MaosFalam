---
status: investigating
trigger: "element-inconsistency-same-hand"
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — GPT-4o is the sole source of element classification and returns different results across calls for the same hand, despite temperature=0. The element_hint from MediaPipe is only a soft suggestion that GPT-4o may ignore. The prompt rule ("longa+curtos=fogo, longa+longos=agua, quadrada+longos=ar") relies on GPT-4o visually estimating palm proportions from the photo, which is inherently unreliable across runs.
test: Queried all 3 Luana readings in Neon develop DB; read openai.ts, capture route, mediapipe.ts, useCameraPipeline.ts
expecting: n/a - root cause confirmed
next_action: Report diagnosis

## Symptoms

expected: Same hand should consistently get the same element classification
actual: User got "Fogo" before (Apr 14), then "Ar" (Apr 17 19:37), then "Água" (Apr 17 20:00)
errors: None visible
reproduction: Do multiple readings locally - element changes between readings
started: Just happened during local testing

## Eliminated

- hypothesis: Code bug in capture route or scan page causing wrong element_hint
  evidence: Capture route correctly passes element_hint to analyzeHand(); scan page correctly reads element_hint from photo-store. No bug in data plumbing.
  timestamp: 2026-04-17

- hypothesis: element_hint from MediaPipe is overriding GPT-4o and causing wrong results
  evidence: element_hint is sent as "Confirme ou corrija com base na foto." — it's explicitly framed as overrideable. GPT-4o is the authoritative classifier per the prompt. Also, all 3 readings show different elements, not the same element biased by MediaPipe.
  timestamp: 2026-04-17

## Evidence

- timestamp: 2026-04-17
  checked: Neon develop DB — all readings for Luana
  found: 3 readings of the same hand returned 3 different elements: fire (Apr 14), air (Apr 17 19:37), water (Apr 17 20:00). All had confidence=0.85. Other line variations also differ significantly (e.g., life: curved_wide vs long_deep; fate: absent vs present_faint; heart: medium_curved vs medium_straight).
  implication: GPT-4o is not deterministic despite temperature=0. Same photo gets different analysis on different calls.

- timestamp: 2026-04-17
  checked: openai.ts — temperature and element_hint handling
  found: temperature=0 is set. element_hint is sent as a soft hint: "Pre-analise geometrica dos landmarks da mao indica elemento: ${elementHint}. Confirme ou corrija com base na foto." — GPT-4o can and does override this.
  implication: temperature=0 does not guarantee identical outputs for vision models when the input image is being interpreted. Image-based inference has inherent variability even at temperature=0.

- timestamp: 2026-04-17
  checked: openai.ts — element classification prompt rule
  found: Element is determined by: "longa+curtos=fogo, longa+longos=agua, quadrada+curtos=terra, quadrada+longos=ar". GPT-4o must visually estimate palm proportion (square vs rectangular) and finger length ratio from the photo. These are subjective visual judgments with no ground truth anchor.
  implication: The classification rule depends on qualitative visual estimation, which changes between calls even for the same image.

- timestamp: 2026-04-17
  checked: Structured Outputs schema in openai.ts
  found: Strict JSON schema enforces valid enum values but cannot enforce semantic consistency across calls. GPT-4o can validly return "fire" on one call and "water" on another — both comply with the schema.
  implication: Structured Outputs constrains format, not semantic determinism.

- timestamp: 2026-04-17
  checked: mediapipe.ts — computeElementHint()
  found: Computes element from landmark geometry (palmHeight/palmWidth and fingerLength/palmHeight ratios). This IS deterministic for the same hand position. It would return a consistent hint, but GPT-4o ignores or overrides it.
  implication: MediaPipe hint could be the fix if GPT-4o honored it as authoritative rather than advisory.

- timestamp: 2026-04-17
  checked: useCameraPipeline.ts — element hint flow
  found: computeElementHint() is called at capture time using lastLandmarksRef.current (the last stable frame's landmarks). setElementHint() stores it in photo-store. Scan page reads it and passes to captureReading(). Flow is correct with no bugs.
  implication: The hint pipeline works correctly but the hint is advisory, not enforced.

## Resolution

root_cause: GPT-4o vision inference is non-deterministic across API calls even at temperature=0 when classifying visual attributes (palm/finger proportions). The element classification depends on GPT-4o visually estimating whether the palm is "square vs rectangular" and whether fingers are "short vs long" — subjective geometric judgments that vary between calls. This causes the same hand photo to receive different element classifications across readings. The MediaPipe element_hint is computed deterministically from landmarks but is framed as advisory ("Confirme ou corrija"), which GPT-4o often overrides.

fix: (not implementing — diagnose-only mode)
OPTION A (recommended): Trust MediaPipe element_hint as authoritative. Remove the element classification from the GPT-4o prompt entirely. GPT-4o is good at detecting lines, modifiers, and mounts (local features with clear boundaries) but poor at palm proportion estimation (requires geometric reasoning on an image). MediaPipe landmarks give precise geometric measurements. Change element_hint to be applied post-GPT-4o: ignore GPT-4o's element output, use MediaPipe's computed element exclusively.

OPTION B: Keep GPT-4o element classification but also store element_hint in the reading and use it to override GPT-4o when available (upload path would still have variability).

OPTION C: Use a dedicated lightweight vision model or prompt GPT-4o to output palm_proportion and finger_length as raw measurements rather than the final element label, then compute the label deterministically in code.

verification:
files_changed: []

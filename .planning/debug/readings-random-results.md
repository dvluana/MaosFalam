---
status: diagnosed
trigger: "Users are getting completely different reading results every time they submit the same photo. The algorithm appears random instead of deterministic."
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — pickRandom() uses Math.random() (unseeded), producing different text variations on every call. The architecture docs promised seed-determinism per reading ID, but the implementation never received or used a reading ID as a seed.
test: Read select-blocks.ts lines 51-53 — confirmed Math.random() with no seeding.
expecting: N/A — root cause found.
next_action: Report diagnosis.

## Symptoms

expected: Same photo should produce the same or very similar reading results (same element, same line attributes, same blocks selected)
actual: Every reading produces different results even with the same photo
errors: None visible - the readings complete, but results vary wildly
reproduction: Take a photo or upload the same hand photo multiple times - get different readings each time
started: Unclear - may have always been this way or may be recent

## Eliminated

- hypothesis: GPT-4o temperature producing variable attributes
  evidence: openai.ts line 337 — temperature: 0 is explicitly set. The attributes (element, line variations) coming from GPT-4o are deterministic given the same photo. The variability is NOT in the AI analysis layer.
  timestamp: 2026-04-17

- hypothesis: Confidence thresholds causing different code paths
  evidence: Confidence gating is binary (< 0.3 rejects). Does not affect text variation selection.
  timestamp: 2026-04-17

- hypothesis: Multiple readings per user showing different attributes (GPT-4o inconsistency)
  evidence: The attributes schema is locked via Structured Outputs (json_schema with strict:true). Same photo + same prompt + temperature 0 + same model should produce the same attributes. The randomness is in the text blocks selected AFTER attributes are determined.
  timestamp: 2026-04-17

## Evidence

- timestamp: 2026-04-17
  checked: src/server/lib/openai.ts line 337
  found: temperature: 0 is set on the GPT-4o API call. Also uses response_format: json_schema with strict: true (Structured Outputs). This layer is deterministic.
  implication: The attributes (element, heart variation, etc.) are NOT the source of randomness.

- timestamp: 2026-04-17
  checked: src/server/lib/select-blocks.ts lines 51-53
  found: |
  function pickRandom(block: TextBlock): string {
  const options = [block.content, block.alt, block.alt2];
  return options[Math.floor(Math.random() * options.length)]!;
  }
  implication: Math.random() is called with NO seed. This is crypto-random on every invocation. Every call to pickRandom() is independent and unseeded.

- timestamp: 2026-04-17
  checked: src/server/lib/select-blocks.ts — all callsites of pickRandom()
  found: pickRandom() is called 15+ times per reading across: elementIntro, elementBody, impactPhrase (fallback path), opening, epilogue, sectionOpening (x4 sections), bodyPast (x4), bodyPresent (x4), modifiers, venusOpening, venusBody, cinturaoText, venusClosing, crossings, compatibility bodies, rare sign bodies.
  implication: Every field in the report is independently randomized on each invocation.

- timestamp: 2026-04-17
  checked: selectBlocks() function signature — src/server/lib/select-blocks.ts line 155
  found: |
  export function selectBlocks(
  attributes: HandAttributes,
  name: string,
  gender: "female" | "male",
  ): ReportJSON
  implication: The function signature does NOT accept a reading ID or any seed. The architecture docs (architecture.md section 6) stated "Randomizes variação textual (content vs alt vs alt2)" and "choices seeded by reading ID for consistency" — but this was never implemented. The reading ID is generated AFTER selectBlocks() is called (prisma.reading.create happens at line 77 of route.ts, AFTER selectBlocks at line 62).

- timestamp: 2026-04-17
  checked: src/app/api/reading/capture/route.ts — call order
  found: |
  line 62: const report = selectBlocks(attributes, data.target_name, data.target_gender);
  line 77: const reading = await prisma.reading.create({ data: { ... report ... } });
  implication: Even if a seed were desired, the reading.id (UUID) does not exist yet when selectBlocks() is called. The flow generates the report first, then saves it. To implement determinism via reading ID, the ID would need to be pre-generated (e.g., via crypto.randomUUID()) before calling selectBlocks().

- timestamp: 2026-04-17
  checked: src/server/lib/**tests**/select-blocks.test.ts
  found: Tests only assert structural correctness (4 sections, non-null opening, correct key). No test checks for text determinism across multiple calls with the same inputs.
  implication: The randomness was never caught by tests because tests only ran selectBlocks() once per case and checked structure, not reproducibility.

## Resolution

root_cause: |
src/server/lib/select-blocks.ts — pickRandom() uses Math.random() (unseeded) to select among text variations (content, alt, alt2).

The function is called 15+ times per reading. Each call independently rolls a random number, meaning the same attributes produce a different full report on every invocation.

The architecture docs promised "seeded by reading_id for consistency" but this was never implemented. The reading ID cannot be used as a seed anyway because it is generated AFTER selectBlocks() is called in the API route (prisma.reading.create runs after selectBlocks).

The two sources of potential randomness in the pipeline are:

1. GPT-4o attributes — NOT random (temperature: 0, Structured Outputs). Same photo produces same attributes.
2. Text block selection — RANDOM (Math.random(), unseeded). Same attributes produce different text every time.

Result: A user resubmitting the same photo gets the same element and line variations, but completely different text paragraphs, opening, epilogue, impact phrase, and modifiers on every submission.

fix: |
Implement a deterministic pseudo-random number generator (PRNG) seeded from a stable value.

Option A (preferred — reading-ID-based, matches architecture intent):

- Pre-generate the reading UUID before calling selectBlocks(): const readingId = crypto.randomUUID()
- Pass readingId as a 4th argument to selectBlocks()
- Replace Math.random() in pickRandom() with a seeded PRNG (e.g., mulberry32 or xoshiro128\*\* — both pure JS, zero deps)
- Seed the PRNG from a hash of readingId
- Use the PRNG instance across ALL pickRandom() calls within one selectBlocks() invocation

Option B (simpler — attributes-hash-based):

- Hash the HandAttributes JSON to a 32-bit integer
- Use that hash as PRNG seed
- Same photo → same attributes → same hash → same text every time
- Does not require pre-generating UUID

Option B is simpler and more robust: it makes "same attributes = same report" invariant, regardless of reading ID lifecycle.

verification:
files_changed: []

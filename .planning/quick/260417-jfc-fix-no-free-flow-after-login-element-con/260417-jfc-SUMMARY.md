---
phase: quick
plan: 260417-jfc
subsystem: reading-flow
tags: [bug-fix, ux, copy, no-credits, element-concept]
key-files:
  modified:
    - src/app/ler/nome/page.tsx
    - src/app/ler/scan/page.tsx
    - src/app/ler/revelacao/page.tsx
    - src/data/blocks/element.ts
    - src/lib/storage-keys.ts
decisions:
  - "navigateToReading() helper extracted to eliminate duplicated sessionStorage+ReadingContext+router.push logic across three paths in nome page"
  - "Bridge line uses fixed copy (not element-specific) to prime hand-shape concept without revealing element name prematurely"
  - "report.element.key stored directly (not via optional chaining) since ReportJSON type guarantees element is always present"
metrics:
  duration: "~12m"
  completed: "2026-04-17"
  tasks: 2
  files: 5
---

# Quick Task 260417-jfc: Fix no-free-flow-after-login + Element Concept UX

No-credits bug fixed (logged-in users with 0 credits blocked from free reading) and element concept primed via revelacao bridge line + expanded ELEMENT_INTRO copy.

## Tasks Completed

| Task | Name                                                | Commit  | Files                                         |
| ---- | --------------------------------------------------- | ------- | --------------------------------------------- |
| 1    | Fix no-credits bifurcation + element storage        | dd86dfb | nome/page.tsx, scan/page.tsx, storage-keys.ts |
| 2    | Revelacao bridge line + expanded ELEMENT_INTRO copy | e401fe6 | revelacao/page.tsx, element.ts                |

## What Was Done

### Task 1: No-credits bifurcation + element storage

**Bug:** Logged-in users with `balance === 0` and `reading_count > 0` were redirected directly to `/creditos`, blocking the free reading flow defined in screens.md.

**Fix:**

- Added `showNoCreditsBifurcation` state to `/ler/nome` page
- Replaced `router.push("/creditos")` with `setShowNoCreditsBifurcation(true)`
- Extracted `navigateToReading(trimmedName)` helper — shared by first-reading path, free-reading path, and has-credits path — eliminating ~30 lines of duplicated sessionStorage/ReadingContext/router.push logic
- Added `handleFreeReading()` handler that uses the shared helper
- When bifurcation is active: cigana message + two buttons side by side ("Leitura free" primary, "Comprar creditos" secondary)
- Bifurcation state resets on name input change and isSelf toggle
- Added `STORAGE_KEYS.element = "maosfalam_element"` to storage-keys.ts
- Scan page now stores `report.element.key` in sessionStorage after successful API response

### Task 2: Revelacao bridge line + expanded ELEMENT_INTRO copy

**Bridge line:**

- Added `hasElement` and `showBridge` state to revelacao page
- Reads `STORAGE_KEYS.element` from sessionStorage on mount; sets `hasElement = true` if present
- After impact phrase typewriter completes: button appears at 1400ms, bridge line fades in at 2000ms (only if `hasElement`)
- Bridge line: subtle fade-in (opacity 0.7), Cormorant italic, bone-dim color, centered
- Copy: "Eu li sua palma antes de qualquer coisa. A forma da sua mao ja me contou o que eu precisava." — deliberately vague, does not name the element

**Expanded ELEMENT_INTRO:**

- All 4 entries now connect physical evidence (palm shape, finger length) to element name with a cigana personality punchline
- Pattern: "[physical facts]. Mao de [Element]. [What it means about you]."
- fire: "Voce age antes de pensar, e o mundo gira na sua direcao por causa disso."
- water: "Voce sente o que os outros nem registram, e isso e sua potencia e seu peso."
- earth: "Voce constroi em silencio o que os outros so planejam."
- air: "Sua cabeca trabalha em camadas que os outros nem percebem."

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] report.element is non-optional in ReportJSON**

- **Found during:** Task 1 implementation
- **Issue:** Plan suggested `report.element?.key` with optional chaining, but `ReportJSON` type declares `element` as required (not optional)
- **Fix:** Used `report.element.key` directly — no optional chaining needed, no runtime behavior change
- **Files modified:** src/app/ler/scan/page.tsx
- **Commit:** dd86dfb

## Known Stubs

None. All changes are fully wired: element stored in scan, read in revelacao, ELEMENT_INTRO expanded with real copy.

## Self-Check: PASSED

Files confirmed modified:

- src/app/ler/nome/page.tsx — showNoCreditsBifurcation UI, navigateToReading helper
- src/app/ler/scan/page.tsx — element storage after capture
- src/app/ler/revelacao/page.tsx — bridge line with hasElement gate
- src/data/blocks/element.ts — expanded ELEMENT_INTRO
- src/lib/storage-keys.ts — element key added

Commits confirmed:

- dd86dfb (Task 1)
- e401fe6 (Task 2)

Build: PASSED. Type-check: PASSED. Lint: PASSED.

---
phase: 04-outra-pessoa-a11y
plan: 02
subsystem: camera/upload + nome page
tags: [a11y, upload, outra-pessoa, aria]
dependency_graph:
  requires: [04-01]
  provides: [OTHER-03, A11Y-01]
  affects:
    [
      src/components/camera/UploadInstructionScreen.tsx,
      src/components/camera/UploadConfirmScreen.tsx,
      src/app/ler/nome/page.tsx,
    ]
tech_stack:
  added: []
  patterns: [aria-pressed on toggle buttons, optional props for personalization]
key_files:
  created: []
  modified:
    - src/components/camera/UploadInstructionScreen.tsx
    - src/components/camera/UploadConfirmScreen.tsx
    - src/app/ler/nome/page.tsx
decisions:
  - aria-pressed is semantically correct for toggle buttons (conveys selected state to screen readers)
  - UploadConfirmScreen receives undefined targetName when isSelf=true to preserve existing behavior
  - Camera page changes were already applied by 04-01; this plan's Task 2 camera edit was a no-op
metrics:
  duration: 4m
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_changed: 3
---

# Phase 04 Plan 02: Upload Outra Pessoa + A11Y Toggles Summary

Upload screens personalize text for the other person's name; all toggles on /ler/nome have aria-label and aria-pressed for screen readers.

## What Was Built

**Task 1 — UploadInstructionScreen + UploadConfirmScreen (OTHER-03)**

- `UploadInstructionScreen`: added `targetName?: string` and `isSelf?: boolean` (default `true`). When `isSelf=false` and `targetName` provided, handPhrase becomes "Fotografe a mao {side} do {targetName}." instead of "Fotografe sua mao {side}."
- `UploadConfirmScreen`: added `targetName?: string`. CASE A phrase becomes "Tudo certo. A mao do {targetName} fala." and CASE B becomes "A mao do {targetName} esta aqui. A foto podia ser melhor." when targetName is provided. CASE C (fatal error) unchanged — it's about the technical problem, not the person.

**Task 2 — Camera page wiring + ToggleButton aria-labels (OTHER-03 + A11Y-01)**

Camera page: `targetName` and `isSelf` were already extracted and passed to upload components by plan 04-01. No code change needed — confirmed correct wiring.

Nome page:

- Added `ariaLabel?: string` prop to `ToggleButton` interface
- Added `aria-label={ariaLabel}` and `aria-pressed={selected}` to the `<button>` element
- All 8 toggle instances updated with descriptive labels:
  - Visitor flow: "Leitura para ela (feminino)", "Leitura para ele (masculino)", "Mao destra (direita)", "Mao canhota (esquerda)"
  - Logged-in flow: "Leitura para mim", "Leitura para outra pessoa", plus gender and dominant hand labels same as visitor

**A11Y-02 and A11Y-03 confirmed not regressed:**

- `WrongHandFeedback`: `aria-live="assertive"` present
- `HandExpectedBadge`: `aria-live="polite"` present
- `HandOutlineSVG`: `role="img"` and `aria-label` present

## Commits

| Task | Commit  | Description                                                          |
| ---- | ------- | -------------------------------------------------------------------- |
| 1    | 46370ec | feat(04-02): adapt upload screens to outra pessoa context (OTHER-03) |
| 2    | 2f78772 | feat(04-02): pass outra pessoa context to upload; add aria-labels    |

## Deviations from Plan

### No Code Changes Needed for Camera Page

**Found during:** Task 2
**Issue:** Plan instructed to add `targetName`/`isSelf` extractions and pass them to upload components in camera page. Plan 04-01 had already committed these exact changes in commit `573601f`.
**Fix:** Verified current state was already correct. No code change applied.
**Files modified:** None (no-op)

## Known Stubs

None.

## Self-Check: PASSED

- `src/components/camera/UploadInstructionScreen.tsx` modified with targetName/isSelf props
- `src/components/camera/UploadConfirmScreen.tsx` modified with targetName prop
- `src/app/ler/nome/page.tsx` modified with ariaLabel/aria-pressed
- Commits 46370ec and 2f78772 exist
- Build green

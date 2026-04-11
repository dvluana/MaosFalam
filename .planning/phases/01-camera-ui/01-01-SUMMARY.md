---
phase: 01-camera-ui
plan: 01
subsystem: camera-ui
tags: [camera, hand-outline, svg, framer-motion, a11y]
requires: []
provides:
  - HandOutlineSVG (src/components/camera/HandOutlineSVG.tsx)
  - HandInstructionOverlay (src/components/camera/HandInstructionOverlay.tsx)
  - HandExpectedBadge (src/components/camera/HandExpectedBadge.tsx)
affects: []
tech-stack:
  added: []
  patterns:
    - SVG palm outline with scaleX(-1) mirroring for left/right hand
    - AnimatePresence dismiss pattern for badges
    - Framer Motion fade-in on full-screen overlays
key-files:
  created:
    - src/components/camera/HandOutlineSVG.tsx
    - src/components/camera/HandInstructionOverlay.tsx
    - src/components/camera/HandExpectedBadge.tsx
  modified: []
decisions:
  - SVG drawn as right hand (thumb on viewer's left), scaleX(-1) for left hand — avoids maintaining two SVG paths
  - aria-live="polite" on HandExpectedBadge wrapper div (not motion.div) so AnimatePresence exit does not remove the live region
  - gold-dim rgba(122,104,50,0.15) for SVG stroke matches DS token --gold-dim at low opacity
metrics:
  duration: "1 minute"
  completed: "2026-04-11T16:50:54Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 0
---

# Phase 01 Plan 01: Camera UI Components Summary

Three new standalone camera UI components created for the dominant-hand instruction flow.

## One-liner

SVG palm outline with scaleX(-1) mirroring, pre-viewfinder instruction overlay, and dismissible viewfinder badge — all wired to dominantHand prop.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create HandOutlineSVG component | fd1c288 | src/components/camera/HandOutlineSVG.tsx |
| 2 | Create HandInstructionOverlay component | af2e780 | src/components/camera/HandInstructionOverlay.tsx |
| 3 | Create HandExpectedBadge component | 30bf25d | src/components/camera/HandExpectedBadge.tsx |

## What Was Built

**HandOutlineSVG** — Reusable SVG of an open palm (5 fingers, wrist, palm body). Drawn as a right hand in viewer perspective. When `dominantHand="left"`, the style transform `scaleX(-1)` mirrors it horizontally. Stroke is gold-dim at opacity 0.15. Has `role="img"` and `aria-label` per the a11y requirements in `docs/maodominante.md`.

**HandInstructionOverlay** — Full-screen black overlay rendered before the camera viewfinder opens. Centers the HandOutlineSVG above a cigana phrase in Cormorant Garamond italic. Phrase reads "Me mostra a mao direita/esquerda. Palma aberta, virada pra mim." depending on `dominantHand`. DS primary Button below calls `onReady`. Framer Motion fade-in at 0.6s.

**HandExpectedBadge** — Dismissible top-left badge shown during the live viewfinder. Displays "MAO DIREITA" or "MAO ESQUERDA" in JetBrains Mono 7px, letter-spacing 2px, gold-dim color. Branded border-radius `0 4px 0 4px`, deep background at 0.8 opacity, border gold/10. `x` dismiss button sets `dismissed=true` via useState, AnimatePresence animates the exit. `aria-live="polite"` on the wrapper for screen readers.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. These are pure presentational components with no data fetching. They receive all data via props and are ready to wire into the camera page in Plan 02.

## Self-Check: PASSED

- [x] src/components/camera/HandOutlineSVG.tsx exists
- [x] src/components/camera/HandInstructionOverlay.tsx exists
- [x] src/components/camera/HandExpectedBadge.tsx exists
- [x] Commit fd1c288 exists (HandOutlineSVG)
- [x] Commit af2e780 exists (HandInstructionOverlay)
- [x] Commit 30bf25d exists (HandExpectedBadge)
- [x] npx tsc --noEmit passes with zero errors across full project

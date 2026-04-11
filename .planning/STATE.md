---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: fluxo-mao-dominante
status: Defining requirements
stopped_at: null
last_updated: "2026-04-11"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Foto da palma entra, leitura personalizada sai.
**Current focus:** Milestone v1.2 — Fluxo de Mao Dominante

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-04-11 — Milestone v1.2 started

## Accumulated Context

### Decisions

- MediaPipe handedness assumes mirrored input (front camera labels correct, back camera swap)
- Camera traseira como default (facingMode: "environment")
- Mao errada = aviso nao bloqueio (WrongHandFeedback toast 3s)
- Upload photos NOT mirrored — MediaPipe labels are natural
- heic2any pra converter HEIC de iPhone
- Compressao client-side: max 1280px, JPEG 0.85

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-04-11
Stopped at: Milestone v1.2 initialization
Resume file: None

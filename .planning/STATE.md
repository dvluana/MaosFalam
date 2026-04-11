---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: fluxo-mao-dominante
status: Ready to plan
stopped_at: null
last_updated: "2026-04-11"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Foto da palma entra, leitura personalizada sai.
**Current focus:** Phase 1 — Camera UI

## Current Position

Phase: 1 of 4 (Camera UI)
Plan: — of — in current phase
Status: Ready to plan
Last activity: 2026-04-11 — Roadmap v1.2 criado, 4 fases, 26 requisitos mapeados

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
| ----- | ----- | ----- | -------- |
| -     | -     | -     | -        |

_Updated after each plan completion_

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
Stopped at: Roadmap criado. Proximo: /gsd:plan-phase 1
Resume file: None

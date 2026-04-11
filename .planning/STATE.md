---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Fluxo de Mao Dominante
status: Ready to execute
stopped_at: Completed 01-camera-ui-01-PLAN.md
last_updated: "2026-04-11T16:51:38.878Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Foto da palma entra, leitura personalizada sai.
**Current focus:** Phase 01 — camera-ui

## Current Position

Phase: 01 (camera-ui) — EXECUTING
Plan: 2 of 2

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
| Phase 01-camera-ui P01 | 1m | 3 tasks | 3 files |

## Accumulated Context

### Decisions

- MediaPipe handedness assumes mirrored input (front camera labels correct, back camera swap)
- Camera traseira como default (facingMode: "environment")
- Mao errada = aviso nao bloqueio (WrongHandFeedback toast 3s)
- Upload photos NOT mirrored — MediaPipe labels are natural
- heic2any pra converter HEIC de iPhone
- Compressao client-side: max 1280px, JPEG 0.85
- [Phase 01-camera-ui]: SVG drawn as right hand, scaleX(-1) for left — single path, no duplication

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-04-11T16:51:38.875Z
Stopped at: Completed 01-camera-ui-01-PLAN.md
Resume file: None

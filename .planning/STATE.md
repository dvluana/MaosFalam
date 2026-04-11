---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Fluxo de Mao Dominante
status: Ready to execute
stopped_at: Completed 03-edge-cases-prompt-03-PLAN.md
last_updated: "2026-04-11T17:22:17.810Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 8
  completed_plans: 6
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Foto da palma entra, leitura personalizada sai.
**Current focus:** Phase 03 — edge-cases-prompt

## Current Position

Phase: 03 (edge-cases-prompt) — EXECUTING
Plan: 2 of 3

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
| Phase 01-camera-ui P02 | 6m | 3 tasks | 6 files |
| Phase 02-upload-pipeline P01 | 1 | 1 tasks | 1 files |
| Phase 02-upload-pipeline P02 | 3m | 2 tasks | 3 files |
| Phase 02-upload-pipeline P03 | 2m | 2 tasks | 2 files |
| Phase 03 P03 | 5 | 2 tasks | 4 files |

## Accumulated Context

### Decisions

- MediaPipe handedness assumes mirrored input (front camera labels correct, back camera swap)
- Camera traseira como default (facingMode: "environment")
- Mao errada = aviso nao bloqueio (WrongHandFeedback toast 3s)
- Upload photos NOT mirrored — MediaPipe labels are natural
- heic2any pra converter HEIC de iPhone
- Compressao client-side: max 1280px, JPEG 0.85
- [Phase 01-camera-ui]: SVG drawn as right hand, scaleX(-1) for left — single path, no duplication
- [Phase 01-camera-ui]: Render-time rising-edge (not useEffect) drives WrongHandFeedback show state to avoid react-hooks/set-state-in-effect lint violation
- [Phase 01-camera-ui]: cameraKey counter passed to useCameraPipeline forces init effect re-run on camera switch without modifying effect deps semantics
- [Phase 01-camera-ui]: Permission denied auto-redirects to upload after 1.5s with cigana phrase instead of showing permanent error state
- [Phase 02-upload-pipeline]: Import order: camera components before ui primitives per ESLint import/order rule
- [Phase 02-upload-pipeline]: UploadInstructionScreen is pure presentation — no internal state, all via props
- [Phase 02-upload-pipeline]: MediaPipe in IMAGE runningMode inside validate() — not reusing loadHandLandmarker() which uses VIDEO mode
- [Phase 02-upload-pipeline]: MediaPipe failure gracefully skips checks 3-4-5 with canProceed=true so upload can still proceed
- [Phase 02-upload-pipeline]: uploadStep local type defined inside CameraPageInner to keep co-located with state
- [Phase 02-upload-pipeline]: handleUploadSelectedFromError kept for CameraErrorState direct-to-scan bypass (error recovery skips instruction screen)
- [Phase 03]: dominanceContext injected in user message (not system prompt) to keep OpenAI caching intact
- [Phase 03]: dominant_hand defaults to right via Zod .default() for backward compatibility

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-04-11T17:22:17.808Z
Stopped at: Completed 03-edge-cases-prompt-03-PLAN.md
Resume file: None

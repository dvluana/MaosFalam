---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Fluxo de Mao Dominante
status: Ready to execute
stopped_at: Completed 05-02-PLAN.md
last_updated: "2026-04-11T19:39:52.777Z"
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 13
  completed_plans: 11
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Foto da palma entra, leitura personalizada sai.
**Current focus:** Phase 05 — pipeline-refactor

## Current Position

Phase: 05 (pipeline-refactor) — EXECUTING
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
| Phase 03 P01 | 3m | 2 tasks | 4 files |
| Phase 03 P02 | 8m | 2 tasks | 5 files |
| Phase 04 P01 | 5m | 2 tasks | 5 files |
| Phase 04 P02 | 4m | 2 tasks | 3 files |
| Phase 05 P02 | 2m | 2 tasks | 5 files |

## Accumulated Context

### Roadmap Evolution

- Phase 5 added: Pipeline Refactor — eliminar sessionStorage pra foto, corrigir race condition scan/API, pre-hint MediaPipe pro GPT-4o

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
- [Phase 03]: heic2any for HEIC conversion — ships own .d.ts, no @types package needed
- [Phase 03]: normalizeImage runs before URL.createObjectURL — ensures preview and all checks use normalized bytes
- [Phase 03]: ScreenOrientation.lock cast to intersection type for TS compatibility (experimental API)
- [Phase 03]: Screenshot detection uses SCREENSHOT_WIDTHS Set + aspect ratio > 1.8, no new ValidationCheck
- [Phase 03]: Method switch suggestion is inline text (not toast), appears when failureCount >= 3
- [Phase 04]: isSelf=true as default preserves original behavior with zero regression
- [Phase 04]: pronoun dela/dele computed from targetGender for camera wrong-hand feedback
- [Phase 04]: aria-pressed semantically correct for toggle buttons
- [Phase 05]: elementHint injected as text in user message (not system prompt) to keep OpenAI caching intact
- [Phase 05]: element_hint optional in Zod schema with no default — purely forwarded if client provides it

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-04-11T19:39:52.775Z
Stopped at: Completed 05-02-PLAN.md
Resume file: None

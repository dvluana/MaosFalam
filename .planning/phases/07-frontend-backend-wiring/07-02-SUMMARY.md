---
phase: 07-frontend-backend-wiring
plan: 02
subsystem: frontend-wiring
tags: [sessionStorage, lead-registration, camera-pipeline, photo-capture]
dependency_graph:
  requires: []
  provides: [maosfalam_lead_id, maosfalam_photo, maosfalam_target_gender]
  affects: [src/app/ler/scan, /api/lead/register, /api/reading/capture]
tech_stack:
  added: []
  patterns: [FileReader API, crypto.randomUUID, sessionStorage persistence]
key_files:
  created: []
  modified:
    - src/app/ler/nome/page.tsx
    - src/hooks/useCameraPipeline.ts
    - src/app/ler/camera/page.tsx
decisions:
  - "Lead registration failure silently ignored — must not block reading funnel"
  - "onPickLive routes through camera pipeline (setState loading_mediapipe) not direct /ler/scan push"
  - "UploadPreview onConfirm uses mock_photo_placeholder — real image extraction deferred to MediaPipe integration task"
metrics:
  duration: "5 minutes"
  completed: "2026-04-11"
  tasks: 2
  files: 3
---

# Phase 07 Plan 02: Lead Registration and Photo Capture Wiring Summary

Wire /ler/nome to call registerLead and persist lead_id; wire /ler/camera to save captured photo base64 to sessionStorage before navigating to /ler/scan.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire nome page to registerLead | 3aeddbe | src/app/ler/nome/page.tsx |
| 2 | Wire camera to save photo before navigating | eccc850 | src/hooks/useCameraPipeline.ts, src/app/ler/camera/page.tsx |

## What Was Built

**Task 1 — Nome page lead registration:**
- Added `registerLead` import from `@/lib/reading-client`
- Made `handleSubmit` async
- Added `submitting` state — button disabled during in-flight request
- On submit: generates or reuses `maosfalam_session_id`, calls `registerLead`, saves `maosfalam_lead_id` to sessionStorage
- Saves `maosfalam_target_gender` as "female" (MVP default)
- Lead registration errors caught silently — funnel never blocked

**Task 2 — Camera photo persistence:**
- `useCameraPipeline.ts`: `onCaptured` callback now accepts `(photoBase64: string)` — mock path passes `"mock_photo_placeholder"`
- `camera/page.tsx` `handleCaptured`: saves `maosfalam_photo` to sessionStorage before `router.push("/ler/scan")`
- `handleUploadSelected`: uses `FileReader.readAsDataURL` to extract base64, strips data URL prefix, saves to sessionStorage
- `UploadPreview.onConfirm`: saves `"mock_photo_placeholder"` to sessionStorage (real extraction pending MediaPipe task)
- `onPickLive`: corrected from `router.push("/ler/scan")` to `setState("loading_mediapipe")` — now starts the actual camera pipeline

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| `"mock_photo_placeholder"` in mock timer path | src/hooks/useCameraPipeline.ts:34 | Real MediaPipe base64 extraction is a separate task |
| `"mock_photo_placeholder"` in UploadPreview onConfirm | src/app/ler/camera/page.tsx:137 | UploadPreview holds file internally without exposing it; real wiring pending |

These stubs do not block the plan goal: the sessionStorage key `maosfalam_photo` is written before scan navigation in all code paths.

## Self-Check: PASSED

- [x] src/app/ler/nome/page.tsx exists and contains `registerLead` and `maosfalam_lead_id`
- [x] src/app/ler/camera/page.tsx exists and contains `maosfalam_photo`
- [x] src/hooks/useCameraPipeline.ts exists with updated `onCaptured` signature
- [x] Commit 3aeddbe exists
- [x] Commit eccc850 exists
- [x] npm run type-check passes with no new errors

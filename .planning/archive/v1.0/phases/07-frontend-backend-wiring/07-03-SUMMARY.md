---
phase: 07-frontend-backend-wiring
plan: "03"
subsystem: reading-funnel
tags: [scan, revelacao, captureReading, sessionStorage, error-handling]
dependency_graph:
  requires: [07-01, 07-02]
  provides: [WIRE-05, WIRE-06]
  affects: [reading-funnel-end-to-end]
tech_stack:
  added: []
  patterns: [useRef-strictmode-guard, error-code-propagation]
key_files:
  created: []
  modified:
    - src/app/ler/scan/page.tsx
    - src/app/ler/revelacao/page.tsx
    - src/lib/reading-client.ts
decisions:
  - "captureReading error code propagated as 'CODE: message' prefix so callers can detect LOW_CONFIDENCE without a separate error class"
  - "Animation timer decoupled from API call — animation runs independently, API resolves async, both write to sessionStorage before timer completes in normal flow"
  - "revelacao simplified: no credits check, always routes to free result page — upsell lives inside resultado"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-04-11"
  tasks_completed: 3
  files_modified: 3
---

# Phase 07 Plan 03: Scan Page API Wiring + Revelacao Fix Summary

Scan page now calls captureReading with real sessionStorage data on mount, saving reading_id and impact_phrase. Revelacao navigates to the real reading ID and redirects to /ler/nome if the session is lost.

## Tasks Completed

| Task | Name                             | Commit  | Files                                                |
| ---- | -------------------------------- | ------- | ---------------------------------------------------- |
| 1    | Wire scan page to captureReading | 4e939c4 | src/app/ler/scan/page.tsx, src/lib/reading-client.ts |
| 2    | Fix revelacao destination        | 9dd72c9 | src/app/ler/revelacao/page.tsx                       |
| 3    | Build gate                       | —       | —                                                    |

## What Was Built

**scan/page.tsx:** Added `captureReading` call on mount with `useRef(false)` guard to prevent double-fire in React StrictMode. The API call runs independently from the 8-second animation timer. On success, writes `maosfalam_reading_id` and `maosfalam_impact_phrase` to sessionStorage. On `LOW_CONFIDENCE` error, transitions to `scan_failed_low_confidence` state which redirects to `/ler/erro?type=low_confidence`. On other errors, transitions to `scan_failed_api_error` which redirects to `/ler/erro?type=api_error`. The `?state=` dev switcher bypasses the API call entirely.

**reading-client.ts:** Updated `captureReading` error handling to include the API error code as a prefix (`CODE: message`) so callers can detect `LOW_CONFIDENCE` by string matching without needing a custom error class.

**revelacao/page.tsx:** Removed `useAuth` dependency and the credits-based routing to `/completo`. `onContinue` now reads `maosfalam_reading_id` from sessionStorage and navigates to `/ler/resultado/{id}`. If no reading_id exists (lost session), it redirects to `/ler/nome` instead.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] reading-client.ts didn't propagate LOW_CONFIDENCE error code**

- **Found during:** Task 1 implementation
- **Issue:** `captureReading` only threw `body.error` string — the `code: "LOW_CONFIDENCE"` field from the 422 response was discarded. The scan page would have treated all 422s as generic API errors, routing everything to `scan_failed_api_error` instead of the correct `scan_failed_low_confidence` path.
- **Fix:** Updated `captureReading` to include the error code as `"CODE: message"` prefix when `body.code` is present. Scan page detects `msg.includes("LOW_CONFIDENCE")` to route correctly.
- **Files modified:** src/lib/reading-client.ts
- **Commit:** 4e939c4

## Known Stubs

None — all sessionStorage values have fallbacks (empty string for photo, random UUID for session, "você" for name). The API handles these gracefully.

## Self-Check: PASSED

- src/app/ler/scan/page.tsx — modified and committed (4e939c4)
- src/app/ler/revelacao/page.tsx — modified and committed (9dd72c9)
- src/lib/reading-client.ts — modified and committed (4e939c4)
- npm run build — passes, no errors
- npm run type-check — passes
- grep captureReading in scan/page.tsx — found
- grep maosfalam_reading_id in scan/page.tsx — found (sessionStorage.setItem)
- grep useAuth in revelacao/page.tsx — not found
- grep "demo" in revelacao/page.tsx — not found

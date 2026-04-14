---
phase: 13-frontend-payment-flow
plan: 02
subsystem: payments
tags: [upsell, payment-return, completion-url, toast, webhook-retry]

# Dependency graph
requires:
  - phase: 13-frontend-payment-flow
    plan: 01
    provides: "initiatePurchase() client adapter, /creditos page with real API"
provides:
  - "UpsellSection with readingId prop and /creditos?reading={id} redirect"
  - "Payment return handling: ?paid=1 refetch+redirect, ?purchased=1 toast"
  - "Webhook race condition mitigation (3s retry on ?paid=1)"
affects: [14-email-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "Payment return via query params (?paid=1, ?purchased=1) with URL cleanup",
      "Webhook delay mitigation: single retry after 3s timeout",
      "Props-based readingId instead of window.location regex",
    ]

key-files:
  created: []
  modified:
    - src/components/reading/UpsellSection.tsx
    - src/app/ler/resultado/[id]/page.tsx
    - src/app/conta/leituras/page.tsx

key-decisions:
  - "readingId passed as prop to UpsellSection, not extracted from window.location"
  - "Webhook retry once after 3s on ?paid=1 return; if still free, show normal page with message"
  - "purchaseToastShown ref prevents duplicate toast on re-render"

patterns-established:
  - "Payment return: detect query param, handle async, clean URL via router.replace"
  - "PaymentConfirming component: centered spinner + cigana voice message"

requirements-completed: [FRONT-04, FRONT-05]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 13 Plan 02: UpsellSection + Payment Return Flow Summary

**UpsellSection wired with readingId prop redirecting to /creditos?reading={id}, payment return URLs handle ?paid=1 (refetch+redirect) and ?purchased=1 (toast)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-14T18:11:58Z
- **Completed:** 2026-04-14T18:14:13Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 3

## Accomplishments

- UpsellSection now receives readingId as prop, eliminating fragile window.location.pathname regex
- 402 (no credits) error redirects to /creditos?reading={readingId}, enabling completionUrl to return user to their reading
- /ler/resultado/[id]?paid=1 refetches reading, redirects to /completo if premium, retries once after 3s for webhook delay
- /conta/leituras?purchased=1 shows gold toast in cigana voice and cleans URL

## Task Commits

Each task was committed atomically:

1. **Task 1: Update UpsellSection with readingId prop + /creditos redirect** - `49d7f59` (feat)
2. **Task 2: Handle payment return URLs (?paid=1 and ?purchased=1)** - `ec6f0b3` (feat)
3. **Task 3: Checkpoint human-verify** - auto-approved (no commit)

## Files Created/Modified

- `src/components/reading/UpsellSection.tsx` - Added readingId prop, removed window.location regex, 402 redirects to /creditos?reading={id}
- `src/app/ler/resultado/[id]/page.tsx` - Added ?paid=1 handling with refetch, retry, PaymentConfirming component
- `src/app/conta/leituras/page.tsx` - Added ?purchased=1 toast handling with URL cleanup

## Decisions Made

- readingId passed as prop from parent page (both resultado pages have id from route params) instead of regex extraction from URL
- Webhook retry strategy: single retry after 3s, then show normal free page (not infinite polling)
- Used useRef for purchaseToastShown to prevent duplicate toast on re-render in strict mode
- PaymentConfirming is a simple centered component with spinner and cigana voice, matching existing loading patterns

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All functions are fully implemented.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full payment loop complete: UpsellSection -> /creditos -> AbacatePay -> return URL -> unlock/toast
- Phase 13 complete, ready for Phase 14 (Email & Hardening)
- 144 tests pass, build clean

## Self-Check: PASSED

- All 3 modified files verified on disk
- Both commits (49d7f59, ec6f0b3) verified in git log
- 144 tests pass
- Build passes with zero errors

---

_Phase: 13-frontend-payment-flow_
_Completed: 2026-04-14_

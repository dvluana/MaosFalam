---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Classificacao de Elemento
status: Roadmap defined, ready for Phase 16
stopped_at: Completed 17-01-PLAN.md
last_updated: "2026-04-18T05:10:48.165Z"
last_activity: 2026-04-18 — Roadmap v1.4 created
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 3
  completed_plans: 2
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-18)

**Core value:** Foto da palma entra, leitura personalizada sai. Monetizacao via creditos AbacatePay.
**Current focus:** Milestone v1.4 — Classificacao de Elemento

## Current Position

Phase: Not started
Plan: —
Status: Roadmap defined, ready for Phase 16
Last activity: 2026-04-18 — Roadmap v1.4 created

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
| Phase 05-pipeline-refactor P01 | 3m | 2 tasks | 4 files |
| Phase 05-pipeline-refactor P03 | 4m | 2 tasks | 4 files |
| Phase 06-atomic-credit-transaction P01 | 3m | 2 tasks | 7 files |
| Phase 06-atomic-credit-transaction P02 | 7m | 2 tasks | 8 files |
| Phase 07-credit-infrastructure-cleanup P01 | 2m | 2 tasks | 7 files |
| Phase 08-auth-navigation-fixes P01 | 5m | 2 tasks | 3 files |
| Phase 09-reading-flow-fixes P01 | 2m | 2 tasks | 2 files |
| Phase 10-logging-hardening P01 | 3m | 3 tasks | 13 files |
| Phase 11-codebase-cleanup P01 | 8m | 3 tasks | 7 files |
| Phase 12-abacatepay-v2-backend P01 | 5m | 2 tasks | 7 files |
| Phase 12 P02 | 4m | 2 tasks | 3 files |
| Phase 13-frontend-payment-flow P01 | 4m | 2 tasks | 5 files |
| Phase 13-frontend-payment-flow P02 | 2m | 3 tasks | 3 files |
| Phase 14 P01 | 4m | 3 tasks | 7 files |
| Phase 15-bug-fixes P01 | 7m | 3 tasks | 3 files |
| Phase 16-gpt4o-schema-image-quality P01 | 4m | 2 tasks | 6 files |
| Phase 16 P02 | 8m | 2 tasks | 10 files |
| Phase 17-mediapipe-validation-refactor P01 | 18m | 3 tasks | 5 files |

## Accumulated Context

### Roadmap Evolution

- v1.3 phases 6-11 defined 2026-04-13 from credit system audit
- v2 phases 12-15 defined 2026-04-14 from AbacatePay v2 audit + code assessment
- v1.4 phases 16-19 defined 2026-04-18 from element classification experimental session findings

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
- [Phase 05-pipeline-refactor]: photo-store uses module-level singleton — survives Next.js App Router soft navigation, type-safe, no browser storage API needed
- [Phase 05-pipeline-refactor]: captureFrame quality param defaults to 0.82 (from 0.92), reducing live-camera JPEG payload ~40%
- [Phase 05-pipeline-refactor]: scan_slow triggered at render-time rising-edge not useEffect — avoids react-hooks/set-state-in-effect lint violation
- [Phase 05-pipeline-refactor]: clearPhotoStore called immediately after getPhoto in scan — frees memory before long API call
- [Phase 06-atomic-credit-transaction]: Raw SQL with WHERE remaining > 0 for atomic credit debit — Prisma Read Committed cannot prevent read-then-write race
- [Phase 06-atomic-credit-transaction]: reading_count from /api/user/credits uses clerkUserId filter — excludes email-matched anonymous readings to prevent credit gate inflation
- [Phase 06-atomic-credit-transaction]: Server determines tier via debitCreditFIFO in capture route — client credit_used boolean removed to close security hole
- [Phase 06-atomic-credit-transaction]: scan/page.tsx stores maosfalam_reading_tier from API response; revelacao reads it instead of ReadingContext.credit_used
- [Phase 07-01]: handleCreditConfirm made synchronous — no async call, navigates directly to /ler/toque
- [Phase 07-01]: seed-credits auto-call removed from useAuth; staging credits must be seeded manually via DB
- [Phase 08-auth-navigation-fixes]: consumeCheckoutIntent called separately for OAuth (before redirect) vs email/password (after setActive)
- [Phase 08-auth-navigation-fixes]: CAPTCHA loop is Clerk Dashboard config, not code — clerk-captcha div already present
- [Phase 09-reading-flow-fixes]: reading_count from /api/user/readings response field (not array length) — excludes anonymous email-matched readings
- [Phase 09-reading-flow-fixes]: maosfalam_name sessionStorage set in all three submit paths (visitor, logged-in first, credit confirm)
- [Phase 10-logging-hardening]: pino-pretty moved to devDependencies — never bundled in production
- [Phase 10-logging-hardening]: Raw Error objects replaced with error.message strings in all logger.error calls to prevent Prisma query params and stack traces from leaking to log output
- [Phase 11-01]: CreditGate modal removed: credit debit is atomic on server (Phase 06), no client confirmation needed
- [Phase 11-01]: Clerk legacy migration deferred: @clerk/nextjs main useSignIn returns new signal API incompatible with current login/registro flow
- [Phase 12-01]: Lazy-fetch resolveProductId with Map cache — no hardcoded prod_xxx IDs, works across dev/prod
- [Phase 12-01]: Customer creation email-only in v2 — CPF gate removed from purchase route
- [Phase 12-01]: Payment created FIRST (pending), then checkout with externalId=payment.id
- [Phase 12-01]: verifyWebhookSignature uses fixed public key constant with base64 digest
- [Phase 12]: Webhook payload loosely typed (no Zod) per AbacatePay docs — fields may change
- [Phase 12]: Payment found by findUnique(id: externalId) since externalId equals payment.id primary key
- [Phase 13-01]: CPF collected inline on /creditos for first-time buyers, profile fetched on mount
- [Phase 13-01]: Removed ~300 lines fake payment UI (PIX QR, card form, method toggle)
- [Phase 13-01]: readingId passed via ?reading= URL param, not checkout-intent
- [Phase 13]: UpsellSection readingId via prop not window.location regex; webhook retry once after 3s on ?paid=1
- [Phase 14]: Opt-in gating at call sites, not inside resend.ts — pure email sender pattern
- [Phase 14]: Payment email unconditional (transactional, EMAIL-03 exception)
- [Phase 14]: svix used via transitive dependency from @clerk/nextjs — no new install
- [Phase 15-bug-fixes]: Back camera inverts MediaPipe handedness labels via mirroredRef.current
- [Phase 15-bug-fixes]: Revelacao card uses max-height: min(476px, 55dvh) for responsive sizing
- [260417-u26]: computeElementHint uses worldLandmarks (3D meters) + dist3D — no aspect ratio correction needed
- [260417-u26]: angleDeg in validateLandmarks uses WRIST→MIDDLE_MCP vector in screen-space (normalized coords)
- [260417-u26]: Camera jitter: JITTER_THRESHOLD=0.025, STABLE_FRAMES_REQUIRED=5, ELEMENT_SAMPLES_REQUIRED=8
- [Phase 16-01]: Neutral type codes A/B/C/D prevent GPT-4o element name bias; deriveElement() maps server-side
- [Phase 16-gpt4o-schema-image-quality]: element_hint removed end-to-end: GPT-4o classifies element via neutral type codes, no client override needed
- [Phase 17-01]: angleDeg computed from WRIST->MIDDLE_MCP vector vs vertical; angleConsecutiveRef resets in all failure branches; mediapipe is validation-only, GPT-4o is sole element classifier

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| #          | Description                                       | Date       | Commit  | Directory                                                                                                           |
| ---------- | ------------------------------------------------- | ---------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| 260411-p9a | Linking leituras anonimas a contas                | 2026-04-11 | e4b4feb | [260411-p9a-linking-leituras-anonimas-a-contas](./quick/260411-p9a-linking-leituras-anonimas-a-contas/)             |
| 260411-qgu | Fluxo premium completo staging                    | 2026-04-11 | a659f05 | [260411-qgu-fluxo-premium-completo-staging](./quick/260411-qgu-fluxo-premium-completo-staging/)                     |
| 260417-jfc | Fix no-free-flow-after-login + element concept UX | 2026-04-17 | e401fe6 | [260417-jfc-fix-no-free-flow-after-login-element-con](./quick/260417-jfc-fix-no-free-flow-after-login-element-con/) |
| 260417-rjx | Fix pickRandom seeded PRNG in select-blocks       | 2026-04-17 | 3721805 | [260417-rjx-fix-pickrandom-seeded-prng-in-select-blo](./quick/260417-rjx-fix-pickrandom-seeded-prng-in-select-blo/) |
| 260417-ryl | MediaPipe authoritative element classification    | 2026-04-17 | 7eeb24b | [260417-ryl-mediapipe-authoritative-element-classifi](./quick/260417-ryl-mediapipe-authoritative-element-classifi/) |
| 260417-u26 | Fix pipeline MediaPipe worldLandmarks + jitter    | 2026-04-17 | 11f5caa | [260417-u26-fix-pipeline-mediapipe-worldlandmarks-es](./quick/260417-u26-fix-pipeline-mediapipe-worldlandmarks-es/) |

## Session Continuity

Last activity: 2026-04-18 — Roadmap v1.4 created (phases 16-19)
Stopped at: Completed 17-01-PLAN.md
Resume file: None

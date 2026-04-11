# Codebase Concerns

**Analysis Date:** 2026-04-10

## Tech Debt

**MediaPipe Integration Stubbed**

- Issue: Camera pipeline is 100% timer-based simulation. No real hand detection via MediaPipe Landmarker running in browser.
- Files: `src/hooks/useCameraPipeline.ts` (lines 12-15), `src/app/ler/camera/page.tsx` (line 51)
- Impact: Camera states transition deterministically in 7.5s regardless of hand presence/position. Users can pass camera with no hand in frame. Fallback upload is mock (no real storage upload).
- Fix approach: Integrate `@mediapipe/tasks-vision` in `useCameraPipeline`, replace timers with landmark detection loop (21 points, validation thresholds for palm open/stable/centered), send real photo base64 to API.

**Backend Vision API Not Implemented**

- Issue: `/api/reading/capture` calls `analyzeHand()` which posts to OpenAI GPT-4o, but this is never actually sent in development. Mock system returns hardcoded attributes.
- Files: `src/server/lib/openai.ts`, `src/app/api/reading/capture/route.ts` (line 36)
- Impact: Cannot validate if photo-to-attributes pipeline works. Confidence filtering (line 39-50) never exercises the < 0.3 rejection path.
- Fix approach: Replace mock with real OpenAI integration once API key available. Add confidence-based error states to error page. Set up test fixtures for various hand attributes.

**Credit Debit Logic Not Wired**

- Issue: Reading reports show tier as `free` by default (`src/app/api/reading/capture/route.ts` line 70). Tier upgrade happens via payment webhook, but debit from credit packs is never called. Credit packs are 100% mock.
- Files: `src/server/lib/abacatepay.ts`, `src/app/api/credits/purchase/route.ts`, `src/app/api/webhook/abacatepay/route.ts`
- Impact: Users don't actually lose credits when making readings. Paid readings may be generated multiple times by same user without consuming balance.
- Fix approach: On `reading/capture`, check `clerk_user_id` and available credits. Debit FIFO before writing reading with `tier: 'premium'`. Add idempotency key to webhook handler.

**Rate Limiting Uses In-Memory Store**

- Issue: Rate limiter in `src/server/lib/rate-limit.ts` is a simple Map in process memory. Dies on server restart. No persistence, no distribution across instances.
- Files: `src/server/lib/rate-limit.ts`
- Impact: On Vercel (serverless), every request hits a new process. Rate limiting is essentially non-existent. Attackers can script photo uploads at will (each upload costs ~$0.07 GPT-4o credits).
- Fix approach: Migrate to Upstash Redis (free tier: 10K requests/day, shared state across instances). Wrap in try-catch to fail open if Redis unavailable.

**Session Storage Flags Not Secure**

- Issue: Navigation gates use `sessionStorage` flags like `maosfalam_name_fresh` and `maosfalam_pending_reading`. Client can delete/modify these directly.
- Files: `src/app/ler/camera/page.tsx` (line 28), `src/lib/checkout-intent.ts` (line 43)
- Impact: Users can skip `/ler/nome` name collection. Can fake pending reading state and access wrong result. Analytics and lead data collection compromised.
- Fix approach: Move gates to HTTP-only session cookies via Clerk. Use signed JWTs for state tokens instead of plain sessionStorage.

## Known Bugs

**Name Gate Double-Run in StrictMode**

- Symptoms: In development, `/ler/nome` renders twice due to React StrictMode. useRef guard prevents crashes but sets flag twice unnecessarily.
- Files: `src/app/ler/nome/page.tsx` (guard present via `useRef`)
- Trigger: `npm run dev`, navigate to `/ler/nome`
- Workaround: Works correctly in production (StrictMode disabled). No user-facing impact currently.

**Console.error in Global Error Boundary**

- Symptoms: ESLint rule `no-console: error` is disabled in development error.tsx.
- Files: `src/app/error.tsx` (line 16), `src/app/ler/error.tsx` (line 16)
- Trigger: Any unhandled component error in development
- Workaround: Error boundary works correctly. Comment justifies development-only logging.

**Upload State Not Persisted**

- Symptoms: File upload in `/ler/camera` doesn't validate file type, size, or orientation. Mock directly transitions to `/ler/scan` without confirming upload succeeded.
- Files: `src/app/ler/camera/page.tsx` (lines 48-61)
- Trigger: Select any file in upload fallback
- Workaround: No validation means image too large/wrong format/upside-down won't be caught until server (if ever). Needs client-side validation + preview before confirm.

**Login Modal Missing Fallback**

- Symptoms: `/creditos` requires login via modal, but modal has 2 paths: Google OAuth (calls Clerk) or email/password (was removed). If Clerk OAuth fails, no fallback.
- Files: `src/components/account/BuyCreditsModal.tsx` (lines ~200+)
- Trigger: Try to buy credits without being logged in, OAuth fails
- Workaround: User bounces back to `/creditos` without clear error message.

## Security Considerations

**Prisma Client Exposed to Browser**

- Risk: Generated Prisma types live in `src/generated/prisma/` and are committed to git. If someone gains access to repo, they can reverse-engineer database schema.
- Files: `src/generated/prisma/` (auto-generated, ~2000 lines)
- Current mitigation: None. Prisma client isn't exposed to client-side code (good), but types are visible.
- Recommendations: Keep schema private (don't commit generated types if sensitive). Regenerate before each deploy. Consider using shorter type names in production.

**Photo Base64 Sent to OpenAI**

- Risk: Palm photos are sent to OpenAI API (external service) for analysis. Photo is base64-encoded in request body, appears in OpenAI logs.
- Files: `src/server/lib/openai.ts`, `src/app/api/reading/capture/route.ts` (line 36)
- Current mitigation: Photos are not stored in database (good). OpenAI respects data privacy per terms of service.
- Recommendations: Add explicit user consent flow before sending photo. Option to process locally (edge compute) in future. Document data flow in privacy policy.

**Webhook Signature Validation Insufficient**

- Risk: AbacatePay webhook handler must validate signatures, but implementation may skip validation if AbacatePay not integrated yet.
- Files: `src/app/api/webhook/abacatepay/route.ts`
- Current mitigation: None detected in implementation.
- Recommendations: Verify HMAC-SHA256 signature on every webhook. Reject unsigned requests with 401. Log all rejections.

**Clerk Secrets Not Rotated**

- Risk: `CLERK_SECRET_KEY` stored in `.env.local`. If laptop compromised, attacker can impersonate users.
- Files: Not in repo (good), but project instructions reference it.
- Current mitigation: `.env.local` in `.gitignore`. Clerk allows key rotation.
- Recommendations: Rotate keys quarterly. Use different keys per environment (dev/staging/prod). Monitor Clerk audit logs for suspicious activity.

**No CSRF Protection**

- Risk: State-changing mutations (payments, deletes) via POST/DELETE lack CSRF tokens.
- Files: All API routes in `src/app/api/`
- Current mitigation: None detected. Clerk handles authentication but not CSRF.
- Recommendations: Add SameSite=Strict cookies. Use double-submit pattern (token in body + header). Verify Origin header matches NEXT_PUBLIC_BASE_URL.

## Performance Bottlenecks

**ElementGlyph Renders Large SVG Filters**

- Problem: `src/components/reading/ElementGlyph.tsx` is 468 lines. Defines 4 complete gradient/pattern sets (fire, water, earth, air) on every render. Uses drop-shadow filters.
- Files: `src/components/reading/ElementGlyph.tsx`
- Cause: Gradients/patterns duplicated per instance. No memoization. Filters re-computed on every frame.
- Improvement path: Extract gradients to global `<svg><defs>` in layout. Memoize with React.memo. Use CSS filters instead of SVG for simpler effects. Profile animation performance on low-end device (iPhone SE 2).

**CompatibilityGlyph and ElementAtmosphere Similar Issue**

- Problem: `src/components/reading/CompatibilityGlyph.tsx` (383 lines) and `src/components/reading/ElementAtmosphere.tsx` (291 lines) also define large SVG defs inline.
- Files: Listed above
- Cause: Multiple animated SVGs on `/ler/resultado/[id]/completo` page render simultaneously (ElementGlyph + ElementAtmosphere + LineGlyph + RareSignGlyph + CompatibilityGlyph + CrossingGlyph). Mobile reflow on each animation frame.
- Improvement path: Lazy load glyphs below fold. Use `will-change: transform` to hint browser. Consider Canvas for ElementAtmosphere instead of SVG. Measure FCP/LCP with `next/image` optimization.

**Framer Motion Drag on Tarot Cards**

- Problem: `/tarot` page renders 22 draggable TarotCard components with spring physics + flip animations. On low-end Android, 60fps drops to 30fps.
- Files: `src/components/tarot/TarotCard.tsx`, `src/app/tarot/page.tsx`
- Cause: Framer Motion's layout animations + 3D transforms + drag listeners on many elements. No frame rate detection.
- Improvement path: Disable drag animations on devices with `prefers-reduced-motion`. Use lighter spring config. Consider removing drag on mobile (<640px), use buttons instead. Profile with Chrome DevTools Performance.

**Bundle Size Unknown**

- Problem: No analysis of Next.js bundle split. `npm run build` succeeds but output size unknown.
- Files: Entire codebase
- Cause: No dynamic imports. All components imported at top level. Landing hero animates 5 concurrent effects.
- Improvement path: Run `npm run build` and check `.next/static/chunks/` directory sizes. Add `@next/bundle-analyzer`. Target < 200KB JS per route. Lazy-load landing animations.

## Fragile Areas

**Select Blocks Engine Has No Fallback**

- Files: `src/server/lib/select-blocks.ts`
- Why fragile: Calls `HEART_BLOCKS[variation]`, `HEAD_BLOCKS[variation]`, etc. If API returns unknown `variation` (e.g., typo in GPT-4o response), engine throws "Bloco não encontrado". No graceful degradation.
- Safe modification: Add try-catch around block lookups. Return generic fallback block ("Suas linhas falam. Eu ouço.") if variation missing. Log to Sentry.
- Test coverage: Zero tests. Needs fixtures for all 50+ variations and edge cases (missing fields, confidence = 0.5, etc).

**Camera Permission Logic Mock-Only**

- Files: `src/app/ler/camera/page.tsx`, `src/types/camera.ts` (CamState enum)
- Why fragile: States like `camera_permission_denied` and `camera_permission_denied_permanent` are defined but never triggered. Real `navigator.mediaDevices.getUserMedia()` never called. No fallback for HTTPS-only requirement (localhost works, production must be HTTPS or camera fails silently).
- Safe modification: Wrap camera setup in try-catch. Detect error type (PermissionDenied vs NotFoundError vs NotAllowedError). Route to correct error state. Add platform-specific instructions (iOS: Safari settings; Android: app settings).
- Test coverage: Manual testing on real device required.

**useMock Hook Fallback Chain Unclear**

- Files: `src/hooks/useMock.ts` (lines 28-37)
- Why fragile: In dev, always returns mock. In production, calls `realFetcher` if provided, else falls back to mock. No clear indication which path is active. Dev vs prod behavior differs.
- Safe modification: Add `process.env.NEXT_PUBLIC_MOCK_MODE` flag to override in production (for demos). Log which path was taken. Fail visibly if mock missing and no fetcher.
- Test coverage: Unit tests for both branches (dev + prod, fetcher present/absent).

**Tier Guard in Revelacao Assumes mockUser Exists**

- Files: `src/app/ler/revelacao/page.tsx` (lines 72)
- Why fragile: Checks `mockUser.credits > 0` to decide free vs premium. If useAuth fails to return user, guard breaks. Fallback not documented.
- Safe modification: Verify useAuth hydrated before checking credits. Add loading state. Default to free tier if auth missing (safe fallback). Add error boundary.
- Test coverage: Test auth hydration failure, network error during fetch, stale session.

**No Error Boundary Between Reading Sections**

- Files: All reading display components under `src/components/reading/`
- Why fragile: One glyph component crashes → whole page fails. No section-level error boundaries.
- Safe modification: Wrap each ReadingSection with `<ErrorBoundary>`. Return placeholder glyph on error ("Essa marca é invisível hoje.").
- Test coverage: Force component errors and verify boundary catches them.

## Scaling Limits

**In-Memory Rate Limit Store on Vercel**

- Current capacity: ~1000 tracked IPs × 5 requests/hour = 5000 per instance. Each instance has fresh state.
- Limit: Serverless = new process per request. Rate limiting is ineffective.
- Scaling path: Switch to Upstash Redis (1GB = 100M requests) or Cloudflare Workers KV. Wrap in retry logic.

**Database Connection Pool on Neon**

- Current: Prisma default pool = 1 connection per worker. Neon serverless allows 20 idle connections.
- Limit: If app scales to 100 concurrent users, connection pool exhausted. Queries queue.
- Scaling path: Enable connection pooling via Prisma accelerate (add `@prisma/extension-accelerate`). Or migrate to HTTP API (`@neondatabase/serverless`).

**OpenAI API Rate Limits**

- Current: Each photo = 1 call to GPT-4o vision. Cost ~$0.07 per call.
- Limit: If viral, 1000 photos/day = $70/day. API rate limit is 1000 requests/min (should be fine), but billing grows.
- Scaling path: Cache attribute responses by image hash (MD5). Build local vision model (Mediapipe Hand Pose + ML.NET). Batch requests to OpenAI if async processing acceptable.

**Email Sending via Resend**

- Current: Sendgrid equivalent. Free tier = 100 emails/month.
- Limit: If 1000 signups/month, quota exhausted at 10%.
- Scaling path: Upgrade Resend plan ($20/month = 10K emails). Or switch to SES for higher volume.

**Photos Stored in Browser Memory Only**

- Current: Base64 photo kept in state during capture. No disk persistence.
- Limit: On low-end phone (<2GB RAM), large photo stalls page. Multiple photo uploads in sequence = memory leak.
- Scaling path: Use File Blob API directly. Stream to API endpoint. Add progress bar for upload.

## Dependencies at Risk

**Clerk SDK Major Version Dependency**

- Risk: Using `@clerk/nextjs` ^7.0.12. Clerk releases major versions yearly. Breaking changes in session format, OAuth flow, etc.
- Impact: Auto-upgrades to next major (v8) could break authentication in production.
- Migration plan: Lock to exact version (remove ^). Test before upgrading. Review Clerk release notes for breaking changes. Have fallback email/password auth ready.

**Prisma at 7.7.0 (Recent Release)**

- Risk: Prisma 7.x is new. May have edge case bugs. Migration from 6.x → 7.x broke some apps.
- Impact: Unknown bugs in generated client. Neon adapter might not handle edge cases (connection timeouts, etc).
- Migration plan: Monitor Prisma GitHub issues. Keep adapter and client in sync. Test database failover scenarios.

**Framer Motion Version Drift**

- Risk: Using ^12.38.0. Framer Motion 12 introduced breaking animation changes. Version 13 may further diverge.
- Impact: Animation keyframes might not work in future versions. Heavy reliance on Framer Motion (tarot cards, reading glyphs) makes migration costly.
- Migration plan: Lock to exact version until stable (12.38.0). Or embrace version updates and test animations thoroughly before deploying.

**Tailwind V4 Early Adoption**

- Risk: Using @tailwindcss/postcss ^4 (v4 released late 2024). v3 was stable. v4 may have regressions.
- Impact: Custom theme variables (@theme) might not work perfectly across browsers. Next.js v16 compatibility unknown.
- Migration plan: Test CSS output with `npm run build`. Validate custom colors render correctly (check gold, rose, violet). Keep v3 fallbacks in CSS.

## Missing Critical Features

**Media Query Breakpoint Testing**

- Problem: Designed for 375-768px (mobile). Untested on ≥ 1024px (desktop/tablet).
- Blocks: `/tarot` deck layout, `/completo` grid layouts, landing hamburger menu behavior
- Recommendation: Test on iPad (768px), desktop (1440px). Add 2-column layouts for desktop. Verify text doesn't exceed 80 chars per line.

**Offline Fallback Incomplete**

- Problem: `src/components/ui/OfflineDetector.tsx` shows "Até a cigana precisa de sinal..." but no retry mechanism. User stuck on offline page.
- Blocks: Any API call fails silently without indication that it's due to offline status.
- Recommendation: Use service worker to cache critical pages. Add retry button to offline detector. Sync queued actions when back online.

**Analytics Not Instrumented**

- Problem: No tracking of funnel stages. Cannot measure: landing → /ler/nome conversion, camera success rate, payment completion rate.
- Blocks: Product decisions blind. No data on which element is most common, which sections read most.
- Recommendation: Add Segment or Mixpanel tracking. Log events: "started_reading", "camera_capture_success", "payment_initiated", "payment_completed". No PII in events.

**A11y Audit Incomplete**

- Problem: Added focus states and aria labels (2026-04-10 commit). But no contrast audit, no keyboard navigation test, no screen reader test.
- Blocks: Could fail WCAG 2.1 AA on colors (ember on black = low contrast?). Keyboard-only users can't navigate carousel (tarot deck, credit packs).
- Recommendation: Run axe DevTools. Test with NVDA/VoiceOver. Ensure all interactive elements are keyboard accessible.

## Test Coverage Gaps

**No E2E Tests for Critical Paths**

- What's not tested: Visitor landing → /ler/nome → /ler/camera → /ler/scan → /ler/resultado/[id] (free tier), payment flow, share link expiration
- Files: `src/**/*` — zero Playwright specs
- Risk: Regression in funel breaks after deploy. Share links might 404 silently.
- Priority: HIGH. Write Playwright specs for:
  1. Happy path: landing → free reading → share → public link → CTA to own reading
  2. Payment path: /creditos → payment modal → success → /completo
  3. Error path: low confidence → error page → retry

**Component Testing Minimal**

- What's not tested: Button click variants, Input validation, Card states (active, disabled, hover), Toast visibility, ErrorBoundary catch
- Files: Only `src/components/ui/Button.test.tsx` (19 lines)
- Risk: UI regressions. Changed Button API silently breaks forms.
- Priority: MEDIUM. Add tests for:
  - Button: all variants × all sizes × disabled state
  - Input: label, placeholder, error state, validation
  - Card: accent color rendering, border ornaments
  - Toast: lifecycle (appear → 3s → disappear)

**Reading Logic Tests Absent**

- What's not tested: selectBlocks() for all 4 elements, gender substitution in {{inteira}}/{{inteiro}}, variation selection randomization, confidence filtering (< 0.3)
- Files: `src/server/lib/select-blocks.ts` — zero tests
- Risk: Silent report generation bugs. User gets 404 or generic fallback without noticing.
- Priority: HIGH. Add unit tests with fixtures:
  - Input: fire/water/earth/air × 50+ variations
  - Output: validate all sections present, no missing keys, correct tier
  - Edge cases: confidence = 0.2 (should reject), missing variation (should fallback)

**API Route Tests Missing**

- What's not tested: /api/reading/capture rate limiting, Zod validation, webhook idempotency, payment webhook state transition
- Files: All `src/app/api/**/*.ts` — zero tests
- Risk: Invalid requests crash server. Duplicate webhooks double-charge.
- Priority: HIGH. Add integration tests:
  - Rate limit: 6 requests in quick succession → 429
  - Zod parse: invalid UUID → 400, missing fields → 400
  - Webhook: same billing_id twice → second ignored

---

_Concerns audit: 2026-04-10_

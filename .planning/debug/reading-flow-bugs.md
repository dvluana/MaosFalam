---
status: awaiting_human_verify
trigger: "3 related bugs: wrong name in reading for another person, credit debited but free tier, no redirect to premium view"
created: 2026-04-11T00:00:00Z
updated: 2026-04-11T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — 3 root causes identified
test: All files in chain read and traced
expecting: Fixes applied and verified
next_action: Apply fixes to all 3 bugs in one coherent change

## Symptoms

expected: (1) Reading for another person uses their name in {{name}}. (2) Credit-debited reading is born as premium tier. (3) Result redirects to /completo for premium readings.
actual: (1) Reading shows account owner's name instead of target's. (2) Reading created as free despite credit debit. (3) Result shows free view with paywall.
errors: No runtime errors — logic bugs in data flow
reproduction: Log in with credits → /ler/nome → "Pra outra pessoa" → type name → complete flow → see wrong name + free tier
started: Unknown — likely since feature was built

## Eliminated

## Evidence

- timestamp: 2026-04-11T00:10:00Z
  checked: /ler/nome/page.tsx — logged-in submit flows (handleLoggedInSubmit + handleCreditConfirm)
  found: Neither function sets legacy sessionStorage keys (maosfalam_name, maosfalam_name_fresh, maosfalam_target_gender). Only the visitor flow (handleVisitorSubmit) sets them.
  implication: Logged-in flow relies on stale keys from prior visitor session. Toque/camera guards redirect if no prior session exists.

- timestamp: 2026-04-11T00:11:00Z
  checked: /ler/scan/page.tsx — captureReading call (line 66-75)
  found: Scan page reads credit_used from ReadingContext (ctx?.credit_used) but NEVER passes it to captureReading(). The field is simply omitted from the payload.
  implication: API receives credit_used=false (Zod default) and creates tier="free" even when credit was debited.

- timestamp: 2026-04-11T00:12:00Z
  checked: /ler/revelacao/page.tsx — personalize function (line 28)
  found: Reads maosfalam_name (legacy key) instead of ReadingContext.target_name for impact phrase personalization.
  implication: Shows stale name (account owner) instead of target's name for "pra outra pessoa" readings.

- timestamp: 2026-04-11T00:13:00Z
  checked: /ler/revelacao/page.tsx — onContinue (line 69)
  found: Always navigates to /ler/resultado/{id} (free view). Never checks if reading is premium to route to /completo.
  implication: Premium readings show free view with paywall despite credit being debited.

- timestamp: 2026-04-11T00:14:00Z
  checked: /api/reading/capture/route.ts — tier logic (line 66)
  found: tier = clerkUserId && data.credit_used ? "premium" : "free" — logic is correct IF credit_used reaches the API.
  implication: The API-side logic is fine. The bug is client-side (scan page not sending credit_used).

## Resolution

root_cause: |
Bug 1: Logged-in flow in /ler/nome does NOT set legacy sessionStorage keys (maosfalam_name, maosfalam_name_fresh).
Revelacao reads stale maosfalam_name for personalization instead of ReadingContext.
Bug 2: Scan page omits credit_used from captureReading() payload. API defaults to free tier.
Bug 3: Revelacao always navigates to /ler/resultado/[id] (free view), never to /completo for premium.
fix: |

1. /ler/nome: Add legacy sessionStorage key writes to both logged-in submit flows (handleLoggedInSubmit + handleCreditConfirm)
2. /ler/scan: Pass credit_used from ReadingContext to captureReading()
3. /ler/revelacao: Read name from ReadingContext instead of legacy key. Navigate to /completo when credit_used.
   verification: Build, type-check, and lint all pass. Needs manual E2E verification.
   files_changed:

- src/app/ler/nome/page.tsx
- src/app/ler/scan/page.tsx
- src/app/ler/revelacao/page.tsx

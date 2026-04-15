---
status: awaiting_human_verify
trigger: "Multiple payment flow bugs: webhook 404, CPF not saved, toast repeat/position, favicon/title"
created: 2026-04-14T00:00:00Z
updated: 2026-04-14T00:05:00Z
---

## Current Focus

hypothesis: All 5 bugs addressed — fixes applied and verified via build+test+lint+type-check
test: Human verification on staging
expecting: All bugs resolved on real staging environment
next_action: Wait for human confirmation

## Symptoms

expected: After paying on AbacatePay checkout, webhook processes, credits appear, CPF saved, toast shows once at top
actual:

1. Webhook returns 404 when AbacatePay sends it (works on manual replay)
2. CPF entered in modal never saved to user_profiles (still null)
3. Toast ?purchased=1 fires on every page reload
4. Toast at bottom, not top with overlay
5. Tab favicon and title not updated for staging
   errors: Webhook 404, CPF null in DB despite being entered
   reproduction: User makes purchase on staging.maosfalam.com, pays via AbacatePay sandbox, returns to app
   started: v2 implementation, never worked end-to-end via real AbacatePay webhook

## Eliminated

## Evidence

- timestamp: 2026-04-14T00:01:00Z
  checked: Webhook route code analysis
  found: Webhook returns 404 when payment lookup fails (not a routing 404). The webhook IS reachable. The lookup uses externalId (our payment UUID) and fallback checkoutId. If AbacatePay doesn't echo back externalId or uses a different field name, both lookups fail.
  implication: Added comprehensive payload logging + amount-based fallback to catch payments even when ID lookup fails.

- timestamp: 2026-04-14T00:01:00Z
  checked: CPF save logic in purchase route
  found: CPF save was coupled to the needsNewCustomer condition. If AbacatePay createCustomer threw an error, the entire update (including CPF) would be skipped. Also, the needsNewCustomer condition was overly complex. Fix: save CPF immediately as a separate step BEFORE customer creation.
  implication: Decoupled CPF persistence from AbacatePay API call success.

- timestamp: 2026-04-14T00:01:00Z
  checked: Toast purchased=1 in leituras page
  found: Used router.replace() which is async and may not clean URL before page re-renders or user refreshes mid-replace. Fix: use window.history.replaceState() for immediate synchronous URL cleanup.
  implication: URL param removed immediately, no race condition with re-renders.

- timestamp: 2026-04-14T00:01:00Z
  checked: ToastProvider positioning
  found: Toasts positioned at bottom-6. Fix: moved to top-6, added backdrop overlay, changed animation direction to slide from top.
  implication: Toast now appears at top with semi-transparent overlay.

- timestamp: 2026-04-14T00:01:00Z
  checked: Staging favicon and title
  found: Favicon fill was #E67E22 (orange). Title format was "ENV_LABEL . MaosFalam". Fix: changed fill to #7B6BA5 (violet), title format to "ENV_LABEL - MF".
  implication: Favicon is now violet. Title will show "Staging - MF" when Vercel ENV_LABEL is set to "Staging".

## Resolution

root_cause: 5 independent bugs:

1. Webhook 404: Payment lookup fails because AbacatePay may not echo externalId in webhook payload. Added diagnostic logging + amount-based fallback.
2. CPF not saved: CPF persistence was coupled to AbacatePay customer creation success. If createCustomer failed, CPF was never saved.
3. Toast repeat: router.replace() is async — URL param could survive page re-renders. Replaced with synchronous window.history.replaceState().
4. Toast position: hardcoded bottom-6 instead of top-6, no overlay.
5. Favicon: orange (#E67E22) instead of violet (#7B6BA5), title format wrong.

fix: Applied all 5 fixes. Build, test (161/161), lint, and type-check all pass.

verification: Automated checks pass. Needs human verification on staging.

files_changed:

- src/app/api/webhook/abacatepay/route.ts
- src/app/api/credits/purchase/route.ts
- src/app/conta/leituras/page.tsx
- src/components/ui/ToastProvider.tsx
- src/app/layout.tsx
- public/icons/favicon-staging.svg

---
status: diagnosed
trigger: "Usuários logados não encontram opção para realizar leitura gratuita. Apenas opções pagas são exibidas."
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — handleLoggedInSubmit redirects straight to /creditos when balance=0 and reading_count>0, instead of showing the two-button state ("Leitura free" / "Comprar créditos") defined in screens.md
test: Read all code in the logged-in submit path and compared to spec
expecting: screens.md no_credits state requires two buttons; code has none
next_action: ROOT CAUSE FOUND — diagnosis complete

## Symptoms

<!-- Written during gathering, then IMMUTABLE -->

expected: Após login, o usuário deve ter acesso à leitura gratuita (se elegível), ou visualizar claramente o status do uso free (já utilizado / disponível)
actual: Usuários logados só veem opções pagas, sem caminho para leitura gratuita
errors: None
reproduction: Login na plataforma → tentar fazer nova leitura → só opções pagas aparecem
started: Unknown - may have always been this way

## Eliminated

- hypothesis: Middleware/proxy blocks the /ler/nome route for logged-in users
  evidence: src/proxy.ts only protects /api/credits/_, /api/user/_, /conta/\* — /ler/nome is fully accessible
  timestamp: 2026-04-17

- hypothesis: The capture API forces premium tier for logged-in users regardless of credits
  evidence: capture/route.ts lines 66-74: if no credit exists, debit returns {debited: false} and tier stays "free". Capture itself is not the problem.
  timestamp: 2026-04-17

- hypothesis: reading_count is incorrectly inflated (counting anonymous readings via email match)
  evidence: /api/user/readings route.ts line 66: reading_count = claimedReadings.length (only readings where clerkUserId is set). Anonymous readings matched by email are excluded from count. This is correct by design (CREDIT-07).
  timestamp: 2026-04-17

## Evidence

- timestamp: 2026-04-17
  checked: src/app/ler/nome/page.tsx handleLoggedInSubmit (lines 142-190)
  found: |
  When reading_count === 0 → free path (correct).
  When reading_count > 0 AND balance === 0 → router.push("/creditos") immediately (line 171).
  When reading_count > 0 AND balance > 0 → proceeds to camera (correct).
  implication: The no_credits state defined in screens.md is never rendered. The user has no choice — they are redirected to /creditos with no "Leitura free" option.

- timestamp: 2026-04-17
  checked: docs/screens.md - /ler/nome "no_credits" state definition
  found: |
  "no_credits: se saldo = 0, 'Você precisa de créditos pra uma leitura completa. A free ainda é sua.'
  - botões: 'Leitura free' / 'Comprar créditos'"
    implication: The spec explicitly requires a "Leitura free" button option even when balance = 0 and reading_count > 0. This means the free reading should always be accessible for ANY logged-in user regardless of credit balance.

- timestamp: 2026-04-17
  checked: src/app/ler/nome/page.tsx JSX — logged-in form render (lines 433-531)
  found: The form renders with only a single "Continuar" submit button. There is no conditional render for a no_credits state, no two-button layout, and no "Leitura free" option anywhere in the component.
  implication: The no_credits UI state from screens.md was never implemented.

- timestamp: 2026-04-17
  checked: src/app/api/reading/capture/route.ts (lines 66-74)
  found: |
  Tier is determined server-side atomically: if logged in AND has credits, debit fires automatically.
  If logged in with 0 credits, tier defaults to "free".
  The capture route does NOT prevent free readings for logged-in users.
  implication: The backend correctly handles free readings for logged-in users with 0 credits. The block is entirely in the frontend at /ler/nome.

- timestamp: 2026-04-17
  checked: src/hooks/useCredits.ts fetchCredits function
  found: |
  reading_count is read from /api/user/readings response (not /api/user/credits which also returns reading_count).
  The two endpoints return the same value for reading_count — both are credit_07 compliant.
  implication: reading_count is reliable. The gating logic on this value in nome/page.tsx is the right place to fix.

## Resolution

root_cause: |
In src/app/ler/nome/page.tsx, handleLoggedInSubmit (line 169-173), when a logged-in user
has reading_count > 0 AND balance === 0, the code unconditionally redirects to /creditos:

    if (balance === 0) {
      router.push("/creditos");
      return;
    }

This discards the "Leitura free" path entirely. The screens.md spec (no_credits state) requires
that even users with 0 credits can still start a free reading — they should see two options:
"Leitura free" and "Comprar créditos". The free path bypasses the credit gate (same as reading_count === 0).

The no_credits UI state (two-button layout) was never implemented in the JSX. The form only has
a single "Continuar" button that always hits handleLoggedInSubmit, which redirects to /creditos
before the user can proceed.

fix: |
Two changes needed in src/app/ler/nome/page.tsx:

1. In handleLoggedInSubmit: when balance === 0 AND reading_count > 0, do NOT redirect to /creditos.
   Instead, set a local state flag (e.g. showNoCreditsBifurcation = true) to trigger the two-button UI.

2. Add the no_credits UI state to the JSX: when showNoCreditsBifurcation is true, replace the
   single "Continuar" button with:
   - "Leitura free" button → same logic as reading_count === 0 path (proceeds to /ler/toque)
   - "Comprar créditos" button → router.push("/creditos")
     Plus the cigana message: "Você precisa de créditos pra uma leitura completa. A free ainda é sua."

Note: The backend (capture/route.ts) already handles this correctly — a logged-in user with 0
credits gets tier="free" automatically. No server changes needed.

verification:
files_changed:

- src/app/ler/nome/page.tsx

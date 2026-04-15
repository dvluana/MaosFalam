---
status: awaiting_human_verify
trigger: "API /api/credits/purchase returns 404 on staging + /creditos page UX simplification"
created: 2026-04-14T19:30:00Z
updated: 2026-04-14T19:30:00Z
---

## Current Focus

hypothesis: Issue 1 — Clerk auth.protect() redirects API routes to sign-in page (307) instead of returning 401 JSON. On staging, curl without auth follows redirect to Clerk hosted sign-in, which bounces back to app 404.
test: Fixed proxy.ts to return 401 JSON for API routes, verified locally
expecting: API returns 401 JSON for unauthenticated requests, works normally when authenticated
next_action: Fix proxy.ts for API routes + rewrite /creditos page UX

## Symptoms

expected:

1. POST /api/credits/purchase on staging returns JSON {checkout_url} (requires Clerk auth)
2. /creditos page: clicking a pack card should redirect directly to AbacatePay checkout

actual:

1. curl to staging /api/credits/purchase returns 404 HTML page
2. /creditos has two-step flow: click card scrolls to separate payment section

errors: API returns 307 redirect to Clerk sign-in, which manifests as 404 HTML on staging

reproduction: curl -X POST staging/api/credits/purchase without auth token

started: Never worked on staging — first deploy of Phase 12/13

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-04-14T19:28:00Z
  checked: Build output for /api/credits/purchase
  found: Route compiles and is listed in build output as dynamic route
  implication: Route file is correct, not a deployment issue

- timestamp: 2026-04-14T19:29:00Z
  checked: Local prod server curl without auth
  found: Returns 307 redirect to Clerk sign-in page (x-clerk-auth-reason: dev-browser-missing)
  implication: Clerk auth.protect() does redirect instead of 401 for API routes. This is the root cause of the 404 on staging.

- timestamp: 2026-04-14T19:29:30Z
  checked: src/proxy.ts middleware config
  found: isProtectedRoute matches /api/credits/(.\*) and calls auth.protect() which triggers redirect
  implication: Need to return 401 JSON for API routes instead of redirect

## Resolution

root_cause:
Issue 1: Clerk middleware auth.protect() redirects unauthenticated API requests (307) to Clerk sign-in page. On staging, this manifests as 404 HTML because the redirect chain resolves to the app's 404 page.
Issue 2: UX design — /creditos has unnecessary two-step flow (card click scrolls to payment section).

fix:
Issue 1: Update proxy.ts to return 401 JSON for API routes instead of redirect
Issue 2: Rewrite /creditos to inline purchase flow in each card

verification: |

- Build succeeds with zero errors
- Lint and type-check pass
- Local prod server: POST /api/credits/purchase without auth returns 401 JSON {"error":"Nao autenticado"}
- /creditos page: removed #pagamento section, "Escolher" button now inline in each card
- Login modal still works for unauthenticated users
- CPF field appears inside card for first-time buyers
  files_changed:
- src/proxy.ts
- src/app/creditos/page.tsx

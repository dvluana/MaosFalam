---
status: awaiting_human_verify
trigger: "POST /api/credits/purchase returns 500 on Vercel staging when authenticated"
created: 2026-04-14T21:00:00Z
updated: 2026-04-14T21:05:00Z
---

## Current Focus

hypothesis: The 500 was caused by missing ABACATEPAY_API_KEY on Vercel Preview env. The key was only added ~1 hour ago. Before that, every AbacatePay call sent "Bearer undefined" and got rejected. The route caught the error but Vercel logs truncated the details.
test: Added step-tracking, env-var guards, and improved error surfacing. Need user to test on staging after push.
expecting: If the key is now correctly available at runtime, the purchase should succeed. If still failing, the step marker will tell us exactly where.
next_action: User tests purchase flow on staging after code deploys

## Symptoms

expected: Logged-in user clicks "Escolher" on /creditos -> POST /api/credits/purchase -> returns {checkout_url} -> redirects to AbacatePay
actual: POST returns 500. Vercel logs show truncated Pino messages at level 30 (info). Button shows "Redirecionando..." forever then error toast.
errors: 500 response. Vercel logs truncated. Level 30 instead of 50 suggests crash before catch block.
reproduction: Go to staging.maosfalam.com/creditos logged in, click "Escolher" on any pack
started: Never worked on staging. Phase 12/13 just implemented AbacatePay v2.

## Eliminated

- hypothesis: Prisma/Neon connection issue on Vercel
  evidence: Other authenticated routes (GET /api/user/profile, /api/user/readings, /api/user/credits) all return 200 on staging. Same Prisma client, same DB.
  timestamp: 2026-04-14T21:02:00Z

- hypothesis: AbacatePay API itself is broken
  evidence: Tested all 3 API calls locally with the same key — customer creation, product resolution, and checkout creation all succeed. The API works.
  timestamp: 2026-04-14T21:02:00Z

- hypothesis: Route code has a logic bug
  evidence: Simulated the full route flow outside Next.js (all steps except Prisma). All steps pass. The route structure is sound — try/catch covers everything.
  timestamp: 2026-04-14T21:03:00Z

- hypothesis: The error bypasses the catch block
  evidence: Code review confirms every async operation is inside the try block. The "level 30 info" in Vercel logs is just the HTTP request log, not the Pino application log. The catch IS reached, but Vercel truncates the Pino error output in their log viewer.
  timestamp: 2026-04-14T21:03:00Z

## Evidence

- timestamp: 2026-04-14T21:01:00Z
  checked: Vercel env vars via `vercel env ls`
  found: ABACATEPAY_API_KEY was added to Preview env only ~57 minutes ago. Before that, it did not exist on Vercel Preview.
  implication: Every purchase attempt before the key was added sent "Authorization: Bearer undefined" to AbacatePay, which returns 401 "Invalid or inactive API key". This is the most likely root cause.

- timestamp: 2026-04-14T21:02:00Z
  checked: AbacatePay API response with invalid key
  found: curl with "Bearer undefined" returns {"success":false,"data":null,"error":"Invalid or inactive API key"} which triggers the abacatePost error path, caught by route catch block, returned as 500 with detail.
  implication: Confirms the missing env var hypothesis.

- timestamp: 2026-04-14T21:03:00Z
  checked: Vercel logs for POST /api/credits/purchase in last 24h
  found: Only one entry — my unauthenticated test returning 401. No 500 entries visible. The 500 errors were from before the 24h window.
  implication: No authenticated purchase has been attempted since the API key was added. The fix may already be in effect — just needs testing.

- timestamp: 2026-04-14T21:04:00Z
  checked: All 3 AbacatePay API endpoints locally
  found: createCustomer, resolveProductId, createCheckout all succeed with the configured key.
  implication: The API key works, the products exist, the flow is correct.

## Resolution

root_cause: Missing ABACATEPAY_API_KEY in Vercel Preview environment. The env var was not set when the purchase route was first deployed (Phase 12/13). Every authenticated purchase call reached the AbacatePay API step, sent "Authorization: Bearer undefined", got 401 from AbacatePay, which was caught and returned as a generic 500. The Vercel log viewer truncated the Pino error output, hiding the actual error message.

fix: |

1. ABACATEPAY_API_KEY was added to Vercel Preview env ~1h ago (already done)
2. Added requireApiKey() guard in abacatepay.ts — fails fast with clear message if key is missing
3. Added NEXT_PUBLIC_BASE_URL guard in purchase route — fails fast if URL is missing
4. Added step-tracking in purchase route — every async operation has a labeled step that appears in both logs and the 500 response
5. Improved payment-client.ts error surfacing — shows step + detail from server response, making future debugging immediate

verification: |

- 161 tests pass (including payment-client test updated for new error format)
- Build succeeds
- Type-check and lint clean
- AbacatePay API verified working locally (customer, product, checkout)
- Prisma verified working on staging (other routes return 200)
- Needs user verification on staging after push

files_changed:

- src/app/api/credits/purchase/route.ts
- src/server/lib/abacatepay.ts
- src/lib/payment-client.ts

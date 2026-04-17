---
status: fixing
trigger: "Fix 4 interrelated bugs in the payment flow"
created: 2026-04-14T00:00:00Z
updated: 2026-04-14T00:00:00Z
---

## Current Focus

hypothesis: 4 distinct bugs confirmed via code reading
test: fix each and verify build + tests
expecting: all 4 resolved
next_action: apply fixes

## Symptoms

expected: webhook processes credits, CPF saved, toast once at top with overlay
actual: webhook 404, CPF null, toast on every reload at bottom without overlay

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-04-14T00:01
  checked: webhook/route.ts
  found: Race condition confirmed. Purchase route creates payment, then creates checkout, then updates payment with checkoutId. Webhook arrives and tries to find by externalId (payment.id UUID) OR by checkoutId. If webhook arrives before the update-payment step completes, checkoutId is null in DB so fallback lookup fails. But externalId lookup should work since payment is created BEFORE checkout. WAIT - the externalId in the webhook is NOT the payment UUID. Looking at the webhook payload structure: data.externalId comes from what was passed as externalId to createCheckout. In purchase route line 101: externalId is payment.id. So externalId SHOULD be the payment UUID. But the webhook handler checks isUuid.test(externalId) and does findUnique by id. This should work. THEORY: Maybe AbacatePay sends a different externalId than what we passed? Or the webhook payload structure nests differently. Adding retry mechanism as safety net.
  implication: Need retry with delay for race condition between checkout creation and webhook arrival

- timestamp: 2026-04-14T00:02
  checked: credits/purchase/route.ts lines 56-72
  found: BUG FOUND. Line 59: `const needsNewCustomer = !customerId || (cpfValue && !profile.cpf && data.cpf)`. When profile already has abacatepayCustomerId but no cpf, and user provides cpf, needsNewCustomer is truthy. It recreates customer AND saves cpf (line 69). BUT: if profile already HAS cpf (from a previous attempt that partially worked), the condition `!profile.cpf` is false, so needsNewCustomer is false, and the cpf update at line 69 never runs. ACTUALLY, looking more carefully: if profile.cpf is null (the reported bug), then !profile.cpf is true, and data.cpf is truthy, so needsNewCustomer should be true. The issue might be that cpf is not reaching the server at all - the Zod schema makes cpf optional with min(11). Let me check if the client sends cpf correctly. But the user says "CPF is always null" - this suggests the update never runs. Let me re-read: if profile already has abacatepayCustomerId (from first purchase without cpf), then customerId is set. needsNewCustomer = false || (cpfValue && true && true) = truthy. So it SHOULD enter the block. BUT WAIT: cpfValue is `data.cpf || profile.cpf || undefined`. If data.cpf is "123.456.789-00", cpfValue = "123.456.789-00". needsNewCustomer = false || ("123..." && true && "123...") = truthy. That's correct. The code on line 65-71 runs: updates abacatepayCustomerId AND cpf. This should work... unless the createCustomer call throws and the whole thing fails silently. Need to check if there's an error in the customer creation. Actually, looking again at the condition more carefully: `(cpfValue && !profile.cpf && data.cpf)` - this is a JS truthy chain. cpfValue is a string, !profile.cpf is boolean (true when null), data.cpf is a string. In JS this evaluates to data.cpf (last truthy value), which is truthy. So needsNewCustomer = true. The prisma update runs. THIS SHOULD WORK. Unless... the profile already has a cpf from a previous successful save. But user says it's always null. Let me check if maybe the issue is that profile is created on line 48 WITH cpf, but then the needsNewCustomer block doesn't run because !customerId is false? No, profile was just created so customerId would be null. Hmm. Actually I think the bug might be simpler: when profile ALREADY EXISTS (not first time), customerId is already set, and profile.cpf is null. needsNewCustomer = false || (truthy && true && truthy) = truthy. Update runs. CPF should be saved. UNLESS the Zod validation strips it - but schema says .optional() so it passes through. Let me look for another angle: maybe the BuyCreditsModal doesn't send cpf at all?
  implication: Need to check the client-side modal that sends the purchase request

- timestamp: 2026-04-14T00:03
  checked: leituras/page.tsx lines 371-380
  found: Toast code looks correct - it does router.replace("/conta/leituras") to strip params. But useEffect depends on [searchParams, showToast, router]. The router.replace triggers a navigation, which changes searchParams, which re-triggers the effect. The purchaseToastShown ref should prevent double-fire. This looks correct actually. But user reports toast on every reload. If the page is refreshed (F5), purchaseToastShown ref resets to false AND the URL still has ?purchased=1 if router.replace hasn't committed yet. Wait - line 378 does router.replace which should strip the param. Unless there's a timing issue where the page refreshes before replace takes effect. Actually, the code looks correct for preventing re-fire within the same session. But if the user manually refreshes the page before the replace happens, the param is still there. This is the correct implementation though - the ref prevents double-fire and replace strips the param. The real issue might be that router.replace doesn't actually work as expected in this context, or that the replace happens after the component unmounts and remounts.
  implication: The implementation looks correct but may need window.history.replaceState as more reliable approach

- timestamp: 2026-04-14T00:04
  checked: ToastProvider.tsx line 67
  found: Position is `fixed bottom-6 left-1/2 -translate-x-1/2`. Need to change to top with overlay.
  implication: Change position to top, add backdrop overlay

## Resolution

root_cause: |

1. Webhook: race condition + missing retry. Webhook may arrive before payment row is fully committed or checkoutId is saved.
2. CPF: Need to verify client sends cpf. The server logic looks correct IF cpf reaches it.
3. Toast: router.replace is correct but might have timing issues with Next.js App Router searchParams.
4. Toast position: hardcoded bottom-6 in ToastProvider.
   fix: (applying)
   verification: (pending)
   files_changed: []

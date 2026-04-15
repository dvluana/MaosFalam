# Deferred Items — Phase 03 edge-cases-prompt

## Out-of-scope issues found during plan 03-03

### src/hooks/useUploadValidation.ts

**Issue 1 — Lint:** `@/lib/mediapipe` import should occur before `@/lib/normalize-image` (import/order).

**Issue 2 — Type Error:** `Cannot find name 'checkIfScreenshot'` at line 148. The function is referenced but not defined/imported in the file.

**Origin:** These errors exist in committed code from a prior plan (not introduced by 03-03 changes).

**Action needed:** Fix in a future plan or hotfix — update import order and define/import `checkIfScreenshot` in `useUploadValidation.ts`.

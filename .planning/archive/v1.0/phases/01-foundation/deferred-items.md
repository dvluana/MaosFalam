# Deferred Items — Phase 01 Foundation

## Pre-existing Lint Errors (out of scope for 01-01)

Discovered during `npm run lint` after completing plan 01-01. These errors exist in files not touched by this plan.

### src/server/lib/abacatepay.ts:79

- `@typescript-eslint/no-require-imports` — A `require()` style import is forbidden
- `@typescript-eslint/consistent-type-imports` — `import()` type annotations are forbidden

### src/app/api/webhook/abacatepay/route.ts:7

- `import/order` — `@/server/lib/abacatepay` import should occur before import of `@/server/lib/logger`

**Action:** Fix in a dedicated lint-cleanup task or when touching these files in Phase 3 (API routes).

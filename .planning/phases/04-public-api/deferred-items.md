# Deferred Items — Phase 04-public-api

## Lint errors in untracked files (pre-existing, out of scope for Plan 04-01)

These lint errors exist in files that were never committed and are outside the `files_modified` list of Plan 04-01. They should be fixed before Plan 04-02 tests run (or when those routes are committed).

### src/app/api/credits/purchase/route.ts

- `import/order`: `@/server/lib/abacatepay` import should occur before `@/server/lib/auth`

### src/app/api/webhook/abacatepay/route.ts

- `import/order`: `@/server/lib/abacatepay` import should occur before `@/server/lib/logger`

### src/server/lib/abacatepay.ts

- `@typescript-eslint/no-require-imports`: A `require()` style import is forbidden (line 79)
- `@typescript-eslint/consistent-type-imports`: `import()` type annotations are forbidden (line 79)

**Action needed:** Fix these before committing the abacatepay integration files.

# Deferred Items — Phase 03 ai-pipeline

## Pre-existing Test Failure (out of scope)

**File:** `src/data/blocks/__tests__/blocks-integrity.test.ts`
**Test:** "all gender markers in texts exist in GENDER_MAP"
**Error:** `{{igual}}` marker used in block text but missing from GENDER_MAP
**Discovered during:** 03-03 full test suite run
**Status:** Pre-existing failure, not caused by Phase 03 changes
**Action needed:** Add `{{igual}}` entry to GENDER_MAP in a future plan

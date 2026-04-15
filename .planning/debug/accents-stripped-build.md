---
status: awaiting_human_verify
trigger: "Portuguese accents (e, a, c, a, o, etc.) present in source code but stripped/corrupted in compiled JS on Vercel staging"
created: 2026-04-14T00:00:00Z
updated: 2026-04-14T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - Commit 221db6e was never pushed to origin/develop
test: git log origin/develop..HEAD shows 221db6e is 1 commit ahead
expecting: Push will deploy accents to staging
next_action: Push commit to origin/develop and verify staging

## Symptoms

expected: Text like "voce", "maos", "e", "nao" renders correctly on staging.maosfalam.com
actual: Accented characters are stripped or replaced. "voce" becomes "voce", "maos" becomes "maos". Source code has correct accents (verified in git), but Vercel build output doesn't.
errors: No build errors. Build passes successfully on Vercel. The stripping is silent.
reproduction: Git source has correct accents -> npm run build -> check if accents survive -> on staging, compiled JS has no accents
started: Accents were added in commit 221db6e. First time accents were used.

## Eliminated

- hypothesis: Build/Turbopack strips accents during compilation
  evidence: Local npm run build preserves all accents in .next/static chunks. grep for "voce" finds matches with accent in local build output.
  timestamp: 2026-04-14

- hypothesis: File encoding issue (Latin-1 or ASCII instead of UTF-8)
  evidence: file -I reports charset=utf-8 for all source files. No non-UTF8 byte sequences found.
  timestamp: 2026-04-14

- hypothesis: .gitattributes overriding encoding
  evidence: No .gitattributes file exists in the repo
  timestamp: 2026-04-14

- hypothesis: Vercel build environment strips accents
  evidence: The accent commit 221db6e was never pushed to origin/develop, so Vercel never built it. The staging JS chunk (03w9rcx-reaef.js) contains "Pra voce." without accent, matching the pre-221db6e source code.
  timestamp: 2026-04-14

## Evidence

- timestamp: 2026-04-14
  checked: File encoding of source files
  found: All files are UTF-8 (verified with file -I)
  implication: Encoding is correct, not the issue

- timestamp: 2026-04-14
  checked: Local build output (.next/static/)
  found: Accents survive local build. grep -c "voce" finds matches in multiple JS chunks.
  implication: Build pipeline does NOT strip accents

- timestamp: 2026-04-14
  checked: Staging JS chunks via curl
  found: Staging chunk 03w9rcx-reaef.js contains "Pra voce." (no accent) and "Pra voce e pra quem te importa." (no accent)
  implication: Staging is serving OLD code without accents

- timestamp: 2026-04-14
  checked: git log origin/develop..HEAD
  found: Commit 221db6e ("fix: add missing Portuguese accents to all user-facing text") exists locally but NOT on origin/develop
  implication: ROOT CAUSE - the accent commit was never pushed. Vercel deploys from origin/develop, so it never received the accents.

## Resolution

root_cause: Commit 221db6e ("fix: add missing Portuguese accents to all user-facing text") was created locally but never pushed to origin/develop. Vercel staging deploys from origin/develop, so it still serves the old code without accents. There is no build/encoding/Turbopack issue.
fix: Push the commit to origin/develop (git push origin develop)
verification: After push, Vercel will auto-deploy. Check staging JS chunks for accented text.
files_changed: []

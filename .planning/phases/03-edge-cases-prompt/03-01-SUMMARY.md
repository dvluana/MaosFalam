---
phase: "03"
plan: "01"
subsystem: upload-pipeline
tags: [image-normalization, heic, exif, compression, upload]
dependency_graph:
  requires: [02-upload-pipeline]
  provides: [EDGE-01, EDGE-02, EDGE-03]
  affects: [useUploadValidation, camera-upload-flow]
tech_stack:
  added: [heic2any]
  patterns: [normalizeImage pipeline, EXIF correction via createImageBitmap]
key_files:
  created:
    - src/lib/normalize-image.ts
  modified:
    - src/hooks/useUploadValidation.ts
    - package.json
    - package-lock.json
decisions:
  - heic2any for HEIC conversion — only library with own types, no @types package needed
  - createImageBitmap for EXIF correction — browser-native, applies orientation automatically
  - SSR guard with typeof check — normalizeImage used in client hook, SSR returns file unchanged
  - Combined EXIF + resize in single canvas pass — avoids two canvas draws
metrics:
  duration: "3m"
  completed: "2026-04-11T17:22:39Z"
  tasks_completed: 2
  files_changed: 4
---

# Phase 03 Plan 01: Image Normalization Pipeline Summary

HEIC-to-JPEG conversion, EXIF rotation correction, and 1280px compression wired into upload validation before any check runs.

## Tasks Completed

| Task | Name                                           | Commit  | Files                                                       |
| ---- | ---------------------------------------------- | ------- | ----------------------------------------------------------- |
| 1    | Criar src/lib/normalize-image.ts               | 362e317 | src/lib/normalize-image.ts, package.json, package-lock.json |
| 2    | Integrar normalizeImage em useUploadValidation | a1441b0 | src/hooks/useUploadValidation.ts                            |

## What Was Built

**`src/lib/normalize-image.ts`** — Three-step normalization pipeline:

1. HEIC/HEIF detection (by type and extension) → dynamic import of `heic2any` → converts to JPEG 0.9 quality
2. `createImageBitmap` applies EXIF rotation automatically → canvas draw at correct orientation
3. Canvas resize to max 1280px wide + `toDataURL("image/jpeg", 0.85)` compression

SSR guard: if `createImageBitmap` is unavailable, returns the file unchanged (steps 2+3 skipped).

**`src/hooks/useUploadValidation.ts`** — `validate()` now calls `normalizeImage(file)` as first step before `URL.createObjectURL` and before any format/size check. All downstream checks use `normalizedFile` (type, size, MediaPipe detection, previewUrl).

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

**Note on @types/heic2any:** Plan mentioned `npm install --save-dev @types/heic2any` but the package does not exist in the npm registry. `heic2any` ships its own `.d.ts` declarations in `node_modules/heic2any/dist/heic2any.d.ts`. No manual types needed — TypeScript picks them up automatically.

## Known Stubs

None — normalizeImage is fully wired and processes real files.

## Self-Check: PASSED

- `src/lib/normalize-image.ts` exists and exports `normalizeImage`
- `src/hooks/useUploadValidation.ts` calls `normalizeImage(file)` at top of `validate()`
- Commit 362e317 confirmed in git log
- Commit a1441b0 confirmed in git log
- `npm run lint` passes (no errors)
- `npm run type-check` passes for both files
- `npm run build` passes

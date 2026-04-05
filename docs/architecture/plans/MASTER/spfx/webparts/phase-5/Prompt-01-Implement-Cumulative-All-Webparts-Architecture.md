# Prompt 01 — Implement Cumulative All-Webparts Architecture

## Objective

Implement the necessary build/package changes so `hb-webparts` packages **all homepage webparts cumulatively** while preserving the successful packaging/runtime parameters proven by the first two working webparts.

This prompt is about implementation, not partial validation.

## Repo focus

Primary:
- `tools/build-spfx-package.ts`
- `apps/hb-webparts/config/package-solution.json`

Reference-only / do not change unless strictly required:
- `apps/hb-webparts/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/vite.config.ts`

## Required implementation goals

### A. Stop proof-case replacement behavior
The build must no longer behave as though one active proof-case webpart replaces the prior one.

Previously validated webparts must remain included.

### B. Enable cumulative all-webparts packaging
The build must package all intended homepage webparts in one `.sppkg`.

### C. Preserve proven parameters
Retain the packaging/runtime parameters already proven by the first two successful webparts, including:
- valid 4-part package version format
- bundle hashing
- shell asset correctness
- mount/unmount global contract
- packaged asset verification flow

### D. Use the correct runtime model for the cumulative package
The resulting build must use the correct cumulative-package model for the existing shell architecture.

Do not force the design back into single-target proof-case logic.

## Implementation instructions

1. Update `tools/build-spfx-package.ts` so cumulative packaging for `hb-webparts` is active.
2. Ensure all intended homepage webpart manifests pass through to package generation.
3. Ensure the full dispatcher entry (`mount.tsx`) is used for cumulative packaging.
4. Preserve the successful shell/bundle build contract proven in the first two webparts.
5. Bump `apps/hb-webparts/config/package-solution.json` to the next valid 4-part version.
6. Do not broaden changes into unrelated app/runtime refactors.

## Hard constraints

- Do not exclude `HbHeroBannerWebPart`.
- Do not exclude `PriorityActionsRailWebPart`.
- Do not retain single-target replacement logic as the active model.
- Do not create a package that only proves hero + rail.
- Do not change webpart source components unless required by an actual cumulative-package defect.
- Do not re-read files already in active context unless needed for verification.

## Deliverable

Provide a concise completion note with:
1. files changed
2. exact architecture selected
3. explanation of how cumulative retention now works
4. version bump
5. any remaining known risks

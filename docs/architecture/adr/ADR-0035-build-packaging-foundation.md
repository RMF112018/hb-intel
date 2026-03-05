# ADR-0035: Build & Packaging Foundation

**Status:** Accepted
**Date:** 2026-03-05
**Phase:** 4b.1
**References:** PH4B.1-UI-Design-Plan.md SS4 | PH4B-UI-Design-Plan.md SS1-3, 17 | Blueprint SS1d

## Context

Phase 4b.0 resolved all hard blockers (build artifacts in `src/`, eslint-plugin extraction, storybook-static untracking, app-shell consolidation). Phase 4b.1 finalizes the build pipeline, verifies barrel completeness, and creates the documentation baseline so subsequent phases (4b.2+) start from a stable, fully-documented foundation.

## Decisions

### 1. `check-types` depends on `^build`

The `check-types` task in `turbo.json` now declares `dependsOn: ["^build"]` so upstream packages produce `.d.ts` files before type-checking runs. Without this, cross-package type resolution fails intermittently.

### 2. `build-storybook` added as cacheable Turbo task

A new `build-storybook` task is registered with `dependsOn: ["^build"]`, `inputs: ["$TURBO_DEFAULT$", ".storybook/**"]`, and `outputs: ["storybook-static/**"]`. This enables Turbo caching for Storybook builds and consistent CI behavior.

### 3. `lint` task gains explicit inputs

The `lint` task now includes `inputs: ["$TURBO_DEFAULT$", ".eslintrc.*"]` for cache correctness — ESLint config changes invalidate the lint cache.

### 4. Barrel confirmed complete

All 35 component directories plus theme, icons, hooks, layouts, and module-configs are exported from `packages/ui-kit/src/index.ts`. The `interactions/` directory is intentionally excluded pending Phase 4b.11 (F-017) where interaction demos move to Storybook stories.

### 5. `sideEffects: false` + TypeScript compiler confirmed

`package.json` declares `"sideEffects": false` enabling tree-shaking. The build uses `tsc` with declaration output. The `preserveModules` pattern is maintained through TypeScript's per-file output.

### 6. Four entry points documented

The package exposes four `exports` entry points:
- `.` — full library
- `./app-shell` — lean SPFx bundle
- `./theme` — theme tokens only
- `./icons` — icon set only

Documentation created at `docs/reference/ui-kit/entry-points.md`.

### 7. All component families have reference documentation

10 missing reference docs created (HbcApprovalStepper, HbcCalendarGrid, HbcConfirmDialog, HbcDrawingViewer, HbcHeader, HbcKpiCard, HbcPhotoGrid, HbcScoreBar, WorkspacePageShell, HbcBottomNav). Combined with the existing 27 docs plus entry-points.md, all 38 reference files now exist in `docs/reference/ui-kit/`.

## Consequences

- Turbo caching is now correct for type-checking, linting, and Storybook builds
- All component families are documented following the established reference template
- Dual entry point architecture is documented for developer onboarding
- Phase 4b.2+ can proceed from a stable, fully-documented foundation

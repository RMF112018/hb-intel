# ADR-0034: Phase 4b.0 Audit Remediation

**Status:** Accepted
**Date:** 2026-03-05
**Deciders:** HB Intel Engineering
**References:** PH4B-UI-Design-Audit-Remeditation-Plan SS3.1 | PH4B-UI-Design-Plan SS1-3, 16, 17 | Blueprint SS1d

## Context

Phase 4b cannot proceed until five hard blockers from the Phase 4 QA/QC audit are resolved. These blockers cause build failures, stale TypeScript resolution, and workspace packaging issues.

## Decisions

### F-001 + F-002: Remove Build Artifacts from `src/`

117 tracked `.js`, `.d.ts`, and `.map` files existed inside `packages/ui-kit/src/`. These stale build artifacts broke TypeScript resolution for downstream consumers. The `tsc` build outputs to `dist/` — artifacts in `src/` are never valid.

**Resolution:** All 117 files removed from git tracking via `git rm --cached`. A `.gitignore` added to `packages/ui-kit/` prevents future commits. The `vite.config.ts` updated to multi-entry (`index` + `app-shell`) with `preserveModules` and `preserveModulesRoot: 'src'` for tree-shakeable output. `sideEffects: false` added to `package.json`.

### F-004: Extract ESLint Plugin to Workspace Package

`eslint-plugin-hbc` lived orphaned inside `packages/ui-kit/src/lint/` as a `file:` devDependency. It could not be shared across workspace packages per D-05 and D-10.

**Resolution:** Created `packages/eslint-plugin-hbc/` as `@hbc/eslint-plugin-hbc` workspace package. Plugin reference in `packages/ui-kit/.eslintrc.cjs` updated from `'hbc'` to `'@hbc/hbc'` (scoped plugin convention). Old `src/lint/` directory deleted entirely.

### F-005: Clarify `app-shell` vs `shell` Packages

Per D-01 and D-05: `packages/shell` is the canonical shell source (components, stores, types). `packages/app-shell` was originally intended as a PWA-specific re-export facade.

**Resolution:** `packages/app-shell` removed entirely per remote consolidation (PR #1 / ADR-0033). The thin wrapper had zero consumers beyond SPFx and added no logic. Consumers now import directly: `@hbc/ui-kit/app-shell` for UI shell components, `@hbc/shell` for stores/layout/types. Phase 4b.1+ can revisit the facade pattern if MSAL auth injection requires a single import point.

### F-006: Remove `storybook-static/` from Git

27 tracked files in `packages/ui-kit/storybook-static/` — build output that should never be version-controlled.

**Resolution:** Removed from git tracking. Added `storybook-static/` to both `packages/ui-kit/.gitignore` and root `.gitignore`. CI already builds and uploads Storybook as an artifact.

## Consequences

- All Phase 4b sub-phases can now proceed with clean build state
- `@hbc/eslint-plugin-hbc` can be consumed by any workspace package
- All consumers import from `@hbc/ui-kit/app-shell` (UI shell) and `@hbc/shell` (stores/types) directly
- Build artifact pollution eliminated; `.gitignore` prevents recurrence

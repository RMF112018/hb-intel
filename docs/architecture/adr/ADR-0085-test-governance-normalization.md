# ADR-0085: Test Governance Normalization

**Status:** Accepted
**Date:** 2026-03-09
**Phase:** PH7.8 / PH7.11

## Context

Phase 7 stabilization (PH7.8) revealed inconsistencies across P1 package test configurations: missing workspace entries, divergent coverage thresholds, phantom dependencies causing cyclic resolution failures, and no centralized CI gate for platform-critical packages. Each issue was resolved individually during PH7.8 sub-tasks, but the overall governance model was not locked into a permanent decision record.

## Decision

1. **Vitest P1 Workspace Structure** — A root `vitest.workspace.ts` file enumerates all five P1 packages (`@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`). Each package maintains its own `vitest.config.ts` with environment, coverage thresholds, and alias declarations.

2. **Per-Package Coverage Thresholds:**
   - `@hbc/auth` and `@hbc/shell`: lines 95, functions 95, branches 90, statements 95 (deferred branch alignment tracked separately).
   - `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`: lines 95, functions 95, branches 95, statements 95.

3. **CI `unit-tests-p1` Job** — A dedicated CI job runs all five P1 packages without Azurite (no Azure Storage dependency). Both `unit-tests` and `unit-tests-p1` must pass before PR merge.

4. **Cyclic-Dependency Resolution** — The `@hbc/complexity` package's phantom `@hbc/ui-kit` dependency was removed (PH7.8.1). Vitest `resolve.alias` entries map `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` to source paths for test resolution only, without creating a package.json dependency.

5. **Dual-Config Arrangement** — `@hbc/sharepoint-docs` uses a workspace config (broad scope, CI gate) and a local config (targeted scope, developer runs). Thresholds match; scope intentionally diverges.

6. **CSS Artifact Copy** — `@hbc/complexity` uses a post-build `cp` step to copy `complexity.css` to `dist/` because tsc does not copy non-TS assets (PH7.8.4).

7. **Ambient Type Declarations** — `@hbc/complexity/src/env.d.ts` provides a minimal `process.env.NODE_ENV` declaration for consumers with restricted `types` arrays (PH7.8.3).

## Consequences

- All P1 packages must maintain local Vitest configs matching the thresholds in this ADR.
- New P1 packages must be added to `vitest.workspace.ts` and the `unit-tests-p1` CI job.
- The full testing matrix is maintained at `docs/reference/package-testing-matrix.md`.

## References

- PH7.8 plan: `docs/architecture/plans/ph7-remediation/PH7.8-Test-Governance-Normalization.md`
- Package testing matrix: `docs/reference/package-testing-matrix.md`

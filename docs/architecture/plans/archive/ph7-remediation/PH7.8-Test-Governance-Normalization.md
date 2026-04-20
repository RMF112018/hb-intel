# PH7.8 — Test Governance Normalization

**Version:** 1.1 (amended after PH7.8R validation — 2026-03-09)
**Purpose:** Bring all P1 platform packages under consistent root test governance and release-gate participation.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Expand root Vitest governance beyond the current partial set so all strategic shared-feature primitives and stabilization-critical packages participate in the common verification model with clear environments, coverage expectations, and CI integration.

---

## Prerequisites

- PH7.1 complete.
- Review `vitest.workspace.ts`, root scripts, package scripts for all P1 packages, and CI workflows that depend on test execution.

---

## Source Inputs

- `vitest.workspace.ts`
- root `package.json`
- `turbo.json`
- P1 package `package.json` files
- CI workflows in `.github/workflows/*`

---

## 7.8.1 — Define the P1 Test Governance Set

- Publish the list of mandatory P1 packages in root governance: auth, shell, sharepoint-docs, bic-next-move, and complexity.
- Create a package testing matrix with package, environment, coverage target, command path, root participation, and CI gate participation.

## 7.8.2 — Expand `vitest.workspace.ts`

- Add `@hbc/bic-next-move` and `@hbc/complexity` with deliberate environment and coverage choices that match the package behavior and existing workspace style.
- **[Amendment A]** Both new workspace entries must include a `resolve` block with `alias` entries mirroring those in their local `vitest.config.ts`. Without aliasing, workspace-routed test runs will fail to resolve workspace dependencies (`@hbc/ui-kit`, `@hbc/complexity`, etc.) at source level. Aliases needed:
  - `@hbc/bic-next-move`: `@hbc/bic-next-move/testing`, `@hbc/complexity`, `@hbc/ui-kit/app-shell`, `@hbc/ui-kit`, `@hbc/notification-intelligence` (stub mock)
  - `@hbc/complexity`: `@hbc/complexity/testing`, `@hbc/ui-kit/app-shell`, `@hbc/ui-kit`
- **[Amendment B]** Fix the pre-existing scope gap in root `package.json`: the `"test"` script currently filters only `@hbc/auth` and `@hbc/shell`, silently omitting `@hbc/sharepoint-docs` (which is already in the workspace). Update the root `"test"` script to include all five P1 package filters: `--filter=@hbc/auth --filter=@hbc/shell --filter=@hbc/sharepoint-docs --filter=@hbc/bic-next-move --filter=@hbc/complexity`.

## 7.8.3 — Normalize Package Test Scripts

- Ensure all P1 packages expose `test`, `test:watch`, `test:coverage`, `check-types`, and `lint` consistently enough to participate in root governance.

## 7.8.4 — Define Coverage Expectations

- Set explicit minimum coverage targets by package; the targets do not need to be identical, but they must be intentional and documented.
- **[Amendment C — branches threshold decision]** The two new workspace entries (`@hbc/bic-next-move`, `@hbc/complexity`) must use `branches: 95` (not 90). Rationale: their local `vitest.config.ts` files already enforce `branches: 95`; using 90 in the workspace entry would silently lower the bar for root-run coverage checks while the local configs enforce the stricter limit. The workspace config must be at least as strict as the local config. Separately, the existing `@hbc/auth` and `@hbc/shell` entries at `branches: 90` are not changed by this phase — revisiting those thresholds is deferred.
- **[Amendment D — sharepoint-docs dual-config ambiguity]** `@hbc/sharepoint-docs` has two coverage configurations that will diverge in results: the root `vitest.workspace.ts` entry uses a broad `src/**/*.ts` + `src/**/*.tsx` include with named exclusions, while the local `packages/sharepoint-docs/vitest.config.ts` uses a targeted five-file `include` list (the five core service/api files). The authoritative source for coverage enforcement is declared as: **the workspace config governs CI and release-gate checks; the local config governs local developer runs**. No change is required to either file by this phase, but the matrix doc produced in §7.8.6 must document this dual-config arrangement and the intentional difference in coverage scope.

## 7.8.5 — Align CI and Release Gates

- Update CI/release docs and workflows so root governance is meaningful and no strategic package remains effectively local-only tested.
- **[Amendment E — specify exact CI diff]** The current `ci.yml` `unit-tests` job runs `pnpm turbo run test --filter=backend-functions --filter=@hbc/provisioning` with an Azurite service container. The P1 platform packages (`@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`) are entirely absent from CI and are therefore local-only tested today. The required change is: add a second job to `ci.yml` named `unit-tests-p1` with no Azurite dependency (P1 packages do not use Azure Storage). The job must:
  1. Check out, install pnpm v9, set up Node 20 with pnpm cache (identical setup to the existing `lint-and-typecheck` job).
  2. Run `pnpm install --frozen-lockfile`.
  3. Run `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell --filter=@hbc/sharepoint-docs --filter=@hbc/bic-next-move --filter=@hbc/complexity` with coverage.
  4. Upload coverage artifacts from `packages/auth/coverage/`, `packages/shell/coverage/`, `packages/sharepoint-docs/coverage/`, `packages/bic-next-move/coverage/`, `packages/complexity/coverage/` with a 14-day retention period (consistent with the existing coverage upload pattern).
  The existing `unit-tests` job (backend-functions + provisioning) is not modified. Both jobs should be independent (no `needs:` dependency on each other) so they can run in parallel and both must pass before PR merge.

## 7.8.6 — Publish the Package Testing Matrix

- Create a reusable reference doc future maintainers can extend for additional strategic packages.

---

## Deliverables

- updated `vitest.workspace.ts` (two new entries with alias blocks — Amendment A)
- updated root `package.json` `"test"` script to include all five P1 filters (Amendment B)
- `branches: 95` enforced for new workspace entries (Amendment C)
- package testing matrix reference doc documenting dual-config arrangement for `sharepoint-docs` (Amendment D)
- new `unit-tests-p1` job in `.github/workflows/ci.yml` (Amendment E)
- normalized package scripts where needed

---

## Acceptance Criteria Checklist

- [x] All P1 packages are included in root test governance.
- [x] `vitest.workspace.ts` reflects intentional environment selection.
- [x] New workspace entries for `@hbc/bic-next-move` and `@hbc/complexity` include `resolve.alias` blocks (Amendment A).
- [x] Root `package.json` `"test"` script includes all five P1 package filters, including `@hbc/sharepoint-docs` (Amendment B).
- [x] New workspace entries use `branches: 95` (Amendment C).
- [x] Package testing matrix documents the `sharepoint-docs` dual-config arrangement (Amendment D).
- [x] `ci.yml` `unit-tests-p1` job exists and covers all five P1 packages with coverage upload (Amendment E).
- [x] P1 package scripts are normalized.
- [x] Coverage expectations are documented.
- [x] CI/release gates reflect the normalized package set.

---

## Verification Evidence

- `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell --filter=@hbc/sharepoint-docs --filter=@hbc/bic-next-move --filter=@hbc/complexity`
- root test command verification
- build/lint/check-types if scripts/config change

---

## Progress Notes Template

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.8 started: 2026-03-09
PH7.8 completed: 2026-03-09

Artifacts:
- updated `vitest.workspace.ts` — added @hbc/bic-next-move and @hbc/complexity entries with alias blocks (Amendment A), branches:95 (Amendment C)
- updated root `package.json` "test" script — all 5 P1 filters (Amendment B)
- created `docs/reference/package-testing-matrix.md` — P1 matrix with dual-config documentation (Amendment D)
- added `unit-tests-p1` job to `.github/workflows/ci.yml` (Amendment E)

Verification:
- vitest workspace run: 63/64 suites PASS (516 tests), 1 pre-existing shell failure (DevToolbar.wrapper — complexity CSS dist artifact issue from SF03)
- bic-next-move local: 9/9 suites PASS (113 tests)
- complexity local: 9/9 suites PASS (99 tests)
- turbo: blocked by pre-existing cyclic dependency (@hbc/complexity ↔ @hbc/ui-kit) introduced in SF03-T07 commit bf91688 — not in PH7.8 scope

Notes:
- Pre-existing blocker: turbo graph rejects ALL commands due to @hbc/ui-kit → @hbc/complexity cycle (added in SF03-T07). CI job will also be blocked until the cycle is resolved. This is a separate architectural issue requiring its own remediation.
- Package test scripts already normalized from prior PH7 phases — no additional script changes needed.

PH7.8.1 — Cyclic Dependency Remediation: 2026-03-09
- Root cause: @hbc/complexity declared @hbc/ui-kit as a dependency (package.json + tsconfig paths) but zero source files imported from it. Phantom dependency introduced in SF03-T07 (commit bf91688).
- Fix: removed @hbc/ui-kit from complexity/package.json dependencies and removed unused tsconfig path aliases. Zero runtime impact.
- The legitimate direction (@hbc/ui-kit → @hbc/complexity) remains — 6 ui-kit components import useComplexityGate/useComplexity/IComplexityAwareProps.
- Turbo cyclic dependency blocker: RESOLVED.

PH7.8.2 — Pre-existing Build and Test Failures Remediation: 2026-03-09
- sharepoint-docs build fix: added `src/**/__tests__/**` to tsconfig.json exclude array. The setup file `src/__tests__/setup.ts` used vitest globals without type declarations and escaped the `*.test.ts` exclusion pattern.
- shell test fix: added `resolve.alias` block to shell workspace entry in `vitest.workspace.ts`, redirecting `@hbc/complexity` to source. Without this, DevToolbar.wrapper.test.ts transitively hit `complexity/dist` which contains `import './complexity.css'` (tsc doesn't copy CSS to dist). Alias pattern matches bic-next-move and complexity entries.
- Updated package-testing-matrix.md alias table to reflect shell's new alias requirement.

PH7.8.3 — hb-site-control Process Type Errors Remediation: 2026-03-09
- Root cause: hb-site-control tsconfig restricts types to ["vite/client"], excluding @types/node. When tsc follows path aliases into complexity source, process.env.NODE_ENV has no type declaration → 10 TS2591 errors.
- Fix: created packages/complexity/src/env.d.ts with minimal ambient process.env.NODE_ENV declaration. Added /// <reference path="./env.d.ts" /> to complexity barrel (src/index.ts) so all consumers automatically pick up the declaration.
- No changes to hb-site-control tsconfig or complexity dependencies. Fix is at the source package level.
- Updated package-testing-matrix.md with env.d.ts documentation.

PH7.8.4 — Rollup CSS Artifact Issue Remediation: 2026-03-09
- Root cause: complexity builds with bare tsc which preserves `import './complexity.css'` in compiled .js output but does NOT copy CSS to dist. hb-site-control transitively resolves complexity via dist → Rollup error on missing CSS file.
- Fix (Part 1 — dist completeness): added post-build `cp` to complexity build script: `tsc --project tsconfig.json && cp src/components/complexity.css dist/src/components/complexity.css`.
- Fix (Part 2 — alias consistency): added `@hbc/complexity` source alias to hb-site-control vite.config.ts and added `@hbc/complexity: workspace:*` dependency to hb-site-control package.json. Matches monorepo pattern where all @hbc/* packages are aliased to source in consuming apps.
- Updated package-testing-matrix.md with CSS copy documentation.
-->

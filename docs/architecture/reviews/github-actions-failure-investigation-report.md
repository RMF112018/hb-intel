# GitHub Actions Failure Investigation Report

Date: 2026-03-31
Repository: `RMF112018/hb-intel`
Scope: GitHub Actions workflow definitions, workflow dependencies, CI/CD scripts, package-manager state, environment-variable usage, recent regression commits, and local reproduction of CI-equivalent commands.

## Prompt-01 Progress — CI Lint Gate Remediation

- **Original finding:** The report originally identified the earliest reproducible CI lint-gate break as missing/discoverability-failing ESLint configuration for `@hbc/export-runtime` and `@hbc/spfx-project-sites`.
- **Revised repo-truth finding:** Follow-up package inspection and a fresh workspace lint run showed the missing-config problem was broader. The broken lint-script packages without a package-local ESLint config or `--config` override were:
  - `apps/project-sites`
  - `packages/activity-timeline`
  - `packages/bulk-actions`
  - `packages/export-runtime`
  - `packages/my-work-feed`
  - `packages/publish-workflow`
  - `packages/record-form`
  - `packages/saved-views`
- **Remediation implemented:** Added package-local `.eslintrc.cjs` files extending the shared root config and bumped the patch version in each touched manifest.
- **Exact files changed:**
  - `apps/project-sites/.eslintrc.cjs`
  - `apps/project-sites/package.json`
  - `packages/activity-timeline/.eslintrc.cjs`
  - `packages/activity-timeline/package.json`
  - `packages/bulk-actions/.eslintrc.cjs`
  - `packages/bulk-actions/package.json`
  - `packages/export-runtime/.eslintrc.cjs`
  - `packages/export-runtime/package.json`
  - `packages/my-work-feed/.eslintrc.cjs`
  - `packages/my-work-feed/package.json`
  - `packages/publish-workflow/.eslintrc.cjs`
  - `packages/publish-workflow/package.json`
  - `packages/record-form/.eslintrc.cjs`
  - `packages/record-form/package.json`
  - `packages/saved-views/.eslintrc.cjs`
  - `packages/saved-views/package.json`
- **Local validation command:** `pnpm turbo run lint`
- **Validation result at Prompt-01 time:** The missing-config failure class was cleared. The next lint blocker visible in that narrower validation pass was `@hbc/spfx-leadership` in `apps/leadership/src/pages/KpiDashboardPage.tsx` (`@hb-intel/hbc/enforce-hbc-tokens`, `@hb-intel/hbc/no-inline-styles`). A later full post-remediation validation pass identified `@hbc/complexity` as the first current blocker in the latest workspace run.
- **Closure status:** `Closed`
- **Reason for status:** The original lint root-cause finding was incomplete and required expansion. The configuration-discovery issue is now remediated, but the overall workspace lint gate is not yet green because a separate downstream lint failure remains.

## Prompt-02 Progress — Package Boundary / Workspace Typecheck Remediation

- **Original finding:** `pnpm turbo run check-types` failed because `@hbc/project-canvas` imported `useProjectActivity`, `registerActivityAdapters`, and `useWorkQueueSummary` from `@hbc/features-project-hub` while `@hbc/features-project-hub` already depended on `@hbc/project-canvas`, creating an invalid dependency direction and failing the workspace build/typecheck chain.
- **Current repo-truth finding:** The original finding was confirmed unchanged. The invalid upward dependency lived specifically in the canvas-owned `ProjectActivityTile.tsx` and `ProjectWorkQueueTile.tsx` files and in the corresponding `project-activity` / `project-work-queue` entries inside `referenceTileDefinitions.ts`.
- **Design correction implemented:** Moved the two Project Hub-specific tile components, tile definitions, and the idempotent registration seam into `@hbc/features-project-hub`; narrowed `@hbc/project-canvas` back to canvas-owned reference tiles only; updated app consumers and tests to register both the generic canvas tiles and the Project Hub-owned tiles.
- **Exact files changed:**
  - `packages/features/project-hub/src/canvas/index.ts`
  - `packages/features/project-hub/src/canvas/ProjectActivityTile.tsx`
  - `packages/features/project-hub/src/canvas/ProjectWorkQueueTile.tsx`
  - `packages/features/project-hub/src/canvas/projectHubCanvasTiles.tsx`
  - `packages/features/project-hub/src/canvas/registerProjectHubCanvasTiles.ts`
  - `packages/features/project-hub/src/index.ts`
  - `packages/features/project-hub/package.json`
  - `packages/features/project-hub/README.md`
  - `packages/project-canvas/src/index.ts`
  - `packages/project-canvas/src/tiles/referenceTileDefinitions.ts`
  - `packages/project-canvas/src/tiles/referenceTileDefinitions.test.ts`
  - `packages/project-canvas/src/__tests__/mandatorySpineTiles.test.tsx`
  - `packages/project-canvas/src/__tests__/referenceTiles.test.tsx`
  - `packages/project-canvas/package.json`
  - `packages/project-canvas/README.md`
  - `apps/pwa/src/pages/ProjectHubPage.tsx`
  - `apps/pwa/src/pages/__tests__/ProjectHubHomeE2E.test.tsx`
  - `apps/pwa/src/pages/__tests__/FourSpineIntegrationE2E.test.tsx`
  - `apps/project-hub/src/pages/DashboardPage.tsx`
- **Local validation commands:** `pnpm turbo run check-types`; `pnpm exec eslint packages/features/project-hub/src/canvas --ext .ts,.tsx`; `pnpm --filter @hbc/project-canvas exec vitest run src/tiles/referenceTileDefinitions.test.ts src/__tests__/referenceTiles.test.tsx src/__tests__/mandatorySpineTiles.test.tsx`; `pnpm --filter @hbc/pwa exec vitest run src/pages/__tests__/ProjectHubHomeE2E.test.tsx src/pages/__tests__/FourSpineIntegrationE2E.test.tsx`
- **Validation result:** Workspace typecheck is now green. The moved feature-owned canvas seam also passes direct ESLint verification, the affected Project Canvas tests pass (`127/127`), and the affected PWA Project Hub integration tests pass (`89/89`). Broader app-level lint commands for `@hbc/pwa` and `@hbc/spfx-project-hub` still surface unrelated pre-existing lint debt outside the Prompt-02 scope.
- **Closure status:** `Closed`
- **Reason for status:** The invalid dependency direction was removed rather than hidden, and the required workspace typecheck gate was restored.

## Prompt-03 Progress — Release Workflow Structural Repair

- **Original finding:** `Release` was structurally invalid because it called `.github/workflows/e2e.yml` and `.github/workflows/deploy-functions.yml` via `jobs.<job_id>.uses` even though neither workflow exposed `on: workflow_call`, and `deploy-production` referenced `needs.p0-e1-gate.result` without declaring `p0-e1-gate` in `needs`.
- **Chosen orchestration model:** Reusable-workflow conversion. The existing release design already orchestrated separate workflows through `jobs.<job_id>.uses`, so the minimum coherent repair was to make the called workflows valid reusable workflows and correct the `needs` graph.
- **Exact files changed:**
  - `.github/workflows/release.yml`
  - `.github/workflows/e2e.yml`
  - `.github/workflows/deploy-functions.yml`
- **Structural defects resolved:**
  - `.github/workflows/e2e.yml` now exposes `on: workflow_call` while preserving its direct `workflow_dispatch` and tag-push triggers.
  - `.github/workflows/deploy-functions.yml` now exposes `on: workflow_call.inputs.environment` and its staging/production job conditions now explicitly support reusable invocation in addition to the existing direct triggers.
  - `.github/workflows/release.yml` now declares `needs: [e2e-gate, p0-e1-gate]` for `deploy-production` and gates that job with an `always()`-guarded condition that correctly distinguishes `v1.0.x` tags from other release tags.
- **Local validation performed:**
  - Direct repo-truth review of `on`, `workflow_call`, `uses`, `with`, `needs`, and job `if` conditions in `.github/workflows/release.yml`, `.github/workflows/e2e.yml`, `.github/workflows/deploy-functions.yml`, and `.github/workflows/P0-E1-gate.yml`
  - `pnpm exec prettier --check .github/workflows/release.yml .github/workflows/e2e.yml .github/workflows/deploy-functions.yml .github/workflows/P0-E1-gate.yml`
- **Validation result:** The structural reusable-workflow defects are repaired in repo truth. The Prettier validation command still reports formatting issues in `.github/workflows/deploy-functions.yml` and the untouched `.github/workflows/P0-E1-gate.yml`; this does not change the structural validity finding but means local formatting validation is not fully clean.
- **Closure status:** `Closed`
- **Remaining limitation:** Hosted-run confirmation is still unresolved. This investigation/update validates workflow structure and dependency logic locally, but it does not prove end-to-end GitHub-hosted execution or secrets-backed deployment behavior.

## Prompt-04 Progress — Azurite Coverage Truthfulness

- **Original finding:** The CI and Functions deploy-gate workflows started Azurite and set `AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true`, but did not set `AZURITE_TEST=true`, so the real Azurite-gated integration block in `backend/functions/src/services/table-storage-service.test.ts` was skipped despite workflow comments claiming an Azurite-backed path.
- **Confirmed testing model:** The correct repo-truth model is dual-path coverage, not mock-only coverage. `backend/functions/src/services/table-storage-service.mocked.test.ts` explicitly documents itself as complementary deterministic branch-logic coverage, while `backend/functions/src/services/table-storage-service.test.ts` explicitly documents the gated Azurite block as the real adapter-contract proof path.
- **Remediation implemented:** Added `AZURITE_TEST: 'true'` to the Functions/Provisioning test step environment in `.github/workflows/ci.yml` and `.github/workflows/deploy-functions.yml`, leaving the test-file gating unchanged so the mocked and real integration paths remain intentionally separated.
- **Exact files changed:**
  - `.github/workflows/ci.yml`
  - `.github/workflows/deploy-functions.yml`
- **Whether Azurite-backed coverage is now actually exercised:** Yes at workflow-contract level. The updated workflow env now targets the real Azurite integration path rather than silently skipping it. A local forced run with `AZURITE_TEST=true AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true` confirmed the three Azurite integration tests stop skipping and attempt real connections.
- **Local validation performed:**
  - `AZURITE_TEST=true AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true pnpm --filter @hbc/functions test`
  - `pnpm --filter @hbc/provisioning test`
  - local availability check: `which azurite`
- **Local validation result:**
  - `@hbc/provisioning` passed unchanged.
  - `@hbc/functions` no longer silently skipped the Azurite integration block when the flag was set; instead, `src/services/table-storage-service.test.ts` executed the three real Azurite tests and failed with `connect EPERM 127.0.0.1:10002`, which is consistent with this local environment lacking a runnable Azurite service (`which azurite` returned not found).
  - This is truth-preserving behavior: the repo no longer presents a false-green mock-only posture when the workflow claims Azurite-backed coverage.
- **Closure status:** `Partially Closed`
- **Remaining limitation:** Hosted-run confirmation still remains. This local environment could not provide a runnable Azurite endpoint, so end-to-end proof of the GitHub-hosted runner path still depends on the workflows executing on Actions with the Azurite startup step active.

### Prompt-05 Follow-up Progress — Workspace Lint Burn-Down

- **Original active blocker at prompt start:** The report snapshot at prompt start identified `@hbc/complexity` / `packages/complexity/src/components/HbcComplexityDial.tsx` as the first active workspace lint blocker because `TRANSITION_FAST` was imported but unused.
- **Fresh repo-truth refinement:** Fresh workspace reruns showed that Turbo exposes multiple independent lint failures in parallel, so the first failing package can shift based on execution order. In this remediation pass, the observed blocker sequence was:
  - `@hbc/publish-workflow`
  - `@hbc/record-form`
  - `@hbc/spfx-accounting`
  - `@hbc/spfx-business-development`
  - `@hbc/hb-site-control`
- **Remediations implemented:**
  - removed unused imports in `@hbc/publish-workflow`
  - removed unused type imports in `@hbc/record-form`
  - converted surfaced inline-style / hardcoded-pixel accounting page patterns to Griffel classes with HBC spacing tokens, and cleaned related test typing/import warnings
  - converted the surfaced business-development page inline-style / hardcoded-pixel pattern to Griffel classes with HBC spacing tokens
  - updated `HbcComplexityDial` to use `TRANSITION_FAST` for the two transition durations so the original starting blocker is no longer present
- **Exact files changed:**
  - `packages/publish-workflow/src/components/PublishApprovalChecklistShell.tsx`
  - `packages/publish-workflow/src/components/PublishPanelShell.tsx`
  - `packages/publish-workflow/src/hooks/usePublishReadinessState.ts`
  - `packages/publish-workflow/package.json`
  - `packages/record-form/src/model/lifecycle.ts`
  - `packages/record-form/package.json`
  - `apps/accounting/src/pages/OverviewPage.tsx`
  - `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
  - `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
  - `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
  - `apps/accounting/src/test/complexity.test.tsx`
  - `apps/accounting/package.json`
  - `apps/business-development/src/pages/PipelinePage.tsx`
  - `apps/business-development/package.json`
  - `packages/complexity/src/components/HbcComplexityDial.tsx`
  - `packages/complexity/package.json`
- **Validation commands run:**
  - repeated source-of-truth runs of `pnpm turbo run lint`
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-business-development lint`
  - `pnpm --filter @hbc/complexity lint`
- **Resulting status:** `Partially Closed`
- **Why not closed:** The prompt’s original starting blocker is now closed, but the workspace lint gate is still red because the latest rerun now fails in `@hbc/hb-site-control`.
- **Exact next blocker now exposed:** `@hbc/hb-site-control` with concentrated app-surface token/inline-style debt across `apps/hb-site-control/src/pages/HomePage.tsx`, `apps/hb-site-control/src/pages/ObservationsPage.tsx`, and `apps/hb-site-control/src/pages/SafetyMonitoringPage.tsx`. This is still ordinary lint debt, but it is broader than a single isolated warning.

### Prompt-06 Progress — `@hbc/hb-site-control` Lint Remediation

- **Original active blocker at prompt start:** `@hbc/hb-site-control` with concentrated `@hb-intel/hbc/enforce-hbc-tokens` and `@hb-intel/hbc/no-inline-styles` failures in `apps/hb-site-control/src/pages/HomePage.tsx`, `apps/hb-site-control/src/pages/ObservationsPage.tsx`, and `apps/hb-site-control/src/pages/SafetyMonitoringPage.tsx`.
- **Remediations implemented:**
  - replaced the surfaced inline `style` props in the three pages with Griffel classes
  - replaced the surfaced hardcoded pixel values with HBC spacing tokens or token-derived values in Griffel
  - kept the safety-monitoring connection indicator dynamic by switching from inline style to conditional Griffel classes
- **Exact files changed:**
  - `apps/hb-site-control/src/pages/HomePage.tsx`
  - `apps/hb-site-control/src/pages/ObservationsPage.tsx`
  - `apps/hb-site-control/src/pages/SafetyMonitoringPage.tsx`
  - `apps/hb-site-control/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/hb-site-control lint`
  - `pnpm turbo run lint`
- **Resulting status:** `Partially Closed`
- **Why not closed:** The `@hbc/hb-site-control` lint cluster itself is remediated and the package now passes lint, but the full workspace lint gate is still red.
- **Exact next blocker now exposed:** `@hbc/dev-harness`, with the latest rerun surfacing token and inline-style debt in `apps/dev-harness/src/DevControls.tsx`, `apps/dev-harness/src/pages/DemoCharts.tsx`, `apps/dev-harness/src/pages/WorkspacePlaceholder.tsx`, and several `apps/dev-harness/src/tabs/*.tsx` files.

### Prompt-07 Progress — Workspace Lint Blocker Revalidation

- **Original prompt assumption:** `@hbc/dev-harness` was believed to be the current first workspace lint blocker after Prompt-06.
- **Fresh validation command:** `pnpm turbo run lint`
- **Revised current blocker:** The fresh rerun did not fail first in `@hbc/dev-harness`; it failed first in `@hbc/features-project-hub` at `packages/features/project-hub/src/spfx-lane/ProjectHubSpfxLaneSurface.tsx` on `@hb-intel/hbc/enforce-hbc-tokens`.
- **Remediation implemented:** Replaced the hardcoded supporting-card background and primary-card shadow styling in `ProjectHubSpfxLaneSurface.tsx` with repo-approved `@hbc/ui-kit` exports (`HBC_SURFACE_LIGHT['surface-1']` and `elevationLevel1`) and patch-bumped `@hbc/features-project-hub`.
- **Exact files changed:**
  - `packages/features/project-hub/src/spfx-lane/ProjectHubSpfxLaneSurface.tsx`
  - `packages/features/project-hub/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/features-project-hub lint`
  - `pnpm turbo run lint`
  - `pnpm --filter @hbc/dev-harness lint`
- **Resulting status:** `Superseded/Reframed`
- **Why this status applies:** The original `dev-harness`-first assumption is no longer true in fresh repo truth. The true current upstream blocker was repaired first, and a follow-up workspace rerun now surfaces `@hbc/spfx-leadership` before `@hbc/dev-harness`.
- **Did `dev-harness` still fail independently?:** Yes. `pnpm --filter @hbc/dev-harness lint` still reports `27 problems (7 errors, 20 warnings)` across `DevControls.tsx`, `DemoCharts.tsx`, `WorkspacePlaceholder.tsx`, and multiple `src/tabs/*.tsx` files, but that package is not the current first workspace failure after the Prompt-07 rerun.
- **Exact next blocker now exposed:** `@hbc/spfx-leadership` in `apps/leadership/src/pages/KpiDashboardPage.tsx`, with `@hb-intel/hbc/no-inline-styles` and `@hb-intel/hbc/enforce-hbc-tokens` violations. This remains ordinary app-surface lint debt rather than a config or workflow regression.

### Prompt-08 Progress — Workspace Lint Blocker Revalidation

- **Original prompt assumption:** `@hbc/spfx-leadership` was believed to be the current first workspace lint blocker after Prompt-07.
- **Fresh validation command:** `pnpm turbo run lint`
- **Revised current blocker:** The fresh rerun did not fail first in `@hbc/spfx-leadership`; it failed first in `@hbc/dev-harness`.
- **Remediation implemented:** Replaced the surfaced `dev-harness` inline style props with Griffel classes, introduced a shared preview-shell style hook for repeated tab wrappers, converted the page-level hardcoded spacing values to HBC spacing tokens, and patch-bumped `@hbc/dev-harness`.
- **Exact files changed:**
  - `apps/dev-harness/src/DevControls.tsx`
  - `apps/dev-harness/src/pages/DemoCharts.tsx`
  - `apps/dev-harness/src/pages/WorkspacePlaceholder.tsx`
  - `apps/dev-harness/src/tabs/usePreviewShellStyles.ts`
  - `apps/dev-harness/src/tabs/AccountingTab.tsx`
  - `apps/dev-harness/src/tabs/AdminTab.tsx`
  - `apps/dev-harness/src/tabs/BusinessDevelopmentTab.tsx`
  - `apps/dev-harness/src/tabs/EstimatingTab.tsx`
  - `apps/dev-harness/src/tabs/HumanResourcesTab.tsx`
  - `apps/dev-harness/src/tabs/LeadershipTab.tsx`
  - `apps/dev-harness/src/tabs/OperationalExcellenceTab.tsx`
  - `apps/dev-harness/src/tabs/ProjectHubTab.tsx`
  - `apps/dev-harness/src/tabs/PwaPreview.tsx`
  - `apps/dev-harness/src/tabs/QualityControlWarrantyTab.tsx`
  - `apps/dev-harness/src/tabs/RiskManagementTab.tsx`
  - `apps/dev-harness/src/tabs/SafetyTab.tsx`
  - `apps/dev-harness/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/dev-harness lint`
  - `pnpm turbo run lint`
- **Resulting status:** `Partially Closed`
- **Why this status applies:** The surfaced `@hbc/dev-harness` cluster is remediated and package-local lint now passes, but the full workspace lint gate is still red.
- **Does `spfx-leadership` still require follow-up?:** Yes, but it is no longer the current first blocker after the latest rerun.
- **Exact next blocker now exposed:** `@hbc/spfx-admin`, with the latest rerun surfacing hardcoded-pixel token debt first in `apps/admin/src/pages/OperationalDashboardPage.tsx` and `apps/admin/src/pages/ProvisioningOversightPage.tsx`. This remains ordinary app-surface lint debt rather than a config or workflow regression.

### Prompt-09 Progress — `@hbc/spfx-admin` Lint Remediation

- **Original active blocker at prompt start:** `@hbc/spfx-admin`, with hardcoded-pixel token-style violations in `apps/admin/src/pages/OperationalDashboardPage.tsx` and `apps/admin/src/pages/ProvisioningOversightPage.tsx`.
- **Fresh validation refinement:** A fresh `pnpm turbo run lint` rerun during this prompt again demonstrated that Turbo exposes multiple lint failures in parallel. The prompt started from an `spfx-admin`-first snapshot, but the latest source-of-truth rerun after remediation now fails first in `@hbc/spfx-leadership`.
- **Remediations implemented:**
  - converted the surfaced admin page hardcoded spacing and sizing literals to HBC spacing-token or token-derived values
  - removed an unused provisioning import in `apps/admin/src/hooks/useProbePolling.ts`
  - converted the surfaced `import()` type annotations in the admin test files to explicit type imports
  - patch-bumped `@hbc/spfx-admin`
- **Exact files changed:**
  - `apps/admin/src/pages/OperationalDashboardPage.tsx`
  - `apps/admin/src/pages/ProvisioningOversightPage.tsx`
  - `apps/admin/src/hooks/useProbePolling.ts`
  - `apps/admin/src/test/OperationalDashboardPage.test.tsx`
  - `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
  - `apps/admin/src/test/setup.ts`
  - `apps/admin/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/spfx-admin lint`
  - `pnpm turbo run lint`
- **Resulting status:** `Superseded/Reframed`
- **Why this status applies:** The `@hbc/spfx-admin` package-local lint cluster is remediated and `pnpm --filter @hbc/spfx-admin lint` now passes, but a fresh full workspace rerun no longer fails first in admin. The current first workspace lint blocker has shifted again.
- **Exact next blocker now exposed:** `@hbc/spfx-leadership`, with the latest rerun surfacing `@hb-intel/hbc/no-inline-styles` and `@hb-intel/hbc/enforce-hbc-tokens` violations first in `apps/leadership/src/pages/KpiDashboardPage.tsx`. This remains ordinary app-surface lint debt rather than a config or workflow regression.

### Prompt-10 Progress — Workspace Lint Blocker Revalidation

- **Original prompt assumption:** `@hbc/spfx-leadership` was believed to be the current first workspace lint blocker at the start of this prompt.
- **Fresh validation command:** `pnpm turbo run lint`
- **Revised current blocker:** The fresh rerun did not fail first in `@hbc/spfx-leadership`; it failed first in `@hbc/bulk-actions`.
- **Remediations implemented:**
  - removed the unused `IBulkConfiguredInputSchema` type import from `packages/bulk-actions/src/components/BulkActionInputDialogShell.tsx`
  - removed the unused `BulkResultKind` type import from `packages/bulk-actions/src/execution/executionEngine.ts`
  - patch-bumped `@hbc/bulk-actions`
- **Exact files changed:**
  - `packages/bulk-actions/src/components/BulkActionInputDialogShell.tsx`
  - `packages/bulk-actions/src/execution/executionEngine.ts`
  - `packages/bulk-actions/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/bulk-actions lint`
  - `pnpm turbo run lint`
- **Did `spfx-leadership` still fail later in the run?:** Yes. The reruns still surfaced `apps/leadership/src/pages/KpiDashboardPage.tsx` later in the queue, but leadership was not the first failing package in the final source-of-truth rerun.
- **Resulting status:** `Superseded/Reframed`
- **Why this status applies:** The original leadership-first assumption is no longer true in fresh repo truth. The true current upstream blocker was `@hbc/bulk-actions`, and after that package was remediated the workspace front shifted again before leadership became first.
- **Exact next blocker now exposed:** `@hbc/activity-timeline`, with warning-level lint debt in `packages/activity-timeline/src/hooks/hooks.test.ts`, `packages/activity-timeline/src/hooks/useActivityFilters.ts`, and `packages/activity-timeline/src/types/contracts.test.ts`. This remains ordinary warning-driven lint debt rather than a config or workflow regression.

### Prompt-11 Progress — Workspace Lint Blocker Revalidation

- **Original prompt assumption:** `@hbc/activity-timeline` was believed to be the current first workspace lint blocker at the start of this prompt.
- **Fresh validation command:** `pnpm turbo run lint`
- **Revised current blocker:** The fresh rerun did not fail first in `@hbc/activity-timeline`; it failed first in `@hbc/saved-views`.
- **Remediations implemented:**
  - removed the unused `useCallback` import from `packages/saved-views/src/components/SaveViewDialogShell.tsx`
  - removed the unused `remainingFilters` binding from `packages/saved-views/src/model/compatibility.ts`
  - patch-bumped `@hbc/saved-views`
- **Exact files changed:**
  - `packages/saved-views/src/components/SaveViewDialogShell.tsx`
  - `packages/saved-views/src/model/compatibility.ts`
  - `packages/saved-views/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/saved-views lint`
  - `pnpm turbo run lint`
- **Did `activity-timeline` still fail later in the run?:** No. The final source-of-truth rerun shifted again before `activity-timeline` became first and instead failed first in `@hbc/spfx-project-hub`.
- **Resulting status:** `Superseded/Reframed`
- **Why this status applies:** The original `activity-timeline`-first assumption is no longer true in fresh repo truth. The true current upstream blocker was `@hbc/saved-views`, and after that package was remediated the workspace front shifted again before `activity-timeline` became first.
- **Exact next blocker now exposed:** `@hbc/spfx-project-hub`, with token-style lint debt in `apps/project-hub/src/pages/ProjectModulePage.tsx` (`@hb-intel/hbc/enforce-hbc-tokens` on hardcoded rgb/hex/pixel values). This remains ordinary app-surface lint debt rather than a config or workflow regression.

### Prompt-12 Progress — `@hbc/spfx-project-hub` Lint Remediation

- **Original active blocker at prompt start:** `@hbc/spfx-project-hub`, with `@hb-intel/hbc/enforce-hbc-tokens` failures in `apps/project-hub/src/pages/ProjectModulePage.tsx` caused by hardcoded rgb/hex/pixel values in style contexts.
- **Remediations implemented:**
  - replaced the surfaced primary-card hardcoded shadow with `elevationLevel1`
  - replaced the surfaced supporting-card hardcoded background with `HBC_SURFACE_LIGHT['surface-1']`
  - patch-bumped `@hbc/spfx-project-hub`
- **Exact files changed:**
  - `apps/project-hub/src/pages/ProjectModulePage.tsx`
  - `apps/project-hub/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/spfx-project-hub lint`
  - `pnpm turbo run lint`
- **Resulting status:** `Partially Closed`
- **Why this status applies:** The `@hbc/spfx-project-hub` package-local lint blocker is remediated and now passes in isolation, but the full workspace lint gate is still red.
- **Exact next blocker now exposed:** `@hbc/acknowledgment`, with warning-level lint debt in `packages/acknowledgment/src/components/HbcAcknowledgmentModal.tsx` (`@typescript-eslint/no-unused-vars` on the unused `mergeClasses` import). This remains ordinary warning-driven lint debt rather than a config or workflow regression.

### Prompt-13 Progress — Workspace Lint Blocker Revalidation

- **Original prompt assumption:** `@hbc/acknowledgment` was believed to be the current first workspace lint blocker at the start of this prompt.
- **Fresh validation command:** `pnpm turbo run lint`
- **Revised current blocker:** The fresh rerun did not fail first in `@hbc/acknowledgment`; it failed first in `@hbc/spfx-leadership` at `apps/leadership/src/pages/KpiDashboardPage.tsx`.
- **Remediations implemented:**
  - replaced the surfaced inline `style` props in `KpiDashboardPage.tsx` with Griffel classes
  - replaced the surfaced hardcoded `4`, `12`, `16`, `24`, and `220px` spacing/layout literals with existing `@hbc/ui-kit` HBC spacing tokens
  - patch-bumped `@hbc/spfx-leadership`
- **Exact files changed:**
  - `apps/leadership/src/pages/KpiDashboardPage.tsx`
  - `apps/leadership/package.json`
- **Validation commands run:**
  - `pnpm --filter @hbc/spfx-leadership lint`
  - `pnpm turbo run lint`
- **Did `acknowledgment` still fail later in the run?:** Yes. The rerun still surfaced `packages/acknowledgment/src/components/HbcAcknowledgmentModal.tsx` with the unused `mergeClasses` import warning, but it was not the first failing package in the final source-of-truth rerun.
- **Resulting status:** `Partially Closed`
- **Why this status applies:** The `acknowledgment`-first assumption was superseded by fresh repo truth, the true current blocker (`@hbc/spfx-leadership`) was remediated, and the full workspace lint gate is still red.
- **Exact next blocker now exposed:** `@hbc/activity-timeline`, with warning-level lint debt in `packages/activity-timeline/src/hooks/hooks.test.ts`, `packages/activity-timeline/src/hooks/useActivityFilters.ts`, and `packages/activity-timeline/src/types/contracts.test.ts` (`@typescript-eslint/no-unused-vars`). This remains ordinary warning-driven lint debt rather than a config or workflow regression.

## Post-Remediation Status

- **Validation commands run:**
  - repeated `pnpm turbo run lint` reruns during blocker burn-down
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-business-development lint`
  - `pnpm --filter @hbc/complexity lint`
  - `pnpm --filter @hbc/hb-site-control lint`
  - `pnpm turbo run check-types`
  - `pnpm exec prettier --check .github/workflows/release.yml .github/workflows/e2e.yml .github/workflows/deploy-functions.yml .github/workflows/P0-E1-gate.yml`
  - `AZURITE_TEST=true AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true pnpm --filter @hbc/functions test`
  - `pnpm --filter @hbc/provisioning test`
  - `which azurite`
  - `pnpm --filter @hbc/features-project-hub lint`
  - `pnpm --filter @hbc/dev-harness lint`
  - `pnpm --filter @hbc/spfx-admin lint`
  - `pnpm --filter @hbc/bulk-actions lint`
  - `pnpm --filter @hbc/saved-views lint`
  - `pnpm --filter @hbc/spfx-project-hub lint`
  - `pnpm --filter @hbc/spfx-leadership lint`
- **Result: `pnpm turbo run lint`**
  - **Confirmed fact:** The original missing-ESLint-config failure class is no longer active.
  - **Confirmed fact:** The Prompt-05 follow-up pass cleared the observed blockers in `@hbc/publish-workflow`, `@hbc/record-form`, `@hbc/spfx-accounting`, `@hbc/spfx-business-development`, and the original starting blocker in `@hbc/complexity`.
  - **Confirmed fact:** Prompt-06 remediated the surfaced `@hbc/hb-site-control` page cluster and `pnpm --filter @hbc/hb-site-control lint` now passes.
  - **Confirmed fact:** Prompt-07 remediated the surfaced `@hbc/features-project-hub` token violations in `packages/features/project-hub/src/spfx-lane/ProjectHubSpfxLaneSurface.tsx`, and `pnpm --filter @hbc/features-project-hub lint` now passes.
  - **Confirmed fact:** Prompt-08 remediated the surfaced `@hbc/dev-harness` token and inline-style cluster, and `pnpm --filter @hbc/dev-harness lint` now passes.
  - **Confirmed fact:** Prompt-09 remediated the surfaced `@hbc/spfx-admin` token-style cluster and `pnpm --filter @hbc/spfx-admin lint` now passes.
  - **Confirmed fact:** Prompt-10 remediated the surfaced `@hbc/bulk-actions` warning-level lint cluster and `pnpm --filter @hbc/bulk-actions lint` now passes.
  - **Confirmed fact:** Prompt-11 remediated the surfaced `@hbc/saved-views` warning-level lint cluster and `pnpm --filter @hbc/saved-views lint` now passes.
  - **Confirmed fact:** Prompt-12 remediated the surfaced `@hbc/spfx-project-hub` token-style cluster and `pnpm --filter @hbc/spfx-project-hub lint` now passes.
  - **Confirmed fact:** Prompt-13 remediated the surfaced `@hbc/spfx-leadership` token and inline-style cluster and `pnpm --filter @hbc/spfx-leadership lint` now passes.
  - **Confirmed fact:** The latest full rerun now fails first in `@hbc/activity-timeline`, not `@hbc/acknowledgment`, `@hbc/spfx-project-hub`, `@hbc/spfx-leadership`, `@hbc/spfx-admin`, or `@hbc/dev-harness`.
  - **Confirmed fact:** The current first failing files are `packages/activity-timeline/src/hooks/hooks.test.ts`, `packages/activity-timeline/src/hooks/useActivityFilters.ts`, and `packages/activity-timeline/src/types/contracts.test.ts`, surfacing `@typescript-eslint/no-unused-vars` on unused imported types and symbols.
  - **Inferred conclusion:** The remaining workspace lint gate is still blocked by ordinary warning-level lint debt rather than a configuration or package-manager defect.
  - **Status:** `Partially Closed`
- **Result: `pnpm turbo run check-types`**
  - **Confirmed fact:** The command now passes for the workspace.
  - **Status:** `Closed`
- **Result: Release workflow validation**
  - **Confirmed fact:** Repo-truth review and local workflow-file validation confirm the reusable-workflow structure is repaired.
  - **Confirmed fact:** Hosted GitHub execution remains unverified in this session.
  - **Status:** `Closed` for structural validity; hosted-run proof remains unresolved.
- **Result: Azurite-backed test-path validation**
  - **Confirmed fact:** The workflows now set `AZURITE_TEST='true'` in the jobs that already provision an Azurite-backed path.
  - **Confirmed fact:** The forced local `@hbc/functions` run no longer skips the real Azurite block; it attempts real storage connections and fails only because this machine does not have a runnable Azurite service (`which azurite` returned no local binary).
  - **Confirmed fact:** `@hbc/provisioning` tests passed.
  - **Status:** `Partially Closed`
- **Findings now closed:**
  - the `project-canvas` / `features-project-hub` package-boundary typecheck failure
  - the `Release` workflow reusable-orchestration structural defects
  - the original missing package-local ESLint configuration failure class
  - the Prompt-05 starting blocker in `packages/complexity/src/components/HbcComplexityDial.tsx`
  - the Prompt-06 `@hbc/hb-site-control` lint cluster
  - the Prompt-07 `@hbc/features-project-hub` token-style lint cluster
  - the Prompt-08 `@hbc/dev-harness` lint cluster
  - the Prompt-09 `@hbc/spfx-admin` lint cluster
  - the Prompt-10 `@hbc/bulk-actions` warning-level lint cluster
  - the Prompt-11 `@hbc/saved-views` warning-level lint cluster
  - the Prompt-12 `@hbc/spfx-project-hub` token-style lint cluster
  - the Prompt-13 `@hbc/spfx-leadership` token and inline-style lint cluster
- **Findings still open:**
  - the workspace lint gate remains red on ordinary warning-level lint debt, currently surfacing first in `@hbc/activity-timeline`
  - additional package-level warning and app-surface lint debt still appears deeper in the queue (`@hbc/acknowledgment`, `@hbc/spfx-project-sites`, `@hbc/models`, `@hbc/data-seeding`, `@hbc/query-hooks`, `@hbc/related-items`), but none of those are the current first blocker in the latest rerun
  - full Azurite-backed workflow execution still needs an environment with a working Azurite service
- **Hosted-run-only items still unverified:**
  - latest GitHub Actions run-log confirmation for `CI`, `CD`, and `Release`
  - secrets-backed deploy behavior in hosted runners

## 1. Executive Summary

- **Confirmed fact:** The first upstream workflow/job still failing in the primary repo-wide path is `CI` -> `lint-and-typecheck` -> `Lint`, which runs `pnpm turbo run lint` at `.github/workflows/ci.yml:23-24`.
- **Superseded/Reframed:** The original report conclusion that the earliest lint break was missing ESLint config discoverability is no longer the current repo truth. Prompt-01 remediated that failure class.
- **Confirmed fact:** Prompt-05 follow-up remediation cleared the observed blockers in `@hbc/publish-workflow`, `@hbc/record-form`, `@hbc/spfx-accounting`, `@hbc/spfx-business-development`, and the original starting blocker in `@hbc/complexity`.
- **Confirmed fact:** Prompt-06 remediated the surfaced `@hbc/hb-site-control` lint cluster and moved the current observed workspace blocker to `@hbc/dev-harness`.
- **Confirmed fact:** Prompt-07 then reframed the blocker order: a fresh rerun exposed `@hbc/features-project-hub` first, and that package-local token-style issue was remediated.
- **Confirmed fact:** Prompt-08 remediated the `@hbc/dev-harness` token/inline-style cluster after a fresh rerun re-exposed it as the true current blocker.
- **Confirmed fact:** Prompt-09 remediated the surfaced `@hbc/spfx-admin` token-style cluster and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-10 remediated the surfaced `@hbc/bulk-actions` warning-level lint cluster and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-11 remediated the surfaced `@hbc/saved-views` warning-level lint cluster and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-12 remediated the surfaced `@hbc/spfx-project-hub` token-style cluster and the app now passes lint in isolation.
- **Confirmed fact:** Prompt-13 remediated the surfaced `@hbc/spfx-leadership` token and inline-style cluster and the app now passes lint in isolation.
- **Confirmed fact:** The latest full workspace rerun now fails first in `@hbc/activity-timeline`, with `packages/activity-timeline/src/hooks/hooks.test.ts`, `packages/activity-timeline/src/hooks/useActivityFilters.ts`, and `packages/activity-timeline/src/types/contracts.test.ts` surfacing the first current warning-level errors.
- **Inferred conclusion:** The active lint problem is now ordinary warning-level package debt under `--max-warnings 0`, and Turbo’s parallel execution means the first failing package can shift as earlier blockers are removed.
- **Confirmed fact:** `pnpm turbo run check-types` now passes, so the prior `project-canvas` / `features-project-hub` boundary failure has been removed from the active failure chain.
- **Confirmed fact:** The `Release` workflow’s previously reported reusable-workflow defects are repaired in repo truth: `.github/workflows/e2e.yml` now exposes `workflow_call`, `.github/workflows/deploy-functions.yml` now exposes `workflow_call`, and `.github/workflows/release.yml` now declares a correct `needs` relationship for `p0-e1-gate`.
- **Confirmed fact:** The Azurite workflow truthfulness gap is reduced. `.github/workflows/ci.yml:81-86` and `.github/workflows/deploy-functions.yml:51-55` now set `AZURITE_TEST='true'`, so the workflow contract targets the real Azurite-gated test path instead of silently skipping it.
- **Confirmed fact:** `pnpm install --frozen-lockfile` remained green throughout the investigation/remediation sequence, so lockfile drift was never the leading cause.
- **Inferred conclusion:** The broad “all Actions are failing” diagnosis from the initial investigation is now overstated. Current repo truth shows one active upstream lint gate failure class that still blocks `CD`, while the previously identified typecheck and `Release` structural failures have been remediated.
- **Unresolved issue:** Hosted GitHub Actions run-log confirmation remains unavailable in this session because the configured `gh` authentication is invalid.

## 2. Workflow Dependency Map

- **Confirmed fact:** Primary entrypoint workflow: `CI` (`.github/workflows/ci.yml`) runs on `pull_request` to `main` and `push` to `main`.
- **Confirmed fact:** Downstream deployment workflow: `CD` (`.github/workflows/cd.yml`) runs on `workflow_run` for workflow `CI` on branch `main`.
- **Confirmed fact:** SPFx packaging entrypoint: `SPFx Build and Package` (`.github/workflows/spfx-build.yml`) runs on `push` to `main`/`develop` for SPFx-relevant paths, on `pull_request` to `main`, and on `workflow_dispatch`.
- **Confirmed fact:** SPFx deployment workflow: `SPFx Deploy to App Catalog` (`.github/workflows/spfx-deploy.yml`) runs on `workflow_run` for workflow `SPFx Build and Package` on branch `main`, or manually via `workflow_dispatch`.
- **Confirmed fact:** Release orchestration workflow: `Release` (`.github/workflows/release.yml`) runs on semantic version tags matching `v*`.
- **Confirmed fact:** Functions deployment workflow: `Deploy Azure Functions` (`.github/workflows/deploy-functions.yml`) runs directly on `push` to `main` and on `workflow_dispatch`.
- **Confirmed fact:** Provisioning E2E workflow: `Provisioning E2E` (`.github/workflows/e2e.yml`) runs on `workflow_dispatch` and on tag pushes matching `v*`.
- **Confirmed fact:** Security workflow: `Security` (`.github/workflows/security.yml`) runs on PRs to `main`, a weekly cron, and manual dispatch.
- **Confirmed fact:** Smoke workflow: `Smoke Tests` (`.github/workflows/smoke-tests.yml`) runs on PRs to `main` and a daily cron.
- **Confirmed fact:** `Promote Ideas to Issues` is effectively disabled because its only job has `if: false`.

```text
CI
└── CD (workflow_run on successful CI completion only)

SPFx Build and Package
└── SPFx Deploy to App Catalog (workflow_run on successful build completion only)

Release
├── validate-tag
├── p0-e1-gate (attempted reusable workflow call)
├── e2e-gate (reusable workflow call)
└── deploy-production (reusable workflow call gated by e2e + conditional P0-E1 success)

Deploy Azure Functions
└── independent direct push/manual workflow; not gated by CD
```

- **Inferred conclusion:** Not all Actions fail for the same reason. `CD` skips still cascade from `CI`, but `Release` is no longer structurally invalid in repo truth.

## 3. Confirmed Workflow Facts

- **Confirmed fact:** In `CI`, the `lint-and-typecheck` job runs `pnpm install --frozen-lockfile`, then `pnpm turbo run lint`, then the stub scan, then `pnpm turbo run check-types` (`.github/workflows/ci.yml:12-61`).
- **Confirmed fact:** In `CI`, the `unit-tests` job starts Azurite, then runs `pnpm turbo run test --filter=@hbc/functions --filter=@hbc/provisioning` with `AZURITE_TEST='true'` and `AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true` (`.github/workflows/ci.yml:63-86`).
- **Confirmed fact:** In `CD`, the gate job `check-ci` only exists when `github.event.workflow_run.conclusion == 'success'` (`.github/workflows/cd.yml:18-23`).
- **Confirmed fact:** Every deploy job in `CD` declares `needs: check-ci` (`.github/workflows/cd.yml:25-109`).
- **Confirmed fact:** If upstream `CI` does not conclude with success, `check-ci` is skipped and the downstream deploy jobs are therefore blocked/skipped rather than independently validated.
- **Confirmed fact:** `Release` attempts to use `.github/workflows/P0-E1-gate.yml` as a reusable workflow, and that file does expose `on: workflow_call` (`.github/workflows/P0-E1-gate.yml:8-10`).
- **Confirmed fact:** `Release` uses `.github/workflows/e2e.yml` and `.github/workflows/deploy-functions.yml` as reusable workflows, and both files now expose `on: workflow_call` (`.github/workflows/e2e.yml:3-8`, `.github/workflows/deploy-functions.yml:4-24`).
- **Confirmed fact:** `deploy-production` in `.github/workflows/release.yml:37-45` now declares `needs: [e2e-gate, p0-e1-gate]` and gates production deploys with an `always()`-guarded condition that distinguishes `v1.0.x` tags from later release tags.
- **Inferred conclusion:** The `Release` workflow is structurally coherent in repo truth, though hosted-run confirmation is still pending.

## 4. Confirmed Repo / Script / Package Facts

- **Confirmed fact:** The root workspace declares `packageManager: "pnpm@10.13.1"` and `engines.node: ">=20"` in `package.json`.
- **Confirmed fact:** The root workspace command `pnpm test` is not full workspace coverage; it only targets a subset of packages via explicit Turbo filters in `package.json`.
- **Confirmed fact:** `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `packages/features/*`, `backend/*`, and `tools/*`, excluding `tools/spfx-shell`.
- **Confirmed fact:** `turbo.json` defines `lint`, `check-types`, `build`, and `test` tasks. `check-types` depends on `^build`, so a build failure in a dependency chain can surface during `pnpm turbo run check-types`.
- **Confirmed fact:** Prompt-01 remediation added package-local `.eslintrc.cjs` files to the previously broken lint-script packages, so the active lint failure is no longer config discoverability.
- **Confirmed fact:** `packages/complexity/src/components/HbcComplexityDial.tsx` is no longer an active blocker; Prompt-05 updated it to use `TRANSITION_FAST`.
- **Confirmed fact:** `@hbc/hb-site-control` is no longer an active blocker; Prompt-06 remediated its surfaced page token/inline-style debt and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-07 remediated the surfaced `@hbc/features-project-hub` token-style issue and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-08 remediated the surfaced `@hbc/dev-harness` token/inline-style issue and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-09 remediated the surfaced `@hbc/spfx-admin` token-style issue and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-10 remediated the surfaced `@hbc/bulk-actions` warning-level issue and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-11 remediated the surfaced `@hbc/saved-views` warning-level issue and the package now passes lint in isolation.
- **Confirmed fact:** Prompt-12 remediated the surfaced `@hbc/spfx-project-hub` token-style issue and the app now passes lint in isolation.
- **Confirmed fact:** Prompt-13 remediated the surfaced `@hbc/spfx-leadership` token and inline-style issue and the app now passes lint in isolation.
- **Confirmed fact:** The current observed first workspace lint blocker is `@hbc/activity-timeline`, not `@hbc/acknowledgment`, `@hbc/spfx-project-hub`, `@hbc/spfx-leadership`, `@hbc/spfx-admin`, `@hbc/dev-harness`, or `@hbc/complexity`.
- **Confirmed fact:** Prompt-02 moved the Project Hub-specific canvas registration seam into `packages/features/project-hub/src/canvas/**`, so `@hbc/project-canvas` no longer needs to import feature-owned hooks/components from `@hbc/features-project-hub`.
- **Inferred conclusion:** The prior package-boundary failure has been replaced by a valid one-way integration model: the feature package registers its tiles into the canvas package instead of the canvas package depending upward.
- **Confirmed fact:** `createAppTableClient()` treats `AZURE_TABLE_ENDPOINT` as either an HTTP endpoint or a connection string (`backend/functions/src/utils/table-client-factory.ts:21-30`).
- **Confirmed fact:** The real Azurite integration suite in `backend/functions/src/services/table-storage-service.test.ts` is wrapped in `describe.runIf(process.env.AZURITE_TEST === 'true')` (`backend/functions/src/services/table-storage-service.test.ts:6,27`).
- **Confirmed fact:** The CI and deploy-functions unit-test jobs now set both `AZURITE_TEST='true'` and `AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true` (`.github/workflows/ci.yml:81-86`, `.github/workflows/deploy-functions.yml:51-55`).

## 5. Reproduced Failure Findings

### Command: `pnpm install --frozen-lockfile`

- **Confirmed fact:** Local reproduction succeeded.

```text
Scope: all 64 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 801ms using pnpm v10.13.1
```

- **Inferred conclusion:** The current repo state does not exhibit lockfile drift as the first-order repo-wide CI failure.

### Command: `pnpm turbo run lint`

- **Confirmed fact:** Fresh reruns during Prompt-05 through Prompt-13 did not reveal one stable serial blocker. As earlier packages were repaired, the observed failing package sequence became `@hbc/publish-workflow`, then `@hbc/record-form`, then `@hbc/spfx-accounting`, then `@hbc/spfx-business-development`, then `@hbc/hb-site-control`, then `@hbc/dev-harness`, then `@hbc/features-project-hub`, then `@hbc/spfx-leadership`, then `@hbc/spfx-admin`, then `@hbc/bulk-actions`, then `@hbc/activity-timeline`, then `@hbc/saved-views`, then `@hbc/spfx-project-hub`, then `@hbc/acknowledgment`, and now back to `@hbc/activity-timeline`.
- **Confirmed fact:** `@hbc/publish-workflow`, `@hbc/record-form`, `@hbc/spfx-accounting`, `@hbc/spfx-business-development`, `@hbc/hb-site-control`, the original `@hbc/complexity` blocker, the Prompt-07 `@hbc/features-project-hub` blocker, the Prompt-08 `@hbc/dev-harness` blocker, the Prompt-09 `@hbc/spfx-admin` blocker, the Prompt-10 `@hbc/bulk-actions` blocker, the Prompt-11 `@hbc/saved-views` blocker, the Prompt-12 `@hbc/spfx-project-hub` blocker, and the Prompt-13 `@hbc/spfx-leadership` blocker are now remediated in repo truth.
- **Confirmed fact:** The latest full workspace rerun currently fails on `@hbc/activity-timeline`.

```text
@hbc/activity-timeline:lint: /Users/bobbyfetting/hb-intel/packages/activity-timeline/src/hooks/hooks.test.ts
@hbc/activity-timeline:lint:   4:3  warning  'UseActivityTimelineOptions' is defined but never used  @typescript-eslint/no-unused-vars
@hbc/activity-timeline#lint: command (/Users/bobbyfetting/hb-intel/packages/activity-timeline) /opt/homebrew/bin/pnpm run lint exited (1)
```

- **Inferred conclusion:** The earliest active repo-wide CI break is still the lint step, but the remaining root cause is ordinary warning-level lint debt across multiple packages rather than a configuration defect.

### Command: `pnpm turbo run check-types`

- **Confirmed fact:** Fresh local reproduction now succeeds with exit code 0.

```text
Tasks:    83 successful, 83 total
Cached:   76 cached, 83 total
Time:     27.83s
```

- **Confirmed fact:** The prior `@hbc/project-canvas` / `@hbc/features-project-hub` failure is no longer reproduced.
- **Inferred conclusion:** The boundary/typecheck remediation is effective and no longer part of the active CI failure chain.

### Command: `pnpm turbo run test --filter=@hbc/functions --filter=@hbc/provisioning`

- **Confirmed fact:** The original ungated local workspace test run passed before Prompt-04, but it skipped the real Azurite block.
- **Confirmed fact:** After Prompt-04, a forced local run with `AZURITE_TEST=true AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true pnpm --filter @hbc/functions test` no longer skips the real Azurite block; it attempts the integration tests and fails on `connect EPERM 127.0.0.1:10002` when no Azurite service is available.
- **Confirmed fact:** `pnpm --filter @hbc/provisioning test` still passes.
- **Inferred conclusion:** The workflow/test contract is now truthful about the intended integration path, but complete end-to-end proof still depends on an environment that can actually run Azurite.

### Hosted-run confirmation attempt

- **Confirmed fact:** `gh auth status` failed locally because the configured GitHub token is invalid.

```text
github.com
  X Failed to log in to github.com account RMF112018 (default)
  - The token in default is invalid.
```

- **Unresolved issue:** Latest hosted Actions run logs were not retrievable in this investigation session.

## 6. Root Cause Analysis

- **Confirmed fact:** The first upstream workflow or job actually failing in the primary CI/CD path is `CI` → `lint-and-typecheck` → `Lint` (`pnpm turbo run lint`).
- **Confirmed fact:** “All Actions failing” is not a single-cause condition in the current repo state.
- **Inferred conclusion:** The observed failure pattern is a mix of:
  - **upstream cascade:** `CI` failure still blocks `CD`,
  - **active execution defect:** workspace lint currently fails on broader app-surface code-level lint debt,
  - **remediated historical defects:** the earlier typecheck boundary failure and `Release` structural workflow defects are no longer active in repo truth.
- **Confirmed fact:** There is not a current lockfile/package-manager root cause. `pnpm install --frozen-lockfile` is green locally.
- **Confirmed fact:** There is not a current semantic environment-variable root cause for the broad repo-wide CI/CD failure. `AZURE_TABLE_ENDPOINT` behavior matches the implementation contract, and the workflows now set the Azurite gate variable consistently with test intent.
- **Closed:** The earlier workflow logic/configuration root cause in `Release` has been remediated in repo truth.
- **Closed:** The earlier script/package-path/config drift root cause in workspace lint has been remediated for the missing-config package set.
- **Closed:** The earlier package-boundary / dependency-direction root cause in workspace typecheck has been remediated.
- **Inferred conclusion:** The smallest current fix is no longer a workflow/configuration repair. Prompt-05 through Prompt-13 show the repo is now in a repeated package/app lint clean-up phase, with `@hbc/activity-timeline` as the current observed front of that queue.

## 7. Contributing Factors

- **Confirmed fact:** `CD` uses `workflow_run` on `CI` and an explicit success gate, so downstream jobs will be blocked/skipped whenever CI is red.
- **Superseded/Reframed:** Missing package-local ESLint config across several packages was a real earlier contributing factor, but it is no longer an active blocker after Prompt-01.
- **Superseded/Reframed:** Turbo’s `check-types` dependency on `^build` amplified the earlier boundary defect, but that defect is no longer active after Prompt-02.
- **Superseded/Reframed:** The release orchestration workflow introduced in commit `390d723a` was structurally invalid before Prompt-03, but that structural defect is no longer active in repo truth.
- **Confirmed fact:** The workspace lint command fails on warnings because ESLint is configured with `--max-warnings 0` behavior in the affected package scripts, so otherwise minor warnings remain gate-breaking.
- **Confirmed fact:** Hosted workflow execution is still not directly inspectable from this session because GitHub CLI authentication remains invalid.

## 8. Exact Files / Lines / Steps Implicated

- **Confirmed fact:** `.github/workflows/ci.yml:23-24`
  - Job: `lint-and-typecheck`
  - Step: `Lint`
  - Command: `pnpm turbo run lint`

- **Confirmed fact:** `.github/workflows/ci.yml:60-61`
  - Job: `lint-and-typecheck`
  - Step: `Type check`
  - Command: `pnpm turbo run check-types`

- **Confirmed fact:** `.github/workflows/ci.yml:81-86`
  - Job: `unit-tests`
  - Step: `Run unit tests with coverage`
  - Current env: `AZURITE_TEST='true'`, `AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true`

- **Confirmed fact:** `.github/workflows/cd.yml:18-23`
  - Job: `check-ci`
  - Gate condition: `if: github.event.workflow_run.conclusion == 'success'`

- **Confirmed fact:** `.github/workflows/release.yml:31-35`
  - Job: `e2e-gate`
  - Current state: calls `.github/workflows/e2e.yml` as a reusable workflow

- **Confirmed fact:** `.github/workflows/release.yml:37-45`
  - Job: `deploy-production`
  - Current state:
    - calls `.github/workflows/deploy-functions.yml` as a reusable workflow
    - declares `needs: [e2e-gate, p0-e1-gate]`
    - gates production deploys with a conditional check on `needs.p0-e1-gate.result`

- **Confirmed fact:** `.github/workflows/e2e.yml:3-7`
  - Current state: exposes `workflow_call`

- **Confirmed fact:** `.github/workflows/deploy-functions.yml:4-24`
  - Current state: exposes `workflow_call.inputs.environment`

- **Confirmed fact:** `packages/complexity/src/components/HbcComplexityDial.tsx`
  - Prompt-05 fixed state: `TRANSITION_FAST` is now used for the two transition durations

- **Confirmed fact:** `apps/hb-site-control/src/pages/HomePage.tsx`
  - Prompt-06 fixed state: surfaced inline-style and hardcoded-pixel violations were converted to Griffel classes and HBC spacing tokens

- **Confirmed fact:** `apps/hb-site-control/src/pages/ObservationsPage.tsx`
  - Prompt-06 fixed state: surfaced container gap violation was converted to HBC spacing tokens

- **Confirmed fact:** `apps/hb-site-control/src/pages/SafetyMonitoringPage.tsx`
  - Prompt-06 fixed state: surfaced inline-style and hardcoded-pixel violations were converted to Griffel classes and HBC spacing tokens

- **Confirmed fact:** `packages/features/project-hub/src/spfx-lane/ProjectHubSpfxLaneSurface.tsx`
  - Prompt-07 fixed state: surfaced hardcoded shadow/background values were replaced with `@hbc/ui-kit` elevation and surface tokens

- **Confirmed fact:** `apps/dev-harness/src/DevControls.tsx`, `apps/dev-harness/src/pages/DemoCharts.tsx`, `apps/dev-harness/src/pages/WorkspacePlaceholder.tsx`, and multiple `apps/dev-harness/src/tabs/*.tsx`
  - Prompt-08 fixed state: surfaced inline style props and hardcoded spacing values were converted to Griffel classes and HBC spacing/token usage

- **Confirmed fact:** `apps/admin/src/pages/OperationalDashboardPage.tsx`
  - Prompt-09 fixed state: surfaced hardcoded spacing and sizing values were converted to HBC spacing tokens or token-derived values

- **Confirmed fact:** `apps/admin/src/pages/ProvisioningOversightPage.tsx`
  - Prompt-09 fixed state: surfaced hardcoded spacing values were converted to HBC spacing tokens or token-derived values

- **Confirmed fact:** `apps/admin/src/hooks/useProbePolling.ts`, `apps/admin/src/test/OperationalDashboardPage.test.tsx`, `apps/admin/src/test/ProvisioningOversightPage.test.tsx`, `apps/admin/src/test/setup.ts`
  - Prompt-09 fixed state: surfaced unused import and `consistent-type-imports` warnings were removed so the package now passes lint in isolation

- **Confirmed fact:** `packages/bulk-actions/src/components/BulkActionInputDialogShell.tsx`, `packages/bulk-actions/src/execution/executionEngine.ts`
  - Prompt-10 fixed state: surfaced unused type imports were removed so the package now passes lint in isolation

- **Confirmed fact:** `packages/saved-views/src/components/SaveViewDialogShell.tsx`, `packages/saved-views/src/model/compatibility.ts`
  - Prompt-11 fixed state: surfaced unused import and unused binding were removed so the package now passes lint in isolation

- **Confirmed fact:** `apps/project-hub/src/pages/ProjectModulePage.tsx`
  - Prompt-12 fixed state: surfaced hardcoded shadow and background values were replaced with `@hbc/ui-kit` elevation and surface tokens so the app now passes lint in isolation

- **Confirmed fact:** `apps/leadership/src/pages/KpiDashboardPage.tsx`
  - Prompt-13 fixed state: surfaced inline style props and hardcoded spacing/layout values were converted to Griffel classes and HBC spacing tokens so the app now passes lint in isolation

- **Confirmed fact:** `packages/activity-timeline/src/hooks/hooks.test.ts`, `packages/activity-timeline/src/hooks/useActivityFilters.ts`, `packages/activity-timeline/src/types/contracts.test.ts`
  - Current first blocker cluster: unused imported types and symbols triggering `@typescript-eslint/no-unused-vars`

- **Confirmed fact:** `packages/acknowledgment/src/components/HbcAcknowledgmentModal.tsx`
  - Later-queue lint debt: unused `mergeClasses` import triggering `@typescript-eslint/no-unused-vars`

- **Confirmed fact:** `backend/functions/src/services/table-storage-service.test.ts:6-27`
  - Azurite-gated test path remains behind `process.env.AZURITE_TEST === 'true'`

- **Confirmed fact:** `backend/functions/src/utils/table-client-factory.ts:21-30`
  - Confirms `AZURE_TABLE_ENDPOINT` dual semantics

- **Confirmed fact:** `.github/workflows/deploy-functions.yml:51-55`
  - Current test gate env also sets `AZURITE_TEST='true'` with `AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true`

## 9. Proposed Remediation Options

### Option A: Repair the current earliest upstream CI failure first

- **Confirmed fact:** Scope: remove the unused imported types and symbols in `packages/activity-timeline/src/hooks/hooks.test.ts`, `packages/activity-timeline/src/hooks/useActivityFilters.ts`, and `packages/activity-timeline/src/types/contracts.test.ts`.
- **Inferred conclusion:** This is now the smallest current fix because Prompt-13 cleared the surfaced `@hbc/spfx-leadership` blocker and the latest rerun points at a concentrated warning-level package-local issue.
- **Risk assessment:** Lowest risk. Localized to package lint configuration and should not affect runtime behavior.

### Option B: Continue burning down newly surfaced workspace lint debt

- **Confirmed fact:** Scope: continue package-by-package and app-by-app lint remediation after `@hbc/activity-timeline`, with warning-level packages such as `@hbc/acknowledgment`, `@hbc/spfx-project-sites`, `@hbc/models`, `@hbc/data-seeding`, `@hbc/query-hooks`, and `@hbc/related-items` still visible later in the queue.
- **Inferred conclusion:** This is the realistic path to a green workspace lint gate if no new configuration issue appears.
- **Risk assessment:** Moderate, because the remaining effort is broader than a single warning and may span several app page surfaces.

### Option C: Confirm hosted workflow execution after structural repairs

- **Confirmed fact:** Scope: inspect a fresh GitHub-hosted `CI` / `Release` run once authentication/log access is restored.
- **Inferred conclusion:** This is necessary to close the remaining hosted-only uncertainty around release and deploy behavior.
- **Risk assessment:** Low technical risk, but blocked on GitHub access.

### Option D: Prove Azurite-backed path in a runnable environment

- **Confirmed fact:** Scope: rerun the `@hbc/functions` Azurite-backed suite in an environment that actually has a running Azurite service, such as GitHub Actions or a local setup with `azurite` installed and started.
- **Inferred conclusion:** This closes the remaining proof gap for Prompt-04 without changing the workflow contract again.
- **Risk assessment:** Moderate. Could expose additional integration issues once enabled.

## 10. Recommended Remediation Sequence

1. **Confirmed fact:** Fix the concentrated warning-level lint debt in `@hbc/activity-timeline` (`packages/activity-timeline/src/hooks/hooks.test.ts`, `packages/activity-timeline/src/hooks/useActivityFilters.ts`, and `packages/activity-timeline/src/types/contracts.test.ts`) and rerun `pnpm turbo run lint`.
2. **Confirmed fact:** Continue through the newly surfaced remaining package/app lint debt until the workspace lint gate is green, expecting `@hbc/acknowledgment` and warning-driven packages such as `@hbc/spfx-project-sites`, `@hbc/models`, `@hbc/data-seeding`, `@hbc/query-hooks`, and `@hbc/related-items` to remain near the front of the queue after `@hbc/activity-timeline`.
3. **Confirmed fact:** Once workspace lint is green and GitHub access is restored, confirm the remediated `CI`, `CD`, and `Release` workflows on hosted runners.
4. **Confirmed fact:** Run the Azurite-backed `@hbc/functions` suite in a runner or local environment that actually has Azurite available, to convert the remaining Prompt-04 proof gap from environment-limited to fully confirmed.
5. **Inferred conclusion:** The earlier remediation sequence for config discovery, boundary repair, and `Release` structure is now historical context rather than the next-action plan, because those defects are already addressed in repo truth.

## 11. Explicit Unresolved Questions

- **Unresolved issue:** Which exact hosted GitHub Actions run first displayed the current failures could not be directly confirmed because `gh auth status` reported an invalid token and the session could not retrieve live Actions logs.
- **Unresolved issue:** Which package becomes the next workspace lint blocker after `@hbc/activity-timeline` is not yet known, because Turbo runs lint in parallel and the first failing package can shift as earlier failures are removed.
- **Unresolved issue:** How many additional app surfaces and warning-driven packages beyond `@hbc/activity-timeline`, `@hbc/acknowledgment`, `@hbc/spfx-project-sites`, `@hbc/models`, `@hbc/data-seeding`, `@hbc/query-hooks`, and `@hbc/related-items` still remain before the workspace lint gate is green has not yet been fully enumerated by a green-to-red sequence.
- **Unresolved issue:** The Azurite-backed suite still needs proof from an environment with a running Azurite service; the current local evidence only proves that the real block is now exercised rather than skipped.
- **Unresolved issue:** The report did not verify external secret-dependent deploy steps (`Vercel`, `Azure Functions`, `PnP PowerShell`, SharePoint tenant deployment) because those require hosted runner context and/or secrets not available in this session.

## Appendix: Regression Provenance

- **Confirmed fact:** Commit `390d723a` remains relevant historical provenance because it introduced the original `Release` orchestration that Prompt-03 later repaired.
- **Confirmed fact:** Commits such as `41d65767` and `40b701d0` remain relevant historical provenance for the earlier missing-ESLint-config class, but that class is no longer an active current blocker after Prompt-01.
- **Confirmed fact:** Commit `f1d1e7f3` remains relevant historical provenance for the earlier `project-canvas` / `features-project-hub` boundary break, but that break is no longer active after Prompt-02.
- **Inferred conclusion:** The appendix should now be read as regression history, not as the list of currently active failures.

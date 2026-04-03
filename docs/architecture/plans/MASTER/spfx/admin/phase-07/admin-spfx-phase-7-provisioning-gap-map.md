# Phase 7 — Provisioning Repo-Truth Audit and Gap Map

## 1. Purpose

This document captures the verified repo state for Phase 7 (Provisioning saga refinement and seamless rollout hardening). Every claim is grounded in current code and configuration. No target-state claims are presented as current fact.

Phase 7 should preserve and harden the existing provisioning foundations — not replace them.

## 2. Authority set actually used

| Document / Path | Why read |
|-----------------|----------|
| `apps/admin/README.md` | Admin app lane inventory and claimed provisioning behavior |
| `apps/admin/src/router/routes.ts` | Actual route wiring |
| `apps/admin/src/router/lane-registry.ts` | Canonical lane metadata |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | Provisioning UI implementation |
| `apps/admin/src/pages/ErrorLogPage.tsx` | Deferred page state |
| `apps/admin/src/utils/failureClassification.ts` | Failure display constants |
| `apps/admin/src/utils/provisioningStatusHelpers.ts` | Status display helpers |
| `apps/admin/src/constants/runbookLinks.ts` | Embedded operator guidance links |
| `packages/provisioning/README.md` | Provisioning package surface and boundary |
| `packages/provisioning/src/index.ts` | Public exports |
| `packages/features/admin/README.md` | Observability limitations and monitor wiring |
| `packages/features/admin/src/monitors/provisioningFailureMonitor.ts` | Failure monitor implementation |
| `packages/features/admin/src/monitors/stuckWorkflowMonitor.ts` | Stuck-workflow monitor |
| `packages/features/admin/src/types/IProvisioningDataProvider.ts` | Dependency-injection bridge |
| `backend/functions/README.md` | Provisioning staging gates and prerequisite expectations |
| `backend/functions/src/functions/provisioningSaga/index.ts` | Saga entry point and endpoint wiring |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Orchestration, retry, compensation |
| `backend/functions/src/functions/provisioningSaga/steps/` | Step implementations |
| `backend/functions/src/utils/validate-config.ts` | Prerequisite validation |
| `backend/functions/src/utils/retry.ts` | Retry utility with transient detection |
| `backend/functions/src/services/table-storage-service.ts` | Durable run state persistence |
| `backend/functions/src/services/sharepoint-service.ts` | SharePoint provisioning operations |
| `backend/functions/src/services/graph-service.ts` | Graph/Entra provisioning operations |
| `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md` | Target architecture expectations |
| `docs/architecture/plans/MASTER/spfx/admin/phase-07/Admin-SPFx-IT-Control-Center-Phase-7-Summary-Plan.md` | Phase 7 governing direction |

## 3. Confirmed repo strengths already present

### Admin operator console

- **ProvisioningOversightPage** (`apps/admin/src/pages/ProvisioningOversightPage.tsx`, 759 lines) is fully implemented — not a stub.
- Loads runs via `client.listProvisioningRuns()` with fallback to `client.listFailedRuns()`.
- Four tab filters: Active, Failures, Completed, All.
- Data table columns: projectNumber, projectName, overallStatus (with escalation badge), failureClass badge, currentStep, triggeredBy, startedAt, and action buttons.
- **Four provisioning actions** are wired and permission-gated:
  - Force Retry (`admin:provisioning:retry`) — gated by retry ceiling with counter display.
  - Archive Failure (`admin:provisioning:archive`) — removes from active queue.
  - Acknowledge Escalation (`admin:provisioning:escalate`) — appears only when `escalatedBy` is set.
  - Manual State Override (`admin:provisioning:force-state`) — expert-tier only, restricted to stuck transitional states.
- **Complexity-gated detail modal**: Essential (badges/summary), Standard (step-by-step log), Expert (error details, step metadata, Entra group IDs, internal identifiers).
- **Failure classification display** reads backend-assigned `failureClass` — never inferred client-side.
- Embedded **runbook links** (`apps/admin/src/constants/runbookLinks.ts`) for retry procedure, escalation, Step 5 manual, alert thresholds, KQL queries, and stuck-alert rules.

### Route structure

- 6 real pages routed: OperatorLandingPage (`/`), SetupWizardPage (`/setup`), InstallRunDetailPage (`/setup/run/$runId`), ProvisioningOversightPage (`/runs`), SystemSettingsPage (`/config`), OperationalDashboardPage (`/health`).
- 3 scaffold lanes: ValidationLanePage (`/validation`), SharePointLanePage (`/sharepoint`), EntraLanePage (`/entra`).
- 1 deferred lane: ErrorLogPage (`/errors`) — SF17-T05.
- Legacy redirects: `/provisioning-failures` to `/runs` (preserves `?projectId=`), `/dashboards` to `/health`, `/error-log` to `/errors`.
- Lane registry (`apps/admin/src/router/lane-registry.ts`) defines all 8 canonical lanes.

### Alert and probe polling

- AlertPollingService and useProbePolling are active when backend URL is configured.
- Both skip polling gracefully when no backend URL is present.

## 4. Confirmed route / UI drift

- **README lane count mismatch**: `apps/admin/README.md` line 11 states "Three lanes have active content from existing pages." The actual count is at least 5 real pages (landing, setup wizard, runs, config, health) plus the nested install-run-detail route. The README predates the SetupWizardPage and OperationalDashboardPage additions.
- **Dead code — SetupLanePage**: `apps/admin/src/pages/SetupLanePage.tsx` exists but is not imported or routed in `routes.ts`. It was superseded by `SetupWizardPage.tsx`. This file should be removed.
- **Scaffold lanes reference provisioning as workaround**: ValidationLanePage and SharePointLanePage both direct operators to the Runs lane as a temporary workaround. This is honest but creates a navigation dead-end pattern.
- **ErrorLogPage empty state**: Renders `HbcSmartEmptyState` with deferred messaging (SF17-T05). Correctly honest — not a Phase 7 concern.

## 5. Confirmed provisioning control-plane strengths already present

### Saga orchestrator

- 7-step linear pipeline (`saga-orchestrator.ts` lines 23-30): Create Site, Create Document Library, Upload Template Files, Create Data Lists, Install Web Parts, Set Permissions, Associate Hub Site.
- **Step-level idempotency**: each step checks whether it was already completed in a prior run before re-executing.
- **In-step retry**: `withRetry()` wraps each step — 3 attempts, exponential backoff (2s/4s/8s), transient detection (429, econnreset, etimedout, fetch failed), Retry-After header support.
- **Run-level retry**: `retry(projectId)` creates a new correlationId, preserves `parentCorrelationId` chain, increments retryCount, records `lastRetryAt`, re-enters `execute()` with idempotency guards.
- **Step 5 deferral**: on 2nd in-step failure, marks `step5DeferredToTimer=true`, sets `overallStatus='WebPartsPending'`, continues to Steps 6-7. Overnight timer retries up to 3 times before escalating to Failed.
- **Compensation chain**: runs in reverse order (7, 4, 3, 2, 1). Steps 1 and 7 have real compensation logic (delete site, disassociate hub). Steps 2-4 are no-ops (cascaded by Step 1 site deletion). Compensation errors are non-blocking.

### Prerequisite validation

- `validateProvisioningPrerequisites()` (`backend/functions/src/utils/validate-config.ts`) runs at saga start.
- 8 required gates: GRAPH_GROUP_PERMISSION_CONFIRMED, AZURE_TENANT_ID, SHAREPOINT_TENANT_URL, SHAREPOINT_HUB_SITE_ID, SHAREPOINT_APP_CATALOG_URL, HB_INTEL_SPFX_APP_ID, OPEX_MANAGER_UPN, and conditionally SITES_SELECTED_GRANT_CONFIRMED.
- Fail-fast: aggregates all missing prerequisites into a single error before any step runs.
- Permission model diagnostics (`diagnosePermissionModel()`, `diagnoseSiteGrantReadiness()`) logged as telemetry at saga start.

### Durable status persistence

- Azure Table Storage (`ProvisioningStatus` table), partitioned by `projectId`, row key `correlationId`.
- Full entity upsert per step including: overallStatus, currentStep, stepsJson, siteUrl, retryCount, escalatedBy/At, failureClass, step5DeferredToTimer, groupMembers, entraGroups, department, and timestamps.
- Query operations: `getLatestRun(projectId)`, `listFailedRuns()`, `listPendingStep5Jobs()`, `listAllRuns(status?)`.

### Request state reconciliation

- Saga reconciles request state at start (Provisioning), completion (Completed), and failure (Failed).
- Timer reconciles on success and on exceeded-retry escalation.
- Non-blocking: reconciliation errors are logged as warnings without blocking saga progress.

### Test coverage

- `__tests__/saga-orchestrator.test.ts` — completion, failure, compensation, Step 5 deferral, idempotency, retry entrypoint, executeFullSpec.
- `__tests__/compensation.test.ts` — chain order and execution.
- Individual step tests: `steps.test.ts`, `step3-template-files.test.ts`, `step4-data-lists.test.ts`, `step6-permissions.test.ts`.
- Integration/authorization: `smoke.test.ts`, `approval-provisioning-integration.test.ts`, `provisioning-authorization.test.ts`.

## 6. Confirmed dependency-validation gaps

- **No runtime health-check of external endpoints**: prerequisite validation confirms environment variables are set but does not verify that SharePoint, Graph, or Azure Functions endpoints are reachable or healthy before launching the saga. A misconfigured or unreachable endpoint will fail at Step 1 rather than at prerequisites.
- **No pre-flight tenant permission verification**: `GRAPH_GROUP_PERMISSION_CONFIRMED` is a boolean env flag, not a runtime check. If the flag is stale (permission was revoked after deployment), the saga discovers the failure at Step 6 (group creation), not at prerequisite time.
- **Sites.Selected grant workflow is manual-only**: when the `sites-selected` permission model is active, the operator must run `tools/grant-site-access.sh` after Step 1 creates the site. No automated pre-site-creation grant workflow exists (Option A1 is not implemented).

## 7. Confirmed diagnostics / failure-visibility gaps

- **`failureClass` field is orphaned**: the field exists on `IProvisioningStatus` and is persisted in Table Storage, but the saga orchestrator never populates it during failure handling. The admin UI reads it for display (`failureClassification.ts`), but it is always empty for real failures.
- **No systematic failure taxonomy at saga time**: errors are caught and their `.message` is stored as `errorMessage`, but no classification logic distinguishes transient (throttle, timeout) from structural (400, validation) from permissions (403, permission-not-confirmed) from repeated (same error on retry).
- **No aggregated evidence payload**: step details (error messages, metadata, timing) are scattered across individual step records in `stepsJson`. There is no structured evidence object that aggregates all diagnostic information for operator review.
- **Step 5 timeout messaging is generic**: "Web part installation did not complete within 60 seconds" — no App Catalog health information, no install-attempt details, no diagnostic context.
- **Graph API errors are not classified**: 403 (permission), 404 (user/group not found), 409 (duplicate), and 429 (throttle) all surface as generic error messages without structured categorization.

## 8. Confirmed recovery / repair-visibility gaps

- **Step 6 has no compensation**: if the saga fails after Step 6 (Set Permissions) creates Entra ID security groups, those groups are not deleted during compensation. Orphaned groups remain in Entra ID. Steps 2-4 rely on Step 1's site deletion for cleanup, but Step 6's groups exist outside the SharePoint site.
- **Admin Force Retry has no audit logging**: when an admin bypasses the coordinator retry ceiling, there is no audit trail of who triggered the retry and when. The saga records `retryCount` and `lastRetryAt` but not the identity of the retry initiator.
- **No maximum deferral window for Step 5 timer jobs**: a job can remain in `WebPartsPending` state indefinitely if the timer never succeeds within its 3-retry threshold. There is no absolute deadline (e.g., 7 days) that escalates stale deferred jobs to Failed.
- **Recovery guidance is display-only**: the admin UI shows failure-class descriptions and runbook links, but there is no structured operator checklist or conditional guidance based on the specific failure step and error type.

## 9. Confirmed documentation drift

- **Admin README lane count**: `apps/admin/README.md` states "Three lanes have active content" but at least 5 are real (landing, setup wizard, runs, config, health). The README predates Phase 5/6 additions.
- **Phase 7 plan docs are thin**: the `phase-07/` directory contains the prompt package (README, summary plan, 10 prompt files) but no implementation artifacts yet. This gap map is the first.
- **Backend README prerequisite documentation**: `backend/functions/README.md` documents provisioning staging gates and prerequisite validation, but does not document the current permission model diagnostic behavior (`diagnosePermissionModel()`, `diagnoseSiteGrantReadiness()`) that was added later.
- **Provisioning package README**: does not mention Phase 7 alignment work or the newer display-registry exports (activation, BIC config, history content) that were added after the initial documentation.

## 10. Explicit non-gaps

These areas are healthy and do not require Phase 7 intervention:

- **ProvisioningOversightPage is fully real** — not a stub, not a placeholder. It handles all four provisioning actions with proper permission gating, complexity tiers, and failure display.
- **Route structure is correct** — all documented routes resolve to the correct components. Legacy redirects work and preserve search parameters.
- **Saga step sequencing is sound** — 7 steps execute in order with idempotency guards and in-step retry. The linear pipeline is appropriate for the current provisioning workflow.
- **Durable persistence is working** — Azure Table Storage upserts run state per step. Query operations support the admin dashboard, failures inbox, and timer job queue.
- **Prerequisite validation exists and is fail-fast** — all 8 gates are checked before any step runs. Missing prerequisites produce a clear aggregated error.
- **Features-admin dependency injection pattern is correct** — `IProvisioningDataProvider` cleanly decouples admin intelligence from provisioning package internals.
- **Two production monitors are wired** — provisioning-failure and stuck-workflow monitors have real data providers, severity escalation logic, and deduplication.
- **Alert and probe polling is operational** — both services handle the no-backend-URL case gracefully.
- **Test coverage for the saga is meaningful** — orchestration semantics, compensation, deferral, idempotency, and authorization all have targeted tests.

## 11. Phase 7 implementation implications

Based on the confirmed gaps above, Phase 7 prompts should focus on:

1. **Failure taxonomy implementation** (Prompts 04, 06): populate the existing `failureClass` field with a classification function that categorizes errors at saga failure time. The admin UI already reads this field — wiring it will immediately improve operator visibility.
2. **Evidence payload aggregation** (Prompt 06): create a structured evidence object that collects step errors, timing, permission posture, and attempt details into a single diagnostic payload for the admin detail modal.
3. **Dependency validation hardening** (Prompt 03): add runtime health-checks for external endpoints at prerequisite time, and consider runtime verification of the Graph permission flag rather than trusting the env var alone.
4. **Step 6 compensation** (Prompt 04): implement Entra ID group deletion during compensation to prevent orphaned groups.
5. **Step 5 deferral deadline** (Prompt 04): add an absolute deadline check in the timer handler to escalate stale deferred jobs.
6. **Recovery guidance enrichment** (Prompt 05): provide structured operator checklists conditional on the failed step and error classification, beyond the current static runbook links.
7. **Admin Force Retry audit trail** (Prompt 05): log the identity and timestamp of admin-initiated retries.
8. **Route / UI corrections** (Prompt 09): remove dead SetupLanePage, update README lane count, and consider whether scaffold lanes should link more helpfully to the Runs lane.
9. **Documentation reconciliation** (Prompt 10): update admin README, backend README, and provisioning README to reflect current behavior including permission diagnostics and newer exports.

## 12. Later-phase concerns that should not be solved here

- **Full observability completion** (Phase 12): in-memory alert/probe stores, 4 deferred monitors, 3 deferred probes, SMTP relay, durable webhook delivery. Phase 7 may enrich provisioning-specific diagnostics but must not attempt the broader observability build-out.
- **SharePoint governance and control** (Phase 8): scaffold lanes for SharePoint and Validation will get real content in Phase 8. Phase 7 should not implement SharePoint governance features.
- **Entra control lane** (Phase 9): the Entra scaffold lane is explicitly Phase 9 scope.
- **Destructive-action safety framework** (Phase 11): recovery visibility improvements in Phase 7 should not blur into the Phase 11 destructive-action safety model unless a narrow compatibility hook is truly necessary.
- **Error logging and audit trail** (SF17-T05): ErrorLogPage is intentionally deferred. Phase 7 should not implement it.
- **Approval authority persistence** (SF17-T05): ApprovalAuthorityApi is a stub. Not Phase 7 scope.
- **Automated Sites.Selected grant workflow** (Option A1): the manual `tools/grant-site-access.sh` workflow is sufficient for Phase 7. Automating the per-site grant flow is a later improvement.

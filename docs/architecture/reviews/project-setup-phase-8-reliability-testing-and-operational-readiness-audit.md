# Phase 8 Repo-Truth Reliability, Testing, and Operational Readiness Audit

**Prompt:** `Prompt-01_Phase-8-Repo-Truth-Reliability-Testing-and-Operational-Readiness-Audit.md`
**Date:** 2026-04-02
**Phase:** Phase 8 — Reliability, Testing, and Operational Readiness
**Scope:** Project Setup workflow spanning requester submission, Accounting controller review, provisioning runtime behavior, and Admin exception handling.

---

## 1. Executive Summary

This audit establishes the authoritative evidence baseline for Phase 8 by validating the current verification, reliability, degraded-path, observability, and operational-readiness state of the Project Setup workflow across all surfaces.

**Overall finding:** The repo's Wave 0 verification baseline is strong and truthful. The provisioning verification matrix (C1–C4) passes on all four dimensions. Twenty frontend test files across four apps, 60+ backend test files, 10 codified failure modes, 7 integration rules, 2 operational runbooks, and a consolidated verification matrix collectively form a substantial readiness package.

**Gaps are concentrated in:**

1. Environment-gated evidence that cannot be proven from repo-local tests alone (hosted integration, timer triggers, Azure alert rules, Graph permission grants).
2. Five remaining deferred surface test stubs in `t08-deferred-surface-tests.test.ts` that require G4/G5 component integration not yet available at contract level.
3. Documentation wording precision — some plan documents still use loose "launch" terminology where the frozen contract uses `ReadyToProvision` transition and backend auto-start semantics.
4. Monitor and probe implementations that are tested but backed by in-memory APIs (SF17 persistence deferred to Wave 1).

**Readiness posture:** Repo-proven for all deterministic lifecycle paths. Environment-gated for Azure/tenant integration. Intentionally deferred for Wave 1 items. No gap identified that blocks pilot entry, provided environment-gated validations are executed during staging deployment.

---

## 2. Canonical Copy Check

- **Package location:** `docs/architecture/plans/MASTER/spfx/accounting/phase-8/`
- **Committed in repo:** Yes — the package is committed and contains the implementation plan, README, audit report, and 6 prompt files (Prompt-01 through Prompt-06).
- **Duplicate copies:** No duplicate package copies were found in the current workspace.
- **Artifact status:** This is a committed canonical package, not a local draft or attached artifact.

**Files in package:**

| File | Purpose |
|------|---------|
| `Phase-8_Reliability-Testing-and-Operational-Readiness_Implementation-Plan.md` | Implementation plan with 6-stage sequence |
| `README_Phase-8-Reliability-Testing-and-Operational-Readiness.md` | Package README with authority order and working rules |
| `Accounting_Phase8_Prompt_Audit_Report.md` | Pre-execution prompt package audit |
| `Prompt-01` through `Prompt-06` | Ordered execution prompts |

---

## 3. Confirmed Repo Facts

Classification: **confirmed repo fact** / Evidence source: **repo-proven**

### 3.1 Frontend test coverage

All 20 frontend test files referenced by the prompt exist in the repo and cover their stated scope:

| Surface | Files | Approx. Tests | Key Coverage |
|---------|-------|---------------|--------------|
| Accounting | 2 | ~15 | Queue filtering, tab switching, approval flow, project-number capture, clarification, failed-only Admin routing, expert-tier audit trail |
| Estimating | 4 | ~41 | Wizard rendering, draft lifecycle, submission, state context, coordinator retry/failure handling, completion handoff |
| Admin | 3 | ~36 | Retry/archive/escalation/force-state actions, permission gating, coaching callouts, alert polling, operational dashboards |
| PWA parity | 2 | ~11 | 8-state label/badge verification, 5-step wizard contract parity |
| Shared provisioning | 2 active + 2 deferred/scaffold | ~14 groups + 11 todo + 1 env-gated | Cross-contract verification (14 groups), deferred surface stubs |

### 3.2 Backend test coverage

| Area | Files | Approx. Tests | Key Coverage |
|------|-------|---------------|--------------|
| `@hbc/provisioning` package | 21 | ~160 | State machine, BIC config, notification registrations/templates, failure modes, integration rules, complexity helpers, handoff config, activation flow, store, API client, cross-contract verification |
| `backend/functions` saga | 10 | ~200 | Saga orchestrator, compensation chain, 7-step execution, step3/step4/step6 specifics, notification dispatch, approval-provisioning integration, authorization, smoke tests |
| Request lifecycle | 2 | ~20 | Backend request lifecycle + integration lifecycle |

### 3.3 Codified catalogs

- **10 failure modes** (FM-01 through FM-10) in `packages/provisioning/src/failure-modes.ts` with matching test file `failure-modes.test.ts`.
- **7 integration rules** (IR-01 through IR-07) in `packages/provisioning/src/integration-rules.ts` with matching test file `integration-rules.test.ts`.
- **14 cross-contract verification groups** in `packages/provisioning/src/t08-cross-contract-verification.test.ts`.
- **11 deferred surface test stubs** + 1 environment-gated scaffold in `packages/provisioning/src/t08-deferred-surface-tests.test.ts`.

### 3.4 Admin monitors and probes

Four monitors/probes are implemented in `packages/features/admin/src/`:

| File | Purpose | Test Coverage |
|------|---------|---------------|
| `monitors/provisioningFailureMonitor.ts` | Detects failed requests, severity based on retry count | Covered via `alertPollingService.test.ts` integration |
| `monitors/stuckWorkflowMonitor.ts` | Detects InProgress >30 min, escalates severity at 2 h | Covered via `alertPollingService.test.ts` integration |
| `probes/azureFunctionsProbe.ts` | Azure Functions `/api/health` endpoint probe | Covered via `OperationalDashboardPage.test.tsx` integration |
| `probes/sharePointProbe.ts` | SharePoint `/api/project-setup-requests` probe | Covered via `OperationalDashboardPage.test.tsx` integration |

### 3.5 Verification matrix verdicts

`docs/reference/provisioning/verification-matrix.md` records all four dimensions as PASS:

| Dimension | Scope | Verdict |
|-----------|-------|---------|
| C1 — Lifecycle Paths | 5 paths: happy, clarification, failure/recovery, admin recovery, progress tracking | PASS |
| C2 — Explainability | 8 requirements: state labels, action strings, BIC ownership, failure explanation, admin diagnostics, coaching prompts, urgency indicators, blocked-state reasons | PASS |
| C3 — Supportability | 7 vectors: UI diagnostics, admin recovery actions, runbook procedures, observability queries, permission model, failure mode catalog, integration rules | PASS |
| C4 — Dead Wiring | All incomplete items documented with Wave 1 disposition; no undocumented dead wiring | PASS |

### 3.6 Wave 0 closeout baseline

`current-state-map.md §7` records G1–G6 confirmed complete (established 2026-03-15). SF29 (My Work Feed) also confirmed. §7.2 lists 6 active-but-incomplete items. §7.3 lists 6 intentionally deferred Wave 1 items.

---

## 4. Confirmed Repo-Doc Intent

Classification: **confirmed repo-doc intent** / Evidence source: as noted per item

### 4.1 Wave 0 deferred items (repo-proven documentation)

The current-state-map §7.2–7.3 explicitly defers:
- SF17 persistence layer (AdminAlertsApi, ApprovalAuthorityApi, InfrastructureProbeApi — in-memory only)
- Teams webhook delivery confirmation
- Email relay (console-logged, no SMTP)
- 4 deferred monitors (overdue workflow, stale request, permission anomaly, override expiration)
- 3 deferred probes (search, notification, module-record-health)
- ErrorLogPage (`HbcEmptyState` placeholder, deferred to SF17-T05)
- Frontend Application Insights SDK
- Historical trend charts, bulk queue actions, coordinator/requester admin views

### 4.2 Runbook alignment (repo-proven + environment-gated)

- `provisioning-runbook.md` documents manual retry, archive, force-state override, escalation, Azure Table Storage diagnostics, Step 5 manual trigger, and alert thresholds. These procedures match the test-verified admin actions in `ProvisioningOversightPage.test.tsx`.
- `provisioning-observability-runbook.md` documents 5 KQL query templates and 2 alert rule definitions. The KQL templates reference current telemetry event names. Alert rules (`HBIntel-ProvisioningStuck`, `HBIntel-TimerFullSpecFailed`) are Azure-side configurations — documented intent, not repo-testable.

### 4.3 Phase 7 frozen contracts (repo-proven documentation)

Phase 7 froze the API auth contract, CORS posture, environment readiness model, connected-services model, deployment gates, and tenant prerequisites. These are documented in Phase 7 closure artifacts under `docs/architecture/reviews/` and `docs/architecture/plans/MASTER/spfx/accounting/phase-7/`.

---

## 5. Existing Verification Inventory by Surface and Backend Area

### 5.1 Accounting Surface

| File | Tests | What It Verifies | Classification |
|------|-------|-----------------|----------------|
| `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx` | ~8 | Queue filtering by state (Submitted, UnderReview, NeedsClarification, Failed), tab switching, HbcDataTable columns, route linkage, essential-tier fallback list, 768px layout regression | repo-proven |
| `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` | ~7 | Approve action with project-number capture/validation, clarification modal with textarea, failed-only Admin routing ("Escalate to Admin"), expert-tier audit trail, Begin Review (Submitted), Resolve Hold (AwaitingExternalSetup), NeedsClarification banner, cross-app URL missing warning | repo-proven |

### 5.2 Estimating Surface

| File | Tests | What It Verifies | Classification |
|------|-------|-----------------|----------------|
| `apps/estimating/src/test/NewRequestPage.test.tsx` | 15 | Blank wizard rendering, draft resume banner, Start New/Resume flow, legacy draft normalization, submission success → navigation, submission failure → error banner, draft clear on success, clarification-return mode, 768px layout | repo-proven |
| `apps/estimating/src/test/RequestDetailPage.test.tsx` | 5 | Core summary fields, state context text for each state, ClarificationBanner on NeedsClarification, ProvisioningChecklist for Provisioning/Completed, empty state for not-found, API failure → error shell, SignalR disconnect → polling fallback, null session → loading shell | repo-proven |
| `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` | 11 | Step-level failure detail (standard tier), failure class and retry count, 5-condition retry eligibility, no retry for structural failure → admin banner, retry ceiling (≥2), no retry when escalated, admin escalation banner, retry API call, retry failure → error banner, 768px tap target | repo-proven |
| `apps/estimating/src/test/RequestDetailPage.completion.test.tsx` | 10 (2 todo) | Completion card rendering, no card for non-Completed states, "Open Project Hub" with siteUrl, warning when siteUrl missing, new-tab navigation, "Stay in Project Setup" dismissal, no auto-redirect, usePrepareHandoff wiring. **2 deferred:** Hub welcome card (blocked by missing `provisionedAt`) | repo-proven (2 intentionally deferred) |

### 5.3 Admin Surface

| File | Tests | What It Verifies | Classification |
|------|-------|-----------------|----------------|
| `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | 17+ | Failures tab with data table, Retry with danger confirmation dialog, Archive with confirmation, Escalated badge + Ack Escalation button, expert-tier diagnostics visibility, Manual State Override (expert tier, transitional runs), `?projectId=` auto-open, no Approve/Clarification/Hold buttons, no wizard content, retry count threshold, retry attempt number, permission gating, coaching callout with runbook link | repo-proven |
| `apps/admin/src/test/alertPollingService.test.ts` | 9 | Alert synthesis from failed requests, alert synthesis from stuck runs, API ingestion, empty result when no failures, start/stop polling lifecycle, idempotent start, API getter, severity high (retryCount=0), severity critical (retryCount≥3) | repo-proven |
| `apps/admin/src/test/OperationalDashboardPage.test.tsx` | 10+ | Queue health summary and state counts, permission-gated alert/probe dashboards (hidden for business-ops, shown for technical admins), bottleneck indicator for failures, empty state, degraded health indicator, Wave 0 limitation banners, coaching callouts (healthy state, alert threshold, runbook links) | repo-proven |

### 5.4 Admin Monitors and Probes (Implementation)

| File | Exports | What It Implements | Classification |
|------|---------|-------------------|----------------|
| `packages/features/admin/src/monitors/provisioningFailureMonitor.ts` | `createProvisioningFailureMonitor()` | Detects failed requests, severity high if < ADMIN_RETRY_CEILING, critical if ≥ ceiling | repo-proven (impl); in-memory data source (intentionally deferred persistence) |
| `packages/features/admin/src/monitors/stuckWorkflowMonitor.ts` | `createStuckWorkflowMonitor()` | Detects InProgress >30 min, escalates high→critical at 120 min | repo-proven (impl); in-memory data source |
| `packages/features/admin/src/probes/azureFunctionsProbe.ts` | `createAzureFunctionsProbe()` | Checks `/api/health`, returns healthy/degraded/error with response time | repo-proven (impl); environment-gated (real endpoint) |
| `packages/features/admin/src/probes/sharePointProbe.ts` | `createSharePointProbe()` | Checks `/api/project-setup-requests`, returns probe status | repo-proven (impl); environment-gated (real endpoint) |

### 5.5 PWA Surface

| File | Tests | What It Verifies | Classification |
|------|-------|-----------------|----------------|
| `apps/pwa/src/test/parity/stateLabels.test.ts` | 5 | All 8 lifecycle states have non-empty display labels and valid badge variants; Completed→completed, Failed→error, NeedsClarification→warning | repo-proven |
| `apps/pwa/src/test/parity/wizardConfig.test.ts` | 6 | Exactly 5 steps, step IDs match T02 contract, step labels match, steps 1–3 and 5 required / step 4 optional, sequential order mode, draft key present | repo-proven |
| `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx` | (impl) | SignalR + API polling with P4-03 precedence (API authoritative, SignalR overlay, polling stops on terminal), terminal banners, step checklist, real-time event indicator, "Real-time connection lost" warning | repo-proven (impl); environment-gated (real SignalR) |

### 5.6 Shared Provisioning

| File | Tests/Exports | What It Verifies | Classification |
|------|--------------|-----------------|----------------|
| `packages/provisioning/src/failure-modes.ts` | 10 failure modes (FM-01–FM-10) | Each FM specifies scenario, expected degradation, affected packages | repo-proven |
| `packages/provisioning/src/integration-rules.ts` | 7 integration rules (IR-01–IR-07) | Package interaction rules with anti-pattern/correct-pattern pairs | repo-proven |
| `packages/provisioning/src/t08-cross-contract-verification.test.ts` | 14 test groups | TC-OWN-04 BIC config, TC-NOTIF-07 action→notification alignment, TC-FLOW-06 projectNumber not in wizard, TC-CLAR-03/04 notification keys, TC-MYWK-01–04 BIC module, TC-NOTIF-06 no frontend send, TC-CMPLX-06/07 complexity helpers and coaching, TC-FAIL-06 complexity fallback | repo-proven |
| `packages/provisioning/src/t08-deferred-surface-tests.test.ts` | 11 todo + 1 env-gated | Deferred G4/G5 surface rendering tests (see §6 for reconciliation) | intentionally deferred / environment-gated |

### 5.7 Backend Saga and Lifecycle

| File | What It Verifies | Classification |
|------|-----------------|----------------|
| `backend/functions/.../saga-orchestrator.test.ts` | Full saga orchestration | repo-proven |
| `backend/functions/.../compensation.test.ts` | Compensation chain rollback | repo-proven |
| `backend/functions/.../approval-provisioning-integration.test.ts` | Approval to provisioning flow integration | repo-proven |
| `backend/functions/.../provisioning-authorization.test.ts` | Authorization checks | repo-proven |
| `backend/functions/.../smoke.test.ts` | Smoke test baseline | repo-proven |
| `backend/functions/.../steps/steps.test.ts` | 7-step saga execution | repo-proven |
| `backend/functions/.../steps/step3-template-files.test.ts` | Template file provisioning | repo-proven |
| `backend/functions/.../steps/step4-data-lists.test.ts` | Data list creation (26 lists) | repo-proven |
| `backend/functions/.../steps/step6-permissions.test.ts` | Permission setup | repo-proven |
| `backend/functions/.../notification-dispatch.test.ts` | Notification firing | repo-proven |
| `backend/functions/.../request-lifecycle.test.ts` | Backend request lifecycle state machine | repo-proven |
| `backend/functions/.../request-lifecycle.integration.test.ts` | End-to-end request lifecycle integration | repo-proven |

### 5.8 Additional Provisioning Package Tests

| File | What It Verifies | Classification |
|------|-----------------|----------------|
| `state-machine.test.ts` | State transition validation | repo-proven |
| `bic-registration.test.ts` | BIC module registration | repo-proven |
| `bic-config.test.ts` | `deriveCurrentOwner()` for all 8 states | repo-proven |
| `history-level-registry.test.ts` | History detail levels | repo-proven |
| `coaching-prompt-registry.test.ts` | Coaching prompt registry | repo-proven |
| `complexity-gate-helpers.test.ts` | Complexity tier helpers | repo-proven |
| `notification-registrations.test.ts` | 15 notification events | repo-proven |
| `notification-templates.test.ts` | Notification template shapes | repo-proven |
| `summary-field-registry.test.ts` | 8 status labels, badge variants, action map | repo-proven |
| `visibility.test.ts` | Visibility rules | repo-proven |
| `store.test.ts` | Provisioning store | repo-proven |
| `api-client.test.ts` | API client | repo-proven |
| `handoff-config.test.ts` | Handoff configuration | repo-proven |
| `activation/handoffActivation.test.ts` | Handoff activation | repo-proven |
| `activation/createProjectActivation.test.ts` | Project activation creation | repo-proven |
| `activation/activation-flow.integration.test.ts` | Activation flow integration | repo-proven |

---

## 6. Existing Degraded-Path / Failure-Mode Coverage

### 6.1 Codified failure modes (FM-01–FM-10)

Classification: **confirmed repo fact** / **repo-proven**

All 10 failure modes are codified in `packages/provisioning/src/failure-modes.ts` with a matching test file. Each specifies scenario, expected degradation, and affected packages:

| FM | Title | Affected Packages |
|----|-------|-------------------|
| FM-01 | IndexedDB Unavailable | session-state |
| FM-02 | BIC resolveCurrentOwner Returns Null | bic-next-move |
| FM-03 | Notification Registration Missing | notification-intelligence |
| FM-04 | Handoff validateReadiness Fails | workflow-handoff |
| FM-05 | API Submission Fails After onAllComplete | step-wizard, session-state |
| FM-06 | Clarification Draft TTL Expires | session-state |
| FM-07 | BIC Module queryFn Fails | bic-next-move |
| FM-08 | Complexity Tier Cannot Be Derived from Role | complexity |
| FM-09 | SignalR Disconnected During Provisioning | (real-time layer) |
| FM-10 | Handoff Recipient Cannot Be Resolved | workflow-handoff |

### 6.2 Compensation chain

Classification: **confirmed repo fact** / **repo-proven**

`backend/functions/.../compensation.test.ts` verifies saga rollback behavior. The saga orchestrator handles step failure by executing compensation for completed steps in reverse order.

### 6.3 Alert escalation paths

Classification: **confirmed repo fact** / **repo-proven**

`alertPollingService.test.ts` (9 tests) verifies:
- Alert synthesis from failed requests and stuck provisioning runs
- Severity calculation: high for initial failure (retryCount=0), critical when retry ceiling reached (retryCount≥3)
- Polling lifecycle (start/stop)
- API ingestion

### 6.4 SignalR fallback

Classification: **confirmed repo fact** (implementation) / **environment-gated** (real disconnect behavior)

`ProvisioningProgressView.tsx` implements SignalR + API polling with P4-03 precedence rules:
- API endpoint is authoritative source of truth
- SignalR overlays `overallStatus` only
- Polling stops on terminal state
- "Real-time connection lost" warning banner when disconnected
- FM-09 covers SignalR disconnect scenario

### 6.5 Coordinator retry boundaries

Classification: **confirmed repo fact** / **repo-proven**

`RequestDetailPage.coordinator.test.tsx` (11 tests) verifies:
- 5-condition retry eligibility check
- No retry for structural failures → admin escalation banner
- No retry when retryCount ≥ 2
- No retry when already escalated
- Failure classification display (transient vs structural vs permissions)

### 6.6 Deferred surface test stubs reconciliation

Classification: **confirmed repo fact** / Mixed evidence sources

`t08-deferred-surface-tests.test.ts` contains 11 `it.todo()` stubs + 1 environment-gated scaffold. Current status:

| Stub | Status | Cross-Reference |
|------|--------|----------------|
| TC-FLOW-05: Department change triggers step 4 reset | **Remains deferred** — requires step-wizard integration with live add-on filtering | intentionally deferred |
| TC-DRAFT-02: Auto-save debounce | **Partially covered** by G4-T01-007 | repo-proven (partial) |
| TC-DRAFT-03 / TC-FAIL-04: Draft NOT cleared on API failure | **Now covered** by G4-T01-010 | repo-proven |
| TC-DRAFT-04: Draft cleared on success | **Now covered** by G4-T01-011 | repo-proven |
| TC-DRAFT-07: Draft-saved indicator | **Now covered** by G4-T01-008 | repo-proven |
| TC-DRAFT-08: Draft offline warning | **Remains deferred** — requires connectivity bar integration | intentionally deferred |
| TC-FAIL-01: Null useDraft | **Now covered** by G4-T01-001 | repo-proven |
| TC-FAIL-02: Null BIC owner | **Remains deferred** — requires HbcBicBadge component | intentionally deferred |
| TC-FAIL-03: Handoff pre-flight failure | **Remains deferred** — requires HbcHandoffComposer component | intentionally deferred |
| TC-FAIL-05: Expired clarification draft | **Remains deferred** — requires clarification form surface | intentionally deferred |
| TC-CLAR-05: Clarification resubmission | **Environment-gated** — requires live SharePoint | environment-gated |

**Summary:** 5 stubs now covered by G4 surface tests. 5 remain genuinely deferred. 1 is environment-gated. The `.todo()` stubs with "Now covered" comments remain in the file for traceability but do not represent active gaps.

---

## 7. Existing Operational-Readiness Documentation Inventory

### 7.1 Primary readiness documents

| Document | Lines | Content Summary | Classification |
|----------|-------|----------------|----------------|
| `docs/architecture/blueprint/current-state-map.md` | 648 | Tier 1 canonical current-state. §7 Wave 0 closeout baseline: G1–G6 confirmed complete, §7.2 active-but-incomplete items, §7.3 intentionally deferred Wave 1 items. Workspace dependency graph (57 members), document classification matrix. | confirmed repo fact / repo-proven |
| `docs/reference/provisioning/verification-matrix.md` | 139 | C1–C4 pass/fail matrix. 5 lifecycle paths, 8 explainability requirements, 7 supportability vectors, dead wiring audit. Specific test file references for every verdict. Test suite summary: ~485 tests across 6 suites. | confirmed repo fact / repo-proven |
| `docs/maintenance/provisioning-runbook.md` | 114 | Daily checks (timer verification, stuck run detection), manual retry workflow, archive workflow, force state override, escalation workflow, Azure Table Storage diagnostics, Step 5 manual trigger, alert thresholds (stuck >30m Sev 2, timer failure Sev 1), timer diagnostics. | confirmed repo fact / repo-proven (procedures) + environment-gated (Azure portal operations) |
| `docs/maintenance/provisioning-observability-runbook.md` | 129 | 5 KQL query templates (timeline by correlationId, failed runs 7-day, average step durations, success rate trend, Step 5 deferral rate), 2 alert rule definitions (HBIntel-ProvisioningStuck Sev 2, HBIntel-TimerFullSpecFailed Sev 1), 6 admin permissions mapped to actions, alert routing architecture, test coverage cross-references (17 + 9 + 10 tests). | confirmed repo-doc intent / environment-gated (KQL/alerts are Azure-side) |

### 7.2 Supporting readiness documents

| Document | Role | Classification |
|----------|------|----------------|
| Phase 7 closure reports (`docs/architecture/reviews/project-setup-phase-7-*.md`) | Frozen auth contract, CORS posture, deployment gates, tenant prerequisites, connected-services readiness | confirmed repo-doc intent |
| `docs/architecture/release/PH7-final-verification-evidence.md` | Phase 7 final verification evidence package | confirmed repo fact |
| `docs/reference/spfx-surfaces/responsive-failure-catalog.md` | 11 failure scenarios for SPFx surfaces | confirmed repo fact |
| Phase 8 remediation report (`docs/architecture/reviews/project-setup-phase-8-remediation-report.md`) | Prior Phase 8 remediation findings (different scope from this audit) | confirmed repo-doc intent |

---

## 8. Evidence Classification Matrix

### repo-proven

| Evidence | Source |
|----------|--------|
| Accounting queue/detail test assertions (approval, clarification, failed-only routing, expert audit) | `apps/accounting/src/test/` (2 files) |
| Estimating wizard/detail/coordinator/completion test assertions | `apps/estimating/src/test/` (4 files) |
| Admin oversight/alert/dashboard test assertions (retry, archive, escalation, force-state, permissions, coaching) | `apps/admin/src/test/` (3 files) |
| PWA parity contract verification (8 states, 5-step wizard) | `apps/pwa/src/test/parity/` (2 files) |
| Provisioning package tests (state machine, BIC, notifications, failure modes, integration rules, complexity, handoff, activation) | `packages/provisioning/src/` (21 files) |
| Cross-contract verification (14 test groups) | `packages/provisioning/src/t08-cross-contract-verification.test.ts` |
| Backend saga tests (orchestration, compensation, steps, authorization, integration) | `backend/functions/src/` (12 files) |
| Monitor and probe implementations with test coverage | `packages/features/admin/src/monitors/` and `probes/` |
| Failure mode catalog (FM-01–FM-10) | `packages/provisioning/src/failure-modes.ts` |
| Integration rules (IR-01–IR-07) | `packages/provisioning/src/integration-rules.ts` |
| Verification matrix C1–C4 verdicts with test file references | `docs/reference/provisioning/verification-matrix.md` |
| Wave 0 closeout baseline (G1–G6) | `docs/architecture/blueprint/current-state-map.md §7` |
| Admin permission model (6 granular permissions) | `@hbc/auth` G6-T02 |

### environment-gated

| Evidence | Why Environment-Gated |
|----------|----------------------|
| SignalR real-time disconnect/reconnect behavior | Requires hosted WebSocket connection |
| Azure Application Insights KQL queries | Azure portal / Log Analytics workspace |
| Azure alert rules (HBIntel-ProvisioningStuck, HBIntel-TimerFullSpecFailed) | Azure Monitor configuration |
| Azure Table Storage state inspection | Azure Storage account |
| Timer trigger execution (1:00 AM CRON) | Azure Function App timer binding |
| SPFx API permission admin approval workflow | SharePoint admin center |
| Graph API permission grants (Sites.Selected, etc.) | Entra ID / Graph admin consent |
| CORS behavior under production origin | Hosted environment with real origins |
| TC-CLAR-05 clarification resubmission integration test | Requires live SharePoint |
| Infrastructure probe responses (Azure Functions health, SharePoint health) | Real endpoint availability |

### out-of-repo prerequisite

| Evidence | Owner/Dependency |
|----------|-----------------|
| Entra ID app registrations and API permissions | Azure AD / tenant admin |
| Azure Function App deployment and configuration | DevOps / Azure subscription |
| SharePoint App Catalog `.sppkg` deployment | SharePoint admin |
| Teams Personal App auth context verification | Teams admin center |
| SMTP email relay configuration | Infrastructure team |
| 18 tenant prerequisites (documented in Phase 7 `project-setup-tenant-prerequisites.md`) | Various tenant/infra owners |

### intentionally deferred

| Item | Disposition | Reference |
|------|------------|-----------|
| SF17 persistence layer (AdminAlertsApi, ApprovalAuthorityApi, InfrastructureProbeApi) | Wave 1 — in-memory only | `current-state-map.md §7.2` |
| Teams webhook delivery confirmation | Wave 1 — fire-and-forget | `current-state-map.md §7.2` |
| Email relay (SMTP) | Wave 1 — console-logged only | `current-state-map.md §7.2` |
| 4 deferred monitors (overdue workflow, stale request, permission anomaly, override expiration) | Wave 1 | `current-state-map.md §7.2` |
| 3 deferred probes (search, notification, module-record-health) | Wave 1 | `current-state-map.md §7.2` |
| ErrorLogPage | Deferred to SF17-T05 — `HbcEmptyState` placeholder | `current-state-map.md §7.2` |
| Frontend Application Insights SDK | Wave 1 — backend-only observability in Wave 0 | `current-state-map.md §7.3` |
| Historical trend charts | Wave 1 — current-state only in Wave 0 | `current-state-map.md §7.3` |
| Bulk queue actions (bulk retry, bulk archive) | Wave 1 | `current-state-map.md §7.3` |
| Coordinator/requester admin views | Wave 1 | `current-state-map.md §7.3` |
| 5 deferred surface test stubs (TC-FLOW-05, TC-DRAFT-08, TC-FAIL-02, TC-FAIL-03, TC-FAIL-05) | Require component integration not yet available | `t08-deferred-surface-tests.test.ts` |
| 2 completion test todos (Hub welcome card) | Blocked by missing `provisionedAt` field | `RequestDetailPage.completion.test.tsx` |

---

## 9. High-Risk Gaps and Missing Evidence

### Gap 1 — No hosted end-to-end integration test

**Severity:** High for pilot entry
**Classification:** inferred recommendation / environment-gated

The repo proves all deterministic contract behavior, but no test validates the full chain: SPFx shell loads in SharePoint → calls Function App → saga executes against real Azure services → status flows back to UI. This must be validated during staging deployment.

**Recommended action:** Document as a mandatory staging-deployment gate in the environment-gated validation register. Do not attempt to simulate this in repo-local tests.

### Gap 2 — Deferred surface test stubs not reconciled

**Severity:** Medium
**Classification:** inferred recommendation / repo-proven

Five of 11 stubs in `t08-deferred-surface-tests.test.ts` have comments confirming G4 coverage, but the `.todo()` stubs remain. While not a functional gap, this creates a misleading test inventory — the file reports 11 pending items when only 5 are genuinely deferred.

**Recommended action (Prompt 03):** Update stubs with explicit skip reasons or convert covered stubs to cross-reference comments. This is a documentation/test hygiene issue, not a coverage gap.

### Gap 3 — Timer trigger verification is environment-only

**Severity:** Medium for production
**Classification:** confirmed repo-doc intent / environment-gated

The Step 5 timer (1:00 AM CRON) cannot be tested from the repo. The runbook documents manual trigger procedures and Application Insights verification, but no automated smoke test exists for timer completion in staging.

**Recommended action:** Add timer verification to the staging deployment checklist. The runbook already provides the diagnostic procedure.

### Gap 4 — Monitors and probes backed by in-memory APIs

**Severity:** Low (documented Wave 1)
**Classification:** confirmed repo fact / intentionally deferred

The 4 implemented monitors/probes use in-memory data providers (SF17 persistence deferred). They are tested and functional for Wave 0, but production persistence requires SharePoint list backing in Wave 1.

**Recommended action:** No Phase 8 action needed. Confirm SF17 is tracked for Wave 1 planning.

### Gap 5 — Loose lifecycle wording in plan documents

**Severity:** Low (documentation only, no code impact)
**Classification:** unresolved issue / repo-proven (in plan docs)

Some Phase 8 and historical plan documents use "launch" where the frozen contract uses:
- Approval → `ReadyToProvision` transition
- Backend auto-start from `ReadyToProvision`
- Provisioning runtime progression

Code and tests use correct state names. The risk is limited to potential confusion in future prompt execution.

**Recommended action (Prompt 02):** Use current contract language consistently in any lifecycle verification work. No retroactive plan rewrite needed.

### Gap 6 — Two completion test todos

**Severity:** Low
**Classification:** confirmed repo fact / intentionally deferred

`RequestDetailPage.completion.test.tsx` has 2 `it.todo()` stubs for Hub welcome card behavior, blocked by missing `provisionedAt` field. This is a known G4 deferral.

**Recommended action:** No Phase 8 action needed unless `provisionedAt` becomes available during lifecycle hardening.

---

## 10. Recommended Correction Priorities

### Prompt 02 — Lifecycle Verification Coverage Hardening

Priority targets:
1. Confirm deterministic tests exist for the full state transition chain: request submission → `Submitted` → `UnderReview` → `ReadyToProvision` → `Provisioning` → `Completed` (and failure branches).
2. Verify the `ReadyToProvision` → backend auto-start guard is explicitly tested in `approval-provisioning-integration.test.ts`.
3. Use current contract language consistently (replace any remaining "launch" terminology).
4. Close the 2 completion test todos if `provisionedAt` is now available.
5. Update verification matrix if any lifecycle coverage is added.

### Prompt 03 — Integration and Cross-Surface Validation Hardening

Priority targets:
1. Reconcile the 5 "now covered" deferred surface stubs (update comments or remove `.todo()` stubs).
2. Add cross-surface contract tests for the most critical handoff points: Accounting → Admin routing, Estimating → provisioning status polling, `?projectId=` cross-app navigation.
3. Explicitly separate repo-local integration proof from environment-gated proof in test documentation.
4. Document the environment-gated validation register for staging deployment.

### Prompt 04 — Degraded-Path, Failure-Mode, and Observability Validation Hardening

Priority targets:
1. Validate remaining deferred surface test stubs (TC-FLOW-05, TC-DRAFT-08, TC-FAIL-02, TC-FAIL-03, TC-FAIL-05) or document why they remain deferred with explicit Wave 1 disposition.
2. Confirm monitor/probe test coverage covers key degraded scenarios (network timeout, partial service availability).
3. Validate observability runbook KQL templates reference current telemetry event names.
4. Confirm alert threshold values in runbook match implementation constants.

### Prompt 05 — Operational Readiness, Runbook, and Support Verification

Priority targets:
1. Reconcile `provisioning-runbook.md` against current admin test evidence — confirm all documented procedures match tested behavior.
2. Reconcile `provisioning-observability-runbook.md` against current alert polling and dashboard test evidence.
3. Verify deployment readiness checklist aligns with Phase 7 frozen contracts and Phase 8 audit findings.
4. Produce final supportability conclusion with explicit environment-gated and out-of-repo registers.

### Prompt 06 — Final Documentation Reconciliation and Readiness Report

Priority targets:
1. Produce `project-setup-phase-8-reliability-testing-and-operational-readiness-closure-report.md` with three-way classification: repo-proven / environment-gated / out-of-repo or deferred.
2. Answer whether pilot/release hardening can start without reopening core readiness facts.
3. Ensure no Wave 1 deferred items are falsely represented as complete.

---

## 11. Explicit Unresolved Questions

### Q1. What verification already exists and is still truthful?

**Answer:** All test files listed in §5 exist and their described coverage aligns with the verification matrix. The C1–C4 verdicts are backed by specific, existing test file references and remain truthful. The test suite summary (~485 tests across 6 suites) is consistent with repo evidence.

**Classification:** confirmed repo fact / repo-proven

### Q2. What verification exists only as doc claims and not as live repo evidence?

**Answer:** Two categories:
- KQL query templates and alert rule definitions in the observability runbook are documentation-only — they describe Azure-side configurations, not repo-testable artifacts.
- Five deferred surface test stubs have comments claiming G4 coverage, but the `.todo()` stubs themselves remain in the test file. The G4 tests they reference do exist and are passing; the gap is in stub cleanup, not coverage.

**Classification:** confirmed repo-doc intent (KQL/alerts) / unresolved issue (stub cleanup)

### Q3. What degraded/failure paths are already covered vs uncovered?

**Answer:**
- **Covered:** FM-01–FM-10 with recovery paths, compensation chain, alert escalation, SignalR fallback implementation, coordinator retry boundaries (5-condition check), admin force-state override.
- **Partially covered:** TC-DRAFT-02 auto-save debounce.
- **Uncovered (deferred):** TC-FLOW-05 department reset, TC-DRAFT-08 offline warning, TC-FAIL-02 null BIC badge, TC-FAIL-03 handoff pre-flight, TC-FAIL-05 expired clarification draft.
- **Environment-gated:** TC-CLAR-05 clarification resubmission, real SignalR disconnect.

**Classification:** confirmed repo fact (covered); intentionally deferred (uncovered); environment-gated (integration)

### Q4. What runbooks and support docs already exist and how accurate are they?

**Answer:** Two operational runbooks exist:
- `provisioning-runbook.md` — procedures match test-verified admin actions. FM-01–FM-10 recovery table aligns with `failure-modes.ts`. Alert thresholds match implementation constants (30 min stuck, 2 h timer).
- `provisioning-observability-runbook.md` — KQL templates reference current telemetry event names. Alert rule definitions match documented thresholds. Permission table matches `@hbc/auth` constants.

Both are accurate to current repo state. Minor reconciliation may be needed if Phase 8 Prompts 02–04 add new evidence.

**Classification:** confirmed repo fact / repo-proven (procedures) + environment-gated (Azure configurations)

### Q5. Which current tests and docs are the authoritative Phase 8 evidence set?

**Answer:** The files listed in §12 (Exact Files Inspected) constitute the authoritative evidence set. The four primary readiness documents (current-state-map, verification-matrix, provisioning-runbook, observability-runbook) are the anchor documents.

**Classification:** confirmed repo fact

### Q6. Where does the repo already distinguish repo-local proof from external/platform proof?

**Answer:**
- The verification matrix C4 (dead wiring audit) explicitly lists incomplete items with Wave 1 disposition.
- `current-state-map.md §7.2–7.3` separates active-but-incomplete from intentionally deferred.
- The observability runbook explicitly states that Azure alert rules are configured in Azure Portal/ARM, not created from the repo.
- Phase 7 deployment readiness checklist separates code-ready from tenant-blocked prerequisites.
- `t08-deferred-surface-tests.test.ts` uses `describe.skipIf(!process.env['SHAREPOINT_INTEGRATION_TEST_ENABLED'])` for environment-gated tests.

**Classification:** confirmed repo fact / repo-proven

### Q7. Which missing evidence is high-risk enough to block pilot or release hardening if left unresolved?

**Answer:** No deterministic repo-side gap blocks pilot entry. The following environment-gated items must be verified during staging deployment:
- Full hosted integration chain (SPFx → Function App → saga → status feedback)
- Timer trigger execution verification
- Azure alert rule activation
- Graph API permission grants and CORS behavior

These are environment-gated by nature and cannot be addressed by repo-only work.

**Classification:** inferred recommendation / environment-gated

### Q8. Which incomplete items are intentionally deferred rather than accidental gaps?

**Answer:** All items listed in `current-state-map.md §7.2` (6 items) and `§7.3` (6 items), plus:
- 5 remaining deferred surface test stubs (TC-FLOW-05, TC-DRAFT-08, TC-FAIL-02, TC-FAIL-03, TC-FAIL-05)
- 2 completion test todos (Hub welcome card, blocked by `provisionedAt`)

All are explicitly documented with Wave 1 or component-dependency disposition. No accidental gaps were identified.

**Classification:** confirmed repo fact / intentionally deferred

### Q9. Which current docs or prompts still use overly loose lifecycle wording such as "launch" where more precise contract language is needed?

**Answer:** Some Phase 8 plan documents and the prompt audit report use casual "launch" shorthand. The live code and tests consistently use correct state names (`ReadyToProvision`, `Provisioning`, `Completed`, `Failed`). The runbooks use procedural language that aligns with implementation. The risk is limited to prompt execution context — a code agent reading these prompts could misinterpret lifecycle semantics.

**Classification:** unresolved issue / repo-proven (documentation only)

### Q10. What exact remediation sequence should Prompts 02–05 follow?

**Answer:** See §10. Recommended order:
1. **Prompt 02:** Lifecycle verification hardening (state transitions, auto-start guard, contract language)
2. **Prompt 03:** Integration/cross-surface validation (stub reconciliation, cross-app handoffs, env-gated register)
3. **Prompt 04:** Degraded-path/observability hardening (deferred stubs, monitor scenarios, runbook alignment)
4. **Prompt 05:** Operational readiness/runbook verification (runbook reconciliation, deployment checklist, supportability conclusion)
5. **Prompt 06:** Final closure reporting

This order follows the dependency flow: establish lifecycle truth → validate cross-surface interactions → validate failure behavior → reconcile support docs → produce closure report.

**Classification:** inferred recommendation

---

## P8-02 Addendum — Lifecycle Verification Coverage Hardening

**Date:** 2026-04-02
**Prompt:** `Prompt-02_Phase-8-Lifecycle-Verification-Coverage-Hardening.md`

### What was added

New test file: `packages/provisioning/src/p08-lifecycle-coverage-hardening.test.ts`

6 describe blocks, 21 tests:

| Group | Tests | What It Proves | Classification |
|-------|-------|---------------|----------------|
| P8-02-LC-01: Full lifecycle path contracts | 6 | Happy path, clarification, external setup, failure, recovery, and longest-lifecycle chains are all valid through `isValidTransition()` | repo-proven |
| P8-02-LC-02: Auto-start guard | 2 | Only `ReadyToProvision` may transition to `Provisioning`; all other 7 states are rejected | repo-proven |
| P8-02-LC-03: Terminal state assertions | 3 | `Completed` has zero outgoing transitions; `Failed` and `NeedsClarification` each have exactly one (`→ UnderReview`) | repo-proven |
| P8-02-LC-04: Ownership continuity | 4 | `deriveCurrentOwner()` returns correct role at every state: Controller (Submitted, UnderReview, AwaitingExternalSetup), Requester (NeedsClarification), null/system (ReadyToProvision, Provisioning), Project Lead (Completed), Admin (Failed) | repo-proven |
| P8-02-LC-05: Status label and badge completeness | 3 | All 8 states have non-empty labels and badge variants; Completed→completed, Failed→error | repo-proven |
| P8-02-LC-06: Notification coverage at lifecycle boundaries | 3 | Key lifecycle events present (request-submitted, clarification-requested, ready-to-provision, first-failure, completed); all 15 registrations have non-empty eventType and channels | repo-proven |

### Verification results

```
pnpm --filter @hbc/provisioning run test
  Test Files  21 passed | 1 skipped (22)
       Tests  293 passed | 1 skipped | 10 todo (304)
    Coverage  98.78% statements

pnpm --filter @hbc/spfx-accounting run lint   → clean
pnpm --filter @hbc/spfx-accounting run build  → success
pnpm --filter @hbc/spfx-accounting run test   → 5 files, 37 tests passed
```

### What remains environment-gated

- Auto-start trigger mechanism (what polling/event triggers the `ReadyToProvision → Provisioning` transition at runtime)
- Timer trigger execution (Step 5, 1:00 AM CRON)
- Real SignalR disconnect/reconnect behavior
- Azure alert rule activation
- Graph API permission grants and CORS behavior

### What remains intentionally deferred

- `provisionedAt` field not yet in `IProjectSetupRequest` — 2 completion test todos remain blocked
- 5 deferred surface test stubs (TC-FLOW-05, TC-DRAFT-08, TC-FAIL-02, TC-FAIL-03, TC-FAIL-05)
- SF17 persistence layer (monitors/probes in-memory only)

### P8-02 completion assessment

The highest-value lifecycle coverage gaps are now repo-proven:
- All 4 canonical lifecycle paths validated end-to-end through the state machine
- Auto-start guard exclusivity proven (only ReadyToProvision may enter Provisioning)
- Terminal and constrained state boundaries asserted
- Ownership continuity proven across the full lifecycle
- Status visibility completeness proven for all 8 states
- Notification coverage at lifecycle boundaries confirmed

Remaining gaps are either environment-gated (cannot be repo-proven) or intentionally deferred (Wave 1 / component dependency). No lifecycle gap blocks pilot entry.

---

## 12. Exact Files Inspected

### Authoritative readiness documents

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

### Accounting verification

- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

### Estimating verification

- `apps/estimating/src/test/NewRequestPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.completion.test.tsx`

### Admin verification

- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`
- `apps/admin/src/test/OperationalDashboardPage.test.tsx`

### Admin monitors and probes

- `packages/features/admin/src/monitors/provisioningFailureMonitor.ts`
- `packages/features/admin/src/monitors/stuckWorkflowMonitor.ts`
- `packages/features/admin/src/probes/azureFunctionsProbe.ts`
- `packages/features/admin/src/probes/sharePointProbe.ts`

### PWA verification

- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/test/parity/stateLabels.test.ts`
- `apps/pwa/src/test/parity/wizardConfig.test.ts`

### Shared provisioning verification

- `packages/provisioning/src/failure-modes.ts`
- `packages/provisioning/src/integration-rules.ts`
- `packages/provisioning/src/t08-cross-contract-verification.test.ts`
- `packages/provisioning/src/t08-deferred-surface-tests.test.ts`

### Backend lifecycle verification

- `backend/functions/src/functions/provisioningSaga/__tests__/saga-orchestrator.test.ts`
- `backend/functions/src/functions/provisioningSaga/__tests__/compensation.test.ts`
- `backend/functions/src/functions/provisioningSaga/__tests__/approval-provisioning-integration.test.ts`
- `backend/functions/src/functions/provisioningSaga/__tests__/provisioning-authorization.test.ts`
- `backend/functions/src/functions/provisioningSaga/__tests__/smoke.test.ts`
- `backend/functions/src/functions/provisioningSaga/steps/steps.test.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.test.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.test.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.test.ts`
- `backend/functions/src/functions/provisioningSaga/notification-dispatch.test.ts`
- `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`
- `backend/functions/src/test/request-lifecycle.integration.test.ts`

### Additional provisioning package tests

- `packages/provisioning/src/state-machine.test.ts`
- `packages/provisioning/src/bic-registration.test.ts`
- `packages/provisioning/src/bic-config.test.ts`
- `packages/provisioning/src/history-level-registry.test.ts`
- `packages/provisioning/src/coaching-prompt-registry.test.ts`
- `packages/provisioning/src/complexity-gate-helpers.test.ts`
- `packages/provisioning/src/notification-registrations.test.ts`
- `packages/provisioning/src/notification-templates.test.ts`
- `packages/provisioning/src/summary-field-registry.test.ts`
- `packages/provisioning/src/visibility.test.ts`
- `packages/provisioning/src/store.test.ts`
- `packages/provisioning/src/api-client.test.ts`
- `packages/provisioning/src/handoff-config.test.ts`
- `packages/provisioning/src/activation/handoffActivation.test.ts`
- `packages/provisioning/src/activation/createProjectActivation.test.ts`
- `packages/provisioning/src/activation/activation-flow.integration.test.ts`
- `packages/provisioning/src/failure-modes.test.ts`
- `packages/provisioning/src/integration-rules.test.ts`
- `packages/provisioning/src/__tests__/handoff-config.test.ts`
- `packages/provisioning/src/p08-lifecycle-coverage-hardening.test.ts` (P8-02)

### Phase 8 prompt package

- `docs/architecture/plans/MASTER/spfx/accounting/phase-8/Phase-8_Reliability-Testing-and-Operational-Readiness_Implementation-Plan.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-8/README_Phase-8-Reliability-Testing-and-Operational-Readiness.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-8/Accounting_Phase8_Prompt_Audit_Report.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-8/Prompt-01_Phase-8-Repo-Truth-Reliability-Testing-and-Operational-Readiness-Audit.md`

### Version manifests

- `apps/accounting/package.json`
- `apps/accounting/config/package-solution.json`

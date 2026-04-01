# Prompt-01 — Phase 8 Repo-Truth Reliability, Testing, and Operational Readiness Audit

## Objective

Conduct a comprehensive repo-truth audit of the current verification, reliability, degraded-path, observability, and operational-readiness state for the Project Setup workflow spanning requester submission, Accounting controller review, provisioning runtime behavior, and Admin exception handling.

This is an audit prompt, not a broad implementation prompt.

## Critical Working Rules

- Treat live repo code and tests as authoritative for implementation facts.
- Use `docs/architecture/blueprint/current-state-map.md` as the current-state document authority when present-truth questions arise.
- Treat the current verification matrix and maintenance runbooks as primary readiness evidence, not optional background reading.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Do not propose broad remediation beyond clearly labeled priorities.
- Do not overstate repo-local evidence as full hosted-environment or tenant proof.

## Canonical Copy Check

Before concluding the audit memo, confirm which package copy is canonical **in the current workspace**.

Required result for this package:

- state whether the package exists under `docs/architecture/plans/MASTER/spfx/accounting/phase-8/`
- explicitly state whether duplicate package copies were found in the current workspace
- if the package being audited is only an attached artifact / local draft and not yet committed in the repo, say so directly
- do not hard-code machine-specific absolute paths in the memo

## Required Audit Scope

Audit the current repo truth across at least the following.

### Authoritative readiness docs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

### Accounting verification
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

### Estimating / requester / coordinator / completion verification
- `apps/estimating/src/test/NewRequestPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`
- `apps/estimating/src/test/RequestDetailPage.completion.test.tsx`

### Admin verification / support seams
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`
- `apps/admin/src/test/OperationalDashboardPage.test.tsx`
- `packages/features/admin/src/monitors/provisioningFailureMonitor.ts`
- `packages/features/admin/src/monitors/stuckWorkflowMonitor.ts`
- `packages/features/admin/src/probes/azureFunctionsProbe.ts`
- `packages/features/admin/src/probes/sharePointProbe.ts`

### PWA / progress / parity
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/test/parity/stateLabels.test.ts`
- `apps/pwa/src/test/parity/wizardConfig.test.ts`

### Shared provisioning verification seams
- `packages/provisioning/src/failure-modes.ts`
- `packages/provisioning/src/integration-rules.ts`
- `packages/provisioning/src/t08-cross-contract-verification.test.ts`
- `packages/provisioning/src/t08-deferred-surface-tests.test.ts`

### Backend lifecycle / provisioning verification
- the current provisioning lifecycle, compensation, request-lifecycle, and contract tests identified from repo truth
- any repo-current verification files directly cited by the current-state map or verification matrix

## Questions You Must Answer

1. What verification already exists and is still truthful?
2. What verification exists only as doc claims and not as live repo evidence?
3. What degraded/failure paths are already covered vs uncovered?
4. What runbooks and support docs already exist and how accurate are they?
5. Which current tests and docs are the authoritative Phase 8 evidence set?
6. Where does the repo already distinguish repo-local proof from external/platform proof?
7. Which missing evidence is high-risk enough to block pilot or release hardening if left unresolved?
8. Which incomplete items are intentionally deferred rather than accidental gaps?
9. Which current docs or prompts still use overly loose lifecycle wording such as “launch” where more precise contract language is needed?
10. What exact remediation sequence should Prompts 02–05 follow?

## Required Output

Create a markdown audit memo at:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

The memo must include:

- Executive Summary
- Canonical Copy Check
- Confirmed Repo Facts
- Confirmed Repo-Doc Intent
- Existing Verification Inventory by Surface and Backend Area
- Existing Degraded-Path / Failure-Mode Coverage
- Existing Operational-Readiness Documentation Inventory
- Evidence Classification Matrix (`repo-proven` / `environment-gated` / `out-of-repo` / `deferred`)
- High-Risk Gaps and Missing Evidence
- Recommended Correction Priorities
- Explicit Unresolved Questions
- Exact Files Inspected

## Required Classification Discipline

For every major finding, label it as one of:

- confirmed repo fact
- confirmed repo-doc intent
- inferred recommendation
- unresolved issue

Also classify the evidence source as one of:

- repo-proven
- environment-gated
- out-of-repo prerequisite
- intentionally deferred

## Completion Standard

This prompt is complete only when the repo contains a clean readiness-audit memo that later prompts can use as the decision basis for coverage hardening, degraded-path validation, runbook reconciliation, and final closure.

# Phase 4 — Provisioning Status and Saga Interaction Hardening

## Implementation Plan

## Objective

Harden the provisioning execution-read boundary so the Project Setup system behaves like a reliable production asynchronous workflow, using the **actual current repo model** rather than an abstract or outdated status design.

Phase 4 focuses on:

- durable run-status persistence
- request / run / status correlation
- latest-run project reads versus per-run persistence
- SignalR and polling interaction
- timer-driven Step 5 follow-on behavior
- failure / retry / escalation / terminal semantics
- Admin direct status consumption
- Accounting indirect compatibility
- final repo-doc reconciliation

## Why Phase 4 Must Be Precise

The live repo already contains a concrete model:

- status is persisted per run using `projectId` + `correlationId`
- the project-scoped status endpoint returns the latest run for the project
- retries create new correlation IDs
- SignalR is best-effort
- the saga and timer both reconcile request state in some, but not all, terminal paths
- Admin directly consumes durable status
- Accounting remains an indirect compatibility surface

So Phase 4 must not behave as though it is designing a status model from zero.  
It must harden and document the existing one, and only change architecture deliberately where repo evidence justifies it.

## Authority and Evidence Standard

Use this order whenever repo truth and documents differ:

1. live code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living provisioning and surface docs
4. older PH6 and historical docs as drift evidence only

Every Phase 4 artifact must separate:

- confirmed repo fact
- confirmed repo-doc intent
- inferred recommendation
- unresolved issue

## Required Repo-Truth Inputs To Verify

Phase 4 must ground itself in at least the following sources:

### Backend
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/signalr/index.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/services/signalr-push-service.ts`
- relevant provisioning saga tests if present

### Shared package / models
- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/provisioning/src/api-client.ts`
- `packages/provisioning/src/store.ts`
- `packages/provisioning/src/hooks/useProvisioningSignalR.ts`
- `packages/provisioning/README.md`

### App consumers
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/hooks/provisioning/useProvisioningApi.ts`

### Current-state and living docs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/estimating-requester-surface.md`
- `docs/reference/models/provisioning.md`
- `docs/explanation/provisioning-architecture.md`
- `docs/how-to/developer/spfx-signalr-auth.md`
- `docs/reference/provisioning/*`
- `docs/maintenance/*`

## In Scope

- durable run-status contract hardening
- request / run / status correlation hardening
- latest-run project-read semantics
- SignalR negotiation / push / reconnect / teardown review
- polling fallback and status endpoint primacy
- timer Step 5 follow-on status behavior
- failure / retry / escalation / archive / acknowledgment / override interaction review
- Accounting indirect compatibility verification
- Admin direct compatibility verification
- repo-doc reconciliation for status/saga truth

## Out of Scope

- broad lifecycle redesign
- broad UI redesign
- unrelated SharePoint provisioning step redesign
- tenant rollout work
- broad auth / infrastructure rollout work outside what must be updated for coherent Phase 4 docs

## Ordered Stages

### Stage 1 — Repo-Truth Provisioning Status and Saga Audit

**Prompt:** `Prompt-01_Phase-4-Repo-Truth-Provisioning-Status-and-Saga-Audit.md`

Purpose:

- establish the exact live status/saga baseline
- map request ↔ run ↔ status correlation
- identify direct versus indirect consumers
- identify request/status reconciliation gaps and drift-risk actions

Primary outputs:

- `docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md`
- evidence-backed discrepancy inventory
- recommended implementation targets for later prompts

Exit condition:

- the repo has one clear baseline description of how status, runs, SignalR, polling, timer follow-on, and surfaces currently interact

### Stage 2 — Durable Status Contract and Run Correlation Hardening

**Prompt:** `Prompt-02_Phase-4-Durable-Status-Contract-and-Run-Correlation-Hardening.md`

Purpose:

- harden and document the canonical durable run-status contract
- make project / run / latest-run semantics explicit
- preserve or deliberately change the current per-run persistence model with evidence

Primary outputs:

- code updates, if needed
- contract docs
- `docs/architecture/reviews/phase-4-durable-status-contract-and-run-correlation-report.md`

Exit condition:

- the adopted status model is explicit and stable

### Stage 3 — SignalR, Polling, and Client Status Consumption Hardening

**Prompt:** `Prompt-03_Phase-4-SignalR-Polling-and-Client-Status-Consumption-Hardening.md`

Purpose:

- harden SignalR as an enhancement layer
- keep status endpoint reads authoritative
- validate store merge, reconnect, stale-event, and terminal-state behavior

Primary outputs:

- code/doc updates
- `docs/architecture/reviews/phase-4-signalr-polling-and-client-status-hardening-report.md`

Exit condition:

- direct client consumption is coherent and the status endpoint remains source of truth

### Stage 4 — Failure, Terminal State, and Retry Interaction Hardening

**Prompt:** `Prompt-04_Phase-4-Failure-Terminal-State-and-Retry-Interaction-Hardening.md`

Purpose:

- align failure, retry, timer follow-on, escalation, archive, acknowledgment, override, and terminal semantics
- explicitly test for request/status drift after mutation paths

Primary outputs:

- code/doc updates
- `docs/architecture/reviews/phase-4-failure-terminal-and-retry-interaction-report.md`

Exit condition:

- failure and terminal behaviors are deterministic and cross-model drift is addressed or explicitly documented

### Stage 5 — Accounting and Admin Status Workflow Compatibility Verification

**Prompt:** `Prompt-05_Phase-4-Accounting-and-Admin-Status-Workflow-Compatibility-Verification.md`

Purpose:

- verify Admin direct compatibility
- verify Accounting indirect compatibility through request-state reconciliation and lifecycle messaging
- preserve app boundary discipline

Primary outputs:

- compatibility fixes if needed
- doc updates
- `docs/architecture/reviews/phase-4-accounting-admin-status-compatibility-report.md`

Exit condition:

- Admin and Accounting remain aligned with backend truth without boundary drift

### Stage 6 — Final Documentation Reconciliation and Readiness Report

**Prompt:** `Prompt-06_Phase-4-Final-Documentation-Reconciliation-and-Readiness-Report.md`

Purpose:

- reconcile final docs to repo truth
- state the adopted status model clearly
- record residual risks and next-phase prerequisites

Primary outputs:

- final doc updates
- `docs/architecture/reviews/phase-4-provisioning-status-and-saga-readiness-report.md`

Exit condition:

- Phase 4 can be closed with explicit evidence and residual risk language

## Completion Check

Phase 4 is not complete until the final closure report can state, with evidence:

- what the durable status model actually is
- how request, run, and status are correlated
- whether per-run rows plus latest-run reads remain the governing model
- how SignalR and polling interact
- how timer Step 5 follow-on behaves
- how retries and admin mutations affect correlation and terminal truth
- how Admin directly consumes status
- how Accounting remains indirectly compatible
- what residual risks remain, if any

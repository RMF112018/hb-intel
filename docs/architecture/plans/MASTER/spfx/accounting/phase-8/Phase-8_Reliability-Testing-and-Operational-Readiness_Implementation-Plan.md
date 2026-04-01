# Phase 8 — Reliability, Testing, and Operational Readiness

## Implementation Plan

## Objective

Prove that the Accounting-side Project Setup workflow, the connected provisioning runtime, and the Admin/support surfaces are reliable, verifiable, diagnosable, and ready to proceed into pilot / release hardening without overstating what the repo actually proves today.

## Why Phase 8 Must Happen

By this point the repo may already have substantial workflow functionality and a meaningful Wave 0 verification baseline, but pilot/release readiness requires more than feature presence.

The live repo already contains:

- controller-surface verification in Accounting
- requester/coordinator/completion verification in Estimating
- admin recovery and alerting verification in Admin
- provisioning lifecycle and supportability evidence in the verification matrix
- maintenance runbooks for operations and observability
- explicit documentation of deferred or out-of-repo items

Phase 8 exists to turn that body of evidence into a disciplined readiness package:

- validate the existing evidence against repo truth
- close the most important missing gaps
- explicitly classify what remains environment-gated, tenant-gated, out-of-repo, or intentionally deferred

## Authority and Evidence Standard

Use this order whenever repo truth and documents differ:

1. live code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living verification/runbook/reference docs
4. historical plans and prior phase docs as drift evidence only

Every Phase 8 artifact must clearly separate:

- confirmed repo fact
- confirmed repo-doc intent
- inferred recommendation
- unresolved issue

Every readiness conclusion must also classify evidence as one of:

- repo-proven
- environment-gated
- out-of-repo / tenant / Azure prerequisite
- intentionally deferred

## Current Repo-Truth Inputs To Verify

Phase 8 must ground itself in at least the following current-state sources.

### Authoritative readiness / operations docs
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

### Admin recovery / support verification
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`
- `apps/admin/src/test/OperationalDashboardPage.test.tsx`
- `packages/features/admin/src/monitors/provisioningFailureMonitor.ts`
- `packages/features/admin/src/monitors/stuckWorkflowMonitor.ts`
- `packages/features/admin/src/probes/azureFunctionsProbe.ts`
- `packages/features/admin/src/probes/sharePointProbe.ts`

### PWA progress / parity verification
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/test/parity/stateLabels.test.ts`
- `apps/pwa/src/test/parity/wizardConfig.test.ts`

### Shared provisioning verification seams
- `packages/provisioning/src/failure-modes.ts`
- `packages/provisioning/src/integration-rules.ts`
- `packages/provisioning/src/t08-cross-contract-verification.test.ts`
- `packages/provisioning/src/t08-deferred-surface-tests.test.ts`

### Backend lifecycle / provisioning verification
- the current provisioning lifecycle / compensation / contract test suites identified from repo truth
- any current request-lifecycle and saga-related verification files directly referenced by the current-state map or verification matrix

Do not assume the current package’s general language is enough. Use exact file evidence.

## Phase 8 Scope

### In Scope

- repo-truth readiness and verification audit
- lifecycle and route-contract verification hardening
- integration / cross-surface / realistic-path validation hardening
- degraded-path and observability validation
- runbook / support documentation reconciliation
- final readiness closure reporting

### Out Of Scope

- broad feature redesign
- new workflow semantics
- tenant portal configuration outside what must be documented
- broad infrastructure rollout work
- pretending deferred Wave 1 items are complete
- inflating repo-local evidence into full production-environment proof

## Required Outcomes

By the end of Phase 8, the repo should have an explicit, evidence-backed answer for:

1. what verification already exists and is still truthful
2. what critical lifecycle verification was missing and is now added
3. what integration / cross-surface validation is repo-proven versus still environment-gated
4. what degraded and failure behavior is actually validated
5. what observability and support guidance matches the current implementation
6. what remains tenant/Azure/out-of-repo or intentionally deferred
7. whether the solution is ready to proceed into pilot / release hardening

## Ordered Stages

### Stage 1 — Repo-Truth Reliability, Testing, and Operational Readiness Audit

**Prompt:** `Prompt-01_Phase-8-Repo-Truth-Reliability-Testing-and-Operational-Readiness-Audit.md`

Purpose:

- establish the authoritative verification/readiness evidence inventory
- confirm which docs and tests are current authority
- identify missing evidence, degraded-path blind spots, and supportability mismatches

Primary outputs:

- `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`
- severity-ranked gap inventory
- recommended implementation order for prompts 02–05

Exit condition:

- the repo has one evidence-backed inventory of what is proven, partially proven, environment-gated, or unresolved

### Stage 2 — Lifecycle Verification Coverage Hardening

**Prompt:** `Prompt-02_Phase-8-Lifecycle-Verification-Coverage-Hardening.md`

Purpose:

- close the highest-value missing deterministic verification around request submission, controller action, `ReadyToProvision` handoff, backend auto-start guard behavior, provisioning progression, and terminal states
- keep lifecycle wording aligned with the frozen contract rather than looser “launch” terminology

Primary outputs:

- added/updated lifecycle tests
- updated audit evidence
- explicit remaining lifecycle gaps

Exit condition:

- lifecycle behavior is evidenced as repo-proven or explicitly classified as not yet repo-proven

### Stage 3 — Integration and End-to-End Workflow Validation Hardening

**Prompt:** `Prompt-03_Phase-8-Integration-and-End-to-End-Workflow-Validation-Hardening.md`

Purpose:

- harden realistic cross-surface validation while explicitly separating repo-local integration proof from environment-gated browser/tenant proof

Primary outputs:

- expanded integration / realistic-path coverage
- environment-gated validation register
- updated evidence notes

Exit condition:

- there is no ambiguity about what is proven locally versus what still requires hosted or tenant validation

### Stage 4 — Degraded-Path, Failure-Mode, and Observability Validation Hardening

**Prompt:** `Prompt-04_Phase-8-Degraded-Path-Failure-Mode-and-Observability-Validation-Hardening.md`

Purpose:

- validate degraded-path behavior against actual failure-mode, alerting, monitoring, and observability seams in the repo

Primary outputs:

- degraded-path validation evidence
- observability validation notes
- blind-spot register

Exit condition:

- the repo and docs clearly state what happens under disconnection, polling fallback, backend/API failure, stale status, partial service availability, and support/alerting scenarios

### Stage 5 — Operational Readiness, Runbook, and Support Verification

**Prompt:** `Prompt-05_Phase-8-Operational-Readiness-Runbook-and-Support-Verification.md`

Purpose:

- reconcile maintenance/runbook/support docs against actual repo behavior and explicitly capture remaining external/platform prerequisites

Primary outputs:

- updated runbooks/support docs
- updated audit evidence
- supportability conclusions

Exit condition:

- support documentation reflects current repo behavior rather than aspirational behavior

### Stage 6 — Final Documentation Reconciliation and Readiness Report

**Prompt:** `Prompt-06_Phase-8-Final-Documentation-Reconciliation-and-Readiness-Report.md`

Purpose:

- close the phase with one authoritative readiness report that distinguishes repo-proven completion from external dependencies and deferred work

Primary outputs:

- `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-closure-report.md`

Exit condition:

- the repo has one decision-ready Phase 8 closure artifact

## Working Standards For All Stages

- prefer repo-truth evidence over plan ambition
- begin from the current-state map, verification matrix, and maintenance docs
- distinguish deterministic repo-local proof from environment-gated proof
- distinguish supportability already in place from supportability that still depends on external configuration
- do not overstate completion for deferred Wave 1 items
- correct docs before inventing new parallel docs
- keep a running unresolved/deferred/external blocker register

## Completion Check

Phase 8 should not be considered closed until the final closure report can state, with evidence:

- what is repo-proven
- what is environment-gated
- what is out-of-repo / tenant / Azure dependent
- what is intentionally deferred
- whether pilot / release hardening can start without reopening core readiness facts

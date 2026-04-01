# Phase 9 — Release Hardening, Pilot, and Cutover

## Implementation Plan

## Objective

Turn the current Accounting-side Project Setup implementation from technically mature into release-governed, pilot-ready, and cutover-ready by building an evidence-backed release package grounded in repo truth and external prerequisite tracking.

## Why Phase 9 Must Happen After Phase 8

The repo already contains significant implementation, verification, and operational-readiness evidence, but a release decision still requires more than “the code and tests exist.”

The live repo now includes:

- current-state readiness context
- a Project Setup release-scope manifest
- workflow and exception-path verification evidence
- runbooks and observability guidance
- configuration and permission-path docs
- current role and support boundaries

Phase 9 exists to convert that material into a controlled release package that can support staging, pilot, cutover, rollback, and closure.

## Authority and Evidence Standard

Use this order whenever repo truth and documents differ:

1. live code, tests, and runbooks
2. `docs/architecture/blueprint/current-state-map.md`
3. current release/configuration/maintenance/reference docs
4. historical plans and prior summaries as supporting evidence only
5. official Microsoft platform guidance for deployment-slot, SPFx deployment, and API approval behavior

Every Phase 9 artifact must distinguish between:

- repo-proven
- manual verification required
- externally blocked
- deferred / out of scope
- not yet evidenced

## Current Repo-Truth Inputs To Verify

Phase 9 must ground itself in at least the following current sources:

### Current-state and release boundary
- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`

### Verification and support evidence
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

### Configuration and external prerequisite posture
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`

### Current verification suites that matter for release smoke coverage
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`

### Prior phase artifacts if present in the repo
- Phase 7 readiness/security outputs
- Phase 8 reliability/readiness outputs
- any current release/readiness checklists already committed

### Official Microsoft guidance to consult when needed
- Azure Functions continuous deployment and staging-slot guidance
- Azure Functions deployment slots / swap / rollback behavior
- SPFx app-catalog deployment guidance
- SharePoint API access approval guidance for Entra-secured APIs

## Phase 9 Scope

### In Scope

- repo-truth release-readiness audit
- staging and pre-cutover validation package
- pilot plan and controlled enablement model
- cutover and rollback package
- post-cutover verification and hypercare plan
- final release closure and signoff reporting
- explicit external-prerequisite tracking

### Out of Scope

- broad feature implementation
- major architecture changes
- silent changes to environment or cutover assumptions
- claiming approvals or tenant readiness without evidence
- pretending Azure/tenant operations are proven by repo artifacts alone

## Required Outcomes

By the end of Phase 9, the repo should have an explicit, evidence-backed answer for:

1. what is repo-complete today
2. what is staging-ready today
3. what is pilot-ready today
4. what is production-ready today
5. what must still be manually validated
6. what is externally blocked
7. what the actual cutover and rollback path should be
8. what immediate post-cutover verification and hypercare look like
9. whether the release recommendation is go / no-go / go-with-constraints

## Ordered Stages

### Stage 1 — Repo-Truth Release Readiness Audit

**Prompt:** `Prompt-01_Phase-9-Repo-Truth-Release-Readiness-Audit.md`

Purpose:

- establish the real release baseline from repo evidence
- classify readiness by stage
- build the external-dependency register

Primary outputs:

- `docs/architecture/reviews/phase-9-release-readiness-audit.md`

Exit condition:

- the release posture is classified clearly enough to drive the rest of Phase 9

### Stage 2 — Staging Deployment and Pre-Cutover Validation

**Prompt:** `Prompt-02_Phase-9-Staging-Deployment-and-Pre-Cutover-Validation.md`

Purpose:

- define the executable staging/pre-cutover validation package
- make config, smoke, evidence, and manual checks explicit

Primary outputs:

- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`

Exit condition:

- staging validation can be executed without guesswork

### Stage 3 — Pilot Readiness and Controlled User Enablement

**Prompt:** `Prompt-03_Phase-9-Pilot-Readiness-and-Controlled-User-Enablement.md`

Purpose:

- define a bounded pilot rather than a broad release
- establish measurable pilot success/failure thresholds

Primary outputs:

- `docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md`

Exit condition:

- the repo contains an executable pilot model tied to actual evidence and dependencies

### Stage 4 — Production Cutover and Rollback Preparation

**Prompt:** `Prompt-04_Phase-9-Production-Cutover-and-Rollback-Preparation.md`

Purpose:

- define the real release-day cutover path
- define the actual rollback path supported by the target environment or document the conditional alternatives

Primary outputs:

- `docs/architecture/release/phase-9-production-cutover-and-rollback-checklist.md`

Exit condition:

- cutover and rollback are practical, sequenced, and evidence-bound

### Stage 5 — Post-Cutover Verification and Hypercare Readiness

**Prompt:** `Prompt-05_Phase-9-Post-Cutover-Verification-and-Hypercare-Readiness.md`

Purpose:

- define immediate production verification, issue handling, and stabilization expectations
- align hypercare to real runbooks and observability evidence

Primary outputs:

- `docs/architecture/release/phase-9-post-cutover-verification-and-hypercare-plan.md`

Exit condition:

- the repo contains a supportable early-production operating plan

### Stage 6 — Final Release Closure and Signoff Report

**Prompt:** `Prompt-06_Phase-9-Final-Release-Closure-and-Signoff-Report.md`

Purpose:

- consolidate all evidence and produce the final release decision package

Primary outputs:

- `docs/architecture/reviews/phase-9-final-release-closure-and-signoff-report.md`

Exit condition:

- the repo has an evidence-backed final release recommendation

## Working Standards for All Stages

- prefer repo evidence over summary language
- keep a running external dependency register
- do not conflate repo-complete with production-ready
- do not assume slot-based rollback unless the environment supports it
- do not assume tenant approvals are complete unless evidenced
- use current workflow contract wording, not stale “launch” language
- prefer existing authoritative docs over duplicate release docs
- do not force certainty where the environment still requires manual validation

## Completion Check

Phase 9 should not be considered closed until the final closure report can state, with evidence:

- what is repo-proven
- what still requires manual validation
- what is externally blocked
- whether pilot can proceed
- whether production cutover can proceed
- what rollback method will be used
- what hypercare model is expected
- whether the release recommendation is go / no-go / constrained go

# Phase 2 — Backend Lifecycle Hardening Package

## Purpose

This package is the canonical Phase 2 prompt set for backend lifecycle hardening of the Accounting-side Project Setup workflow.

Canonical working copy:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-2/`

Package-copy check:

- confirm the repo-relative package location above is the working copy being updated
- explicitly state whether any duplicate package copies are found elsewhere in the repo before treating another copy as authoritative

Phase 2 remains an **implementation-forward backend hardening phase**. It is not a Phase 1-style contract-only phase. Its job is to harden the backend lifecycle contract, validations, idempotency, run/status correlation, and Accounting compatibility against current repo truth.

Phase 2 must keep two different state planes explicit:

- the **project setup request-state lifecycle**
- the **provisioning run / durable status lifecycle**

The backend is authoritative across both, but the package must not let a local code agent flatten them into one model.

## Authority Order

Every prompt in this package must use this authority order:

1. live backend/app code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living refs for Accounting, Admin, Estimating, provisioning, runbooks, and Project Setup host posture
4. PH6 and older MVP docs as historical drift sources, not present-truth authority

Do not treat PH6 or earlier MVP task plans as peer authority when current code and current-state docs disagree.

## Confirmed Repo-Truth Baseline That Governs Phase 2

The live repo currently shows all of the following:

- controller approval currently advances a request to `ReadyToProvision`
- `backend/functions/src/functions/projectRequests/index.ts` auto-starts the provisioning saga from that transition
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` reconciles the request into `Provisioning`
- Admin recovery routes and API methods already exist for retry, archive, escalation acknowledgment, state override, and run listing
- `AwaitingExternalSetup` still exists in the lifecycle and Accounting queue model, but the live Accounting detail surface still lacks a forward action there
- durable provisioning status, admin actions, and Project Setup host-boundary work are further along than some PH6-era wording implies
- the current repo includes more than one provisioning launch entry point, so Phase 2 must distinguish:
  - the controller-facing approval-triggered launch path
  - direct provisioning endpoint launch
  - admin retry / recovery launch
- the Phase 2 implementation report path referenced by this package does not yet exist and should be treated as a deliverable to create, not an already-present artifact

These facts are the starting point for Phase 2. Do not write prompts that ignore them.

## Package Contents

- `Phase-2_Backend-Lifecycle-Hardening_Implementation-Plan.md`
- `Prompt-01_Phase-2-Backend-Lifecycle-Repo-Truth-and-Gap-Audit.md`
- `Prompt-02_Phase-2-Backend-State-Transition-and-Launch-Contract-Remediation.md`
- `Prompt-03_Phase-2-Backend-Validation-Idempotency-and-Uniqueness-Hardening.md`
- `Prompt-04_Phase-2-Provisioning-Run-Status-Correlation-and-Observability-Hardening.md`
- `Prompt-05_Phase-2-Accounting-Workflow-Compatibility-and-Contract-Verification.md`
- `Prompt-06_Phase-2-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Recommended Execution Order

1. Prompt-01 — establish repo truth and a hardening gap baseline
2. Prompt-02 — freeze and implement the controller-facing lifecycle / launch contract
3. Prompt-03 — harden validations, uniqueness, and idempotency controls
4. Prompt-04 — harden provisioning run/status correlation and observability seams
5. Prompt-05 — verify Accounting workflow compatibility with the hardened backend
6. Prompt-06 — reconcile docs and issue the final Phase 2 readiness report

Do not skip order. Prompt-02 depends on Prompt-01 findings. Prompt-03 through Prompt-05 depend on the contract frozen in Prompt-02.

## Working Rules For The Local Code Agent

- Treat live repo code and tests as the source of truth.
- Do not assume historical plan text is correct if the repo contradicts it.
- Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
- Keep Phase 2 implementation-forward, but do not turn it into broad frontend redesign or general platform churn.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - inferred recommendation
  - unresolved gap
- Prefer targeted backend hardening over broad architectural churn.
- Preserve domain boundaries:
  - Accounting = controller/business gate
  - Admin = recovery / override / escalation
  - backend/functions = lifecycle and orchestration authority
  - `@hbc/provisioning` = shared lifecycle contract / client / store seam
- Keep request-state lifecycle truth and provisioning-run truth separate unless a deliberate architecture change justifies merging or redefining them.

## Expected Review Artifact

Maintain and update a single report at:

`docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md`

This file is the expected Phase 2 evidence package output. If it does not yet exist at Prompt-01 time, create it there rather than treating its absence as a repo defect.

## Exit Condition

Phase 2 is complete only when the final report shows that:

- the backend lifecycle contract is coherent
- the controller-facing provisioning trigger behavior is explicit and documented
- backend validations and idempotency controls are trustworthy
- run/status relationships are durable enough to support operations
- the Accounting workflow no longer depends on undefined backend behavior
- remaining blockers are clearly classified as:
  - Phase 3 frontend follow-up
  - external dependency
  - intentionally deferred work
- request-state and provisioning-run lifecycle distinctions remain explicit and accurate

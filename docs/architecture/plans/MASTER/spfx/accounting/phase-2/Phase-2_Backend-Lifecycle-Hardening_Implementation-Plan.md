# Phase 2 — Backend Lifecycle Hardening

## Implementation Plan

## Objective

Make the backend the single trustworthy workflow engine for the Accounting-side Project Setup lifecycle so the Accounting app can safely review, advance, and monitor requests against current repo truth.

Phase 2 must harden the backend **without collapsing two different state planes into one**:

- the **project setup request-state lifecycle**
- the **provisioning run / durable status lifecycle**

The backend must stay authoritative across both, but the implementation and documentation must not pretend they are the same model.

## Why Phase 2 Exists

The live repo is already beyond the older PH6-era picture in several important ways:

- controller approval currently advances a request to `ReadyToProvision`
- the backend auto-starts the provisioning saga from that transition
- the saga then reconciles the request to `Provisioning`
- admin recovery routes and API methods already exist
- durable provisioning status, host-boundary work, and observability references are more mature than some older plans imply
- `AwaitingExternalSetup` still exists in the lifecycle and queue model, but the current Accounting detail surface still lacks a forward action from that state
- the repo contains both:
  - a controller-facing approval-triggered launch path
  - a direct provisioning endpoint plus admin retry/recovery entry points

Phase 2 exists to harden the backend around that actual state of the repo rather than re-implementing from stale assumptions.

## Authority And Evidence Standard

Use this order whenever code and docs disagree:

1. live backend/app code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living refs and runbooks
4. PH6 and older MVP task plans as historical drift evidence only

Every Phase 2 artifact must separate:

- confirmed repo fact
- confirmed repo-doc intent
- inferred recommendation
- unresolved gap

## Phase Scope

### In Scope

- request lifecycle transition authority
- controller-facing provisioning trigger timing and semantics
- relationship between controller auto-launch, direct provisioning endpoint launch, and admin retry/recovery launch
- project-number validation and any Phase-2-owned uniqueness hardening
- controller/admin/requester/system authorization boundaries
- duplicate-run prevention and idempotency
- request/run/status correlation
- durable status and operational evidence
- compatibility verification for the current Accounting surface
- documentation reconciliation for backend lifecycle behavior

### Out Of Scope

- large Accounting UI redesign
- new Admin feature expansion
- replacing the provisioning architecture wholesale
- broader domain-host restructuring beyond what this phase must name or validate
- general tenant/security rollout work beyond documenting discovered dependencies

## Required Current-State Inputs

At minimum, Phase 2 must anchor itself in:

- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/state-machine.ts`
- `backend/functions/src/hosts/project-setup/index.ts`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`
- `packages/provisioning/src/*`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/router/routes.ts`
- `backend/functions/package.json`
- `apps/accounting/package.json`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/maintenance/provisioning-runbook.md`

Treat these as historical drift sources to classify rather than default authority:

- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- `docs/architecture/plans/PH6.11-Accounting-App.md`
- older MVP Project Setup task plans where their workflow wording diverges from the current repo

## Implementation Sequence

### Stage 1 — Repo-Truth Backend Audit

Establish the exact current behavior of:

- request-state transitions
- controller approval auto-launch
- direct provisioning endpoint launch
- admin retry/recovery behavior
- validation
- durable status
- host posture
- live Accounting compatibility

Primary output:

- documented baseline of what the backend actually does today
- explicit distinction between request-state truth and provisioning-run-status truth

### Stage 2 — Lifecycle And Launch Contract Remediation

Freeze and implement the canonical **controller-facing** lifecycle / launch contract starting from current repo truth, not from PH6-era symmetry between options.

Default starting point:

- approval -> `ReadyToProvision`
- auto-trigger from `ReadyToProvision`
- saga reconciliation -> `Provisioning`

This stage must also classify how the backend treats:
- direct `provision-project-site`
- admin retry / recovery entry points

Any reversal away from the current controller-facing flow must be treated as a deliberate architecture change with explicit compatibility consequences.

Primary output:

- explicit backend lifecycle / launch contract with no ambiguous controller trigger semantics
- explicit classification of non-controller launch entry points

### Stage 3 — Validation, Uniqueness, And Idempotency Hardening

Harden the server-side controls so the client cannot create unsafe or contradictory lifecycle state.

This stage must explicitly distinguish:

- what request lifecycle code already enforces today
- what downstream activation or duplicate detection already exists elsewhere
- what still remains missing in backend lifecycle enforcement

Primary output:

- trustworthy backend transition, validation, and duplicate-run controls
- honest statement of whether project-number uniqueness is fully enforced, partially enforced, or still a remaining gap

### Stage 4 — Run / Status / Observability Hardening

Audit and harden the existing request/run/status model and observability seams. Do not write this as if the repo has no status or admin API surface yet.

Primary output:

- operationally intelligible lifecycle records
- stable request/run/status correlation model
- explicit launch-response / durable-status contract documentation

### Stage 5 — Accounting Compatibility Verification

Verify the hardened backend against the current Accounting controller workflow and isolate exact frontend follow-up work for Phase 3.

Primary output:

- clean boundary between backend readiness work and later UI completion work
- explicit statement about whether the current Accounting surface remains compatible without a new launch button

### Stage 6 — Documentation Reconciliation And Closure

Update the authoritative docs and final review artifact so the repo clearly reflects the corrected backend behavior and explicitly classifies historical drift sources.

Primary output:

- final Phase 2 readiness report with closure statements, follow-up items, and external dependencies

## Deliverables

- updated backend implementation as required by later prompts
- updated tests
- updated backend/provisioning docs where Phase 2 prompts explicitly require them
- updated final review artifact:
  - `docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md`

## Acceptance Criteria

Phase 2 is complete when all of the following are true:

- the controller-facing provisioning trigger point is unambiguous in code and docs
- the backend fully owns transition and launch validation
- request-state lifecycle and provisioning-run lifecycle are no longer conflated
- duplicate launches are blocked server-side or explicitly classified as a remaining gap
- project-number rules are enforced server-side to the degree claimed by the package
- Accounting-facing lifecycle behavior is documented and backend-compatible
- request/run/status relationships are durable and inspectable
- controller auto-launch, direct provisioning endpoint behavior, and admin retry/recovery are explicitly classified rather than silently blended together
- remaining blockers are clearly classified as frontend follow-up, external dependency, or intentional deferment

## Suggested Commit / Review Rhythm

- Prompt-01 may produce audit-only documentation updates
- Prompt-02 through Prompt-04 may produce implementation commits
- Prompt-05 should remain a compatibility verification / follow-up correction pass
- Prompt-06 should be the final documentation and closure pass

## Final Note

Do not begin broad frontend changes during this phase unless a small compatibility correction is required to keep the repo from remaining internally contradictory after backend hardening. The goal of Phase 2 is to make the backend authoritative and trustworthy first.

# Phase 2 — Backend Lifecycle Hardening Implementation Plan

## Objective

Make the backend the single trustworthy workflow engine for the Accounting-side Project Setup lifecycle so the Accounting app can safely review, advance, and monitor requests against current repo truth.

## Why Phase 2 Exists

The live repo is already beyond the older PH6-era picture in several important ways:

- approval currently advances to `ReadyToProvision`
- the backend auto-starts the provisioning saga from that transition
- the saga then reconciles the request to `Provisioning`
- admin recovery routes and API methods already exist
- durable provisioning status, host-boundary work, and observability references are more mature than some older plans imply
- `AwaitingExternalSetup` still exists in the lifecycle and queue model, but the current Accounting detail surface still lacks a forward action from that state

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
- provisioning trigger timing and semantics
- project-number validation and uniqueness hardening
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
- `backend/functions/src/hosts/project-setup/*`
- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `packages/provisioning/src/*`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
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

Establish the exact current behavior of lifecycle transitions, saga start, validation, admin recovery APIs, durable status, host posture, and live Accounting compatibility.

Primary output:

- documented baseline of what the backend actually does today

### Stage 2 — Lifecycle And Launch Contract Remediation

Freeze and implement the canonical lifecycle/launch contract starting from current repo truth, not from PH6-era symmetry between options.

Default starting point:

- approval -> `ReadyToProvision`
- auto-trigger from `ReadyToProvision`
- saga reconciliation -> `Provisioning`

Any reversal away from that flow must be treated as a deliberate architecture change with explicit compatibility consequences.

Primary output:

- explicit backend lifecycle contract with no ambiguous trigger semantics

### Stage 3 — Validation, Uniqueness, And Idempotency Hardening

Harden the server-side controls so the client cannot create unsafe or contradictory lifecycle state.

This stage must explicitly distinguish:

- what request lifecycle code already enforces today
- what activation-layer or downstream duplicate detection already exists elsewhere
- what still remains missing in backend lifecycle enforcement

Primary output:

- trustworthy backend transition, validation, and duplicate-run controls

### Stage 4 — Run / Status / Observability Hardening

Audit and harden the existing request/run/status model and observability seams. Do not write this as if the repo has no status or admin API surface yet.

Primary output:

- operationally intelligible lifecycle records and remaining-gap register

### Stage 5 — Accounting Compatibility Verification

Verify the hardened backend against the current Accounting controller workflow and isolate exact frontend follow-up work for Phase 3.

Primary output:

- clean boundary between backend readiness work and later UI completion work

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
- package-level audit artifact:
  - `docs/architecture/reviews/phase-2-prompt-package-audit-and-reconciliation.md`

## Acceptance Criteria

Phase 2 is complete when all of the following are true:

- the provisioning trigger point is unambiguous in code and docs
- the backend fully owns transition and launch validation
- duplicate launches are blocked server-side or explicitly classified as a remaining gap
- project-number rules are enforced server-side to the degree claimed by the package
- Accounting-facing lifecycle behavior is documented and backend-compatible
- request/run/status relationships are durable and inspectable
- remaining blockers are clearly classified as frontend follow-up, external dependency, or intentional deferment

## Suggested Commit / Review Rhythm

- Prompt-01 may produce audit-only documentation updates
- Prompt-02 through Prompt-04 may produce implementation commits
- Prompt-05 should remain a compatibility verification / follow-up correction pass
- Prompt-06 should be the final documentation and closure pass

## Final Note

Do not begin broad frontend changes during this phase unless a small compatibility correction is required to keep the repo from remaining internally contradictory after backend hardening. The goal of Phase 2 is to make the backend authoritative and trustworthy first.

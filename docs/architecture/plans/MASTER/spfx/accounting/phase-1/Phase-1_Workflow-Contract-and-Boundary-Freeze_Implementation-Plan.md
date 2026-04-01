# Phase 1 — Workflow Contract and Boundary Freeze

## Implementation Plan

## Objective

Audit and reconcile the Accounting-side Project Setup workflow contract against live repo truth, then freeze the workflow, boundary, validation, evidence, and authoritative-document contracts so later implementation work is not driven by stale assumptions.

## Why Phase 1 Must Happen First

The live repo contains a real contract problem set that later phases must not inherit blindly:

- the lifecycle model still contains both `ReadyToProvision` and `Provisioning`
- the current Accounting approve action captures and validates a `projectNumber`
- the current backend auto-starts the provisioning saga when approval advances a request to `ReadyToProvision`
- the saga then owns the system-side progression into provisioning execution
- some older lifecycle and notification docs still read as if a controller performs a distinct later launch action
- `AwaitingExternalSetup` remains part of the lifecycle and Accounting queue model, but the current Accounting detail page does not expose a forward action from that state
- Admin recovery boundaries are already much stronger in live code than some older docs imply
- current backend authorization and service-factory posture are more mature than older PH6-style docs describe

Without a deliberate Phase 1 freeze, later work could implement against contradictory lifecycle, ownership, and backend-posture assumptions.

## Authority and Evidence Standard

Use this order whenever repo truth and documents differ:

1. live code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living reference docs for Accounting, Admin, Estimating, Project Setup backend, and production posture
4. PH6 and other historical docs as drift evidence only

Every Phase 1 artifact must separate:

- confirmed repo fact
- confirmed repo-doc intent
- inferred recommendation
- unresolved ambiguity

## Current Repo-Truth Inputs To Verify

Phase 1 must ground itself in at least the following current-state sources:

### Accounting surface and tests
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

### Shared lifecycle / ownership / notification package
- `packages/provisioning/src/state-machine.ts`
- `packages/provisioning/src/bic-config.ts`
- `packages/provisioning/src/notification-registrations.ts`

### Backend lifecycle / auth / host posture
- `backend/functions/src/state-machine.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`

### Current-state and living docs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/provisioning/verification-matrix.md`

### Known drift or potentially stale comparison sources
- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/reference/provisioning/notification-event-matrix.md`

Treat older PH6 and historical reference docs as potential drift sources to classify during reconciliation, not default authority.

## Phase 1 Scope

### In Scope

- repo-truth workflow discrepancy audit
- lifecycle and provisioning-trigger freeze
- Accounting, Admin, Estimating, backend, and shared-package responsibility freeze
- current auth / domain-host posture anchoring where it materially affects Project Setup semantics
- validation, audit, and evidence contract freeze
- authoritative-doc precedence and reconciliation
- final closure and go-forward readiness reporting

### Out of Scope

- broad frontend implementation
- broad backend refactoring
- tenant deployment work
- release-host hardening beyond what must be named for coherence
- connected-service rollout changes
- broad evidence-persistence implementation
- “fix every doc in the repo” cleanup outside the Project Setup contract surface

## Required Outcomes

By the end of Phase 1, the repo should have an explicit, evidence-backed answer for:

1. the actual repo-truth workflow problem set
2. the exact Accounting approve action that sets `ReadyToProvision`
3. the exact backend event that auto-starts provisioning from that approval
4. the role of `Provisioning` in current live behavior
5. the meaning and current UX status of `AwaitingExternalSetup`
6. the real Accounting versus Admin versus Estimating boundary
7. the current validation and evidence gaps versus already-implemented behavior
8. the current auth and host posture that materially shapes Project Setup behavior
9. the authoritative source list later phases must follow

## Ordered Stages

### Stage 1 — Repo-Truth Workflow Contract Audit

**Prompt:** `Prompt-01_Phase-1-Repo-Truth-Workflow-Contract-Audit.md`

Purpose:

- establish a fresh discrepancy inventory against the current repo
- confirm which docs are current authority and which are drift sources
- capture current auth / domain-host posture sources that now materially affect the workflow contract

Primary outputs:

- `docs/architecture/reviews/phase-1-workflow-contract-audit.md`
- severity-ranked discrepancy inventory

Exit condition:

- all known lifecycle, trigger, boundary, auth-posture, and doc-drift issues are evidenced and classified

### Stage 2 — Request Lifecycle and Provisioning Trigger Freeze

**Prompt:** `Prompt-02_Phase-1-Request-Lifecycle-and-Provisioning-Trigger-Freeze.md`

Purpose:

- freeze the lifecycle semantics around approval, `ReadyToProvision`, automatic saga start, and `Provisioning`
- replace stale lifecycle wording with one coherent contract statement
- explicitly capture the approval call shape and auto-trigger semantics

Primary outputs:

- `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`
- authoritative lifecycle source list and superseded-semantics register

Exit condition:

- there is one unambiguous explanation of how current approval and provisioning handoff work, plus any intentionally preserved ambiguity

### Stage 3 — Application Boundary and Role Responsibility Freeze

**Prompt:** `Prompt-03_Phase-1-Application-Boundary-and-Role-Responsibility-Freeze.md`

Purpose:

- freeze live action and ownership boundaries across Accounting, Estimating, Admin, backend orchestration, and `@hbc/provisioning`
- explicitly separate valid backend transition rights from current live UI affordances

Primary outputs:

- `docs/architecture/reviews/phase-1-application-boundary-freeze.md`
- visible-action, authoritative-owner, and system-transition matrices

Exit condition:

- later prompts can tell which surface owns which action without collapsing UI visibility into system ownership

### Stage 4 — Validation, Audit, and Evidence Contract Freeze

**Prompt:** `Prompt-04_Phase-1-Validation-Audit-and-Evidence-Contract-Freeze.md`

Purpose:

- freeze the contract for validation, assistive checks, persisted evidence, role/auth evidence context, and acknowledged repo gaps

Primary outputs:

- `docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md`
- separate sections for current enforcement, current persistence, current auth-context evidence, and missing-but-required evidence

Exit condition:

- later implementation work can add validation and evidence behavior without reopening baseline semantics

### Stage 5 — Authoritative Documentation Reconciliation

**Prompt:** `Prompt-05_Phase-1-Authoritative-Documentation-Reconciliation.md`

Purpose:

- reconcile the authoritative documentation set
- explicitly downgrade or annotate stale sources that should no longer drive implementation
- directly neutralize the highest-risk lifecycle and notification drift docs

Primary outputs:

- `docs/architecture/reviews/phase-1-authoritative-doc-reconciliation.md`
- authoritative source list for later phases

Exit condition:

- later implementation agents can follow a coherent source set without accidentally treating PH6 drift as present truth

### Stage 6 — Final Closure and Go-Forward Readiness Report

**Prompt:** `Prompt-06_Phase-1-Final-Closure-and-Go-Forward-Readiness-Report.md`

Purpose:

- confirm whether Phase 1 actually closed the foundational workflow-contract questions
- state what remains intentionally open

Primary outputs:

- `docs/architecture/reviews/phase-1-final-closure-and-readiness-report.md`
- explicit answer set for the core audit questions

Exit condition:

- the repo has a decision-ready baseline for later implementation, or the report explains why it does not

## Working Standards for All Stages

- prefer repo-truth verification over historical plan preservation
- keep a running discrepancy register
- distinguish visible UI action from authoritative owner from system transition
- distinguish valid backend-authorized transition from live UI affordance
- prefer doc reconciliation over speculative runtime changes
- prefer existing authoritative docs over creating duplicate docs
- do not force certainty where the repo still contains legitimate ambiguity
- do not claim closure without stating remaining ambiguity and carry-forward risk

## Completion Check

Phase 1 should not be considered closed until the final closure report can state, with evidence:

- the workflow problem set is accurately framed
- lifecycle semantics are frozen against current repo truth
- provisioning trigger semantics are frozen against current repo truth
- approval semantics include the project-number requirement and auto-trigger behavior
- Accounting/Admin/Estimating/backend responsibilities are frozen
- validation and evidence expectations are frozen as contracts
- current auth / host posture is anchored well enough to prevent later drift
- the authoritative source list for later work is explicit
- remaining ambiguity is intentionally preserved rather than hidden

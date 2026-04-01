# Prompt-02 — Phase 1 Request Lifecycle And Provisioning Trigger Freeze

## Objective

Freeze the request lifecycle semantics and the authoritative provisioning trigger explanation for the Accounting-side Project Setup workflow.

Use the audit output from:

`docs/architecture/reviews/phase-1-workflow-contract-audit.md`

This prompt must convert the discrepancy inventory into one coherent contract statement that reflects the live repo.

## Critical Working Rules

- Treat live repo code and tests as authoritative for what exists.
- Use current-state and living reference docs to determine present authoritative documentation.
- Treat older PH6 and historical notification/lifecycle docs as drift candidates unless they are reaffirmed by current repo truth.
- Do not re-read files already in active context unless needed to verify a contradiction, capture exact evidence, or confirm a change.
- This is a workflow-contract freeze prompt, not a broad implementation prompt.
- Do not introduce broad behavioral changes.

## Required Lifecycle Decisions

You must explicitly resolve and document:

1. the controller event that sets `ReadyToProvision`
2. the backend event that auto-starts the provisioning saga from that transition
3. the system event that reconciles the request into `Provisioning`
4. what `AwaitingExternalSetup` means in current contract terms
5. what `ReadyToProvision` means in current contract terms
6. what `Provisioning` means in current contract terms
7. whether any language such as “launch,” “finish setup,” or “complete project setup” remains valid, and if so, in what exact sense
8. whether `ReadyToProvision` should be treated, in current practice, as:
   - a durable business state
   - a short-lived handoff state
   - both
9. what exact transition path the Accounting controller surface must support end to end

Do not assume a distinct controller-side launch button exists unless current repo truth proves it.

## Required Source Review

At minimum, review and reconcile the most relevant current sources among:

- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/state-machine.ts`
- `packages/provisioning/src/state-machine.ts`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/provisioning/verification-matrix.md`

Treat the following as likely drift sources to classify or annotate rather than default authority:

- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/reference/provisioning/notification-event-matrix.md`

## Required Documentation Updates

Update the authoritative doc set so the lifecycle contract is no longer contradictory. This may include:

- current living/current-state docs
- contract comments in state-machine files where a precise clarification is necessary
- historical docs only when they must be explicitly marked as stale, superseded, or limited-scope

Also create a freeze memo at:

`docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`

## Required Freeze Memo Contents

- Final Decision Summary
- Frozen State Definitions
- Frozen Transition Model
- Frozen Trigger Explanation
- Controller Event Versus System Event Separation
- Superseded Or Limited-Scope Semantics
- Required Consequences For Later Implementation
- Explicitly Deferred Items
- Ambiguities Intentionally Preserved

## Hard Requirement

At the end of this prompt, there must be one unambiguous answer to:

> What exact controller-side event sets `ReadyToProvision`, what exact backend event starts provisioning, and what exact system action reconciles the request into `Provisioning`?

If repo truth still leaves a narrower ambiguity, preserve it explicitly instead of inventing certainty.

## Verification

Include:

- every file reviewed
- every file updated
- every stale statement or model replaced, downgraded, or annotated
- any remaining ambiguity that could not honestly be closed

## Completion Standard

This prompt is complete only when later prompts no longer need to reopen lifecycle and trigger semantics except to correct a newly discovered repo-truth contradiction.

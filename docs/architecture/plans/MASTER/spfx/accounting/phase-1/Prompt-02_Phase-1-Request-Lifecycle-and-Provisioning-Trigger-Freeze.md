# Prompt-02 — Phase 1 Request Lifecycle and Provisioning Trigger Freeze

## Objective

Freeze the request lifecycle semantics and the authoritative provisioning-trigger explanation for the Accounting-side Project Setup workflow.

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
- Prefer docs updates first. Only add or edit inline source comments if a small clarification is necessary to keep code-local semantics honest.

## Required Lifecycle Decisions

You must explicitly resolve and document:

1. the exact controller event that sets `ReadyToProvision`
2. the exact approve call shape, including `projectNumber`
3. the backend event that auto-starts the provisioning saga from that transition
4. the current guard conditions around auto-start (for example, when an existing provisioning status suppresses a new trigger)
5. the system event or progression that reconciles the request into actual provisioning execution
6. what `AwaitingExternalSetup` means in current contract terms
7. what `ReadyToProvision` means in current contract terms
8. what `Provisioning` means in current contract terms
9. whether any language such as “launch,” “trigger,” “finish setup,” or “complete project setup” remains valid, and if so, in what exact sense
10. whether `ReadyToProvision` should currently be described as:
   - a durable business state
   - a short-lived handoff state
   - both
11. what exact transition path the Accounting controller surface currently supports end to end
12. what valid backend-authorized transition exists that the current Accounting detail page does **not** expose live

Do not assume a distinct controller-side launch button exists unless current repo truth proves it.

## Required Source Review

At minimum, review and reconcile the most relevant current sources among:

- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `packages/provisioning/src/state-machine.ts`
- `packages/provisioning/src/bic-config.ts`
- `backend/functions/src/state-machine.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`
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
- minimal clarifying comments in lifecycle source files if necessary
- historical docs only when they must be explicitly marked as stale, superseded, or limited-scope

Also create a freeze memo at:

`docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`

## Required Freeze Memo Contents

- Final Decision Summary
- Frozen State Definitions
- Frozen Transition Model
- Frozen Trigger Explanation
- Exact Approval Action Contract
- Controller Event vs System Event Separation
- Current UI-Supported Path vs Contract-Valid But Not Exposed Path
- Superseded or Limited-Scope Semantics
- Required Consequences for Later Implementation
- Explicitly Deferred Items
- Ambiguities Intentionally Preserved

## Hard Requirement

At the end of this prompt, there must be one unambiguous answer to:

> What exact controller-side event sets `ReadyToProvision`, what exact backend event auto-starts provisioning from that approval, and what exact meaning does `Provisioning` retain in the current contract?

If repo truth still leaves a narrower ambiguity, preserve it explicitly instead of inventing certainty.

## Additional Hard Requirement

Your final freeze language must make all of the following explicit:

- approval requires a valid `projectNumber`
- the backend auto-trigger is currently implemented in `advanceRequestState`
- `ReadyToProvision` still exists in the modeled lifecycle
- `ReadyToProvision` and `Provisioning` are not identical even though the handoff is now automatic
- `ReadyToProvision` and `Provisioning` are currently treated as system-owned in the shared BIC model

## Verification

Include:

- every file reviewed
- every file updated
- every stale statement or model replaced, downgraded, or annotated
- any remaining ambiguity that could not honestly be closed

## Completion Standard

This prompt is complete only when later prompts no longer need to reopen lifecycle and trigger semantics except to correct a newly discovered repo-truth contradiction.

# Prompt-03 — Phase 1 Application Boundary and Role Responsibility Freeze

## Objective

Freeze the application boundary, role responsibility map, and action ownership model for the Accounting-side Project Setup workflow.

Use the outputs from:

- `docs/architecture/reviews/phase-1-workflow-contract-audit.md`
- `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`

## Critical Working Rules

- Treat live repo code and tests as authoritative for implementation facts.
- Use current-state and living reference docs before historical plans.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- This prompt is about boundary and responsibility freeze, not broad feature implementation.
- Prefer documentation reconciliation and narrowly scoped contract clarification over behavior changes.
- Do not collapse “visible action,” “authorized transition,” and “system-owned progression” into one category.

## Boundary Questions To Freeze

You must explicitly freeze:

1. what Accounting owns
2. what Estimating owns
3. what Admin owns
4. what backend orchestration owns
5. what `@hbc/provisioning` owns as the shared lifecycle package
6. which actions are visible in Accounting today
7. which actions are visible in Estimating today
8. which actions are visible in Admin today
9. which lifecycle changes are system transitions rather than user-facing actions
10. which actions are valid by lifecycle/authorization contract but not currently exposed in the live UI
11. which actions are prohibited from Accounting even if they would be technically easy to expose
12. whether Accounting is a review gate, an approval-to-handoff gate, or both
13. whether `AwaitingExternalSetup -> ReadyToProvision` is:
   - contract-valid
   - controller-authorized
   - currently exposed in Accounting UI
   - a documented live gap
14. what the current role-resolution model means for boundary language in docs

## Minimum Source Review

At minimum, compare:

- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `packages/provisioning/src/bic-config.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/state-machine.ts`
- `backend/functions/src/middleware/authorization.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `docs/architecture/blueprint/current-state-map.md`

## Specific Questions To Resolve

- Is Accounting a review gate, an approval-to-handoff gate, or both?
- Does Accounting own any live forward action from `AwaitingExternalSetup`, or is that currently only a contract-valid but UI-missing path?
- Does Accounting ever retry or recover failed provisioning?
- What exactly happens when Accounting hands a failed request to Admin?
- What is the Estimating coordinator’s limited retry and escalation role?
- Which states are system-owned even if a surface still displays them?
- Which responsibilities belong to the shared lifecycle package instead of any individual surface?
- Which current docs incorrectly blur user-facing action ownership with backend/system ownership?

## Required Deliverable

Create or update a boundary memo at:

`docs/architecture/reviews/phase-1-application-boundary-freeze.md`

The memo must include:

- Executive Summary
- Surface Responsibility Matrix
- State-by-State Visible Action Matrix
- State-by-State Authorized Transition Matrix
- State-by-State Authoritative Owner Matrix
- State-by-State System Transition Matrix
- Accounting Scope
- Estimating Scope
- Admin Scope
- Backend and `@hbc/provisioning` Scope
- Current Live Gap Register
- Prohibited Boundary Drift
- Phase 2 Implications

## Hard Requirement

Explicitly distinguish:

- visible action
- valid authorized transition
- authoritative owner
- system transition

Do not collapse those concepts together.

## Required Additional Reconciliation

Update the most authoritative affected docs so the surface-boundary language is aligned. This should favor current-state and living surface docs before any historical plans.

## Completion Standard

This prompt is complete only when a future implementation agent can answer, without guesswork:

- what action belongs in Accounting
- what action belongs in Estimating
- what action belongs in Admin
- what belongs only to backend orchestration or `@hbc/provisioning`
- which contract-valid transitions are not currently live UI actions
- which actions are intentionally not part of Accounting

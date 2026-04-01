# Prompt-01 — Phase 1 Repo-Truth Workflow Contract Audit

## Objective

Conduct a fresh repo-truth audit of the Accounting-side Project Setup workflow contract. The goal is to identify every discrepancy, stale assumption, ambiguity, or authority conflict that must be resolved before workflow semantics are frozen.

This is an audit prompt, not a broad implementation prompt.

## Critical Working Rules

- Treat live repo code and tests as authoritative for implementation facts.
- Use `docs/architecture/blueprint/current-state-map.md` as the current-state document authority when present-truth questions arise.
- Treat older PH6 and historical reference docs as potential drift sources unless current repo truth and current authoritative docs reaffirm them.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Do not make broad code changes.
- Only make narrowly scoped documentation updates if needed to record a strictly factual repo-truth observation.

## Canonical Copy Check

Before concluding the audit memo, confirm which package copy is canonical.

Required result for this package:

- record that the package under `docs/architecture/plans/MASTER/spfx/accounting/phase-1/` is the working copy that was audited
- explicitly state whether any duplicate package copies were found

## Required Audit Scope

Audit the current repo truth across at least the following:

- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `packages/provisioning/src/state-machine.ts`
- `packages/provisioning/src/bic-config.ts`
- `packages/provisioning/src/notification-registrations.ts`
- `backend/functions/src/state-machine.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/provisioning/verification-matrix.md`

Also inspect the following as likely stale or partially stale comparison sources:

- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/reference/provisioning/notification-event-matrix.md`
- any other PH6 or historical workflow text that still appears to influence current prompt wording

## Questions You Must Answer

1. What exact Accounting-side controller actions are implemented today?
2. What request states and transitions are implemented today?
3. What exact backend event currently starts the provisioning saga?
4. How does the live repo distinguish:
   - controller approval and transition to `ReadyToProvision`
   - automatic provisioning start
   - system-owned `Provisioning`
5. Is there a live Accounting UI gap between `AwaitingExternalSetup` and the next valid state?
6. What responsibilities are already clearly separated across Accounting, Estimating, Admin, backend, and `@hbc/provisioning`?
7. Which docs still describe a different workflow from current code?
8. Which stale docs are merely historical, and which are still risky because they could mislead a later implementation agent?
9. Which discrepancies are severe enough to block later implementation if left unresolved?

## Required Output

Create a markdown audit memo at:

`docs/architecture/reviews/phase-1-workflow-contract-audit.md`

The memo must include:

- Executive Summary
- Canonical Copy Check
- Confirmed Repo Facts
- Confirmed Repo-Doc Intent
- Discrepancy Inventory
- Stale Authority Paths And Why They Are Stale
- Severity Ranking
- Recommended Freeze Decisions For Prompt-02
- Explicit Open Questions
- Exact Files Inspected

## Required Classification Discipline

For every major finding, label it as one of:

- confirmed repo fact
- confirmed repo-doc intent
- inferred recommendation
- unresolved ambiguity

Do not mix these categories together without saying which category is doing the work.

## Required Structure For Discrepancy Inventory

For each discrepancy, include:

- ID
- topic
- classification
- repo-truth evidence
- conflicting doc or implementation evidence
- why it matters
- recommended resolution direction
- downstream implementation risk if unresolved

## Verification

At the end of your response and in the memo, include:

- exact files inspected
- exact repo evidence used
- exact docs treated as current authority
- exact docs treated as stale or historical drift sources

## Completion Standard

This prompt is complete only when the repo contains a clean discrepancy memo that future prompts can use as the decision basis for lifecycle, boundary, and documentation freeze work.

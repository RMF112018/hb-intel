# Prompt-01 — Phase 1 Repo-Truth Workflow Contract Audit

## Objective

Conduct a fresh repo-truth audit of the Accounting-side Project Setup workflow contract. The goal is to identify every discrepancy, stale assumption, ambiguity, authority conflict, and current-backend-posture dependency that must be resolved before workflow semantics are frozen.

This is an audit prompt, not a broad implementation prompt.

## Critical Working Rules

- Treat live repo code and tests as authoritative for implementation facts.
- Use `docs/architecture/blueprint/current-state-map.md` as the current-state document authority when present-truth questions arise.
- Treat older PH6 and historical reference docs as potential drift sources unless current repo truth and current authoritative docs reaffirm them.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Do not make broad code changes.
- Only make narrowly scoped documentation updates if needed to record a strictly factual repo-truth observation.
- Do not collapse “allowed transition,” “current UI action,” and “system-owned progression” into one concept.

## Canonical Copy Check

Before concluding the audit memo, confirm which package copy is canonical **in the current workspace**.

Required result for this package:

- state whether the package exists under `docs/architecture/plans/MASTER/spfx/accounting/phase-1/`
- explicitly state whether duplicate package copies were found in the current workspace
- if the package being audited is only an attached artifact / local draft and not yet committed in the repo, say so directly
- do not hard-code machine-specific absolute paths in the memo

## Required Audit Scope

Audit the current repo truth across at least the following:

### Accounting surface and tests
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

### Shared lifecycle / ownership package
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

Also inspect the following as likely stale or partially stale comparison sources:

- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/reference/provisioning/notification-event-matrix.md`
- any other PH6 or historical workflow text that still appears to influence current prompt wording

## Questions You Must Answer

1. What exact Accounting-side controller actions are implemented today?
2. What exact queue filters and detail-page affordances are implemented today?
3. What exact approval action is implemented today, including the project-number requirement and call shape?
4. What request states and transitions are implemented today?
5. What exact backend event currently starts the provisioning saga?
6. How does the live repo distinguish:
   - controller approval and transition to `ReadyToProvision`
   - automatic provisioning start
   - system-owned `Provisioning`
7. Is `ReadyToProvision` still a real modeled state in current practice, and if so, what role does it actually serve?
8. Is there a live Accounting UI gap between `AwaitingExternalSetup` and the next valid state?
9. What responsibilities are already clearly separated across Accounting, Estimating, Admin, backend orchestration, and `@hbc/provisioning`?
10. Which current docs still describe a different workflow from current code?
11. Which stale docs are merely historical, and which are still risky because they could mislead a later implementation agent?
12. Which discrepancies are severe enough to block later implementation if left unresolved?
13. Which current backend-auth / domain-host posture files materially affect the workflow contract and therefore must be carried into later prompts?
14. Does any current living surface doc remain authoritative in family but partially stale in detail?

## Required Output

Create a markdown audit memo at:

`docs/architecture/reviews/phase-1-workflow-contract-audit.md`

The memo must include:

- Executive Summary
- Canonical Copy Check
- Confirmed Repo Facts
- Confirmed Repo-Doc Intent
- Current Backend/Auth/Host Posture Facts That Matter To Phase 1
- Discrepancy Inventory
- Stale Authority Paths and Why They Are Stale
- Severity Ranking
- Recommended Freeze Decisions for Prompt-02
- Explicit Open Questions
- Exact Files Inspected

## Required Classification Discipline

For every major finding, label it as one of:

- confirmed repo fact
- confirmed repo-doc intent
- inferred recommendation
- unresolved ambiguity

Do not mix these categories together without saying which category is doing the work.

## Required Structure for Discrepancy Inventory

For each discrepancy, include:

- ID
- topic
- classification
- repo-truth evidence
- conflicting doc or implementation evidence
- why it matters
- recommended resolution direction
- downstream implementation risk if unresolved

At minimum, expect discrepancy rows for:

- lifecycle wording drift around `ReadyToProvision`
- `AwaitingExternalSetup` contract vs live UI gap
- controller-review doc drift if action mapping omits project-number capture
- notification-doc drift where provisioning trigger language no longer matches current backend behavior
- auth / notification recipient language that could be misread as current authorization guidance

## Verification

At the end of your response and in the memo, include:

- exact files inspected
- exact repo evidence used
- exact docs treated as current authority
- exact docs treated as stale or historical drift sources

## Completion Standard

This prompt is complete only when the repo contains a clean discrepancy memo that future prompts can use as the decision basis for lifecycle, boundary, documentation, and evidence freeze work.

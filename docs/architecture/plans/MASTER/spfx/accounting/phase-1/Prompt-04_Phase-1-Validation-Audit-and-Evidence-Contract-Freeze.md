# Prompt-04 — Phase 1 Validation, Audit, and Evidence Contract Freeze

## Objective

Freeze the validation contract, audit expectations, and evidence requirements for the Accounting-side Project Setup workflow without pretending that every missing persistence behavior must be implemented inside Phase 1.

Use the outputs from:

- `docs/architecture/reviews/phase-1-workflow-contract-audit.md`
- `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`
- `docs/architecture/reviews/phase-1-application-boundary-freeze.md`

## Critical Working Rules

- Treat live repo code and tests as authoritative for what is currently enforced and persisted.
- Use current-state and living reference docs before historical plans.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- This is a contract-freeze prompt, not a broad implementation prompt.
- Do not build full validation or audit infrastructure here unless a very small correction is strictly necessary to keep documentation accurate.
- Distinguish “currently enforced,” “currently persisted,” and “required by frozen contract but not yet implemented.”

## Repo-Truth Gaps This Prompt Must Handle Honestly

At minimum, address the current repo-truth reality that:

- backend submission validation is now broader than the older PH6 minimum field set
- `ReadyToProvision` currently requires a valid `projectNumber`
- role-based authorization is claims-based and ownership-aware
- saga audit behavior exists for provisioning start/completion/failure
- comprehensive controller-action audit/evidence persistence is not yet fully represented as one complete end-to-end frozen implementation contract
- some current docs still describe notification/env-var posture in ways that can be misread as authorization posture

Do not blur “already persisted today” with “should later be required.”

## You Must Freeze

1. frontend assistive validation expectations
2. backend authoritative validation expectations
3. what is currently enforced before a request can reach `ReadyToProvision`
4. whether unresolved clarification items block approval in current repo truth or only in later desired contract language
5. whether project-number uniqueness is currently enforced, partially enforced, or still a required future contract item
6. what evidence is currently persisted for controller approval, clarification, hold, failed routing, provisioning start, provisioning completion, and provisioning failure
7. what role/auth context is currently available at action time
8. what auth-related evidence should be frozen for later implementation even if not fully persisted yet
9. what evidence should be required later even though it is not fully persisted yet
10. what identifiers and correlation values are currently available and which are still missing

## Required Source Review

At minimum, review:

- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- any current runbook or production-readiness reference directly cited by the earlier prompts

## Required Deliverable

Create:

`docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md`

The memo must include:

- Executive Summary
- Frozen Frontend Assistive Validation Rules
- Frozen Backend Authoritative Validation Rules
- Frozen Approval/Handoff Gate Checklist
- Frozen Role/Auth Context Available at Action Time
- Currently Persisted Evidence
- Missing-but-Required Evidence for Later Implementation
- Frozen Audit Trail Expectations
- Frozen Identifier and Correlation Requirements
- Known Repo Gaps
- Required Consequences for Later Implementation Phases

## Required Guidance

For each major controller or system action, be explicit about:

- actor identity
- resolved role or ownership context
- timestamp
- source state
- destination state
- project number or other entered identifiers
- clarification or reason payload
- correlation or run reference
- downstream ownership shift
- user-facing expectation
- whether the evidence is:
  - already persisted today
  - partially persisted today
  - not yet persisted but required by the frozen contract

Also be explicit about whether each auth or notification-related variable is:

- authorization-critical
- notification-routing-only
- provisioning-prerequisite-only
- runtime-host-configuration-only

## Completion Standard

This prompt is complete only when a later implementation phase can build missing validation and evidence behavior without reopening baseline semantic questions or confusing today’s persistence with tomorrow’s requirements.

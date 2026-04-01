# Phase 1 — Workflow Contract and Boundary Freeze

## Package Purpose

This is the revised canonical Phase 1 prompt set for the Accounting-side Project Setup workflow-contract audit and reconciliation effort.

Phase 1 is a **contract-freeze and documentation-reconciliation phase**. It is not a broad product-implementation phase. Its job is to force a fresh repo-truth audit, freeze the current workflow and ownership contract where the repo is already clear, and preserve only the ambiguity that the live repo still honestly contains.

## Canonical Copy Rule

Treat the repo-relative package path as canonical **only if the package has been committed there in the current workspace**:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-1/`

Do not hard-code workstation-specific paths in findings or final docs.  
If duplicate package copies exist in the current workspace, record them explicitly and name which one was audited.  
If the package only exists as an attached artifact or local working draft, say so directly.

## Authority Order

Every prompt in this package must use this authority order:

1. live repo code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living reference docs for the active Project Setup surfaces and production posture
4. historical PH6 and older planning/reference docs as drift evidence, not present-truth authority

Use historical docs to identify stale assumptions, not to override current implementation truth.

## Current Repo-Truth Baseline That Motivates Phase 1

The live repo currently shows all of the following:

- Accounting detail review exposes approve, request-clarification, place-on-hold, and failed-item handoff to Admin.
- Approval is not a bare state change. The Accounting detail page captures and validates a `projectNumber` and advances the request to `ReadyToProvision` with that value.
- `backend/functions/src/functions/projectRequests/index.ts` auto-triggers the provisioning saga when a controller advances a request to `ReadyToProvision`, unless an active non-failed provisioning status already exists.
- The lifecycle model still explicitly includes both `ReadyToProvision` and `Provisioning`.
- `packages/provisioning/src/bic-config.ts` treats `ReadyToProvision` and `Provisioning` as system-owned states.
- `AwaitingExternalSetup` still exists in the lifecycle model and Accounting queue filtering, but the current Accounting detail page does not expose a forward action from that state.
- Admin recovery already owns retry, archive, escalation acknowledgment, and state override behavior.
- Current backend authorization is claims-based and ownership-aware, not env-var-allowlist-driven.
- The Project Setup backend now depends materially on the domain-scoped host service factory and current auth middleware posture, not only the older PH6 lifecycle files.

These are the starting facts for this package. Do not write prompts that assume older semantics are still authoritative.

## Files In This Package

- `Accounting_Phase1_Prompt_Audit_Report.md`
- `Phase-1_Workflow-Contract-and-Boundary-Freeze_Implementation-Plan.md`
- `Prompt-01_Phase-1-Repo-Truth-Workflow-Contract-Audit.md`
- `Prompt-02_Phase-1-Request-Lifecycle-and-Provisioning-Trigger-Freeze.md`
- `Prompt-03_Phase-1-Application-Boundary-and-Role-Responsibility-Freeze.md`
- `Prompt-04_Phase-1-Validation-Audit-and-Evidence-Contract-Freeze.md`
- `Prompt-05_Phase-1-Authoritative-Documentation-Reconciliation.md`
- `Prompt-06_Phase-1-Final-Closure-and-Go-Forward-Readiness-Report.md`

## Required Working Rules For Every Prompt

- Treat the live repo as authoritative for implementation facts.
- Do not assume current package wording is correct just because it already exists.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Keep Phase 1 focused on current-state validation, contract freeze, and authoritative-document reconciliation.
- Do not drift into broad feature implementation.
- Do not silently preserve inaccurate language for convenience.
- Prefer updating existing authoritative docs and review artifacts over creating duplicate parallel docs.
- Do not mutate runtime behavior unless a prompt explicitly authorizes a minimal contract-clarifying fix and explains why that fix is necessary inside Phase 1.

## Evidence Discipline

Every prompt and every resulting artifact must clearly separate:

1. confirmed repo fact
2. confirmed repo-doc intent
3. inferred recommendation
4. unresolved ambiguity that remains intentionally flagged

When a prompt asks for reconciliation, it must explicitly identify whether prior language is:

- still correct
- incomplete and needs clarification
- partially stale
- superseded by current repo truth
- still authoritative in limited scope only

## Known Drift Sources That Must Be Handled Carefully

The following docs are especially likely to mislead later implementation work if they are not classified precisely:

- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/reference/provisioning/notification-event-matrix.md`
- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`

Do not treat those files as equally authoritative peers. Some remain useful, but not all remain safe as present-truth guidance.

## Phase 1 Success Standard

Phase 1 is complete only when all of the following are true:

- the real workflow problem set has been audited against repo truth
- the `ReadyToProvision` versus `Provisioning` ambiguity is framed against current code rather than stale plan text
- the current approval action is described precisely, including required `projectNumber` capture
- the `AwaitingExternalSetup` live-surface gap is explicitly captured as contract truth versus UI truth
- Accounting, Admin, Estimating, backend, and `@hbc/provisioning` responsibilities are clearly separated
- validation, audit, and evidence expectations are frozen as contracts rather than vague aspirations
- the current auth / service-factory posture is anchored well enough to prevent later doc drift
- the authoritative-doc set for later implementation work is explicit and non-contradictory
- unresolved ambiguity is preserved only where the repo truly does not yet justify a stronger claim
- the final closure report answers whether later phases can proceed without reopening foundational semantics

## Execution Order

Execute the prompts in numeric order:

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip order. Each prompt depends on the evidence, definitions, and narrowed scope produced by earlier prompts.

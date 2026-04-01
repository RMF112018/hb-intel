# Prompt-05 — Phase 1 Authoritative Documentation Reconciliation

## Objective

Reconcile the authoritative documentation set so it reflects the frozen workflow contract, boundary model, and validation/evidence contract without leaving later implementation agents exposed to stale PH6 language.

Use the outputs from:

- `docs/architecture/reviews/phase-1-workflow-contract-audit.md`
- `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`
- `docs/architecture/reviews/phase-1-application-boundary-freeze.md`
- `docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md`

## Critical Working Rules

- Treat live repo code and tests as authoritative for implementation facts.
- Apply strict doc precedence:
  1. live repo truth
  2. `current-state-map.md`
  3. current living reference docs
  4. historical PH6 and other older docs as drift sources
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Prefer reconciliation of existing authoritative docs over creation of duplicate docs.
- Do not leave contradictory language in place without explicitly classifying it.

## Required Work

Review and update the docs most relevant to the Accounting-side Project Setup workflow, including where appropriate:

- `docs/architecture/blueprint/current-state-map.md`
- current living surface docs
- current provisioning reference docs
- Project Setup production-readiness reference docs
- older PH6 or historical docs that still need explicit stale/superseded/limited-scope treatment

Do not treat PH6 planning docs and current living docs as peers.

## Required Output

Create a reconciliation summary at:

`docs/architecture/reviews/phase-1-authoritative-doc-reconciliation.md`

The summary must include:

- Documents Updated
- Documents Reviewed But Left Unchanged
- Current Authoritative Source List For Later Work
- Documents Classified As:
  - superseded
  - historical but still useful as evidence
  - partially stale
  - still authoritative in limited scope
- Superseded Statements Removed Or Annotated
- Remaining Documentation Risks

## Hard Requirement

At the end of this prompt, a later implementation agent should be able to tell exactly which documents govern:

- lifecycle semantics
- provisioning trigger semantics
- Accounting/Admin/Estimating boundary
- validation rules
- audit/evidence expectations
- Project Setup production-readiness posture

## Completion Standard

This prompt is complete only when the authoritative documentation set is coherent enough that later implementation work is not likely to be driven by contradictory or misclassified guidance.

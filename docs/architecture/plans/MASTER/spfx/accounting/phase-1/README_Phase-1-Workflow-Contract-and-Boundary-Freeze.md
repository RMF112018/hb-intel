# Phase 1 — Workflow Contract and Boundary Freeze

## Package Purpose

This package is the canonical Phase 1 prompt set for the Accounting-side Project Setup workflow contract audit and reconciliation.

Canonical working copy:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-1/`

Duplicate-copy check:

- targeted repo and workspace search found only this package copy under `/Users/bobbyfetting/hb-intel`

Phase 1 is a **contract-freeze and documentation-reconciliation phase**. It is not a broad product implementation phase. Its purpose is to make later implementation work safer by forcing a fresh repo-truth audit, freezing the workflow contract where the repo is already clear, and explicitly preserving only the ambiguities that still require deliberate resolution.

## Authority Order

Every prompt in this package must use this authority order:

1. live repo code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living reference docs for the active Project Setup surfaces and production posture
4. older PH6 and historical planning/reference docs as drift evidence, not present-truth authority

Use the historical documents to identify stale assumptions, not to override current implementation truth.

## Confirmed Repo-Truth Baseline That Motivates Phase 1

The live repo currently shows all of the following:

- Accounting detail review currently exposes approve, request-clarification, place-on-hold, and failed-item handoff to Admin.
- `backend/functions/src/functions/projectRequests/index.ts` auto-starts the provisioning saga when a controller advances a request to `ReadyToProvision`.
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` then reconciles the request to `Provisioning`; there is no separate controller-side launch button in the live Accounting detail page.
- `AwaitingExternalSetup` exists in the lifecycle model and Accounting queue filtering, but the current Accounting detail page does not expose a forward action from that state.
- Admin recovery already owns retry, archive, escalation acknowledgment, and state override behavior.
- Older lifecycle and notification docs still contain language that can be read as if `ReadyToProvision` is a distinct controller-held launch gate rather than the approval-triggered handoff used by the current backend.

These facts are the starting point for this package. Do not write prompts that assume the older semantics are still authoritative.

## Files In This Package

- `Phase-1_Workflow-Contract-and-Boundary-Freeze_Implementation-Plan.md`
- `Prompt-01_Phase-1-Repo-Truth-Workflow-Contract-Audit.md`
- `Prompt-02_Phase-1-Request-Lifecycle-and-Provisioning-Trigger-Freeze.md`
- `Prompt-03_Phase-1-Application-Boundary-and-Role-Responsibility-Freeze.md`
- `Prompt-04_Phase-1-Validation-Audit-and-Evidence-Contract-Freeze.md`
- `Prompt-05_Phase-1-Authoritative-Documentation-Reconciliation.md`
- `Prompt-06_Phase-1-Final-Closure-and-Go-Forward-Readiness-Report.md`

## Required Working Rules For Every Prompt

- Treat the live repo as authoritative for implementation facts.
- Do not assume the current package language is correct just because it already exists.
- Do not re-read files already in active context unless needed to verify a contradiction, capture exact evidence, or confirm a change.
- Keep Phase 1 focused on current-state validation, contract freeze, and authoritative-document reconciliation.
- Do not drift into broad feature implementation.
- Do not silently preserve inaccurate language for convenience.
- Prefer updating existing authoritative docs and review artifacts over creating duplicate parallel docs.
- Do not mutate runtime behavior unless a prompt explicitly authorizes a minimal contract-clarifying fix and explains why the fix is necessary inside Phase 1.

## Evidence Discipline

Every prompt and every resulting artifact must clearly separate:

1. confirmed repo fact
2. confirmed repo-doc intent
3. inferred recommendation
4. unresolved ambiguity that remains intentionally flagged

When a prompt asks for reconciliation, it must explicitly identify whether prior language is:

- still correct
- needs clarification
- partially stale
- superseded by current repo truth

## Phase 1 Success Standard

Phase 1 is complete only when all of the following are true:

- the real workflow problem set has been audited against repo truth
- the `ReadyToProvision` versus `Provisioning` ambiguity is framed against current code rather than stale plan text
- the `AwaitingExternalSetup` live-surface gap is explicitly captured
- Accounting, Admin, Estimating, backend, and `@hbc/provisioning` responsibilities are clearly separated
- validation, audit, and evidence expectations are frozen as contracts rather than vague aspirations
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

Do not skip order. Each prompt depends on the evidence, definitions, and narrowed scope produced by the earlier prompts.

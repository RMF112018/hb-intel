# Prompt 09 — Validation and Phase 2 Exit Reconciliation

## Objective

Reconcile the full Phase 2 output set, verify that the shared contract surface is internally coherent, and close the phase with one explicit exit document.

## Context efficiency rule

Do **not** re-read the entire repo. Re-read only the files touched by this phase and the smallest set of authority docs needed to confirm consistency.

## Required repo-truth context

Use:
- all Phase 2 outputs created in Prompts 01–08
- the Phase 1 baseline artifacts if present
- `docs/architecture/blueprint/current-state-map.md` only if actual present-state repo changes need to be recorded

## Scope of work

1. Reconcile the full Phase 2 document set for contradiction, overlap, or naming drift.
2. Reconcile the `@hbc/models` export surface for completeness and internal consistency.
3. Confirm local guidance updates do not contradict the new contract placement.
4. Decide whether `current-state-map.md` needs a **strictly present-truth** update because new shared contract files now exist in repo.
5. Produce a final Phase 2 exit reconciliation record.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-spfx-phase-2-exit-reconciliation.md`

The exit document must include:
- what was created,
- what was updated,
- what was intentionally deferred,
- validation run,
- residual risks,
- and explicit Phase 3 entry conditions.

## Validation requirements

Run the smallest meaningful set, typically:
- targeted repo search/reconciliation
- `pnpm --filter @hbc/models check-types`
- any package-local test or lint command needed because exports changed
- only broaden validation if the actual repo edits justify it

Report validation in this format:
- **Verified**
- **Not run**
- **Why this set**
- **Residual risk**

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one explicit Phase 2 exit reconciliation document,
- the shared contract exports compile,
- the docs align with each other,
- and the repo is ready for Phase 3 backend-foundation work.

## No-go boundaries

- Do not start Phase 3 implementation.
- Do not convert deferred items into runtime work “while already here.”

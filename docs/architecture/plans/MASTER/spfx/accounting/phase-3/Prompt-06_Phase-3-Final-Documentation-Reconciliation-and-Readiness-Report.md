# Prompt-06 — Phase 3 Final Documentation Reconciliation and Readiness Report

## Objective

Perform the final Phase 3 reconciliation pass. Update the authoritative docs and produce a final readiness report describing what was implemented, what remains, and whether the Accounting app is functionally complete for its controller role in the Project Setup workflow.

This prompt must reconcile against live repo truth first and classify documentation authority explicitly instead of treating historical PH6 plans as peers to current-state and living refs.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Do not redesign the frozen workflow contract unless repo truth forces you to record a contradiction.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Do not move requester or coordinator responsibilities into Accounting.
6. Classify documentation sources as one of:
   - current authority
   - historical evidence
   - partially stale
   - superseded
7. Do not leave documentation stale when repo truth changed during Prompts 01 through 05.

## Required Paths

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/architecture/blueprint/current-state-map.md`
- `apps/accounting/src/router/*`
- `apps/accounting/src/pages/*`
- `apps/accounting/src/test/*`

## Required Tasks

- Audit final repo truth after Prompts 01 through 05.
- Update required docs so they describe the actual final Accounting workflow behavior.
- Mark each Phase 3 scope item as complete, partial, deferred, or blocked with repo evidence.
- Separate finished Phase 3 Accounting outcomes from still-open backend, host-boundary, or later-phase dependencies.
- Produce a final readiness section stating whether the Accounting app is functionally ready to move into later hardening phases.
- Call out any remaining non-Phase-3 gaps explicitly instead of leaving them ambiguous.

## Deliverables

- A finalized readiness report for Phase 3.
- Reconciled docs aligned to repo truth.
- A clear go-forward recommendation for the next phase.

## Verification

- Run valid Accounting verification commands relevant to the touched scope:
  - `pnpm --filter @hbc/spfx-accounting build`
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-accounting test`
- Confirm whether the controller workflow is functionally complete end to end.
- Confirm whether any dead-end states remain in the Accounting UI.
- Confirm whether Accounting boundary discipline is intact relative to Admin and coordinator surfaces.
- Confirm whether any remaining gap is a real later-phase dependency rather than unfinished Phase 3 work.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- final repo-truth findings
- implementation summary
- verification results
- scope classification for each Phase 3 objective
- remaining gaps and dependency classification
- closure statements
- evidence paths for every meaningful conclusion

# Prompt-01 — Phase 3 Repo-Truth Accounting Surface Audit

## Objective

Audit the current Accounting app implementation against live repo truth and the current authoritative workflow/boundary references. Produce an exact Phase 3 gap inventory for routes, queue behavior, detail behavior, visible actions, state handling, status messaging, audit visibility, and Admin-routing posture.

This prompt is primarily an audit and routing prompt. It should establish what is already implemented, what is incomplete, what is stale in the package authority chain, and what later prompts must actually change.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Do not redesign the frozen workflow contract unless repo truth forces you to record a contradiction or dependency on Phase 2 outcomes.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Do not move requester or coordinator responsibilities into Accounting.
6. Classify each finding as one of:
   - confirmed repo fact
   - confirmed repo-doc intent
   - inferred implementation recommendation
   - unresolved gap or ambiguity
7. Update report artifacts as part of the work.

## Required Paths

- `apps/accounting/src/router/*`
- `apps/accounting/src/pages/*`
- `apps/accounting/src/components/*`
- `apps/accounting/src/utils/*`
- `apps/accounting/src/test/*`
- `packages/provisioning/src/*`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- any PH6 or older workflow docs still referenced by the package

## Required Tasks

- Confirm the canonical Phase 3 package working copy and record the result.
- Audit queue and detail route behavior in the Accounting app.
- Identify the exact controller actions currently available by request state.
- Confirm which behaviors already exist today for status banners, state messaging, timelines, and audit visibility.
- Identify missing or incomplete workflow actions relative to current repo truth and current living refs.
- Identify dead-end states, especially the current `AwaitingExternalSetup` gap.
- Identify wording or UI assumptions that drift from the actual backend handoff semantics.
- Identify any places where Accounting improperly absorbs Admin or coordinator responsibilities.
- Identify stale authority paths and explain why they are stale, partially stale, or historical only.
- Produce a prioritized implementation inventory ordered by impact on controller workflow completeness.

## Deliverables

- A repo-truth gap inventory saved into the required report update.
- A source-authority summary listing which docs govern Prompts 02 through 06.
- A stale-authority summary listing historical docs that should not be treated as primary truth.
- A prioritized implementation list that directly informs Prompt-02 through Prompt-05.

## Verification

- Confirm all live Accounting routes and their components.
- Confirm the visible action set by request state.
- Confirm whether `AwaitingExternalSetup` can currently be advanced from the live UI.
- Confirm whether UI wording aligns with the actual current handoff from `ReadyToProvision` into system-owned provisioning.
- Confirm whether the referenced functional-completion report already exists or must be created by the executing prompt.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- canonical-copy confirmation
- exact repo-truth findings
- source-authority classification
- stale-authority findings
- prioritized implementation inventory
- blockers or unresolved items
- evidence paths for every meaningful conclusion

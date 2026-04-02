# Prompt-05 — Locked Decisions and Phase-Boundary Guards

## Objective

Create the canonical **locked decisions and phase-boundary guard** document for the Admin SPFx IT Control Center Phase 1 work.

This document is the anti-drift control for later implementation prompts.

## Important execution rules

- Do **not** re-read files still in current context unless needed.
- Use the already-created Phase 1 artifacts as the source set.
- Keep this as a crisp decision/guard document, not a narrative essay.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-architecture-baseline.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-boundary-matrix.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-domain-taxonomy.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-release-scope-map.md`

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-locked-decisions-and-phase-boundary-guards.md`

## Required sections

1. **Purpose**
2. **Locked decisions**
3. **Why each decision is locked**
4. **Implementation consequences**
5. **Phase-boundary guards**
6. **Explicit future-phase questions that remain open**
7. **Change-control rule for revisiting a locked decision**

## Locked decisions that must appear

At minimum include these as locked unless repo truth demands a wording correction:

1. Admin SPFx is the operator console, not the privileged executor.
2. Privileged and long-running admin work belongs in the backend/control plane.
3. `@hbc/features-admin` remains admin intelligence, not the control plane.
4. Existing provisioning/control-plane foundations are to be generalized, not discarded.
5. Provisioning remains straight-through under normal conditions.
6. Other risky admin actions may require checkpointed automation.
7. Broad Entra administration is early scope.
8. Standards/configuration governance is a first-class capability with hybrid repo/live control where appropriate.
9. Early active SharePoint writes stay limited to HB Intel-managed assets.
10. Single-admin execution requires strong safety controls, previews, traceability, and evidence.

## Required guard statements

Include guardrails such as:
- Phase 1 must not implement Phase 2 contract schema work.
- Phase 1 must not implement generalized admin APIs.
- Phase 1 must not build broad new UI flows beyond what is required for architecture/doc alignment.
- No target-state claim may be written into `current-state-map.md` as if already implemented.
- No prompt or later doc should treat `packages/features/admin` as the control plane.

## Optional ADR note

If repo truth strongly suggests an ADR is required, document that recommendation.
Do **not** create an ADR in this prompt unless the repo already has a clearly matching ADR slot or naming convention that makes it obviously necessary.

## Validation

Before finishing:
- ensure each locked decision has a reason and implementation consequence,
- ensure future-phase questions remain genuinely open and are not relitigating locked items,
- ensure the document is short enough to be usable during implementation.

## Completion condition

Stop after the decision/guard doc is complete.
Do not start README or target-architecture updates in this prompt.

# Prompt-02 — Provisioning Hardening Baseline and Artifact Plan

## Objective

Convert the Phase 7 repo-truth audit into a concrete **hardening baseline** for provisioning and define the canonical artifact plan for the rest of the phase.

This prompt should establish what Phase 7 is actually going to improve, how the repo will represent it, and where the boundaries are.

## Important execution rules

- Do **not** re-read files still in active context unless necessary.
- Use the Phase 7 gap map as the immediate evidence base.
- Keep this baseline practical, repo-specific, and tightly scoped to provisioning hardening.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/admin-spfx-phase-7-provisioning-gap-map.md`
- the already-verified repo files from Prompt-01
- the end-state direction for Phase 7

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-7/admin-spfx-phase-7-provisioning-hardening-baseline.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-7/admin-spfx-phase-7-artifact-plan.md`

## Required baseline content

The baseline doc must define:

- what “straight-through provisioning” means operationally,
- what counts as a pre-launch dependency failure,
- what counts as a transient execution failure,
- what counts as a terminal failure,
- what the operator is allowed to see/initiate in SPFx,
- what stays in the privileged backend,
- what evidence/status a provisioning run must expose,
- what repair/retry visibility Phase 7 must provide,
- and what Phase 7 will deliberately defer.

## Required artifact-plan content

List the intended Phase 7 outputs by area:

- backend/functions
- packages/provisioning
- apps/admin
- docs/runbooks
- tests/validation

For each output, define:
- purpose,
- expected repo location,
- and why it belongs in Phase 7.

## No-go boundaries

Make explicit that Phase 7 must not:
- replace the provisioning model wholesale,
- complete all observability architecture,
- implement broad SharePoint governance,
- or pull privileged execution into SPFx.

## Validation

Before finishing:
- confirm the baseline does not contradict Prompt-01,
- confirm the artifact plan is precise enough to guide implementation,
- confirm the phase boundary is explicit.

## Completion condition

Stop after both docs are complete.
Do not yet change backend or UI code in this prompt.

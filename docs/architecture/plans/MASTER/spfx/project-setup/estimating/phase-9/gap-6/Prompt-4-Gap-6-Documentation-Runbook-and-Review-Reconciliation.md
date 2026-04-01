# Prompt 4 — Gap 6 Documentation, Runbook, and Review Reconciliation

## Objective

Reconcile the repo documentation and reviews so Gap 6 is described honestly in light of the latest environment updates and the new target field semantics.

## Context

The original Gap 6 validation was correct for the earlier environment state, but the environment and target model have since changed. The documentation now needs a careful reconciliation rather than a blanket overwrite.

## Files to inspect first

Core Gap 6 docs:
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/project-setup-sharepoint-schema-environment-gap-validation.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Closeout-Summary-and-Execution-Plan.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Rebaseline-and-Target-Contract-Freeze.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Projects-Contract-Reconciliation.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-projectViewerGroups-Design-and-Adapter-Alignment.md`

Legacy reports / runbooks likely needing reconciliation:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`
- `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`

## Required tasks

1. Update the Gap 6 validation document so it is no longer frozen in the older environment state.
   - Do this carefully:
     - preserve historical truth where useful
     - add a superseding section or revision history rather than silently erasing history
   - Explicitly state what changed after the original validation

2. Reconcile legacy review docs and the deployment runbook where Gap 6 is referenced.
   - Ensure they no longer imply the wrong retained field model
   - Ensure they no longer instruct creation of fields that are now intentionally retired from the target contract
   - Ensure any remaining environment actions are still described accurately

3. Add a dedicated field-semantics memo:
   - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Final-Field-Semantics.md`

   This memo must explicitly define:
   - `groupMembers`
   - `groupLeaders`
   - `viewerUPNs`
   - `leadEstimatorUpn`
   - `addOns`
   - department default viewer groups from `projectViewerGroups`

4. Add a dedicated residual-inventory note if any environment actions still remain after the repo work:
   - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Residual-Environment-Actions.md`
   - Only create this if there are still real residuals

## Acceptance criteria

- Documentation accurately distinguishes:
  - original validation truth
  - what changed later
  - current target semantics
  - current closure status
- No touched doc still recommends reinstating `projectLeadId` or `additionalTeamMemberUpns` if the repo truth now retires them
- The final field-semantics memo is specific and unambiguous
- Any remaining environment-gated work is documented precisely rather than hidden

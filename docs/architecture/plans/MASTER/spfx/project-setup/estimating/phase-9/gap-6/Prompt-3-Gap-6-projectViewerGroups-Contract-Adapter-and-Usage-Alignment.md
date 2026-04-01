# Prompt 3 — Gap 6 projectViewerGroups Contract, Adapter, and Usage Alignment

## Objective

Add and/or reconcile the repo-owned contract and adapter path for the new `projectViewerGroups` list so the repo truth matches the intended hybrid viewer model.

## Context

The target model is now:

- department-based default read-only viewer groups come from `projectViewerGroups`
- project-level additive read-only exceptions come from `Projects.viewerUPNs`

Gap 6 is not honestly closed if the repo/docs still act like `viewerUPNs` alone is the entire viewer model.

## Files to inspect first

- the latest Prompt 1 and Prompt 2 outputs
- any backend services that currently determine site memberships / provisioning membership
- any existing SharePoint list adapters / repositories under `backend/functions/src/services/**`
- any provisioning or request-lifecycle services that should know about default viewers
- the environment schema evidence:
  - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/projectViewerGroups-list-schema.csv`

## Required tasks

1. Define a repo-owned contract for `projectViewerGroups`.
   - Add or update the model / service contract needed to represent:
     - department key
     - default viewer-group IDs json
     - human-readable names / labels
     - active flag
     - review timestamp
     - notes
   - Be honest about any current environment type awkwardness if the schema still uses less-than-ideal field types

2. Add or update a SharePoint adapter / repository path for `projectViewerGroups`.
   - It must be able to read the department default-viewer policy from the list
   - Prefer a typed adapter pattern consistent with repo norms
   - Do not overreach into unrelated architecture

3. Reconcile usage semantics.
   - Update any touched services/docs so the effective viewer model is clearly:
     - department defaults from `projectViewerGroups`
     - plus additive project-level `viewerUPNs`
   - If full usage wiring is not yet appropriate in code, at minimum create the contract/adapter and document the exact intended consumption path

4. Add tests.
   - prove the adapter can read and parse the retained fields
   - prove the department lookup behavior expected by the hybrid model
   - prove inactive rows are handled correctly if that is part of the list semantics

5. Create or update a dedicated design note:
   - `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-projectViewerGroups-Design-and-Adapter-Alignment.md`

## Important implementation rules

- Do not pretend the list is more mature than it is; document current type compromises if needed
- Prefer group IDs as the authoritative default-viewer source over raw user lists
- Keep `viewerUPNs` as additive exceptions, not the full effective audience
- Do not reintroduce `additionalTeamMemberUpns`

## Acceptance criteria

- The repo contains a clear contract and adapter/repository path for `projectViewerGroups`
- Touched code/docs clearly describe the hybrid viewer model
- Tests exist for the retained adapter behavior
- The design note clearly states whether full runtime consumption is already implemented or still deferred

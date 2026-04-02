# Prompt 08 — Package Placement, Exports, and Boundary Alignment

## Objective

Lock where the Phase 2 contracts belong in the repo and align the surrounding package/app guidance so later implementation does not scatter control-plane contracts across the wrong layers.

## Context efficiency rule

Do **not** re-read files that remain in active context unless they changed or you need a fresh verification of a local README or export surface.

## Required repo-truth context

Use:
- all Phase 2 docs created so far
- `packages/features/admin/README.md`
- `packages/provisioning/README.md`
- local guidance for `apps/admin` and `backend/functions` if present
- package/export conventions already used in `@hbc/models`

## Scope of work

1. Write the package-placement and boundary map for the Phase 2 contract model.
2. Confirm pure shared contracts belong in `@hbc/models`.
3. Confirm:
   - `apps/admin` consumes contracts but does not own them,
   - `@hbc/features-admin` may reference them where appropriate but does not become the privileged runtime,
   - `@hbc/provisioning` remains the current domain-specific lifecycle package,
   - `backend/functions` will later implement the runtime against the shared contracts.
4. Update local READMEs and guidance so these rules are visible where developers will look first.
5. Ensure the public export surface for `@hbc/models` is coherent and discoverable.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-package-placement-and-boundary-map.md`

Update as needed:
- `packages/features/admin/README.md`
- `packages/provisioning/README.md`
- `apps/admin/README.md`
- `backend/functions/README.md`

Ensure the `@hbc/models` export surface is documented and aligned.

## Implementation requirements

- Be explicit about what **must not** live in each layer.
- Do not create a new package unless repo-truth analysis proves `@hbc/models` is insufficient, and if you do, document the evidence and reasoning in the decision register before making the change.
- Keep runtime-free shared types separate from future implementation helpers.

## Documentation requirements

The boundary-map doc must include:
- package/layer ownership table,
- import-direction guidance,
- prohibited placement examples,
- and Phase 3 handoff notes.

## Validation requirements

- Verify README links and export paths.
- Run targeted type checks if exports changed.
- Confirm no circular import risk was introduced.

## Acceptance / completion conditions

This prompt is complete when:
- contract placement is explicitly locked,
- local guidance no longer contradicts the Phase 2 model,
- and future phases have a clear import/boundary rule set.

## No-go boundaries

- Do not implement runtime helper packages.
- Do not move existing healthy code merely for cosmetic organization.

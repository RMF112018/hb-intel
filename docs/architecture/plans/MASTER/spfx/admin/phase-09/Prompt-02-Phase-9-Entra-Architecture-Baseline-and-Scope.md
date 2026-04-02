# Prompt-02 — Phase 9 Entra Architecture Baseline and Scope

## Objective

Create the canonical Phase 9 architecture baseline for broad Entra administration and define what this phase will and will not build.

## Important execution rules

- Do not re-read files already in active context unless needed.
- Use Prompt-01 output as the immediate truth base.
- Keep the architecture explicit about frontend/backend separation.
- Do not turn this into a giant generic identity-platform document.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-repo-truth-and-gap-map.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- verified source files from Prompt-01

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-entra-architecture-baseline.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-scope-map.md`

## Required architecture-baseline content

The baseline must define:
- what the Entra control lane is,
- what the SPFx app owns,
- what the privileged backend owns,
- what the Graph adapter/service owns,
- how audit/evidence responsibilities are split,
- and what **must not** live in SPFx.

Include explicit sections for:
1. Purpose
2. Current foundations
3. Phase 9 operating model
4. Frontend responsibilities
5. Backend/control-plane responsibilities
6. Graph adapter/service responsibilities
7. Audit/evidence responsibilities
8. Explicit out-of-boundary items
9. Reuse of provisioning-era patterns
10. Forward-compatibility notes without phase bleed

## Required scope-map content

Separate:
- active Phase 9 scope,
- visibility-only or deferrable scope,
- later-phase scope,
- explicit non-goals.

The scope map must explicitly distinguish:
- rollout-critical identity actions,
- broader identity administration actions,
- role-assignable / highly sensitive / privileged-admin edge cases,
- and out-of-scope wider M365 administration.

## Required baseline substance

Make these points explicit unless repo truth contradicts them:
- SPFx is the operator console and not the privileged Graph executor.
- Broad user/group administration in this phase runs through the backend.
- Existing `graph-service.ts` is a starting point, not the final capability set.
- `@hbc/features-admin` remains reusable admin intelligence and not the privileged execution substrate.
- Phase 9 must add a dedicated Entra lane in the admin UI.
- This phase must not rely on broad opaque permissions when narrower action-specific permissions are workable.

## Validation

Before finishing:
- confirm both docs align with Prompt-01,
- confirm no target-state speculation is written as current implementation fact,
- confirm phase boundaries remain clear.

## Completion condition

Stop after both docs are complete and cross-linked.

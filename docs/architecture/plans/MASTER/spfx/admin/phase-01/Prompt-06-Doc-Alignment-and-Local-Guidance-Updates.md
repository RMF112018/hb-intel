# Prompt-06 — Doc Alignment and Local Guidance Updates

## Objective

Align existing repo documentation and local guidance with the new Phase 1 baseline so the admin architecture is explained consistently across the repo.

## Important execution rules

- Do **not** re-read files still in current context unless needed.
- This is an **alignment** prompt, not a rewrite-everything prompt.
- Preserve healthy existing documentation where it is already correct.
- Update only what is needed to eliminate contradiction, drift, or major omission.

## Inputs

Use:
- all completed Phase 1 docs from Prompts 01–05
- existing admin/app/package/backend docs already reviewed earlier

## Required work

### A. Create or update folder-level admin docs navigation
Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/README.md`

It should:
- explain what the admin docs folder contains,
- link the target architecture and all Phase 1 artifacts,
- separate current baseline docs from later-phase work.

### B. Upgrade the thin target-architecture doc
Update:
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`

Requirements:
- preserve the architectural diagram,
- add concise explanatory sections,
- cross-link to the Phase 1 baseline and boundary matrix,
- state clearly that the target-architecture doc is not the whole doctrine set by itself.

### C. Add or update local app/package guidance

#### `apps/admin`
If `apps/admin/README.md` does not exist, create it.  
If it exists, update it.

It must clearly state:
- this app is the operator console shell,
- it is not the privileged executor,
- current repo status (routes/pages/SPFx entry point),
- where the Phase 1 baseline docs live.

#### `packages/features/admin/README.md`
Update only as needed to make the boundary explicit:
- admin intelligence package,
- reusable monitors/probes/hooks/components,
- not the privileged control plane,
- cross-link to the admin Phase 1 docs.

#### `backend/functions/README.md`
Update only as needed to clarify:
- current control-plane foundations already present,
- provisioning saga as current foundation,
- later generalization direction,
- backend owns privileged execution and durable state.

### D. Present-truth map update only if justified
Inspect whether `docs/architecture/blueprint/current-state-map.md` materially omits the existence of the current admin/control-plane foundations in a way that would mislead future work.

If yes:
- make the **smallest present-truth update** necessary.

If no:
- do not touch it.

## Writing constraints

- No oversized restatement of the whole baseline.
- Use links and concise summaries.
- Do not create contradictions between local README language and canonical Phase 1 docs.

## Validation

Before finishing:
- verify every new link/path resolves,
- verify local docs do not claim unimplemented functionality,
- verify `current-state-map.md`, if touched, remains present-truth only,
- verify all updated docs are consistent on these points:
  - operator console vs privileged backend
  - `@hbc/features-admin` boundary
  - backend/functions control-plane role
  - Phase 1 docs as the canonical baseline set

## Completion condition

Stop after the doc alignment work is complete and consistent.
Do not perform final reconciliation reporting yet.

# README — Admin SPFx IT Control Center Phase 2 Prompt Package

## What this package contains

This package is a **local-code-agent execution set** for **Phase 2 — Admin control-plane contracts and domain model** of the Admin SPFx IT Control Center effort.

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-2-Summary-Plan.md`
2. `Prompt-01-Phase-2-Prerequisite-Audit-and-Contract-Inventory.md`
3. `Prompt-02-Admin-Action-Catalog-Risk-Levels-and-Execution-Modes.md`
4. `Prompt-03-Generalized-Admin-Run-Model-and-Provisioning-Crosswalk.md`
5. `Prompt-04-Admin-API-Contract-Catalog.md`
6. `Prompt-05-Checkpoint-Approval-and-External-Event-Contract.md`
7. `Prompt-06-Audit-Evidence-Config-and-Standards-Contract-Model.md`
8. `Prompt-07-Adapter-Registry-and-Normalized-Execution-Result-Contract.md`
9. `Prompt-08-Package-Placement-Exports-and-Boundary-Alignment.md`
10. `Prompt-09-Validation-and-Phase-2-Exit-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do **not** skip ahead unless a prompt explicitly tells the agent to stop because repo truth materially differs from the assumptions captured here.

## How the local code agent should use these prompts

- Treat `docs/architecture/blueprint/current-state-map.md` plus verified live code as present-truth authority.
- Treat any executed Phase 1 admin baseline artifacts as the immediate architectural prerequisite for this phase.
- Read only the smallest authoritative set needed for the current prompt.
- Do **not** re-read files that are still in active context or memory unless:
  - the prompt explicitly requires a fresh check,
  - the file changed,
  - the context became stale,
  - or the task widened.
- Keep this phase contract-first and boundary-safe.
- Prefer pure shared types and documentation over premature runtime implementation.

## Required authority posture for the code agent

Use this order when signals disagree:

1. verified live code and configuration
2. `docs/architecture/blueprint/current-state-map.md`
3. executed Phase 1 admin baseline artifacts, if present
4. relevant local package/app README and tests
5. Phase 2 docs created in this sequence
6. broader target-state architecture docs
7. historical phase/task plans

## Execution cautions

- This package is for **Phase 2 only**.
- Do not let execution drift into Phase 3 backend implementation, route handlers, or durable runtime behavior except for **minimal type-only scaffolding** that directly supports the contract model.
- Do not move privileged logic into SPFx.
- Do not redefine `@hbc/features-admin` as the control plane.
- Do not replace `@hbc/provisioning` ownership of current project-setup lifecycle behavior.
- Do not create a heavyweight new runtime package merely to hold pure interfaces if `@hbc/models` is the correct home.
- Do not update `current-state-map.md` with target-state claims.

## Expected repository outputs from executing this package

Expected outputs are primarily:
- canonical Phase 2 contract docs under `docs/architecture/plans/MASTER/spfx/admin/phase-2/`
- pure shared contract types under `packages/models/src/admin-control-plane/`
- narrow README/boundary updates where needed in:
  - `apps/admin/`
  - `packages/features/admin/`
  - `packages/provisioning/`
  - `backend/functions/`

## Validation posture

Use the smallest meaningful validation set.

Expected minimum validation, depending on touched files:
- targeted repo search/reconciliation
- `pnpm --filter @hbc/models check-types`
- `pnpm --filter @hbc/models test` only if tests exist for the changed export surface
- broader checks only if import/export wiring crosses package boundaries

Do **not** run broad workspace tests by default unless the prompt explicitly requires them or the code changes justify it.

## Completion standard

The package is complete when the repo has:
- one coherent Phase 2 contract inventory,
- one coherent action catalog,
- one coherent run model,
- one coherent API contract catalog,
- one coherent checkpoint model,
- one coherent audit/evidence/config contract model,
- one coherent adapter contract model,
- one coherent package-placement map,
- and no material contradiction across the new docs, `@hbc/models`, and local guidance.

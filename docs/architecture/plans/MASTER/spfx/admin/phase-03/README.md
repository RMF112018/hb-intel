# README — Admin SPFx IT Control Center Phase 3 Prompt Package

## What this package contains

This package is a **local-code-agent execution set** for **Phase 3 — Privileged backend foundation** of the Admin SPFx IT Control Center effort.

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md`
2. `Prompt-01-Phase-3-Prerequisite-Audit-and-Runtime-Foundation-Inventory.md`
3. `Prompt-02-Admin-Control-Plane-Host-and-Composition-Root-Strategy.md`
4. `Prompt-03-Admin-Service-Container-and-Factory-Foundation.md`
5. `Prompt-04-Authenticated-Admin-API-Surface-and-Route-Registration.md`
6. `Prompt-05-Run-Launch-Status-History-and-Command-Handler-Skeleton.md`
7. `Prompt-06-Adapter-Registry-and-Execution-Routing-Foundation.md`
8. `Prompt-07-Orchestration-Bridge-and-Provisioning-Generalization.md`
9. `Prompt-08-Authorization-Configuration-and-Operational-Safety-Wiring.md`
10. `Prompt-09-Docs-READMEs-and-Current-State-Reconciliation.md`
11. `Prompt-10-Validation-and-Phase-3-Exit-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do **not** skip ahead unless a prompt explicitly instructs the agent to stop because repo truth materially differs from the assumptions captured here.

## How the local code agent should use these prompts

- Treat verified live code and configuration as primary implementation truth.
- Treat `docs/architecture/blueprint/current-state-map.md` as the canonical present-truth document.
- Treat executed Phase 1 and Phase 2 admin artifacts, if present in repo, as the immediate architectural prerequisites for this phase.
- Read only the smallest authoritative set needed for the current prompt.
- Do **not** re-read files that are still in active context or memory unless:
  - the prompt explicitly requires a fresh check,
  - the file changed,
  - the context became stale,
  - or the task widened.
- Keep this phase backend-foundation-first and boundary-safe.
- Prefer incremental generalization of the repo’s current provisioning/control-plane foundations over restart-style rewrites.

## Required authority posture for the code agent

Use this order when signals disagree:

1. verified live code and configuration
2. `docs/architecture/blueprint/current-state-map.md`
3. executed Phase 2 admin artifacts, if present
4. relevant local package/app/backend README and tests
5. Phase 3 docs created in this sequence
6. broader target-state architecture docs
7. historical phase/task plans

## Execution cautions

- This package is for **Phase 3 only**.
- Do not let execution drift into Phase 4 durable-evidence maturity, Phase 5 operator-console redesign, or domain-complete SharePoint/Entra administration work.
- Do not move privileged logic into SPFx.
- Do not redefine `@hbc/features-admin` as the control plane.
- Do not erase or destabilize existing provisioning behavior in the name of generalization.
- Do not keep adding privileged backend behavior to the monolithic host when repo truth supports a scoped host/composition-root pattern.
- Do not update `current-state-map.md` with target-state claims that are not actually implemented.

## Expected repository outputs from executing this package

Expected outputs are primarily:
- canonical Phase 3 docs under `docs/architecture/plans/MASTER/spfx/admin/phase-3/`
- a generalized backend foundation under `backend/functions/` aligned with the repo’s host-boundary pattern
- narrow related updates in:
  - `apps/admin/`
  - `packages/provisioning/`
  - `packages/features/admin/`
  - `backend/functions/README.md`
  - `docs/architecture/blueprint/current-state-map.md` only if repo truth changed

## Validation posture

Use the smallest meaningful validation set.

Expected minimum validation, depending on touched files:
- targeted repo search / route / export reconciliation
- targeted backend unit tests or host-boundary tests where present
- relevant typecheck / lint / build checks for `backend/functions`
- narrow consumer checks in `apps/admin` if API-client or route assumptions changed
- broader validation only if implementation crosses package or host boundaries in a meaningful way

Do **not** run broad workspace tests by default unless the prompt explicitly requires them or the implementation scope justifies them.

## Completion standard

The package is complete when the repo has:
- one coherent Phase 3 runtime-foundation inventory,
- one coherent host/composition-root plan,
- one coherent authenticated admin API surface,
- one coherent service container/factory foundation,
- one coherent adapter registry/routing foundation,
- one coherent provisioning bridge into the generalized admin backend runtime,
- one coherent operational safety/authz/config wiring story,
- and no material contradiction across docs, backend code, and local guidance.

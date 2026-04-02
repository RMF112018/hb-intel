# Admin SPFx IT Control Center — Phase 2 Summary Plan

## Purpose

Phase 2 exists to define the reusable **control-plane contracts and domain model** that later implementation phases will use for real backend APIs, durable orchestration, operator-console workflows, and repair actions.

This phase is still primarily a **contract-first** phase. It should establish stable shared types, document the action and run model, and freeze how frontend, backend, adapters, audit, and configuration reference the same execution vocabulary without prematurely building the full runtime.

## Governing basis

### Confirmed end-state constraints carried into Phase 2
- The Admin SPFx app remains the **operator console**, not the privileged executor.
- The privileged backend/control plane remains the execution boundary for long-running and privileged work.
- Provisioning continues to be the primary existing implementation seam and should be **generalized**, not replaced.
- Phase 2 must define stable contracts for:
  - admin actions,
  - execution modes,
  - run lifecycle,
  - checkpoints,
  - audit/evidence,
  - standards/configuration,
  - adapters,
  - and frontend/backend request-response seams.
- This phase must preserve the seamless nature of provisioning while also modeling checkpointed and higher-risk actions for broader admin domains.

### Confirmed repo-truth signals that shape Phase 2
- `docs/architecture/blueprint/current-state-map.md` is the canonical present-truth source and already documents the admin app, `@hbc/features-admin`, the backend/functions host split, and provisioning foundations.
- `apps/admin/` already contains a real provisioning-oversight operator surface with admin-only actions and deep diagnostic display.
- `packages/provisioning/` already owns a concrete provisioning lifecycle contract and should be treated as the most important current implementation pattern to generalize.
- `packages/features/admin/` already owns admin-intelligence concerns (monitors, probes, alerting, approval authority UI) and must **not** become the control-plane runtime.
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` proves the repo already uses a domain-host boundary pattern, which Phase 2 contracts should support instead of fighting.

## Phase 2 major objectives
1. Create the generalized **admin action domain model**.
2. Define reusable **risk levels** and **execution modes**:
   - seamless,
   - checkpointed,
   - destructive,
   - advisory.
3. Define the generalized **admin run model**:
   - run envelope,
   - actor context,
   - command payload,
   - step result model,
   - lifecycle states,
   - failure/retry semantics.
4. Define the **checkpoint / approval / pause-resume / external-event** contract.
5. Define the **audit / evidence / config / standards-governance** contract model.
6. Define the **adapter registry and normalized execution-result** contract.
7. Place shared TypeScript contracts in the correct repo location without introducing premature runtime coupling.
8. Produce a clean handoff surface for Phase 3 backend implementation.

## In-scope repo/doc/code areas
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `packages/models/**`
- `packages/provisioning/**` for crosswalk and compatibility review
- `packages/features/admin/**` for boundary-safe README/guidance updates
- `apps/admin/**` for boundary-safe README/guidance updates
- `backend/functions/**` for boundary-safe README/guidance updates
- `docs/architecture/blueprint/current-state-map.md` only if present-truth changes are introduced by actual repo edits

## Expected Phase 2 deliverables

### Canonical documentation artifacts under `docs/architecture/plans/MASTER/spfx/admin/phase-2/`
1. `admin-spfx-phase-2-prereq-and-contract-inventory.md`
2. `admin-control-plane-action-catalog.md`
3. `admin-control-plane-run-model.md`
4. `admin-control-plane-api-contract-catalog.md`
5. `admin-control-plane-checkpoint-and-execution-modes.md`
6. `admin-control-plane-audit-evidence-and-config-contracts.md`
7. `admin-control-plane-adapter-registry-contract.md`
8. `admin-control-plane-package-placement-and-boundary-map.md`
9. `admin-control-plane-phase-2-decision-register.md`

### Recommended minimal code-level contract outputs
Create or update a shared contract area under `packages/models/src/admin-control-plane/` with pure types only, such as:
- domain and action identifiers,
- risk/execution enums,
- run envelope interfaces,
- step/checkpoint interfaces,
- audit/evidence/config snapshot references,
- API request/response DTOs,
- adapter descriptor / invocation / result DTOs.

Export them through the normal `@hbc/models` public surface.

### Recommended repo guidance updates
Create or update, only where needed:
- `apps/admin/README.md`
- `packages/features/admin/README.md`
- `packages/provisioning/README.md`
- `backend/functions/README.md`

## Risks Phase 2 is addressing
- hard-coding provisioning-specific vocabulary into the future admin control plane
- putting shared contract logic in the wrong package
- blurring the line between admin-intelligence and privileged execution
- inventing backend APIs in Phase 3 without a stable domain model
- creating audit/evidence/config semantics after runtime behavior is already built
- allowing later phases to infer execution behavior from ad hoc route names instead of stable contracts

## Why Phase 2 must come before Phase 3
Phase 3 will introduce generalized backend APIs and an adapter routing pattern. Without Phase 2:
- route design will drift,
- request/response shapes will be inconsistent,
- provisioning compatibility will be handled informally,
- and frontend, backend, and adapter layers will each invent their own execution vocabulary.

Phase 2 is the contract freeze that keeps Phase 3 from turning into interface rework.

## Recommended internal implementation sequence
1. Verify Phase 1 dependencies and current contract-like repo surfaces.
2. Define the admin action catalog, domains, risk levels, and execution modes.
3. Define the generalized run model and provisioning crosswalk.
4. Define the API contract catalog.
5. Define checkpoint / approval / external-event semantics.
6. Define audit / evidence / config / standards contracts.
7. Define adapter contracts and package placement.
8. Update local guidance and reconcile boundaries.
9. Run targeted validation and confirm Phase 2 exit criteria.

## Acceptance criteria for Phase 2 completion
Phase 2 is complete when all of the following are true:

- A canonical Phase 2 contract set exists under the admin docs folder.
- `@hbc/models` exposes a coherent admin-control-plane contract surface with pure types only.
- The repo has one clear action catalog, one clear run model, one clear checkpoint model, one clear audit/evidence/config model, and one clear adapter contract model.
- The provisioning lifecycle is explicitly cross-walked to the generalized admin run model without breaking existing provisioning ownership.
- `apps/admin`, `packages/features/admin`, `packages/provisioning`, and `backend/functions` guidance does not contradict the contract placement.
- No later-phase runtime implementation is accidentally introduced under the banner of contract work.
- Validation confirms export integrity and documentation consistency.

## Explicit non-goals for Phase 2
Do **not** let this phase drift into:
- generalized backend route implementation,
- durable-orchestrator runtime coding,
- real adapter execution logic,
- new repair workflows,
- new Entra administration handlers,
- or full operator-console IA/UI expansion.

Phase 2 should define the contracts those later phases will implement.

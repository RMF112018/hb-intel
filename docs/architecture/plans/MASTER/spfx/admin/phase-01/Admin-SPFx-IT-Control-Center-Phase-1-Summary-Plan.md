# Admin SPFx IT Control Center — Phase 1 Summary Plan

## Purpose

Phase 1 exists to lock the operating model for the Admin SPFx application before later implementation waves add more capability. The goal is to prevent the Admin app from drifting into an unsafe mix of browser UI, privileged execution, durable workflow logic, and governance state.

This phase does **not** try to deliver the full control center. It establishes the authoritative boundary model, domain taxonomy, locked decisions, and release-scope framing that later phases will build on.

## Governing basis

### Confirmed end-state constraints carried into Phase 1
- The Admin SPFx app is the **operator console**.
- A separate privileged backend/control plane is the **executor** for long-running and privileged work.
- Provisioning should remain seamless under normal conditions and only pause when failure handling requires it.
- Broad Entra administration is an early-class workstream.
- Standards/configuration governance uses a hybrid source-of-truth model.
- Single-admin execution is allowed, so safety, traceability, previews, and auditability are mandatory controls.

### Confirmed repo-truth signals that shape Phase 1
- `apps/admin/` already exists as a routed admin application with an SPFx entry point, permission-gated routes, and current placeholder/admin surfaces.
- `packages/features/admin/` already exists as a reusable **admin-intelligence** layer and is **not** the privileged control plane.
- `backend/functions/` already contains meaningful control-plane foundations: a service factory, Graph and SharePoint adapters, Azure Table-backed run persistence, and a provisioning saga orchestrator with retry, compensation, audit writes, and progress signaling.
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md` exists, but today it is too thin by itself to serve as the full Phase 1 baseline.
- Root repo governance already points agents to `current-state-map.md`, local package docs, authority routing, and smallest-credible verification.

## Phase 1 major objectives
1. Freeze what belongs in:
   - SPFx frontend
   - privileged backend
   - adapters
   - run/audit persistence
   - standards/configuration governance
2. Codify locked decisions into durable architecture doctrine.
3. Define the admin domain / capability taxonomy.
4. Map first-wave active scope vs advisory-only scope vs later expansion.
5. Update repo documentation so later phases start from one approved baseline instead of scattered assumptions.

## In-scope repo/doc/code areas
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `docs/architecture/blueprint/current-state-map.md` **only if** present-truth coverage is materially incomplete
- `apps/admin/**` local guidance/README work as needed
- `packages/features/admin/**` local guidance/README work as needed
- `backend/functions/**` local guidance/README work as needed
- `docs/reference/developer/**` only if a direct link/update is required for consistency

## Expected Phase 1 deliverables

Create or update the following canonical artifacts under `docs/architecture/plans/MASTER/spfx/admin/`:

1. `README.md`  
   Folder-level navigation and execution guidance for the admin architecture documents.

2. `phase-1/admin-spfx-phase-1-repo-truth-verification.md`  
   Focused summary of the current repo facts that matter to the Admin control-center boundary.

3. `phase-1/admin-spfx-phase-1-architecture-baseline.md`  
   The authoritative Phase 1 baseline for operator console vs privileged control plane.

4. `phase-1/admin-spfx-boundary-matrix.md`  
   Capability-to-layer ownership table with explicit “belongs here / does not belong here” guidance.

5. `phase-1/admin-spfx-domain-taxonomy.md`  
   Canonical taxonomy of admin domains and sub-capabilities.

6. `phase-1/admin-spfx-release-scope-map.md`  
   First-wave active scope, advisory-only scope, and later expansion scope.

7. `phase-1/admin-spfx-locked-decisions-and-phase-boundary-guards.md`  
   Locked decisions, rationale, and no-go guardrails.

8. Update `admin-spfx-target-architecture.md`  
   Keep the architectural diagram, but turn it into a properly cross-linked reference instead of a nearly standalone ASCII block.

9. Create or update local guidance where needed:
   - `apps/admin/README.md` (if absent, create it)
   - `packages/features/admin/README.md`
   - `backend/functions/README.md`

## Risks Phase 1 is addressing
- SPFx absorbing privileged Graph or SharePoint admin writes
- `@hbc/features-admin` becoming a pseudo-control-plane package
- backend foundations being generalized inconsistently
- standards/configuration governance being treated as an afterthought
- phase bleed from later execution phases into baseline/doctrine work
- later prompts implementing against folder names and assumptions instead of verified repo truth

## Why Phase 1 must come first
Later phases will introduce generalized run contracts, backend APIs, operator-console workflows, install/bootstrap behavior, SharePoint control, and Entra control. Without a clean boundary baseline, those later waves are likely to:
- place logic in the wrong layer,
- duplicate control-plane behavior,
- blur the role of reusable packages,
- create governance contradictions across docs,
- or hard-code later-phase assumptions into the wrong app/package.

Phase 1 is the architecture-safety gate for the rest of the program.

## Recommended internal implementation sequence

1. Verify the minimum authority set and current repo facts.
2. Write the Phase 1 architecture baseline.
3. Write the boundary matrix.
4. Write the admin domain taxonomy and release-scope map.
5. Write the locked decisions / phase-boundary guards.
6. Align the thin target-architecture doc and local package/app READMEs.
7. Reconcile contradictions, validate links, and confirm exit criteria.

## Acceptance criteria for Phase 1 completion
Phase 1 is complete when all of the following are true:

- There is one clear canonical Phase 1 baseline under the admin docs folder.
- The repo has an explicit boundary matrix for SPFx, backend, adapters, run/audit store, and config/governance responsibilities.
- The admin domain taxonomy exists and clearly separates first-wave active scope from later expansion.
- Locked decisions are written down in one place with boundary guards and no-go statements.
- `admin-spfx-target-architecture.md` points to and aligns with the fuller baseline.
- Local guidance for `apps/admin`, `packages/features/admin`, and `backend/functions` does not contradict the baseline.
- Any update to `current-state-map.md` is strictly present-truth and not target-state speculation.
- Validation and reconciliation confirm there is no material contradiction across the new Phase 1 document set.

## Explicit non-goals for Phase 1
Do **not** let this phase drift into:
- generalized admin run schema implementation,
- new backend API implementation,
- new orchestration runtime work,
- new SharePoint repair flows,
- new Entra workflow implementation,
- install/bootstrap execution flows,
- or broad UI feature construction beyond minimal documentation alignment.

Those belong to later phases.

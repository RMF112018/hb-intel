# Admin SPFx IT Control Center — Phase 3 Summary Plan

## Purpose

Phase 3 exists to establish the reusable **privileged backend foundation** for the Admin SPFx IT Control Center.

This phase should turn the Phase 2 contract model into a real but still disciplined backend skeleton that the Admin SPFx operator console can call for authenticated run launch, status polling, history retrieval, retry, repair initiation, validation, and configuration access.

Phase 3 is **not** the phase for completing every admin domain. It is the phase for creating the generalized backend substrate that later phases will extend.

## Governing basis

### Confirmed end-state constraints carried into Phase 3
- The Admin SPFx application remains the **operator console**, not the privileged executor.
- The privileged backend/control plane remains the only place where long-running, privileged, retrying, and compensating execution belongs.
- The backend must evolve by **generalizing the existing provisioning/control-plane pattern**, not by discarding it.
- Phase 3 must establish:
  - authenticated admin API seams,
  - a generalized backend host/composition-root pattern,
  - adapter registration and execution routing,
  - run-launch and run-status primitives,
  - and a backend structure that later phases can extend into durable audit, install/bootstrap, SharePoint control, and Entra control.

### Confirmed repo-truth signals that shape Phase 3
- `docs/architecture/blueprint/current-state-map.md` is the canonical present-truth source and already records a two-composition-root backend posture: the legacy monolithic host and the scoped Project Setup host.
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` proves the repo already supports a domain-host/service-factory boundary pattern that Phase 3 should reuse rather than replace.
- `apps/admin/src/pages/ProvisioningOversightPage.tsx` proves the Admin SPFx surface already performs real backend-calling oversight work and therefore needs a stable generalized backend seam instead of ad hoc route growth.
- `packages/provisioning/README.md` confirms provisioning is already a headless lifecycle package and should remain the strongest current implementation seam.
- `packages/features/admin/README.md` confirms `@hbc/features-admin` is the admin-intelligence layer and should not absorb privileged control-plane runtime ownership.
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md` already states the intended shape: operator console → authenticated API layer → durable orchestrator → adapters → run/audit persistence.

## Phase 3 major objectives
1. Establish the generalized **admin backend host/composition-root strategy**.
2. Add an **authenticated admin API surface** for:
   - run launch,
   - run status,
   - run history,
   - retry,
   - repair initiation,
   - validation,
   - and configuration retrieval.
3. Create a reusable **admin service container / service factory** pattern aligned with the repo’s host-boundary doctrine.
4. Create a generalized **adapter registry and execution routing** skeleton.
5. Bridge existing provisioning orchestration into the new generalized admin backend foundation without breaking current provisioning ownership.
6. Introduce the minimal **orchestration substrate seam** needed for later durable-run and audit expansion.
7. Wire authorization, configuration, and operational safety in a boundary-safe way.
8. Produce the docs and README updates needed so later phases build on a stable backend foundation instead of route-by-route drift.

## In-scope repo/doc/code areas
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `backend/functions/**`
- `packages/models/**` only if tiny type additions are still needed to support backend DTO usage
- `packages/provisioning/**` only where bridge/alignment changes are required
- `packages/features/admin/**` for narrow guidance updates only
- `apps/admin/**` for boundary-safe API-client or README updates only
- `docs/architecture/blueprint/current-state-map.md` only if present-truth changed through actual implementation

## Expected Phase 3 deliverables

### Canonical documentation artifacts under `docs/architecture/plans/MASTER/spfx/admin/phase-3/`
1. `admin-spfx-phase-3-runtime-foundation-inventory.md`
2. `admin-control-plane-host-and-composition-root-plan.md`
3. `admin-control-plane-api-surface-and-route-catalog.md`
4. `admin-control-plane-service-factory-and-container-plan.md`
5. `admin-control-plane-adapter-registry-and-routing-foundation.md`
6. `admin-control-plane-orchestration-bridge-plan.md`
7. `admin-control-plane-authz-config-and-operational-safety-plan.md`
8. `admin-control-plane-phase-3-decision-register.md`
9. `admin-control-plane-phase-3-validation-report.md`

### Recommended code-level outputs
Create or update a generalized backend foundation aligned with repo truth, likely centered on:
- a new admin-control-plane host/composition root under `backend/functions/src/hosts/`
- admin API route families for launch / status / history / retry / repair / validate / config
- a scoped service container / factory for admin-control-plane execution
- adapter registry and execution-routing seams
- orchestration bridge code that can call existing provisioning execution patterns without folding provisioning into the admin app surface
- narrow client seam updates in `apps/admin/` only where needed to consume the new API surface

## Risks Phase 3 is addressing
- continuing to grow privileged backend behavior as provisioning-only special cases
- mixing generalized control-plane runtime into `@hbc/features-admin`
- growing admin backend routes without a clear host, container, and adapter-routing model
- coupling admin SPFx screens directly to provisioning-only APIs forever
- letting later phases invent different backend patterns for install/bootstrap, SharePoint control, and Entra control
- introducing privileged execution logic in browser-facing SPFx code instead of server-side control-plane code

## Why Phase 3 must come before Phase 4 and later
Phase 4 depends on a real backend substrate to persist generalized run and audit evidence. Later phases depend on stable launch/status/retry/config APIs and a route/container/adapter pattern that can scale beyond provisioning.

Without Phase 3, later phases would either:
- bolt new privileged behaviors onto provisioning-specific endpoints,
- duplicate orchestration logic per domain,
- or force the Admin SPFx surface to compensate for missing backend structure.

## Recommended internal implementation sequence
1. Verify Phase 2 contract outputs and current backend host/service-factory posture.
2. Decide and document the admin-control-plane host/composition-root strategy.
3. Create the backend service container/factory and foundational route registration.
4. Implement authenticated launch/status/history/repair/validate/config endpoints.
5. Add adapter registry and normalized execution routing.
6. Bridge existing provisioning orchestration into the generalized admin runtime surface.
7. Wire authorization, configuration, and safety guardrails.
8. Update docs/READMEs/current-state truth where warranted.
9. Run focused validation and confirm exit criteria.

## Acceptance criteria for Phase 3 completion
Phase 3 is complete when all of the following are true:

- The repo has a documented and implemented generalized admin backend foundation aligned with the existing host-boundary doctrine.
- The backend exposes authenticated generalized admin endpoints for launch / status / history / retry / repair / validate / config access.
- The service-container / service-factory pattern for this backend scope is explicit and documented.
- Adapter registration and execution routing are present as reusable infrastructure rather than one-off handler logic.
- Existing provisioning remains operational and is explicitly bridged into the generalized control-plane foundation rather than rewritten blindly.
- `apps/admin`, `packages/features/admin`, `packages/provisioning`, and `backend/functions` guidance no longer contradict the new backend foundation.
- Validation confirms build integrity, route wiring, and boundary alignment.

## Explicit non-goals for Phase 3
Do **not** let this phase drift into:
- full durable evidence and retention maturity from Phase 4,
- full operator-console IA/UI overhaul from Phase 5,
- end-to-end install/bootstrap completion from Phase 6,
- full SharePoint control domain implementation,
- full broad Entra administration implementation,
- or complete high-risk safety UX maturity from later phases.

Phase 3 should create the backend substrate those later phases will extend.

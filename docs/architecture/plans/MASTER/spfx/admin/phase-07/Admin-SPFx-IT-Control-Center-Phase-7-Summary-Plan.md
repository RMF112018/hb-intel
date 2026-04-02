# Admin SPFx IT Control Center — Phase 7 Summary Plan

## Purpose

Phase 7 exists to **preserve and harden straight-through provisioning execution**.

The platform already has meaningful provisioning foundations: an admin app, a provisioning package, a provisioning saga orchestrator, SharePoint and Graph adapters, Azure Table-backed run state, and a failed-run inbox pattern. Phase 7 should **not** start over. It should refine these foundations into a more dependable rollout lane that:

- launches with stronger dependency validation,
- runs straight through under normal conditions,
- classifies and surfaces failures clearly,
- gives operators better recovery visibility and guidance,
- and integrates provisioning with install/bootstrap and Entra readiness work established in earlier phases.

## Governing direction

Phase 7 is controlled by the end-state plan requirement that:

- provisioning must run straight through unless failure occurs,
- dependency validation must improve before run launch,
- diagnostics, recovery visibility, and operator guidance must improve,
- provisioning must integrate with install/bootstrap and Entra setup,
- and the frontend/backend boundary must remain intact.

## Current repo-truth signals that shape this phase

The current repo already contains important Phase 7 foundations:

- `apps/admin` is a real SPFx admin app with a README that describes system settings, provisioning oversight, and dashboards.
- `apps/admin/src/router/routes.ts` is still narrow and currently maps `/error-log` and `/provisioning-failures` back into `SystemSettingsPage` sections instead of clean dedicated provisioning/error workflow routes.
- `apps/admin/src/pages/ProvisioningFailuresPage.tsx` exists and already calls provisioning retry/escalation actions.
- `packages/provisioning` exists as a dedicated provisioning package.
- `backend/functions/src/functions/provisioningSaga/` contains the saga orchestrator, steps, and tests.
- `backend/functions/src/services/table-storage-service.ts` already persists provisioning run status and supports failed-run and escalation queries.
- `backend/functions/src/services/sharepoint-service.ts` and `graph-service.ts` already carry real provisioning-side platform operations and prerequisite gates.
- `backend/functions/README.md` already describes provisioning staging gates and prerequisite validation, which means Phase 7 should refine and operationalize that posture rather than invent it from scratch.
- `packages/features/admin` still contains notable in-memory/deferred limitations for observability, so Phase 7 must improve provisioning diagnostics without pretending Phase 12 observability work is already complete.

## Major objectives

1. Harden dependency validation before provisioning run launch.
2. Preserve seamless straight-through execution for normal runs.
3. Strengthen failure taxonomy, diagnostics, and operator guidance.
4. Improve recovery and repair visibility without moving privileged execution into SPFx.
5. Integrate provisioning readiness with install/bootstrap and Entra setup prerequisites.
6. Align the admin UI, route structure, and provisioning-control-center behavior with actual provisioning workflows.
7. Update docs and runbooks so the hardened provisioning path is explicit and maintainable.

## In-scope areas

### Backend / control plane
- `backend/functions/src/functions/provisioningSaga/**`
- `backend/functions/src/services/**`
- provisioning status / failure / escalation APIs
- telemetry / diagnostics touchpoints directly related to provisioning

### Shared/package layer
- `packages/provisioning/**`
- shared models/contracts if Phase 7 needs targeted schema enrichment
- `packages/features/admin/**` only where provisioning diagnostics or admin-intelligence integration requires it

### SPFx operator console
- `apps/admin/src/router/**`
- `apps/admin/src/pages/**`
- provisioning oversight / failures / history / status UX
- operator guidance, recovery visibility, and route correctness

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/**`
- provisioning runbooks, admin docs, backend README updates, and phase-specific planning docs required for Phase 7 clarity

## Expected Phase 7 deliverables

The implementation prompted by this package should produce, at minimum:

1. A Phase 7 repo-truth gap map for provisioning hardening.
2. A provisioning hardening plan / doctrine update under the admin docs area.
3. Hardened pre-launch dependency validation behavior and explicit prerequisite failure messaging.
4. Improved provisioning saga failure classification and recovery semantics.
5. Enriched provisioning status / evidence payloads for operator-facing diagnostics.
6. Better provisioning retry / escalation / repair visibility.
7. Route and UI alignment for the admin provisioning lane.
8. Updated provisioning and admin documentation/runbooks.
9. Validation proving that straight-through runs remain streamlined while failure cases become more intelligible and recoverable.

## Risks this phase is addressing

- straight-through provisioning breaking because prerequisite failures are discovered too late
- operators receiving weak or ambiguous failure explanations
- retry/recovery actions being available without enough evidence or guidance
- SPFx route/UI drift causing the provisioning lane to be misleading or fragmented
- install/bootstrap and Entra readiness becoming disconnected from provisioning launch readiness
- docs overstating maturity or hiding current route/control-plane limitations

## Why Phase 7 must come now

The end-state plan explicitly places Phase 7 early because provisioning is already foundational and central to rollout success. Earlier phases establish the control-center substrate, but Phase 7 is where the platform proves that the most important operational workflow—project/site provisioning—can run cleanly and recover transparently. If this phase is weak, later SharePoint control, standards enforcement, and broader admin capabilities will be built on a fragile rollout path.

## Recommended implementation sequence inside the phase

1. Audit repo truth and capture the specific provisioning gaps/drift.
2. Lock the Phase 7 hardening model and artifact plan.
3. Harden prerequisite/dependency validation.
4. Harden straight-through saga execution behavior and failure classification.
5. Improve recovery/repair semantics and operator-facing status payloads.
6. Improve diagnostics and telemetry for provisioning runs.
7. Integrate provisioning readiness with install/bootstrap and Entra setup conditions.
8. Correct and upgrade the SPFx provisioning control-center flow.
9. Reconcile docs/runbooks with the implemented behavior.
10. Validate end-to-end normal-run and failure-run outcomes.

## Acceptance criteria

Phase 7 is complete when all of the following are true:

- provisioning still launches and runs straight through under normal conditions,
- prerequisite failures are caught early and surfaced clearly before or at launch,
- failure states are classified and understandable,
- retry/escalation/repair actions are grounded in durable run evidence,
- the admin UI exposes a coherent provisioning control-center path rather than route drift or placeholder indirection,
- provisioning readiness is explicitly integrated with install/bootstrap and Entra/setup dependencies,
- docs and runbooks explain the hardened provisioning flow accurately,
- and validation demonstrates both seamless normal execution and clear failure visibility.

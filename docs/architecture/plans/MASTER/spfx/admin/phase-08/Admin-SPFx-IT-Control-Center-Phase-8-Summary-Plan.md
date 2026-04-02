# Admin SPFx IT Control Center — Phase 8 Summary Plan

## Purpose

Phase 8 delivers the first-wave **SharePoint control lane** for the Admin SPFx IT Control Center.

This phase is where the admin experience stops being limited to provisioning visibility and starts providing controlled, standards-aware observation and repair for **HB Intel-managed SharePoint assets**. The target is not broad tenant-wide SharePoint administration. The target is a disciplined, auditable control surface for the SharePoint assets that directly support the HB Intel platform.

## Governing Phase 8 intent

Phase 8 is driven by the end-state plan requirement to add:

- drift detection for HB Intel-managed SharePoint assets,
- standards comparison,
- standards preview / dry-run,
- controlled site/package/API posture repair,
- and an operator-facing SharePoint control lane in the Admin app.

The end-state plan also locks several guardrails that remain active in this phase:

- active SharePoint control is first-wave scope, but only for **HB Intel-managed assets**,
- standards and configuration are governed capabilities,
- privileged execution remains in the backend/control plane,
- SPFx remains the operator console,
- and high-risk actions require strong evidence, previews, and constrained scope.

## Why Phase 8 exists

By this point in the program, the platform should already have:

- a Phase 1 boundary baseline,
- generalized admin/backend/run contracts from later phases,
- a control-plane substrate,
- an operator-console shell,
- install/bootstrap behavior,
- and hardened provisioning.

Phase 8 converts those foundations into an operational SharePoint control lane.

Without this phase, the Admin app can see rollout state but cannot actively compare real SharePoint posture against HB Intel standards, preview remediation, or execute controlled repairs for the SharePoint assets that the platform depends on.

## Major objectives

1. Define the **HB Intel-managed SharePoint asset boundary** precisely.
2. Create or harden the standards snapshot and comparison model used by SharePoint control.
3. Add backend workflows for:
   - drift detection,
   - standards comparison,
   - preview / dry-run,
   - controlled repair,
   - standards application / reapplication,
   - package and API posture validation.
4. Add a real SharePoint control lane in SPFx for:
   - asset selection / scoping,
   - drift review,
   - preview results,
   - repair initiation,
   - and evidence / history access.
5. Ensure all active writes stay limited to the allowed first-wave boundary.
6. Ensure actions are auditable, explainable, and least-privilege-aware.

## In-scope repo / doc / code areas

### Primary
- `apps/admin/**`
- `packages/features/admin/**` only where admin-intelligence or reusable control-lane UI support is appropriate
- `backend/functions/**`
- `@hbc/provisioning` and related adapter surfaces only where integration is needed
- `docs/architecture/plans/MASTER/spfx/admin/**`
- any existing SharePoint-control, standards, provisioning, or admin run docs tied directly to this phase

### Expected supporting areas
- shared admin run / audit / config contracts already established in earlier phases
- existing SharePoint service adapters
- any package / deployment posture utilities
- app catalog or API access helper logic if present

## Expected Phase 8 deliverables

1. A Phase 8 repo-truth and dependency audit.
2. A SharePoint control baseline for:
   - managed asset scope,
   - standards comparison rules,
   - active vs advisory control boundaries.
3. Backend contract and workflow support for:
   - standards snapshot resolution,
   - drift collection / normalization,
   - preview / dry-run,
   - repair / apply / reapply,
   - package posture validation,
   - API access posture validation.
4. Evidence and audit enrichment for SharePoint control runs.
5. A real SPFx SharePoint control lane in the admin console.
6. Documentation and runbooks for operators and future developers.
7. Validation and reconciliation proving this phase stayed inside the permitted boundary.

## Risks this phase is addressing

- SharePoint control remaining an architectural idea rather than an operable lane
- uncontrolled scope creep into broad tenant-wide SharePoint governance
- repair logic being launched without preview / dry-run semantics
- standards comparison behavior being implicit or inconsistent
- app catalog / API posture issues remaining invisible until provisioning or rollout fails
- SharePoint active-control logic bypassing the backend and leaking into SPFx
- repair actions being insufficiently auditable

## Why this phase comes after install/bootstrap and provisioning hardening

Phase 8 depends on earlier phases because SharePoint control requires:

- the control-plane execution substrate,
- durable run / audit behavior,
- the operator console shell,
- dependency-aware rollout knowledge,
- and a hardened provisioning foundation.

It should build on those foundations rather than invent parallel mechanics.

## Recommended implementation sequence

1. Audit repo truth and prior-phase dependencies.
2. Define the SharePoint-control baseline and managed-asset boundary.
3. Establish standards snapshot / comparison primitives for SharePoint control.
4. Implement drift detection and normalized comparison output.
5. Implement preview / dry-run semantics.
6. Implement constrained repair / apply / reapply execution flows.
7. Implement package / API posture validation and visibility.
8. Add the SPFx SharePoint control lane.
9. Add evidence, docs, runbooks, and validation reconciliation.

## Acceptance criteria

Phase 8 is complete when all of the following are true:

- There is a clearly defined and documented boundary for **HB Intel-managed SharePoint assets**.
- The backend can compare those assets against standards and produce normalized drift results.
- Operators can run preview / dry-run before repair or reapplication.
- Active repair or standards application remains constrained to the approved first-wave boundary.
- The Admin app has a real SharePoint control lane with scoping, comparison, preview, and repair initiation UX.
- Package posture and API access posture are visible enough to support rollout health.
- All privileged and long-running execution remains in the backend/control plane.
- Runs are auditable and reconstructable with evidence.
- Docs and runbooks are aligned with repo truth and phase boundaries.

## Explicit non-goals

Do **not** let this phase drift into:

- broad tenant-wide SharePoint active governance,
- general Microsoft 365 admin beyond SharePoint control needs,
- live-admin standards governance model creation that properly belongs to the config-governance phase,
- moving control-plane execution into SPFx,
- or replacing healthy backend / provisioning foundations without cause.

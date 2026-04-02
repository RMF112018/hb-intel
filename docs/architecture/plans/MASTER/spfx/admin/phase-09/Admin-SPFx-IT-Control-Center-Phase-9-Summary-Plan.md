# Admin SPFx IT Control Center — Phase 9 Summary Plan

## Purpose

Phase 9 delivers the **broad Entra administration foundation** for the Admin SPFx IT Control Center.

At this phase, the Admin app stops being limited to provisioning-era identity helpers and gains a real **Entra control lane** for user and group administration through the privileged backend/control plane. The intent is not to finish every identity-governance feature in Microsoft 365. The intent is to establish a serious, production-directed Entra administration substrate that supports:

- real user administration,
- real group administration,
- rollout-critical identity operations,
- broader identity operations beyond HB Intel-only provisioning groups,
- audit-backed execution,
- risk-aware workflow handling,
- and a clean frontend/backend boundary.

## Governing basis

### End-state-plan facts driving this phase
Phase 9 in the end-state plan is **Broad Entra administration foundation**.

Its stated objectives are:
- support broad user/group administration,
- separate rollout-critical identity actions from broader identity administration actions,
- implement risk-aware Graph-backed workflows.

Its expected deliverables are:
- Entra control lane in the Admin app,
- Graph-backed admin workflows,
- audit-backed identity change flows.

Its exit criterion is:
- the Admin app can perform real Entra user/group administrative actions through the control plane.

### Repo-truth facts shaping the phase
Current repo truth indicates:
- `apps/admin/` exists and is a real SPFx app shell, but it is currently routed only around a small admin surface area rather than a dedicated Entra control lane.
- `apps/admin/src/pages/` currently contains only:
  - `SystemSettingsPage.tsx`
  - `ProvisioningFailuresPage.tsx`
  - `ErrorLogPage.tsx`
- `SystemSettingsPage.tsx` is centered on `@hbc/auth` admin access-control UI, not broad Entra administration.
- `packages/features/admin/` is a reusable admin-intelligence package with monitors, probes, APIs, hooks, integrations, and components. It is not the privileged executor.
- `backend/functions/src/services/graph-service.ts` already exists, but its implemented responsibilities are still narrow and provisioning-oriented:
  - create security group
  - add group members
  - look up group by display name
  - grant SharePoint site access
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` shows the repo already has a meaningful privileged execution pattern with retry, audit writes, and durable status progression.

## Major objectives

1. Define the Entra control lane boundary clearly.
2. Expand backend Graph capabilities from provisioning-only helpers into a broader Entra admin foundation.
3. Separate **rollout-critical identity operations** from **broader identity administration**.
4. Introduce a phase-appropriate user/group action catalog and risk model.
5. Implement audit-backed identity workflows through the privileged backend.
6. Add an Entra lane to the Admin SPFx application.
7. Keep dangerous or privileged logic out of SPFx.
8. Document permission, role, and environment prerequisites clearly.
9. Add tests, validation, and reconciliation so the lane can be trusted.

## In-scope repo/doc/code areas

### Frontend
- `apps/admin/**`

### Reusable admin intelligence
- `packages/features/admin/**` only where phase-appropriate reusable UI/state primitives are needed

### Backend/control plane
- `backend/functions/**`

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `docs/reference/**` where new Entra operational references or environment guidance are needed
- local READMEs for touched areas if warranted

## Expected deliverables

### Documentation / architecture outputs
- Phase 9 repo-truth and gap map
- Phase 9 Entra architecture baseline
- identity action catalog and risk taxonomy
- permission / role / consent matrix
- environment and prerequisite guide
- runbook / operator notes
- validation and exit reconciliation report

### Backend outputs
- broadened Graph service contract and implementation
- phase-appropriate Entra action models / request models
- user admin workflows
- group admin workflows
- audit-backed run/evidence behavior for identity operations
- tests for Graph service and new identity workflows

### Frontend outputs
- Entra control lane in admin navigation
- route/page structure for Entra administration
- risk-aware forms and execution UX
- preview / impact / confirmation patterns where phase-appropriate
- operator visibility into results, failures, and audit/history surfaces

## Risks Phase 9 is addressing

- overloading provisioning-era group helpers and pretending they are a complete Entra admin system
- letting SPFx own privileged Graph execution
- over-permissioning the app with broad Graph scopes without an explicit action matrix
- mixing rollout-critical identity operations with broader identity administration without risk separation
- introducing destructive identity actions without auditability and guardrails
- adding UI pages that do not correspond to real privileged backend capability
- treating `@hbc/features-admin` as the control plane instead of keeping it reusable

## Why Phase 9 must exist as a discrete phase

The end-state plan makes broad Entra administration an early-class workstream, not a late enhancement. The current repo already has Graph and orchestration foundations, but they remain narrow and provisioning-centric. Without a discrete Phase 9 implementation wave:
- Entra capabilities will remain scattered,
- the Admin app will continue to lack a true Entra lane,
- user/group administration will be improvised instead of modeled,
- and permission / role / audit concerns will drift into ad hoc implementation.

## Recommended implementation sequence inside the phase

1. Verify phase prerequisites and repo truth.
2. Write the Phase 9 architecture/gap baseline docs.
3. Define the Entra action catalog, risk tiers, and permission/role matrix.
4. Expand the Graph service contract, mocks, and tests.
5. Add backend Entra run/action models and supporting workflow primitives.
6. Implement user-administration flows.
7. Implement group-administration flows.
8. Add the Entra control lane in the Admin SPFx app.
9. Add operator safety, preview, and evidence/history behavior.
10. Update docs, env guidance, and runbooks.
11. Reconcile, validate, and close the phase.

## Acceptance criteria

Phase 9 is complete when all of the following are true:

- the repo has a canonical Phase 9 Entra administration baseline and gap map,
- broad user/group administration is modeled explicitly,
- the backend Graph layer supports more than provisioning-only group helpers,
- user and group actions run through the privileged backend rather than SPFx,
- the Admin app contains a dedicated Entra control lane,
- rollout-critical identity operations are separated from broader identity administration,
- the Graph permission / role / consent posture is documented action-by-action,
- identity operations write durable audit/evidence records or phase-appropriate audit artifacts,
- tests cover the expanded Graph service and the new user/group workflows,
- docs and README surfaces are updated and no material contradiction remains.

## Explicit non-goals

Do not let this phase drift into:
- full tenant-wide M365 administration outside Entra,
- Phase 10 live standards/config governance work beyond minimal compatibility,
- Phase 11 full high-risk-action safety maturity beyond what is needed for clean Entra foundations,
- Phase 12 observability completion,
- or broad SharePoint control work outside the Entra/identity boundary.

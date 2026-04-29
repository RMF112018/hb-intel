# Phase 3 Workstream Boundary

## Phase 3 Purpose

Phase 3 is the Project Control Center product-layer readiness phase. Its near-term purpose is to define the PCC shell, user journeys, UI/UX architecture, backend/service contract concepts, admin workflows, and site-health operating model that will eventually consume Phase 2 provisioning outputs after those outputs stabilize.

While Phase 2 remains active, Phase 3 is not an implementation phase. It is a planning, architecture, interface-assumption, and readiness-gate phase.

---

## Phase 3 Workstreams

| Workstream | Purpose | Concurrent Status |
|---|---|---|
| Product Architecture | Define what the PCC shell is, what it does, and how project teams use it daily. | Concurrent-safe now |
| User Journeys | Define PM, PX, Superintendent, Project Accountant, Safety/QAQC, IT/Admin, and Executive Oversight paths. | Concurrent-safe now |
| UI/UX Architecture | Map PCC shell to SPFx doctrine, scorecard, breakpoint standards, accessibility, and host-fit rules. | Concurrent-safe now |
| SPFx Shell Design Spec | Produce wireframes/specs only; do not create apps/components/packages. | Concurrent-safe now, planning only |
| Backend Service Contract Design | Draft future API/read-model concepts without implementation or DTO binding. | Concurrent-safe with assumptions; Step 4/5 dependent for finalization |
| Admin / Control Plane Workflow | Define preview, approval, checkpoint, evidence review, repair request, and operator workflow. | Concurrent-safe with assumptions |
| Site Health / Drift / Repair | Define UX, severity model, operating model, and repair request concepts. | Concurrent-safe as model only |
| Manifest Consumer Boundary | Define what PCC may eventually consume from Phase 2 outputs. | Concurrent-safe as assumptions only |
| Non-Production Rollout Planning | Define controlled rollout gates and validation evidence. | Step 4/5/6 dependent for usable details |
| Production Rollout Planning | Define only the production-blocked gate framework. | Production-blocked |
| Procore Boundary Planning | Confirm mapping/launch/summary boundaries and no direct SPFx-to-Procore. | Concurrent-safe as boundary planning |
| Procore Runtime | Implement Procore API, sync, secrets, mirror, or write-back behavior. | Not allowed |

---

## Workstream Ownership

| Workstream | Primary Owner | Supporting Owners |
|---|---|---|
| Product Architecture | HB Intel Architecture / Product | Operations, Project Delivery |
| User Journeys | Product / Operations | PX, PM, Field, Accounting, Safety/QAQC |
| UI/UX Architecture | SPFx Engineering / Design System | Product, Architecture |
| SPFx Shell Design Spec | SPFx Engineering | UI Doctrine Owner, Product |
| Backend Service Contract Design | Backend Engineering | IT, Security, Architecture |
| Admin / Control Plane Workflow | Backend / IT Operations | Product, Security |
| Site Health / Drift / Repair | Architecture / IT | Backend, SPFx, Operations |
| Manifest Consumer Boundary | Platform Engineering | Backend, SPFx |
| Rollout Planning | IT / Operations | Engineering, Security |
| Procore Boundary | Architecture / Backend | Operations, Procore Admins |

---

## Allowed Concurrent Work

Phase 3 may begin the following immediately:

- PCC shell product concept.
- Role-based user journeys.
- Work-center information architecture.
- Priority Actions Rail planning.
- Project Hero / Identity Header planning.
- Today / This Week panel planning.
- Readiness card planning.
- Site Health indicator UX planning.
- Team & Access entry-point planning.
- Document Control entry-point planning.
- Module navigation planning.
- Missing-data / incomplete-provisioning state planning.
- UI doctrine mapping.
- Breakpoint and shell-fit spec.
- Backend read-model concept planning.
- Admin workflow concept planning.
- Evidence/review workflow model.
- Open decision register.
- Interface assumptions register.
- Prompt package sequencing.

---

## Blocked Implementation Work

Phase 3 must not begin:

- SPFx app/package creation.
- React component implementation.
- Backend route/service implementation.
- Provisioning executor implementation.
- Manifest-to-runtime binding.
- Live Graph/PnP calls.
- SharePoint tenant changes.
- Site/list/library/page/group/permission creation.
- Procore runtime implementation.
- Procore secrets handling.
- Procore sync/mirror/write-back.
- SPFx manifest/package/version changes.
- CI/CD changes.
- Production rollout execution.

---

## Phase 2 Dependency Map

| Dependency | Needed For | Current Phase 3 Treatment |
|---|---|---|
| Stable object-plan entries across all 14 families | PCC read-model mapping and shell object references | Treat as assumption only |
| Deterministic planned hash | Proof/evidence UX and backend gate concepts | Wait for Phase 2 Step 4 |
| Secret scan and Procore mirror scan semantics | Site Health/proof visibility and approval workflows | Wait for Phase 2 Step 3/4 |
| Dry-run proof artifact shape | Admin approval, evidence review, non-prod rollout | Wait for Phase 2 Step 4 |
| Mutation gate semantics | Executor checkpoint and approval workflows | Wait for Phase 2 Step 5/6 |
| Non-production execution boundary | Backend executor, repair operations, rollout testing | Wait for Phase 2 Step 5/6 |
| Post-provision validation posture | Site Health runtime model and drift detection | Wait for Phase 2 Step 6 |
| Phase 2 closeout | Implementation authorization | Required before SPFx/backend build prompts |

---

## SPFx Boundary

### Allowed Now

- Shell information architecture.
- Wireframe/spec documentation.
- UI doctrine mapping.
- Breakpoint contract.
- State model planning.
- Data-consumption assumptions.
- Read-only consumer boundary planning.

### Not Allowed Yet

- `apps/project-control-center/` creation.
- Component, hook, service, route, or package implementation.
- Direct import of `@hbc/project-site-provisioning` runtime exports.
- Direct provisioning execution.
- Direct Graph/PnP/Procore calls.
- Manifest/package version changes.

### Future SPFx Rule

The SPFx shell may eventually consume approved backend APIs and read-only manifest/proof summaries. It must not execute provisioning, repair, tenant mutation, or Procore calls directly.

---

## Backend Boundary

### Allowed Now

- Future API namespace planning.
- Service contract concept planning.
- Read-model concept planning.
- Authorization model planning.
- Evidence/review model planning.
- Admin workflow planning.
- Health/readiness/drift model planning.

### Not Allowed Yet

- Routes.
- Services.
- DTOs.
- Adapters.
- Executor code.
- PnP/Graph calls.
- Table/list writes.
- Function app config changes.
- CI/CD changes.

### Future Backend Rule

Backend services will become the privileged execution boundary only after Phase 2 produces approved manifest/proof/mutation gates and non-production execution boundaries.

---

## Provisioning Boundary

### Allowed Now

- Manifest consumer assumption mapping.
- Dry-run proof UX assumptions.
- Approval workflow assumptions.
- Validation state taxonomy planning.

### Not Allowed Yet

- Executor implementation.
- Site creation.
- List/library/page/group/permission creation.
- PnP runner changes.
- Graph/PnP live mutation.
- Tenant execution.

### Future Provisioning Rule

Provisioning must remain approved-manifest-driven, dry-run-first, audited, evidence-backed, least-privilege, and blocked from production until production gates close.

---

## SharePoint Tenant Boundary

### Allowed Now

- Tenant surface inventory planning.
- Project-site IA planning.
- Site Health UX planning.
- Permission template display planning.
- Rollout gate planning.

### Not Allowed Yet

- Tenant mutation.
- Test site creation.
- List/library/group/page creation.
- Permission assignment.
- App catalog deployment.
- Package upload.
- SharePoint admin screen dependency as a normal workflow.

---

## Procore Boundary

### Allowed Now

- Confirm Procore remains system of record.
- Plan launch-link and mapping UX.
- Plan curated-summary future boundaries.
- Plan no-secrets/no-mirror/no-write-back guardrails.
- Plan Procore health/readiness placeholder display.

### Not Allowed

- Procore API client.
- Procore secrets.
- Procore sync.
- Procore full mirror.
- Procore write-back.
- Direct SPFx-to-Procore calls.
- Runtime Procore endpoint work.

---

## Admin / Control-Plane Boundary

### Allowed Now

- Define operator workflow.
- Define approval/checkpoint model.
- Define proof/evidence review screens.
- Define site-health escalation model.
- Define non-production apply gate concept.
- Define repair-request workflow concept.

### Not Allowed Yet

- Control-plane route implementation.
- Admin run execution.
- Evidence store changes.
- Durable store schema changes.
- Adapter implementation.
- Tenant apply/repair execution.

---

## Site Health / Drift / Repair Boundary

### Allowed Now

- UX model.
- Severity model.
- Project-user visibility model.
- IT/operator escalation model.
- Repair-request concept.
- Evidence-review concept.
- Drift category planning.

### Not Allowed Yet

- Drift scanner implementation.
- Repair executor implementation.
- Tenant mutation.
- Automated repair.
- Backend validation service changes.

---

## Production Rollout Boundary

Production remains blocked until:

- Phase 2 Step 4 dry-run proof semantics are stable.
- Phase 2 Step 5/6 mutation/executor and post-provision validation posture are stable.
- Phase 2 closeout confirms no-mutation and execution gates.
- Non-production execution has validated approved manifest workflow.
- SPFx consumes approved read models only.
- Backend executes approved manifests only.
- Tenant mutation requires explicit approval gates.
- Procore runtime remains separately approved and proof-gated.
- UI doctrine and SPFx benchmark requirements are satisfied with evidence.

---

## Boundary Decision

Phase 3 is **READY for concurrent planning-only work**.

Phase 3 is **NOT READY for implementation**.

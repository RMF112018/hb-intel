# Phase 3 Concurrent Readiness Audit

## Objective

Conduct a repo-truth audit of the Project Control Center (PCC) architecture, package boundaries, UI doctrine, backend service patterns, and provisioning-state dependencies to determine what Phase 3 work can safely begin while Phase 2 continues.

This audit is documentation-only. It does not implement SPFx, backend, provisioning, Graph/PnP execution, Procore runtime behavior, tenant mutation, package changes, or deployment changes.

## Scope

### In Scope

- Phase 3 product architecture and workstream planning.
- PCC shell planning and user journey planning.
- UI/UX doctrine mapping.
- Backend/service contract planning.
- Admin/control-plane workflow planning.
- Site health, drift, repair, validation, and evidence posture planning.
- Dependency and readiness mapping against active Phase 2 provisioning work.
- Prompt package outline for staged Phase 3 work.

### Out of Scope

- SPFx implementation.
- Backend implementation.
- Provisioning executor work.
- SharePoint tenant mutation.
- Graph/PnP live calls.
- Procore API/runtime implementation.
- CI/CD, app catalog, package, manifest, or version changes.
- Binding to unstable `@hbc/project-site-provisioning` exports.

---

## Repo Areas Audited

| Area | Audit Result |
|---|---|
| `docs/architecture/blueprint/sp-project-control-center/README.md` | Confirms PCC source-of-truth hierarchy, current phase posture, future SPFx and backend targets, and no-bypass guardrails. |
| `Standard_Project_Site_Template_Contract.md` | Governs project-site structure, PCC shell, permissions, modules, settings, validation, drift, repair, integrations, and MVP boundaries. |
| `HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Defines PCC as a SharePoint-hosted governed business application and strategic operating surface. |
| `Project_Control_Center_Development_Roadmap.md` | Defines Phase 3 historically as the PCC shell phase, but repo-truth concurrency requires planning-only work until Phase 2 gates close. |
| `phase-0/**`, `phase-1/**`, `phase-2/**` | Confirms Phase 1 full extraction is closed; Phase 2 Step 1 and Step 2 are complete; Step 3 is expected but not assumed complete unless verified in repo. |
| `packages/project-site-template/**` | Complete schema-only template contract package; remains no-runtime, no-provisioning. |
| `packages/project-site-provisioning/**` | Step 2 scaffold exists; headless mapper/planner; manifest is no-mutation and scaffold-stage; object plans and proof semantics are not yet stable until Phase 2 Step 3/4 lands. |
| `backend/functions/**` | Existing control-plane, readiness, auth, audit/evidence, durable persistence, health/readiness, and adapter patterns are relevant for future PCC backend planning. |
| `docs/reference/ui-kit/doctrine/**` | Governing SPFx UI doctrine applies to any future PCC shell and must be mapped before implementation. |
| `docs/reference/spfx-surfaces/**` | Homepage/SPFx benchmark, checklist, and scorecard define quality expectations for premium SharePoint-hosted surfaces. |
| Workspace/build configs | Root scripts support format/check/build/test conventions; no repo-specific Markdown-only lint script is assumed beyond Prettier checks. |

---

## Current Phase 2 Dependency State

| Phase 2 Item | Current State | Phase 3 Impact |
|---|---|---|
| Phase 2 Step 1 | Complete. Provisioning foundation audit and consumer boundary defined. | Phase 3 may use its boundary rules. |
| Phase 2 Step 2 | Complete. `@hbc/project-site-provisioning@0.1.0-scaffold` exists. | Phase 3 can plan against the package boundary, not against final exports. |
| Phase 2 Step 3 | Expected to populate family-level planned object coverage across all 14 contract families. | Phase 3 must not bind to final manifest entries, hash, proof, or scan fields until this lands and is validated. |
| Phase 2 Step 4 | Expected future dry-run/proof artifact semantics. | Blocks concrete backend/SPFx consumer contracts. |
| Phase 2 Step 5/6 | Expected future mutation/executor boundary and post-provision validation posture. | Blocks backend executor, drift repair execution, and non-prod tenant apply work. |
| Phase 2 closeout | Not complete. | Blocks implementation-phase Phase 3 work and production rollout planning beyond outline level. |

---

## What Phase 3 Can Do Concurrently

Phase 3 can begin as a planning/readiness track focused on the product layer and future consumer seams:

1. Define PCC product architecture and user journeys.
2. Define shell information architecture, surface hierarchy, and work-center entry model.
3. Map PCC shell requirements to SPFx doctrine, breakpoint doctrine, accessibility, host-fit, and benchmark-grade closure expectations.
4. Draft backend service contract concepts without implementation.
5. Draft admin/control-plane workflow concepts: preview, checkpoint, approval, non-prod apply readiness, evidence review, repair request, escalation.
6. Draft site health/drift/repair UX and operating model without executor code.
7. Draft interface assumptions that can be revisited after Phase 2 Step 4/5/6.
8. Generate staged prompts that keep planning work separate from implementation work.

---

## What Phase 3 Cannot Do Yet

Phase 3 must not:

- Create `apps/project-control-center/` or any SPFx surface.
- Create backend routes, services, adapters, or executor code.
- Import or bind runtime code to `@hbc/project-site-provisioning` unstable Step 2/Step 3 exports.
- Create provisioning executor behavior.
- Call Graph, PnP, SharePoint, or tenant APIs.
- Mutate site/list/library/page/group/permission resources.
- Create Procore runtime code or secrets.
- Mirror Procore data.
- Implement direct SPFx-to-Procore calls.
- Update SPFx manifests or package versions.
- Modify deployment workflows.

---

## Applicable Architecture Sources

| Source | Applicable Phase 3 Rule |
|---|---|
| PCC README | Contract governs implementation; blueprint is strategic; Procore remains backend-routed; future SPFx target is distinct from homepage. |
| Standard Project Site Template Contract | PCC shell, modules, settings, Team & Access, site health, validation, drift, repair, permissions, Procore, and MVP scope must trace to this contract. |
| Target Architecture Blueprint | PCC is a governed SharePoint-hosted business application; normal users should not rely on native SharePoint administration. |
| Development Roadmap | Phase 3 historically maps to the PCC shell, but concurrent work now must stay planning-only until Phase 2 gates close. |
| Phase 2 Step 2 closeout and provisioning README | `@hbc/project-site-provisioning` is no-mutation planner/mapper/proof only at scaffold stage. |

---

## Applicable UI/UX Doctrine

Future PCC shell planning must apply:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`, where shell-adjacent homepage patterns are useful but not directly copied
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/benchmark/**`
- existing benchmark-grade patterns such as hbKudos, homepage launcher, Foleon reader/manager surface lessons, Safety surface readiness, and Project Sites patterns

The PCC should target flagship-grade discipline for host-fit, doctrine compliance, state completeness, interaction completeness, accessibility, breakpoint behavior, evidence-backed closure, and non-generic product identity. The PCC should not clone hbKudos or the homepage shell; it should demonstrate equivalent rigor in a project-operation persona.

---

## Applicable Backend / Service Patterns

Future PCC service architecture should reuse patterns already established in `backend/functions/`:

- authenticated route wrappers
- admin app-role / delegated-scope gates
- durable run/audit/evidence persistence concepts
- preview/dry-run before mutation
- readiness routes and artifact identity proof
- adapter registry/service factory patterns
- request IDs and standardized response helpers
- observable probe/error/alert patterns
- control-plane checkpoint/decision patterns
- evidence offload and inline evidence boundary concepts

Phase 3 may document these as future patterns only. It must not implement new PCC backend routes until Phase 2 proof and mutation boundaries are stable.

---

## Applicable SharePoint / Project-Site Patterns

Phase 3 planning must respect:

- central HBCentral vs project-site boundaries from the contract
- project-local lists/libraries/groups/pages generated from the template contract
- backend-owned provisioning audit and execution evidence
- project-site Site Health record
- no native SharePoint admin dependency for normal users
- no direct user editing of raw list/library/settings surfaces for governed workflows
- no uncontrolled project-type-specific template forks
- status/stage/type orthogonality

---

## Applicable Safety / Provisioning / Dry-Run Patterns

The repo already contains relevant safety/control-plane patterns that should influence Phase 3 planning:

- dry-run / preview before privileged action
- readiness, health, and rollout posture separation
- audit/evidence records for privileged operations
- non-blocking audit writes where appropriate
- managed identity and backend-only privileged execution
- explicit permission inventory and readiness gates
- no secrets in markdown, SPFx, SharePoint lists, or client configuration

These are patterns, not implementation authorization.

---

## Required Classification Matrix

| Phase 3 Work Item | Concurrent-Safe Now | Depends on Phase 2 Step 4 | Depends on Phase 2 Step 5/6 | Depends on Phase 2 Closeout | Production-Blocked |
|---|---:|---:|---:|---:|---:|
| Product architecture | Yes | No | No | No | No |
| User journeys | Yes | No | No | No | No |
| SPFx shell wireframe/spec | Yes, planning only | No | No | No | No |
| UI doctrine mapping | Yes | No | No | No | No |
| Backend service contract design | Yes, interface planning only | Yes for proof semantics | Yes for executor boundary | No | No |
| Admin/control-plane workflow design | Yes, planning only | Yes for proof intake semantics | Yes for checkpoint/executor semantics | No | No |
| Site health UX design | Yes, planning only | Yes for dry-run proof artifact vocabulary | Yes for validation/drift semantics | No | No |
| Drift/repair operating model | Yes, model only | Yes | Yes | Yes for executable repair | Yes for live repair |
| Manifest consumer interface design | Yes, assumptions only | Yes for stable proof/hash | Yes for mutation/executor shape | Yes for final binding | No |
| Non-production rollout plan | Planning only | Yes | Yes | Yes | No |
| Production rollout plan | Planning outline only | Yes | Yes | Yes | Yes |
| Tenant execution | No | Yes | Yes | Yes | Yes until approval gates close |
| Procore integration planning | Yes, boundary planning only | No | No | No | Runtime remains gated |
| Procore runtime implementation | No | No | No | No | Yes |

---

## Risks

| Risk | Exposure | Mitigation |
|---|---|---|
| Interface churn | Phase 2 Step 3/4/5 may change manifest shape, proof semantics, hash fields, or executor boundaries. | Keep Phase 3 planning interface assumptions explicit and non-binding. |
| Premature implementation | Building SPFx/backend now would bind to unstable manifests and could bypass Phase 2 gates. | Planning-only guardrail; no code/package changes. |
| Tenant mutation | Provisioning work may accidentally advance from planning to execution. | Preserve mutation-blocked posture until approved manifest/proof/executor gates close. |
| SPFx/backend coupling | PCC shell could become an executor or admin workaround. | SPFx may consume read models and approved backend APIs only; no direct provisioning. |
| Procore scope creep | PCC could become a Procore clone or direct Procore client. | Backend-only Procore boundary; no secrets, mirror, write-back, or direct SPFx calls. |
| Documentation drift | Phase 3 docs may stale as Phase 2 lands. | Gate review prompt after Phase 2 Step 4 or Step 5. |
| UI genericism | PCC could degrade into default SharePoint/Fluent card grid. | Map to doctrine and scorecard before implementation. |

---

## Open Decisions

| ID | Decision | Status | Required Before |
|---|---|---|---|
| P3-OD-01 | Exact Phase 3 implementation target path if/when code begins: `apps/project-control-center/` vs existing SPFx host package composition. | Open | SPFx implementation prompt |
| P3-OD-02 | PCC backend route namespace and DTO placement for future read models. | Open | Backend contract implementation |
| P3-OD-03 | Whether PCC shell consumes manifest summary data directly or via backend-normalized project-site profile/readiness APIs. | Open | SPFx/backend contract gate |
| P3-OD-04 | Non-production tenant/site used for first PCC shell validation after Phase 2 executor boundary closes. | Open | Non-production rollout |
| P3-OD-05 | Repair workflow authority: operator-only, project admin request/approval, or IT-only execution. | Open | Drift/repair implementation |
| P3-OD-06 | Procore planning sequence after PCC MVP: mapping/launch-only first vs curated summaries. | Deferred | Procore runtime phase |

---

## Files Inspected

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md`
- `packages/project-site-template/README.md`
- `packages/project-site-provisioning/README.md`
- `packages/project-site-provisioning/src/contracts/provisioning-manifest.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `backend/functions/README.md`
- `package.json`

---

## Evidence Summary

1. PCC architecture docs already establish the product direction and no-bypass rules.
2. The contract establishes the future PCC shell, Team & Access, Document Control, Site Health, drift/repair, and integration boundaries.
3. Phase 1 machine-readable template contract is complete and schema-only.
4. Phase 2 Step 2 provisioning package exists but remains a no-mutation scaffold; full object-plan coverage and proof semantics are not yet stable.
5. Backend patterns exist for future service design, but no PCC executor or PCC shell should be implemented while Phase 2 is unfinished.
6. UI doctrine and SPFx scorecard require a high-quality, host-safe, productized PCC shell plan before implementation.
7. Phase 3 is ready for planning-only work now and not ready for implementation.

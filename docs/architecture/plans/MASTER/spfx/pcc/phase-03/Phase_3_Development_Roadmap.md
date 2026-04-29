# Phase 3 Development Roadmap

## Phase 3 Objective

Define the Project Control Center product, UX, service, admin workflow, and site-health architecture that can proceed safely while Phase 2 provisioning work continues.

Phase 3 is a planning/readiness phase until Phase 2 closes the proof, mutation, non-production execution, validation, and drift/repair gates.

---

## Current Repo Baseline

| Area | Baseline |
|---|---|
| PCC architecture | Defined by target blueprint and standard project site template contract. |
| Contract source of truth | `Standard_Project_Site_Template_Contract.md` governs implementation. |
| Phase 1 | Machine-readable `@hbc/project-site-template` package complete and schema-only. |
| Phase 2 Step 1 | Provisioning foundation audit and consumer boundary complete. |
| Phase 2 Step 2 | `@hbc/project-site-provisioning@0.1.0-scaffold` exists as no-mutation mapper/planner scaffold. |
| Phase 2 Step 3 | Expected to expand planned object coverage; do not assume stable until committed and validated. |
| SPFx PCC shell | Future target only; no implementation should begin now. |
| Backend PCC services | Future target only; existing backend patterns may guide planning. |
| Tenant execution | Blocked. |
| Procore runtime | Blocked. |

---

## Phase 3 Assumptions

1. Phase 3 is concurrent-safe only as planning.
2. PCC shell implementation waits for Phase 2 stable consumer contracts.
3. Backend executor implementation waits for proof/mutation/non-production gates.
4. SPFx surfaces will consume backend/read-only contract views, not execute provisioning.
5. Procore remains backend-only and out of runtime scope for Phase 3 planning.
6. UI doctrine and SPFx benchmark rules apply to any future PCC shell.
7. Any new architecture decision must be captured as open unless already supported by repo truth.

---

## Phase 2 Dependencies

| Dependency | Blocks |
|---|---|
| Step 3 object-plan contract coverage | Final manifest consumer mapping |
| Step 4 dry-run proof semantics | Admin proof/evidence workflow finalization |
| Step 5/6 mutation/executor boundary | Backend executor, non-prod apply, repair execution |
| Step 6 post-provision validation posture | Site Health implementation details |
| Phase 2 closeout | SPFx/backend implementation prompts |
| Production evidence gates | Production rollout |

---

## Workstream Sequence

### Workstream 1 — Concurrent Readiness and Boundary Documentation

- Confirm planning-only Phase 3 boundary.
- Classify concurrent-safe vs blocked work.
- Record dependencies and open decisions.
- Establish prompt sequence.

**Status:** Ready now.

### Workstream 2 — PCC Product Architecture and User Journey Blueprint

- Define role-based journeys.
- Define project home purpose.
- Define work center IA.
- Define readiness and responsibility surfaces.
- Define entry-point model for Team & Access, Document Control, Site Health, Settings, and external links.

**Status:** Ready now.

### Workstream 3 — PCC SPFx Shell Design Spec

- Produce wireframes/specs only.
- Map shell regions to contract sections.
- Map state model: loading, empty, partial configuration, missing provisioning data, stale health, archived/read-only, access denied.
- Define breakpoint and host-fit behavior.
- Map to scorecard/flagship acceptance.

**Status:** Ready now as planning only.

### Workstream 4 — PCC Backend / Service Contract Design

- Define future route categories.
- Define read-model concepts.
- Define auth/role gates.
- Define evidence and readiness response concepts.
- Define no-executor boundary.

**Status:** Ready now as interface planning; final shapes depend on Phase 2 Step 4/5.

### Workstream 5 — Admin / Workflow / Readiness Model

- Define operator flows.
- Define approval checkpoints.
- Define evidence review.
- Define non-prod apply gate concept.
- Define repair request and escalation concepts.

**Status:** Ready now as planning.

### Workstream 6 — Phase 3 Implementation Gate Review

- Re-audit after Phase 2 Step 4 or Step 5.
- Compare assumptions to stable Phase 2 outputs.
- Convert open decisions where repo truth supports closure.
- Decide whether SPFx/backend implementation may begin.

**Status:** Blocked until Phase 2 Step 4/5.

### Workstream 7 — Implementation Prompts

- SPFx shell scaffold.
- Backend read-model scaffold.
- Admin workflow scaffold.
- Site health read-model scaffold.
- Non-production validation.

**Status:** Blocked until Phase 2 closeout or explicit gate approval.

---

## Prompt Sequence

| Prompt | Title | Gate |
|---:|---|---|
| 1 | Phase 3 concurrent readiness audit and boundary documentation | Concurrent-safe now |
| 2 | PCC product architecture and user journey blueprint | Concurrent-safe now |
| 3 | PCC SPFx shell design spec, planning only | Concurrent-safe now |
| 4 | PCC backend/service contract design, planning only | Concurrent-safe now; Step 4/5 dependent for final DTOs |
| 5 | PCC admin/workflow/readiness model | Concurrent-safe now |
| 6 | Phase 3 implementation gate review after Phase 2 Step 4 or Step 5 | Phase 2 Step 4/5 dependent |
| 7 | PCC SPFx shell scaffold | Phase 2 closeout dependent unless explicitly approved earlier |
| 8 | PCC backend read-model scaffold | Phase 2 Step 5/6 dependent |
| 9 | PCC site health/drift read model | Phase 2 Step 6 dependent |
| 10 | Non-production rollout proof package | Phase 2 closeout dependent |
| 11+ | Production rollout | Production-blocked |

---

## Readiness Gates

### Phase 3 Entry Criteria

- Phase 1 full extraction closed.
- Phase 2 Step 1 boundary documented.
- Phase 2 Step 2 no-mutation planner scaffold exists.
- Product/UX/service planning can proceed without stable manifest exports.
- No code changes required.

### Implementation Gate

Phase 3 implementation is not authorized until:

- Phase 2 Step 4 has produced stable dry-run proof artifact semantics.
- Phase 2 Step 5 or Step 6 has clarified mutation/executor boundaries.
- SPFx surfaces are not directly executing provisioning.
- Backend services consume approved manifests only.
- Tenant mutation remains blocked by approval gates.
- Procore runtime remains explicitly out of scope unless separately approved.
- UI doctrine and SPFx benchmark requirements are mapped.
- No implementation binds to unstable `@hbc/project-site-provisioning` exports.

### Backend Gate

Backend work requires:

- Stable manifest/proof interface.
- Stable mutation approval semantics.
- Defined executor boundary.
- Defined non-prod target and approval gate.
- Auth/role model confirmed.
- Evidence/audit model confirmed.

### SPFx Gate

SPFx work requires:

- Shell design spec approved.
- UI doctrine mapping complete.
- Breakpoint spec complete.
- Read model / API assumptions stable or mocked.
- No direct provisioning or Procore calls.
- Missing-data and partial-provisioning states defined.

### Tenant Gate

Tenant mutation requires:

- Approved manifest.
- Dry-run proof artifact.
- Human approval checkpoint.
- Non-production target.
- Executor boundary.
- Post-provision validation plan.
- Rollback/repair posture.
- Audit/evidence capture.

### Production Gate

Production requires:

- Non-production validation complete.
- Evidence-backed Site Health and drift posture.
- Tenant approval gates.
- Operator runbook.
- Support/rollback model.
- Security review.
- No Procore runtime unless separately approved.

---

## Validation Gates

| Gate | Required Validation |
|---|---|
| Planning docs | Markdown presence, internal consistency, no code/package changes |
| UI/UX spec | Doctrine mapping, scorecard target, breakpoint matrix |
| Backend contract plan | No route/service implementation; endpoint concepts only |
| Manifest assumptions | Explicitly marked as assumptions until Phase 2 closeout |
| Admin workflow plan | No durable store/API changes |
| Implementation gate review | Re-audit Phase 2 output and close/reclassify open decisions |
| Non-prod rollout | Dry-run proof, approved manifest, post-provision validation |
| Production rollout | Full evidence and operator approval |

---

## Deliverables

| Deliverable | Status |
|---|---|
| `Phase_3_Concurrent_Readiness_Audit.md` | Planning deliverable |
| `Phase_3_Workstream_Boundary.md` | Planning deliverable |
| `Phase_3_Development_Roadmap.md` | Planning deliverable |
| `Phase_3_Prompt_Package_Outline.md` | Planning deliverable |
| `Phase_3_Closeout.md` | Planning deliverable |
| Future product architecture document | Prompt 2 |
| Future user journey blueprint | Prompt 2 |
| Future SPFx shell design spec | Prompt 3 |
| Future backend/service contract design | Prompt 4 |
| Future admin/workflow/readiness model | Prompt 5 |
| Future implementation gate review | Prompt 6 |

---

## Out-of-Scope Items

- SPFx code.
- Backend code.
- Provisioning executor.
- Graph/PnP calls.
- Tenant mutation.
- Package/version changes.
- CI/CD changes.
- Procore runtime.
- Procore secrets.
- Procore mirror.
- Procore write-back.
- Production rollout.

---

## Risk Register

| ID | Risk | Severity | Mitigation |
|---|---|---:|---|
| P3-R-01 | Phase 3 binds to unstable Phase 2 exports. | High | Use interface assumptions only. |
| P3-R-02 | SPFx shell becomes a provisioning executor. | High | Enforce backend-only execution boundary. |
| P3-R-03 | Backend planning turns into premature route implementation. | High | Keep Prompt 4 planning-only. |
| P3-R-04 | Tenant mutation occurs before proof gates. | Critical | Explicitly block tenant execution. |
| P3-R-05 | PCC becomes generic SharePoint card grid. | Medium | Apply doctrine and scorecard before build. |
| P3-R-06 | Procore scope expands into runtime implementation. | High | Keep Procore planning boundary only. |
| P3-R-07 | Documentation drifts after Phase 2 Step 4/5. | Medium | Require implementation gate review. |
| P3-R-08 | Admin workflow bypasses approval checkpoints. | High | Model approval/evidence/checkpoints before implementation. |

---

## Open Decision Register

| ID | Decision | Status | Owner | Required By |
|---|---|---|---|---|
| P3-OD-01 | PCC shell implementation path. | Open | SPFx / Architecture | SPFx implementation |
| P3-OD-02 | PCC backend route namespace. | Open | Backend / Architecture | Backend implementation |
| P3-OD-03 | Manifest consumption pattern: direct read-only manifest summary vs backend-normalized read model. | Open | Platform / Backend / SPFx | Integration gate |
| P3-OD-04 | Non-production target for first apply/proof run. | Open | IT / Backend | Tenant gate |
| P3-OD-05 | Site Health repair authority and approval model. | Open | IT / Operations | Repair implementation |
| P3-OD-06 | Procore MVP sequence. | Deferred | Architecture / Operations | Procore phase |
| P3-OD-07 | PCC flagship scorecard threshold acceptance. | Open | UI Doctrine Owner | SPFx spec |

---

## Phase 3 Exit Criteria

Phase 3 planning exits when:

- Product architecture is documented.
- User journeys are documented.
- SPFx shell design spec is documented.
- UI doctrine and benchmark mapping is complete.
- Backend/service contract design is documented.
- Admin workflow/readiness model is documented.
- Site Health/drift/repair operating model is documented.
- Interface assumptions are reconciled after Phase 2 Step 4/5.
- Open decisions are either closed, deferred, or explicitly carried forward.
- Implementation prompts are gated and sequenced.
- No implementation has occurred before authorization.

## Phase 3 Concurrent-Readiness Status

**READY for planning-only work.**

**Implementation remains blocked.**

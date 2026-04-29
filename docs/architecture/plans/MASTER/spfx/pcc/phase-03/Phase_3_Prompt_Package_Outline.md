# Phase 3 Prompt Package Outline

## Purpose

Define a staged prompt sequence for Project Control Center Phase 3 that allows safe planning work to proceed while Phase 2 provisioning continues, while preventing premature SPFx/backend/provisioning/tenant implementation.

---

## Prompt 1 — Phase 3 Concurrent Readiness Audit and Boundary Documentation

### Objective

Conduct an exhaustive repo-truth audit and create Phase 3 boundary documentation that determines what can proceed while Phase 2 remains active.

### Allowed Files

- `docs/architecture/blueprint/sp-project-control-center/phase-3/**`
- Optional small cross-link in `docs/architecture/blueprint/sp-project-control-center/README.md`

### Forbidden Files

- `apps/**`
- `backend/**`
- `packages/**`
- `tools/**`
- `.github/**`
- SPFx manifests
- package manifests
- deployment scripts
- tenant/provisioning scripts

### Dependency Gate

Concurrent-safe now.

### Validation Expectation

- `git status --short`
- Documentation-only; no build/typecheck required if no code changed.
- If repo-standard Markdown check exists, run it; otherwise state none was found.

### Required Closeout

- Commit summary.
- Commit description.
- Validation results.
- Phase 3 concurrent-readiness status.
- Recommended next prompt.

---

## Prompt 2 — PCC Product Architecture and User Journey Blueprint

### Objective

Define the PCC product architecture, user journeys, role-based operating model, and project-team daily-use experience without implementing UI or services.

### Allowed Files

- `docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Open_Decision_Register.md` if needed

### Forbidden Files

- `apps/**`
- `backend/**`
- `packages/**`
- `tools/**`
- tenant/provisioning scripts
- package/version files

### Dependency Gate

Concurrent-safe now.

### Validation Expectation

- Documentation-only validation.
- No code build/typecheck unless accidental code changes occur.
- Confirm no implementation files changed.

### Required Closeout

- Product architecture summary.
- User journeys documented.
- Open decisions.
- Blockers.
- Recommended next prompt.

### Required Content

- Project Home purpose.
- Role-based journeys for PX, PM, Superintendent, Project Accountant, Safety/QAQC, IT/Admin, and Executive Oversight.
- Daily-use workflow narrative.
- Work Center Navigation model.
- Settings, Team & Access, Document Control, Site Health, Action Center, and Readiness surface roles.
- Missing/incomplete provisioning state expectations.

---

## Prompt 3 — PCC SPFx Shell Design Spec, Planning Only

### Objective

Create a planning-only SPFx shell design specification for the PCC, mapping required shell regions and states to repo UI doctrine and SPFx surface standards.

### Allowed Files

- `docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_SPFX_Shell_Design_Spec.md`
- Optional scorecard mapping doc under the same folder

### Forbidden Files

- `apps/project-control-center/**`
- `apps/hb-webparts/**`
- `apps/hb-homepage/**`
- `packages/**`
- SPFx manifests
- package files
- CSS/TS/TSX implementation files

### Dependency Gate

Concurrent-safe now as planning only.

### Validation Expectation

- Confirm no code files changed.
- Confirm no SPFx manifest/version changes.
- Documentation-only validation.

### Required Closeout

- Shell design summary.
- Doctrine mapping summary.
- Breakpoint/state model summary.
- Implementation blockers.
- Recommended next prompt.

### Required Content

- Project Hero / Identity Header.
- Priority Actions Rail.
- Today / This Week.
- Readiness cards.
- My Responsibilities.
- Work Center Navigation.
- Site Health indicator.
- Control Center Settings entry.
- Team & Access entry.
- Preview/fallback/incomplete-provisioning states.
- Breakpoint matrix.
- Accessibility expectations.
- Host-fit requirements.
- Scorecard target.

---

## Prompt 4 — PCC Backend / Service Contract Design, Planning Only

### Objective

Design the future backend/service contract concept for PCC read models, readiness, Site Health, admin workflow, and manifest proof consumption without implementing routes/services/DTOs.

### Allowed Files

- `docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Backend_Service_Contract_Design.md`
- Optional interface assumptions register under the same folder

### Forbidden Files

- `backend/**`
- `packages/**`
- `apps/**`
- `.github/**`
- scripts
- deployment files
- config files

### Dependency Gate

Concurrent-safe as planning, but final API/DTO shape depends on Phase 2 Step 4/5.

### Validation Expectation

- Confirm no backend code changed.
- Confirm no package/model files changed.
- Documentation-only validation.

### Required Closeout

- Backend contract concept summary.
- Interface assumptions.
- Phase 2 dependencies.
- Open decisions.
- Recommended next prompt.

### Required Content

- Future route families, as concepts only.
- Project Profile read model.
- Module Registry read model.
- Readiness summary read model.
- Site Health read model.
- Team & Access workflow boundary.
- Manifest proof summary concept.
- Evidence/audit model concept.
- Auth and role assumptions.
- No-executor boundary.

---

## Prompt 5 — PCC Admin / Workflow / Readiness Model

### Objective

Define admin/control-plane workflows for preview, approval, dry-run evidence, non-production readiness, Site Health escalation, drift/repair requests, and operator review.

### Allowed Files

- `docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Admin_Workflow_Readiness_Model.md`
- Optional readiness matrix under the same folder

### Forbidden Files

- `backend/**`
- `apps/**`
- `packages/**`
- `tools/**`
- `.github/**`
- tenant/provisioning scripts

### Dependency Gate

Concurrent-safe as planning only.

### Validation Expectation

- Confirm documentation-only changes.
- No code build/typecheck required.

### Required Closeout

- Admin workflow summary.
- Readiness gate summary.
- Phase 2 dependencies.
- Open decisions.
- Recommended next prompt.

### Required Content

- Operator preview flow.
- Human approval checkpoint.
- Dry-run proof review.
- Non-production apply gate.
- Evidence review model.
- Site Health escalation.
- Drift classification.
- Repair request model.
- Production-blocked status.

---

## Prompt 6 — Phase 3 Implementation Gate Review After Phase 2 Step 4 or Step 5

### Objective

Re-audit Phase 2 outputs after Step 4 or Step 5 to determine whether any Phase 3 implementation may begin.

### Allowed Files

- `docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Implementation_Gate_Review.md`
- Updates to existing Phase 3 docs only if needed

### Forbidden Files

- Implementation files unless the gate explicitly authorizes a later prompt
- Tenant/provisioning scripts
- Deployment workflows
- SPFx manifests
- package versions

### Dependency Gate

Phase 2 Step 4 or Step 5 dependent.

### Validation Expectation

- Inspect Phase 2 dry-run/proof/mutation output.
- Confirm whether assumptions remain valid.
- Confirm no implementation changes.
- Documentation validation only.

### Required Closeout

- Gate decision: Ready / Not Ready.
- Interfaces stabilized.
- Interfaces still unstable.
- Implementation blockers.
- Recommended implementation or follow-up planning prompt.

### Required Content

- Phase 2 proof semantics review.
- Mutation/executor boundary review.
- Manifest consumer stability review.
- SPFx consumption gate.
- Backend consumption gate.
- Tenant gate.
- Procore gate.

---

## Prompt 7 — PCC SPFx Shell Scaffold

### Objective

Create the initial PCC SPFx shell scaffold only after implementation gates close.

### Allowed Files

To be determined during Prompt 6.

Likely future targets:

- `apps/project-control-center/**`
- Shared UI package files only if explicitly authorized

### Forbidden Files

Until gate closure:

- all implementation files

After gate closure, still forbidden:

- backend executor
- tenant mutation
- direct Graph/PnP mutation from SPFx
- direct Procore calls
- Procore secrets
- production deployment

### Dependency Gate

Phase 2 closeout dependent unless explicitly approved after Prompt 6.

### Validation Expectation

- Build/typecheck/test scope to be defined by implementation prompt.
- SPFx manifest/version rules to be defined before code changes.
- Doctrine and breakpoint evidence required.

### Required Closeout

- Files changed.
- Validation commands.
- Remaining gaps.
- No tenant/provisioning mutation confirmation.
- Recommended next prompt.

---

## Prompt 8 — PCC Backend Read-Model Scaffold

### Objective

Create backend read-model route/service scaffold after proof and mutation boundaries are stable.

### Dependency Gate

Phase 2 Step 5/6 dependent.

### Forbidden Scope

- executor implementation unless separately authorized
- tenant mutation
- production rollout
- Procore runtime

---

## Prompt 9 — PCC Site Health / Drift Read Model

### Objective

Create read-only Site Health and drift-status backend/SPFx integration after post-provision validation posture is stable.

### Dependency Gate

Phase 2 Step 6 dependent.

### Forbidden Scope

- automated repair
- tenant mutation
- production rollout

---

## Prompt 10 — Non-Production Rollout Proof Package

### Objective

Plan and execute non-production rollout proof only after Phase 2 closeout authorizes execution.

### Dependency Gate

Phase 2 closeout dependent.

### Forbidden Scope

- production rollout
- Procore runtime
- broad tenant mutation outside non-production target

---

## Prompt 11+ — Production Rollout

### Objective

Production rollout planning/execution only after non-production evidence, operator approval, support model, security review, and all production gates close.

### Dependency Gate

Production-blocked until separately approved.

### Forbidden Scope

- unapproved tenant mutation
- unapproved Procore runtime
- direct SPFx provisioning
- direct SPFx-to-Procore calls

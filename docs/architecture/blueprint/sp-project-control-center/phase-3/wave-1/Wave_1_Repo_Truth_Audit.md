# Phase 3 Wave 1 — Repo-Truth Re-Audit

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_01_Wave_1_Repo_Truth_Audit_and_Scope_Lock.md`

## Purpose

This audit re-checks repo truth before Wave 1 (PCC Shared Foundations) code work, per the explicit re-check requirement in Prompt 01. It does not implement code. It is the formal companion to `Wave_1_Scope_Lock.md` in this same directory.

It supersedes the prior `00_Repo_Truth_Audit_Summary.md` (in `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/`) only with respect to the Phase 3 directory mismatch. All other findings in that summary remain authoritative and are cross-referenced rather than duplicated here.

## Evidence Discipline

This audit distinguishes:

- **Committed live repo evidence** — files committed to `main` and reflected in `git log`.
- **Local working-tree evidence** — files present on the working tree but currently untracked (have not yet entered repo-truth via commit).

Where this distinction matters, it is called out explicitly. Working-tree evidence is not a substitute for committed repo truth.

## Re-Audit Delta vs. Prior Audit

### Prior audit finding

`00_Repo_Truth_Audit_Summary.md` recorded that the requested exact Phase 3 planning directory and files were **not** present on `main` during package generation:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
docs/architecture/blueprint/sp-project-control-center/phase-3/04_PCC_Admin_Workflow_Readiness_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/06_Phase_3_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Human_Decision_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Interface_Assumptions.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Open_Decisions.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

### Current re-audit finding

These files are **present on the local working tree** (verified by directory listing) but are **untracked** (verified by `git status --short` showing the parent directory as `??`). They have not yet been committed to `main`.

The same applies to the Wave 1 prompt package itself:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/**         (untracked)
docs/architecture/plans/MASTER/spfx/pcc/phase-02/**         (untracked)
```

### Resolution posture

- The mismatch flagged in the prior audit is operationally resolved at the working-tree level: the planning artifacts now exist in the canonical Phase 3 blueprint location.
- The mismatch is **not yet resolved at committed-`main` repo-truth level** until those files are committed.
- This re-audit treats the working-tree files as **authoritative for planning intent** (because the user confirmed them and they are in the canonical path) but explicitly flags that they remain untracked.
- Prompt 01 itself only authors the two Wave 1 documentation artifacts under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/`. It does not commit, modify, or relocate any of the pre-existing untracked Phase 3 or Wave 1 prompt-package files.

## Audit Sources Inspected

### Committed-`main` evidence

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-0/**`
- `docs/architecture/blueprint/sp-project-control-center/phase-1/**`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/**`
- `packages/project-site-template/**`
- `packages/project-site-provisioning/**`
- `packages/models/**` (canonical shared model package; backend-consumed)
- `backend/functions/README.md`, `backend/functions/package.json`

### Local working-tree (untracked) evidence

- `docs/architecture/blueprint/sp-project-control-center/phase-3/**`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/**` including `wave-01/**`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-02/**`

### Targeted searches performed

The keyword set in Prompt 01 was inspected against the source directories above (PCC, Project Control Center, phase-3, Wave 1, Shared Foundations, ProjectProfile, PccUserRole, PccWorkCenter, PriorityAction, WorkflowModule, WorkflowItem, BusinessAuditEvent, ApprovalCheckpoint, ExternalSystemLink, SiteHealthSummary, Document Control Center, project-site-template, project-site-provisioning, manifest, dry-run, mutation, no mutation, provisioning, read model, role gate, admin, control plane, evidence, audit, readiness, site health, drift, repair, Procore, Sage, Compass, Document Crunch, Cupix, SharePoint, OneDrive, Teams, SPFx, ui-kit, fixture, mock, feature flag).

## Repo-Truth Confirmations

The following findings from `00_Repo_Truth_Audit_Summary.md` were re-confirmed and remain authoritative for Wave 1:

1. **PCC source-of-truth posture** — The Standard Project Site Template Contract is the implementable source of truth; the Target Architecture Blueprint is the strategic source. Future SPFx PCC shell belongs at `apps/project-control-center/`; future provisioning execution belongs under `backend/functions/`.
2. **Phase 1 boundary** — `@hbc/project-site-template` is schema/contract/validation-only and must remain so. It must not become a runtime/shared TypeScript model package and must not introduce SPFx, backend, Graph, PnP, tenant mutation, Procore runtime, or secrets.
3. **Phase 2 boundary** — `@hbc/project-site-provisioning` is a deterministic mapper/planner/proof package. It produces mutation-locked manifests and dry-run proof; it has no tenant mutation, no Graph/PnP, no SPFx runtime, no Procore runtime. Future executor adapter belongs under `backend/functions/`, not inside this package.
4. **Shared model package** — `@hbc/models` is the repo's canonical shared TypeScript model package. It uses domain folders under `packages/models/src/<domain>/`, exports through `packages/models/src/index.ts`, has package-local `build`/`check-types`/`lint`/`test`, and is consumed by `backend/functions`. It is the best current candidate for PCC shared foundations.
5. **Existing role/audit patterns** — `packages/models/src/auth/ProjectRoles.ts` (project-scoped role types/registries) and `packages/models/src/audit/IAuditRecord.ts` (generic audit record) are reusable patterns; PCC-specific business workflow types must not silently overwrite or reinterpret existing project enums.
6. **Existing project status enum conflict** — `packages/models/src/project/ProjectEnums.ts` `ProjectStatus` (`Active`, `OnHold`, `Completed`, `Cancelled`) does not align with the PCC contract values (`Active`, `On Hold`, `Closed`, `Archived`). Wave 1 must define PCC-specific project status types in a PCC namespace; it must not modify the legacy enum casually.
7. **Backend-safe shared boundary** — `backend/functions` already imports `@hbc/models`. Wave 1 PCC models must remain safe for backend consumption.
8. **SPFx-safe shared boundary** — Wave 1 shared models must not import `@microsoft/sp-*`, PnP packages, Azure SDK packages, backend runtime packages, Procore SDKs/HTTP clients, or tenant-specific runtime configuration.
9. **Fixture and no-mutation patterns** — `@hbc/project-site-template` uses validation fixtures; `@hbc/project-site-provisioning` uses deterministic proof fixtures and no-mutation scan utilities. PCC fixtures should live beside PCC shared models. Importing `@hbc/project-site-provisioning` directly into PCC shared models is **not** recommended (would invert the allowed dependency direction).

## New Findings From This Re-Audit

1. **Phase 3 working-tree corpus is consistent with the Wave 1 prompt package.** The untracked Phase 3 deliverables (`01_…` through `07_…`, plus `Register_*` files) align in scope and language with the Wave 1 prompt sequence and registers under `plans/MASTER/spfx/pcc/phase-03/wave-01/`. There is no observed contradiction between them.
2. **Phase 3 docs remain documentation-only.** Nothing in the working-tree Phase 3 corpus authorizes shell, backend, provisioning executor, tenant mutation, Graph/PnP, Procore runtime, or production rollout work. Phase 3 sequencing in `05_Phase_3_Development_Roadmap_Updated.md` and `07_Phase_3_Module_Implementation_Plan.md` continues to require: implementation gate review → shared foundations → SPFx shell frame → backend read-model foundation → module-by-module implementation → hardening.
3. **Wave 1 boundary remains the same.** Wave 1 is shared foundations (pure TypeScript models, registries, fixtures, flags, guard tests) inside `@hbc/models`. No Wave 2+ work begins under Wave 1.
4. **No forbidden surface change has been introduced on the working tree by Wave 1 planning so far.** No `apps/**`, `backend/functions/**`, `packages/**`, `tools/**`, `infra/**`, `.github/**`, manifest, version, or CI/CD changes are observed in the untracked Wave 1 / Phase 3 working-tree set.

## Evidence vs. Recommendation

| Item | Evidence | Recommendation |
|---|---|---|
| Phase 3 planning corpus location | Working-tree present at `docs/architecture/blueprint/sp-project-control-center/phase-3/`; untracked. | Treat as authoritative for planning; commit when the user is ready. Do not block Wave 1 scope-lock authoring on commit state. |
| Wave 1 prompt package location | Working-tree present at `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/`; untracked. | Treat as the canonical Wave 1 prompt sequence; commit when the user is ready. Do not relocate. |
| Shared model home for PCC | `@hbc/models` exists, is backend-consumed, and matches the existing domain-folder pattern. | Lock `packages/models/src/pcc/` as the Wave 1 model home (see `Wave_1_Scope_Lock.md`). |
| PCC `ProjectStatus` values | Repo `ProjectStatus` enum diverges from PCC contract values. | Define PCC-namespaced status type; do not mutate legacy enum. |
| No-mutation guard | `@hbc/project-site-provisioning` is the existing reference implementation; depending on it from `@hbc/models` would invert direction. | Use a pure local guard inside `@hbc/models`. |
| Wave 2+ readiness | Phase 3 roadmap explicitly sequences shell/backend/module/hardening after foundations. | No Wave 2+ work under Wave 1. |

## Uncertainty Statements

- **Commit timing of the untracked Phase 3 / Wave 1 corpus is not decided here.** When and how those untracked files are committed to `main` is a user decision outside Prompt 01.
- **Wave 1 code authorization is not granted by this audit.** This document records readiness; it does not authorize Prompts 02–07 to write code (see `Wave_1_Scope_Lock.md` and `Wave_1_Open_Decision_Register.md` W1-ODR-009).
- **Repo-formatting expectations for new Markdown** were not affirmatively verified beyond `pnpm format:check` availability; if `pnpm format:check` is required for new docs and not run, formatting compliance is unverified.

## Cross-References

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/00_Repo_Truth_Audit_Summary.md` — prior audit basis; remains authoritative outside the Phase 3 mismatch resolved here.
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/README.md` — Wave 1 prompt-package overview.
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_01_Wave_1_Repo_Truth_Audit_and_Scope_Lock.md` — the executing prompt.
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md` — open decisions.
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md` — validation expectations per Wave 1 prompt.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Scope_Lock.md` — companion scope lock.

# Prompt 02 — Governing Blueprint / Roadmap Docs Update

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to update governing PCC documentation so Phase 3 / Wave 10 is consistently defined as the unified **Permit & Inspection Control Center**.

## Global Guardrails

- Do not re-read files that are still within current context or memory.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless explicitly authorized and consistent with repo governance.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package or deploy SPFx.
- Do not mutate tenant or external systems.
- Do not introduce secrets/app settings.
- Do not perform live AHJ, Procore, Microsoft Graph, Adobe, Document Crunch, Sage, Compass, or other external operations.
- Use targeted docs validation first.
- Keep AHJ interactions to launcher links only unless a later implementation phase explicitly authorizes more.
- Preserve workbook source traceability.
- Preserve Wave 10 relationship to Wave 8 Project Readiness and Wave 14 Approvals / Checkpoints.
- Preserve repo-truth citations and actual file paths.


## Required Inputs

Use the completed Prompt 01 repo audit and workbook extraction. Do not re-read files that are still within current context or memory.

Use the target architecture from:

- this package: `04_COMPLETE_Target_Architecture_Permit_Inspection_Control_Center.md`

## Files Likely In Scope

- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`

## Required Updates

- Replace narrow user-facing `Permit Log` posture with `Permit & Inspection Control Center`.
- Preserve internal/source-family recognition of `permits` and `required-inspections`.
- Document unified command-center posture.
- Document AHJ launcher-only posture.
- Document Procore launcher/reference-only posture.
- Document fee exposure fields:
  - `applicationValue`
  - `permitFee`
  - `reInspectionFee`
- Document permit `revision`.
- Document failed inspection and reinspection workflow.
- Document evidence-backed closeout.
- Document Project Readiness, Priority Actions, Approvals / Checkpoints, HB Document Control Center, and External Systems integration posture.
- Do not imply runtime implementation.

## Validation

Run targeted docs validation:

```bash
git diff --check
pnpm exec prettier --check <touched markdown files>
md5 pnpm-lock.yaml
git status --short
```

## Commit Format

Commit summary:

```text
docs(pcc): refine wave 10 permit and inspection planning
```

Commit description:

```text
Updates governing PCC Phase 3 documentation to redefine Wave 10 as the unified Permit & Inspection Control Center.

Replaces the prior narrow Permit Log posture with a permit lifecycle, required inspection readiness, AHJ launcher, fee exposure, failed/reinspection workflow, evidence-backed closeout, Priority Actions, Project Readiness, and Approvals / Checkpoints architecture.

Documentation-only. No source code, package, lockfile, manifest, deployment, tenant, AHJ, Procore, Microsoft Graph, SharePoint mutation, or external-system runtime changes.
```

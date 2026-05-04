# Documentation Update Map — Estimating Workbench

## New Directory

```text
docs/architecture/blueprint/sp-project-control-center/estimating-workbench-developer-contracts/
```

## Existing Docs To Amend

- `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
  - Add Estimating Workbench as an MVP SharePoint/SPFx PCC module mounted under Project Readiness.
- `Unified_PCC_Lifecycle_Objective_Architecture.md`
  - Add estimate intent, bid leveling, cost-code mapping, assumptions/exclusions, and handoff snapshots as lifecycle continuity inputs.
- `System_of_Record_Matrix.md`
  - Add Estimating Workbench PCC-native ownership rows, source-lineage rows, future Sage mapping rows, and no-writeback boundaries.
- `Standard_Project_Site_Template_Contract.md`
  - Add SharePoint/PCC central estimating data site projection and project-site surface references.
- `phase-3/Register_MVP_Scope.md`
  - Move Estimating Workbench from later/turnover-only posture into MVP scope amendment.
- `phase-3/Register_Workflow_Module_Register.md`
  - Add `Estimating Workbench` as MVP; retain `Estimating Kickoff` and `Post-Bid Autopsy` as companion/future workflows unless repo truth requires differently.
- `phase-3/05_Phase_3_Development_Roadmap_Updated.md`
  - Add Estimating Workbench documentation/implementation wave after existing readiness foundation and before downstream buyout/handoff hardening where appropriate.
- `phase-3/07_Phase_3_Module_Implementation_Plan.md`
  - Add developer-ready wave plan with allowed paths, gates, and validation.

## Existing Source Files To Reference But Not Edit In This Documentation Package

- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/PccModuleFlags.ts`
- `packages/models/src/pcc/PccMvpSurfaces.ts`
- `apps/project-control-center/package.json`
- `package.json`

Any TypeScript/model/package change belongs to a later implementation prompt, not this documentation update package.

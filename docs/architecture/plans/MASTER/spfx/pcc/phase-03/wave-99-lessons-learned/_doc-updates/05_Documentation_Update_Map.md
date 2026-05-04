# Documentation Update Map — Estimating Workbench
## Wave 13G Authority Lock

All Estimating Workbench documentation, UX/wireframe framing, dependency evaluation, model contracts, SharePoint schema contracts, SPFx surface contracts, read-model/command contracts, test gates, and subsequent runtime implementation prompts are governed under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

The wireframe authority path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The developer-contract target path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

This Wave 13G authority supersedes any earlier implication that Estimating Workbench implementation work should move to a separate future wave. Future implementation may be split into 13G sub-prompts or phases, but it remains under Wave 13G unless a later approved architecture decision explicitly supersedes this path.

Wave 13G documentation and prompts do not, by themselves, authorize production rollout, tenant mutation, package installation, lockfile mutation, Procore/Sage writeback, or active project workbook import.

## Wave 13G Target Paths

| Artifact Family | Required Repo Path |
| --- | --- |
| Wave authority root | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/` |
| Wireframes | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/` |
| Developer contracts | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/` |
| Machine-readable references | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/reference/` |
| Prompt closeouts | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/closeouts/` |

All generated documentation and implementation prompts must use these paths. Do not create a parallel `wave-99-estimating-workbench`, top-level `estimating-workbench-developer-contracts`, or separate future wave for Estimating Workbench unless a later approved authority update supersedes Wave 13G.


## New Directory

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
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

Any TypeScript/model/package change belongs to a scoped Wave 13G runtime implementation prompt, not this documentation-only update package.

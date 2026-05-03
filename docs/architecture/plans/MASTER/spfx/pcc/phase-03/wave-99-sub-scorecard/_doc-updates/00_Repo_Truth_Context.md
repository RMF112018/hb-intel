# 00 — Repo Truth Context

Generated: 2026-05-03

## Scope

This file summarizes the repo-truth assumptions that the local code agent must verify before updating documentation.

## Required Local Verification

The local agent must run from:

`/Users/bobbyfetting/hb-intel`

Required commands before editing:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

If the worktree is dirty, stop and report the dirty files before editing.

## Current Architecture Context to Re-Verify

The prior audit found:

- `packages/models/src/pcc/PccWorkCenters.ts` includes `subcontractor-performance` as a work center.
- `subcontractor-performance` is currently marked `mvpTier: 'Later'`.
- Current primary users are `project-manager` and `project-executive`.
- Current Phase 3 MVP surfaces do not include a Subcontractor Performance surface.
- Current PCC backend read-model response map and route family do not include Subcontractor Scorecard or Subcontractor Performance routes.
- Existing PWA/Project Hub scorecard files may exist, but they are not the controlling PCC target architecture.

The agent must verify these files before writing documentation:

```text
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/PccReadModels.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
```

## Source Workbook

The source workbook for this package is:

`docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx`

The workbook must be re-extracted from the live repo, not from a stale chat attachment.

Known workbook sheets:

- `Scorecard`
- `Aggregation Dashboard`

Known workbook scoring categories:

- Safety & Compliance — 20%
- Quality of Work — 20%
- Schedule Performance — 20%
- Cost Management — 15%
- Communication & Management — 15%
- Workforce & Labor — 10%

## Target Documentation Path

Create future-workstream architecture documentation under:

`docs/architecture/blueprint/sp-project-control-center/future-workstreams/subcontractor-scorecard/`

Do not edit `docs/architecture/plans/**` unless explicitly authorized by Bobby in a separate instruction.

## Guardrail Baseline

Documentation update only. Do not touch:

- runtime code;
- package manifests;
- `pnpm-lock.yaml`;
- SPFx manifests;
- GitHub workflows;
- backend runtime route registrations;
- app navigation code;
- Microsoft Graph / SharePoint / Procore / Sage / Compass runtime integrations;
- deployment artifacts.

# 00 — Repo Truth Context

## Known Repo Truth From Prior Inspection

The package assumes the following repo-truth baseline, which the local agent must re-verify before making documentation changes:

- `subcontractor-performance` and `lessons-learned` already exist as PCC work centers.
- Both are currently treated as **Later** / future scope, not current Phase 3 MVP runtime surfaces.
- Current PCC MVP navigation/read-model families do not expose a full Lessons Learned module.
- Existing workflow module registry references only narrow lessons-related scope, such as `post-bid-autopsy`, and does not define the comprehensive Lessons Learned Center target architecture.
- The canonical `System_of_Record_Matrix.md` governs Procore, Sage, PCC, SharePoint/Microsoft 365, evidence link, and source-lineage ownership.
- The repo-resident workbook path is expected to be:
  `docs/reference/example/07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx`
- A related source workbook for Subcontractor Scorecard exists at:
  `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx`
- The Lessons Learned Center should reference Subcontractor Performance only through approved cross-module read-model signals, not by merging the modules.

## Required Local Re-Verification Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/WorkflowModules.ts
docs/reference/example/07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx
docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx
```

## Repo-Truth Resolution Required

Use this closed decision unless repo truth has already changed through an accepted commit:

> Lessons Learned Center is a future PCC workstream and Later work center that must be documented now as a PCC-native lifecycle knowledge and continuous-improvement system. It is not a Phase 3 MVP runtime implementation unless the roadmap has been formally updated.

## Documentation Location Decision

Create the new architecture package under:

```text
docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/
```

Do not create a Phase 3 wave directory for Lessons Learned unless repo truth already contains a formal wave assignment.

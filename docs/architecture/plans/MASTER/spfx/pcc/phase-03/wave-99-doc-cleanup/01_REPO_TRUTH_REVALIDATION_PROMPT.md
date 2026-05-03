# 01 — Repo-Truth Revalidation Prompt

## Objective

Perform a local repo-truth revalidation before any documentation edits. This prompt is read-only except for optional notes in your own scratch context.

## Required Commands

From `/Users/bobbyfetting/hb-intel`, run and capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required File Inspection

Inspect, but do not edit, the current PCC governing docs:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

Inspect relevant model/code seams for orientation only. Do not edit:

```text
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/LifecycleReadiness.ts
packages/models/src/pcc/ConstraintsLog.ts
apps/project-control-center/src/shell/
apps/project-control-center/src/api/
backend/functions/src/hosts/pcc-read-model/
```

## Required Questions to Answer in Your Plan

Before editing, report:

1. Current branch.
2. Current HEAD.
3. Whether worktree is clean.
4. Baseline `pnpm-lock.yaml` MD5.
5. Whether any user-owned changes exist.
6. Whether governing docs still reflect the audit finding that PCC is one unified project operating layer.
7. Whether any doc status language is stale against the latest Phase 3 wave reality.
8. Whether the code/model seams still distinguish:
   - surfaces,
   - work centers,
   - workflow modules.
9. Whether Constraints Log and Buyout Log still show the governance-vs-affinity ambiguity observed in the audit.
10. Whether any new docs already exist for the unified lifecycle architecture.

## Proceed / Stop Rules

Stop and ask for direction only if:
- the worktree contains unrelated user-owned changes that overlap target docs;
- `pnpm-lock.yaml` already changed before you start;
- the target docs appear missing or moved;
- the repo is not on the expected branch and the user has not authorized proceeding.

Otherwise, proceed to Prompt 02.

## Deliverable

A short local plan summary with:
- baseline command results,
- local-risk notes,
- files to be created/edited in Prompts 02–06,
- confirmation that no runtime files have been edited.

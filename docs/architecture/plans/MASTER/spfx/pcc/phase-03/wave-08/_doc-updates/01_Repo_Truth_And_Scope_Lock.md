# Prompt 01 — Repo Truth and Wave 8 Scope Lock

## Role

You are a senior repo-truth auditor and implementation-planning agent working in the local repo:

```text
/Users/bobbyfetting/hb-intel
```

Your objective is to verify current repo truth and lock the exact scope for a documentation-first Wave 8 correction pass.

## Critical instruction

Do not re-read files that are still within your current context or memory. Use the files already open/in context first, then inspect only what is necessary to verify current repo truth or make a safe edit.

## Objective

Confirm that **PCC Phase 3 / Wave 8** is defined as the **Project Readiness Module Framework** and that the documentation/persona vocabulary requires correction before implementation.

This prompt performs audit and planning only. Do not edit files in this prompt unless you identify a blocking inconsistency that must be documented in your plan for the next prompt.

## Required repo checks

Run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20 --decorate
md5 pnpm-lock.yaml
```

Capture:
- current branch;
- current HEAD;
- recent PCC commits;
- working-tree state;
- whether unrelated changes exist;
- current `pnpm-lock.yaml` checksum.

If unrelated changes exist, do not overwrite them. Identify them and proceed only with non-conflicting edits in later prompts.

## Files to inspect

Inspect only as needed:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/auth/ProjectRoles.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/WorkflowItems.ts
packages/models/src/pcc/PccReadModels.ts
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
```

If `phase-3/wave-8/` does not exist, note that it should be created in Prompt 02 as a blueprint documentation folder, not under `docs/architecture/plans/**`.

## Verify these repo-truth points

1. Wave 8 current name and scope.
2. Relationship between:
   - Wave 8 — Project Readiness Module Framework;
   - Wave 9 — Job Startup Checklist / Lifecycle Checklist;
   - Wave 10 — Permit Log;
   - Wave 11 — Responsibility Matrix / RACI;
   - Wave 12 — Constraints Log;
   - Wave 13 — Buyout Log;
   - Wave 14 — Approvals / Checkpoints.
3. Whether current docs treat Wave 8 as a reusable framework or too narrowly as a generic workflow item framework.
4. Whether existing `project-readiness` surface is still preview/static.
5. Whether existing PCC persona set lacks roles required by the Wave 8 objective.
6. Whether existing `ProjectRole` should remain unchanged.
7. Whether docs currently mention Project Readiness Center / Framework consistently.

## Scope decision to document

Prepare a brief plan stating:

- documentation files to update;
- persona model file to update;
- tests/checks to run;
- explicit exclusions.

## Required conclusion

End this prompt with a concise plan for Prompts 02–04. Do not commit.

## Forbidden changes

- Do not edit `docs/architecture/plans/**`.
- Do not implement readiness runtime code.
- Do not create backend routes.
- Do not change `pnpm-lock.yaml`.
- Do not introduce dependencies.
- Do not mutate external systems.

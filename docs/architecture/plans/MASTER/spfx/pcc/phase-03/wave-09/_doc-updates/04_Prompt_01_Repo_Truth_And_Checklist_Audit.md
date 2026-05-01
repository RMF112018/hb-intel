# 04 — Prompt 01: Repo Truth and Checklist Audit — No Writes

## Role

You are a local code agent in `/Users/bobbyfetting/hb-intel`. Perform a no-write audit to prepare a Wave 9 documentation update.

## Objective

Confirm current repo truth, inspect checklist-definition files, identify where Wave 9 is currently defined, and produce a precise edit plan. Do not modify files in this prompt.

## Instructions

Do not re-read files that are still within your current context or memory. Read only the files necessary to verify current repo truth and avoid stale assumptions.

## Commands

Run:

```bash
pwd
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --short
find docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files -maxdepth 2 -type f | sort
```

Then inspect these files if present:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/
```

## Audit Questions

Answer:

1. What branch and HEAD are you on?
2. Are there unrelated working-tree changes?
3. Where is Wave 8 currently defined?
4. Where is Wave 9 currently defined?
5. Does Wave 9 still say `Job Startup Checklist`, `Project Startup Checklist`, or something else?
6. Does any doc already reference startup + safety + closeout together?
7. Do the checklist-definition files include all three families?
8. Do machine-readable item files exist?
9. What files should be edited?
10. What files should remain read-only?
11. Are there contradictions between planning, blueprint, roadmap, and registers?
12. Are plan-library writes blocked by repo governance?

## Required Output

Produce an audit report with:

- repo state;
- checklist-definition files found;
- item-family coverage;
- current Wave 9 definition;
- contradictions;
- proposed file edit list;
- proposed file read-only list;
- recommended exact module name;
- risk/guardrail list;
- validation commands to run after edits.

Do not write files. Do not commit.

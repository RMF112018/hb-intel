# Prompt 01 — Repo Audit and Workbook Traceability

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to perform a read-only repo-truth audit and workbook-source extraction before any documentation edits for Phase 3 / Wave 11 — Responsibility Matrix.

## Global Guardrails

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless the user explicitly authorizes canonical plan-library edits.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package, deploy, or upload SPFx packages.
- Do not mutate a tenant, SharePoint site, Microsoft Graph object, Procore project, Sage record, AHJ portal, or any external system.
- Do not introduce secrets, app settings, environment variables, CI/workflow changes, deployment manifests, package manifests, or production rollout instructions.
- Keep the work documentation-only unless a later prompt explicitly authorizes runtime implementation.
- Preserve Wave 8 Project Readiness Module Framework boundaries and Wave 14 Approvals / Checkpoints ownership.
- Preserve Team & Access, HB Document Control Center, Priority Actions, External Systems, and Project Readiness integration seams without claiming runtime execution.
- Preserve workbook source traceability for every default responsibility item.
- Treat the Responsibility Matrix workbooks as source references, not final UX constraints.
- Treat contract references as project-controls metadata, not legal interpretation.
- Explicitly prohibit contract interpretation as legal advice and automatic creation of legal obligations.
- Use targeted documentation validation. Do not run broad formatting across the repo.


## Repo-Truth Files to Inspect

At minimum, inspect:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/
apps/project-control-center/src/
backend/functions/src/hosts/pcc-read-model/
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```


## Objectives

1. Confirm current Wave 11 naming and scope in governing docs.
2. Confirm whether `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/` exists.
3. Confirm whether `packages/models/src/pcc/WorkflowModules.ts` includes `responsibility-matrix`.
4. Confirm whether any existing Wave 11 docs or code already define the Responsibility Matrix module.
5. Inspect both responsibility workbooks and confirm extraction details.
6. Create a repo-truth summary for later prompts.

## Required Repo Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Workbook Extraction Requirements

Inspect:

```text
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

Extract:

- workbook filename;
- sheet names;
- used ranges;
- merged cells;
- frozen panes;
- hidden rows/columns;
- tables;
- named ranges;
- formulas;
- displayed/cached values;
- data validations/dropdowns;
- conditional formatting;
- protection;
- header rows;
- section rows;
- default item rows;
- ambiguous rows;
- role columns;
- source assignment marks;
- notes/comments/instructions.

## Required Findings to Report

Answer:

1. How is Wave 11 named in current repo truth?
2. Does the repo call the module `Responsibility Matrix`, `RACI`, `Owner Contract Responsibility Matrix`, or another name?
3. Is it MVP scope?
4. Is it a Project Readiness workflow module?
5. Is `responsibility-matrix` already in model registry?
6. Are there existing model types, fixtures, backend routes, SPFx surfaces, or tests specific to Wave 11?
7. Which governing docs need updates?
8. Which wave-11 docs already exist?
9. Does the general workbook contain 109 active default items? If not, provide corrected count.
10. Does the owner-contract workbook contain active populated items or only placeholders/schema posture?

## Prohibited Scope

- Do not edit files.
- Do not stage or commit.
- Do not generate docs yet.

## Final Output Requirements

Return:

- repo baseline;
- workbook extraction summary;
- contradiction map;
- recommended file update list;
- exact next prompt to run.

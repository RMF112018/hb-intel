# Prompt 01 — Repo Audit and Workbook Traceability

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to perform a read-only repo-truth audit and workbook-source extraction before any documentation edits for Phase 3 / Wave 10.

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


## Objective

Confirm current repo truth and extract source-traceability facts from the permit and inspection workbooks.

## Files to Inspect

Governing docs:

- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/`

Models / source contracts:

- `packages/models/src/pcc/`
- `packages/models/src/auth/ProjectRoles.ts`

Backend / SPFx patterns:

- `backend/functions/src/hosts/pcc-read-model/`
- `backend/functions/src/services/__tests__/`
- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/api/`

Workbook references:

- `docs/reference/example/Permit_Log_Template.xlsx`
- `docs/reference/example/Inspection-Log-Template.xlsx`

## Required Audit Commands

Run read-only equivalents:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Workbook Extraction Requirements

For each workbook, extract:

- sheet names
- used ranges
- column names
- formulas
- dropdown/status values
- hidden rows/columns
- conditional formatting/status color rules
- sample rows
- required/optional fields
- date fields
- responsible-party fields
- AHJ/agency fields
- permit/inspection number fields
- fee fields
- comments/notes fields
- evidence/attachment references
- closeout/completion fields
- relationships between permit records and inspection records

## Output

Create a read-only audit summary in your response only. Do not edit files yet.

The summary must include:

- repo state
- Wave 10 current naming and contradictions
- whether Wave 10 implementation has started
- existing permit/inspection model/read-model/surface patterns
- workbook extraction summary
- missing or ambiguous workbook fields
- recommended docs to update

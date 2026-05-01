# Documentation Update Roadmap

Generated: 2026-05-01

## Objective

Update PCC Phase 3 / Wave 10 documentation to define the complete Permit & Inspection Control Center target architecture.

## Recommended Sequence

### Step 1 — Repo-Truth Baseline and Contradiction Map

Audit current repo state before edits.

Confirm:

- branch
- HEAD
- working tree status
- recent PCC commits
- Wave 10 current naming
- whether Wave 10 implementation has started
- whether permit and inspection model IDs already exist
- governing docs that still say `Permit Log`
- docs that already mention `required-inspections`

No edits in this step.

### Step 2 — Workbook Extraction and Source Traceability

Inspect:

- `docs/reference/example/Permit_Log_Template.xlsx`
- `docs/reference/example/Inspection-Log-Template.xlsx`

Extract:

- sheet names
- used ranges
- visible columns
- formulas
- validation/dropdowns
- hidden rows/columns
- conditional formatting
- sample rows
- status/result values
- date fields
- permit/inspection identifiers
- fee fields, if any
- source mapping requirements

### Step 3 — Governing Blueprint / Roadmap Update

Likely files:

- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`

Replace narrow `Permit Log` target language with unified `Permit & Inspection Control Center` language while preserving internal `permits` and `required-inspections` source families.

### Step 4 — Wave 10 Target Architecture File

Create or update:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`

This file should be based on `04_COMPLETE_Target_Architecture_Permit_Inspection_Control_Center.md` from this package.

### Step 5 — Wave 10 Scope Lock / Decision Register

Create or update:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Permit_Inspection_Control_Center_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Resolved_Decisions_Register.md`

### Step 6 — Workbook Mapping Appendix

Create or update:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Workbook_Source_Mapping.md`

Include workbook fields, target model fields, mapping classification, ambiguous fields, and source traceability rules.

### Step 7 — Validation and Closeout

Create or update:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Documentation_Closeout.md`

Closeout must confirm:

- docs-only update
- no package/dependency/lockfile changes
- no runtime implementation
- no external integrations
- workbook source traceability
- resolved decisions
- validation commands

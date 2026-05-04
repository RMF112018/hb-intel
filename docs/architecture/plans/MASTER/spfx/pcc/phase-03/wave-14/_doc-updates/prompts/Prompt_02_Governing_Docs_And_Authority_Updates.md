# Prompt 02 — Governing Docs and Authority Updates

## Objective

Update governing PCC documents so Phase 14 is positioned as the PCC-native approval/checkpoint control layer.

## Required Inputs

- Prompt 01 repo-truth note.
- `docs/01_Exhaustive_Target_Architecture.md`
- `artifacts/phase14_authority.json`
- `artifacts/documentation_update_targets.json`

## Required Updates

Update applicable governing docs:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`

## Required Content

Each amended governing doc must communicate:

- Phase 14 owns approval/checkpoint queue semantics, route steps, decisions, audit events, and decision history.
- Source modules retain ownership of underlying workflow records.
- Procore owns Procore-native records.
- Sage owns accounting book-of-record fields.
- SharePoint/Document Control own file/document storage where applicable.
- HBI has citation/summarization rights only and no decision authority.
- Power Automate is reference-only for MVP.
- No external writeback or tenant mutation is authorized.
- Wave 13G remains Estimating Workbench authority; Phase 14 governs checkpoint queue semantics.

## Forbidden

Do not implement runtime code. Do not mutate package or lock files. Do not add dependencies. Do not create tenant or deployment artifacts.

## Validation

- Validate JSON if changed.
- Run Prettier check on touched markdown/json.
- Confirm lockfile MD5 unchanged.

## Closeout

Return commit summary/description with files changed and validation evidence.

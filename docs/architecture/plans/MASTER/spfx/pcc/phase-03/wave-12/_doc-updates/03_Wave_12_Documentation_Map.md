# Wave 12 Documentation Map

## Package Purpose

This package instructs a local code agent to update the canonical PCC Phase 3 documentation for Wave 12 only. It does not implement source code.

## Proposed Canonical Documentation Files

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
  Constraints_Log_Target_Architecture.md
  Wave_12_Constraints_Log_Scope_Lock.md
  Wave_12_Risk_And_Constraint_Exposure_Model.md
  Wave_12_Workbook_Source_Mapping.md
  Wave_12_Resolved_Decisions_Register.md
  Wave_12_Documentation_Closeout.md
  reference/
    default_constraints_log_seed_structure.json
    default_constraints_log_seed_structure_schema.md
    workbook_extraction_notes.md
    risk_matrix_config_reference.json
    constraint_exposure_scoring_reference.json
    research_source_index.md
    source_research_urls.json
```

## Governing Docs to Update After Local Repo Verification

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
```

## Specific Alignment Requirements

- Replace thin "item-level constraints workflow" descriptions with "Make-Ready Constraint & Risk Exposure Center" language.
- Preserve official module name: **Constraints Log**.
- Preserve placement under **Project Readiness**.
- Record that risk assessment is embedded in Wave 12 but does not replace a full enterprise risk system.
- Record that delay/change exposure linkage does not constitute legal, claim, or entitlement determination.
- Record that workbook rows are seed/reference data only.
- Record that `constraints-log` source-code work-center placement should be reviewed in later implementation prompts if it still conflicts with governing docs.

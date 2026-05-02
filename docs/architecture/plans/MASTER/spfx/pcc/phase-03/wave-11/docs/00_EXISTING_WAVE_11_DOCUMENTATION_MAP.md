# 00 — Existing Wave 11 Documentation Map

## Canonical Wave 11 Documentation Package

Prompt 01 must inspect these files locally before implementation:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Responsibility_Matrix_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Responsibility_Matrix_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Resolved_Decisions_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Workbook_Source_Mapping.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Documentation_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items_schema.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/workbook_extraction_notes.md
```

## Governing PCC Docs to Verify

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
```

## Implementation-Relevant Repo Seams Observed by Connector

- `packages/models/src/pcc/WorkflowModules.ts already includes `responsibility-matrix` as an MVP workflow module.`
- `packages/models/src/pcc/ProjectReadinessFramework.ts already includes `responsibility-matrix` as a Project Readiness source module.`
- `packages/models/src/pcc/PccReadModels.ts defines envelope semantics and read-model response map.`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts uses registered GET-only anonymous routes wrapped with auth/telemetry.`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts assembles deterministic mock envelopes and forbids runtime Graph/PnP/SharePoint/Procore behavior in comments.`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts treats Responsibility Matrix as Wave 11 and preview-deferred in the Wave 8 readiness shell.`

## Local Revalidation Required

This file is a map, not proof. Prompt 01 must rerun repo truth locally and must stop if local repo state contradicts this map.

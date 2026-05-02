# Required Repo-Truth Files — Wave 12 Constraints Log

Prompt 01 must inspect these paths before implementation. Later prompts must rely on Prompt 01 findings and should not re-read files unnecessarily.

## Governing Docs

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Wave 8–12 Docs

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
```

## Wave 12 Required Docs

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Constraints_Log_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Constraints_Log_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Documentation_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Repo_Audit_And_Workbook_Traceability.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Resolved_Decisions_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Risk_And_Constraint_Exposure_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Workbook_Source_Mapping.md
```

## Wave 12 Reference Artifacts

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure.json
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure_schema.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/workbook_extraction_notes.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/research_source_index.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/source_research_urls.json
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/risk_matrix_config_reference.json
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/constraint_exposure_scoring_reference.json
```

## Company Workbook Source

```text
docs/reference/example/HB_ConstraintsLog_Template.xlsx
```

## Model Seams

```text
packages/models/src/pcc/
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/WorkflowModules.test.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/fixtures/
packages/models/src/pcc/index.ts
packages/models/src/index.ts
packages/models/package.json
```

## Backend Seams

```text
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/services/__tests__/
backend/functions/package.json
```

## SPFx Seams

```text
apps/project-control-center/src/api/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessViewModel.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectReadinessCard.tsx
apps/project-control-center/src/tests/
apps/project-control-center/package.json
```

## Root Scripts

```text
package.json
pnpm-lock.yaml
```

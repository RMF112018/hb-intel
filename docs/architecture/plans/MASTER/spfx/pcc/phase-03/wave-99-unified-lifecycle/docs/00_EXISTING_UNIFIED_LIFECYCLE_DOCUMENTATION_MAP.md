# Existing Unified Lifecycle Documentation Map

## Governing PCC Docs To Inspect

- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`

## Unified Lifecycle Developer Contracts

Inspect the developer-contract corpus at:

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
```

Expected key files include:

- `PCC_Unified_Lifecycle_Developer_Target_Architecture.md`
- `PCC_Bounded_Context_And_Ownership_Map.md`
- `PCC_Route_Taxonomy_And_Forbidden_Routes.md`
- `PCC_Record_State_Machines.md`
- `PCC_Field_Level_Data_Dictionary.md`
- `PCC_Permission_Redaction_Resolution_Algorithm.md`
- `PCC_HBI_Retrieval_Citation_And_Refusal_Contract.md`
- `PCC_Source_System_Integration_Contracts.md`
- `PCC_Audit_Event_Model.md`
- `PCC_Error_Degraded_State_Matrix.md`
- `PCC_Module_Onboarding_Template.md`
- `PCC_Test_Acceptance_Gates.md`
- `PCC_Live_Integration_Readiness_Gates.md`
- `PCC_Implementation_Roadmap_Update.md`
- `PCC_Documentation_Closeout_Template.md`

## Phase 3 Roadmap / Registers

- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`

## Implementation Seams To Inspect

Models:

```text
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/
packages/models/src/pcc/index.ts
packages/models/src/index.ts
```

Backend:

```text
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/hosts/pcc-read-model/read-models/
backend/functions/src/services/__tests__/
```

SPFx:

```text
apps/project-control-center/src/api/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/surfaces/unifiedLifecycle/
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/
```

## Known Architectural Decisions

- Unified lifecycle is not a shell route.
- Unified lifecycle content is surfaced inside approved PCC surfaces such as Project Home and Project Readiness.
- Leaf read-model route families may exist for `project-memory`, `project-lenses`, `project-traceability`, `warranty-trace`, `cross-project-knowledge`, and `unified-search`, but these are not separate shell workspaces.
- Ask-HBI must remain grounded, permission-filtered, citation-backed, and refusal-capable.
- Live integrations remain future-gated.

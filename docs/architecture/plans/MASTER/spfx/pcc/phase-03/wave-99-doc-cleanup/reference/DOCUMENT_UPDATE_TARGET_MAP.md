# Document Update Target Map

## New Governing Docs

Create these under:

```text
docs/architecture/blueprint/sp-project-control-center/
```

1. `Unified_PCC_Lifecycle_Objective_Architecture.md`
2. `PCC_Project_Lifecycle_Spine.md`
3. `PCC_Project_Memory_Layer.md`
4. `PCC_Role_And_Stage_Lens_Model.md`
5. `PCC_Cross_Stage_Traceability_Model.md`
6. `PCC_Company_Knowledge_Reuse_Model.md`
7. `PCC_Warranty_Traceability_Model.md`
8. `PCC_Unified_Search_And_HBI_Grounding_Model.md`

## New Closeout Doc

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Unified_Lifecycle_Documentation_Update_Closeout.md
```

## Existing Docs to Amend

At minimum:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Wave Docs to Inspect for Targeted Cross-References

Inspect and update only if needed:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/
```

## Local Code/Model Seams to Inspect Only

Do not edit:

```text
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/LifecycleReadiness.ts
packages/models/src/pcc/ConstraintsLog.ts
apps/project-control-center/src/shell/
apps/project-control-center/src/api/
backend/functions/src/hosts/pcc-read-model/
```

## Alignment Themes

Every amended doc should support these themes:

- PCC is one unified project operating layer.
- Work centers are governed domains, not departmental apps.
- Workflow modules are control patterns, not separate workspaces.
- Lenses are role/stage/task views over the same project truth.
- Project memory and lifecycle continuity prevent institutional knowledge loss.
- Traceability connects estimate/scope/vendor/product/commitment/submittal/field/closeout/warranty/lessons.
- HBI answers require source evidence.
- Closed-project knowledge reuse must be governed and permission filtered.

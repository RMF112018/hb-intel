# Existing Wave 9 Planning Documentation Map

## Governing PCC Docs

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`

## Phase 3 Docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`

## Wave 8 Dependency Docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md`
- Expected Wave 8 implementation/closeout docs under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/` after Wave 8 source work.

## Wave 9 Target Architecture Docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Item_Library_Crosswalk.md`

## Wave 9 Canonical Plan-Library Inputs

Treat these as source inputs for Wave 9 but do not casually edit `docs/architecture/plans/**` unless a prompt explicitly authorizes it.

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/_doc-updates/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/00_Documentation_Update_Package.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/01_Project_Startup_Checklist_Items.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/01_Project_Safety_Checklist_Items.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/01_Project_Closeout_Checklist_Items.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/02_Default_Item_Library.csv`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/03_Default_Item_Library.json`

## Reference Example PDFs

These establish source traceability only. Do not parse PDFs at runtime. Do not upload or embed PDFs into the SPFx UI as the Wave 9 experience.

- `docs/reference/example/Project_Startup_Checklist.pdf`
- `docs/reference/example/Project_Safety_Checklist.pdf`
- `docs/reference/example/Project_Closeout_Checklist.pdf`

## Expected Existing Source Areas

- `packages/models/src/pcc/`
- `backend/functions/src/hosts/pcc-read-model/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/projectHome/`
- `apps/project-control-center/src/surfaces/priorityActions/`
- `apps/project-control-center/src/surfaces/documents/`
- `apps/project-control-center/src/tests/`

## Repo-Truth Relationships To Preserve

- Wave 8 = Project Readiness Module Framework.
- Wave 9 = Project Lifecycle Readiness Center.
- Wave 9 depends on Wave 8 and should consume framework contracts instead of duplicating them.
- Wave 10 = Permit Log.
- Wave 11 = Responsibility Matrix / RACI.
- Wave 12 = Constraints Log.
- Wave 13 = Buyout Log.
- Wave 14 = Approvals / Checkpoints.
- HB Document Control Center remains the evidence/document source-of-record surface. Wave 9 links/references evidence posture; it does not own document storage.

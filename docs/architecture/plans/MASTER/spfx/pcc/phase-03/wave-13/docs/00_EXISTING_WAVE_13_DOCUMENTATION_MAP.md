# Existing Wave 13 Documentation Map

## Governing Docs to Inspect

- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`

## Wave 13 Blueprint Docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Buyout_Log_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Buyout_Log_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_System_Of_Record_And_Integration_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Developer_Implementation_Decisions_And_Contracts.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Workbook_Source_Mapping.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/Wave_13_Documentation_Closeout.md`

## Wave 13 Reference JSONs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/default_buyout_log_seed_structure.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/buyout_module_data_contract.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/buyout_state_machine.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/field_mutability_matrix.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/buyout_exception_reason_codes.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/fixture_scenarios.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/procore_buyout_data_mapping_reference.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/source_research_urls.json`

## Source Workbook

- `docs/reference/example/financial/Buyout Log_Template 2025.xlsx`

Workbook-source truth recorded in Wave 13 closeout and seed JSON:

- sheet: `Sheet1`
- used range: `A1:N88`
- header row: `6`
- candidate buyout rows: `8–85`
- summary rows: `86–88`
- hidden rows/columns: none
- data validations: none
- conditional formatting: none
- defined names: none

## Known Source-Model Placement Issue / Bridge

Repo truth observed during package generation:

- `packages/models/src/pcc/WorkflowModules.ts` includes `buyout-log`.
- `buyout-log` display name is `Buyout Log`.
- `buyout-log` is currently `mvpTier: 'MVP'`.
- `buyout-log` currently maps to `workCenterId: 'procurement-and-buyout'`.
- `packages/models/src/pcc/PccWorkCenters.ts` marks `procurement-and-buyout` as `mvpTier: 'Later'`.
- Wave 13 documentation positions Buyout Log as an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

Implementation posture:

1. Do not blindly remap `buyout-log`.
2. Prompt 01 must inspect current work-center, source-module, Project Readiness, and navigation conventions.
3. Prompt 02 may implement the smallest repo-consistent correction or bridge:
   - preserve `procurement-and-buyout` as future-affinity metadata while surfacing the module under Project Readiness, or
   - add explicit source/workflow/module-placement metadata if the existing model supports it, or
   - change mapping only if governing docs and tests show that is the least-risk correction.

## Implementation-Relevant Model Seams

- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/WorkflowModules.test.ts`
- `packages/models/src/pcc/PccWorkCenters.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/fixtures/projectReadiness.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/index.ts`
- `packages/models/src/index.ts`

## Backend Seams

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/services/__tests__/`
- Existing route posture: GET-only read-model routes under `pcc/projects/{projectId}/...`

## SPFx API Seams

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`

## SPFx Surface Seams

- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`

## Package Scripts to Revalidate Locally

Observed on pushed repo:

- `@hbc/models`: `build`, `check-types`, `lint`, `test`
- `@hbc/functions`: `build`, `check-types`, `lint`, `test`, `test:smoke`, `test:contract-smoke`, `test:coverage`
- `@hbc/spfx-project-control-center`: `build`, `check-types`, `lint`, `test`, `dev`
- root: `build`, `dev`, `lint`, `check-types`, `test`, `format`, `format:check`

Prompt 01 must re-open package scripts locally before any implementation prompt relies on them.

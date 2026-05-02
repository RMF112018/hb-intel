# Required Repo-Truth Files

## Always Run First

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Governing Docs

- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`

## Wave 13 Docs

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

## Model / Fixture Seams

- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/WorkflowModules.test.ts`
- `packages/models/src/pcc/PccWorkCenters.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/fixtures/projectReadiness.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/index.ts`
- `packages/models/src/index.ts`
- `packages/models/package.json`

## Backend Seams

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/services/__tests__/`
- `backend/functions/package.json`

## SPFx Seams

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/package.json`

## Repo-Truth Questions Prompt 01 Must Answer

1. What is the latest local HEAD?
2. Is the local branch clean aside from user-owned workspace context?
3. Does the Wave 13 closeout doc exist?
4. Do all Wave 13 documentation artifacts exist?
5. Do all eight Wave 13 reference JSON files validate?
6. Is `Buyout Log` consistently named in governing docs?
7. Is `Buyout Control Center` consistently used as the user-facing subtitle?
8. Is the required governance sentence present in the relevant governing docs?
9. Is Wave 13 positioned as an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity?
10. Does `packages/models/src/pcc/WorkflowModules.ts` currently include `buyout-log`?
11. Does `WorkflowModules.ts` still map `buyout-log` to `procurement-and-buyout`?
12. What is the repo-consistent implementation path for resolving or preserving that mapping?
13. Does the existing Project Readiness framework expose source-module or workflow-module seams that should include `buyout-log`?
14. Are there existing read-model response-map/provider patterns for adding a GET-only mock route?
15. Are there existing SPFx PCC API client patterns for read-model data?
16. Are there existing Project Readiness surface conventions that should host the Buyout Log UI?
17. Are there existing tests for model exports, fixtures, provider/route, SPFx parity, and guardrails?
18. Which package scripts should implementation prompts use for validation?
19. Which files should be edited by each staged implementation prompt?
20. Which docs must be updated during implementation closeout?
21. Does the seed JSON preserve all 14 workbook headers?
22. Does the seed JSON include rows `8–85` as candidate buyout package seed rows with exact source row references?
23. Does documentation enforce no Procore writeback, no Sage writeback, no accounting posting, no external-system mutation, and no production rollout?
24. Are workbook rows treated as seed taxonomy only until activated/imported?
25. Are source-lineage requirements explicit for every external/source-derived value?

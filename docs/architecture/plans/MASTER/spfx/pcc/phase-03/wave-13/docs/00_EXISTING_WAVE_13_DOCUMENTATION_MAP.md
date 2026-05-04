# 00 — Existing Wave 13 Documentation Map

## Purpose

Map the current Wave 13 Buyout Log planning artifacts and identify how they must be interpreted after the unified lifecycle developer-contract layer was added.

## Governing PCC Docs to Inspect

- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/`

## Phase 3 Roadmap / Registers

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

- `reference/default_buyout_log_seed_structure.json`
- `reference/buyout_module_data_contract.json`
- `reference/buyout_state_machine.json`
- `reference/field_mutability_matrix.json`
- `reference/buyout_exception_reason_codes.json`
- `reference/fixture_scenarios.json`
- `reference/procore_buyout_data_mapping_reference.json`
- `reference/source_research_urls.json`

## Source Workbook

- `docs/reference/example/financial/Buyout Log_Template 2025.xlsx`

Read-only only. Do not edit or normalize this workbook during implementation.

## Known Source-Model Placement Issue / Bridge

Known planning posture:

- Official module: `Buyout Log`
- Subtitle: `Buyout Control Center`
- Governance: MVP Project Readiness workflow module
- Classification: Procurement / Project Controls
- Future affinity: Procurement & Buyout Center

Known model posture to inspect:

- `packages/models/src/pcc/WorkflowModules.ts` may already contain `buyout-log`.
- It may map `buyout-log` to `procurement-and-buyout`.

Implementation should not blindly remap. Prompt 01 must inspect the current source model taxonomy and decide the smallest safe correction or bridge:

1. Preserve `procurement-and-buyout` work-center affinity while adding explicit Project Readiness signal/source-module bridge; or
2. Adjust model metadata only if repo truth now supports primary Project Readiness governance without breaking other tests.

## Unified Lifecycle Interpretation

Wave 13 must produce or consume:

- Project Readiness signals.
- Priority Action candidates.
- Project Memory records / references.
- Traceability edges: estimate/budget allocation → package → vendor/commitment reference → evidence → readiness/closeout.
- Source lineage for external-derived values.
- HBI eligibility metadata, but no live search/vector/LLM behavior.
- Audit events for views, state transitions, exceptions, evidence references, HBI eligibility, reconciliation actions, and source-link launches.

## Implementation-Relevant Seams

- Model contracts: `packages/models/src/pcc/`
- Fixtures: `packages/models/src/pcc/fixtures/`
- Backend read-model host: `backend/functions/src/hosts/pcc-read-model/`
- SPFx API client: `apps/project-control-center/src/api/`
- SPFx surfaces: `apps/project-control-center/src/surfaces/`
- Project Readiness surface: `apps/project-control-center/src/surfaces/projectReadiness/`
- Tests: `packages/models/src/pcc/*.test.ts`, `backend/functions/src/**/__tests__`, `apps/project-control-center/src/tests/`

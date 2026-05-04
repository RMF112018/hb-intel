# Existing Wave 14 Documentation Map

## Remote Audit Basis

Remote repo: `RMF112018/hb-intel`  
Reference commit inspected: `8924b5ce6432a7afe154d5f67fda8cf28164ec67`  
Known lockfile MD5 from closeout lineage: `c56df7b79986896624536aab74d609f4`

Local repo state must be revalidated before implementation.

## Governing PCC Docs to Inspect

- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`

## Wave 14 Blueprint Docs

- `Wave_14_Approvals_Checkpoints_Target_Architecture.md`
- `Wave_14_Domain_Model_And_State_Machine.md`
- `Wave_14_Routing_And_Permission_Matrix.md`
- `Wave_14_Source_Module_Integration_Contract.md`
- `Wave_14_Wave13G_Estimating_Checkpoint_Contract.md`
- `Wave_14_SPFX_UX_And_Wireframes.md`
- `Wave_14_SharePoint_Read_Model_And_Storage_Posture.md`
- `Wave_14_HBI_Guardrails_And_Audit_Model.md`
- `Wave_14_Test_And_Acceptance_Gates.md`
- `Wave_14_Documentation_Closeout.md`

## Wave 14 Reference JSON Artifacts

- `phase14_authority.json`
- `approval_checkpoint_state_machine.json`
- `approval_mode_registry.json`
- `approval_decision_action_registry.json`
- `approval_role_action_matrix.json`
- `approval_source_module_integration_matrix.json`
- `approval_validation_rules.json`
- `approval_read_model_command_contract.json`
- `sharepoint_index_strategy.json`
- `ux_wireframe_inventory.json`
- `dependency_package_evaluation.json`
- `validation_gates.json`
- `agent_execution_rules.json`

## Wave 13G Relationship Docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/`
- Wave 13G remains Estimating Workbench feature/UX authority.
- Wave 14 owns approval/checkpoint queue, routing, decision, stale/supersession, and audit semantics only when estimating workflows are checkpointed.

## Current Approvals Surface / Model / Backend / SPFx Seams

Remote audit identified:

- `packages/models/src/pcc/ApprovalCheckpoint.ts` exists and contains early preview vocabulary only: `pending`, `approved`, `rejected`, `waived`.
- `packages/models/src/pcc/fixtures/approvals.ts` exists and exports deterministic `SAMPLE_APPROVAL_CHECKPOINTS` / `SAMPLE_REVIEWER_ACTIONS`.
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx` exists and renders preview-only fixture data.
- `apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx` exists and reads directly from `SAMPLE_APPROVAL_CHECKPOINTS`.
- `apps/project-control-center/src/api/pccReadModelClient.ts` and `pccBackendReadModelClient.ts` exist, but remote audit found no approvals/checkpoints route ID/method yet.
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` exists and registers GET-only PCC read-model routes, but remote audit found no approvals/checkpoints route yet.
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` exists and is the pattern for deterministic mock envelopes.

## Implementation-Relevant Test Locations

- `packages/models/src/pcc/*.test.ts`
- `packages/models/src/pcc/fixtures/*.test.ts`
- `backend/functions/src/hosts/pcc-read-model/*.test.ts`
- `backend/functions/src/services/__tests__/`
- `apps/project-control-center/src/api/*.test.ts`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/src/surfaces/**/__tests__/` if repo conventions use co-located tests.

## Existing Preview / Fixture / Read-Only Posture

Wave 14 should evolve the current preview-only fixture cards into read-model-backed, fixture-first, read-only surfaces. The current implementation is not partially actionable and must not become actionable during this package unless a future command gate explicitly authorizes it.

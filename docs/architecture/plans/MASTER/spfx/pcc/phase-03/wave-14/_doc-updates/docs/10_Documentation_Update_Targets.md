# Documentation Update Targets

## Objective

Update governing PCC documentation so Phase 14 is fully specified before controlled implementation prompts begin.

## Required Target Files

| Target                                                       | Required Update                                                                              |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Add Phase 14 as PCC-native checkpoint orchestration layer                                    |
| `System_of_Record_Matrix.md`                                 | Add ApprovalRequest, Checkpoint, Decision, Policy, Audit Event ownership                     |
| `Standard_Project_Site_Template_Contract.md`                 | Add storage posture references without tenant mutation authorization                         |
| `Unified_PCC_Lifecycle_Objective_Architecture.md`            | Add approval/checkpoint continuity across lifecycle stages                                   |
| `PCC_Project_Lifecycle_Spine.md`                             | Add readiness/handoff/freeze checkpoint gates                                                |
| `PCC_Project_Memory_Layer.md`                                | Add decision history and audit-event memory posture                                          |
| `PCC_Cross_Stage_Traceability_Model.md`                      | Add source reference, supersession, evidence lineage                                         |
| `PCC_Unified_Search_And_HBI_Grounding_Model.md`              | Add HBI no-authority/citation-only rules                                                     |
| `phase-3/05_Phase_3_Development_Roadmap_Updated.md`          | Expand Wave 14 scope beyond generic approval queue                                           |
| `phase-3/07_Phase_3_Module_Implementation_Plan.md`           | Add Wave 14 implementation sequencing                                                        |
| `phase-3/Register_MVP_Scope.md`                              | Clarify MVP inclusion and blocked runtime execution                                          |
| `phase-3/Register_Workflow_Module_Register.md`               | Update Wave 14 dependencies and module integration contract                                  |
| `phase-3/wave-14/`                                           | Add new target architecture package                                                          |
| `phase-3/wave-13G/`                                          | Add cross-reference to Phase 14 checkpoint semantics where estimating approvals are affected |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/`  | Add planning docs/prompts/reference artifacts                                                |

## Required New Wave 14 Docs

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

## Cross-Reference Rules

Every updated doc must state:

- documentation-only unless future prompt authorizes runtime;
- no external writeback;
- no Power Automate runtime dependency;
- no tenant mutation;
- HBI has no decision authority;
- Wave 13G remains estimating feature authority;
- Phase 14 governs checkpoint queue semantics.

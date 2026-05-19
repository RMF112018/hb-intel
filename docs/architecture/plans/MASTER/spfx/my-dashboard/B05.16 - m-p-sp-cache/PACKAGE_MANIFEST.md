# Package Manifest

## Package

**Name:** B05.16 - My Projects SharePoint Storage Redirection Implementation Package  
**Target:** HB Intel > My Dashboard > My Projects  
**Architecture:** SharePoint-backed MVP storage/control-plane redirection  
**File count excluding this manifest:** 45

## Contents

| File | Bytes | SHA-256 Prefix |
|---|---:|---|
| `00_Closed_Decision_Register.md` | 5,778 | `af373341bdba` |
| `01_Revised_Target_Architecture.md` | 7,368 | `4fbfbd1ac740` |
| `02_SharePoint_MVP_Storage_And_Provisioning_Architecture.md` | 5,254 | `260613e553c5` |
| `03_SharePoint_List_Schemas_And_Field_Contracts.md` | 13,736 | `2a527f453e85` |
| `04_Pending_Work_Debounce_And_Timer_Worker_Design.md` | 6,398 | `d2ca3e38ea6f` |
| `05_Backend_Service_Redirection_Design.md` | 6,367 | `1ac8e840659e` |
| `06_Graph_Subscription_Delta_And_Resync_Design.md` | 4,177 | `3a032147ddb9` |
| `07_Seed_Rebuild_Cutover_And_Rollback_Plan.md` | 3,875 | `9dfd03097c27` |
| `08_Telemetry_Failure_Ledger_And_Operational_Runbooks.md` | 4,073 | `83d6eff306ff` |
| `09_Security_Permissions_And_Governance.md` | 3,751 | `e62854487df2` |
| `10_Validation_Acceptance_And_Test_Matrix.md` | 4,315 | `5f651f64a504` |
| `11_Supersession_And_Code_Retirement_Plan.md` | 3,459 | `16647bfa224e` |
| `README.md` | 7,578 | `da656d95c6ab` |
| `prompts/Prompt_00_Fresh_Session_Repo_Truth_Redirection_Gate.md` | 3,127 | `8d47f065059e` |
| `prompts/Prompt_01_Closed_Target_Architecture_And_Config_Redirection.md` | 2,808 | `e7dab946234d` |
| `prompts/Prompt_02_MyDashboard_Provisioning_Pattern_Audit_And_Schema_Resource_Freeze.md` | 3,039 | `7e6012c7074e` |
| `prompts/Prompt_03_SharePoint_Storage_Descriptors_Provisioners_Verifiers_And_Runbooks.md` | 2,810 | `2b8337762c5d` |
| `prompts/Prompt_04_SharePoint_Operational_Repositories_And_Azure_State_Supersession.md` | 2,810 | `82adff32feae` |
| `prompts/Prompt_05_Pending_Work_List_Webhook_Ingress_And_Timer_Worker.md` | 2,818 | `0637e04414d7` |
| `prompts/Prompt_06_Graph_Subscriptions_Delta_State_And_Resync_Persistence_Redirect.md` | 2,623 | `008e1e4761f8` |
| `prompts/Prompt_07_Seed_Rebuild_Admin_Endpoints_And_CLI_Redirection.md` | 2,594 | `f0044306f874` |
| `prompts/Prompt_08_Read_Model_Provider_Freshness_And_Cutover_Contract.md` | 2,560 | `c4cf6430b4b2` |
| `prompts/Prompt_09_Telemetry_Failure_Ledger_KQL_And_Operational_Evidence.md` | 2,451 | `7e0e9bfadc31` |
| `prompts/Prompt_10_Validation_Parity_Hosted_Live_Proof_And_Rollback_Readiness.md` | 2,554 | `44dd98f30e2e` |
| `prompts/Prompt_11_Documentation_Manifest_Closeout_And_Package_Completion.md` | 2,481 | `6e381a42a3f3` |
| `prompts/Prompt_Index.md` | 1,822 | `c50a60a61756` |
| `resources/App_Insights_KQL_Query_Pack.md` | 2,476 | `ea66aa0510c5` |
| `resources/Architecture_Traceability_Matrix.md` | 1,281 | `41ccba59b915` |
| `resources/Environment_Settings_Matrix.md` | 4,921 | `d76a1f827b9b` |
| `resources/Implementation_Sequence_Checklist.md` | 2,385 | `5dfc65da3c51` |
| `resources/My_Projects_Control_State_Contract.json` | 971 | `d01ffd6e6a4a` |
| `resources/My_Projects_Failure_Taxonomy.json` | 1,810 | `e82b4636738b` |
| `resources/My_Projects_Pending_Work_Contract.json` | 2,012 | `fdad70d3fa84` |
| `resources/My_Projects_Provisioning_Contract.json` | 1,280 | `97df604a0d5d` |
| `resources/My_Projects_SharePoint_Storage_Schema.json` | 32,996 | `c19f2388a7d2` |
| `resources/Operator_Command_Ledger_Template.md` | 1,103 | `1ab3375b7550` |
| `resources/Prompt_Execution_Guide.md` | 2,159 | `59fdfafc02fe` |
| `resources/Repo_Truth_Seam_Map.md` | 2,954 | `99a3db3bf195` |
| `resources/Source_Register.md` | 1,419 | `89047a6d7a7c` |
| `runbooks/Runbook_01_Pre_Implementation_Repo_Truth_And_Scope_Lock.md` | 1,532 | `f8b60be154ab` |
| `runbooks/Runbook_02_MyDashboard_List_Provisioning_And_Verification.md` | 2,284 | `16107bb9907d` |
| `runbooks/Runbook_03_Permissions_And_Configuration_Preflight.md` | 1,672 | `38f821445043` |
| `runbooks/Runbook_04_Subscription_Seed_And_Live_Validation.md` | 1,924 | `4397c9580bfb` |
| `runbooks/Runbook_05_Cutover_Production_Monitoring_And_Rollback.md` | 2,061 | `2624be2c6e76` |
| `runbooks/Runbook_06_Operator_Failure_Triage_And_Repair.md` | 2,267 | `0e21ad9fce23` |

## Structure Summary

- Architecture and decision docs: 12 top-level markdown files including README and closed decision register.
- Machine-readable implementation resources: JSON contracts and schema resources.
- Operator runbooks: 6.
- Local agent prompts: 12 implementation prompts plus index.
- Supporting references: KQL pack, command ledger, traceability matrix, seam map, source register.

## Package Completion Statement

This package is decision-complete for implementation planning and execution. It intentionally leaves no material architecture decision open regarding:

- target SharePoint list inventory;
- schema contracts;
- Pending Work queue replacement;
- retry/dead-letter behavior;
- resync behavior;
- permissions posture;
- provisioning script posture;
- Azure Table / Service Bus active-path supersession;
- prompt sequence and validation gates.

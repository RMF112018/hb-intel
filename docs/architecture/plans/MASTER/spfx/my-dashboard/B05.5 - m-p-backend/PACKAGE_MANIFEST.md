# Package Manifest

## Package Name

`HB_Intel_Federated_HB_SharePoint_Creator_Graph_Access_Backend_Prompt_Package`

## Prompts

| File | Purpose |
|---|---|
| `prompts/Prompt_01_Implement_Federated_HB_SharePoint_Creator_Graph_Token_Path.md` | Implement the federated Graph token provider, rewire `GraphListClient`, preserve telemetry and Adobe Sign posture, validate backend. |
| `prompts/Prompt_02_Reconcile_Docs_Deployment_Prerequisites_And_Hosted_Proof.md` | Update the minimum canonical docs/runbooks and return the hosted proof checklist after backend deploy. |

## Supporting Files

| File | Purpose |
|---|---|
| `supporting/00_Locked_Current_State_And_Root_Cause.md` | Captures the established root cause and target identity architecture. |
| `supporting/01_Operator_Completed_Entra_Federated_Credential_Evidence.md` | Records the operator-completed federated credential configuration. |
| `supporting/02_Repo_Truth_Inspection_Seams.md` | Lists the exact repo seams the agent must inspect before implementation. |
| `supporting/03_Implementation_Guardrails_And_Non_Negotiables.md` | Locks scope, safety, and what must not be modified. |
| `supporting/04_Runtime_Proof_Checklist_And_KQL.md` | Defines the post-deploy hosted verification sequence and telemetry query. |
| `supporting/05_Commit_Closeout_Template.md` | Provides commit summary/description templates and closeout format. |

## Intended Execution Order

1. Read all supporting files.
2. Execute Prompt 01.
3. Commit Prompt 01 implementation when authorized.
4. Deploy backend through the governed CI/CD path.
5. Execute Prompt 02 documentation/proof reconciliation.
6. Run hosted proof and use the telemetry query in Supporting 04.

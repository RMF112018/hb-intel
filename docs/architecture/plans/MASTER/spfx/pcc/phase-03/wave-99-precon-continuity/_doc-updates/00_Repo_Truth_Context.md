# 00 — Repo Truth Context

## Known Baseline From Prior Conversation

```text
Current known GitHub HEAD: 58f53d49d59f8c70683725c999e8f55e2bc2dfef
Commit title: docs(pcc): close unified lifecycle developer documentation
Known lockfile MD5: c56df7b79986896624536aab74d609f4
```

This package must not rely on that baseline without local verification. The local agent must run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Unified Lifecycle Context Now in Force

The Preconstruction Continuity documentation must align with:

- unified lifecycle doctrine;
- lifecycle spine;
- Project Memory layer;
- role/stage/task lenses;
- cross-stage traceability;
- company knowledge reuse;
- warranty/obligation traceability where future operations/warranty context relies on preconstruction records;
- HBI grounding/citation/refusal model;
- knowledge reuse security, redaction, permission, and retention posture;
- unified lifecycle developer-contract corpus.

## Required Repo-Truth Files To Inspect

At minimum, inspect the following paths only as needed and do not re-read files still in current context unless stale, missing, or contradictory repo truth requires it:

```text
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Unified_Lifecycle_Developer_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Bounded_Context_And_Ownership_Map.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Route_Taxonomy_And_Forbidden_Routes.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Record_State_Machines.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Field_Level_Data_Dictionary.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Permission_Redaction_Resolution_Algorithm.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_HBI_Retrieval_Citation_And_Refusal_Contract.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Source_System_Integration_Contracts.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Audit_Event_Model.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Error_Degraded_State_Matrix.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Module_Onboarding_Template.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Test_Acceptance_Gates.md
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/PCC_Live_Integration_Readiness_Gates.md
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/LifecycleReadiness.ts
packages/models/src/pcc/PccReadModels.ts
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/unifiedLifecycle/
apps/project-control-center/src/api/
backend/functions/src/hosts/pcc-read-model/
docs/reference/example/
```

## Expected Current Posture

- PCC remains one project operating layer.
- Preconstruction Continuity must not become a separate shell workspace.
- Go / No-Go remains source-owned upstream decision workflow; PCC receives a read-only carry-forward projection after GO.
- Estimating Kickoff remains later-phase and can become a Project Readiness / Preconstruction workflow module only after authorized implementation.
- Current documentation update is docs-only.
- No runtime, model, backend, SPFx, package, lockfile, workflow, manifest, tenant, or external-system mutation is authorized.

## Questions The Local Agent Must Answer In Prompt 01

1. What is the current local HEAD?
2. Is the worktree clean?
3. Does the unified lifecycle developer-contract directory exist?
4. Does the developer-contract corpus include bounded contexts, route taxonomy, state machines, field dictionary, permission/redaction, HBI citation/refusal, source integration, audit events, degraded states, module onboarding, validation/test gates, and live-readiness gates?
5. Are existing preconstruction-continuity docs already present in the repo?
6. Is `estimating-kickoff` still registered as later-phase and disabled by default if present in `WorkflowModules.ts`?
7. Does repo truth permit Preconstruction Continuity to be documented as a lifecycle layer without adding shell routes?
8. Which source templates exist under `docs/reference/example/`, and what source-template extraction is required?
9. Which governing docs require additive cross-references?
10. What docs/reference JSONs should be created or updated?

## Local-Only Limitations

This generated package cannot prove local working tree state. Prompt 01 must revalidate local branch, HEAD, lockfile MD5, file existence, and package-specific doc state before any edits.

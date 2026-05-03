# 00 — Repo Truth Context

## Known Repo Truth From Prior Inspection

The package assumes the following repo-truth baseline, which the local code agent must re-verify before making documentation changes:

- PCC governing docs now define PCC as one unified lifecycle-aware project operating layer.
- `Unified_PCC_Lifecycle_Objective_Architecture.md` exists.
- Unified lifecycle doctrine docs exist for lifecycle spine, project memory, role/stage lenses, cross-stage traceability, company knowledge reuse, warranty traceability, unified search/HBI grounding, and knowledge-reuse security/retention posture.
- `packages/models/src/pcc/UnifiedLifecycle.ts` exists and exports unified lifecycle contracts.
- `packages/models/src/pcc/UnifiedLifecycleReadModels.ts` exists and exports read-model DTOs.
- `packages/models/src/pcc/PccReadModels.ts` includes unified lifecycle route-family response maps.
- Backend PCC read-model routes exist for the unified lifecycle route families.
- SPFx read-model client parity exists for unified lifecycle route families.
- Project Home and Project Readiness have preview-safe unified lifecycle integrations.
- Ask-HBI preview is integrated into Project Home and starts idle.
- Prompt 07 security / retention / permission closeout exists.

## Required Local Re-Verification Commands

Run from `/Users/bobbyfetting/hb-intel` before editing:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -30
md5 pnpm-lock.yaml
git diff --stat
git diff --name-only
```

## Required Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.ts
packages/models/src/pcc/PccReadModels.ts
backend/functions/src/hosts/pcc-read-model/
apps/project-control-center/src/api/
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/unifiedLifecycle/
```

## Repo-Truth Resolution Required

If repo truth confirms the baseline above, the documentation update must treat all substantive Wave 99 preview-safe implementation gaps as closed and focus only on adding developer-facing documentation contracts.

If the final aggregate Prompt 08 closeout is missing, include it as a closeout/readiness item in the documentation roadmap but do not implement runtime features.

# Prompt 01 — Repo Audit, Template Extraction, and Source Truth

## Universal Instructions

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This is a documentation-only task. Do not make runtime/source-code changes unless this prompt explicitly allows them.

Treat the implemented unified lifecycle layer as controlling architecture. Preconstruction Continuity must align with the live developer-contract corpus under:

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
```

Every decision must preserve PCC as one unified project operating layer. Do not create or imply a separate Business Development, Estimating, Preconstruction, Operations, Warranty, Executive, or Admin workspace.

## Global Prohibited Scope

- Editing `docs/architecture/plans/**` unless separately authorized.
- Broad repo formatting.
- Source/runtime code changes.
- Backend route changes.
- SPFx surface/component/client changes.
- Model/type package changes.
- Package/dependency changes.
- Lockfile changes.
- Manifest changes.
- Workflow/CI changes.
- SPFx packaging/deployment.
- Tenant mutation.
- Procore API/runtime integration.
- Direct SPFx-to-Procore behavior.
- Procore write-back.
- Procore full mirror.
- Sage write-back or accounting postings.
- CRM, Unanet, Autodesk, BuildingConnected, Power Automate, Microsoft Graph, SharePoint REST/PnP, or external-system runtime mutation.
- Evidence file upload/sync/storage behavior.
- Automatic project setup, SharePoint site creation, Procore project creation, Sage project creation, accounting setup, staffing commitments, legal decisions, or contractual decisions.
- Treating Go / No-Go scores as legal, accounting, revenue, margin, or profit guarantees.
- Treating Estimating Kickoff assignments as HR/staffing commitments unless separately approved.
- Exposing sensitive executive, committee, pursuit, margin, strategy, or client comments to unauthorized roles.
- Destroying, overwriting, unprotecting, or altering source workbooks, PDFs, or templates.
- Creating standalone `go-no-go`, `preconstruction-continuity`, `estimating-kickoff`, `project-memory`, `unified-search`, or `ask-hbi` shell routes unless the current route taxonomy explicitly authorizes them.
- Production rollout.

## Required Validation

Run repo-correct equivalents of:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
git diff --stat
git diff --name-only
pnpm exec prettier --check <touched markdown/json files>
git diff --cached --name-only
```

For JSON files touched, run `python3 -m json.tool` against each touched JSON file.

If no files are touched, run `git diff --quiet` and report the no-op result.

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if any;
- validation results;
- lockfile MD5 before/after;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit no-runtime/no-tenant/no-source-system-mutation confirmation.


## Objective

Perform a read-only repo-truth audit for PCC Preconstruction Continuity after unified lifecycle implementation. Verify the current unified lifecycle developer-contract corpus, existing Preconstruction Continuity docs if any, source templates, and Estimating Kickoff module posture. Do not edit files in this prompt.

## Required Repo-Truth Questions

1. What is the current local branch and HEAD?
2. Is the worktree clean?
3. Is `pnpm-lock.yaml` MD5 still `c56df7b79986896624536aab74d609f4` or otherwise unchanged before/after this read-only prompt?
4. Does `docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/` exist?
5. Do the unified lifecycle developer-contract docs include the required contracts for bounded contexts, routes, state machines, field dictionary, permission/redaction, HBI citation/refusal, source integration, audit events, degraded states, module onboarding, validation gates, and live-readiness gates?
6. Does a repo-resident `docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity/` folder already exist?
7. If it exists, what files and reference JSONs already exist?
8. Is `estimating-kickoff` registered in `packages/models/src/pcc/WorkflowModules.ts`?
9. If registered, is `estimating-kickoff` still later-phase / disabled by default?
10. Do governing docs still describe Estimating / Preconstruction as MVP turnover visibility/access and structured workflows later?
11. Does current doctrine define no separate departmental workspaces?
12. Does route taxonomy prohibit standalone preconstruction/go-no-go/estimating routes?
13. Does `System_of_Record_Matrix.md` require field-level source ownership and source-lineage posture?
14. Do source templates exist under `docs/reference/example/` or other repo-approved paths?
15. What are the exact source workbook/PDF names, sheets/pages, used ranges, merged cells, protection states, formulas, data validations, source rows, field labels, comments/resource areas, and decision fields?
16. What documentation files should Prompt 02–06 touch?

## Required Source Template Extraction

Use Python/openpyxl to extract workbook metadata if source workbooks exist. Use visual/PDF review only if PDFs exist and repo truth requires it.

Do not unprotect or alter protected workbooks.

For every extracted field, classify whether it may become:

- lifecycle event;
- Project Memory;
- readiness signal;
- traceability candidate;
- HBI-eligible evidence;
- HBI-blocked/restricted evidence;
- future-reference candidate;
- source-only archive context.

## Required Files To Inspect

Inspect only as needed, starting with:

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

## Output

Return:

- repo-truth summary;
- unified lifecycle developer-contract compliance summary;
- source-template extraction summary;
- existing Preconstruction Continuity docs inventory;
- current Estimating Kickoff module posture;
- recommended Prompt 02–06 execution path;
- no-op vs edit expectations for each later prompt.

No commit. No edits.

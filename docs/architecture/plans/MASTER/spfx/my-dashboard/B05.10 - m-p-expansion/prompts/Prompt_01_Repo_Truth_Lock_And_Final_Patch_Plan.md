# Prompt 01 — My Projects Multi-Platform Launch Expansion | Repo-Truth Lock and Final Patch Plan

## Objective

Conduct a focused repo-truth verification of the implementation package before any code edits are made. Confirm that the current local repository seams match the package assumptions, identify any drift, and produce the final execution plan for the patch series.

This prompt is **audit + plan only**. Do not edit files yet.

---

## Mandatory working rules

1. Do not re-read files that remain available in your current context or working memory unless exact lines are needed or repo state changed.
2. Work from the current local working tree, not stale docs or prior prompt packages.
3. Treat the package’s locked decisions as the intended target state unless current repo truth reveals a direct incompatibility that must be reported.
4. Do not leave decisions open. If repo drift exists, propose the exact adjustment needed.
5. Do not edit code, docs, or tests in this prompt.
6. Do not run tenant mutation commands.
7. Keep findings bounded to My Dashboard → My Projects, source-list schema, provider, UI, fixtures/tests/docs.

---

## Package files to read first

- `README.md`
- `00_Current_Repo_Truth_Baseline.md`
- `01_Locked_Product_And_Schema_Decisions.md`
- `02_Detailed_Implementation_Plan.md`
- `03_File_Impact_Matrix.md`
- `04_Validation_And_Live_Operator_Runbook.md`
- `05_Acceptance_Criteria.md`
- `supporting/Field_Contract_Table.md`
- `supporting/Test_Matrix.md`

---

## Required repo-truth files to inspect

### Source schema / provisioning
- `backend/functions/src/services/my-projects/my-projects-source-list-schema.ts`
- `scripts/provision-my-projects-source-list-schema.ts`
- `scripts/sharepoint-field-rest-contract.ts`
- `scripts/verify-my-project-role-fields.ts`
- `backend/functions/src/services/projects-role-schema-readiness.ts`

### Projects mapping
- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/projects-list-mapper.ts`

### Shared read models / fixtures
- `packages/models/src/myWork/MyProjectLinksReadModel.ts`
- `packages/models/src/myWork/fixtures/myProjectLinksReadModels.ts`

### Backend provider
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.test.ts`

### Frontend
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`

---

## Questions you must answer

1. Does the source-list descriptor still only provision role arrays + Registry procoreProject?
2. Does Projects still map stage through `resolveSpField('projectStage')` to `field_6`?
3. Does the Registry still lack `projectStage`, BuildingConnected, and Document Crunch fields?
4. Does `MyProjectLinkItem` still only expose SharePoint and Procore launch actions?
5. Does the backend provider still load only SharePoint/Procore launch metadata?
6. Does the frontend launch menu still render only SharePoint and Procore?
7. Does the current My Projects UI already reflect the tile/browser flagship composition described in the package?
8. Which tests currently assume two destinations or dual-launch semantics?
9. Which docs currently need language changes?
10. Does any repo drift require adjusting the file impact matrix before implementation?

---

## Required output

Return exactly:

# Prompt 01 Closeout — Repo-Truth Lock and Final Patch Plan

## 1. Executive Verdict
State whether the package assumptions are confirmed, partially drifted, or materially stale.

## 2. Confirmed Current Repo Truth
Numbered list only.

## 3. Drift or Contradictions
Numbered list only. If none, say `1. None.`

## 4. Final File Impact Matrix
List the files that will definitely be touched and files that are inspect-only.

## 5. Final Implementation Sequence
Provide the exact sequence for Prompt 02 through Prompt 06.

## 6. Risk Gates
Call out any non-obvious regression risk before coding begins.

## 7. Go / No-Go
Return either:
- `GO — proceed to Prompt 02`
or
- `NO-GO — resolve the listed drift before implementation`

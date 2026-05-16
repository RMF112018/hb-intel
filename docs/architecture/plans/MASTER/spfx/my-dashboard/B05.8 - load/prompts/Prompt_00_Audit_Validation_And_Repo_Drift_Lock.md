# Prompt 00 — Audit Validation and Repo Drift Lock

## Role

Act as a senior staff React/SPFx performance engineer, Azure Functions latency diagnostician, and repo-truth auditor working inside the `RMF112018/hb-intel` repository.

## Objective

Validate whether the current repository still matches the assumptions in the attached My Dashboard Load-Time Audit Validation & Remediation Package.

This is a **read-only repo-truth validation prompt**.

Do **not** edit code.  
Do **not** propose a new architecture unless repo truth has drifted materially.  
Do **not** re-read files that are still within your current context or memory unless you need a missing section or the file has changed.

## Package Artifacts to Treat as Governing

Read these package files first:

1. `README.md`
2. `00_Comprehensive_Audit_Assessment.md`
3. `01_Proposed_Implementation_Plan.md`
4. `02_Target_Architecture_And_Closed_Decisions.md`
5. `03_Validation_Matrix_And_Acceptance_Criteria.md`
6. `06_Exact_File_Level_Targets.md`

## Repo Areas to Validate

At minimum inspect the current truth of:

### Frontend
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.test.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`

### Backend
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-token-service.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`

## Questions You Must Answer

1. Does `MyWorkHomeSurface` still withhold My Projects during `loading` and `error` variants?
2. Do tests still lock that behavior in?
3. Does My Projects still construct a local read-model client instead of using context?
4. Is `getApiToken` still threaded through the My Projects surface/router path?
5. Do `/home` and `/project-links` still represent independent initial load paths?
6. Is Adobe Recent Completions still correctly deferred until interaction?
7. Does backend telemetry still lack stage-duration timing for Adobe and Project Links?
8. Has any recent code drift made the proposed prompt sequence unsafe or incomplete?

## Required Output

Return:

### 1. Repo-Truth Validation Verdict
Choose one:
- `Package remains valid as written`
- `Package remains valid with minor amendments`
- `Package requires material revision before remediation`

### 2. Evidence Table
Use columns:

| Finding | Current Repo Truth | Package Assumption | Match? | Notes |

### 3. Drift Register
Only include drift that changes implementation instructions.

### 4. Execution Readiness
State whether Prompt 01 can proceed safely.

## Stop Condition

Stop after the read-only validation report. Do not edit files in this prompt.

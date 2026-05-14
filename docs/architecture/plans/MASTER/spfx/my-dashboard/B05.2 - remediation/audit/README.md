# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Package Contents

This package contains the provisioning-method audit and recommendation for the My Dashboard / My Projects source-list schema expansion.

Files:

1. `00-Executive-Recommendation.md`
2. `01-Repo-Truth-Current-State-Map.md`
3. `02-Required-Columns-And-Schema-Gap-Assessment.md`
4. `03-Existing-Provisioning-Architecture-Audit.md`
5. `04-Microsoft-Graph-PnP-And-REST-Research-Assessment.md`
6. `05-Provisioning-Method-Decision-Matrix.md`
7. `06-Permission-Identity-And-Tenant-Prerequisite-Assessment.md`
8. `07-Recommended-Provisioning-Architecture-And-Execution-Plan.md`
9. `08-Findings-Register.md`
10. `09-Limitations-Assumptions-And-Operator-Proof-Items.md`

## Verdict

Use a dedicated repo-native TypeScript provisioner for the My Projects source-list schema delta. Reuse/refactor the existing legacy fallback provisioning primitives, but do not mutate through the legacy fallback provisioner directly.

## Follow-on package

A separate local code-agent prompt package was generated to implement the recommended path.

## Evidence Sources Used

### Repo evidence

- `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05A_My_Projects_Dual_Launch_Module_Comprehensive_Development_Plan.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `backend/functions/src/services/legacy-fallback/provisioning-compatibility.ts`
- `backend/functions/src/services/legacy-fallback/graph-list-client.ts`
- `backend/functions/src/services/sharepoint-provisioning-service.ts`
- `backend/functions/src/services/managed-identity-token-service.ts`
- `scripts/provision-legacy-fallback-lists.ts`
- `scripts/verify-my-project-role-fields.ts`
- `scripts/backfill-my-project-role-arrays.ts`
- `scripts/backfill-my-project-legacy-registry-fields.ts`
- `apps/my-dashboard/config/package-solution.json`

### Operator-provided tenant evidence

- Azure Function App ARM JSON for `hb-intel-function-app`, including User Assigned Managed Identity `hb-intel-function-app-uami` with client ID `77ad3593-5414-4122-a649-74916f8c0d7a` and principal ID `11194065-c745-4c4f-82ae-a2a3a7f92ddb`.
- Entra application JSON for `HB SharePoint Creator`, app ID `08c399eb-a394-4087-b859-659d493f8dc7`, including Microsoft Graph and SharePoint resource access declarations.

### Current authoritative external sources

- Microsoft Graph `POST /sites/{site-id}/lists/{list-id}/columns` documentation.
- Microsoft Graph `PATCH /sites/{site-id}/lists/{list-id}/columns/{column-id}` documentation.
- Microsoft Graph permissions reference.
- Microsoft Graph selected permissions overview for SharePoint and OneDrive.
- PnPjs fields documentation.
- PnP PowerShell `Add-PnPField` and `Set-PnPField` documentation.

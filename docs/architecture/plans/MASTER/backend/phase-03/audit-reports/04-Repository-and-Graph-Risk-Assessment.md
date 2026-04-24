# 04 — Repository and Graph Risk Assessment

## Core conclusion

The current Safety hot path is graph-native in repo truth. The remaining risk is therefore less about “should we migrate to Graph?” and more about “have we actually completed the migration operationally and proven it under the deployed identity and binding model?”

## Current repo-truth state

### Hot-path findings
- `SafetyIngestionApplicationService` is the authoritative ingest / preview / replay orchestration seam.
- That service constructs `SafetyIngestionGraphRepository`.
- `SafetyIngestionGraphRepository` uses `SafetyIngestionGraphDataPlane`.
- A guard test explicitly asserts that the hot path does **not** call `SharePointSafetyInspectionRepository` or `/_api/web/lists`.

### Residual mixed-state reality
- SharePoint/PnP-era provisioning and broader backend surfaces still exist.
- `ManagedIdentityTokenService` still has SharePoint-token helper methods.
- The overall backend is therefore not pure Graph everywhere.

That is acceptable only if the team is explicit about the boundary:
- Safety application-facing ingestion lane → graph-only direction of record
- legacy provisioning/control-plane seams → isolated transitional seams, not a model to extend

## Why provisioning dry-run can succeed while ingest fails

This is no longer best explained as “provisioning uses Graph and ingest uses SharePoint REST.”
Current `main` suggests a more precise explanation:

### Provisioning dry-run success factors
- dry-run is control-plane oriented
- it may validate targets, list presence, and expected containers without exercising the exact same graph item-read/write path as ingest
- it does not necessarily prove the same outbound permission path required by `getReportingPeriod()` and commit writes

### Ingest failure factors
Ingest specifically needs:
- the workbook upload lane
- reporting-period item retrieval
- project/legacy lookup reads
- inspection duplicate reads
- create-item writes
- rollup update writes
- ingestion-run writes

A `401` at reporting-period fetch blocks all of that.

## Most likely live blocker causes ranked

### 1. Deployed artifact drift versus current `main`
Why it is plausible:
- the brief still describes a REST-backed blocker
- current repo truth contradicts that
- therefore either the brief is stale, or the live artifact is stale, or both

### 2. Managed identity / grant mismatch
Why it is plausible:
- graph item GET should work if the deployed identity has the required effective access
- `401` strongly implicates auth/grant lane issues

### 3. Site/list binding mismatch
Why it is plausible:
- graph data plane resolves site IDs from configured site URLs
- wrong site URL, wrong list ID overlay, or wrong grant target can all manifest as access failures or item misses

### 4. Reporting-period identifier contract mismatch
Why it is plausible:
- repository converts the incoming reporting-period identifier into a numeric Graph item lookup path
- if the frontend/context passes a logical ID or title instead of numeric item ID semantics, the seam is brittle

### 5. Less likely: repo still secretly uses REST in the hot path
Why it is less likely:
- repo truth and dedicated tests directly argue against this for current `main`

## Graph-only cutover judgment

### Is Graph-only cutover merely convenient?
No.

For the Safety application-facing lane, Graph-only is the correct structural direction because it:
- removes split API-plane ambiguity
- aligns auth around one app-only identity model
- reduces REST/PnP operational drift
- makes permission/governance work more legible
- matches the current repo implementation direction

### What should not be overclaimed
Graph-only should not be interpreted as:
- every provisioning/admin seam can be instantly deleted
- no SharePoint-specific operational concerns remain
- broad staging grants are acceptable in steady-state production

## Risk matrix

### High risk
- unresolved reporting-period 401
- artifact/runtime drift
- permission tightening without proof
- ambiguous reporting-period ID contract

### Medium risk
- monolithic host blast radius
- mixed conceptual façade ownership
- telemetry retention/sampling without explicit proof strategy
- workbook parser-contract governance not fully closed

### Lower but real risk
- parser-support sheet visibility
- formula portability in parser-meta normalization cells
- future regressions reintroducing REST seams if guard tests are not maintained

## Recommended direction of record

1. Treat current Safety ingest/preview/replay path as graph-only by design.
2. Verify the deployed artifact is actually that code.
3. Fix the hosted reporting-period seam under the real identity.
4. Prove end-to-end writes.
5. Then tighten permissions before rollout.
6. Continue isolating SharePoint/PnP to the provisioning/control-plane seams that truly still need it.

## Primary sources consulted

### Official platform guidance
- Azure Functions Node.js v4 programming model: https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4
- Azure Functions deployment technologies: https://learn.microsoft.com/en-us/azure/azure-functions/functions-deployment-technologies
- Zip deployment for Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/deployment-zip-push
- Run Functions from a package: https://learn.microsoft.com/en-us/azure/azure-functions/run-functions-from-deployment-package
- Azure Functions app settings reference: https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings
- Manage function app settings / CORS: https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings
- Azure Functions best practices: https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices
- Improve Azure Functions performance and reliability: https://learn.microsoft.com/en-us/azure/azure-functions/performance-reliability
- Monitor executions in Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring
- Application Insights logs in Azure Functions: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-functions/monitoring/functions-monitoring-appinsightslogs
- Managed identities for App Service and Azure Functions: https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity
- Managed identities developer guidance: https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers
- Microsoft Graph throttling guidance: https://learn.microsoft.com/en-us/graph/throttling
- Microsoft Graph Selected permissions overview: https://learn.microsoft.com/en-us/graph/permissions-selected-overview
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Microsoft Graph create site permission: https://learn.microsoft.com/en-us/graph/api/site-post-permissions
- Microsoft Graph list item resource: https://learn.microsoft.com/en-us/graph/api/resources/listitem
- Microsoft Graph get list item: https://learn.microsoft.com/en-us/graph/api/listitem-get
- Microsoft Graph create list item: https://learn.microsoft.com/graph/api/listitem-create
- Microsoft Graph update list item: https://learn.microsoft.com/en-us/graph/api/listitem-update
- Microsoft Graph create list: https://learn.microsoft.com/en-us/graph/api/list-create

### Repo truth inspected
- `backend/functions/README.md`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/README.md
- `backend/functions/package.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/package.json
- `backend/functions/host.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/host.json
- `backend/functions/src/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/index.ts
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts
- `backend/functions/src/functions/health/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/index.ts
- `backend/functions/src/functions/health/ready.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/ready.ts
- `backend/functions/src/services/sharepoint-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/sharepoint-service.ts
- `backend/functions/src/services/safety-ingestion-application-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-application-service.ts
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-data-plane.ts
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-repository.ts
- `backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts
- `backend/functions/src/utils/validate-config.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/utils/validate-config.ts
- `backend/functions/src/middleware/auth.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/auth.ts
- `backend/functions/src/middleware/authorization.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/authorization.ts
- `scripts/package-functions-artifact.ts`: https://github.com/RMF112018/hb-intel/blob/main/scripts/package-functions-artifact.ts
- `packages/features/safety/src/domain/templateContract.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/domain/templateContract.ts
- `packages/features/safety/src/parser/contractWorkbookAccess.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/contractWorkbookAccess.ts
- `packages/features/safety/src/parser/extractMetadata.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/extractMetadata.ts
- `packages/features/safety/src/parser/parseChecklist.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/parseChecklist.ts
- `packages/features/safety/src/parser/validateTemplate.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/validateTemplate.ts

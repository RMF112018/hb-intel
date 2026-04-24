# 05 — Graph-Only Cutover Plan

## Objective

Converge the application-facing backend on a Graph-only integration surface while allowing broad staging/test permissions during stabilization and tightening permissions before rollout.

## Current mixed state

### What is already Graph-native
- Safety ingest
- Safety preview
- Safety replay
- Safety graph data plane
- Safety duplicate detection / run persistence / rollup update lanes

### What is still mixed or adjacent
- provisioning/control-plane SharePoint seams
- SharePoint token helper utilities
- broader backend façades and domain surfaces

## Cutover stages

## Stage A — Current mixed-state stabilization
Objective:
- stop reasoning from stale assumptions
- prove what is live
- eliminate uncertainty around the reporting-period 401

Required actions:
1. Prove deployed artifact parity against current `main`.
2. Execute a live Graph reachability proof for:
   - resolve site
   - get reporting-period item
   - create test read/write where safe
3. Confirm the exact identity used outbound.
4. Confirm the exact grants and resource assignments on:
   - Safety site
   - HBCentral site
   - required lists if selected scopes are used
5. Confirm the reporting-period ID contract.

Exit criteria:
- the team knows whether the blocker is artifact drift, grant drift, binding drift, or identifier drift.

## Stage B — Staging/testing cutover posture
Objective:
- stabilize end-to-end Safety ingest under the already granted broad Graph permissions
- stop relying on split API-plane behavior for the application-facing lane

Allowed posture in this stage:
- broad Graph application permissions already granted to the app/identity
- faster closure of ingest/preview/replay blocker
- graph-only data-plane proof before least-privilege tightening

Required actions:
1. Keep the Safety application-facing lane graph-only.
2. Remove or bypass any remaining application-facing REST/PnP ingestion seams if found.
3. Complete proof runs:
   - preview success
   - commit success
   - replay success
   - duplicate/supersession path
4. Capture exact list/file operations used by the successful flow.

Exit criteria:
- authoritative HBCentral writes succeed end-to-end under Graph.
- all Safety application-facing list/file activity needed for production is known and documented.

## Stage C — Pre-rollout tightening posture
Objective:
- reduce permissions from “convenient for staging” to “required for production”
- preserve successful graph-only behavior under narrowed grants

Required actions:
1. Build a permission inventory from the successful staging flow.
2. Remove unnecessary broad grants where feasible.
3. Prefer selected-scope/resource-assigned access for SharePoint/Graph where practical.
4. Re-run the same end-to-end proof suite under the tightened posture.
5. Fail rollout if the tightened posture breaks required behavior.

Exit criteria:
- the exact required grants are known, documented, and proven.
- broad staging permissions are no longer required for steady-state production.

## Recommended migration order

### First migrate / validate
- reporting-period read
- workbook upload
- ingestion-run create
- project-week lookup/create/update
- inspection-event create/update
- findings create
- replay download
- duplicate detection reads

### Second isolate
- façades that still conceptually bundle provisioning and ingestion behavior

### Third evaluate for redesign
- provisioning/admin seams that still need capabilities Graph does not replace cleanly
- any seam whose operational complexity outweighs the value of preserving current abstraction

## Permissions strategy

### Staging/test posture
Purpose:
- speed stabilization
- avoid blocking graph-only data-plane proof on premature least-privilege work

Acceptable temporarily:
- broader Graph permissions already in place

Not acceptable as final state:
- undocumented broad access
- no proof of which permissions were actually required

### Pre-rollout posture
Target:
- minimum set of application permissions and selected resource grants required for the proven flow

Likely strategy:
- site- or list-scoped selected permissions where practical
- explicit site/list permission assignments
- no leftover “just in case” broad permissions

## Evidence required to declare cutover successful

### Technical proof
- live artifact matches audited source
- all Safety application-facing data-plane calls succeed via Graph
- no REST/PnP ingress on ingest/preview/replay hot paths
- end-to-end committed records written successfully
- replay and duplicate handling proven

### Governance proof
- exact permission inventory documented
- staging vs rollout posture explicitly separated
- rollout posture proven under narrowed permissions

### Operational proof
- telemetry can show:
  - artifact version/sha
  - outbound identity
  - graph operation/path classification
  - failure class
  - request correlation

## Direction of record

The Graph-only cutover should become the new application-facing backend direction of record for Safety. SharePoint/PnP provisioning/control-plane seams can remain temporarily where they still provide unique value, but they should not be allowed to re-enter the Safety ingestion hot path.

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

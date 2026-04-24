# 00 — Backend Audit Summary

## Executive conclusion

The backend is **not production ready today**.

That said, the current Azure Functions backend is **not a blank or failed foundation**. It already has several production-grade patterns in place:
- v4 Node/Azure Functions registration on `@azure/functions`
- explicit artifact-packaging and post-deploy identity proof
- minimal anonymous liveness plus admin-gated readiness
- managed-identity token acquisition
- structured auth / authorization wrappers
- graph-native Safety ingestion application service
- graph-native Safety ingestion repository and data plane
- preview-gated Safety commit flow
- Graph retry and concurrency handling on key write/update seams

The most important outcome of the repo-truth audit is this:

> the current `main` branch no longer supports the earlier assumption that Safety ingestion still depends on `SharePointSafetyInspectionRepository` in the backend hot path.

Current repo truth shows:
- Safety ingest / preview / replay are routed through `SafetyIngestionApplicationService`.
- That service builds a `SafetyIngestionGraphRepository`.
- The graph repository uses `SafetyIngestionGraphDataPlane` for Graph calls.
- A dedicated cutover-guard test explicitly asserts that the ingestion hot path does **not** use `SharePointSafetyInspectionRepository`, `createSafetyAppOnlySpHttpClient`, or `/_api/web/lists` in the graph ingestion repository.

So the live `401` on reporting-period fetch should now be treated primarily as one of these:
1. deployed artifact lag/drift versus repo `main`
2. managed identity / app registration / consent / site grant mismatch
3. wrong site binding or list binding in runtime config
4. identifier mismatch between the reporting-period ID supplied by the client and the numeric Graph list item ID expected by the repository
5. a narrower graph data-plane defect, rather than a generic backend failure

## Objective framing

This audit evaluated:
- runtime shape
- route surface
- auth / identity posture
- Graph / SharePoint seams
- deployment integrity
- config validation
- observability
- resilience
- Safety ingestion correctness
- Graph-only cutover path
- workbook parser-contract posture

## What is already strong enough to preserve

### 1. Deployment artifact truth and post-deploy identity proof
The packaging script is not casual. It stages the backend package, rewrites entrypoint metadata, validates required files, asserts route signatures, self-imports the staged entrypoint, writes a manifest, and is tied to deploy-stamped build identity surfaced by `/api/health`.

### 2. Public health surface is intentionally minimized
Anonymous `/api/health` is small and deployment-oriented. Readiness/config/permission detail is segregated behind `/api/health/ready` with bearer-token auth plus admin-role enforcement.

### 3. Safety ingestion has a real preview gate
Preview is not decorative. The service validates reference lists, validates parser contract markers, parses the workbook, resolves reporting period and project, classifies duplicate risk, and blocks commit when readiness is not satisfied.

### 4. Safety graph data plane includes reliability features
The graph data plane includes:
- retry for 429 / 5xx
- bounded-query enforcement
- concurrency-safe update with `If-Match`
- explicit failure classification
- structured telemetry on classified graph failures

### 5. Managed identity is the intended runtime model
The backend is already positioned around app-only managed identity, which is the correct direction for a privileged Azure Functions control plane.

## What is directionally right but still below production-ready standard

- The split between provisioning/control-plane seams and ingestion/data-plane seams is improving, but the broader backend still contains more surface area than the immediate Safety objective needs.
- Rollout readiness is documented and validated better than average, but there is still a gap between declared permission posture and proven least-privilege runtime proof.
- The workbook parser contract exists and is materially better than legacy cell-only parsing, but the upload lane should now expose a clearer preview/validation contract and tighter template/version diagnostics.
- The monolithic host still creates operational blast-radius and release-scope concerns even though the artifact script adds proof controls.

## Structurally weak or blocking areas

### 1. The live Safety blocker is unresolved
The backend cannot yet prove authoritative committed writes into:
- Safety Ingestion Runs
- Safety Project Week Records
- Safety Inspection Events
- Safety Findings

That alone blocks a production-ready declaration for the Safety lane.

### 2. Repo truth and live-state narrative are partially out of sync
The attached brief still describes a remaining REST-backed Safety repository blocker. Current `main` shows a graph-native ingestion path. That discrepancy must be resolved with an artifact/runtime proof pass before more design assumptions are made.

### 3. Graph-only cutover is incomplete at the broader backend level
For Safety ingestion hot paths, graph-only direction is substantially implemented.
For the broader backend, SharePoint/PnP seams still exist, especially in provisioning/control-plane work. Some are reasonable to preserve temporarily; some should be isolated from application-facing ingestion behavior.

### 4. Workbook contract adoption is incomplete in product behavior
The parser already prefers parser-meta and named ranges. But the route/UI contract should now treat preview as the canonical validation stage and report:
- template compatibility
- parser contract compatibility
- authoritative field sources
- reporting-period fit
- duplicate risk
before final commit.

## Bottom line

The Safety blocker looks **narrow and tractable**, but the backend is still **below production-ready standard** until:
- end-to-end committed graph writes are proven,
- deployed artifact parity with `main` is proven,
- permission/site/list bindings are proven under the intended identity,
- pre-rollout least-privilege tightening is completed,
- and the parser contract is enforced as a governed authority.

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

# 01 — Backend Implementation Map

## Current backend topology

### Runtime and host model
- Package: `backend/functions`
- Language/runtime shape: TypeScript + Azure Functions Node programming model v4
- Package entrypoint: `backend/functions/package.json` → `main: ./dist/index.js`
- Root host metadata: `backend/functions/host.json`
- Primary monolithic composition root: `backend/functions/src/index.ts`

### Domain-host intent
The repo documents a multi-host/domain-host posture:
- monolithic host
- project-setup host
- admin-control-plane host

However, the audited package still includes the monolithic composition root and imports a broad function surface. The packaging script separately validates admin-control-plane composition and safety route signatures, which indicates a mixed-but-governed host strategy rather than a clean single-boundary deployment.

## Route families visible in repo truth

### Public / minimally public
- `GET /api/health`

### Privileged readiness
- `GET /api/health/ready`

### Safety record keeping routes
- `POST /api/safety-records/provision-sharepoint`
- `POST /api/safety-records/ingest`
- `POST /api/safety-records/ingest/preview`
- `POST /api/safety-records/replay`

### Broader monolithic route families still imported
- provisioning saga
- proxy
- timer
- signalr
- project requests
- acknowledgments
- notifications
- legacy fallback
- admin API families
- domain CRUD families (leads / projects / estimating / schedule / buyout / compliance / contracts / risk / scorecards / pmp)
- idempotency cleanup timer

## Auth and authorization seams

### Inbound request auth
- `withAuth()` performs bearer extraction and JWT validation.
- Invalid or missing bearer token yields structured `401`.

### Authorization layer
- `requireAdmin()`
- `requireDelegatedScope()`
- workload/app-only authorization helpers also exist

### Important nuance
`requireDelegatedScope()` explicitly bypasses the delegated-scope requirement for app-only tokens. That is appropriate for automation/workload callers, but it means privileged app-only tokens and interactive delegated flows must both be tested carefully for route expectations.

## Configuration and startup gates

### Service factory
- validates adapter mode
- validates core config
- warns if SharePoint config is incomplete
- builds singleton service container

### Explicit rollout-posture validation
- `validateRolloutPostureConfig()`
- rollout inventory includes identity, audience, storage, telemetry, SharePoint URLs, CORS inventory, build identity stamps, and readiness app-role

### Safety-specific binding validation
- `validateSafetyBackendBindings()` checks:
  - `SHAREPOINT_TENANT_URL`
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`

## Safety implementation map

### Route layer
`backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

Responsibilities:
- request parsing
- auth/scope/admin gates
- adapter-mode selection
- structured 400 / 422 / 500 shaping
- delegation to `SharePointService`

### Facade layer
`backend/functions/src/services/sharepoint-service.ts`

Responsibilities:
- preserve stable external service surface
- delegate provisioning to provisioning service
- delegate Safety provisioning to `SafetyProvisioningService`
- delegate Safety ingest / preview / replay to `SafetyIngestionApplicationService`

### Safety ingestion application service
`backend/functions/src/services/safety-ingestion-application-service.ts`

Responsibilities:
- resolve site targets
- validate reference lists
- validate ingestion contracts
- resolve graph GUID overlay
- evaluate preview
- block commit when preview is not commit-ready
- fetch reporting period via repository
- commit via graph repository
- emit telemetry and classify failures

### Safety ingestion graph repository
`backend/functions/src/services/safety-ingestion-graph-repository.ts`

Responsibilities:
- upload workbook file through Graph
- parse workbook and run ingestion pipeline
- resolve reporting period
- resolve project / legacy fallback
- detect duplicates
- create inspection events / findings / ingestion runs
- update project-week rollups
- replay from prior upload
- enforce concurrency-safe updates

### Safety ingestion graph data plane
`backend/functions/src/services/safety-ingestion-graph-data-plane.ts`

Responsibilities:
- acquire Graph tokens
- resolve site IDs
- get/list/create/update list items
- upload/download files
- retry transient failures
- classify Graph failures
- emit graph failure telemetry

## Deployment / release map

### Packaging
`scripts/package-functions-artifact.ts`

Packaging behavior:
- build selected workspace packages
- deploy backend package to staging directory
- copy `host.json`
- resolve/rewrite main entrypoint
- assert required files
- assert admin-control-plane and safety route proof signatures
- import staged entrypoint
- zip artifact
- emit deterministic manifest

### Health/deploy proof
- `/api/health` exposes build version / commit / timestamp
- deploy pipeline stamps these values into app settings before/after deploy verification

## Workbook parsing map

### Contract definition
`packages/features/safety/src/domain/templateContract.ts`

Key contract elements:
- parser sheet name: `ParserMeta`
- accepted template marker: `SafetyChecklist_v1`
- accepted parser contract version: `parse-first-2026-04`
- named ranges for inspection date/number/project site/totals/score/key findings/reporting period metadata

### Parser access
`packages/features/safety/src/parser/contractWorkbookAccess.ts`

Priority model:
- parser-meta
- named range
- legacy
- none

### Metadata extraction
`packages/features/safety/src/parser/extractMetadata.ts`

Behavior:
- prefers `ParserMeta`
- then named ranges
- then legacy visible-sheet fallback only when markers are absent

### Template validation
`packages/features/safety/src/parser/validateTemplate.ts`

Behavior:
- enforces required sheets
- validates anchor labels and response headers
- validates parser markers when present
- validates date / inspection number
- validates reporting-period metadata completeness
- validates key findings seam when markers are present

## Specific blocker map

Live evidence says:
- provisioning dry-run works
- ingest fails with `401` when fetching reporting period

Repo path for that seam is:
1. `safety-records/ingest` route
2. `SharePointService.ingestSafetyWorkbook()`
3. `SafetyIngestionApplicationService.ingestSafetyWorkbook()`
4. `SafetyIngestionGraphRepository.getReportingPeriod()`
5. `SafetyIngestionGraphDataPlane.getItemById()`
6. Graph token acquisition + Graph list item GET

That is the narrowest authoritative blocker path visible in current repo truth.

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

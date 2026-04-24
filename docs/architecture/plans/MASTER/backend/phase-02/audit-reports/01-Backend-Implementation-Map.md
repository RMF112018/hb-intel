# 01 — Backend Implementation Map

## Runtime and composition

The backend uses the Azure Functions Node v4 programming model with a code-centric registration approach. `backend/functions/package.json` points `main` to `./dist/index.js`, and `backend/functions/src/index.ts` registers functions through side-effect imports.

### Main runtime layers

- `backend/functions/src/index.ts`
  - monolithic composition root
  - imports all route modules
  - imports health and timer functions
- `backend/functions/host.json`
  - global host config
  - Application Insights sampling
  - function timeout
  - HTTP route prefix and CORS config

## Route families

### Safety record-keeping routes

Registered in:
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

Routes:
- `POST /api/safety-records/provision-sharepoint`
- `POST /api/safety-records/ingest`
- `POST /api/safety-records/ingest/preview`
- `POST /api/safety-records/replay`

Auth model:
- all routes are `authLevel: 'anonymous'`
- actual auth enforced in-process via `withAuth()`
- admin provisioning route adds `requireAdmin()`
- ingest / preview / replay add `requireDelegatedScope()`

### Health route

Registered in:
- `backend/functions/src/functions/health/index.ts`

Route:
- `GET /api/health`

Behavior:
- anonymous
- always returns HTTP 200
- emits readiness in body, not status

### Other route families

The monolithic host also imports provisioning, proxy, timer, SignalR, project requests, acknowledgments, notifications, legacy fallback, and a set of business-domain routes.

## Identity and auth seams

### Inbound auth

Files:
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/authorization.ts`

Key behavior:
- Bearer token extraction
- Entra JWT verification via JOSE + remote JWKS
- required production env:
  - `AZURE_TENANT_ID`
  - `API_AUDIENCE`
- app-role and delegated-scope checks
- app-only tokens explicitly recognized

### Outbound auth

File:
- `backend/functions/src/services/managed-identity-token-service.ts`

Key behavior:
- `DefaultAzureCredential`
- token cache
- app-only Graph token acquisition
- SharePoint token acquisition still supported for PnP seams
- guidance assumes user-assigned MI via `AZURE_CLIENT_ID`

## Safety ingestion seams

### Current authoritative service seam

File:
- `backend/functions/src/services/sharepoint-service.ts`

This class currently acts as a large service facade that still owns:

- provisioning operations
- SharePoint/PnP operations
- list creation and repair
- Safety provisioning
- Safety preview
- Safety ingest orchestration
- Safety replay orchestration

This is too much authority for one service.

### Current authoritative Safety data-plane seam

Files:
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`

Responsibilities:
- upload workbook to upload library through Graph
- resolve reporting periods through Graph
- resolve project / legacy fallback through Graph
- detect duplicates via bounded Graph list queries
- create inspection event records
- create findings
- create/update project-week rollups
- replay ingestion runs
- perform ETag-protected updates where needed

### Preview and commit gating seam

File:
- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts`

Responsibilities:
- open workbook
- validate template
- parse checklist
- validate reporting-period fit
- resolve project
- assess duplicate/supersession risk
- return preview diagnostics
- gate commit readiness

## Workbook parser seams

Files:
- `packages/features/safety/src/parser/xlsxWorkbookView.ts`
- `packages/features/safety/src/parser/contractWorkbookAccess.ts`
- `packages/features/safety/src/parser/extractMetadata.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `packages/features/safety/src/domain/templateContract.ts`

Authority order already present in code:
1. `ParserMeta`
2. named ranges
3. legacy visible-cell fallback when parser markers are absent

Parser contract support already exists for:
- template markers
- parser contract markers
- inspection date
- inspection number
- project/site text
- totals
- safety score
- reporting-week derivation markers
- key findings normalization seam

## Configuration and readiness seams

Files:
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/functions/health/index.ts`

Key characteristics:
- tiered config validation
- provisioning gate validation
- rollout-readiness and permission-posture shaping
- environment-driven readiness body

## Deployment and release seams

Files:
- `.github/workflows/main_hb-intel-function-app.yml`
- `backend/functions/package.json`

Current deployment posture:
- CI/CD workflow currently builds and zips from repository root
- workflow uses `npm install` and `npm run build` at root scope
- resulting artifact posture is not tight enough for a monorepo backend package on Flex Consumption
- deployment integrity therefore remains suspect until packaging is narrowed and proven


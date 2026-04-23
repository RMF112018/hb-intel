# 01 — Backend Implementation Map

## 1. Runtime and host composition
The backend uses Azure Functions v4-style code-centric registration. The monolithic entry point (`backend/functions/src/index.ts`) is not the active source of the Safety routes. The Safety routes are registered through the scoped admin-control-plane host:
- `backend/functions/src/hosts/admin-control-plane/index.ts` imports `../../functions/adminApi/index.js`
- `backend/functions/src/functions/adminApi/index.ts` side-effect imports `./safety-record-keeping-routes.js`

This matters operationally because deployment correctness for the Safety lane depends on the admin-control-plane host boundary, not on the monolithic host alone.

## 2. Route families relevant to this audit
### Safety routes
- `POST /api/admin/safety-records/provision-sharepoint`
- `POST /api/admin/safety-records/ingest`

### Shared enforcement around those routes
- `withAuth()` middleware for bearer extraction and JWT validation
- `requireDelegatedScope()` on both Safety routes
- `requireAdmin()` on provisioning, but not on ingest

### Implication
Provisioning is admin-protected. Ingestion is broader: any caller with the required delegated scope can invoke it. That may be valid for the intended product workflow, but it is not explicit enough for a privileged record-writing backend lane.

## 3. Identity/auth seams
### Inbound
- `validateToken.ts` validates Entra-issued JWTs using JWKS.
- Production requires explicit `AZURE_TENANT_ID` and `API_AUDIENCE`.
- App-only tokens are recognized and delegated-scope checks are bypassed for workload identities.

### Outbound
There are currently multiple outbound identity surfaces:
- Managed identity / `DefaultAzureCredential` service boundary in `managed-identity-token-service.ts`
- Graph service path(s) in the admin control plane
- SharePoint/PnP/REST paths in `sharepoint-service.ts`
- SharePoint REST repository calls in `SharePointSafetyInspectionRepository.ts`

This is the split model the cutover plan is meant to remove.

## 4. Safety provisioning path
`SharePointService.provisionSafetyRecordKeepingSharePoint()`:
- resolves authoritative site targets,
- validates required reference lists,
- provisions bounded containers,
- returns structured dry-run or mutation diagnostics.

This lane is already functioning in dry-run based on live evidence.

## 5. Safety ingestion path
`SharePointService.ingestSafetyWorkbook()`:
1. logs request receipt,
2. resolves authoritative targets,
3. validates required reference lists,
4. validates list field contracts,
5. resolves GUID overlay,
6. instantiates `SharePointSafetyInspectionRepository({ client: this.createSafetyAppOnlySpHttpClient() })`,
7. calls `repo.getReportingPeriod(...)`,
8. decodes workbook bytes,
9. calls repository ingestion/commit flow.

### Architectural consequence
The provisioning lane and ingestion lane share some preflight logic, but they diverge at the operational data plane. The current blocker exists exactly at that divergence.

## 6. Repository seam
`packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts` is a SharePoint REST adapter, not a Graph adapter. It:
- reads list items via `_api/web/lists(guid'...')/items(...)`,
- writes list items via `_api/web/lists(guid'...')/items`,
- updates rollups and supersession via REST MERGE semantics,
- depends on GUID overlays and REST request metadata types.

This repository is the current data-plane fault line.

## 7. Descriptor and topology seam
`packages/features/safety/src/lists/descriptors.ts` correctly models the intended topology:
- authoritative structured Safety lists on `/sites/HBCentral`
- upload library on `/sites/Safety`
- `Projects` and `Legacy Project Fallback Registry` as first-class reference descriptors

This topology can survive the cutover. The failing part is the repository implementation, not the conceptual list topology.

## 8. Parser seam
The current parser stack is still legacy-cell oriented:
- `xlsxWorkbookView.ts` reads by sheet/cell only
- `validateTemplate.ts` validates visible anchors only
- `extractMetadata.ts` reads B3/E3/B4 and a single visible key-findings cell
- `templateContract.ts` hardcodes visible-cell addresses and parser version constants

It does not currently consume:
- the hidden `ParserMeta` sheet,
- named ranges,
- workbook template identity markers,
- parser contract version markers,
- or the normalized key-findings seam.

## 9. Deployment/build seam
`backend/functions/package.json` publishes `dist` and `host.json`. The app uses the Functions v4 package/runtime model, but route truth still depends on which host composition is built and deployed. That is now a release-integrity concern, not a coding-style detail.

## 10. Observability seam
The backend already emits:
- auth success/error events,
- handler invoke/success/error events,
- JSON-structured logs,
- request ids,
- and explicit ingestion start/finish/failure records.

This is valuable groundwork, but it is not yet the same thing as full production observability discipline for the Safety lane.

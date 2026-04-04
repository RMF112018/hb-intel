# Admin SPFx IT Control Center — Phase 12 Observability API Map

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-05 — re-audit against current repo truth
**Prerequisites:** P12-03 shared contracts, P12-04 persistence adapters

---

## 1. Purpose

This document inventories the backend observability API endpoints, their request/response shapes, auth expectations, correlation semantics, query capabilities, and explicit non-goals.

This revision reflects repo truth after Phase 12 execution through P12-09, including a route registration fix applied during this audit.

---

## 2. Endpoint inventory

All endpoints are registered in `backend/functions/src/functions/adminApi/observability-routes.ts` and loaded via side-effect import in `index.ts`.

### Alert endpoints (6 routes)

| Method | Route | Function | Purpose | Status |
|--------|-------|----------|---------|--------|
| GET | `admin/observability/alerts` | `obsListAlerts` | List alerts with filters | **Implemented** |
| GET | `admin/observability/alerts/{alertId}` | `obsGetAlert` | Get single alert | **Implemented** |
| POST | `admin/observability/alerts/{alertId}/acknowledge` | `obsAcknowledgeAlert` | Acknowledge alert | **Implemented** |
| POST | `admin/observability/alerts/{alertId}/resolve` | `obsResolveAlert` | Resolve alert | **Implemented** |
| GET | `admin/observability/alerts/summary` | `obsGetAlertSummary` | Aggregated counts | **Implemented** |
| POST | `admin/observability/alerts/ingest` | `obsIngestAlerts` | Ingest from monitors | **Implemented** |

### Probe endpoints (4 routes)

| Method | Route | Function | Purpose | Status |
|--------|-------|----------|---------|--------|
| GET | `admin/observability/probes/latest` | `obsGetLatestProbeSnapshot` | Latest snapshot | **Implemented** |
| POST | `admin/observability/probes/snapshots` | `obsSubmitProbeSnapshot` | Persist results | **Implemented** |
| GET | `admin/observability/probes/history` | `obsListProbeSnapshots` | Snapshot history | **Implemented** |
| GET | `admin/observability/probes/health` | `obsGetProbeHealthSummary` | Health summary | **Implemented** |

### Error endpoints (3 routes)

| Method | Route | Function | Purpose | Status |
|--------|-------|----------|---------|--------|
| GET | `admin/observability/errors` | `obsListErrors` | List/query errors | **Implemented** |
| GET | `admin/observability/errors/{errorId}` | `obsGetError` | Get single error | **Implemented** |
| POST | `admin/observability/errors/ingest` | `obsIngestErrors` | Ingest errors | **Implemented** |

### Composite endpoints (2 routes)

| Method | Route | Function | Purpose | Status |
|--------|-------|----------|---------|--------|
| GET | `admin/observability/dashboard` | `obsGetDashboardSummary` | Unified summary | **Implemented** (incident counts stubbed to 0) |
| GET | `admin/observability/timeline/{runId}` | `obsGetRunTimeline` | Correlated timeline | **Implemented** (cursor pagination stubbed) |

**Total:** 15 routes, all implemented and using real store operations.

---

## 3. Request/response shapes

### List endpoints (GET)

**Query parameters:**

| Endpoint | Parameters |
|----------|-----------|
| List alerts | `status`, `category`, `severity`, `domain`, `from`, `to`, `cursor`, `limit` |
| List probe snapshots | `probeKey`, `from`, `to`, `cursor`, `limit` |
| List errors | `domain`, `source`, `classification`, `severity`, `runId`, `from`, `to`, `cursor`, `limit` |
| Timeline | `limit` (via route param `runId`) |

**Limit handling:** Clamped to min(200, default 50) on all list endpoints.

**Response shape** (all list endpoints):
```json
{
  "data": {
    "items": [...],
    "nextCursor": "string | null",
    "totalCount": 42
  }
}
```

### Detail endpoints (GET)

**Response shape:**
```json
{ "data": { ...record } }
```

Returns `404` with `{ "code": "NOT_FOUND", "message": "..." }` if not found.

### Action endpoints (POST acknowledge/resolve)

**Request body:** None (actor resolved from JWT via `actorContextResolver`).

**Response shape:** `{ "data": { ...updatedRecord } }`

Returns `404` if alert not found, `400` for other errors.

### Ingestion endpoints (POST ingest)

**Request body (alerts):**
```json
{
  "alerts": [...IObservabilityAlertIngestionItem],
  "evaluatedAt": "ISO 8601"
}
```

**Request body (errors):**
```json
{
  "errors": [...IObservabilityErrorIngestionItem]
}
```

**Request body (probe snapshot):**
```json
{
  "snapshotId": "UUID",
  "capturedAt": "ISO 8601",
  "triggerMode": "scheduled | manual",
  "results": [...IObservabilityProbeResultRecord]
}
```

**Response:** `202 Accepted` with `{ "data": [...persistedRecords] }`

**Validation:** Returns `400` if required fields are missing.

### Dashboard summary (GET)

**Response shape:**
```json
{
  "data": {
    "alerts": { "criticalCount", "highCount", "mediumCount", "lowCount", "totalActiveCount", "mostRecentAt" },
    "probes": { "overallStatus", "healthyCount", "degradedCount", "errorCount", "unknownCount", "isStale", "lastSnapshotAt" },
    "errors": { "totalCount", "criticalCount", "highCount" },
    "incidents": { "openCount": 0, "investigatingCount": 0 },
    "computedAt": "ISO 8601"
  }
}
```

**Note:** Incident counts are stubbed to 0 pending incident management implementation.

---

## 4. Auth expectations

All observability endpoints require:

1. **Bearer token** — validated by `withAuth` middleware
2. **Delegated scope** — `access_as_user` via `requireDelegatedScope`
3. **Admin role** — `Admin` or `HBIntelAdmin` via `requireAdmin`

Actor context for write operations (acknowledge, resolve) is resolved from the validated JWT claims via `actorContextResolver`.

All routes are wrapped with `withTelemetry()` for operation tracking (domain: `observability`, operation per handler).

---

## 5. Correlation semantics

| Key | Used by | Purpose |
|-----|---------|---------|
| `runId` | Alerts, errors, timeline | Links observability records to admin runs |
| `domain` | All records | Partitions by admin domain |
| `alertId` | Alert endpoints | Unique alert identity |
| `errorId` | Error endpoints | Unique error event identity |
| `dedupeKey` | Alert ingestion | Prevents duplicate alerts from repeated monitor cycles |
| `actionKey` | Error records, emitter | Links to specific admin action |
| `stepNumber` | Error records | Links to provisioning step |

The **timeline endpoint** (`/timeline/{runId}`) assembles a correlated view by joining:
- Audit events (from `AdminAuditEvents` table via `auditService.listByRunId`)
- Alerts (from `ObservabilityAlerts` table filtered by `runId`)
- Error events (from `ObservabilityErrors` table filtered by `runId`)

All items are merged into `IObservabilityTimelineItem` instances (discriminated by `kind`), sorted by timestamp (most recent first), and limited by query parameter.

---

## 6. Query/filter capabilities

| Filter | Alerts | Probes | Errors |
|--------|--------|--------|--------|
| Status | Yes | -- | -- |
| Category | Yes | -- | -- |
| Severity | Yes | -- | Yes |
| Domain | Yes | -- | Yes |
| Source | -- | -- | Yes |
| Classification | -- | -- | Yes |
| ProbeKey | -- | Yes | -- |
| RunId | -- | -- | Yes |
| Date range (from/to) | Yes | Yes | Yes |
| Cursor pagination | Supported (stub) | Supported (stub) | Supported (stub) |
| Limit (max 200, default 50) | Yes | Yes | Yes |

**Note:** Cursor-based pagination is accepted in query parameters but all stores currently return `nextCursor: null` (full result sets limited by `query.limit`).

---

## 7. Telemetry normalization

### Error emitter (`observability-emitter.ts`)

Fire-and-forget error record ingestion from route error handlers.

| Function | Purpose |
|----------|---------|
| `emitRouteError(services, ctx, err)` | Classifies route errors and ingests into error store |

**Classification heuristics** (`classifyRouteError(message)`):

| Pattern match | Classification | Severity |
|---------------|---------------|----------|
| `"not found"` | Structural | Medium |
| `"permission"` / `"unauthorized"` / `"forbidden"` | Permissions | **High** |
| `"timeout"` / `"econnrefused"` / `"network"` | Transient | Medium |
| `"invalid state"` / `"conflict"` | AdminClass | Medium |
| Default | Unclassified | Medium |

**Integration:** Called in catch blocks of admin run routes (e.g., `adminCancelRun`, `adminRetryRun`) with context including `domain`, `source`, `operation`, `runId`, and `actionKey`.

### Telemetry bridge (`observability-telemetry-bridge.ts`)

Fire-and-forget normalization from provisioning saga events to durable observability records.

| Function | Input | Output |
|----------|-------|--------|
| `bridgeFailureToErrorStore` | `IObservabilityBridgeEvent` | Durable error record |
| `bridgeAlertEvaluationToStore` | `IObservabilityAlertIngestionPayload` | Durable alert records |
| `createObservabilityBridge` | Alert + error stores | Bound bridge instance |

**Failure classification mapping:**

| Saga failure class | Observability classification |
|-------------------|------------------------------|
| `transient` | `ObservabilityErrorClassification.Transient` |
| `permissions` | `ObservabilityErrorClassification.Permissions` |
| `structural` | `ObservabilityErrorClassification.Structural` |
| `repeated` | `ObservabilityErrorClassification.Repeated` |
| `admin-class` | `ObservabilityErrorClassification.AdminClass` |
| `null` / unknown | `ObservabilityErrorClassification.Unclassified` |

### Raw telemetry vs normalized records

Raw Application Insights telemetry (`_telemetryType: 'customEvent'`) continues to be emitted unchanged via `withTelemetry()` wrapper. The bridge and emitter create a **parallel normalized projection** — the same facts as typed records in Table Storage. Neither depends on the other.

---

## 8. Services

| Service | File | Purpose | Status |
|---------|------|---------|--------|
| `assembleDashboardSummary` | `observability-dashboard-service.ts` | Combines alert + probe + error summaries in parallel with error resilience | **Implemented** (incident section stubbed) |
| `assembleRunTimeline` | `observability-timeline-service.ts` | Joins audit + alert + error records by runId with mapper functions | **Implemented** (cursor pagination stubbed) |
| `createObservabilityBridge` | `observability-telemetry-bridge.ts` | Fire-and-forget normalization from saga events to stores | **Implemented** |
| `emitRouteError` | `observability-emitter.ts` | Fire-and-forget error classification and ingestion from route handlers | **Implemented** |

---

## 9. Test coverage

| Test file | Cases | Coverage |
|-----------|-------|----------|
| `observability-api.test.ts` (435 lines) | ~15 | Dashboard assembly, timeline merging/sorting, bridge functions |
| `observability-stores.test.ts` (596 lines) | 28 | Store CRUD, serialization, deduplication, health summaries |
| `observability-instrumentation.test.ts` (224 lines) | ~10 | Telemetry bridge, alert evaluation normalization, failure classification |

**Gap:** No dedicated handler-level tests for route HTTP request/response handling (auth, query parsing, error responses). Service-level coverage is comprehensive.

---

## 10. Route registration fix (P13-05)

During this audit, the observability routes file (`observability-routes.ts`) was found to be **not imported** in `index.ts`. While the file uses `app.http()` for self-registration, Azure Functions requires the module to be loaded for the `app.http()` calls to execute. Without the import, all 15 observability routes were dead code at runtime.

**Fix applied:** Added side-effect import `import './observability-routes.js'` in `index.ts`, following the same pattern used for `white-glove-routes.js`.

---

## 11. Explicit non-goals

- **Incident management APIs** — incident creation/resolution deferred to later work.
- **Retention cleanup endpoints** — retention is a backend timer concern, not an API surface.
- **Frontend Application Insights SDK** — backend-only telemetry in Wave 0.
- **Full-text search** — error message search is not supported in this iteration.
- **WebSocket/SSE push** — polling remains the SPFx data freshness strategy.
- **Probe execution from the backend** — probes continue to execute client-side; the backend only persists results.

---

## 12. Remaining work

| Item | Status | Notes |
|------|--------|-------|
| Incident management endpoints | **Not implemented** | Dashboard returns stubbed incident counts |
| Cursor-based pagination | **Not implemented** | All stores return `nextCursor: null` |
| Route-level handler tests | **Gap** | Service tests cover logic; handler HTTP tests missing |
| Cross-domain error emission | **Partial** | Only admin run cancel/retry routes emit; SharePoint/Entra/standards routes pending (P12-07) |

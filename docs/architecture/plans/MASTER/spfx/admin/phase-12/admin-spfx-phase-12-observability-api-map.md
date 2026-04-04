# Admin SPFx IT Control Center — Phase 12 Observability API Map

**Created:** 2026-04-04
**Prompt:** P12-05 — Backend Observability APIs and Telemetry Normalization
**Prerequisites:** P12-03 shared contracts, P12-04 persistence adapters

---

## 1. Purpose

This document inventories the backend observability API endpoints, their request/response shapes, auth expectations, correlation semantics, query capabilities, and explicit non-goals.

---

## 2. Endpoint inventory

All endpoints are registered in `backend/functions/src/functions/adminApi/observability-routes.ts`.

### Alert endpoints

| Method | Route | Function | Purpose |
|--------|-------|----------|---------|
| GET | `admin/observability/alerts` | `obsListAlerts` | List alerts with filters |
| GET | `admin/observability/alerts/{alertId}` | `obsGetAlert` | Get single alert |
| POST | `admin/observability/alerts/{alertId}/acknowledge` | `obsAcknowledgeAlert` | Acknowledge alert |
| POST | `admin/observability/alerts/{alertId}/resolve` | `obsResolveAlert` | Resolve alert |
| GET | `admin/observability/alerts/summary` | `obsGetAlertSummary` | Aggregated counts |
| POST | `admin/observability/alerts/ingest` | `obsIngestAlerts` | Ingest from monitors |

### Probe endpoints

| Method | Route | Function | Purpose |
|--------|-------|----------|---------|
| GET | `admin/observability/probes/latest` | `obsGetLatestProbeSnapshot` | Latest snapshot |
| POST | `admin/observability/probes/snapshots` | `obsSubmitProbeSnapshot` | Persist results |
| GET | `admin/observability/probes/history` | `obsListProbeSnapshots` | Snapshot history |
| GET | `admin/observability/probes/health` | `obsGetProbeHealthSummary` | Health summary |

### Error endpoints

| Method | Route | Function | Purpose |
|--------|-------|----------|---------|
| GET | `admin/observability/errors` | `obsListErrors` | List/query errors |
| GET | `admin/observability/errors/{errorId}` | `obsGetError` | Get single error |
| POST | `admin/observability/errors/ingest` | `obsIngestErrors` | Ingest errors |

### Composite endpoints

| Method | Route | Function | Purpose |
|--------|-------|----------|---------|
| GET | `admin/observability/dashboard` | `obsGetDashboardSummary` | Unified summary |
| GET | `admin/observability/timeline/{runId}` | `obsGetRunTimeline` | Correlated timeline |

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

**Request body:** None (actor resolved from JWT).

**Response shape:** `{ "data": { ...updatedRecord } }`

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

### Dashboard summary (GET)

**Response shape:**
```json
{
  "data": {
    "alerts": { "criticalCount", "highCount", "mediumCount", "lowCount", "totalActiveCount" },
    "probes": { "overallStatus", "healthyCount", ..., "isStale" },
    "errors": { "totalCount", "criticalCount", "highCount" },
    "incidents": { "openCount", "investigatingCount" },
    "computedAt": "ISO 8601"
  }
}
```

---

## 4. Auth expectations

All observability endpoints require:

1. **Bearer token** — validated by `withAuth` middleware
2. **Delegated scope** — `access_as_user` via `requireDelegatedScope`
3. **Admin role** — `Admin` or `HBIntelAdmin` via `requireAdmin`

Actor context for write operations (acknowledge, resolve) is resolved from the validated JWT claims via `actorContextResolver`.

---

## 5. Correlation semantics

| Key | Used by | Purpose |
|-----|---------|---------|
| `runId` | Alerts, errors, timeline | Links observability records to admin runs |
| `domain` | All records | Partitions by admin domain |
| `alertId` | Alert endpoints | Unique alert identity |
| `errorId` | Error endpoints | Unique error event identity |
| `dedupeKey` | Alert ingestion | Prevents duplicate alerts from repeated monitor cycles |

The **timeline endpoint** (`/timeline/{runId}`) assembles a correlated view by joining:
- Audit events (from `AdminAuditEvents` table via `auditService.listByRunId`)
- Alerts (from `ObservabilityAlerts` table filtered by `runId`)
- Error events (from `ObservabilityErrors` table filtered by `runId`)

All items are merged and sorted by timestamp (most recent first).

---

## 6. Query/filter capabilities

| Filter | Alerts | Probes | Errors |
|--------|--------|--------|--------|
| Status | Yes | — | — |
| Category | Yes | — | — |
| Severity | Yes | — | Yes |
| Domain | Yes | — | Yes |
| Source | — | — | Yes |
| Classification | — | — | Yes |
| ProbeKey | — | Yes | — |
| RunId | — | — | Yes |
| Date range (from/to) | Yes | Yes | Yes |
| Cursor pagination | Yes | Yes | Yes |
| Limit (max 200) | Yes | Yes | Yes |

---

## 7. Telemetry normalization

### Bridge pattern

`observability-telemetry-bridge.ts` provides fire-and-forget normalization:

| Function | Input | Output |
|----------|-------|--------|
| `bridgeFailureToErrorStore` | `IObservabilityBridgeEvent` | Durable error record |
| `bridgeAlertEvaluationToStore` | `IObservabilityAlertIngestionPayload` | Durable alert records |
| `createObservabilityBridge` | Alert + error stores | Bound bridge instance |

### Failure classification mapping

| Saga failure class | Observability classification |
|-------------------|------------------------------|
| `transient` | `ObservabilityErrorClassification.Transient` |
| `permissions` | `ObservabilityErrorClassification.Permissions` |
| `structural` | `ObservabilityErrorClassification.Structural` |
| `repeated` | `ObservabilityErrorClassification.Repeated` |
| `admin-class` | `ObservabilityErrorClassification.AdminClass` |
| `null` / unknown | `ObservabilityErrorClassification.Unclassified` |

### Raw telemetry vs normalized records

Raw Application Insights telemetry (`_telemetryType: 'customEvent'`) continues to be emitted unchanged. The bridge creates a **parallel normalized projection** — the same facts as typed records in Table Storage. Neither depends on the other.

---

## 8. Services introduced

| Service | File | Purpose |
|---------|------|---------|
| `assembleDashboardSummary` | `observability-dashboard-service.ts` | Combines alert + probe + error summaries |
| `assembleRunTimeline` | `observability-timeline-service.ts` | Joins audit + alert + error records by runId |
| `createObservabilityBridge` | `observability-telemetry-bridge.ts` | Fire-and-forget normalization bridge |

---

## 9. Explicit non-goals

- **Incident management APIs** — incident creation/resolution deferred to later Phase 12 prompts.
- **Retention cleanup endpoints** — retention is a backend timer concern, not an API surface.
- **Frontend Application Insights SDK** — backend-only telemetry in Wave 0.
- **Full-text search** — error message search is not supported in this iteration.
- **WebSocket/SSE push** — polling remains the SPFx data freshness strategy.
- **Probe execution from the backend** — probes continue to execute client-side; the backend only persists results.

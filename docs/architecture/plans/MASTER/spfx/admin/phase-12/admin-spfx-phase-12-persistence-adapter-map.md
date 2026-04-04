# Admin SPFx IT Control Center — Phase 12 Persistence Adapter Map

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-04 — re-audit against current repo truth
**Prerequisites:** P12-01 gap map, P12-02 baseline and storage model, P12-03 shared contracts

---

## 1. Purpose

This document maps the Phase 12 observability persistence adapters — their ownership, storage targets, entity shapes, key indexes, mock behavior, and production behavior.

This revision reflects repo truth after Phase 12 execution through P12-09. All three observability stores are fully implemented with durable and mock variants.

---

## 2. Adapter ownership

All observability persistence adapters live in `backend/functions/src/services/admin-control-plane/` alongside the existing Phase 4 admin stores.

| Adapter file | Durable class | Mock class | Interface | Methods | Status |
|-------------|--------------|------------|-----------|---------|--------|
| `observability-alert-store.ts` | `DurableObservabilityAlertStore` | `MockObservabilityAlertStore` | `IObservabilityAlertStore` | 6 public + 1 private | **Complete** |
| `observability-probe-store.ts` | `DurableObservabilityProbeSnapshotStore` | `MockObservabilityProbeSnapshotStore` | `IObservabilityProbeSnapshotStore` | 4 public + 1 helper | **Complete** |
| `observability-error-store.ts` | `DurableObservabilityErrorStore` | `MockObservabilityErrorStore` | `IObservabilityErrorStore` | 3 public | **Complete** |

All interfaces are defined in `types.ts` within the same directory and exported from the barrel `index.ts`.

---

## 3. Storage targets

| Table name | Write mode | Purpose | Status |
|-----------|-----------|---------|--------|
| `ObservabilityAlerts` | Upsert (Replace) | Alert records with lifecycle state transitions | **Implemented** |
| `ObservabilityProbeSnapshots` | Upsert (Replace) | Probe snapshot records (functionally append-only; new snapshots added, old preserved) | **Implemented** |
| `ObservabilityErrors` | Insert (append-only) | Append-only error event records | **Implemented** |

All tables use Azure Table Storage via `createAppTableClient()` from the shared table-client factory. Table creation is lazy and idempotent (errors on already-existing tables are caught).

---

## 4. Entity shapes and key design

### ObservabilityAlerts

| Field | Table Storage type | Source |
|-------|-------------------|--------|
| **PartitionKey** | String | `category` (ObservabilityAlertCategory) |
| **RowKey** | String | `alertId` (UUID v4) |
| category | String | Alert category enum value |
| severity | String | Current severity level |
| previousSeverity | String | Previous severity (empty string if null) |
| status | String | Alert lifecycle status |
| title | String | Human-readable title |
| description | String | Human-readable description |
| affectedEntityType | String | Entity type classification |
| affectedEntityId | String | Entity identifier |
| domain | String | AdminDomain value (empty string if null) |
| runId | String | Correlated run ID (empty string if null) |
| occurredAt | String | ISO 8601 when condition detected |
| ingestedAt | String | ISO 8601 when persisted |
| acknowledgedAt | String | ISO 8601 (empty string if null) |
| acknowledgedByJson | String | JSON-serialized IAdminActorContext |
| resolvedAt | String | ISO 8601 (empty string if null) |
| resolvedByJson | String | JSON-serialized IAdminActorContext |
| dedupeKey | String | Monitor-generated deduplication key |
| evaluationCount | Number | Times re-evaluated with same dedupeKey |
| lastEvaluatedAt | String | ISO 8601 of most recent evaluation |
| ctaLabel | String | CTA button label (empty string if null) |
| ctaHref | String | CTA navigation href (empty string if null) |

**Key lookup paths:**
- By category: `PartitionKey eq '{category}'`
- By alertId: `RowKey eq '{alertId}'`
- By dedupeKey within category: `PartitionKey eq '{category}' and dedupeKey eq '{dedupeKey}'`
- Active alerts: `status eq 'active'`

**Public methods:**
| Method | Purpose |
|--------|---------|
| `ingestAlerts(payload)` | Ingest with deduplication by dedupeKey; increments evaluationCount and tracks severity transitions on duplicates |
| `getAlert(alertId)` | Retrieve single alert by ID |
| `listAlerts(query)` | Filtered list with status/category/severity/domain/date range |
| `acknowledgeAlert(alertId, actor)` | Set status to Acknowledged with actor context |
| `resolveAlert(alertId, actor)` | Set status to Resolved with actor context |
| `getAlertSummary()` | Aggregated counts by severity for active alerts |

### ObservabilityProbeSnapshots

| Field | Table Storage type | Source |
|-------|-------------------|--------|
| **PartitionKey** | String | `__snapshot__` (fixed partition for all snapshots) |
| **RowKey** | String | `snapshotId` (UUID v4) |
| capturedAt | String | ISO 8601 when probes executed |
| persistedAt | String | ISO 8601 when persisted |
| triggerMode | String | `'scheduled'` or `'manual'` |
| resultsJson | String | JSON-serialized array of IObservabilityProbeResultRecord |
| overallStatus | String | Worst status among all probe results |

**Key lookup paths:**
- All snapshots: `PartitionKey eq '__snapshot__'`
- Latest: scan all + sort by capturedAt descending
- By date range: `capturedAt ge '{from}' and capturedAt le '{to}'`

**Public methods:**
| Method | Purpose |
|--------|---------|
| `saveSnapshot(payload)` | Save probe snapshot with computed overallStatus (worst-wins priority: error > degraded > unknown > healthy) |
| `getLatestSnapshot()` | Retrieve most recent snapshot by capturedAt |
| `listSnapshots(query)` | Filtered list with date range and probeKey filtering |
| `getHealthSummary()` | Aggregated counts by status with staleness detection (30-minute threshold) |

### ObservabilityErrors

| Field | Table Storage type | Source |
|-------|-------------------|--------|
| **PartitionKey** | String | `domain` (AdminDomain) |
| **RowKey** | String | `errorId` (UUID v4) |
| domain | String | Admin domain enum value |
| source | String | Error source classification |
| classification | String | Error classification |
| severity | String | Severity level |
| title | String | Human-readable title |
| message | String | Error message |
| detailsJson | String | JSON-serialized details object |
| runId | String | Correlated run ID (empty string if null) |
| actionKey | String | Action key (empty string if null) |
| stepNumber | Number | Step number (-1 sentinel if null) |
| incidentId | String | Linked incident ID (empty string if null) |
| occurredAt | String | ISO 8601 when error occurred |
| ingestedAt | String | ISO 8601 when persisted |

**Key lookup paths:**
- By domain: `PartitionKey eq '{domain}'`
- By errorId: `RowKey eq '{errorId}'`
- By runId: `runId eq '{runId}'`
- By date range: `occurredAt ge '{from}' and occurredAt le '{to}'`

**Public methods:**
| Method | Purpose |
|--------|---------|
| `ingestErrors(payload)` | Append-only ingestion with auto-generated errorId; no deduplication |
| `getError(errorId)` | Retrieve single error by ID |
| `listErrors(query)` | Filtered list with domain/source/classification/severity/runId/date range |

---

## 5. Null serialization conventions

Consistent with the Phase 4 pattern established in `admin-run-store.ts`:

| Type | Null → Table Storage | Table Storage → Null |
|------|---------------------|---------------------|
| String | `''` (empty string) | `(value as string) \|\| null` |
| Number | `-1` sentinel | `value === -1 ? null : value` |
| JSON object | `JSON.stringify(null)` → `'null'` | `parseJsonOrNull()` checks for `'null'` string |

---

## 6. Mock vs production behavior

| Aspect | Mock (test/dev mode) | Production (real mode) |
|--------|---------------------|----------------------|
| Storage | In-memory arrays | Azure Table Storage |
| ID generation | Sequential (`alert-001`, `error-001`) | `crypto.randomUUID()` |
| Deduplication | Array `.find()` by dedupeKey | OData query by partition + dedupeKey |
| Queries | Array `.filter()` + `.sort()` | OData filter expressions |
| Pagination | `.slice(0, limit)` | Iterator break at limit |
| Table creation | N/A | Lazy `ensureTable()` with idempotent catch |
| Status computation | Same algorithm | Same algorithm |
| Staleness detection | Same threshold (30min) | Same threshold (30min) |

Both implementations satisfy the same `IObservabilityAlertStore`, `IObservabilityProbeSnapshotStore`, and `IObservabilityErrorStore` interfaces. 100% feature parity verified.

### Service factory wiring

In `backend/functions/src/hosts/admin-control-plane/service-factory.ts`:

```
const isMock = adapterMode === 'mock' || process.env.NODE_ENV === 'test';

observabilityAlertStore:  isMock ? new MockObservabilityAlertStore()  : new DurableObservabilityAlertStore(),
observabilityProbeStore:  isMock ? new MockObservabilityProbeSnapshotStore() : new DurableObservabilityProbeSnapshotStore(),
observabilityErrorStore:  isMock ? new MockObservabilityErrorStore()  : new DurableObservabilityErrorStore(),
```

Stores are registered in the `IAdminControlPlaneServiceContainer` interface and resolved at container creation with singleton caching.

---

## 7. Test coverage

Tests in `__tests__/observability-stores.test.ts` (28 test cases total):

| Category | Tests | Coverage |
|----------|-------|----------|
| Alert serialization round-trip | 3 | Full fields, partition/row key, null fields |
| Mock alert store behavior | 11 | Ingest, dedupe, severity escalation, acknowledge, resolve, error on not-found, filter by status, summary counts, getAlert null |
| Probe snapshot serialization round-trip | 2 | Full fields with nested results, partition/row key, trigger modes |
| Mock probe snapshot store behavior | 6 | Save/retrieve latest, overall status computation, null when empty, probeKey filtering, health summary staleness, health summary counts |
| Error record serialization round-trip | 2 | Full fields, partition/row key, null fields |
| Mock error store behavior | 4 | Ingest, get by ID, get null for non-existent, filtering by domain/source/classification/runId, limit |

---

## 8. Consumers

### Backend consumers (implemented)
| Consumer | Store used | Purpose |
|----------|-----------|---------|
| `observability-routes.ts` | All three | API endpoints for alerts, probes, errors, dashboard, timeline |
| `observability-emitter.ts` | Error store | Fire-and-forget error ingestion from route error handlers |

### Frontend consumers (implemented, indirect via API)
| Consumer | Data source | Purpose |
|----------|-----------|---------|
| `useAdminAlerts()` | Alert store via API | Alert polling, acknowledge, resolve |
| `useInfrastructureProbes()` | Probe store via API | Probe dashboard, refresh |
| `useObservabilityErrors()` | Error store via API | Error log page with filtering |

---

## 9. Relationship to existing Phase 4 stores

| Phase 4 store | Phase 12 observability store | Relationship |
|--------------|----------------------------|-------------|
| `AdminRuns` | — | Preserved as-is; observability stores link to runs via `runId` correlation |
| `AdminAuditEvents` | — | Preserved as-is; timeline queries join audit events with observability records |
| `AdminEvidence` | — | Preserved as-is; evidence references remain a separate concern |
| — | `ObservabilityAlerts` | Replaces in-memory `AdminAlertsApi` in `@hbc/features-admin` |
| — | `ObservabilityProbeSnapshots` | Replaces in-memory `InfrastructureProbeApi` in `@hbc/features-admin` |
| — | `ObservabilityErrors` | Provides data source for `ErrorLogPage` |

---

## 10. Remaining adapter work

| Item | Status | Notes |
|------|--------|-------|
| `ObservabilityIncidents` table adapter | **Not yet implemented** | Model defined in `@hbc/models`; persistence adapter pending |
| Cursor-based pagination | **Not yet implemented** | All `listXxx` methods return `nextCursor: null`; full result sets limited by `query.limit` |
| Retention cleanup function | **Not yet implemented** | Timer trigger for deleting records beyond retention threshold (90/180/365 days) |

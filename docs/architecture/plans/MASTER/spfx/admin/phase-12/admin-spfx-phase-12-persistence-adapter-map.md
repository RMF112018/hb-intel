# Admin SPFx IT Control Center — Phase 12 Persistence Adapter Map

**Created:** 2026-04-04
**Prompt:** P12-04 — Durable Persistence Adapters and Storage Plumbing
**Prerequisites:** P12-01 gap map, P12-02 baseline and storage model, P12-03 shared contracts

---

## 1. Purpose

This document maps the Phase 12 observability persistence adapters — their ownership, storage targets, entity shapes, key indexes, mock behavior, and production behavior.

---

## 2. Adapter ownership

All observability persistence adapters live in `backend/functions/src/services/admin-control-plane/` alongside the existing Phase 4 admin stores.

| Adapter file | Durable class | Mock class | Interface |
|-------------|--------------|------------|-----------|
| `observability-alert-store.ts` | `DurableObservabilityAlertStore` | `MockObservabilityAlertStore` | `IObservabilityAlertStore` |
| `observability-probe-store.ts` | `DurableObservabilityProbeSnapshotStore` | `MockObservabilityProbeSnapshotStore` | `IObservabilityProbeSnapshotStore` |
| `observability-error-store.ts` | `DurableObservabilityErrorStore` | `MockObservabilityErrorStore` | `IObservabilityErrorStore` |

All interfaces are defined in `types.ts` within the same directory and exported from the barrel `index.ts`.

---

## 3. Storage targets

| Table name | Write mode | Purpose |
|-----------|-----------|---------|
| `ObservabilityAlerts` | Upsert (Replace) | Alert records with lifecycle state transitions |
| `ObservabilityProbeSnapshots` | Upsert (Replace) | Append-only probe snapshot records |
| `ObservabilityErrors` | Insert (append-only) | Append-only error event records |

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

Both implementations satisfy the same `IObservabilityAlertStore`, `IObservabilityProbeSnapshotStore`, and `IObservabilityErrorStore` interfaces.

---

## 7. Test coverage

Tests in `__tests__/observability-stores.test.ts`:

| Category | Tests |
|----------|-------|
| Alert serialization round-trip | 3 (full fields, partition/row key, null fields) |
| Probe snapshot serialization round-trip | 3 (full fields with nested results, partition/row key, trigger mode) |
| Error record serialization round-trip | 3 (full fields, partition/row key, null fields) |
| Mock alert store behavior | 8 (ingest, dedupe, escalation, acknowledge, resolve, error on not-found, filter by status, summary counts, getAlert null) |
| Mock probe snapshot store behavior | 5 (save/retrieve latest, overall status computation, null when empty, filter by probeKey, health summary) |
| Mock error store behavior | 5 (ingest, retrieve by ID, null for non-existent, filter by domain, filter by source, filter by runId, limit) |

---

## 8. Relationship to existing Phase 4 stores

| Phase 4 store | Phase 12 observability store | Relationship |
|--------------|----------------------------|-------------|
| `AdminRuns` | — | Preserved as-is; observability stores link to runs via `runId` correlation |
| `AdminAuditEvents` | — | Preserved as-is; timeline queries join audit events with observability records |
| `AdminEvidence` | — | Preserved as-is; evidence references remain a separate concern |
| — | `ObservabilityAlerts` | New; replaces in-memory `AdminAlertsApi` in `@hbc/features-admin` |
| — | `ObservabilityProbeSnapshots` | New; replaces in-memory `InfrastructureProbeApi` in `@hbc/features-admin` |
| — | `ObservabilityErrors` | New; provides data source for `ErrorLogPage` |

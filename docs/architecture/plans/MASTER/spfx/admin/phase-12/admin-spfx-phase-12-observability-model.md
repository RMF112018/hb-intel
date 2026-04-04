# Admin SPFx IT Control Center — Phase 12 Observability Model

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-03 — re-audit against current repo truth
**Prerequisites:** P12-01 gap map, P12-02 baseline and storage model

---

## 1. Purpose

This document describes the shared observability model set used in Phase 12, which package owns each part, and where future extensions should go.

This revision reflects repo truth after Phase 12 execution through P12-09. All contracts described here are implemented and exported.

---

## 2. Model ownership map

| Package | Owns | Role |
|---------|------|------|
| `packages/models` (`@hbc/models`) | Observability enums, persistence record shapes, ingestion payloads, query contracts, summary view models, correlation metadata, timeline contracts, paginated response wrapper | Canonical shared types imported by both backend and frontend |
| `packages/features/admin` (`@hbc/features-admin`) | Client-side alert/probe types (`IAdminAlert`, `IProbeSnapshot`, etc.), hook return types, monitor/probe definition contracts, polling constants | Client-execution types and hook contracts |
| `backend/functions` | Store interfaces, durable adapters, API handler types | Implementation types consuming `@hbc/models` contracts |

**Boundary rule:** Persistence shapes and API contracts live in `@hbc/models` so both the backend and frontend share the same type definitions. Client-only execution types (monitor definitions, hook results) stay in `@hbc/features-admin`. Backend-only implementation types (store interfaces, adapter internals) stay in `backend/functions`.

**Current state:** All three layers are implemented and connected:
- Backend stores (`ObservabilityAlertStore`, `ObservabilityErrorStore`, `ObservabilityProbeStore`) import `@hbc/models` contracts for typed persistence (P12-04).
- Backend API routes (`observability-routes.ts`) use `@hbc/models` query/response contracts (P12-05).
- Frontend hooks (`useAdminAlerts`, `useInfrastructureProbes`, `useObservabilityErrors`) call backend APIs and return typed results (P12-08/P12-09).

---

## 3. Contract files

All files are in `packages/models/src/admin-control-plane/`:

| File | Lines | Contents |
|------|-------|----------|
| `ObservabilityEnums.ts` | 278 | 11 enums covering alert severity/status/category, affected entity type, probe kind/health, incident status, error classification/source, operator action type, timeline item kind |
| `IObservabilityAlert.ts` | 213 | `IObservabilityAlertRecord`, `IObservabilityAlertIngestionPayload`, `IObservabilityAlertIngestionItem`, `IObservabilityAlertQuery`, `IObservabilityAlertSummary` |
| `IObservabilityProbe.ts` | 147 | `IObservabilityProbeResultRecord`, `IObservabilityProbeSnapshotRecord`, `IObservabilityProbeSnapshotQuery`, `IObservabilityProbeSubmissionPayload`, `IObservabilityProbeHealthSummary` |
| `IObservabilityIncident.ts` | 105 | `IObservabilityIncidentRecord`, `IObservabilityIncidentQuery` |
| `IObservabilityError.ts` | 151 | `IObservabilityErrorRecord`, `IObservabilityErrorIngestionPayload`, `IObservabilityErrorIngestionItem`, `IObservabilityErrorQuery` |
| `IObservabilityTimeline.ts` | 228 | `IObservabilityCorrelation`, `IObservabilityOperatorActionRecord`, `IObservabilityTimelineItem`, `IObservabilityTimelineQuery`, `IObservabilityPagedResponse<T>`, `IObservabilityDashboardSummary` |
| `ObservabilityContracts.test.ts` | 672 | Fixture-based tests covering all enums, record shapes, query contracts, and view models |
| `index.ts` | 277 | Barrel export — 28 types (11 enums + 17 interfaces) re-exported to `@hbc/models` |

**Total:** ~1,399 lines of contract code, 39 exported types, 27+ test cases.

---

## 4. Enum reference

| Enum | Values | Count | Purpose |
|------|--------|-------|---------|
| `ObservabilityAlertSeverity` | Critical, High, Medium, Low | 4 | Alert priority and notification routing |
| `ObservabilityAlertStatus` | Active, Acknowledged, Resolved, Superseded | 4 | Alert lifecycle |
| `ObservabilityAlertCategory` | ProvisioningFailure, PermissionAnomaly, StuckWorkflow, OverdueProvisioningTask, UpcomingExpiration, StaleRecord | 6 | Alert classification by source monitor |
| `ObservabilityAffectedEntityType` | Record, User, Site, Job, System | 5 | Classification of the entity an alert affects |
| `ObservabilityProbeKind` | SharePointInfrastructure, AzureFunctions, AzureSearch, NotificationSystem, ModuleRecordHealth | 5 | Infrastructure probe identification |
| `ObservabilityProbeHealthStatus` | Healthy, Degraded, Error, Unknown | 4 | Probe result status |
| `ObservabilityIncidentStatus` | Open, Investigating, Resolved, Closed | 4 | Incident lifecycle |
| `ObservabilityErrorClassification` | Transient, Permissions, Structural, Repeated, AdminClass, Unclassified | 6 | Error triage classification (extends provisioning failure taxonomy) |
| `ObservabilityErrorSource` | ProvisioningSaga, AdminRun, SharePointControl, EntraControl, InfrastructureProbe, NotificationDispatch, ConfigGovernance, WhiteGloveDeployment | 8 | Error origin identification |
| `ObservabilityOperatorActionType` | AlertAcknowledged, AlertResolved, Escalated, ProbeTriggered, IncidentOpened, IncidentResolved, IncidentClosed, ErrorDismissed | 8 | Operator action audit classification |
| `ObservabilityTimelineItemKind` | AuditEvent, Alert, Error, ProbeSnapshot, OperatorAction | 5 | Timeline item discriminant |

**Total:** 11 enums, 59 distinct values.

---

## 5. Interface inventory

### Alert contracts (5 interfaces)
| Interface | Fields | Purpose |
|-----------|--------|---------|
| `IObservabilityAlertRecord` | 20 | Durable alert record with severity, status, deduplication, actor contexts, domain correlation |
| `IObservabilityAlertIngestionPayload` | 2 | Bulk ingestion payload with evaluated timestamp |
| `IObservabilityAlertIngestionItem` | 9 | Pre-enrichment shape from monitor |
| `IObservabilityAlertQuery` | 8 | Query filter: status, category, severity, domain, date range, cursor, limit |
| `IObservabilityAlertSummary` | 6 | Aggregated counts by severity + total active + most recent timestamp |

### Probe contracts (5 interfaces)
| Interface | Fields | Purpose |
|-----------|--------|---------|
| `IObservabilityProbeResultRecord` | 7 | Individual probe result with status, metrics, anomalies |
| `IObservabilityProbeSnapshotRecord` | 6 | Timestamped snapshot with results array and overall status |
| `IObservabilityProbeSnapshotQuery` | 5 | Query filter: probe key, date range, cursor, limit |
| `IObservabilityProbeSubmissionPayload` | 3 | Client submission shape with snapshot ID and results |
| `IObservabilityProbeHealthSummary` | 8 | Aggregated counts by status, overall health, staleness indicators |

### Error contracts (4 interfaces)
| Interface | Fields | Purpose |
|-----------|--------|---------|
| `IObservabilityErrorRecord` | 13 | Durable error record with classification, source, structured details, correlation |
| `IObservabilityErrorIngestionPayload` | 1 | Bulk ingestion wrapper |
| `IObservabilityErrorIngestionItem` | 10 | Single error in payload |
| `IObservabilityErrorQuery` | 9 | Query filter: domain, source, classification, severity, run, date range, cursor, limit |

### Incident contracts (2 interfaces)
| Interface | Fields | Purpose |
|-----------|--------|---------|
| `IObservabilityIncidentRecord` | 15 | Incident with linked alert/error IDs, status progression, actor tracking |
| `IObservabilityIncidentQuery` | 7 | Query filter: status, domain, severity, date range, cursor, limit |

### Timeline and correlation contracts (6 interfaces)
| Interface | Fields | Purpose |
|-----------|--------|---------|
| `IObservabilityCorrelation` | 4 | Standard correlation keys: domain, runId, actionKey, incidentId |
| `IObservabilityOperatorActionRecord` | 8 | Operator action audit record with correlation, reason, timestamp |
| `IObservabilityTimelineItem` | 15 | Discriminated union by `kind` with category-specific optional fields |
| `IObservabilityTimelineQuery` | 7 | Query filter: runId, domain, kinds array, date range, cursor, limit |
| `IObservabilityPagedResponse<T>` | 3 | Generic cursor-based pagination wrapper |
| `IObservabilityDashboardSummary` | 5 | Combined alert + probe + error + incident summaries + timestamp |

---

## 6. Relationship to existing types

### Compatibility with `@hbc/features-admin` types

The `@hbc/models` observability types are **persistence and API contracts**. The `@hbc/features-admin` types (`IAdminAlert`, `IProbeSnapshot`, `AlertSeverity`, `AlertCategory`, etc.) remain the **client-side execution types**.

| features-admin type | models counterpart | Relationship |
|--------------------|--------------------|-------------|
| `AlertSeverity` (union type) | `ObservabilityAlertSeverity` (enum) | Same string values; enum for persistence, union for client |
| `AlertCategory` (union type) | `ObservabilityAlertCategory` (enum) | Same string values |
| `ProbeHealthStatus` (union type) | `ObservabilityProbeHealthStatus` (enum) | Same string values |
| `IAdminAlert` | `IObservabilityAlertRecord` | Record adds status, dedupeKey, evaluationCount, actor contexts, domain correlation |
| `IProbeSnapshot` | `IObservabilityProbeSnapshotRecord` | Record adds persistedAt, triggerMode, overallStatus |
| `IInfrastructureProbeResult` | `IObservabilityProbeResultRecord` | Structurally equivalent; record uses enum for probeKey |
| `IAdminAlertBadge` | `IObservabilityAlertSummary` | Summary adds totalActiveCount and mostRecentAt |

### Compatibility with `AdminAuditEventType`

The existing `AdminAuditEventType` enum in `IAdminAudit.ts` is **not replaced**. The observability timeline item with `kind=AuditEvent` references `AdminAuditEventType` directly. The two enum sets are complementary:

- `AdminAuditEventType` classifies admin run lifecycle events.
- `ObservabilityOperatorActionType` classifies operator interactions with observability state.

---

## 7. Correlation key design

All observability records share a common correlation vocabulary:

| Key | Found on | Purpose |
|-----|----------|---------|
| `domain` (`AdminDomain` / `ObservabilityErrorSource`) | All records | Partition by admin domain |
| `runId` | Alert, error, timeline, operator action | Link to admin run lifecycle |
| `actionKey` | Error, operator action, correlation | Link to specific admin action |
| `incidentId` | Incident, error, correlation | Group related events |
| `dedupeKey` | Alert | Prevent duplicate alerts from repeated evaluation |
| `stepNumber` | Error | Link to specific provisioning step |

The `IObservabilityCorrelation` interface bundles the standard correlation keys (domain, runId, actionKey, incidentId) for reuse across operator action records and timeline queries.

---

## 8. Where future extensions should go

| Extension type | Target location | Example |
|---------------|----------------|---------|
| New alert category | Add value to `ObservabilityAlertCategory` in `ObservabilityEnums.ts` | New monitor for configuration drift |
| New probe kind | Add value to `ObservabilityProbeKind` in `ObservabilityEnums.ts` | Database connectivity probe |
| New error source | Add value to `ObservabilityErrorSource` in `ObservabilityEnums.ts` | New admin domain |
| New incident linking pattern | Extend `IObservabilityIncidentRecord` with new linked ID arrays | Link to config snapshot IDs |
| New timeline item kind | Add value to `ObservabilityTimelineItemKind` + extend `IObservabilityTimelineItem` | Configuration change events |
| New operator action | Add value to `ObservabilityOperatorActionType` | Incident merge, bulk acknowledge |
| New query filter | Extend the relevant `I*Query` interface | Full-text search on error messages |
| New summary view model | Add to `IObservabilityTimeline.ts` or new file | Per-domain health scorecard |
| New persistence adapter | `backend/functions/src/services/admin-control-plane/` | New observability store implementation |
| New client hook | `packages/features/admin/src/hooks/` | `useObservabilityTimeline` |

---

## 9. Design conventions followed

- **Naming:** `I` prefix for interfaces, PascalCase for enums (no prefix), matching existing `admin-control-plane` conventions.
- **Immutability:** All properties are `readonly`, arrays are `readonly`.
- **Nullability:** Uses `| null` for nullable fields (not `?`) to ensure payloads always include the key, consistent with the models package convention.
- **Timestamps:** All timestamps are ISO 8601 strings.
- **IDs:** UUID v4 strings.
- **Pagination:** Cursor-based with generic `IObservabilityPagedResponse<T>` wrapper.
- **Enums over union types:** The models package uses TypeScript enums for persistence-facing types (runtime values needed for serialization and comparison). The features-admin package uses union types for client-side types (lighter weight, tree-shakeable).

---

## 10. Consumers

### Backend consumers (implemented)
- `observability-alert-store.ts` — uses `IObservabilityAlertRecord`, `IObservabilityAlertQuery`, `IObservabilityAlertIngestionPayload`
- `observability-error-store.ts` — uses `IObservabilityErrorRecord`, `IObservabilityErrorQuery`, `IObservabilityErrorIngestionPayload`
- `observability-probe-store.ts` — uses `IObservabilityProbeSnapshotRecord`, `IObservabilityProbeSnapshotQuery`
- `observability-routes.ts` — uses query/response contracts for all endpoints
- `observability-emitter.ts` — uses `ObservabilityErrorClassification`, `ObservabilityAlertSeverity` for classification heuristics

### Frontend consumers (implemented)
- `useObservabilityErrors()` — queries backend using `IObservabilityErrorQuery`, renders `IObservabilityErrorRecord`
- `useAdminAlerts()` — alert polling and lifecycle management
- `useInfrastructureProbes()` — probe snapshot display and refresh
- `ErrorLogPage.tsx` — renders error records with severity/classification badges

---

## Validation

- [x] All 18 Prompt-03 scope requirements present and exported
- [x] 11 enums with 59 values covering all required classifications
- [x] 22 interfaces covering persistence, ingestion, query, and summary shapes
- [x] Test file (`ObservabilityContracts.test.ts`, 672 lines, 27+ cases) covers all enums and interfaces
- [x] Barrel export verified — all types available from `@hbc/models`
- [x] Compatibility with existing `@hbc/features-admin` client types documented
- [x] Backend and frontend consumers identified and verified
- [x] Correlation key design consistent with existing audit spine
- [x] Extension guidance specifies exact target locations

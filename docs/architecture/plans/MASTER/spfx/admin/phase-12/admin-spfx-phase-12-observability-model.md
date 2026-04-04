# Admin SPFx IT Control Center — Phase 12 Observability Model

**Created:** 2026-04-04
**Prompt:** P12-03 — Shared Observability Contracts and Models
**Prerequisites:** P12-01 gap map, P12-02 baseline and storage model

---

## 1. Purpose

This document describes the shared observability model set introduced in Phase 12, which package owns each part, and where future extensions should go.

---

## 2. Model ownership map

| Package | Owns | Role |
|---------|------|------|
| `packages/models` (`@hbc/models`) | Observability enums, persistence record shapes, ingestion payloads, query contracts, summary view models, correlation metadata, timeline contracts, paginated response wrapper | Canonical shared types imported by both backend and frontend |
| `packages/features/admin` (`@hbc/features-admin`) | Client-side alert/probe types (`IAdminAlert`, `IProbeSnapshot`, etc.), hook return types, monitor/probe definition contracts, polling constants | Client-execution types and hook contracts (existing, unchanged in P12-03) |
| `backend/functions` | Store interfaces, durable adapters, API handler types | Implementation types (created in later prompts P12-04, P12-05) |

**Boundary rule:** Persistence shapes and API contracts live in `@hbc/models` so both the backend and frontend share the same type definitions. Client-only execution types (monitor definitions, hook results) stay in `@hbc/features-admin`. Backend-only implementation types (store interfaces, adapter internals) stay in `backend/functions`.

---

## 3. New files introduced

All new files are in `packages/models/src/admin-control-plane/`:

| File | Contents |
|------|----------|
| `ObservabilityEnums.ts` | 11 enums covering alert severity/status/category, probe kind/health, incident status, error classification/source, operator action type, timeline item kind |
| `IObservabilityAlert.ts` | `IObservabilityAlertRecord`, `IObservabilityAlertIngestionPayload`, `IObservabilityAlertIngestionItem`, `IObservabilityAlertQuery`, `IObservabilityAlertSummary` |
| `IObservabilityProbe.ts` | `IObservabilityProbeResultRecord`, `IObservabilityProbeSnapshotRecord`, `IObservabilityProbeSnapshotQuery`, `IObservabilityProbeSubmissionPayload`, `IObservabilityProbeHealthSummary` |
| `IObservabilityIncident.ts` | `IObservabilityIncidentRecord`, `IObservabilityIncidentQuery` |
| `IObservabilityError.ts` | `IObservabilityErrorRecord`, `IObservabilityErrorIngestionPayload`, `IObservabilityErrorIngestionItem`, `IObservabilityErrorQuery` |
| `IObservabilityTimeline.ts` | `IObservabilityCorrelation`, `IObservabilityOperatorActionRecord`, `IObservabilityTimelineItem`, `IObservabilityTimelineQuery`, `IObservabilityPagedResponse<T>`, `IObservabilityDashboardSummary` |
| `ObservabilityContracts.test.ts` | Fixture-based tests covering all enums, record shapes, query contracts, and view models |

---

## 4. Enum reference

| Enum | Values | Purpose |
|------|--------|---------|
| `ObservabilityAlertSeverity` | critical, high, medium, low | Alert priority and notification routing |
| `ObservabilityAlertStatus` | active, acknowledged, resolved, superseded | Alert lifecycle |
| `ObservabilityAlertCategory` | 6 categories matching existing monitor set | Alert classification by source monitor |
| `ObservabilityAffectedEntityType` | record, user, site, job, system | Classification of the entity an alert affects |
| `ObservabilityProbeKind` | 5 kinds matching existing probe set | Infrastructure probe identification |
| `ObservabilityProbeHealthStatus` | healthy, degraded, error, unknown | Probe result status |
| `ObservabilityIncidentStatus` | open, investigating, resolved, closed | Incident lifecycle |
| `ObservabilityErrorClassification` | transient, permissions, structural, repeated, admin-class, unclassified | Error triage classification (extends provisioning failure taxonomy) |
| `ObservabilityErrorSource` | 8 sources covering all admin domains | Error origin identification |
| `ObservabilityOperatorActionType` | 8 action types | Operator action audit classification |
| `ObservabilityTimelineItemKind` | audit-event, alert, error, probe-snapshot, operator-action | Timeline item discriminant |

---

## 5. Relationship to existing types

### Compatibility with `@hbc/features-admin` types

The new `@hbc/models` observability types are **persistence and API contracts**. The existing `@hbc/features-admin` types (`IAdminAlert`, `IProbeSnapshot`, `AlertSeverity`, `AlertCategory`, etc.) remain the **client-side execution types**.

| features-admin type | models counterpart | Relationship |
|--------------------|--------------------|-------------|
| `AlertSeverity` (union type) | `ObservabilityAlertSeverity` (enum) | Same string values; enum for persistence, union for client |
| `AlertCategory` (union type) | `ObservabilityAlertCategory` (enum) | Same string values |
| `ProbeHealthStatus` (union type) | `ObservabilityProbeHealthStatus` (enum) | Same string values |
| `IAdminAlert` | `IObservabilityAlertRecord` | Record adds status, dedupeKey, evaluationCount, actor contexts, domain correlation |
| `IProbeSnapshot` | `IObservabilityProbeSnapshotRecord` | Record adds persistedAt, triggerMode, overallStatus |
| `IInfrastructureProbeResult` | `IObservabilityProbeResultRecord` | Structurally equivalent; record uses enum for probeKey |
| `IAdminAlertBadge` | `IObservabilityAlertSummary` | Summary adds totalActiveCount and mostRecentAt |
| — (not yet modeled) | `IObservabilityIncidentRecord` | New concept |
| — (not yet modeled) | `IObservabilityErrorRecord` | New concept for error log |

### Compatibility with `AdminAuditEventType`

The existing `AdminAuditEventType` enum in `IAdminAudit.ts` is **not replaced**. The observability timeline item with `kind=AuditEvent` references `AdminAuditEventType` directly. The two enum sets are complementary:

- `AdminAuditEventType` classifies admin run lifecycle events.
- `ObservabilityOperatorActionType` classifies operator interactions with observability state.

---

## 6. Correlation key design

All observability records share a common correlation vocabulary:

| Key | Found on | Purpose |
|-----|----------|---------|
| `domain` (`AdminDomain`) | All records | Partition by admin domain |
| `runId` | Alert, error, timeline, operator action | Link to admin run lifecycle |
| `actionKey` | Error, operator action, correlation | Link to specific admin action |
| `incidentId` | Incident, error, correlation | Group related events |
| `dedupeKey` | Alert | Prevent duplicate alerts from repeated evaluation |

The `IObservabilityCorrelation` interface bundles the standard correlation keys for reuse across operator action records and timeline queries.

---

## 7. Where future extensions should go

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
| New persistence adapter | `backend/functions/src/services/` | New observability store implementation |
| New client hook | `packages/features/admin/src/hooks/` | `useErrorLog`, `useObservabilityTimeline` |

---

## 8. Design conventions followed

- **Naming:** `I` prefix for interfaces, PascalCase for enums (no prefix), matching existing `admin-control-plane` conventions.
- **Immutability:** All properties are `readonly`, arrays are `readonly`.
- **Nullability:** Uses `| null` for nullable fields (not `?`) to ensure payloads always include the key, consistent with the models package convention.
- **Timestamps:** All timestamps are ISO 8601 strings.
- **IDs:** UUID v4 strings.
- **Pagination:** Cursor-based with generic `IObservabilityPagedResponse<T>` wrapper.
- **Enums over union types:** The models package uses TypeScript enums for persistence-facing types (runtime values needed for serialization and comparison). The features-admin package uses union types for client-side types (lighter weight, tree-shakeable).

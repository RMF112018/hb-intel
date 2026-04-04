# Admin SPFx IT Control Center — Phase 12 Storage, Retention, and Access Model

**Created:** 2026-04-04
**Prompt:** P12-02 — Phase 12 Observability Baseline and Persistence Model
**Prerequisite:** P12-01 gap map, P12-02 observability baseline (companion document)

---

## 1. Purpose

This document defines the canonical durable ownership model for observability state in Phase 12. It specifies where data lives, how long it is retained, who can access it, how records correlate, what query surfaces the SPFx console requires, and which production adapter direction the repo should follow.

---

## 2. Canonical durable ownership model

### 2.1 Decision: Azure Table Storage

**Chosen direction:** Azure Table Storage, extending the Phase 4 durable store pattern.

**Rationale:**
- The backend already has proven Table Storage adapters for admin runs, audit events, and evidence (`DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore`).
- These adapters include serialization round-trip tests, partition/row key design, and typed entity mapping.
- Table Storage supports the write patterns needed: Replace for mutable state (alerts, probe snapshots), Insert for append-only records (audit events, error events).
- The P12-01 gap map (issue I1) recommended Table Storage over SharePoint lists for observability writes. SharePoint lists are suitable for user-facing structured data but not optimal for high-frequency observability ingestion.
- Consistency with the existing adapter pattern reduces implementation risk and maintenance burden.

**Rejected alternative:** SharePoint lists (`HBC_AdminAlerts`, `HBC_InfrastructureProbeSnapshots` named in the `@hbc/features-admin` README as Wave 1 targets). These targets should be updated to reflect the Table Storage decision when the README is revised in a later Phase 12 prompt.

### 2.2 Store layout

| Store (Table name) | Partition key | Row key | Write mode | Purpose |
|---------------------|--------------|---------|------------|---------|
| `ObservabilityAlerts` | `category` | `alertId` (UUID) | Upsert (Replace) | Durable alert records with lifecycle state |
| `ObservabilityProbeSnapshots` | `probeKey` | `snapshotId` (UUID) | Insert | Append-only probe snapshot history |
| `ObservabilityErrors` | `domain` | `errorId` (UUID) | Insert | Append-only error event records |
| `ObservabilityIncidents` | `domain` | `incidentId` (UUID) | Upsert (Replace) | Incident records with lifecycle state |
| `AdminAuditEvents` | `runId` | `auditId` (UUID) | Insert | *Already exists (Phase 4)* — extend event types |
| `AdminRuns` | `domain` | `runId` (UUID) | Upsert (Replace) | *Already exists (Phase 4)* — no schema change |
| `AdminEvidence` | `runId` | `evidenceId` (UUID) | Insert | *Already exists (Phase 4)* — no schema change |

**Design notes:**
- Partition keys are chosen for the most common query pattern (filter by category, probe key, domain, or run).
- Row keys use UUID v4 for uniqueness and avoid hot partitions.
- Insert-only tables (snapshots, errors, audit) are append-only for auditability.
- Upsert tables (alerts, incidents) support lifecycle state transitions (acknowledge, resolve).
- Existing Phase 4 tables are preserved and extended, not replaced.

---

## 3. Raw telemetry vs normalized app-level records

| Aspect | Raw platform telemetry | Normalized observability records |
|--------|----------------------|--------------------------------|
| **Source** | Application Insights SDK, `context.log`, structured custom events | Backend observability adapters |
| **Storage** | Azure Monitor / Log Analytics workspace | Azure Table Storage (`Observability*` tables) |
| **Schema** | Semi-structured (custom dimensions, traces) | Strongly typed contracts from `packages/models` |
| **Query tool** | KQL in Azure portal | Backend query APIs → SPFx hooks |
| **Audience** | Platform team, DevOps, debugging | Operators via SPFx console |
| **Retention governance** | Azure Monitor retention policy (default 90 days) | Application-managed (see section 4) |
| **Correlation** | Operation ID, custom properties | Typed correlation keys (section 5) |

**Boundary rule:** The provisioning saga already emits structured telemetry to Application Insights. These raw events remain valuable for debugging and platform monitoring. Phase 12 does **not** replace them. Instead, Phase 12 adds a **parallel normalized projection** — the same operational facts, stored as typed records in Table Storage, queryable through the SPFx console.

Events flow in one direction:

```
Code execution
  → Raw telemetry (Application Insights)     [platform monitoring]
  → Normalized record (Table Storage)         [operator-facing observability]
```

Both writes happen at the same point in the code path. Neither depends on the other. Raw telemetry failures must not block normalized record writes, and vice versa.

---

## 4. Retention expectations

| Data category | Retention target | Rationale |
|--------------|-----------------|-----------|
| Alerts (active) | Indefinite while unresolved | Operators must see all unresolved alerts |
| Alerts (resolved) | 90 days | Sufficient for trend analysis and post-incident review |
| Probe snapshots | 90 days | Health trend window; older snapshots lose diagnostic value |
| Error events | 90 days | Aligned with Application Insights default; supports diagnosis window |
| Incidents | 180 days | Longer retention for post-incident review and pattern detection |
| Audit events | 365 days | Compliance and governance audit trail |
| Admin runs | 365 days | Operational record of admin actions |
| Evidence | 365 days | Supports dispute resolution and compliance |

**Implementation note:** Retention enforcement is a backend responsibility. Phase 12 should implement retention as a periodic cleanup function (Azure Timer Trigger) rather than inline with every write. The cleanup function should:
- Query records older than the retention threshold.
- Delete in batches (Table Storage batch delete, max 100 per batch within a partition).
- Log cleanup metrics to Application Insights.
- Not block or slow down ingestion or query paths.

**Phase 12 minimum:** Define the retention policy and implement the cleanup function for at least alerts and probe snapshots. Audit event and evidence cleanup may be deferred to Phase 13 if time-constrained, since their 365-day window provides a larger buffer.

---

## 5. Correlation keys

| Key | Type | Purpose | Used by |
|-----|------|---------|---------|
| `alertId` | UUID v4 | Unique alert identity | Alerts, incidents (linked) |
| `probeKey` | String enum | Infrastructure probe identity | Probe snapshots |
| `snapshotId` | UUID v4 | Unique probe snapshot identity | Probe snapshots |
| `errorId` | UUID v4 | Unique error event identity | Error events, incidents (linked) |
| `incidentId` | UUID v4 | Unique incident identity | Incidents, linked alerts/errors |
| `runId` | UUID v4 | Admin run identity (existing) | Audit events, evidence, runs, timeline |
| `correlationId` | UUID v4 | Provisioning saga correlation (existing) | Provisioning status, retry chains |
| `parentCorrelationId` | UUID v4 | Retry chain parent (existing) | Provisioning retry correlation |
| `domain` | String enum (`AdminDomain`) | Admin domain classification (existing) | All observability records |
| `actionKey` | String | Specific action identifier | Audit events, operator actions |
| `actorUpn` | String | Operator identity (existing `IActorContext`) | All operator-initiated records |

**Cross-entity correlation pattern:**
- An **incident** links to one or more `alertIds` and optionally to `errorIds` and `runIds`.
- An **alert** may reference a `runId` (e.g., provisioning failure alert) or stand alone (e.g., infrastructure probe alert).
- An **error event** may reference a `runId` and `domain` for contextual drilldown.
- **Audit events** are partitioned by `runId`, enabling efficient timeline reconstruction per run.
- **Timeline queries** assemble a correlated view by joining audit events, alerts, and error events by `runId` and `domain`.

---

## 6. Access and authorization boundaries

| Surface | Required permission | Enforcement point |
|---------|-------------------|-------------------|
| View alerts (active and history) | `admin:observability:view` | Backend query API + SPFx `PermissionGate` |
| Acknowledge / resolve alert | `admin:observability:manage` | Backend action API (validates before write) |
| View probe snapshots | `admin:observability:view` | Backend query API + SPFx `PermissionGate` |
| Trigger manual probe run | `admin:observability:manage` | Backend action API |
| View error log | `admin:observability:view` | Backend query API + SPFx `PermissionGate` |
| View correlated run timeline | `admin:observability:view` | Backend query API (scoped by domain) |
| Escalate alert / incident | `admin:observability:escalate` | Backend action API |
| View audit events directly | `admin:audit:view` | Backend query API + SPFx `PermissionGate` |

**Authorization model:**
- Backend APIs enforce permission checks using the authenticated caller's token claims.
- SPFx uses `PermissionGate` for UI-level gating (hide surfaces the operator cannot use).
- UI gating is a convenience, not a security boundary — the backend is authoritative.
- Permission identifiers follow the existing `admin:{domain}:{action}` convention.

**Phase 12 note:** If the current permission model does not yet include `admin:observability:*` permissions, they should be added to the permission registry. The existing `admin:access-control:view` pattern is the template.

---

## 7. Minimal query surfaces required by SPFx

These are the backend query APIs that SPFx must be able to call to render the Phase 12 observability surfaces.

| API | Method | Purpose | Primary consumer |
|-----|--------|---------|-----------------|
| List active alerts | `GET /api/observability/alerts?status=active` | Populate alert dashboard and badge | `useAdminAlerts` hook |
| List alert history | `GET /api/observability/alerts?status=all&from=&to=` | Populate alert history view | `useAdminAlerts` hook |
| Acknowledge alert | `POST /api/observability/alerts/{alertId}/acknowledge` | Record acknowledgment | `useAdminAlerts` hook |
| Resolve alert | `POST /api/observability/alerts/{alertId}/resolve` | Record resolution | `useAdminAlerts` hook |
| Get latest probe snapshot | `GET /api/observability/probes/latest` | Populate probe dashboard | `useInfrastructureProbes` hook |
| List probe history | `GET /api/observability/probes?probeKey=&from=&to=` | Populate probe trend view | `useInfrastructureProbes` hook |
| Submit probe results | `POST /api/observability/probes/snapshots` | Persist client-triggered probe results | `useInfrastructureProbes` hook |
| List error events | `GET /api/observability/errors?domain=&from=&to=` | Populate error log page | Future `useErrorLog` hook |
| Get correlated timeline | `GET /api/observability/timeline/{runId}` | Populate run detail timeline | Future `useObservabilityTimeline` hook |
| Ingest alert evaluations | `POST /api/observability/alerts/ingest` | Persist alert monitor results | `AlertPollingService` (after transition) |

**Pagination:** List endpoints should support cursor-based pagination (`?cursor=&limit=`) for large result sets. Default page size: 50. Maximum: 200.

**Filtering:** List endpoints should support at minimum:
- Date range (`from`, `to` as ISO-8601 strings)
- Status filter where applicable (`active`, `acknowledged`, `resolved`, `all`)
- Domain filter where applicable
- Severity filter for alerts
- Probe key filter for probe snapshots

---

## 8. Recommended production adapter direction

### Current state

The backend `service-factory.ts` uses an adapter-mode resolution pattern:
- **Real mode:** Production adapters backed by Azure Table Storage.
- **Mock mode:** In-memory adapters for local development and testing.
- **Test mode:** In-memory adapters for automated tests.

Phase 4 established this pattern with `DurableAdminRunStore` / `InMemoryAdminRunService`, `DurableAdminAuditStore` / `MockAdminAuditStore`, etc.

### Recommended direction

Phase 12 observability adapters must follow the same pattern:

1. **Define a store interface** in `backend/functions/src/services/` (e.g., `IObservabilityAlertStore`).
2. **Implement a durable adapter** using Azure Table Storage (e.g., `DurableObservabilityAlertStore`).
3. **Implement an in-memory adapter** for testing (e.g., `InMemoryObservabilityAlertStore`).
4. **Register in `service-factory.ts`** with mode-dependent resolution.
5. **Write serialization round-trip tests** for the durable adapter (following Phase 4 `durable-stores.test.ts` pattern).

**Do not:**
- Introduce a new persistence technology (e.g., Cosmos DB, SQL) without explicit architectural justification.
- Create adapters that bypass the service factory.
- Mix observability persistence with existing admin-run or provisioning-status tables — keep concerns separated into dedicated tables.

---

## Validation

- [x] Storage model distinguishes raw telemetry from durable operator-facing projections (section 3)
- [x] Nothing implies browser-owned durability — all persistence is backend-owned (sections 2, 6)
- [x] Consistent with P12-01 gap map findings and recommendations (I1: Table Storage over SharePoint lists)
- [x] Consistent with P12-02 observability baseline layer responsibilities
- [x] Extends Phase 4 patterns rather than replacing them
- [x] Correlation keys compatible with existing audit spine (`runId`, `domain`, `actionKey`)
- [x] Query surfaces cover all P12-01 identified closures (C1–C5, C8, C9)

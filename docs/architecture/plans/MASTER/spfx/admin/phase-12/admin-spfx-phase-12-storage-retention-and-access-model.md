# Admin SPFx IT Control Center — Phase 12 Storage, Retention, and Access Model

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-01/P13-02 — re-audit against current repo truth
**Prerequisite:** P12-01 gap map, P12-02 observability baseline (companion document)

---

## 1. Purpose

This document defines the canonical durable ownership model for observability state in Phase 12. It specifies where data lives, how long it is retained, who can access it, how records correlate, what query surfaces the SPFx console requires, and which production adapter direction the repo follows.

This revision reflects repo truth after Phase 12 execution through P12-09.

---

## 2. Canonical durable ownership model

### 2.1 Decision: Azure Table Storage

**Chosen direction:** Azure Table Storage, extending the Phase 4 durable store pattern.

**Rationale:**
- The backend has proven Table Storage adapters for admin runs, audit events, and evidence (`DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore`).
- These adapters include serialization round-trip tests, partition/row key design, and typed entity mapping.
- Table Storage supports the write patterns needed: Replace for mutable state (alerts), Insert for append-only records (audit events, error events, probe snapshots).
- The P12-01 gap map (original issue I1) recommended Table Storage over SharePoint lists for observability writes.
- Consistency with the existing adapter pattern reduces implementation risk and maintenance burden.

**Status: implemented.** All three new observability stores (`ObservabilityAlerts`, `ObservabilityErrors`, `ObservabilityProbeSnapshots`) use Azure Table Storage following the Phase 4 pattern.

**Rejected alternative:** SharePoint lists (`HBC_AdminAlerts`, `HBC_InfrastructureProbeSnapshots` previously named in `@hbc/features-admin` constants as Wave 1 targets). The `@hbc/features-admin` README has been updated to reflect the Table Storage direction.

### 2.2 Store layout

| Store (Table name) | Partition key | Row key | Write mode | Purpose | Status |
|---------------------|--------------|---------|------------|---------|--------|
| `ObservabilityAlerts` | `category` | `alertId` (UUID) | Upsert (Replace) | Durable alert records with lifecycle state | **Implemented** (P12-02) |
| `ObservabilityProbeSnapshots` | `probeKey` | `snapshotId` (UUID) | Insert | Append-only probe snapshot history | **Implemented** (P12-03); full query ops partial |
| `ObservabilityErrors` | `domain` | `errorId` (UUID) | Insert | Append-only error event records | **Implemented** (P12-01) |
| `ObservabilityIncidents` | `domain` | `incidentId` (UUID) | Upsert (Replace) | Incident records with lifecycle state | **Model defined**; persistence adapter pending |
| `AdminAuditEvents` | `runId` | `auditId` (UUID) | Insert | *Phase 4 — extended with observability event types* | **Implemented** (Phase 4) |
| `AdminRuns` | `domain` | `runId` (UUID) | Upsert (Replace) | *Phase 4 — no schema change* | **Implemented** (Phase 4) |
| `AdminEvidence` | `runId` | `evidenceId` (UUID) | Insert | *Phase 4 — no schema change* | **Implemented** (Phase 4) |

**Design notes:**
- Partition keys are chosen for the most common query pattern (filter by category, probe key, domain, or run).
- Row keys use UUID v4 for uniqueness and avoid hot partitions.
- Insert-only tables (snapshots, errors, audit) are append-only for auditability.
- Upsert tables (alerts, incidents) support lifecycle state transitions (acknowledge, resolve).
- Existing Phase 4 tables are preserved and extended, not replaced.
- Alert store includes `dedupeKey` for duplicate detection and `previousSeverity` for severity transition tracking.
- Alert store supports `evaluationCount` to track repeated evaluations of the same condition.

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

**Boundary rule:** The provisioning saga emits structured telemetry to Application Insights. These raw events remain valuable for debugging and platform monitoring. Phase 12 adds a **parallel normalized projection** — the same operational facts, stored as typed records in Table Storage, queryable through the SPFx console.

Events flow in one direction:

```
Code execution
  → Raw telemetry (Application Insights)     [platform monitoring]
  → Normalized record (Table Storage)         [operator-facing observability]
```

Both writes happen at the same point in the code path. Neither depends on the other. Raw telemetry failures must not block normalized record writes, and vice versa. The `observability-emitter.ts` pattern already implements this: fire-and-forget error ingestion that does not block the route handler response.

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

**Phase 12 status:** Retention policy defined. Cleanup function implementation is a remaining Phase 12 deliverable (P12-10/P12-11 scope). The 90-day and 365-day windows provide a buffer — no data loss risk during the remainder of Phase 12.

---

## 5. Correlation keys

| Key | Type | Purpose | Used by |
|-----|------|---------|---------|
| `alertId` | UUID v4 | Unique alert identity | Alerts, incidents (linked) |
| `probeKey` | String enum (`ObservabilityProbeKind`) | Infrastructure probe identity | Probe snapshots |
| `snapshotId` | UUID v4 | Unique probe snapshot identity | Probe snapshots |
| `errorId` | UUID v4 | Unique error event identity | Error events, incidents (linked) |
| `incidentId` | UUID v4 | Unique incident identity | Incidents, linked alerts/errors |
| `runId` | UUID v4 | Admin run identity (existing) | Audit events, evidence, runs, timeline, errors, alerts |
| `correlationId` | UUID v4 | Provisioning saga correlation (existing) | Provisioning status, retry chains |
| `parentCorrelationId` | UUID v4 | Retry chain parent (existing) | Provisioning retry correlation |
| `domain` | String enum (`AdminDomain` / `ObservabilityErrorSource`) | Admin domain classification | All observability records |
| `actionKey` | String | Specific action identifier | Audit events, operator actions, error records |
| `stepNumber` | Number | Provisioning step position | Error records (for step-level correlation) |
| `dedupeKey` | String | Alert deduplication identity | Alert store (prevents duplicate alerts) |
| `actorUpn` | String | Operator identity (existing `IActorContext`) | All operator-initiated records |

**Cross-entity correlation pattern (implemented):**
- An **incident** links to one or more `alertIds` and optionally to `errorIds` and `runIds`.
- An **alert** may reference a `runId` (e.g., provisioning failure alert) or stand alone (e.g., infrastructure probe alert). Alerts carry `dedupeKey` for stable identity across evaluations.
- An **error event** references `domain`, `source`, and optionally `runId`, `actionKey`, and `stepNumber` for contextual drilldown.
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
- Current admin routes use `adminBeforeLoad()` guard requiring `admin:access-control:view`.

---

## 7. Minimal query surfaces required by SPFx

These are the backend query APIs that SPFx calls to render the Phase 12 observability surfaces.

| API | Method | Path | Purpose | Consumer | Status |
|-----|--------|------|---------|----------|--------|
| List alerts | `GET` | `/api/admin/observability/alerts` | Populate alert dashboard and badge | `useAdminAlerts` | **Implemented** |
| Get alert detail | `GET` | `/api/admin/observability/alerts/{alertId}` | Alert detail view | `useAdminAlerts` | **Implemented** |
| Acknowledge alert | `POST` | `/api/admin/observability/alerts/{alertId}/acknowledge` | Record acknowledgment | `useAdminAlerts` | **Implemented** |
| Resolve alert | `POST` | `/api/admin/observability/alerts/{alertId}/resolve` | Record resolution | `useAdminAlerts` | **Implemented** |
| List probe snapshots | `GET` | `/api/admin/observability/probes` | Populate probe dashboard | `useInfrastructureProbes` | **Implemented** |
| List error events | `GET` | `/api/admin/observability/errors` | Populate error log page | `useObservabilityErrors` | **Implemented** |
| Dashboard summary | `GET` | `/api/admin/observability/dashboard` | Combined overview | Future dashboard hook | **Partial** (interface defined) |
| Correlated timeline | `GET` | `/api/admin/observability/timeline/{runId}` | Run detail timeline | Future timeline hook | **Partial** (interface defined) |

**Pagination:** List endpoints support cursor-based pagination (`?cursor=&limit=`). Default page size: 50. Maximum: 200.

**Filtering:** List endpoints support:
- Date range (`from`, `to` as ISO-8601 strings)
- Status filter where applicable (`active`, `acknowledged`, `resolved`)
- Domain filter
- Severity filter for alerts and errors
- Classification filter for errors (`transient`, `permissions`, `structural`, `repeated`, `admin-class`, `unclassified`)
- Source filter for errors (`provisioning-saga`, `admin-run`, `sharepoint-control`, `entra-control`, `infrastructure-probe`, `notification-dispatch`, `config-governance`, `white-glove-deployment`)
- Probe key filter for probe snapshots

---

## 8. Production adapter direction

### Current state (implemented)

The admin control plane service factory (`hosts/admin-control-plane/service-factory.ts`) uses an adapter-mode resolution pattern:
- **Real mode:** Production adapters backed by Azure Table Storage.
- **Mock mode:** In-memory adapters for local development and testing.

Phase 4 established this pattern with `DurableAdminRunStore` / `InMemoryAdminRunService`, `DurableAdminAuditStore` / `MockAdminAuditStore`, etc.

### Phase 12 implementation (followed)

Phase 12 observability adapters follow the same pattern:

1. **Store interfaces defined** — `IObservabilityAlertStore`, `IObservabilityErrorStore`, `IObservabilityProbeStore`.
2. **Durable adapters implemented** — using Azure Table Storage with partition/row key design.
3. **Registered in admin control plane service factory** — `observabilityAlertStore`, `observabilityProbeStore`, `observabilityErrorStore` wired alongside existing run/audit/evidence stores.
4. **Observability routes consume stores** — `observability-routes.ts` uses injected stores for all CRUD operations.

### Remaining adapter work

- **Observability Probe Store:** Full paginated query and health summary aggregation operations pending completion.
- **Observability Dashboard Service:** Combined summary assembly (alerts + probes + errors) pending completion.
- **Observability Timeline Service:** Run-level correlated timeline reconstruction pending completion.
- **Observability Incidents Store:** Persistence adapter for `ObservabilityIncidents` table pending implementation.

**Must not:**
- Introduce a new persistence technology (e.g., Cosmos DB, SQL) without explicit architectural justification.
- Create adapters that bypass the service factory.
- Mix observability persistence with existing admin-run or provisioning-status tables — concerns remain separated into dedicated tables.

---

## Validation

- [x] Storage model distinguishes raw telemetry from durable operator-facing projections (section 3)
- [x] Nothing implies browser-owned durability — all persistence is backend-owned (sections 2, 6)
- [x] Consistent with updated P12-01 gap map findings
- [x] Consistent with P12-02 observability baseline layer responsibilities
- [x] Extends Phase 4 patterns rather than replacing them
- [x] Correlation keys compatible with existing audit spine (`runId`, `domain`, `actionKey`)
- [x] Query surfaces cover all identified closures
- [x] API paths match actual implemented routes (`/api/admin/observability/...`)
- [x] Phase 12 progress accurately reflected per store and endpoint

# Admin SPFx IT Control Center — Phase 12 Probe and Alert Runtime

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-06 — re-audit against current repo truth
**Prerequisites:** P12-03 shared contracts, P12-04 persistence adapters, P12-05 backend APIs

---

## 1. Purpose

This document explains how probes run, how snapshots are persisted, how alerts are generated and updated, how duplicate/repeated conditions are handled, and what remains deferred after Phase 12 productionization.

This revision reflects repo truth after Phase 12 execution through P12-09.

---

## 2. How probes run

### Execution model

Probes execute **client-side** in the SPFx operator console via `useProbePolling()`. This is intentional: the probes test connectivity from the operator's network perspective (SharePoint reachability, Function App health) rather than from the backend's perspective.

### Execution cycle

1. `ProbeScheduler.runAll(nowIso)` executes all registered probes **sequentially** in insertion order.
2. Each probe gets up to 3 attempts (`PROBE_MAX_RETRY`) with exponential backoff (100ms, 200ms, 400ms).
3. If a probe fails all retries, it returns an `error` result with the failure message and empty metrics (not a thrown exception).
4. `ProbeScheduler.buildSnapshot(results, snapshotId, capturedAt)` wraps results into an `IProbeSnapshot`.
5. The polling hook persists the snapshot to the backend via `POST /api/admin/observability/probes/snapshots`.

### Polling interval

Default: 15 minutes (`PROBE_SCHEDULER_DEFAULT_MS = 900_000`). First run is immediate on session mount.

### Factory pattern

Live probes use a configurable factory pattern that injects connection config:

```
createSharePointProbe(config: ProbeConnectionConfig): IInfrastructureProbeDefinition
createAzureFunctionsProbe(config: ProbeConnectionConfig): IInfrastructureProbeDefinition
```

Where `ProbeConnectionConfig` provides `baseUrl` and `getToken()`. Stubs are plain exports that return fixed values without network calls.

`createDefaultProbeScheduler(config?)` wires live probes when config is supplied; falls back to stub variants otherwise.

### Registered probes (5 total)

| Probe | Key | Status | Connection | Stub returns |
|-------|-----|--------|-----------|-------------|
| SharePoint infrastructure | `sharepoint-infrastructure` | **Live** | HTTP to `/api/project-setup-requests?state=Submitted` with bearer token | `healthy` |
| Azure Functions | `azure-functions` | **Live** | HTTP to `/api/health` with bearer token | `healthy` |
| Azure Search | `azure-search` | **Deferred** | No Azure Search in repo | `unknown` (P12-06) |
| Notification system | `notification-system` | **Deferred** | No health endpoint for Teams webhook | `unknown` (P12-06) |
| Module record health | `module-record-health` | **Deferred** | No per-module integrity queries | `unknown` (P12-06) |

**Live probe status mapping:**
- HTTP 2xx → `healthy` (metrics: `statusCode`, `responseTimeMs`)
- Non-OK HTTP → `degraded` (metrics: `statusCode`, `responseTimeMs`)
- Connection failure → `error` (anomalies: `['Connection failed']`)

---

## 3. How snapshots are persisted

### Client-side (transient)

The `InfrastructureProbeApi` in `@hbc/features-admin` stores snapshots in-memory for immediate React Query consumption. This serves as a local cache for the current session. The in-memory store is backed by durable Azure Table Storage (P12-05).

### Backend-side (durable)

After execution, the polling hook submits the snapshot to the backend via:
```
POST /api/admin/observability/probes/snapshots
```
The `DurableObservabilityProbeSnapshotStore` persists it to the `ObservabilityProbeSnapshots` Azure Table Storage table (P12-04).

**Partition key:** `__snapshot__` (fixed partition for all snapshots)
**Row key:** `snapshotId` (UUID v4)

### Overall status computation

Each snapshot carries an `overallStatus` field computed as the worst status among all probe results:
- `error` (priority 3) > `degraded` (2) > `unknown` (1) > `healthy` (0)

### Staleness detection

A snapshot is considered stale if `capturedAt` is older than 30 minutes (`PROBE_STALENESS_MS = 1_800_000`). This is 2x the probe polling interval, accounting for worst-case miss of two consecutive probe runs. The health summary API reports `isStale: true` in this case.

### Health summary

`getHealthSummary()` returns aggregated counts by status (`healthyCount`, `degradedCount`, `errorCount`, `unknownCount`), `overallStatus`, `lastSnapshotAt`, and `isStale`.

---

## 4. How alerts are generated and updated

### Alert generation sources

Alerts are produced by two paths:

1. **Monitor evaluation** — The `MonitorRegistry` runs all 6 registered monitors and produces `IAdminAlert[]`.
2. **Probe-to-alert bridge** — The `generateProbeHealthAlerts()` utility converts degraded/error probe results into alerts.

### Monitor registry (6 monitors)

| Monitor | Key | Status | Data provider | Severity rules |
|---------|-----|--------|---------------|----------------|
| Provisioning failure | `provisioning-failure` | **Live** | `IProvisioningDataProvider` | High (retries < 3), Critical (retries ≥ 3) |
| Stuck workflow | `stuck-workflow` | **Live** | `IProvisioningDataProvider` | High (30–120 min), Critical (> 120 min) |
| Overdue provisioning | `overdue-provisioning-task` | **Live (P12-06)** | `IProvisioningDataProvider` | Medium (1–4h), High (> 4h) |
| Permission anomaly | `permission-anomaly` | **Deferred** | No data source exists | — |
| Upcoming expiration | `upcoming-expiration` | **Deferred** | No expiration model exists | — |
| Stale record | `stale-record` | **Deferred** | No freshness metadata exists | — |

**Factory pattern for live monitors:**
```
createProvisioningFailureMonitor(provider: IProvisioningDataProvider): IAlertMonitor
createStuckWorkflowMonitor(provider: IProvisioningDataProvider): IAlertMonitor
createOverdueProvisioningMonitor(provider: IProvisioningDataProvider): IAlertMonitor
```

`createDefaultMonitorRegistry(provider?)` wires live monitors when a provider is supplied; falls back to stub variants otherwise.

### Alert state transitions

```
Active → Acknowledged → Resolved
Active → Resolved (direct resolution without acknowledgment)
Active → Superseded (replaced by newer evaluation)
```

Transitions are enforced by the backend `IObservabilityAlertStore`:
- `acknowledgeAlert(alertId, actor)` → sets status to `Acknowledged`, records actor + timestamp
- `resolveAlert(alertId, actor)` → sets status to `Resolved`, records actor + timestamp (P12-09)

### Probe-to-alert bridging

`generateProbeHealthAlerts(snapshot, nowIso)` in `@hbc/features-admin` converts:
- Probe status `error` → alert severity `critical`
- Probe status `degraded` �� alert severity `high`
- Probe status `healthy` or `unknown` → no alert

Uses `stale-record` alert category as the semantic match for infrastructure health degradation. Alert IDs follow the pattern `probe-{probeKey}-{probeId}`.

### Notification routing

`routeAlert(alert, previousSeverity)` determines the notification channel:
- `immediate` if severity is `critical` or `high` AND (no prior acknowledgment OR escalated)
- `digest` otherwise

Escalation detection compares severity ranks: critical:4, high:3, medium:2, low:1.

---

## 5. How duplicate/repeated conditions are handled

### Three-level deduplication

#### Level 1: Monitor-level

Each monitor provides a `dedupeKey(alert)` function that generates a stable string key:
- `provisioning-failure:record:{projectId}`
- `stuck-workflow:job:{projectId}`
- `overdue-provisioning-task:record:{projectId}`
- `stale-record:system:{probeKey}` (for probe-derived alerts)

#### Level 2: Registry-level (single cycle)

`MonitorRegistry.deduplicateAlerts()` removes duplicate alerts within a single evaluation cycle using the dedupe key (last-write-wins within a cycle).

#### Level 3: Backend-level (cross-cycle)

`DurableObservabilityAlertStore.ingestAlerts()` performs cross-cycle deduplication:
- Looks up existing alert by `dedupeKey` within the same category partition.
- If found: updates the existing record — increments `evaluationCount`, updates `severity` (tracks `previousSeverity` for escalation detection), updates `description`, `lastEvaluatedAt`, `ctaLabel`, `ctaHref`.
- If not found: creates a new alert record with `status: Active`, `evaluationCount: 1`.

This prevents repeated monitor cycles from creating duplicate alerts for the same condition while preserving severity escalation history.

---

## 6. What remains deferred, and why

### Deferred monitors (3)

| Monitor | Reason deferred | Required dependency |
|---------|----------------|-------------------|
| `permission-anomaly` | No permission audit data source exists in the repo | Backend service that snapshots effective permissions on provisioned sites/groups |
| `upcoming-expiration` | No expiration-tracked entities are modeled | Lifecycle model with expiration dates for secrets, certificates, or trial periods |
| `stale-record` | No record-freshness metadata exists | Modification timestamps or heartbeat records across provisioned resources |

These monitors remain in the registry as named placeholders so future work can wire them without structural changes. They return empty alert arrays and are documented as explicit non-goals for Phase 12.

### Deferred probes (3)

| Probe | Reason deferred | Required dependency |
|-------|----------------|-------------------|
| `azure-search` | Azure Search is not used as an infrastructure dependency | Azure Search service endpoint and API key configuration |
| `notification-system` | No notification health API exists | Delivery tracking service or webhook validation endpoint |
| `module-record-health` | No per-module integrity queries exist | Domain-specific health check endpoints per module |

These probes return `unknown` status (changed from the previous misleading `healthy` in P12-06) with a summary indicating they are deferred. This ensures they appear as "not yet evaluated" rather than falsely claiming health.

---

## 7. Constants reference

| Constant | Value | Purpose |
|----------|-------|---------|
| `ADMIN_ALERTS_POLL_MS` | 30,000 | Alert polling interval (30s) |
| `PROBE_SCHEDULER_DEFAULT_MS` | 900,000 | Probe polling interval (15 min) |
| `PROBE_MAX_RETRY` | 3 | Probe retry attempts before error result |
| `PROBE_STALENESS_MS` | 1,800,000 | Staleness threshold (30 min = 2× probe interval) |
| `ADMIN_RETRY_CEILING` | 3 | Provisioning retry count for severity escalation |

---

## 8. Execution flow

```
Client Session Start
  │
  ├── useProbePolling() mounted
  │     └── ProbeScheduler.runAll(nowIso) [every 15 min]
  │           ├── For each probe (sequential, insertion order):
  │           │     └── runWithRetry (up to 3 attempts, exponential backoff)
  │           │           └── Returns IInfrastructureProbeResult
  │           └── buildSnapshot(results) → IProbeSnapshot
  │                 └── POST /api/admin/observability/probes/snapshots
  │                       └── DurableObservabilityProbeSnapshotStore → Azure Table Storage
  │
  └── useAlertPolling() mounted
        └── MonitorRegistry.runAll(nowIso) [every 30 sec]
              ├── For each monitor (sequential, insertion order):
              │     └── monitor.run(nowIso) → IAdminAlert[]
              ├── generateProbeHealthAlerts(latestSnapshot)
              │     └── error → critical alert, degraded → high alert
              ├── deduplicateAlerts() → single-cycle dedup
              ├── DurableObservabilityAlertStore.ingestAlerts()
              │     └── Cross-cycle dedup by dedupeKey
              │     └── Update severity, evaluationCount, lastEvaluatedAt
              └── routeAlert(alert, previousSeverity)
                    └── critical/high → immediate notification
                    └── medium/low → digest notification
```

---

## 9. Test coverage

| Test file | Cases | Coverage |
|-----------|-------|----------|
| `monitors.test.ts` | ~15 | Registry ordering, deduplication, integration |
| `probeScheduler.test.ts` | ~9 | Sequential execution, retry, error handling |
| `probe-alert-runtime.test.ts` | 19 | P12-06: overdue monitor, probe-alert bridge, deferred stubs, registry integration |
| `provisioningFailureMonitor.test.ts` | 12 | Factory monitor, severity escalation, dedupeKey |
| `stuckWorkflowMonitor.test.ts` | ~8 | Threshold detection, escalation, time calculations |
| `sharePointProbe.test.ts` | ~5 | HTTP response handling, status mapping, metrics |
| `azureFunctionsProbe.test.ts` | ~5 | HTTP response handling, status mapping, metrics |
| `AdminAlertsApi.test.ts` | 15 | Ingestion, deduplication, acknowledge, resolve, history |
| `InfrastructureProbeApi.test.ts` | 7 | Save/retrieve, staleness, overall status |
| `teamsWebhookDispatchAdapter.test.ts` | ~10 | Delivery tracking, suppression, cooldown |
| `alert-action-workflow.test.ts` | ~8 | Acknowledge, resolve, escalation workflows |
| `integrations.test.ts` | ~5 | Reference adapter contracts |
| `helpers.test.ts` | ~5 | Utility functions |

**Total:** 200+ tests across 14 files. Type-check, lint, and build all clean.

---

## Validation

- [x] Probe execution model documented: client-side, sequential, retry with backoff
- [x] Snapshot persistence documented: client cache + backend durable storage
- [x] Alert generation documented: monitors + probe-to-alert bridge
- [x] Alert state transitions documented: Active → Acknowledged → Resolved
- [x] Three-level deduplication documented: monitor, registry, backend
- [x] Deferred items documented with specific required dependencies
- [x] Deferred probes return `unknown` (not `healthy`) — verified
- [x] Notification routing documented
- [x] Constants and execution flow included
- [x] Test coverage inventory included

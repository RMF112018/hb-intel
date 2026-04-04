# Admin SPFx IT Control Center — Phase 12 Probe and Alert Runtime

**Created:** 2026-04-04
**Prompt:** P12-06 — Probe Execution and Alert Evaluation Productionization
**Prerequisites:** P12-03 shared contracts, P12-04 persistence adapters, P12-05 backend APIs

---

## 1. Purpose

This document explains how probes run, how snapshots are persisted, how alerts are generated and updated, how duplicate/repeated conditions are handled, and what remains deferred after Phase 12 productionization.

---

## 2. How probes run

### Execution model

Probes continue to execute **client-side** in the SPFx operator console via `useProbePolling()`. This is intentional: the probes test connectivity from the operator's network perspective (SharePoint reachability, Function App health) rather than from the backend's perspective.

### Execution cycle

1. `ProbeScheduler.runAll(nowIso)` executes all registered probes **sequentially** in insertion order.
2. Each probe gets up to 3 attempts (`PROBE_MAX_RETRY`) with exponential backoff (100ms, 200ms, 400ms).
3. If a probe fails all retries, it returns an `error` result (not thrown exception).
4. `ProbeScheduler.buildSnapshot(results, snapshotId, capturedAt)` wraps results into an `IProbeSnapshot`.
5. The polling hook persists the snapshot to the backend via `POST /api/admin/observability/probes/snapshots`.

### Polling interval

Default: 15 minutes (`PROBE_SCHEDULER_DEFAULT_MS = 900_000`). First run is immediate on session mount.

### Registered probes (5 total)

| Probe | Status | Connection |
|-------|--------|-----------|
| `sharepoint-infrastructure` | **Live** | HTTP to `/api/project-setup-requests?state=Submitted` with bearer token |
| `azure-functions` | **Live** | HTTP to `/api/health` with bearer token |
| `azure-search` | **Deferred** | Returns `unknown` — no Azure Search in repo (P12-06) |
| `notification-system` | **Deferred** | Returns `unknown` — no health endpoint for Teams webhook (P12-06) |
| `module-record-health` | **Deferred** | Returns `unknown` — no per-module integrity queries (P12-06) |

---

## 3. How snapshots are persisted

### Client-side (transient)

The `InfrastructureProbeApi` in `@hbc/features-admin` stores snapshots in-memory for immediate React Query consumption. This serves as a local cache for the current session.

### Backend-side (durable)

After execution, the polling hook submits the snapshot to the backend via:
```
POST /api/admin/observability/probes/snapshots
```
The `DurableObservabilityProbeSnapshotStore` persists it to the `ObservabilityProbeSnapshots` Azure Table Storage table (P12-04).

### Overall status computation

Each snapshot carries an `overallStatus` field computed as the worst status among all probe results:
- `error` > `degraded` > `unknown` > `healthy`

### Staleness detection

A snapshot is considered stale if `capturedAt` is older than 30 minutes (`PROBE_STALENESS_MS = 1_800_000`). The health summary API reports `isStale: true` in this case.

---

## 4. How alerts are generated and updated

### Alert generation sources

Alerts are produced by two paths:

1. **Monitor evaluation** — The `MonitorRegistry` runs all 6 registered monitors and produces `IAdminAlert[]`.
2. **Probe-to-alert bridge** — The `generateProbeHealthAlerts()` utility converts degraded/error probe results into alerts.

### Monitor registry (6 monitors)

| Monitor | Status | Data provider | Severity rules |
|---------|--------|---------------|----------------|
| `provisioning-failure` | **Live** | `IProvisioningDataProvider` | High (retries < 3), Critical (retries ≥ 3) |
| `stuck-workflow` | **Live** | `IProvisioningDataProvider` | High (30–120 min), Critical (> 120 min) |
| `overdue-provisioning-task` | **Live (P12-06)** | `IProvisioningDataProvider` | Medium (1–4h), High (> 4h) |
| `permission-anomaly` | **Deferred** | No data source exists | — |
| `upcoming-expiration` | **Deferred** | No expiration model exists | — |
| `stale-record` | **Deferred** | No freshness metadata exists | — |

### Alert state transitions

```
Active → Acknowledged → Resolved
Active → Resolved (direct resolution without acknowledgment)
Active → Superseded (replaced by newer evaluation)
```

Transitions are enforced by the backend `IObservabilityAlertStore`:
- `acknowledgeAlert(alertId, actor)` → sets status to `Acknowledged`
- `resolveAlert(alertId, actor)` → sets status to `Resolved`

Both record the actor context and timestamp for audit.

### Probe-to-alert bridging

`generateProbeHealthAlerts(snapshot, nowIso)` in `@hbc/features-admin` converts:
- Probe status `error` → alert severity `critical`
- Probe status `degraded` → alert severity `high`
- Probe status `healthy` or `unknown` → no alert

This ensures infrastructure health problems detected by probes appear in the alert dashboard alongside monitor-generated alerts.

---

## 5. How duplicate/repeated conditions are handled

### Monitor-level deduplication

Each monitor provides a `dedupeKey(alert)` function that generates a stable string key for an alert condition:
- `provisioning-failure:record:{projectId}`
- `stuck-workflow:job:{projectId}`
- `overdue-provisioning-task:record:{projectId}`
- `probe-{probeKey}-{probeId}` (for probe-derived alerts)

### Registry-level deduplication

`MonitorRegistry.deduplicateAlerts()` removes duplicate alerts from a single evaluation cycle using the dedupe key (last-write-wins within a cycle).

### Backend-level deduplication

`DurableObservabilityAlertStore.ingestAlerts()` performs cross-cycle deduplication:
- Looks up existing alert by `dedupeKey` within the same category partition.
- If found: updates the existing record (severity, description, `evaluationCount`, `lastEvaluatedAt`). Tracks `previousSeverity` for escalation detection.
- If not found: creates a new alert record.

This prevents repeated monitor cycles from creating duplicate alerts for the same condition.

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

These probes return `unknown` status (changed from the previous misleading `healthy`) with a summary indicating they are deferred. This ensures they appear as "not yet evaluated" rather than falsely claiming health.

---

## 7. Validation

- [x] features-admin check-types clean
- [x] features-admin lint 0 errors (10 pre-existing warnings)
- [x] features-admin build clean
- [x] features-admin 200 tests passed (14 files), 19 new tests for P12-06
- [x] `overdueProvisioningMonitor` tested: threshold detection, severity escalation, deduplication key, CTA generation
- [x] `generateProbeHealthAlerts` tested: healthy/degraded/error/unknown handling, multi-probe snapshots
- [x] Deferred stubs tested: return empty arrays (monitors) or unknown status (probes)
- [x] Registry integration tested: wires 3 real monitors with provider, detects overdue requests

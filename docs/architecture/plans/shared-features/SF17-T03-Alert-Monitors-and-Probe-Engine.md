# SF17-T03 - Alert Monitors and Probe Engine

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-02, D-03, D-04, D-08
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF17-T03 engine task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Define the monitor registry, probe scheduler, and persistence contracts that power proactive alerts and the Implementation Truth Layer.

---

## Monitor Registry

Define `IAlertMonitor`:

```ts
export interface IAlertMonitor {
  key: AlertCategory;
  run(nowIso: string): Promise<IAdminAlert[]>;
  defaultSeverity: AlertSeverity;
  dedupeKey(alert: IAdminAlert): string;
}
```

Required monitors:

1. provisioning failure monitor
2. permission anomaly monitor
3. stuck workflow monitor
4. overdue provisioning task monitor
5. upcoming expiration monitor
6. stale record monitor

Rules:

- monitors emit active conditions only
- de-duplication is by monitor key + affected entity + normalized condition signature
- an alert auto-resolves when no active condition is returned for its dedupe key

---

## Probe Engine

- timer function cadence default `PROBE_SCHEDULER_DEFAULT_MS`
- probe order: sharepoint -> azure functions -> azure search -> notifications -> module record health
- each probe result carries status, summary, metrics, anomalies
- snapshot is written atomically; partial probe failure yields `degraded` snapshot, not dropped snapshot
- retry policy: up to `PROBE_MAX_RETRY` with exponential backoff per failed probe

---

## Persistence/API Contracts

- `AdminAlertsApi`:
  - `listActive()`
  - `acknowledge(alertId, acknowledgedBy)`
  - `listHistory(range?)`
- `InfrastructureProbeApi`:
  - `getLatestSnapshot()`
  - `listSnapshots(range?)`
  - `runNow()` (admin/manual trigger)
- scheduler writes both per-probe rows and aggregate snapshot row for dashboard consumption

---

## Notification Routing Contract

- `critical` and `high`: immediate route to admin notification channel
- `medium` and `low`: digest route
- no duplicate immediate notifications for already acknowledged alerts unless severity escalates

---

## Verification Commands

```bash
pnpm --filter @hbc/features-admin test -- monitors
pnpm --filter @hbc/features-admin test -- probes
```

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

<!-- IMPLEMENTATION PROGRESS & NOTES
SF17-T03 completed: 2026-03-11

Deliverables:
- src/types/IAlertMonitor.ts — IAlertMonitor interface contract
- src/types/IInfrastructureProbeDefinition.ts — IInfrastructureProbeDefinition interface contract
- src/types/NotificationRoute.ts — NotificationRoute type ('immediate' | 'digest')
- src/monitors/monitorRegistry.ts — MonitorRegistry class with register/getAll/runAll/deduplicateAlerts
- src/monitors/provisioningFailureMonitor.ts — IAlertMonitor impl, key='provisioning-failure', severity='critical'
- src/monitors/permissionAnomalyMonitor.ts — IAlertMonitor impl, key='permission-anomaly', severity='high'
- src/monitors/stuckWorkflowMonitor.ts — IAlertMonitor impl, key='stuck-workflow', severity='high'
- src/monitors/overdueProvisioningMonitor.ts — IAlertMonitor impl, key='overdue-provisioning-task', severity='medium'
- src/monitors/upcomingExpirationMonitor.ts — IAlertMonitor impl, key='upcoming-expiration', severity='medium'
- src/monitors/staleRecordMonitor.ts — IAlertMonitor impl, key='stale-record', severity='low'
- src/monitors/notificationRouter.ts — routeAlert() severity→route mapping with ack/escalation logic
- src/probes/probeScheduler.ts — ProbeScheduler class with retry, deterministic order, buildSnapshot
- src/probes/sharePointProbe.ts — IInfrastructureProbeDefinition impl, probeKey='sharepoint-infrastructure'
- src/probes/azureFunctionsProbe.ts — IInfrastructureProbeDefinition impl, probeKey='azure-functions'
- src/probes/searchProbe.ts — IInfrastructureProbeDefinition impl, probeKey='azure-search'
- src/probes/notificationProbe.ts — IInfrastructureProbeDefinition impl, probeKey='notification-system'
- src/probes/moduleRecordHealthProbe.ts — IInfrastructureProbeDefinition impl, probeKey='module-record-health'
- src/api/AdminAlertsApi.ts — listActive/acknowledge/listHistory contract
- src/api/InfrastructureProbeApi.ts — getLatestSnapshot/listSnapshots/runNow contract
- src/__tests__/monitors.test.ts — 18 tests (registry, dedup, routing)
- src/__tests__/probeScheduler.test.ts — 6 tests (ordering, retry, snapshot, partial failure)
- Factory functions: createDefaultMonitorRegistry(), createDefaultProbeScheduler()

Verification: check-types ✓ | build ✓ | test 24/24 passed ✓
Next: SF17-T04 (Hooks and State Model)
-->

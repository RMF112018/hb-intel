# W0-G6-T04 — Alert Routing, Severity Model, and Escalation Targets

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`
> **Related:** `packages/features/admin/src/monitors/`; `packages/features/admin/src/monitors/notificationRouter.ts`; `docs/maintenance/provisioning-runbook.md`

**Status:** Complete
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-01, LD-02, LD-04, LD-05, LD-09

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/features-admin` monitors | `packages/features/admin/src/monitors/` | Real alert detection | **STUB.** All 6 monitors (`provisioningFailureMonitor`, `stuckWorkflowMonitor`, `overdueProvisioningMonitor`, `staleRecordMonitor`, `permissionAnomalyMonitor`, `upcomingExpirationMonitor`) return `[]`. T04 is the task that implements at minimum `provisioningFailureMonitor` and `stuckWorkflowMonitor`. |
| `@hbc/features-admin` `AdminAlertsApi` | `packages/features/admin/src/api/AdminAlertsApi.ts` | Alert persistence (listActive, acknowledge) | **STUB.** `listActive()` returns `[]`; `acknowledge()` is no-op. T04 must either implement the API persistence layer or document this as a gated follow-on. |
| `@hbc/features-admin` `MonitorRegistry` | `packages/features/admin/src/monitors/monitorRegistry.ts` | Monitor orchestration | **READY.** `MonitorRegistry.runAll()`, `register()`, `deduplicateAlerts()` are implemented. |
| `@hbc/features-admin` `notificationRouter.ts` | `packages/features/admin/src/monitors/notificationRouter.ts` | Routing logic (immediate vs. digest) | **READY.** `routeAlert()` correctly routes critical/high → `immediate`, medium/low → `digest`. |
| `@hbc/features-admin` `notificationDispatchAdapter.ts` | `packages/features/admin/src/integrations/notificationDispatchAdapter.ts` | Dispatch contract | **CONTRACT-READY.** `INotificationDispatchAdapter` interface and `ReferenceNotificationDispatchAdapter` exist. No actual Teams/email wiring. T04 must wire the actual delivery or document as a known limitation. |
| `IProvisioningDataProvider` (to be defined in `@hbc/features-admin`) | `packages/features/admin/src/types/` | Monitor data access | **DEFINE IN T04.** `@hbc/features-admin` must define `IProvisioningDataProvider` — a minimal projection interface that monitors use to query request data. Monitors must not import `@hbc/provisioning` directly; that would create a cross-feature dependency violating `03-package-boundaries.md`. The concrete adapter is wired in `apps/admin/` (see DI Pattern section below). |

### Gate Outcome

**T04 is the primary implementation task for the monitor and alert subsystem.** The framework (`MonitorRegistry`, `notificationRouter`, dispatch adapter contract) is ready; the implementation (monitors, API persistence, delivery wiring) is not.

T04 must implement at minimum:
1. `provisioningFailureMonitor.run()` — detects `Failed` state requests
2. `stuckWorkflowMonitor.run()` — detects requests stuck in `Provisioning` > threshold
3. `AdminAlertsApi.listActive()` — returns real persisted alerts (via SharePoint `HBC_AdminAlerts` list or equivalent)
4. `AdminAlertsApi.acknowledge()` — marks an alert as acknowledged

Teams/email delivery via `INotificationDispatchAdapter` may be implemented in T04 or deferred with clear documentation. If deferred, `routeAlert()` output must be logged/surfaced in the admin surface so the routing decision is visible even without delivery.

---

## Objective

Implement the alert detection, routing, and escalation target wiring for Wave 0. After this task:

1. At minimum `provisioningFailureMonitor` and `stuckWorkflowMonitor` produce real alerts when provisioning failures occur
2. `AdminAlertsApi` persists and retrieves real alert records
3. `routeAlert()` routing decisions are acted upon: immediate-route alerts are dispatched without delay; digest-route alerts are batched
4. Escalation targets are wired: Teams channel for critical/high; `<tech-team-email>` for medium/low digest (LD-05)
5. The full alert lifecycle is implemented: detection → storage → routing → delivery (or delivery documented as deferred with a tracking task)

---

## Scope

### Monitor Data Access: Dependency Injection Pattern

`@hbc/features-admin` monitors cannot import `@hbc/provisioning` directly — that would create a cross-feature package dependency, violating `03-package-boundaries.md`. The resolved approach is dependency injection via a minimal interface defined inside `@hbc/features-admin`.

**`IProvisioningDataProvider`** — defined in `packages/features/admin/src/types/IProvisioningDataProvider.ts`:

```typescript
export interface IProvisioningRequestSummary {
  readonly requestId: string;
  readonly state: string;                  // matches ProjectSetupRequestState values
  readonly lastStateChangedAt?: string;    // ISO timestamp for stuck-workflow detection
  readonly retryCount?: number;            // for failure severity classification
}

export interface IProvisioningDataProvider {
  listRequests(): Promise<ReadonlyArray<IProvisioningRequestSummary>>;
}
```

**Factory function** — defined in `packages/features/admin/src/monitors/createDefaultMonitorRegistry.ts`:

```typescript
export interface MonitorRegistryDeps {
  readonly provisioningData: IProvisioningDataProvider;
}

export function createDefaultMonitorRegistry(deps: MonitorRegistryDeps): MonitorRegistry {
  const registry = new MonitorRegistry();
  registry.register(createProvisioningFailureMonitor(deps.provisioningData));
  registry.register(createStuckWorkflowMonitor(deps.provisioningData));
  return registry;
}
```

Existing stub `const` exports (`provisioningFailureMonitor`, `stuckWorkflowMonitor`) are preserved as-is for backward compatibility with any existing consumers.

**Adapter wiring** — in `apps/admin/src/bootstrap.ts` (or equivalent), where `@hbc/provisioning` CAN be imported:

```typescript
const monitorRegistry = createDefaultMonitorRegistry({
  provisioningData: {
    listRequests: () => provisioningApiClient.listRequests(),
  },
});
```

`apps/admin/` is the only layer permitted to bridge `@hbc/features-admin` and `@hbc/provisioning`. The packages remain decoupled.

---

### Monitor Implementation (minimum Wave 0 subset)

Implement at minimum the two highest-value monitors. Document the remaining 4 as follow-on tasks:

| Monitor | Priority | Implementation Requirement |
|---|---|---|
| `provisioningFailureMonitor` | **Wave 0 required** | Detect requests in `Failed` state; emit `IAdminAlert` with `category: 'provisioning-failure'` and `severity` based on how many retries have been exhausted |
| `stuckWorkflowMonitor` | **Wave 0 required** | Detect requests in `Provisioning` state with no state change > 30 minutes; emit `IAdminAlert` with `category: 'stuck-workflow'`, `severity: 'high'` |
| `overdueProvisioningMonitor` | Post-Wave-0 (document as follow-on) | Overdue tasks against SLA thresholds |
| `staleRecordMonitor` | Post-Wave-0 (document as follow-on) | Records not updated past TTL |
| `permissionAnomalyMonitor` | Post-Wave-0 (document as follow-on) | Permission inconsistencies |
| `upcomingExpirationMonitor` | Post-Wave-0 (document as follow-on) | Upcoming license/approval expirations |

### Alert API Implementation

- Implement `AdminAlertsApi.listActive()` to read from the `HBC_AdminAlerts` SharePoint list (list title constant: `ADMIN_ALERT_LIST_TITLE = 'HBC_AdminAlerts'`)
- Implement `AdminAlertsApi.acknowledge()` to mark an alert as acknowledged in the SharePoint list
- If SharePoint list persistence is not available in Wave 0, implement an in-memory or session-local fallback clearly marked as temporary

### Routing and Dispatch

- Register `provisioningFailureMonitor` and `stuckWorkflowMonitor` in `MonitorRegistry`
- Wire `MonitorRegistry.runAll()` on a polling schedule (`ADMIN_ALERTS_POLL_MS = 30_000`)
- After each `runAll()`, pass results through `deduplicateAlerts()` and then `routeAlert()` via `ReferenceNotificationDispatchAdapter`
- For `immediate` route: dispatch the alert without delay (Teams webhook or equivalent); document the integration point
- For `digest` route: accumulate and batch; send to `<tech-team-email>` on a defined schedule (LD-05)
- If Teams webhook or email delivery is not available in Wave 0, surface the routing decision in the admin UI (show which alerts would have been dispatched immediately vs. queued for digest) and document as a known limitation

---

## Exclusions / Non-Goals

- Do not implement the remaining 4 monitors (`overdueProvisioningMonitor`, `staleRecordMonitor`, `permissionAnomalyMonitor`, `upcomingExpirationMonitor`) in Wave 0. Document them as follow-on tasks.
- Do not build a bespoke notification delivery system. The delivery path must go through the `INotificationDispatchAdapter` contract (LD-02).
- Do not implement probe-based observability. That belongs to T06.
- Do not implement the `ApprovalAuthorityApi` backend. That is deferred to SF17-T05 (already handled in T02).

---

## Governing Constraints

- Monitors must implement `IAlertMonitor` from `@hbc/features-admin/types/IAlertMonitor.ts` — no custom monitor interfaces (LD-02)
- Alert delivery must go through `INotificationDispatchAdapter` — not a direct call to a Teams API or `fetch` in the monitor (LD-02)
- `routeAlert()` routing decisions must be preserved and not overridden by T04 implementation (LD-05)
- No new reusable visual components outside `@hbc/ui-kit` (LD-09)

---

## Alert Severity Assignment Rules

The following severity assignment rules govern how T04 monitor implementations must classify alerts. These rules operationalize the locked G6 severity model.

| Alert | Category | Default Severity | Escalation to Critical |
|---|---|---|---|
| Request in `Failed` state, retryCount = 0 | `provisioning-failure` | `high` | — |
| Request in `Failed` state, retryCount ≥ max | `provisioning-failure` | `critical` | Auto (ceiling reached) |
| Request stuck in `Provisioning` > 30 min | `stuck-workflow` | `high` | → `critical` if > 2 hours |
| Request stuck in `Provisioning` > 2 hours | `stuck-workflow` | `critical` | — |
| Request in `AwaitingExternalSetup` > 5 days | `overdue-provisioning-task` | `medium` | Post-Wave-0 |

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/features-admin` | Primary | All monitor types, `MonitorRegistry`, `notificationRouter`, `AdminAlertsApi`, dispatch adapter |
| `@hbc/provisioning` | `apps/admin/` only | Consumed via `IProvisioningDataProvider` adapter wired in `apps/admin/`. **Not imported by `@hbc/features-admin` monitors directly.** |
| `@hbc/ui-kit` | Required | Any new visual components for alert delivery status display |
| `apps/admin` | Target app | Monitor polling wired into admin app lifecycle |

---

## Acceptance Criteria

1. **Real alerts produced:** `provisioningFailureMonitor.run()` returns `IAdminAlert[]` for real `Failed` state requests (not empty). `stuckWorkflowMonitor.run()` returns alerts for stuck requests.

2. **Alert API persistence:** `AdminAlertsApi.listActive()` returns persisted alerts. `AdminAlertsApi.acknowledge()` marks an alert acknowledged and it no longer appears in the active list.

3. **Routing applied:** `routeAlert()` is called on each alert; immediate-route alerts are dispatched (or surfaced as "would dispatch immediately" if delivery is not wired); digest-route alerts are batched.

4. **Escalation targets documented:** This task file records the confirmed Teams webhook target and email target (`<tech-team-email>`). If delivery is not wired in Wave 0, a clear tracking note is added.

5. **Monitor registry wired:** `MonitorRegistry` runs on the `ADMIN_ALERTS_POLL_MS` schedule. Duplicate alerts are deduplicated before routing.

6. **Severity rules correct:** Alert severities match the severity assignment rules table above.

7. **Remaining monitors tracked:** The 4 deferred monitors are documented as follow-on tasks with clear next steps.

---

## Validation / Readiness Criteria

Before T04 is ready for review:

- TypeScript compilation clean in `packages/features/admin/`
- Unit tests cover: `provisioningFailureMonitor.run()` with mock `Failed` requests, `stuckWorkflowMonitor.run()` with mock stuck requests, `deduplicateAlerts()` with duplicate inputs, `routeAlert()` severity-to-route mapping for all 4 severity levels
- Manual walkthrough: a `Failed` request in the provisioning system triggers a visible alert in `AdminAlertDashboard`
- Manual walkthrough: acknowledging an alert removes it from the active list

---

## Known Risks / Pitfalls

**SharePoint list access.** `AdminAlertsApi` uses `HBC_AdminAlerts` SharePoint list. If the SharePoint list does not exist in the dev/staging environment, the API cannot persist alerts. Define a fallback (in-memory or IndexedDB) for local development.

**DI adapter wiring location.** The `IProvisioningDataProvider` adapter must be wired in `apps/admin/` before `createDefaultMonitorRegistry` is called. Confirm on first implementation pass that the monitor polling loop is initialized after the adapter is available, not before. Early initialization with an uninitialised adapter will produce empty alert results without an error.

**Teams webhook availability.** The Teams webhook for alert dispatch may not be available in Wave 0. If absent, surface the routing decision visually and document as a known limitation.

**Polling in SPFx context.** The monitor polling loop (`ADMIN_ALERTS_POLL_MS`) must be initiated correctly in the admin SPFx app shell. Verify it is initialized on mount and cleaned up on unmount.

---

## Progress Documentation Requirements

During active T04 work:

- ✅ **AdminAlertsApi persistence:** In-memory `Map` store (Wave 0). SharePoint `HBC_AdminAlerts` list is the Wave 1 target.
- ✅ **Teams webhook target:** Configurable via `VITE_TEAMS_WEBHOOK_URL` env var. `TeamsWebhookDispatchAdapter` sends Adaptive Card payloads. Wave 0: best-effort fire-and-forget; console-logs when no webhook configured.
- ✅ **Email relay:** `<tech-team-email>` configured in `useAlertPolling` hook. Wave 0: console-logged only (no SMTP).
- ✅ **Teams/email delivery status:** Wired via `TeamsWebhookDispatchAdapter`. Webhook delivery is fire-and-forget. Email relay is logged, not sent. Both are documented Wave 0 limitations.
- ✅ **Monitors implemented:** `provisioningFailureMonitor` (detects Failed requests, severity high→critical at retry ceiling) and `stuckWorkflowMonitor` (detects InProgress >30 min, escalates to critical at 2h).
- ✅ **Monitors deferred (P3):** `overdueProvisioningMonitor`, `staleRecordMonitor`, `permissionAnomalyMonitor`, `upcomingExpirationMonitor` — remain stubs, tracked as post-Wave-0 follow-on.
- ✅ **Severity model corrected:** Initial failure (`retryCount < 3`) = `high`; retry ceiling reached (`retryCount >= 3`) = `critical`. Matches T04 severity rules table.
- ✅ **DI wiring:** `AlertPollingService` in `apps/admin/src/services/alertPollingService.ts` bridges `@hbc/provisioning` → `IProvisioningDataProvider`. `useAlertPolling` hook initializes on session availability with cleanup on unmount.
- ✅ **Polling lifecycle:** `AlertPollingService.start()` runs monitors immediately then every `ADMIN_ALERTS_POLL_MS` (30s). `stop()` clears interval on unmount.

---

## Closure Documentation Requirements

Before T04 can be closed:

- `provisioningFailureMonitor` and `stuckWorkflowMonitor` are implemented and verified (not stubs)
- `AdminAlertsApi.listActive()` and `acknowledge()` are implemented (not stubs) or deferred with explicit tracking
- Delivery status (wired or deferred) recorded in this file
- All acceptance criteria verified and checked off
- TypeScript compilation clean in `packages/features/admin/`
- Deferred monitors listed as follow-on tasks with clear next steps

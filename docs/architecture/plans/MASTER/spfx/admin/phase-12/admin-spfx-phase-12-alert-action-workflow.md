# Admin SPFx IT Control Center — Phase 12 Alert Action Workflow

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-09 — re-audit against current repo truth
**Prerequisites:** P12-05 backend APIs, P12-06 runtime, P12-08 console

---

## 1. Purpose

This document describes the alert action workflow state machine, operator actions, dispatch channels, deduplication/suppression behavior, and remaining limitations.

This revision reflects repo truth after Phase 12 execution through P12-09.

---

## 2. Alert state machine

```
                    ┌─────────────────────────────┐
                    │          Active              │
                    │  (no acknowledgedAt,         │
                    │   no resolvedAt)             │
                    └──────┬──────────┬────────────┘
                           │          │
              acknowledge  │          │  resolve (direct)
                           ▼          ▼
                    ┌──────────┐  ┌──────────────┐
                    │Acknowledged│  │   Resolved   │
                    │(has ackAt, │  │(has resolvedAt│
                    │ no resAt)  │  │ auto-sets ack│
                    └──────┬─────┘  │ if not set)  │
                           │        └──────────────┘
                    resolve│              ▲
                           │              │
                           └──────────────┘
```

### Transitions

| From | To | Trigger | Side effects |
|------|----|---------|-------------|
| Active | Acknowledged | `acknowledge(alertId, userId)` | Sets `acknowledgedAt` and `acknowledgedBy` |
| Active | Resolved | `resolve(alertId, userId)` | Sets `resolvedAt`, auto-sets `acknowledgedAt`/`acknowledgedBy` if not already set |
| Acknowledged | Resolved | `resolve(alertId, userId)` | Sets `resolvedAt`, preserves existing acknowledgment |

### Visibility rules

- **Active list** (`listActive()`): only alerts with NO `acknowledgedAt` AND NO `resolvedAt`
- **History** (`listHistory(range?)`): all alerts, optionally filtered by date range (inclusive on both ends)
- **Dashboard rendering**: filters by severity, category, and acknowledgment status

### Backend enforcement

Alert state transitions are also enforced by `DurableObservabilityAlertStore` (P12-04):
- `acknowledgeAlert(alertId, actor)` → sets status to `Acknowledged` with `IAdminActorContext`
- `resolveAlert(alertId, actor)` → sets status to `Resolved` with `IAdminActorContext`

Both record actor context (UPN, objectId, displayName) and timestamp for audit.

---

## 3. Operator actions

| Action | Available when | UI element | Implementation path |
|--------|---------------|-----------|-------------------|
| **Acknowledge** | Alert is active (no `acknowledgedAt`) | "Acknowledge" button in `AdminAlertDashboard` | `useAdminAlerts().acknowledge(alertId)` → `AdminAlertsApi.acknowledge()` |
| **Resolve** | Alert is active or acknowledged (no `resolvedAt`) | `useAdminAlerts().resolve(alertId)` | `AdminAlertsApi.resolve()` — auto-acknowledges if not already |
| **Filter** | Always | Severity/Category/Status dropdowns in `AdminAlertDashboard` | Client-side filtering (severity: 5 options, category: 7 options, acknowledged: 3 options) |
| **View CTA** | Alert has `ctaHref` | "View" link/button in alert row | Navigation to affected entity |
| **Refresh** | Always | Manual refresh | `useAdminAlerts().refresh()` → React Query cache invalidation |

### Dashboard filter options

| Filter | Options |
|--------|---------|
| Severity | all, critical, high, medium, low |
| Category | all, provisioning-failure, permission-anomaly, stuck-workflow, overdue-provisioning-task, upcoming-expiration, stale-record |
| Acknowledged | all, unacknowledged, acknowledged |

---

## 4. Dispatch channels

| Channel | Route | Status | Behavior |
|---------|-------|--------|----------|
| **Teams Incoming Webhook** | `immediate` (critical/high) | **Production-ready** | Fire-and-forget POST with Adaptive Card v1.4. Delivery tracked in `INotificationDeliveryRecord`. |
| **Email relay** | `digest` (medium/low) | **Console-logged only** | SMTP not implemented. Delivery recorded as `skipped` with reason `email-relay-not-implemented`. |
| **Console** | Fallback | **Always available** | All dispatch events logged to console for debugging. |

### Dispatch routing

The `routeAlert()` function in `notificationRouter.ts` determines the channel:

| Severity | Acknowledged? | Escalated? | Route | Result |
|----------|--------------|-----------|-------|--------|
| Critical | No | — | `immediate` | Dispatch to Teams webhook |
| High | No | ��� | `immediate` | Dispatch to Teams webhook |
| Medium | No | — | `digest` | Queue for email (console-logged) |
| Low | No | — | `digest` | Queue for email (console-logged) |
| Any | Yes | No | `digest` | **Suppressed** (acknowledged, not escalated) |
| Any | Yes | Yes (higher severity) | `immediate` | Dispatch to Teams (escalation overrides acknowledgment) |

**Severity ranks:** critical: 4, high: 3, medium: 2, low: 1. Escalation = current rank > previous rank.

### Teams Adaptive Card format

```json
{
  "type": "message",
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.4",
      "body": [
        { "type": "TextBlock", "text": "[SEVERITY] title" },
        { "type": "TextBlock", "text": "description", "wrap": true },
        { "type": "FactSet", "facts": [
          { "title": "Category", "value": "..." },
          { "title": "Entity", "value": "type:id" },
          { "title": "Time", "value": "occurredAt" }
        ]}
      ],
      "actions": [{ "type": "Action.OpenUrl", "title": "Open", "url": "ctaHref" }]
    }
  }]
}
```

---

## 5. Deduplication and suppression

### 5.1 Monitor-level dedup

Each monitor provides a `dedupeKey()` function generating stable string keys:
- `provisioning-failure:record:{projectId}`
- `stuck-workflow:job:{projectId}`
- `overdue-provisioning-task:record:{projectId}`
- `stale-record:system:{probeKey}` (for probe-derived alerts)

`MonitorRegistry.deduplicateAlerts()` removes duplicates within a single evaluation cycle (last-write-wins by dedupe key).

### 5.2 Client-side alert dedup

`AdminAlertsApi.ingestAlerts()` deduplicates by `alertId` — newer alerts overwrite older ones with the same `alertId` (full replacement via `Map.set()`).

### 5.3 Backend-level dedup

`DurableObservabilityAlertStore.ingestAlerts()` deduplicates across cycles by looking up existing alerts by `dedupeKey` within the same category partition. Re-evaluation of the same condition:
- Increments `evaluationCount`
- Updates `lastEvaluatedAt`
- Updates `severity` (tracks `previousSeverity` for escalation detection)
- Updates `description`, `ctaLabel`, `ctaHref`
- Does NOT create a new alert record

### 5.4 Notification suppression (P12-09)

The `TeamsWebhookDispatchAdapter` implements two suppression mechanisms:

**Acknowledged-alert suppression:**
- If an alert has `acknowledgedAt` set, re-dispatch is suppressed (reason: `acknowledged-not-escalated`)
- Exception: if severity has escalated since acknowledgment (current rank > previous rank), the alert IS re-dispatched

**Cooldown suppression:**
- After dispatching an alert, the same `alertId` is suppressed for 5 minutes (`COOLDOWN_MS = 300_000`)
- Prevents duplicate notifications from rapid monitor cycles
- Cooldown tracked per `alertId` in `recentDispatches: Map<string, number>`
- Cooldown is in-memory only — resets on service restart

### 5.5 Delivery tracking (P12-09)

Every dispatch attempt (including suppressions) is recorded:

```typescript
interface INotificationDeliveryRecord {
  alertId: string;
  route: 'immediate' | 'digest';
  channel: 'teams-webhook' | 'email-relay' | 'console';
  status: 'delivered' | 'failed' | 'suppressed' | 'skipped';
  dispatchedAt: string;  // ISO 8601
  reason?: string;
}
```

Available via `adapter.getDeliveryLog()` for diagnostic/audit purposes. Log is in-memory only.

**Delivery status meanings:**
| Status | Meaning |
|--------|---------|
| `delivered` | Webhook POST succeeded (HTTP 2xx) |
| `failed` | Webhook POST threw error (reason: error message) |
| `suppressed` | Dispatch blocked by suppression logic (reason: `acknowledged-not-escalated` or `cooldown-active`) |
| `skipped` | Channel not configured (reason: `no-webhook-configured` or `email-relay-not-implemented`) |

---

## 6. Component and service architecture

### Alert polling service (`AlertPollingService`)

| Method | Purpose |
|--------|---------|
| `start()` | Runs immediately, then every 30s. No-op if already running. |
| `runOnce()` | Single cycle: `registry.runAll()` → `deduplicateAlerts()` → `ingestAlerts()` → dispatch |
| `stop()` | Clears interval and stops polling |
| `get api()` | Returns `AdminAlertsApi` backing store |

**Configuration:**
- `provider: IProvisioningDataProvider` — data source for monitors
- `teamsWebhookUrl?: string` — Teams Incoming Webhook URL (from `VITE_TEAMS_WEBHOOK_URL`)
- `emailRelay?: string` — email relay URL (from `VITE_ALERT_EMAIL_RELAY`)

### React Query integration (`useAdminAlerts`)

- Query key: `['admin-alerts']`
- Refetch interval: 30s (`ADMIN_ALERTS_POLL_MS`)
- `acknowledge(alertId)` mutation → invalidates query on success
- `resolve(alertId)` mutation → invalidates query on success
- `computeAlertBadge()` memoized with previous badge ref for delta detection
- Current user ID from session; defaults to `'unknown'` if unavailable

---

## 7. Limitations and residual risks

### Production-ready

| Feature | Status |
|---------|--------|
| Alert acknowledge action | Production-ready (in-memory cache + backend durable store) |
| Alert resolve action | Production-ready (P12-09, auto-acknowledges if needed) |
| Teams webhook dispatch | Production-ready (fire-and-forget with delivery tracking) |
| Notification routing (severity-based) | Production-ready |
| Acknowledged-alert suppression | Production-ready (with escalation override) |
| Cooldown duplicate suppression | Production-ready (5-minute window, in-memory) |
| Delivery status logging | Production-ready (in-memory log with 4 status types) |
| Backend alert state persistence | Production-ready (Azure Table Storage via P12-04) |

### Still limited

| Feature | Limitation | Mitigation |
|---------|-----------|-----------|
| Webhook retry | Fire-and-forget — no retry on failure | Delivery log records failures; operator sees alerts in dashboard |
| Email digest | Console-logged only — no SMTP client | Operators use Teams channel + dashboard directly |
| Cooldown persistence | In-memory only — resets on restart | 5-minute window is short; restart re-dispatch is acceptable |
| Delivery log persistence | In-memory only — cleared on reset/restart | Short-term diagnostic value; long-term audit via backend stores |
| Escalation to humans | No time-based escalation if operator doesn't act | Severity-based notification and repeated evaluation provide visibility |
| Multi-channel fan-out | Single adapter (Teams + email stub) | `INotificationDispatchAdapter` interface supports future adapters |
| Webhook authentication | No HMAC signature validation | Teams Incoming Webhooks do not require inbound validation |
| Batch digest | No batching of digest alerts | Each digest alert logged individually |

---

## 8. Test coverage

| Test file | Cases | Coverage |
|-----------|-------|----------|
| `alert-action-workflow.test.ts` | ~19 | State transitions (active→ack→resolved, active→resolved direct), suppression (acknowledged-not-escalated, cooldown-active, escalation bypass), delivery tracking (delivered/failed/suppressed/skipped), deduplication (alertId overwrite, separate preservation), error handling (non-existent throws, resolve auto-ack) |
| `teamsWebhookDispatchAdapter.test.ts` | ~10 | Routing by severity, webhook POST payload validation, missing webhook URL handling, digest routing, Adaptive Card format, fetch error handling |
| `AdminAlertsApi.test.ts` | 15 | Ingestion, deduplication, acknowledge, resolve, listActive, listHistory |

**Total:** 219 tests passed across 15 files in `@hbc/features-admin`, including 19 new P12-09 tests.

---

## Validation

- [x] Alert state machine documented with transitions and visibility rules
- [x] Operator actions documented with UI elements and implementation paths
- [x] Dispatch channels documented with routing rules and Adaptive Card format
- [x] Three-level deduplication documented (monitor, client, backend)
- [x] Two-tier notification suppression documented (acknowledged-alert, cooldown)
- [x] Delivery tracking documented with 4 status types and reasons
- [x] Component/service architecture documented (AlertPollingService, useAdminAlerts)
- [x] Limitations and residual risks clearly separated from production-ready features
- [x] Test coverage inventory included

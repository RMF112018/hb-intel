# Admin SPFx IT Control Center — Phase 12 Alert Action Workflow

**Created:** 2026-04-04
**Prompt:** P12-09 — Notification Dispatch and Operator Action Workflows
**Prerequisites:** P12-05 backend APIs, P12-06 runtime, P12-08 console

---

## 1. Purpose

This document describes the alert action workflow state machine, operator actions, dispatch channels, deduplication/suppression behavior, and remaining limitations.

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
                           │        └────────────���─┘
                    resolve│              ▲
                           │              ���
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
- **History** (`listHistory()`): all alerts regardless of state
- **Dashboard rendering**: filters by severity, category, and acknowledgment status

---

## 3. Operator actions

| Action | Available when | UI element | Backend path |
|--------|---------------|-----------|-------------|
| **Acknowledge** | Alert is active (no `acknowledgedAt`) | "Acknowledge" button in `AdminAlertDashboard` | `useAdminAlerts().acknowledge(alertId)` → `AdminAlertsApi.acknowledge()` |
| **Resolve** | Alert is active or acknowledged (no `resolvedAt`) | `useAdminAlerts().resolve(alertId)` | `AdminAlertsApi.resolve()` |
| **Filter** | Always | Severity/Category/Status dropdowns | Client-side filtering in `AdminAlertDashboard` |
| **View CTA** | Alert has `ctaHref` | "View" link in alert row | Navigation to affected entity |
| **Refresh** | Always | Manual refresh | `useAdminAlerts().refresh()` → query invalidation |

---

## 4. Dispatch channels

| Channel | Route | Status | Behavior |
|---------|-------|--------|----------|
| **Teams Incoming Webhook** | `immediate` (critical/high) | Production-ready | Fire-and-forget POST with Adaptive Card. Delivery tracked in `INotificationDeliveryRecord`. |
| **Email relay** | `digest` (medium/low) | Console-logged only | SMTP not implemented. Delivery recorded as `skipped` with reason `email-relay-not-implemented`. |
| **Console** | Fallback | Always available | All dispatch events logged to console for debugging. |

### Dispatch routing

The `routeAlert()` function in `notificationRouter.ts` determines the channel:

| Severity | Route | Acknowledged? | Escalated? | Result |
|----------|-------|--------------|-----------|--------|
| Critical | `immediate` | No | — | Dispatch to Teams |
| High | `immediate` | No | — | Dispatch to Teams |
| Medium | `digest` | No | — | Queue for email (logged) |
| Low | `digest` | No | — | Queue for email (logged) |
| Any | — | Yes | No | **Suppressed** |
| Any | `immediate` | Yes | Yes (higher severity) | Dispatch to Teams |

---

## 5. Deduplication and suppression

### 5.1 Monitor-level dedup

Each monitor provides a `dedupeKey()` function. The `MonitorRegistry.deduplicateAlerts()` removes duplicates within a single evaluation cycle (last-write-wins by dedupe key).

### 5.2 Backend-level dedup

The `DurableObservabilityAlertStore.ingestAlerts()` deduplicates across cycles by looking up existing alerts by `dedupeKey` within the same category partition. Re-evaluation of the same condition increments `evaluationCount` and updates `lastEvaluatedAt` rather than creating a new alert.

### 5.3 Notification suppression (P12-09)

The `TeamsWebhookDispatchAdapter` implements two suppression mechanisms:

**Acknowledged-alert suppression:**
- If an alert has `acknowledgedAt` set, re-dispatch is suppressed
- Exception: if severity has escalated since previous dispatch (e.g., high → critical), the alert is re-dispatched

**Cooldown suppression:**
- After dispatching an alert, the same `alertId` is suppressed for 5 minutes
- Prevents duplicate notifications from rapid monitor cycles
- Cooldown tracks are in-memory and reset on service restart

### 5.4 Delivery tracking (P12-09)

Every dispatch attempt (including suppressions) is recorded in `INotificationDeliveryRecord`:

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

Available via `adapter.getDeliveryLog()` for diagnostic/audit purposes.

---

## 6. Limitations and residual risks

### Production-ready

| Feature | Status |
|---------|--------|
| Alert acknowledge action | Production-ready (in-memory + backend durable store) |
| Alert resolve action | Production-ready (P12-09) |
| Teams webhook dispatch | Production-ready (fire-and-forget with delivery tracking) |
| Notification routing (severity-based) | Production-ready |
| Acknowledged-alert suppression | Production-ready |
| Cooldown duplicate suppression | Production-ready (in-memory, 5-minute window) |
| Delivery status logging | Production-ready |

### Still limited

| Feature | Limitation | Mitigation |
|---------|-----------|-----------|
| Webhook retry | Fire-and-forget — no retry on failure | Delivery log records failures for operator awareness |
| Email digest | Console-logged only — no SMTP client | Operators use Teams channel + dashboard directly |
| Cooldown persistence | In-memory only — resets on restart | 5-minute window is short enough that restart re-dispatch is acceptable |
| Escalation to humans | No time-based escalation if operator doesn't act | Severity-based notification and repeated evaluation provide visibility |
| Multi-channel fan-out | Single adapter (Teams + email stub) | `INotificationDispatchAdapter` interface supports future adapters |
| Webhook authentication | No HMAC signature validation | Teams Incoming Webhooks do not require inbound validation |

---

## 7. Validation

- [x] features-admin check-types clean
- [x] features-admin lint clean (0 new errors)
- [x] features-admin build clean
- [x] 219 tests passed (15 files), 19 new P12-09 tests
- [x] State transitions tested: active → acknowledged → resolved, active → resolved (direct)
- [x] Suppression tested: acknowledged-not-escalated, cooldown-active, escalation bypass
- [x] Delivery tracking tested: delivered, failed, suppressed, skipped statuses
- [x] Deduplication tested: alertId overwrite, separate alertIds preserved
- [x] Error handling tested: non-existent alert throws, resolve auto-acknowledges

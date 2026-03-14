# Provisioning Notification Event Matrix

**Traceability:** W0-G1-T03
**Classification:** Living Reference (Diataxis Reference quadrant)

This document defines the complete notification contract for the provisioning lifecycle. All 8 events are registered with `@hbc/notification-intelligence` via `PROVISIONING_NOTIFICATION_REGISTRATIONS` in `@hbc/provisioning`.

---

## Event Matrix

| # | Event Type | Default Tier | Tier Overridable | Channels | Fired When |
|---|-----------|-------------|-----------------|----------|-----------|
| 1 | `provisioning.request-submitted` | watch | Yes | in-app | A new Project Setup Request is submitted (G3/T07 callsite) |
| 2 | `provisioning.clarification-requested` | immediate | No | in-app, email, push | Controller requests additional info from submitter (G3/T07 callsite) |
| 3 | `provisioning.ready-to-provision` | immediate | No | in-app, email, push | Request reviewed and cleared for external setup (G3/T07 callsite) |
| 4 | `provisioning.started` | watch | Yes | in-app | Saga begins executing provisioning steps |
| 5 | `provisioning.first-failure` | immediate | No | in-app, email, push | Saga fails on first attempt (retryCount === 0) |
| 6 | `provisioning.second-failure-escalated` | immediate | No | in-app, email, push | Saga fails on second+ attempt (retryCount >= 1) — escalated to admin |
| 7 | `provisioning.completed` | watch | Yes | in-app, push | Saga completes successfully (all steps passed) |
| 8 | `provisioning.recovery-resolved` | watch | Yes | in-app | A previously failed provisioning recovers on retry (G3/T07 callsite) |

## Recipient Resolution

Recipients are resolved by `resolveRecipients()` in `notification-dispatch.ts`. The function deduplicates across groups to prevent double notifications (risk R3).

| Recipient Group | Resolution Source |
|----------------|-----------------|
| `submitter` | `status.submittedBy` UPN |
| `controller` | `CONTROLLER_UPNS` env var (comma-separated) |
| `group` | `status.groupMembers` + `status.groupLeaders` UPN arrays |
| `admin` | `ADMIN_UPNS` env var (comma-separated) |

### Event-to-Recipient Mapping

| Event | Recipients |
|-------|-----------|
| `provisioning.request-submitted` | controller |
| `provisioning.clarification-requested` | submitter |
| `provisioning.ready-to-provision` | controller |
| `provisioning.started` | group |
| `provisioning.first-failure` | controller, submitter |
| `provisioning.second-failure-escalated` | controller, submitter, admin |
| `provisioning.completed` | group, submitter |
| `provisioning.recovery-resolved` | group, submitter |

## INotificationRegistration Specification

Each event is registered using the `INotificationRegistration` interface from `@hbc/notification-intelligence`:

```typescript
interface INotificationRegistration {
  eventType: string;        // Namespaced as 'provisioning.<action>'
  defaultTier: NotificationTier;  // 'immediate' | 'watch' | 'digest'
  description: string;      // Human-readable, shown in preferences UI
  tierOverridable: boolean;  // false for accountability events
  channels: NotificationChannel[];  // Default delivery channels
}
```

Registration is performed at module load time in `notificationBootstrap.ts`, which is imported by `ProcessNotification.ts`.

## Pipeline Integration Pattern

Notifications are dispatched via the `dispatchProvisioningNotification()` helper in the saga orchestrator. The pattern follows D-PH6-06 (non-blocking):

1. Saga reaches a notification point (start, complete, fail).
2. `dispatchProvisioningNotification()` resolves recipients and calls `services.notifications.send()` per recipient.
3. Each `send()` enqueues to `hbc-notifications-queue` via the internal `/api/notifications/send` endpoint.
4. `ProcessNotification` dequeues and routes through tier resolution, channel routing, and delivery.
5. Failures are caught and logged as warnings — notifications never block the saga.

## Message Clarity Rules

- **Subjects** must include the project number and project name for identification.
- **Bodies** must include actionable context: what happened and what to do next.
- **Action URLs** deep-link to the relevant view in HB Intel (Accounting app for provisioning status, Estimating app for request updates).
- Templates are maintained in `PROVISIONING_NOTIFICATION_TEMPLATES` in `@hbc/provisioning`.

## Teams Channel Deferral

Teams channel integration (adaptive cards, channel posts) is deferred to a future wave. The current implementation uses in-app, email, and push channels only. No Teams stubs or push channel additions are included in this deliverable.

## Environment Variables

| Variable | Purpose | Set By |
|----------|---------|--------|
| `CONTROLLER_UPNS` | Comma-separated UPNs for controller role | T04 environment classification |
| `ADMIN_UPNS` | Comma-separated UPNs for admin escalation | T04 environment classification |
| `NOTIFICATION_API_BASE_URL` | Base URL for notification API (default: `http://localhost:7071`) | Azure Functions app settings |

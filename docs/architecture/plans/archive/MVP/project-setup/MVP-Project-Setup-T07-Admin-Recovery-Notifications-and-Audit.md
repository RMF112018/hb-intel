# MVP-Project-Setup-T07 — Admin Recovery, Notifications, and Audit

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-08 through D-11, D-15 + R-03, R-05, R-08
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T02, T03, T05, T06

---

## Prerequisites

- **T01 admin router fix must be complete** before T07 begins. The `/provisioning-failures` route in `apps/admin` must render `ProvisioningFailuresPage`, not `SystemSettingsPage`.
- **T02 `IProvisioningEventRecord` type must exist** in `@hbc/models` before event history storage can be implemented.

> **Doc Classification:** Canonical Normative Plan — admin-recovery/audit task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Turn the existing thin failed-runs surface into a governed admin recovery workspace with explicit takeover semantics, business-readable failure summaries, notification routing through the existing backend pipeline, and append-only event history in Azure Table Storage.

---

## Required Paths

```text
apps/admin/src/pages/ProvisioningFailuresPage.tsx
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts
backend/functions/src/functions/notifications/*          ← existing pipeline to integrate with
backend/functions/src/services/table-storage-service.ts  ← extend with event storage
packages/notification-intelligence/*
packages/provisioning/src/notification-templates.ts      ← extend with new event templates
packages/models/src/provisioning/*
```

---

## Existing Backend Notification Infrastructure

`backend/functions/src/functions/notifications/` contains a substantially complete notification pipeline. T07 must integrate with it — **not duplicate or bypass it**.

| File | Purpose |
|------|---------|
| `SendNotification.ts` | Trigger endpoint — call this to send a notification |
| `ProcessNotification.ts` | Internal processing with tier classification |
| `lib/channelRouter.ts` | Routes delivery by notification tier and user preference |
| `lib/tierResolver.ts` | Classifies priority tier based on event type |
| `lib/emailDelivery.ts` | Email channel delivery |
| `lib/pushDelivery.ts` | Push/SignalR channel delivery |
| `lib/notificationStore.ts` | Persistence layer for notification records |
| `lib/preferencesStore.ts` | Per-user preference storage |

**Integration requirement:** All 8 MVP lifecycle notifications listed below must route **through the existing `SendNotification` endpoint and `channelRouter`**. This ensures preference management, tier resolution, and delivery channel selection are consistent.

Call pattern from saga/request lifecycle handlers:

```ts
await services.notifications.sendNotification({
  eventType: 'request-submitted',  // maps to tierResolver classification
  recipients: [controllerUpn],
  payload: { requestId, projectName, requestUrl },
});
```

---

## Notification Requirements

Extend `packages/provisioning/src/notification-templates.ts` with the following event templates (the file already has 5; add the missing ones):

| Event | Recipients | Notes |
|---|---|---|
| request-submitted | Controller | New request needs review |
| clarification-requested | Requester | Field-level clarification needed |
| ready-to-provision | Controller | External setup complete, ready for Finish Setup |
| provisioning-started | Requester + business watchers | Saga triggered |
| first-failure | Requester + Controller | Retry available |
| second-failure-escalated | Admin + business stakeholders | Takeover required |
| completed | Requester + business watchers | Site link included |
| recovery-resolved | Requester + Controller | Admin resolved the issue |

Notification content rules:
- must remain business-readable (no raw enum values, step IDs, or internal state names)
- must include direct deep links to the relevant surface where possible (Estimating `/project-setup/${requestId}`, Admin `/provisioning-failures`)
- routing via `channelRouter` ensures delivery respects user preferences

---

## Admin Recovery Requirements

### Failure dashboard behavior (`ProvisioningFailuresPage`)

The existing page has Retry and Escalate buttons only. Expand to show:

- failed and escalated runs with business-readable state summary
- whether business retry remains available (`retryPolicy.requesterRetryUsed === false`)
- whether admin takeover is required (`retryPolicy.secondFailureEscalated === true`)
- last successful step (`lastSuccessfulStep`) and failure step
- latest human-readable failure summary (not raw error message)
- Admin retry from the last safe checkpoint (`lastSuccessfulStep`)
- mark-resolved only when status truth confirms success or explicit closure

### Takeover semantics

- second failed retry automatically shifts `currentOwner = 'Admin'` (via `deriveCurrentOwner()` in T02)
- takeover event must be written to `IProvisioningEventRecord` with:
  - `category: 'admin-takeover'`
  - `actor`: Admin UPN
  - `summary`: plain-English takeover reason
- `IRequestTakeoverMetadata` on the request record must be populated with actor, timestamp, reason
- requester and Controller must be able to see that Admin now owns the issue (via BIC signal)
- Admin must be able to write a `recoverySummary` on `IRequestTakeoverMetadata` that is visible to Estimating and Accounting in business-plain language

---

## Audit / Event History Requirements

### Storage specification

`IProvisioningEventRecord` items (defined in T02) must be persisted in **Azure Table Storage**:

- **Table name:** `ProvisioningEvents`
- **Partition key:** `projectId`
- **Row key:** `eventId` (UUID v4; generated at write time)
- **Sort order:** by `occurredAtIso` ascending

Extend `backend/functions/src/services/table-storage-service.ts` with:

```ts
appendProvisioningEvent(record: IProvisioningEventRecord): Promise<void>;
listProvisioningEvents(projectId: string): Promise<IProvisioningEventRecord[]>;
```

Do **not** store event records in SharePoint — use Azure Table Storage for query performance and cost efficiency. The existing `IProvisioningAuditRecord` SharePoint write path is retained separately for audit log compliance.

### Event categories to write

Write an `IProvisioningEventRecord` for each of:

- state transitions (every `advanceState` call)
- clarification raised / resolved
- request canceled / reopened
- provisioning started / step progress / saga completion / saga failure
- retry invoked
- escalation invoked
- admin takeover / recovery notes written
- site launch ready

### Event timeline display

Each app must display an appropriate filtered view of the event timeline:

- **Estimating:** requester-relevant events (omit step-level internals unless admin role)
- **Accounting:** controller-relevant events (state transitions, clarifications, provisioning outcome)
- **Admin:** full event log with all categories

---

## Verification Commands

```bash
pnpm --filter @hbc/spfx-admin check-types
pnpm --filter @hbc/spfx-admin test
pnpm --filter @hbc/functions test -- notifications

# Confirm admin router fix is in place (should have been done in T01)
grep -n "ProvisioningFailuresPage" apps/admin/src/router/routes.ts

# Confirm existing notification pipeline is used (not a new parallel path)
rg -n "SendNotification\|sendNotification\|channelRouter" backend/functions/src/functions/provisioningSaga/ backend/functions/src/functions/projectRequests/

# Confirm new event storage methods exist
rg -n "appendProvisioningEvent\|listProvisioningEvents" backend/functions/src/services/table-storage-service.ts

# Confirm takeover semantics
rg -n "IRequestTakeoverMetadata\|takenOverBy\|recoverySummary\|admin-takeover" apps/admin/src/ backend/functions/src/

# Confirm notification templates extended
rg -n "request-submitted\|clarification-requested\|second-failure-escalated\|recovery-resolved" packages/provisioning/src/notification-templates.ts

# Confirm ProvisioningEvents table is referenced
rg -n "ProvisioningEvents" backend/functions/src/services/table-storage-service.ts

# 05 | Subscription, Delta, Queue, and State Design

## Objective

Define the durable synchronization control plane for the My Projects projection architecture:
- Graph list subscriptions,
- webhook delivery,
- Service Bus debounce queue,
- delta-state management,
- Azure Table operational state,
- leases and run tracking.

---

## 1. Source Lists

The subsystem monitors two source lists in HBCentral:

| Source kind | Source list |
|---|---|
| `Projects` | `Projects` |
| `LegacyRegistry` | `Legacy Project Fallback Registry` |

Both are read through Microsoft Graph using the existing federated Graph token provider.

---

## 2. Graph Subscription Design

## 2.1 Subscription resources

Create one Microsoft Graph subscription per source list.

```text
/sites/{site-id}/lists/{projects-list-id}
/sites/{site-id}/lists/{legacy-registry-list-id}
```

## 2.2 Subscription body

```json
{
  "changeType": "updated",
  "notificationUrl": "https://<function-host>/api/webhooks/my-projects-projection/graph",
  "resource": "/sites/{site-id}/lists/{list-id}",
  "expirationDateTime": "<UTC now + 27 days>",
  "clientState": "<configured client-state secret>"
}
```

## 2.3 Permission gate

The final live subscription-create test is blocked until:

```text
Microsoft Graph Application permission: Sites.Read.All
```

is granted/admin-consented on the Graph-authorized app identity lane.

## 2.4 Subscription lifetime

- Create at 27 days.
- Daily renewal timer evaluates both subscriptions.
- Renew when remaining lifetime is less than 7 days.
- Record failures and emit telemetry.
- A missing subscription is not silently ignored.

---

## 3. Webhook Ingress Design

## 3.1 Validation-token handshake

If Microsoft Graph sends:

```text
POST /api/webhooks/my-projects-projection/graph?validationToken={opaque}
```

the function returns:

```text
200 OK
Content-Type: text/plain
Body: URL-decoded opaque token, and nothing else
```

## 3.2 Normal notification body

For operational notifications:

1. Parse body.
2. Validate it contains a notification collection.
3. For each notification:
   - verify `clientState`,
   - read subscription ID,
   - classify source-list kind from subscription state/resource.
4. Build queue message for each source-list kind represented in the payload.
5. Send queue message.
6. Return `202 Accepted` only after durable queue send succeeds.

If the queue send fails:
- return `5xx`;
- Graph retry should handle redelivery.

## 3.3 `clientState` secret

Use Function App secure setting:

```text
HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE
```

The webhook must compare received `clientState` exactly to the configured value and:
- reject/ignore forged notifications,
- emit sanitized telemetry,
- not enqueue work.

---

## 4. Queue Debounce Design

## 4.1 Queue

```text
Azure Service Bus queue:
my-projects-projection-sync
```

## 4.2 Queue message body

See:
```text
resources/Service_Bus_Message_Contract.json
```

## 4.3 MessageId dedupe

Use deterministic Service Bus `MessageId`:

```text
my-projects-projection:{sourceListKind}:{debounceWindowStartUtc}
```

Examples:
```text
my-projects-projection:Projects:2026-05-17T14:32:00Z
my-projects-projection:LegacyRegistry:2026-05-17T14:32:00Z
```

## 4.4 Debounce bucket

Use:
```text
HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS = 60
```

The webhook does not need to sleep. It simply:
- rounds current UTC to the active 60-second window,
- sets deterministic `MessageId`,
- sends the message,
- relies on queue duplicate detection to coalesce bursts.

## 4.5 Queue properties supporting debounce

- Duplicate detection enabled.
- History window: 10 minutes.
- Partitioning disabled.
- Sessions disabled.

This keeps dedupe keyed only by `MessageId`.

---

## 5. Delta Sync Design

## 5.1 Delta state per source

The worker holds one delta checkpoint per source list in Azure Table Storage.

### Table
```text
MyProjectsProjectionDeltaState
```

### Keys

| Source | PartitionKey | RowKey |
|---|---|---|
| Projects | `MyProjectsProjection` | `DeltaState:Projects` |
| Legacy Registry | `MyProjectsProjection` | `DeltaState:LegacyRegistry` |

## 5.2 Initial baseline

After initial seed/rebuild is complete, acquire:

```text
/items/delta?token=latest
```

Store the returned `@odata.deltaLink`.

This means future delta syncs process only changes that happen after the seed.

## 5.3 Worker flow

```text
load delta state
→ use stored deltaLink
→ GET Graph delta
→ follow nextLink pages
→ accumulate changed/deleted items
→ recompute projection slices
→ persist helper-list updates
→ persist final deltaLink
```

## 5.4 Deleted-item behavior

If delta item contains deletion metadata:
- treat it as source item deleted;
- invoke the delete-specific projection slice rules;
- do not assume the deleted source can be fetched.

## 5.5 410 Gone behavior

If Graph returns `410 Gone`:
1. Do not overwrite the previous valid delta link.
2. Mark delta state:
   - `NeedsResync = true`
   - `LastFailureCode = delta-token-expired-or-invalid`
3. Emit high-priority telemetry.
4. Queue/admin rebuild path must perform controlled full resync:
   - full seed/rebuild,
   - reacquire `token=latest`.

No silent partial continuation.

---

## 6. Azure Table State Contracts

## 6.1 Subscription state table

### Table
```text
MyProjectsProjectionSubscriptions
```

### Keys

| Source | PartitionKey | RowKey |
|---|---|---|
| Projects | `MyProjectsProjection` | `Subscription:Projects` |
| Legacy Registry | `MyProjectsProjection` | `Subscription:LegacyRegistry` |

### Fields

| Field | Purpose |
|---|---|
| `SourceListKind` | Projects / LegacyRegistry |
| `SourceSiteId` | Graph site ID |
| `SourceListId` | Graph list ID |
| `SubscriptionId` | Graph subscription ID |
| `Resource` | Graph resource string |
| `NotificationUrl` | Current webhook URL |
| `ExpirationDateTimeUtc` | Current expiration |
| `Status` | `healthy`, `renewal-required`, `missing`, `failed` |
| `LastCreateAttemptUtc` | Last create attempt |
| `LastRenewalAttemptUtc` | Last renewal attempt |
| `LastRenewalSuccessUtc` | Last successful renewal |
| `LastFailureCode` | Sanitized closed-set failure classification |
| `LastFailureAtUtc` | Failure timestamp |

---

## 6.2 Delta state table

### Table
```text
MyProjectsProjectionDeltaState
```

### Fields

| Field | Purpose |
|---|---|
| `SourceListKind` | Projects / LegacyRegistry |
| `DeltaLink` | Persisted Graph delta link |
| `NeedsResync` | Boolean |
| `LastDeltaPullStartedUtc` | Worker state |
| `LastDeltaPullSucceededUtc` | Worker success |
| `LastDeltaPullFailedUtc` | Worker failure |
| `LastFailureCode` | Sanitized closed-set code |
| `LastChangedItemCount` | Last batch changed count |
| `LastDeletedItemCount` | Last batch deleted count |
| `LastProjectionBatchId` | Batch linkage |

---

## 6.3 Lease table

### Table
```text
MyProjectsProjectionLeases
```

### Keys

| Lease | PartitionKey | RowKey |
|---|---|---|
| Projects sync | `MyProjectsProjection` | `Lease:Sync:Projects` |
| Registry sync | `MyProjectsProjection` | `Lease:Sync:LegacyRegistry` |
| Seed/rebuild | `MyProjectsProjection` | `Lease:Rebuild:Global` |
| Drift audit | `MyProjectsProjection` | `Lease:DriftAudit:Global` |
| Purge | `MyProjectsProjection` | `Lease:Purge:Global` |

### Fields

| Field | Purpose |
|---|---|
| `LeaseOwner` | invocation/run ID |
| `LeaseAcquiredAtUtc` | timestamp |
| `LeaseExpiresAtUtc` | TTL boundary |
| `LeaseType` | sync/rebuild/audit/purge |
| `SourceListKind` | optional source lane |

### Lease update semantics

Use optimistic concurrency:
- get current lease entity,
- if absent or expired, attempt upsert/replace using ETag condition,
- only the winning worker proceeds.

---

## 6.4 Runs table

### Table
```text
MyProjectsProjectionRuns
```

### Keys

| Field | Value |
|---|---|
| PartitionKey | `MyProjectsProjection` |
| RowKey | `Run:{StartedAtUtc}:{RunId}` |

### Fields

| Field | Purpose |
|---|---|
| `RunId` | Unique ID |
| `RunType` | `seed`, `incremental`, `subscription-renewal`, `drift-audit`, `drift-repair`, `purge`, `manual-rebuild` |
| `StartedAtUtc` | Start |
| `CompletedAtUtc` | End |
| `Status` | `running`, `succeeded`, `failed`, `partial`, `skipped` |
| `SourceListKind` | optional |
| `ProjectionBatchId` | projection batch linkage |
| `ChangedItemCount` | worker summary |
| `DeletedItemCount` | worker summary |
| `HelperRowsInserted` | write summary |
| `HelperRowsUpdated` | write summary |
| `HelperRowsReactivated` | write summary |
| `HelperRowsDeactivated` | write summary |
| `HelperRowsPurged` | purge summary |
| `DriftMissingCount` | audit summary |
| `DriftExtraCount` | audit summary |
| `DriftContentMismatchCount` | audit summary |
| `FailureCode` | sanitized closed-set |
| `Notes` | short sanitized operational note |

---

## 7. Subscription Renewal Timer Design

### Schedule

Default:
```text
0 15 2 * * *
```

Daily at 02:15 UTC unless the existing backend operational timezone convention dictates otherwise.

### Work
For each source:
1. load state row;
2. if missing: create subscription;
3. if expiry < 7 days: renew;
4. else no-op;
5. write run record;
6. emit telemetry.

---

## 8. Nightly Drift Audit and Weekly Repair

## 8.1 Nightly read-only audit

### Schedule
```text
0 30 3 * * *
```

### Behavior
- acquire global drift audit lease;
- read source state;
- compute expected helper projection;
- compare with active Registry rows;
- emit telemetry/run record;
- no mutation.

## 8.2 Weekly repair timer

### Schedule
```text
0 0 4 * * 0
```

### Initial production config
```text
HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED=false
```

### Enablement rule
After 14 clean production days:
- operator changes to `true`,
- deployment/change log records the enablement.

### Behavior when enabled
- same comparison as drift audit,
- upsert missing/mismatched rows,
- soft-deactivate extra active rows,
- write run record and telemetry.

---

## 9. Monthly Inactive Purge

### Schedule
```text
0 0 5 1 * *
```

### Behavior
- delete inactive helper rows older than 90 days;
- write run telemetry;
- do not touch active rows;
- do not touch state tables.

---

## 10. State That Must Not Be Stored in SharePoint

Do not store:
- Graph delta links,
- subscription IDs,
- subscription expiration timestamps,
- sync leases,
- queue retries,
- service bus message IDs,
- webhook client-state secret,
- failure retry counters.

These are backend operational-state concerns and belong in Azure Table Storage or secure app configuration.

---

## 11. Idempotency Model

### Queue-level
- duplicate detection suppresses debounce duplicates.

### Worker-level
- lease prevents concurrent same-source delta drains.

### Projection-write level
- `ProjectionKey` unique value prevents duplicate helper rows.
- `ProjectionContentHash` prevents unnecessary updates.

### Delta-checkpoint level
- only persist final delta link after successful projection writes.

---

## 12. Failure Model

| Failure | Response |
|---|---|
| Webhook validation token request | Return 200 plain text |
| Invalid clientState | Reject/ignore, telemetry, no queue message |
| Queue send fails | Return 5xx to Graph |
| Queue worker lease conflict | Safe skip/coalesce |
| Graph delta request fails | Worker failure, message retry |
| Graph delta 410 | Mark resync required, telemetry, controlled rebuild path |
| Registry write fails | Message retry; do not advance delta token |
| Delta state write fails | Message retry or hard failure; do not claim success |
| DLQ message appears | Operator review and repair runbook |

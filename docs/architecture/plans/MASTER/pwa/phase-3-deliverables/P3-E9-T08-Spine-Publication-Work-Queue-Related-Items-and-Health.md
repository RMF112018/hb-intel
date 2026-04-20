# P3-E9-T08 — Reports: Spine Publication, Work Queue, Related Items, and Health

**Module:** P3-E9 Reports
**Governing contracts:** P3-D1 §8.6 (Activity), P3-D2 §11 (Health), P3-D3 §12 (Work Queue), P3-D4 §9 (Related Items)
**Source in monolith:** §12 (Spine Publication Contract)

---

## 1. Activity Spine

### 1.1 Events Published

Reports publishes to the Activity spine with the following event types (P3-D1 §8.6):

```typescript
type ReportsActivityEventType =
  | 'reports.draft-refreshed'  // Draft refreshed with live module data
  | 'reports.approved'         // PX Review approved by PE
  | 'reports.released'         // Report released for distribution
  | 'reports.stale-warning';   // Draft exceeded staleness threshold (escalated)
```

### 1.2 Event Contract

```typescript
interface IReportsActivityEvent {
  eventId: string;             // UUID
  eventType: ReportsActivityEventType;
  category: 'record-change' | 'approval' | 'handoff' | 'alert';
  significance: 'routine' | 'notable';
  projectId: string;
  familyKey: string;
  relatedRunId: string | null; // FK to IReportRunRecord; null for draft-refreshed (no run yet)
  triggeredByUPN: string;      // Actor UPN
  triggeredAt: string;         // ISO 8601
  summary: string;             // Human-readable event summary
}
```

### 1.3 Event Table

| Event Type | Category | Significance | Trigger Condition |
|------------|----------|-------------|-------------------|
| `reports.draft-refreshed` | `record-change` | `routine` | PM refreshes draft; module snapshot data updated |
| `reports.approved` | `approval` | `notable` | PE approves PX Review run; status transitions to `approved` |
| `reports.released` | `record-change` | `notable` | Any report run transitions to `released` status |
| `reports.stale-warning` | `alert` | `notable` | Draft staleness exceeds 2× threshold |

### 1.4 Event Summary Templates

| Event | Summary Template |
|-------|-----------------|
| `reports.draft-refreshed` | "PX Review draft refreshed — data current as of [timestamp]" |
| `reports.approved` | "PX Review approved by [PE name] — ready for release" |
| `reports.released` | "[Family display name] released — [release class] distribution" |
| `reports.stale-warning` | "[Family display name] draft is [N] days old — refresh required before export" |

---

## 2. Health Spine

### 2.1 Report Currency Metric

Reports contributes a "Report Currency" metric to the Office dimension of the Health spine (P3-D2 §11):

```typescript
interface IReportCurrencyHealthMetric {
  metricKey: 'report-currency';
  dimension: 'Office';
  projectId: string;
  value: number;               // Days since last approved or released report (PX Review or Owner Report)
  threshold: number;           // Configured staleness threshold for health calculation (e.g., 30 days)
  status: 'green' | 'yellow' | 'red'; // red when value > threshold
  lastUpdatedAt: string;       // ISO 8601
  associatedRunId: string | null; // Latest approved/released run ID; null if no approved run exists
}
```

### 2.2 Metric Calculation

- `value` = `now - approvedAt` (for the most recent approved or released PX Review or Owner Report run for the project)
- If no approved or released run exists yet, `value` = days since project registration (or a sentinel value indicating "no report issued")
- `threshold` = 30 days by default; configurable per project-governance policy
- `status`:
  - `'green'`: `value ≤ threshold`
  - `'yellow'`: `value > threshold` and `value ≤ threshold × 1.5`
  - `'red'`: `value > threshold × 1.5`

### 2.3 Metric Update Trigger

The health metric is recalculated when:
- Any PX Review or Owner Report run transitions to `approved` or `released`
- The health metric threshold is changed in project-governance policy
- On a scheduled sweep (daily recalculation for all active projects)

---

## 3. Work Queue Spine

### 3.1 Work Item Types

Reports generates Work Queue items for three conditions (P3-D3 §12):

```typescript
type ReportsWorkItemType =
  | 'report-draft-stale'
  | 'report-approval-pending'
  | 'report-distribution-pending';
```

### 3.2 Work Item Contract

```typescript
interface IReportsWorkQueueItem {
  workItemId: string;           // UUID
  itemType: ReportsWorkItemType;
  projectId: string;
  familyKey: string;
  runId: string | null;         // FK to IReportRunRecord; null for draft-stale items (no run yet)
  ownerUPN: string;             // PM for draft-stale; PE for approval-pending; PM/distributor for distribution-pending
  dueDate: string | null;       // ISO 8601 suggested due date
  createdAt: string;            // ISO 8601
  priority: 'normal' | 'high';
  resolvedAt: string | null;
  resolutionNote: string | null;
}
```

### 3.3 Work Item Rules

| Work Item Type | Trigger | Owner | Priority | Resolves When |
|----------------|---------|-------|----------|---------------|
| `report-draft-stale` | Draft `lastRefreshedAt` exceeds staleness threshold | PM | `'normal'` (escalates to `'high'` at 2×) | PM refreshes draft |
| `report-approval-pending` | PX Review transitions to `generated` status | PE | `'high'` | PE approves run (transitions to `approved`) |
| `report-distribution-pending` | Any report family transitions to `released` (if family policy generates this item) | PM or designated distributor | `'high'` | Distribution confirmed |

### 3.4 Work Item Deduplication

- At most one `report-draft-stale` item per project-family at a time. Refresh resolves the existing item; a new item is created if staleness recurs.
- At most one `report-approval-pending` item per run. Resolved on approval.
- At most one `report-distribution-pending` item per run. Resolved on distribution confirmation.

---

## 4. Related Items Spine

### 4.1 Relationships Published

Reports registers the following relationships in the Related Items spine (P3-D4 §9):

```typescript
interface IReportsRelatedItem {
  fromId: string;               // runId
  fromType: 'report-run';
  toId: string;                 // snapshotId
  toType: 'module-snapshot';
  relationshipType: 'references';
  projectId: string;
  description: string;          // "Report run references module snapshots consumed at generation time"
  registeredAt: string;         // ISO 8601
}
```

### 4.2 Relationship Semantics

For every generation run that completes successfully:
- One `IReportsRelatedItem` record is registered per `ISnapshotRef` in the run's `snapshotRefs` array.
- These relationships trace the artifact provenance: which run consumed which snapshots from which source modules.
- Relationships are immutable (snapshot refs are frozen on the run record).

This enables:
- Tracing from a report artifact back to the source module snapshots it was generated from.
- Understanding cross-module data dependencies for any given report run.
- Auditing what data was current at the time of a specific report generation.

### 4.3 Additional Relationship: Run → Internal Review Chain

For PX Review runs with an active internal review chain:
```typescript
// Additional related item
fromId: runId
fromType: 'report-run'
toId: chainId
toType: 'internal-review-chain'
relationshipType: 'governed-by'
```

---

## 5. Spine Publication Summary

| Spine | Contract | Events/Items Published |
|-------|---------|----------------------|
| Activity (P3-D1) | `IReportsActivityEvent` | 4 event types: draft-refreshed, approved, released, stale-warning |
| Health (P3-D2) | `IReportCurrencyHealthMetric` | 1 metric: report-currency (Office dimension) |
| Work Queue (P3-D3) | `IReportsWorkQueueItem` | 3 item types: draft-stale, approval-pending, distribution-pending |
| Related Items (P3-D4) | `IReportsRelatedItem` | Per-run snapshot provenance relationships |

---

## 6. Spine Event Timing and Ordering

### 6.1 Event Sequence for a Complete PX Review Lifecycle

```
1. PM refreshes draft → reports.draft-refreshed (routine)
2. PM confirms and queues run → no event (internal state change)
3. Run transitions to generated → no event (internal; UI update via run status)
4. Staleness warning (if draft stales while run is pending) → reports.stale-warning (notable)
5. Work Queue: report-approval-pending item created (when run reaches 'generated')
6. PE approves → reports.approved (notable) + Work Queue item resolves
7. Run transitions to released → reports.released (notable)
8. Work Queue: report-distribution-pending item created (if policy requires it)
9. Distribution confirmed → Work Queue item resolves
```

### 6.2 Failure Events

If generation fails (`status = 'failed'`):
- No Activity event is emitted for the failure itself (failure is surfaced in the run-ledger UI).
- The `report-approval-pending` Work Queue item is NOT created for a failed run.
- PM is expected to initiate a new run after resolving the failure reason.

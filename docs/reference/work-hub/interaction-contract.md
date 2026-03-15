# Work Hub Interaction Contract

**Purpose:** Define the data and interaction rules for Personal Work Hub items — ownership, due-state, stale-state, sync, mutation vs navigation, and audit expectations.
**Date:** 2026-03-15
**Governing primitive:** `@hbc/my-work-feed` (SF29, ADR-0115)

---

## 1. Ownership Identity

Every work item has an `owner: IMyWorkOwner` with a type discriminant:

| Owner Type | When Used | Example |
|-----------|-----------|---------|
| `user` | Specific person owns the item | Controller reviewing a request |
| `role` | A role-class owns the item (any holder can act) | "Admin" role owns a failed provisioning run |
| `company` | Company-level ownership | Organizational escalation |
| `system` | System-owned (no human owner) | Provisioning saga in progress |

### Rules

- **System-owned items do NOT create personal work items.** When a provisioning request is in `ReadyToProvision` or `Provisioning` state, no human owns it and no feed item is created.
- **Ownership changes create new items.** When BIC ownership transfers (e.g., Controller → Requester for clarification), a new item appears for the new owner. The old owner's item is marked `superseded`.
- **`previousOwner`** is available for handoff context — the new owner can see who sent the work.
- **`delegatedBy` / `delegatedTo`** support manager/team delegation views without creating a separate item type.

---

## 2. Due-State Treatment

### Due date model

- `dueAtIso`: optional ISO timestamp. Not all items have due dates.
- When present, due dates drive urgency scoring. When absent, urgency comes from BIC tier and recency only.

### Scoring impact

| Condition | Score Contribution | Notes |
|-----------|-------------------|-------|
| Overdue | +1000 + min(daysOverdue × 10, 500) | Always surfaces first; scales with severity |
| Approaching due | +500 − (daysToDue × 20), min 0 | Gradual escalation as due date nears |
| No due date | +0 | Urgency from BIC tier + recency only |

### Advisory vs hard due dates

- **Advisory due dates** (e.g., NeedsClarification 3-day window) drive urgency without hard enforcement. The item escalates in ranking but is not auto-expired.
- **Hard due dates** are not used in Wave 0. Wave 1 may introduce hard deadlines for specific workflows.

---

## 3. Stale-State Labeling

Per Unified Blueprint §7.2 (locked Interview Decision 8): "Users must never be misled into thinking they are seeing live data when they are not."

### Feed-level freshness

| Field | Purpose |
|-------|---------|
| `lastRefreshedIso` | When the feed was last computed |
| `isStale` | True when data age exceeds freshness threshold |
| `healthState` | Per-source freshness tracking |

### Per-source freshness

| Source Status | Meaning |
|-------------|---------|
| `live` | Data fetched successfully within freshness window |
| `cached` | Data served from cache; source unreachable |
| `partial` | Some sources loaded, others failed |
| `queued` | Offline; mutations queued for replay |

### Display requirement

When any source is not `live`, the feed surface must display a sync-state indicator (e.g., "Last synced 5 minutes ago" or "Some data may be stale").

---

## 4. Source-of-Truth Links

- Every item carries `context.href` — a deep link to the authoritative source surface.
- The "Open" action navigates to the source. **The Work Hub is NOT the source of truth for domain data.**
- Domain mutations (approve a request, retry provisioning, update a score) happen at the source surface, not in the feed.
- The feed refreshes after navigation-return to reflect source mutations.

---

## 5. Mutation vs Navigation Actions

### Action types

| Action Type | Modifies Feed State | Navigates | Examples |
|------------|-------------------|-----------|---------|
| **Navigation** | No | Yes | `open`, `view` |
| **Feed mutation** | Yes | No | `mark-read`, `defer`, `undefer`, `acknowledge`, `reject`, `dismiss` |
| **Domain mutation** | Indirectly (via source refresh) | Yes | Approve request, retry provisioning |

### Rules

- **Navigation actions** are always available when `canOpen: true`.
- **Feed mutations** modify the item's state within the feed (e.g., marking read, deferring). They do NOT modify the source domain data.
- **Domain mutations** are NOT feed actions. They happen at the source surface. The feed reflects their results on next refresh.

### Offline-capable mutations

Items with `offlineCapable: true` support mutation queueing via `@hbc/session-state`:

| Replayable Action | Effect |
|------------------|--------|
| `mark-read` | Sets `isUnread: false` |
| `defer` | Sets state to `deferred`, moves to `deferred` lane |
| `undefer` | Restores state to `active`, returns to original lane |
| `pin-today` | Elevates priority to `now` for the current day |
| `pin-week` | Elevates priority to `soon` for the current week |
| `waiting-on` | Sets state to `waiting` with dependency label |

Optimistic updates are applied immediately. Reconciliation occurs on sync completion.

---

## 6. Audit / History Expectations

### Per-item explainability

| Field | What It Explains |
|-------|-----------------|
| `rankingReason: IMyWorkRankingReason` | Why the item is ranked where it is — primary reason + contributing factors + numeric score |
| `lifecycle: IMyWorkLifecyclePreview` | Previous/current/next step labels + blocked dependency label |
| `dedupe: IMyWorkDedupeMetadata` | Merge history — which sources were merged and why |
| `supersession: IMyWorkSupersessionMetadata` | Superseded-by reference and original ranking |
| `permissionState: IMyWorkPermissionState` | Why the user can or cannot act on the item |

### Feed-level telemetry

The aggregation pipeline emits telemetry events for:
- Aggregation duration and degraded source count
- Deduplication events (items merged, reasons)
- Supersession events (items superseded, reasons)
- Health state transitions

---

## Related Documents

- [Work Hub Runway Definition](./runway-definition.md)
- [Work Hub Publication Model](./publication-model.md)
- [Leadership Visibility Model](./leadership-visibility-model.md)
- [ADR-0115 — My Work Feed Architecture](../../architecture/adr/ADR-0115-my-work-feed-architecture.md)

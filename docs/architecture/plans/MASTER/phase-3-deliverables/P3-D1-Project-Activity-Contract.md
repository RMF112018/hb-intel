# P3-D1: Project Activity Contract

| Field | Value |
|---|---|
| **Doc ID** | P3-D1 |
| **Phase** | Phase 3 |
| **Workstream** | D — Shared project spines |
| **Document Type** | Contract |
| **Owner** | Platform / Core Services + Project Hub platform owner |
| **Update Authority** | Architecture lead; changes require review by Platform lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §8.3](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A3 §3](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-C2 §6](P3-C2-Mandatory-Core-Tile-Family-Definition.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [`@hbc/related-items` activityTimelineAdapter](../../../../packages/related-items/src/reference/activityTimelineAdapter.ts); [`@hbc/notification-intelligence` types](../../../../packages/notification-intelligence/src/types/INotification.ts) |

---

## Contract Statement

This contract is the full implementation specification for the **Activity spine** — the cross-module normalized project activity stream that Phase 3 Project Hub consumes for home/canvas activity tiles, project activity views, reporting inputs, and cross-project continuity.

Phase 3 uses a **hybrid activity spine** (Phase 3 plan §8.3):

- Modules **publish** normalized project activity events into a central contract.
- Project Hub **consumes** this central activity stream for canvas tiles, activity views, and reporting.
- Module-specific enrichment is fetched **on demand** — the spine carries normalized summaries, not full record payloads.

P3-A3 §3 defined the publication-level contract (event type shape, registry pattern, query contract). This deliverable expands that into the complete specification: event lifecycle, storage model, consumption patterns, rendering expectations, cross-spine integration, module emission expectations, and reporting integration.

**Repo-truth audit — 2026-03-21.** No canonical activity spine implementation exists. The only related artifact is `IGovernanceTimelineEvent` in `@hbc/related-items/src/reference/activityTimelineAdapter.ts` — a no-op placeholder with `emitGovernanceEvent()` that logs to console in dev mode. `INotificationEvent` in `@hbc/notification-intelligence` carries structurally similar metadata (event type, source module/record, timestamp) but serves user notification, not project activity audit. `HbcStatusTimeline` and `HbcAuditTrailPanel` exist in `@hbc/ui-kit` as rendering primitives but lack a canonical activity data contract. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The complete activity event lifecycle (creation, publication, consumption, archival)
- The canonical `IProjectActivityEvent` type (expanded from P3-A3 §3.1)
- The `ProjectActivityRegistry` pattern and `IActivitySourceAdapter` interface
- The `IActivityQuery` and `IActivityFeedResult` contracts
- Storage and retention model
- Cross-spine integration rules (Activity ↔ Health, Notifications, Related Items)
- Per-module emission expectations (what events, significance, frequency)
- Rendering contract for activity consumers
- Reporting integration (activity as report input)
- Cross-lane activity consistency

### This contract does NOT govern

- The publication-level contract definition (already locked in [P3-A3 §3](P3-A3-Shared-Spine-Publication-Contract-Set.md))
- Activity tile UI design — see [P3-C2 §6](P3-C2-Mandatory-Core-Tile-Family-Definition.md) for mandatory tile spec
- Other spine specifications — see P3-D2 (Health), P3-D3 (Work Queue), P3-D4 (Related Items)
- Module-internal audit logging — each module may maintain internal logs independently

---

## Definitions

| Term | Meaning |
|---|---|
| **Activity event** | A normalized record of a meaningful change within a project, published into the Activity spine |
| **Event lifecycle** | The stages an activity event passes through: creation → publication → consumption → archival |
| **Event emitter** | The module-owned code that creates and publishes an activity event |
| **Event consumer** | A surface that reads and renders activity events (canvas tile, activity page, report) |
| **Event enrichment** | Additional detail fetched on demand from the source module when a user expands or drills into an event |
| **Significance level** | Classification of an event's importance: `routine`, `notable`, or `critical` |
| **Event namespace** | The `module.action` naming convention for event types |
| **Activity feed** | A paginated, project-scoped stream of activity events |
| **Retention window** | The time period for which activity events are stored and queryable |

---

## 1. Current-State Reconciliation

| Artifact | Location | Status | Relevance |
|---|---|---|---|
| `IGovernanceTimelineEvent` | `packages/related-items/src/reference/activityTimelineAdapter.ts` | **Live** — no-op placeholder | Forward-looking type with `eventType`, `sourceRecordType`, `changedBy`, `timestamp`; designed to anticipate activity integration |
| `emitGovernanceEvent()` | Same file | **Live** — console.info in dev mode only | Emission seam exists but produces no persistent records |
| `INotificationEvent` | `packages/notification-intelligence/src/types/INotification.ts` | **Live** — mature | Carries `eventType`, `sourceModule`, `sourceRecordType`, `sourceRecordId`, `createdAt`; serves user notification, not project activity |
| `HbcStatusTimeline` | `@hbc/ui-kit` | **Live** | Rendering primitive for timeline display; no data contract |
| `HbcAuditTrailPanel` | `@hbc/ui-kit` | **Live** | Rendering primitive for audit display; no data contract |
| `IAuditRecord` | `packages/models/src/audit/` | **Live** | Write-operation audit records; scoped to auth/AI, not project activity |
| Activity spine contract | P3-A3 §3 | **Locked (plan)** | Publication-level type, registry, and query definitions |
| Activity tile | P3-C2 §6 | **Locked (plan)** | Mandatory core tile consuming `IActivityFeedResult` |

**Classification:** No canonical activity spine exists. All related artifacts are either placeholders, different-purpose systems, or rendering primitives without a data contract. This is a **gap requiring new implementation**.

---

## 2. Activity Event Lifecycle

### 2.1 Lifecycle stages

```
Creation → Publication → Storage → Consumption → Archival
```

| Stage | Actor | Action |
|---|---|---|
| **Creation** | Module event emitter | Module detects a meaningful change and creates an `IProjectActivityEvent` |
| **Publication** | Module adapter via `ProjectActivityRegistry` | Event is submitted to the Activity spine through the registered adapter |
| **Storage** | Activity spine service | Event is persisted to the activity store with indexing by `projectId`, `occurredAt`, `category`, `sourceModule` |
| **Consumption** | Canvas tile, activity page, reports | Consumers query the activity feed via `IActivityQuery` and render results |
| **Archival** | System process | Events beyond the retention window are archived or pruned per §6 |

### 2.2 Event immutability

Once published, activity events are **immutable**. They MUST NOT be modified or deleted by modules. If an event becomes irrelevant (e.g., the source record is deleted), the event remains in the feed with its original content. The source record's current state is resolved on demand via enrichment, not by mutating the event.

### 2.3 Event ordering

Events are ordered by `occurredAt` (when the change happened), not `publishedAt` (when the spine received the event). This ensures correct chronological display even when events are published with slight delays.

---

## 3. Canonical Event Type

The canonical `IProjectActivityEvent` type is defined in P3-A3 §3.1. This section expands the specification with implementation detail.

### 3.1 Field specification

| Field | Type | Required | Populated by | Description |
|---|---|---|---|---|
| `eventId` | `string` (UUID v4) | Yes | System | Unique event identifier; generated at creation time |
| `projectId` | `string` (UUID) | Yes | Emitter | Canonical project identity from P3-A1 registry |
| `eventType` | `string` | Yes | Emitter | Namespaced event type (e.g., `'financial.forecast-updated'`) |
| `category` | `ActivityCategory` | Yes | Emitter | One of 7 categories (see P3-A3 §3.2) |
| `sourceModule` | `string` | Yes | Emitter | Module key (e.g., `'financial'`, `'safety'`, `'constraints'`) |
| `sourceRecordType` | `string` | Yes | Emitter | Record type within the module |
| `sourceRecordId` | `string` | Yes | Emitter | Identifier of the affected record |
| `summary` | `string` | Yes | Emitter | Human-readable summary (max 280 characters) |
| `detail` | `Record<string, unknown> \| null` | No | Emitter | Structured detail payload; module-specific, schema-governed |
| `changedByUpn` | `string` | Yes | Emitter | UPN of the user who triggered the event |
| `changedByName` | `string` | Yes | Emitter | Display name of the user |
| `occurredAt` | `string` (ISO 8601) | Yes | Emitter | When the change occurred |
| `publishedAt` | `string` (ISO 8601) | Yes | System | When the spine received the event |
| `significance` | `ActivitySignificance` | Yes | Emitter | `'routine'`, `'notable'`, or `'critical'` |
| `href` | `string \| null` | No | Emitter | Deep-link to the source record |
| `relatedEventIds` | `string[]` | No | Emitter | Links to related events (e.g., approval chain) |

### 3.2 Summary field rules

- Maximum 280 characters
- Must be self-contained — readable without context expansion
- Must describe WHAT changed, not just that something changed
- Good: `"Constraint C-042 (Owner Design Review) closed — 12-day delay quantified"`
- Bad: `"Record updated"`

### 3.3 Detail payload governance

The `detail` field carries structured data specific to the event type. Each module MUST document its detail schema per event type. The schema is governed by convention:

| Event type | Expected detail fields |
|---|---|
| `financial.forecast-updated` | `previousValue`, `newValue`, `forecastPeriod`, `changeReason` |
| `constraints.created` | `constraintNumber`, `category`, `dueDate`, `responsibility` |
| `constraints.closed` | `constraintNumber`, `delayDays`, `resolution` |
| `safety.incident-reported` | `incidentType`, `location`, `severity` |
| `reports.approved` | `reportFamily`, `reportRunId`, `approvedByName` |
| `schedule.milestone-completed` | `milestoneName`, `completedDate`, `originalDate`, `varianceDays` |

Consumers MUST handle `detail: null` gracefully. The detail payload is supplementary, not required for core rendering.

---

## 4. Activity Registry Contract

### 4.1 Registry pattern

The `ProjectActivityRegistry` follows the established cross-spine registry pattern (P3-A3 §2.1):

| Property | Value |
|---|---|
| Pattern | Module singleton |
| Registration timing | App initialization only |
| Late registration | Not supported |
| Unregistration | Not supported |
| Validation | On register — rejects duplicate module keys |

### 4.2 Registration entry

Each module registers an `IActivitySourceRegistration`:

| Field | Type | Description |
|---|---|---|
| `moduleKey` | `string` | Unique module identifier (e.g., `'financial'`, `'safety'`) |
| `supportedEventTypes` | `string[]` | Namespaced event types this module can emit |
| `adapter` | `IActivitySourceAdapter` | Adapter implementation |
| `enabledByDefault` | `boolean` | Whether this source is active by default |
| `significanceDefaults` | `Record<string, ActivitySignificance>` | Default significance per event type |

### 4.3 Adapter interface

Each `IActivitySourceAdapter` MUST implement:

| Method | Signature | Description |
|---|---|---|
| `isEnabled` | `(context: IActivityRuntimeContext) => boolean` | Whether this source is active in the current context |
| `loadRecentActivity` | `(query: IActivityQuery) => Promise<IProjectActivityEvent[]>` | Fetch recent events matching the query |
| `getEventTypeMetadata` | `(eventType: string) => IActivityEventTypeMetadata` | Return display metadata for an event type |

### 4.4 Event type metadata

`IActivityEventTypeMetadata` provides rendering hints:

| Field | Type | Description |
|---|---|---|
| `eventType` | `string` | The namespaced event type |
| `label` | `string` | Human-readable label (e.g., `"Forecast Updated"`) |
| `icon` | `string` | Icon identifier for timeline rendering |
| `defaultSignificance` | `ActivitySignificance` | Default significance level |
| `moduleLabel` | `string` | Display name of the source module |

---

## 5. Activity Query and Feed Contract

### 5.1 Query contract

`IActivityQuery` (expanded from P3-A3 §3.5):

| Field | Type | Required | Description |
|---|---|---|---|
| `projectId` | `string` | **Yes** | Always project-scoped |
| `moduleKeys` | `string[]` | No | Filter to specific modules |
| `categories` | `ActivityCategory[]` | No | Filter by category |
| `significance` | `ActivitySignificance[]` | No | Filter by significance level |
| `eventTypes` | `string[]` | No | Filter by specific event types |
| `since` | `string` (ISO 8601) | No | Earliest event timestamp |
| `until` | `string` (ISO 8601) | No | Latest event timestamp |
| `changedByUpn` | `string` | No | Filter by actor |
| `limit` | `number` | No | Page size (default: 25, max: 100) |
| `cursor` | `string` | No | Pagination cursor |

### 5.2 Feed result contract

`IActivityFeedResult`:

| Field | Type | Description |
|---|---|---|
| `events` | `IProjectActivityEvent[]` | Page of events ordered by `occurredAt` descending |
| `totalCount` | `number` | Total matching events (for count displays) |
| `criticalCount` | `number` | Count of critical-significance events |
| `notableCount` | `number` | Count of notable-significance events |
| `hasMore` | `boolean` | Whether additional pages exist |
| `nextCursor` | `string \| null` | Cursor for next page |
| `lastRefreshedIso` | `string` | When the feed was last refreshed |

### 5.3 Query rules

- `projectId` is always required — there is no cross-project activity query at the spine level.
- Default ordering is `occurredAt` descending (most recent first).
- Pagination uses cursor-based pagination, not offset-based.
- Count fields (`totalCount`, `criticalCount`, `notableCount`) are computed from the full filtered result set, not just the current page.

---

## 6. Storage and Retention Model

### 6.1 Storage requirements

| Requirement | Value |
|---|---|
| Primary index | `projectId` + `occurredAt` (descending) |
| Secondary indexes | `sourceModule`, `category`, `significance`, `changedByUpn` |
| Event immutability | Events MUST NOT be modified after publication |
| Deduplication | `eventId` (UUID) ensures uniqueness |

### 6.2 Retention policy

| Retention tier | Window | Purpose |
|---|---|---|
| **Active** | 90 days | Full queryability for canvas tiles, activity pages, and real-time feeds |
| **Archive** | 1 year | Queryable for reporting inputs and historical review; may have reduced query performance |
| **Purge** | Beyond 1 year | Events may be purged unless reporting or compliance requires longer retention |

### 6.3 Retention rules

- Retention windows are measured from `occurredAt`, not `publishedAt`.
- `critical` significance events SHOULD be retained longer than `routine` events where storage constraints require selective retention.
- Purge operations MUST NOT affect events referenced by active report runs.

---

## 7. Cross-Spine Integration Rules

### 7.1 Activity ↔ Health

| Direction | Rule |
|---|---|
| Health → Activity | Health status changes (`health.status-changed`) are published as activity events by the Health spine |
| Health → Activity | Compound risk detection (`health.compound-risk-detected`) is published as a `critical` significance activity event |
| Health → Activity | Recommended actions (`health.action-recommended`) are published as `notable` significance events |
| Activity → Health | Activity event volume and recency contribute to the Office health dimension via the health metric contribution (P3-A3 §4.1) |

### 7.2 Activity ↔ Notifications

| Direction | Rule |
|---|---|
| Notifications → Activity | Notification events that represent meaningful project changes MAY also be published as activity events |
| Activity → Notifications | `critical` significance activity events MAY trigger notification-intelligence signals for relevant recipients |
| Boundary | Activity and notifications are separate systems. Activity is project-scoped audit; notifications are user-scoped alerting. Not every notification is an activity event; not every activity event triggers a notification |

### 7.3 Activity ↔ Related Items

| Direction | Rule |
|---|---|
| Related Items → Activity | Relationship creation/removal events are published as activity events via the existing `IGovernanceTimelineEvent` emission seam |
| Activity → Related Items | Activity events MAY link to related records via `sourceRecordId` for navigation |
| Upgrade path | Phase 3 must upgrade `emitGovernanceEvent()` from a no-op placeholder to a real publication into the Activity spine |

---

## 8. Module Emission Expectations

Each always-on core module MUST register an activity adapter and emit events for the following:

### 8.1 Financial

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `financial.budget-imported` | `record-change` | `notable` | Budget CSV imported |
| `financial.forecast-updated` | `record-change` | `routine` | Any forecast field updated |
| `financial.exposure-flagged` | `alert` | `critical` | Exposure threshold exceeded |
| `financial.checklist-completed` | `milestone` | `notable` | Forecast checklist fully completed |

### 8.2 Schedule

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `schedule.file-uploaded` | `record-change` | `notable` | Schedule file (XER/XML/CSV) ingested |
| `schedule.milestone-completed` | `milestone` | `notable` | Milestone marked complete |
| `schedule.milestone-at-risk` | `alert` | `critical` | Milestone flagged at risk |
| `schedule.forecast-overridden` | `record-change` | `routine` | Manual forecast override applied |

### 8.3 Constraints

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `constraints.created` | `record-change` | `routine` | New constraint created |
| `constraints.closed` | `status-change` | `notable` | Constraint closed |
| `constraints.delay-quantified` | `record-change` | `notable` | Delay impact quantified |
| `constraints.overdue` | `alert` | `critical` | Constraint past due date |

### 8.4 Permits

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `permits.status-changed` | `status-change` | `routine` | Permit status changed |
| `permits.inspection-recorded` | `record-change` | `routine` | Inspection result recorded |
| `permits.expiration-warning` | `alert` | `notable` | Permit nearing expiration |

### 8.5 Safety

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `safety.incident-reported` | `alert` | `critical` | Safety incident reported |
| `safety.checklist-completed` | `milestone` | `routine` | Safety checklist completed |
| `safety.orientation-recorded` | `record-change` | `routine` | Subcontractor orientation completed |
| `safety.jha-created` | `record-change` | `routine` | JHA log record created |

### 8.6 Reports

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `reports.draft-refreshed` | `record-change` | `routine` | Report draft refreshed with live data |
| `reports.approved` | `approval` | `notable` | PX Review approved |
| `reports.released` | `handoff` | `notable` | Report released for distribution |
| `reports.stale-warning` | `alert` | `notable` | Report draft is stale |

### 8.7 Health (spine self-reporting)

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `health.status-changed` | `status-change` | `notable` | Overall health status changed |
| `health.compound-risk-detected` | `alert` | `critical` | Compound risk signal detected |
| `health.action-recommended` | `record-change` | `notable` | New recommended action generated |

---

## 9. Rendering Contract

### 9.1 Mandatory rendering elements

Activity consumers (canvas tile, activity page, timeline views) MUST render the following for each event:

| Element | Source | Required |
|---|---|---|
| Module icon | `IActivityEventTypeMetadata.icon` | Yes |
| Event summary | `IProjectActivityEvent.summary` | Yes |
| Actor name | `changedByName` | Yes |
| Timestamp | `occurredAt` (relative or absolute based on recency) | Yes |
| Significance badge | `significance` | Yes (visual differentiation) |
| Module attribution | `IActivityEventTypeMetadata.moduleLabel` | Yes |
| Deep-link | `href` (when non-null) | Yes (clickable navigation) |

### 9.2 Significance rendering

| Significance | Visual treatment |
|---|---|
| `critical` | Highlighted with emphasis (e.g., red/orange indicator, bold text) |
| `notable` | Prominent but not alarming (e.g., accent color, standard weight) |
| `routine` | Standard timeline entry; may be collapsed in summary views |

### 9.3 Freshness cues

Activity surfaces MUST show `lastRefreshedIso` as a freshness indicator. If the feed is stale (no refresh within a governed threshold), the surface MUST show a stale-state cue consistent with the freshness/staleness trust vocabulary (P2-B3).

---

## 10. Reporting Integration

### 10.1 Activity as report input

The Activity spine MUST support consumption by the governed reporting system (Phase 3 plan §8.7):

- PX Review and Owner Report MAY include a project activity summary section.
- Report generation queries the Activity spine with `projectId` + date range filters.
- The report captures a **snapshot** of activity at generation time — it is not a live feed.

### 10.2 Report-safe query

Reports consume activity via the same `IActivityQuery` contract but with explicit `since`/`until` parameters bounding the reporting period. The `cursor`-based pagination is used for complete enumeration of the reporting window.

---

## 11. Cross-Lane Activity Consistency

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same activity data source.** Both lanes query the same Activity spine.
2. **Same event semantics.** Event types, categories, and significance levels have the same meaning.
3. **Same project filtering.** Given the same `projectId`, both lanes produce the same activity feed.
4. **Same count semantics.** `totalCount`, `criticalCount`, and `notableCount` are identical.
5. **Same mandatory tile rendering.** The `project-activity` mandatory tile (P3-C2 §6) shows the same data in both lanes.
6. **Lane-specific depth.** The PWA MAY offer richer activity filtering, searching, and export capabilities; SPFx provides the standard activity timeline.

---

## 12. Repo-Truth Reconciliation Notes

1. **`IGovernanceTimelineEvent` — compliant placeholder, requires upgrade**
   The existing type in `@hbc/related-items` has fields (`eventType`, `sourceRecordType`, `changedBy`, `timestamp`) that align with the canonical `IProjectActivityEvent` structure. The `emitGovernanceEvent()` function is a no-op in production. Phase 3 must upgrade this to emit real events into the Activity spine. The existing type may serve as a compatibility adapter. Classified as **compliant — upgrade required**.

2. **`INotificationEvent` — separate concern, no conflict**
   Notification events serve user-scoped alerting. Activity events serve project-scoped audit. They share structural similarity but different purposes. Some notification events may also be published as activity events per §7.2, but they are not the same system. Classified as **compliant — no overlap**.

3. **`HbcStatusTimeline` and `HbcAuditTrailPanel` — available rendering primitives**
   These `@hbc/ui-kit` components provide timeline and audit trail rendering. The Activity tile and activity page MAY compose these primitives. Classified as **compliant — reusable**.

4. **No `ProjectActivityRegistry` exists — gap, new implementation required**
   Phase 3 must implement the registry following the module-singleton pattern established by `MyWorkRegistry`, `RelationshipRegistry`, and `TileRegistry`. Classified as **gap**.

5. **No activity storage backend exists — gap, new implementation required**
   Phase 3 must implement activity event storage. The storage model (§6) defines the contract; backend implementation (Azure Table Storage, Cosmos DB, or equivalent) is an implementation decision. Classified as **gap**.

6. **No module activity adapters exist — controlled evolution**
   No always-on core module has registered activity adapters. Module adapter registration is Phase 3 implementation-time work governed by §8. Classified as **controlled evolution**.

---

## 13. Acceptance Gate Reference

**Gate:** Shared spine gates — activity component (Phase 3 plan §18.4)

| Field | Value |
|---|---|
| **Pass condition** | Activity spine is fed by normalized module publications; canvas tile, activity views, and reports consume the activity feed coherently |
| **Evidence required** | P3-D1 (this document), `ProjectActivityRegistry` implementation, module adapter registrations, activity storage with retention, canvas tile rendering, cross-lane consistency tests |
| **Primary owner** | Platform / Core Services + Project Hub platform owner |

---

## 14. Policy Precedence

This contract establishes the **Activity spine implementation specification** that downstream work must conform to:

| Deliverable | Relationship to P3-D1 |
|---|---|
| **P3-A3 §3** — Activity Spine Publication Contract | Provides the publication-level definitions (event type, registry pattern, query) that this contract expands |
| **P3-C2 §6** — Project Activity Tile | Must consume `IActivityFeedResult` per the rendering contract in §9 |
| **P3-A1** — Project Registry | Provides `projectId` used in all activity queries |
| **P3-A2** — Membership / Role Authority | Determines who can see activity events per module visibility rules |
| **P3-E1** — Module Classification Matrix | Module activity emission expectations in §8 must align with module classifications |
| **P3-F1** — Reports Contract | Must consume activity via the reporting integration in §10 |
| **P3-H1** — Acceptance Checklist | Must include activity spine gate evidence |
| **Any module implementation** | Must register activity adapter and emit events per §8 expectations |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §8.3](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)

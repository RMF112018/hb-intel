# P3-D3: Project Work Queue Contract

| Field | Value |
|---|---|
| **Doc ID** | P3-D3 |
| **Phase** | Phase 3 |
| **Workstream** | D — Shared project spines |
| **Document Type** | Contract |
| **Owner** | Platform / Core Services + Project Hub platform owner |
| **Update Authority** | Architecture lead; changes require review by Platform lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §8.6, §9.4](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A3 §5](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-C2 §4](P3-C2-Mandatory-Core-Tile-Family-Definition.md); [ADR-0115](../../../adr/ADR-0115-my-work-feed-architecture.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [P3-D1](P3-D1-Project-Activity-Contract.md); [P3-D2](P3-D2-Project-Health-Contract.md); [`@hbc/my-work-feed`](../../../../../packages/my-work-feed/src/index.ts) |

---

## Contract Statement

This contract is the full implementation specification for the **Work Queue spine** — the cross-module normalized personal work-item aggregation system that Phase 3 Project Hub consumes for home/canvas work queue tiles, next-action surfaces, badge counts, panel views, full feed, team/delegation projections, and reporting inputs.

Phase 3 uses a **hybrid work spine** (Phase 3 plan §8.6):

- A central normalized work contract owns:
  - queue item shape
  - priority/scoring
  - project filtering
  - visibility rules
  - queue count/badge semantics
- Modules retain authority over:
  - item origin
  - business rules
  - completion/update semantics
  - deeper module workflows

P3-A3 §5 defined the publication-level contract (module adapter registration expectations, project-scoped rules, lifecycle authority). This deliverable expands that into the complete specification: work item lifecycle, canonical type system, registry pattern, adapter interface, normalization pipeline (ranking, deduplication, supersession, lane assignment), query/feed contracts, project-scoped filtering, next-action semantics, count/badge consistency, offline strategy, team/delegation projections, action model, module adapter expectations, rendering contract, cross-spine integration, cross-lane consistency, and telemetry.

**Repo-truth audit — 2026-03-21.** The Work Queue spine is **fully implemented** in `@hbc/my-work-feed` (v0.0.1) per SF29 and ADR-0115 (locked 2026-03-15). All canonical types (`IMyWorkItem` with 57 fields, `IMyWorkQuery`, `IMyWorkFeedResult`, `IMyWorkTeamFeedResult`, `IMyWorkCounts`, plus 16 sub-interfaces and 7 union types), registry (`MyWorkRegistry` module singleton), 5 source adapters (BIC, handoff, notification, acknowledgment, draft/resume), normalization pipeline (`aggregateFeed`, `rankItems`, `dedupeItems`, `applySupersession`, lifecycle state machine, `projectFeedResult`), 7 hooks, 12 components, telemetry (`FeedTelemetry` pluggable sink), and testing exports are live and tested. P3-C2 §4 defines the `project-work-queue` mandatory tile — **not yet registered** (Phase 3 scope). This contract codifies existing mature implementation as governance. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The complete work item lifecycle and state machine
- The canonical type system: `IMyWorkItem`, `IMyWorkQuery`, `IMyWorkFeedResult`, `IMyWorkTeamFeedResult`, `IMyWorkCounts`, and all sub-interfaces and union types
- The `MyWorkRegistry` pattern and `IMyWorkSourceAdapter` interface
- The normalization pipeline (lane assignment, deduplication, supersession, ranking)
- The query and feed result contracts
- Project-scoped work queue filtering and count semantics
- Next-action and team/delegation semantics (Phase 3 plan §9.4)
- Count and badge consistency across surfaces (ADR-0115 D-07)
- The action model (replayable vs. deep-link, offline queueing)
- Offline strategy delegation to `@hbc/session-state` (ADR-0115 D-08)
- Module adapter registration expectations (expanded from P3-A3 §5.1)
- Rendering contract for work queue consumers
- Cross-spine integration rules (Work Queue ↔ Activity, Health, Notifications)
- Cross-lane consistency rules (PWA / SPFx)
- Feed telemetry contract

### This contract does NOT govern

- The publication-level contract definition (already locked in [P3-A3 §5](P3-A3-Shared-Spine-Publication-Contract-Set.md))
- Work Queue tile UI design — see [P3-C2 §4](P3-C2-Mandatory-Core-Tile-Family-Definition.md) for mandatory tile spec
- Other spine specifications — see P3-D1 (Activity), P3-D2 (Health), P3-D4 (Related Items)
- Module-internal workflow business rules, completion semantics, or deeper module workflows — module-owned per the hybrid model
- BIC next-move internal scoring or handoff internal workflow — adapter-owned

---

## Definitions

| Term | Meaning |
|---|---|
| **Work item** | A normalized record representing actionable or attention-worthy work for a user (`IMyWorkItem`) |
| **Lane** | A visual/logical grouping for work items: `do-now`, `waiting-blocked`, `watch`, `delegated-team`, `deferred` |
| **Priority** | Urgency classification: `now`, `soon`, `watch`, `deferred` |
| **State** | Lifecycle state: `new`, `active`, `blocked`, `waiting`, `deferred`, `superseded`, `completed` |
| **Class** | Item classification: `owned-action`, `inbound-handoff`, `pending-approval`, `attention-item`, `queued-follow-up`, `contextual-signal` |
| **Source** | The system that originated the work item: `bic-next-move`, `workflow-handoff`, `acknowledgment`, `notification-intelligence`, `session-state`, `module` |
| **Adapter** | A source-specific module that fetches and normalizes work items into the canonical `IMyWorkItem` shape |
| **Registry** | The `MyWorkRegistry` module singleton that holds all registered source adapters |
| **Deduplication** | The process of merging multiple items with the same `dedupeKey` into a single survivor with merged metadata |
| **Supersession** | The process of marking lower-truth source items as `superseded` when a higher-truth source reports the same record |
| **Ranking reason** | Structured explanation of why a work item has its current position in the feed |
| **Lifecycle preview** | Structured snapshot of previous/current/next workflow steps, blocked dependencies, and impacted records |
| **Queue health** | Diagnostic state for the feed: freshness, hidden superseded count, degraded source count, warning messages |
| **Team feed** | A projection over the same `IMyWorkItem` model showing delegation, aging, and escalation candidates (ADR-0115 D-10) |
| **Offline state** | Feed connectivity and sync state, with queued action tracking, delegated to `@hbc/session-state` |

---

## 1. Current-State Reconciliation

| Artifact | Location | Status | Relevance |
|---|---|---|---|
| `IMyWorkItem` and all work types | `packages/my-work-feed/src/types/` | **Live** — mature | Complete canonical type system: 57-field `IMyWorkItem`, 16 sub-interfaces, 7 union types |
| `MyWorkRegistry` | `packages/my-work-feed/src/registry/MyWorkRegistry.ts` | **Live** — mature | Module singleton with freeze-on-write, validation, duplicate rejection |
| BIC adapter | `packages/my-work-feed/src/adapters/bicAdapter.ts` | **Live** — mature | Weight 0.9; maps `IBicRegisteredItem[]` to work items |
| Handoff adapter | `packages/my-work-feed/src/adapters/handoffAdapter.ts` | **Live** — mature | Weight 0.8; maps `IHandoffPackage[]` to work items |
| Notification adapter | `packages/my-work-feed/src/adapters/notificationAdapter.ts` | **Live** — mature | Weight 0.5; maps `INotificationEvent[]` to work items |
| Acknowledgment adapter | `packages/my-work-feed/src/adapters/acknowledgmentAdapter.ts` | **Live** — disabled stub | `isEnabled: () => false`; no list-all API available |
| Draft/Resume adapter | `packages/my-work-feed/src/adapters/draftResumeAdapter.ts` | **Live** — mature | Weight 0.3; maps `IQueuedOperation[]` from session-state |
| Adapter mappers | `packages/my-work-feed/src/adapters/_mappers.ts` | **Live** — mature | `buildWorkItemId`, `buildCanonicalKey`, `buildDedupeKey`, `buildDefaultTimestamps`, `buildSourceMeta` |
| `aggregateFeed()` | `packages/my-work-feed/src/api/aggregateFeed.ts` | **Live** — mature | End-to-end aggregation pipeline |
| `rankItems()` | `packages/my-work-feed/src/normalization/rankItems.ts` | **Live** — mature | Deterministic additive scoring with tie-breaking |
| `dedupeItems()` | `packages/my-work-feed/src/normalization/dedupeItems.ts` | **Live** — mature | Group-by-dedupeKey survivor selection with permission merge |
| `applySupersession()` | `packages/my-work-feed/src/normalization/supersession.ts` | **Live** — mature | Record-identity supersession with same-source protection |
| Lifecycle state machine | `packages/my-work-feed/src/normalization/lifecycle.ts` | **Live** — mature | `MY_WORK_TRANSITION_GRAPH`, `assignLane`, `applyStateTransition` |
| `projectFeedResult()` | `packages/my-work-feed/src/normalization/projectFeed.ts` | **Live** — mature | Query filtering, lane assignment, count computation |
| Hooks | `packages/my-work-feed/src/hooks/` | **Live** — mature | 7 hooks: `useMyWork`, `useMyWorkCounts`, `useMyWorkPanel`, `useMyWorkActions`, `useMyWorkReasoning`, `useMyWorkTeamFeed`, `useMyWorkOfflineState` |
| `MyWorkProvider` / `useMyWorkContext` | `packages/my-work-feed/src/hooks/MyWorkContext.tsx` | **Live** — mature | Runtime context provider |
| Components | `packages/my-work-feed/src/components/` | **Live** — mature | 12 components with Storybook stories |
| `FeedTelemetry` | `packages/my-work-feed/src/telemetry/feedTelemetry.ts` | **Live** — mature | Pluggable sink pattern for dedupe, supersession, source-error, aggregation-complete events |
| Constants | `packages/my-work-feed/src/constants/myWorkDefaults.ts` | **Live** — mature | Source priority, replayable actions, sync statuses, query key prefix |
| Panel store | `packages/my-work-feed/src/store/MyWorkPanelStore.tsx` | **Live** — mature | Context-based panel open/close, grouping, expansion state |
| Testing exports | `packages/my-work-feed/testing/` | **Live** — mature | 10 factory/mock files for test consumers |
| ADR-0115 | `docs/architecture/adr/ADR-0115-my-work-feed-architecture.md` | **Accepted** | 10 governance decisions locking SF29 production behavior |
| P3-A3 §5 | Phase 3 deliverables | **Locked** (plan) | Publication-level module adapter expectations |
| P3-C2 §4 | Phase 3 deliverables | **Locked** (spec) | Mandatory `project-work-queue` tile — **not yet registered** |

**Classification:** All Work Queue spine artifacts are live and implemented at production maturity. The only gap is the `project-work-queue` canvas tile registration (P3-C2 §4.1), which is Phase 3 implementation-time work. Module-specific work-item adapters are controlled-evolution scope (§12).

---

## 2. Work Item Lifecycle

### 2.1 State machine

The work item lifecycle is governed by `MY_WORK_TRANSITION_GRAPH` in `lifecycle.ts`:

```
new → active
active → blocked, waiting, deferred, completed, superseded
blocked → active, completed, superseded
waiting → active, completed, superseded
deferred → active, completed, superseded
superseded → (terminal)
completed → (terminal)
```

### 2.2 Terminal states

`superseded` and `completed` are terminal — no further transitions are allowed. Items in terminal states are excluded from the active feed by default (`includeSuperseded: false`).

### 2.3 Active lane states

States `new`, `active`, `blocked`, and `waiting` are classified as active lane states. Items in these states are included in lane counts and badge numbers.

### 2.4 State transition rules

`applyStateTransition()` enforces the transition graph:
- Validates that the transition is allowed per `MY_WORK_TRANSITION_GRAPH`.
- Updates `timestamps.updatedAtIso` to the transition time.
- Adds `markedDeferredAtIso` when transitioning to `deferred`.
- Re-derives `lane` from the new state via `assignLane()`.
- Returns `IMyWorkTransitionResult` — either `{ ok: true, item }` or `{ ok: false, reason, message }`.

### 2.5 Lifecycle preview

Every work item carries an `IMyWorkLifecyclePreview` providing workflow context:

| Field | Type | Description |
|---|---|---|
| `previousStepLabel` | `string \| null` | Label of the previous workflow step |
| `currentStepLabel` | `string \| null` | Label of the current workflow step |
| `nextStepLabel` | `string \| null` | Label of the next expected workflow step |
| `blockedDependencyLabel` | `string \| null` | What is blocking this item |
| `impactedRecordLabel` | `string \| null` | What record is affected by this item |

---

## 3. Canonical Type System

All types are defined in `packages/my-work-feed/src/types/` and exported through the `@hbc/my-work-feed` public surface (ADR-0115 D-01).

### 3.1 Union types

| Type | Values |
|---|---|
| `MyWorkItemClass` | `'owned-action'`, `'inbound-handoff'`, `'pending-approval'`, `'attention-item'`, `'queued-follow-up'`, `'contextual-signal'` |
| `MyWorkPriority` | `'now'`, `'soon'`, `'watch'`, `'deferred'` |
| `MyWorkLane` | `'do-now'`, `'waiting-blocked'`, `'watch'`, `'delegated-team'` (provisional), `'deferred'` |
| `MyWorkState` | `'new'`, `'active'`, `'blocked'`, `'waiting'`, `'deferred'`, `'superseded'`, `'completed'` |
| `MyWorkOwnerType` | `'user'`, `'role'`, `'company'`, `'system'` |
| `MyWorkSource` | `'bic-next-move'`, `'workflow-handoff'`, `'acknowledgment'`, `'notification-intelligence'`, `'session-state'`, `'module'` |
| `MyWorkSyncStatus` | `'live'`, `'cached'`, `'partial'`, `'queued'` |

### 3.2 IMyWorkItem

The primary domain model with 57 fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `workItemId` | `string` | Yes | Unique item identifier (`'{source}::{sourceItemId}'`) |
| `canonicalKey` | `string` | Yes | Module-scoped identity (`'{moduleKey}::{recordId}'`) |
| `dedupeKey` | `string` | Yes | Deduplication key (`'{moduleKey}::{recordType}::{recordId}'`) |
| `class` | `MyWorkItemClass` | Yes | Item classification |
| `priority` | `MyWorkPriority` | Yes | Urgency classification |
| `state` | `MyWorkState` | Yes | Lifecycle state |
| `lane` | `MyWorkLane` | Yes | Visual lane assignment (derived) |
| `title` | `string` | Yes | Human-readable title |
| `summary` | `string` | Yes | Brief description |
| `expectedAction` | `string` | No | What the user should do |
| `dueDateIso` | `string \| null` | No | Due date (ISO 8601) |
| `isOverdue` | `boolean` | Yes | Whether the item is past due |
| `isUnread` | `boolean` | Yes | Whether the user has not yet seen this item |
| `isBlocked` | `boolean` | Yes | Whether the item is blocked |
| `blockedReason` | `string \| null` | No | Why the item is blocked |
| `changeSummary` | `string \| null` | No | What changed since last view |
| `whyThisMatters` | `string \| null` | No | Explainability text |
| `supersededByWorkItemId` | `string \| null` | No | ID of the superseding item |
| `owner` | `IMyWorkOwner` | Yes | Current item owner |
| `previousOwner` | `IMyWorkOwner \| null` | No | Previous owner (for handoffs) |
| `context` | `IMyWorkContext` | Yes | Module, project, record context |
| `sourceMeta` | `IMyWorkSourceMeta[]` | Yes | Source provenance (may contain multiple after dedup) |
| `permissionState` | `IMyWorkPermissionState` | Yes | Action permissions |
| `lifecycle` | `IMyWorkLifecyclePreview` | Yes | Workflow step preview |
| `rankingReason` | `IMyWorkRankingReason` | Yes | Why this item is ranked here |
| `attentionPolicy` | `IMyWorkAttentionPolicy` | No | Batching, escalation, suppression |
| `availableActions` | `IMyWorkActionDefinition[]` | Yes | Inline actions and deep-links |
| `offlineCapable` | `boolean` | Yes | Whether actions can be queued offline |
| `healthState` | `IMyWorkHealthState` | No | Item-level health/freshness |
| `delegatedBy` | `IMyWorkOwner \| null` | No | Who delegated this item |
| `delegatedTo` | `IMyWorkOwner \| null` | No | Who it was delegated to |
| `locationLabel` | `string \| null` | No | Project or area location label |
| `userNote` | `string \| null` | No | User-added note |
| `timestamps` | `IMyWorkTimestampState` | Yes | Created, updated, read, deferred timestamps |
| `dedupe` | `IMyWorkDedupeMetadata` | No | Deduplication merge metadata |
| `supersession` | `IMyWorkSupersessionMetadata` | No | Supersession metadata |

### 3.3 IMyWorkContext

| Field | Type | Required | Description |
|---|---|---|---|
| `moduleKey` | `string` | Yes | Source module identifier |
| `projectId` | `string` | No | Canonical project identity from P3-A1 registry |
| `projectCode` | `string` | No | Human-readable project code |
| `projectName` | `string` | No | Human-readable project name |
| `recordId` | `string` | No | Source record identifier |
| `recordType` | `string` | No | Source record type |
| `workflowStepKey` | `string` | No | Current workflow step |
| `versionId` | `string` | No | Record version identifier |
| `href` | `string` | No | Deep-link to source record |

### 3.4 IMyWorkPermissionState

| Field | Type | Description |
|---|---|---|
| `canOpen` | `boolean` | Whether the user can navigate to the source record |
| `canAct` | `boolean` | Whether the user can take inline action on this item |
| `canDelegate` | `boolean` | Whether the user can delegate this item |
| `canBulkAct` | `boolean` | Whether the item supports bulk operations |
| `cannotActReason` | `string \| null` | Explanation when `canAct` is false |

### 3.5 IMyWorkActionDefinition

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Action identifier |
| `label` | `string` | Human-readable action label |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | Visual treatment |
| `requiresConfirmation` | `boolean` | Whether a confirmation dialog is needed |
| `offlineCapable` | `boolean` | Whether the action can be queued offline |

### 3.6 IMyWorkQuery

| Field | Type | Required | Description |
|---|---|---|---|
| `projectId` | `string` | No | Filter to a specific project |
| `moduleKeys` | `string[]` | No | Filter to specific modules |
| `priorities` | `MyWorkPriority[]` | No | Filter by priority |
| `classes` | `MyWorkItemClass[]` | No | Filter by item class |
| `states` | `MyWorkState[]` | No | Filter by lifecycle state |
| `includeDeferred` | `boolean` | No | Include deferred items (default: false) |
| `includeSuperseded` | `boolean` | No | Include superseded items (default: false) |
| `lane` | `MyWorkLane` | No | Filter to a specific lane |
| `teamMode` | `'personal' \| 'delegated-by-me' \| 'my-team'` | No | Team/delegation projection mode |
| `locationLabel` | `string` | No | Filter by location label |
| `limit` | `number` | No | Maximum items to return |

### 3.7 IMyWorkFeedResult

| Field | Type | Description |
|---|---|---|
| `items` | `IMyWorkItem[]` | Ranked and filtered work items |
| `totalCount` | `number` | Total items matching the query |
| `unreadCount` | `number` | Unread items in the result set |
| `nowCount` | `number` | Items with priority `now` |
| `blockedCount` | `number` | Blocked or state `blocked` items |
| `waitingCount` | `number` | Items in state `waiting` |
| `deferredCount` | `number` | Items in state `deferred` |
| `teamCount` | `number` | Items with delegation relationships |
| `lastRefreshedIso` | `string` | When the feed was last refreshed |
| `isStale` | `boolean` | Whether feed freshness is `cached` or `partial` |
| `healthState` | `IMyWorkHealthState` | Feed-level health diagnostics |

### 3.8 IMyWorkTeamFeedResult

| Field | Type | Description |
|---|---|---|
| `items` | `IMyWorkItem[]` | Team-scoped work items (same canonical model, ADR-0115 D-10) |
| `totalCount` | `number` | Total team items |
| `agingCount` | `number` | Items aging beyond expected thresholds |
| `blockedCount` | `number` | Blocked team items |
| `escalationCandidateCount` | `number` | Items eligible for escalation |
| `lastRefreshedIso` | `string` | When the team feed was last refreshed |
| `healthState` | `IMyWorkHealthState` | Feed-level health diagnostics |

### 3.9 Additional sub-interfaces

| Interface | Purpose |
|---|---|
| `IMyWorkOwner` | Owner identity: `{ type, id, label }` |
| `IMyWorkSourceMeta` | Source provenance: `{ source, sourceEventType?, sourceUrgency?, sourceItemId, sourceUpdatedAtIso, explanation? }` |
| `IMyWorkRankingReason` | Explainability: `{ primaryReason, contributingReasons[], score? }` |
| `IMyWorkAttentionPolicy` | Batching and escalation: `{ batchGroupKey?, escalationAtIso?, suppressedDuplicateCount?, quietHoursDeferred? }` |
| `IMyWorkHealthState` | Item/feed health: `{ freshness, hiddenSupersededCount?, degradedSourceCount?, warningMessage? }` |
| `IMyWorkTimestampState` | Timestamps: `{ createdAtIso, updatedAtIso, markedReadAtIso?, markedDeferredAtIso?, deferredUntilIso? }` |
| `IMyWorkDedupeMetadata` | Merge provenance: `{ dedupeKey, mergedSourceMeta[], mergeReason }` |
| `IMyWorkSupersessionMetadata` | Supersession provenance: `{ supersededByWorkItemId, supersessionReason, originalRankingReason }` |
| `IMyWorkRuntimeContext` | Runtime context: `{ currentUserId, roleKeys[], projectIds[]?, isOffline, complexityTier }` |
| `IMyWorkRegistryEntry` | Registry entry: `{ source, adapter, enabledByDefault?, rankingWeight? }` |
| `IMyWorkCommandResult` | Action result: `{ success, message?, affectedWorkItemIds[]? }` |
| `IMyWorkOfflineState` | Offline state: `{ isOnline, lastSuccessfulSyncIso, cachedItemCount, queuedActionCount, queuedActions[] }` |
| `IMyWorkQueueHealth` | Queue diagnostics: `{ freshness, lastSyncAtIso, hiddenSupersededCount, degradedSourceCount, warningMessage? }` |
| `IMyWorkReasoningPayload` | Explainability payload: `{ workItemId, canonicalKey, title, rankingReason, lifecycle, permissionState, sourceMeta[], dedupeInfo?, supersessionInfo? }` |

---

## 4. Registry Contract

The `MyWorkRegistry` is a module singleton for work-item source registration (ADR-0115 D-03). Implemented in `registry/MyWorkRegistry.ts`.

### 4.1 Registry pattern

| Property | Value |
|---|---|
| Pattern | Module singleton (follows `NotificationRegistry` pattern) |
| Registration timing | App initialization only |
| Late registration | Not supported |
| Unregistration | Not supported |
| Validation | On register — rejects duplicate sources, validates rankingWeight range, validates source match |

### 4.2 Registration rules

- `source` must be a non-empty string.
- `adapter.source` must match `entry.source`.
- `rankingWeight` must be between 0 and 1 (defaults to 0.5).
- Duplicate sources throw — sources are unique once registered.
- Entries are frozen after registration (`Object.freeze()`).
- `enabledByDefault` defaults to `true`.

### 4.3 Adapter interface

Each `IMyWorkSourceAdapter` MUST implement:

| Method | Signature | Description |
|---|---|---|
| `source` | `MyWorkSource` | The source this adapter represents |
| `isEnabled` | `(context: IMyWorkRuntimeContext) => boolean` | Whether this source is active in the current runtime context |
| `load` | `(query: IMyWorkQuery, context: IMyWorkRuntimeContext) => Promise<IMyWorkItem[]>` | Fetch and normalize work items matching the query |

### 4.4 Source filtering

`getEnabledSources()` filters by:
1. `enabledByDefault` is `true`
2. `adapter.isEnabled(context)` returns `true`

### 4.5 Current adapter registrations

| Source | Adapter | Weight | Status |
|---|---|---|---|
| `bic-next-move` | BIC adapter | 0.9 | Live |
| `workflow-handoff` | Handoff adapter | 0.8 | Live |
| `notification-intelligence` | Notification adapter | 0.5 | Live |
| `acknowledgment` | Acknowledgment adapter | — | Disabled stub |
| `session-state` | Draft/Resume adapter | 0.3 | Live |
| `module` | (reserved for module adapters) | — | Phase 3 scope |

---

## 5. Normalization Pipeline

The normalization pipeline runs as a single aggregation pass via `aggregateFeed()`. All normalization is deterministic (ADR-0115 D-04, D-05).

### 5.1 Pipeline stages

```
Load Sources → Assign Lanes → Deduplicate → Supersede → Rank → Filter/Project
```

| Stage | Function | Description |
|---|---|---|
| **Load** | `loadSources()` | Fetch items from all enabled adapters in parallel (`Promise.allSettled`) |
| **Assign Lanes** | `assignLane()` | Derive lane from item state, priority, and delegation fields |
| **Deduplicate** | `dedupeItems()` | Merge items sharing a `dedupeKey` into a single survivor |
| **Supersede** | `applySupersession()` | Mark lower-truth source items as `superseded` for same record |
| **Rank** | `rankItems()` | Score and sort items by deterministic ranking formula |
| **Filter/Project** | `projectFeedResult()` | Apply query filters, compute counts, assemble `IMyWorkFeedResult` |

### 5.2 Lane assignment

`assignLane()` derives lane from item state:

| Condition (evaluated in order) | Lane |
|---|---|
| `isBlocked` OR `state === 'blocked'` OR `state === 'waiting'` | `waiting-blocked` |
| `priority === 'now'` AND (`state === 'active'` OR `state === 'new'`) | `do-now` |
| `priority === 'deferred'` OR `state === 'deferred'` | `deferred` |
| `delegatedTo` OR `delegatedBy` is set | `delegated-team` (provisional) |
| Otherwise | `watch` |

### 5.3 Deduplication

Items are grouped by `dedupeKey`. Groups with multiple items undergo survivor selection:

**Survivor selection order:**
1. Higher source priority (lower index in `MY_WORK_SOURCE_PRIORITY`)
2. Newest `sourceUpdatedAtIso`

**Permission merge rules:**
| Field | Rule |
|---|---|
| `canAct` | Any-true-wins (a grant from any source is preserved) |
| `isBlocked` | Any-true-wins (a stop signal from any source is preserved) |
| `canDelegate` | Any-false-wins (a restriction from any source overrides) |
| `canBulkAct` | Any-false-wins (a restriction from any source overrides) |

The survivor accumulates `sourceMeta` from all merged items and carries `IMyWorkDedupeMetadata` with the merge reason.

### 5.4 Supersession

Items are grouped by record identity key: `{moduleKey}::{recordType}::{recordId}`. Groups with multiple items from different sources undergo supersession:

- The item from the highest-truth source (lowest index in `MY_WORK_SOURCE_PRIORITY`) wins.
- Losers are marked `state: 'superseded'` with `IMyWorkSupersessionMetadata`.
- Items from the same source do NOT self-supersede.
- Superseded items are retained for audit and reasoning (ADR-0115 D-05).

### 5.5 Ranking formula

Additive scoring with deterministic tie-breaking (ADR-0115 D-04):

| Factor | Score contribution |
|---|---|
| **Overdue** | +1000 base + min(daysOverdue × 10, 500) |
| **Days-to-due** | max(0, 500 − daysToDue × 20) |
| **Blocked BIC** | +400 (when `isBlocked` AND source is `bic-next-move`) |
| **Unacknowledged** | +300 (when `inbound-handoff` or `pending-approval` AND `isUnread`) |
| **Unread freshness** | max(0, 200 − daysSinceUpdate × 10) |
| **Dependency impact** | +150 (when `blockedDependencyLabel` is set) |
| **Project context** | +100 (when `projectId` is set) |
| **Source weight** | +50 × registeredWeight |
| **Offline capable** | +25 |

**Tie-breaking order** (when scores are equal):
1. Overdue severity (days overdue descending)
2. Blocked criticality (`isBlocked` first)
3. Source weight (descending)
4. Freshest `updatedAtIso` (descending)
5. Lexical `canonicalKey` (ascending — stable sort)

---

## 6. Query and Feed Contract

### 6.1 Query filtering

`filterByQuery()` applies filters sequentially:

| Filter | Behavior |
|---|---|
| `projectId` | Exact match on `context.projectId` |
| `moduleKeys` | Include only matching `context.moduleKey` values |
| `priorities` | Include only matching `priority` values |
| `classes` | Include only matching `class` values |
| `states` | Include only matching `state` values |
| `lane` | Exact match on `lane` |
| `locationLabel` | Exact match on `locationLabel` |
| `includeDeferred` | When false (default), exclude `state === 'deferred'` |
| `includeSuperseded` | When false (default), exclude `state === 'superseded'` |
| `limit` | Truncate to first N items after all other filters |

### 6.2 Count computation

`computeCounts()` computes all count fields from the filtered item set:

| Count | Derivation |
|---|---|
| `totalCount` | `items.length` |
| `unreadCount` | Items where `isUnread === true` |
| `nowCount` | Items where `priority === 'now'` |
| `blockedCount` | Items where `isBlocked === true` OR `state === 'blocked'` |
| `waitingCount` | Items where `state === 'waiting'` |
| `deferredCount` | Items where `state === 'deferred'` |
| `teamCount` | Items where `delegatedTo` OR `delegatedBy` is set |

### 6.3 Feed staleness

`isStale` is `true` when `healthState.freshness` is `'cached'` or `'partial'`.

---

## 7. Project-Scoped Work Queue Semantics

This section expands P3-A3 §5.2.

### 7.1 Project filtering

- All work items MUST carry `IMyWorkContext.projectId` for project-scoped filtering.
- The project home canvas Work Queue tile MUST use `IMyWorkQuery.projectId` set to the current project (P3-C2 §4.3).
- `projectId` filtering is exact-match — no cross-project aggregation at the spine level.

### 7.2 Project-scoped counts

Project-scoped work queue counts (`nowCount`, `blockedCount`, `waitingCount`, `deferredCount`, `teamCount`) MUST be computed from the project-filtered result set, not from the global feed.

### 7.3 Badge semantics

Badge semantics on the Work Queue module nav MUST match project-scoped counts. The badge number reflects the project-filtered `nowCount` + `blockedCount` — items that need immediate attention within the project.

---

## 8. Next-Action and Team Semantics

Per Phase 3 plan §9.4, the mandatory next-action surface is **hybrid**: current-user project-filtered work first, plus project-team operational items and escalations. It is user-centered first, but not user-exclusive.

### 8.1 Personal mode (default)

Standard query: `teamMode: 'personal'` with `projectId` filter. Returns items owned by or assigned to the current user within the project.

### 8.2 Team projections

Elevated roles (Project Manager, Project Administrator) MAY access supplementary team views:

| Team mode | Purpose | Key counts |
|---|---|---|
| `delegated-by-me` | Items the current user has delegated to others | `agingCount`, `blockedCount`, `escalationCandidateCount` |
| `my-team` | Items across the user's team | `agingCount`, `blockedCount`, `escalationCandidateCount` |

Team feed results use `IMyWorkTeamFeedResult` — a projection over the same `IMyWorkItem` model, not a separate item type (ADR-0115 D-10).

### 8.3 Escalation candidates

Items qualify as escalation candidates when they are aging beyond expected thresholds (overdue, blocked for extended periods, or unacknowledged handoffs). The `escalationCandidateCount` in the team feed supports proactive management.

---

## 9. Action Model

Work items expose typed actions for inline operations and navigation (ADR-0115 D-09).

### 9.1 Replayable actions

Actions that can be replayed deterministically and queued offline:

| Action key | Target state | Description |
|---|---|---|
| `mark-read` | `active` | Mark item as read |
| `defer` | `deferred` | Defer item for later |
| `undefer` | `active` | Remove deferral |
| `pin-today` | `active` (priority `now`) | Pin to today's focus |
| `pin-week` | `active` (priority `soon`) | Pin for this week |
| `waiting-on` | `waiting` | Mark as waiting on external input |

### 9.2 Non-replayable actions

Actions that require navigation to the source module return a `deepLinkHref` via `context.href`. These cannot be queued offline.

### 9.3 Offline queueing

When `offlineCapable === true`, replayable actions are queued via `@hbc/session-state` mutation queue. Actions are replayed on sync completion. `IMyWorkCommandResult` reports success/failure with affected item IDs.

---

## 10. Count and Badge Consistency

Multi-surface count consistency is a locked governance decision (ADR-0115 D-07).

### 10.1 Single source of truth

`computeCounts()` is the single function that computes all count fields. Every surface — badge, tile, panel, feed — MUST derive its counts from the same `IMyWorkFeedResult` or apply `computeCounts()` to the same filtered item set.

### 10.2 Consistency rules

- Badge count MUST equal the sum visible in the panel or feed view for the same query.
- Project-scoped tile counts MUST match the project-filtered feed counts.
- No surface may apply independent counting logic that diverges from `computeCounts()`.

---

## 11. Offline Strategy

Offline strategy is delegated to `@hbc/session-state` (ADR-0115 D-08). `@hbc/my-work-feed` does not implement its own persistence layer.

### 11.1 Offline state

`IMyWorkOfflineState`:

| Field | Type | Description |
|---|---|---|
| `isOnline` | `boolean` | Current connectivity status |
| `lastSuccessfulSyncIso` | `string` | Timestamp of last successful sync |
| `cachedItemCount` | `number` | Number of cached items available offline |
| `queuedActionCount` | `number` | Number of queued actions pending sync |
| `queuedActions` | `Array<{ actionKey, workItemId, payload, queuedAtIso }>` | Queued action details |

### 11.2 Sync statuses

| Status | Meaning |
|---|---|
| `live` | Connected, data is current |
| `cached` | Offline, showing cached data |
| `partial` | Some sources failed, partial data |
| `queued` | Actions queued but not yet synced |

### 11.3 Offline behavior

- Offline-capable actions are queued in `@hbc/session-state` mutation queue.
- Feed shows cached items with `isStale: true` when offline.
- `HbcMyWorkOfflineBanner` component surfaces offline state to users.
- On reconnection, queued actions are replayed and the feed is refreshed.

---

## 12. Module Adapter Registration Expectations

Each always-on core module that produces actionable work items MUST register an `IMyWorkSourceAdapter` with `MyWorkRegistry`. This section expands P3-A3 §5.1.

### 12.1 Module adapter matrix

| Module | Required adapter | Work item examples |
|---|---|---|
| Financial | Yes | Forecast review due, budget import pending, exposure requires attention |
| Schedule | Yes | Milestone at risk, schedule update required, forecast override review |
| Constraints | Yes | Constraint nearing due date, constraint requiring response, delay quantification needed |
| Permits | Yes | Inspection due, permit expiring, permit application pending |
| Safety | Yes | Incident follow-up required, checklist due, orientation pending |
| Reports | Yes | Report draft stale, report approval pending, report distribution pending |

### 12.2 Adapter requirements

- Adapters MUST use the `'module'` source type.
- Items MUST carry `IMyWorkContext.projectId` for project-scoped filtering.
- Items MUST include meaningful `title`, `summary`, and `expectedAction` text.
- Items MUST set `isOverdue`, `isUnread`, and `isBlocked` accurately.
- Items MUST populate `lifecycle` preview for workflow context.
- Items MUST expose appropriate `availableActions` for inline operations.

### 12.3 Lifecycle authority boundary

| Owned by spine | Owned by module |
|---|---|
| Canonical item shape | Item origin and creation |
| Lane assignment | Business rules |
| Priority/scoring | Completion/update semantics |
| Deduplication | Deeper module workflows |
| Count semantics | Mutation through domain actions |

Modules MUST NOT modify work items through the spine — mutation flows through module-owned domain actions (P3-A3 §5.3).

---

## 13. Rendering Contract

Work queue consumers MUST render work data consistently across surfaces.

### 13.1 Complexity-tier variants

From P3-C2 §4.2:

| Tier | Rendering |
|---|---|
| `essential` | Count badges: `do-now` count, `blocked` count + top 3 items with title and due date |
| `standard` | Lane summary (do-now, waiting-blocked, watch, deferred) with counts + scrollable top-N item list with priority, title, due date, source module |
| `expert` | Full lane breakdown with items, ranking reason, lifecycle preview, available actions, overdue flags, and delegation indicators |

### 13.2 Component inventory

| Component | Purpose |
|---|---|
| `HbcMyWorkLauncher` | Entry point that opens tile or panel |
| `HbcMyWorkBadge` | Top-level unread/actionable count in app shell |
| `HbcMyWorkTile` | Compact summary card with count breakdown |
| `HbcMyWorkPanel` | Slide-out panel with full item list |
| `HbcMyWorkFeed` | Dedicated page view with filtering/search |
| `HbcMyWorkTeamFeed` | Team/delegation view |
| `HbcMyWorkListItem` | Individual work item row |
| `HbcMyWorkReasonDrawer` | Explainability modal (ADR-0115 D-06) |
| `HbcMyWorkPlanningBar` | Planning/filter bar |
| `HbcMyWorkSourceHealth` | Source health indicator |
| `HbcMyWorkEmptyState` | Empty state UI |
| `HbcMyWorkOfflineBanner` | Offline status banner |

### 13.3 Mandatory rendering elements

Work queue surfaces MUST render:
- Lane counts (do-now, waiting-blocked, watch, deferred)
- Unread count
- Item title, priority indicator, and due date
- Overdue visual indicator when `isOverdue`
- Blocked indicator when `isBlocked`
- Source module attribution
- Available actions
- Freshness cue (`lastRefreshedIso`, stale indicator when `isStale`)

### 13.4 Explainability access

Every work item MUST support rendering its `IMyWorkReasoningPayload` (ADR-0115 D-06): ranking reason, lifecycle preview, permission state, source provenance, and dedup/supersession metadata when available.

---

## 14. Queue Health and Telemetry

### 14.1 Queue health

`IMyWorkQueueHealth` provides diagnostic state:

| Field | Type | Description |
|---|---|---|
| `freshness` | `MyWorkSyncStatus` | Overall feed freshness |
| `lastSyncAtIso` | `string` | Timestamp of last successful sync |
| `hiddenSupersededCount` | `number` | Number of superseded items hidden from active feed |
| `degradedSourceCount` | `number` | Number of sources that failed during load |
| `warningMessage` | `string` | Optional warning for degraded state |

### 14.2 Telemetry events

`FeedTelemetry` uses a pluggable sink pattern (default: no-op):

| Event type | Payload | Trigger |
|---|---|---|
| `dedupe` | `{ survivorWorkItemId, mergedWorkItemId, dedupeKey, mergeReason }` | Item merged during deduplication |
| `supersession` | `{ supersededWorkItemId, supersededByWorkItemId, reason }` | Item superseded by higher-truth source |
| `source-error` | `{ source, error }` | Adapter threw during load |
| `aggregation-complete` | `{ totalItems, durationMs, degradedSourceCount }` | Full pipeline completed |

### 14.3 Sink pattern

```typescript
FeedTelemetry.setSink(sink: MyWorkTelemetrySink): void
FeedTelemetry.emit(event: MyWorkTelemetryEvent): void
```

Consumers wire a real sink at app startup. Telemetry must never throw — sink errors are swallowed silently.

---

## 15. Cross-Spine Integration Rules

### 15.1 Work Queue → Activity

Work item state changes (creation, completion, escalation) SHOULD be published as activity events when the Activity spine (P3-D1) is operational:

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `work-queue.item-escalated` | `alert` | `notable` | Work item escalated beyond threshold |
| `work-queue.item-completed` | `status-change` | `routine` | Work item completed |
| `work-queue.item-overdue` | `alert` | `critical` | Work item became overdue |

### 15.2 Health → Work Queue

Health-derived recommended actions (P3-D2 §8) MAY generate work queue items for responsible parties. Item creation flows through the standard module adapter registration, not by direct Health-to-Work coupling.

### 15.3 Work Queue → Health

Work queue metrics contribute to the Office health dimension (P3-A3 §4.1):
- Project-scoped overdue item count
- Project-scoped blocked item count

These metrics follow the standard `IHealthMetric` shape (P3-D2 §3.3).

### 15.4 Work Queue → Notifications

Item escalations and overdue alerts MAY trigger notification-intelligence signals for relevant recipients. The notification adapter already maps notification events to work items (§4.5); the reverse path follows the standard notification publication contract.

### 15.5 Boundary rule

Cross-spine integration uses each spine's public contract only. No direct internal coupling between spine implementations is permitted.

---

## 16. Cross-Lane Consistency

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same data source.** Both lanes query the same Work Queue spine.
2. **Same normalization.** Both lanes use the same aggregation pipeline (load, lane assignment, dedup, supersession, ranking).
3. **Same type system.** `IMyWorkItem`, `IMyWorkFeedResult`, and all sub-types are shared.
4. **Same counts.** `computeCounts()` produces identical results for the same filtered item set.
5. **Same ranking.** Deterministic ranking produces identical order for identical inputs.
6. **Same mandatory tile rendering.** The `project-work-queue` mandatory tile (P3-C2 §4) shows the same data in both lanes.
7. **Lane-specific depth.** The PWA MAY offer richer interaction (panel, feed, team feed, reason drawer, planning bar, offline banner); SPFx provides the standard work queue tile and compact item list.

---

## 17. Repo-Truth Reconciliation Notes

1. **`IMyWorkItem` type system — compliant**
   All types, sub-interfaces, and union types in `my-work-feed/src/types/` are live, tested, and match this contract exactly. Classified as **compliant**.

2. **`MyWorkRegistry` — compliant**
   Module singleton with freeze-on-write, duplicate rejection, source/weight validation, and `getEnabledSources()` filtering. Classified as **compliant**.

3. **Source adapters (BIC, handoff, notification, draft/resume) — compliant**
   Four live adapters implement `IMyWorkSourceAdapter` with correct source types, weights, and normalization. Acknowledgment adapter is a disabled stub (no list-all API). Classified as **compliant**.

4. **Normalization pipeline — compliant**
   `aggregateFeed()`, `rankItems()`, `dedupeItems()`, `applySupersession()`, `assignLane()`, `projectFeedResult()` implement all pipeline stages specified in §5. Ranking is deterministic (ADR-0115 D-04). Dedup and supersession carry full traceability (ADR-0115 D-05). Classified as **compliant**.

5. **Lifecycle state machine — compliant**
   `MY_WORK_TRANSITION_GRAPH`, `isTransitionAllowed()`, `isTerminalState()`, `applyStateTransition()` implement the state machine in §2. Classified as **compliant**.

6. **Hooks — compliant**
   7 hooks (`useMyWork`, `useMyWorkCounts`, `useMyWorkPanel`, `useMyWorkActions`, `useMyWorkReasoning`, `useMyWorkTeamFeed`, `useMyWorkOfflineState`) plus `MyWorkProvider`/`useMyWorkContext` and query key factory. Classified as **compliant**.

7. **Components — compliant**
   12 components with Storybook stories compose `@hbc/ui-kit` primitives (ADR-0115 D-02). Classified as **compliant**.

8. **Telemetry — compliant**
   `FeedTelemetry` pluggable sink with 4 event types. Default no-op sink. Classified as **compliant**.

9. **ADR-0115 — compliant**
   All 10 governance decisions (D-01 through D-10) are reflected in both implementation and this contract. Classified as **compliant**.

10. **Module work-item adapters — controlled evolution**
    Module-specific work-item adapters (§12) using the `'module'` source type exist as contract expectations. Per-module implementation is Phase 3 execution-time work. Each always-on core module must implement its adapter during the module delivery workstream. Classified as **controlled evolution**.

11. **`project-work-queue` tile registration — requires extension**
    P3-C2 §4.1 defines this tile as mandatory but notes it is **not yet registered**. Phase 3 must create and register this tile, binding to the Work Queue spine via `IMyWorkQuery.projectId`. Classified as **requires extension**.

12. **`delegated-team` lane — controlled evolution**
    The `delegated-team` lane is marked `@provisional` in the source code. It is retained for compatibility but must not be exposed as a standing primary lane on first-release surfaces. Removal or replacement is required before team-visibility surfaces ship. Classified as **controlled evolution**.

---

## 13. Executive Review Push-to-Project-Team Integration

When a Portfolio Executive Reviewer (PER) uses the Push-to-Project-Team capability (P3-A2 §3.4), the Work Queue spine is the **delivery mechanism** for the structured tracked item. This section defines how the Work Queue spine integrates with the executive review artifact layer.

### 13.1 Push-to-Project-Team creates a Work Queue item

Push-to-Project-Team MUST create a **structured tracked work item** in the work queue using the `'module'` source type and class `'attention-item'` (or `'queued-follow-up'` where the item requires explicit resolution). It is NOT a notification.

| Aspect | Rule |
|---|---|
| **Item origin** | `source: 'module'`, originating module = `'executive-review'` |
| **Item class** | `'queued-follow-up'` — requires explicit resolution by the project team |
| **Priority** | `'soon'` by default; `'now'` if the pusher designates urgency |
| **Provenance** | The item MUST carry a reference (`reviewArtifactId`) pointing to the originating executive review artifact; this is preserved even if the review artifact is in a restricted visibility state |
| **Payload** | Default: curated summary content (structured summary of the review annotation). The pusher may choose full-context inclusion at push time. The original executive review thread remains a separate artifact regardless of payload choice. |
| **Visibility** | The pushed work item is visible to the project team in the normal work queue; the underlying executive review artifact visibility is governed separately |
| **Assignee** | Default: assigned to Project Manager; PE may reassign within the project team |

### 13.2 Work Queue does NOT own executive review artifacts

The Work Queue spine is the delivery and tracking mechanism for pushed items, but it MUST NOT:

- convert the executive review artifact into a work queue item (the review artifact remains separate),
- become the owner of executive review annotation state,
- expose the full executive review thread to the project team through the work queue item (provenance reference only, unless full-context was chosen at push time).

`@hbc/field-annotations` (if used for the review annotation layer) does NOT become the work-queue owner. Work queue ownership remains with the `MyWorkRegistry` / `IMyWorkSourceAdapter` pattern.

### 13.3 Closure loop

When the project team marks the pushed item as resolved in the work queue:

1. The pushed work item status transitions to `completed`.
2. The originating executive review artifact receives a **closure confirmation request** — it is returned to the executive review circle for the PER to confirm closure.
3. The PER's closure confirmation marks the executive review thread as closed.
4. The work queue item MUST NOT auto-close the executive review artifact without PER confirmation.

This full loop (push → project team resolution → executive closure confirmation) MUST be reflected in the work item lifecycle and in the executive review artifact lifecycle (P3-F1 and the reports contract where applicable).

### 13.4 Spine cross-reference

The closure loop activity MUST be published to the Activity spine (P3-D1) as a `follow-up.resolved` and `review.closure-confirmed` event pair, preserving provenance linkage.

---

## 18. Acceptance Gate Reference

**Gate:** Shared spine gates — work queue component (Phase 3 plan §18.4)

| Field | Value |
|---|---|
| **Pass condition** | Work Queue spine is fed by normalized module adapter publications; canvas tile, panel, feed, and badge surfaces consume the work feed coherently with consistent counts |
| **Evidence required** | P3-D3 (this document), `MyWorkRegistry` implementation, module adapter registrations, `project-work-queue` tile registration and rendering, normalization pipeline tests, count consistency tests, cross-lane consistency verification |
| **Primary owner** | Platform / Core Services + Project Hub platform owner |

---

## 19. Policy Precedence

This contract establishes the **Work Queue spine implementation specification** that downstream work must conform to:

| Deliverable | Relationship to P3-D3 |
|---|---|
| **ADR-0115** | Provides the 10 locked governance decisions that this contract codifies; breaking changes to item shape, ranking, dedup/supersession, count semantics, or adapter model require a superseding ADR |
| **P3-A3 §5** — Work Queue Spine Publication Contract | Provides the publication-level module adapter expectations that this contract expands |
| **P3-C2 §4** — Project Work Queue Tile | Defines the mandatory `project-work-queue` tile that consumes `IMyWorkFeedResult` per the rendering contract in §13 |
| **P3-A1** — Project Registry | Provides `projectId` used in all project-scoped work queue queries |
| **P3-A2** — Membership / Role Authority | Determines role-based access to team feed and delegation views |
| **P3-D1** — Project Activity Contract | Defines the Activity spine that Work Queue publishes state-change events into per §15.1 |
| **P3-D2** — Project Health Contract | Defines the Health spine that consumes work queue metrics (overdue/blocked counts) for the Office dimension per §15.3 |
| **P3-E1** — Module Classification Matrix | Module work-item adapter expectations in §12 must align with module classifications |
| **P3-F1** — Reports Contract | May consume work queue data for reporting inputs |
| **P3-H1** — Acceptance Checklist | Must include work queue spine gate evidence |
| **Any module implementation** | Must register `IMyWorkSourceAdapter` and produce `IMyWorkItem` values per §12 expectations |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §8.6](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [ADR-0115](../../../adr/ADR-0115-my-work-feed-architecture.md)

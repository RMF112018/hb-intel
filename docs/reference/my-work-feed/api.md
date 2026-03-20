> **Doc Classification:** Living Reference (Diátaxis) — Reference API surface for `@hbc/my-work-feed`.

# My Work Feed API Reference

## Package

- `@hbc/my-work-feed`

## Canonical Contracts

### Domain Model (`src/types/IMyWorkItem.ts`)

- `IMyWorkItem` — primary work item domain model
- `IMyWorkOwner` — owner identity (user, role, company, system)
- `IMyWorkContext` — module/project/record navigation context
- `IMyWorkSourceMeta` — source provenance and urgency metadata
- `IMyWorkPermissionState` — can-open, can-act, can-delegate permission flags
- `IMyWorkLifecyclePreview` — previous/current/next step labels
- `IMyWorkRankingReason` — primary reason, contributing reasons, numeric score
- `IMyWorkAttentionPolicy` — batch grouping, escalation, suppressed duplicate count
- `IMyWorkHealthState` — freshness, degraded source count, warning message
- `IMyWorkActionDefinition` — inline action key, label, variant, offline capability
- `IMyWorkTimestampState` — created/updated/read/deferred timestamps
- `IMyWorkDedupeMetadata` — dedupe key, merged source meta, merge reason
- `IMyWorkSupersessionMetadata` — superseded-by reference, reason, original ranking

### Union Types (`src/types/IMyWorkItem.ts`)

- `MyWorkItemClass` — `'owned-action' | 'inbound-handoff' | 'pending-approval' | 'attention-item' | 'queued-follow-up' | 'contextual-signal'`
- `MyWorkPriority` — `'now' | 'soon' | 'watch' | 'deferred'`
- `MyWorkLane` — `'do-now' | 'waiting-blocked' | 'watch' | 'delegated-team' | 'deferred'` (`delegated-team` is provisional — retained for compatibility, not a target-state primary lane; see P2-A2 §3.3 / P2-A3 §10.1)
- `MyWorkState` — `'new' | 'active' | 'blocked' | 'waiting' | 'deferred' | 'superseded' | 'completed'`
- `MyWorkOwnerType` — `'user' | 'role' | 'company' | 'system'`
- `MyWorkSource` — `'bic-next-move' | 'workflow-handoff' | 'acknowledgment' | 'notification-intelligence' | 'session-state' | 'module'`
- `MyWorkSyncStatus` — `'live' | 'cached' | 'partial' | 'queued'`

### Query and Result Contracts (`src/types/IMyWorkQuery.ts`)

- `IMyWorkQuery` — filter parameters for feed queries
- `IMyWorkSavedGrouping` — named grouping configuration
- `IMyWorkCounts` — count rollup contract (total, unread, now, blocked, waiting, deferred, team)
- `IMyWorkFeedResult` — feed result with items, counts, health state
- `IMyWorkTeamFeedResult` — team feed result with aging, escalation candidate counts

### Registry and Adapter Contracts (`src/types/IMyWorkRegistry.ts`)

- `IMyWorkRuntimeContext` — user ID, roles, project IDs, offline state, complexity tier
- `IMyWorkRegistryEntry` — source, adapter, enabled-by-default, ranking weight
- `IMyWorkSourceAdapter` — adapter interface: `source`, `isEnabled()`, `load()`
- `IMyWorkCommandResult` — action execution result
- `IMyWorkOfflineState` — online status, sync timestamp, cached/queued counts
- `IMyWorkQueueHealth` — freshness, sync time, superseded/degraded counts
- `IMyWorkReasoningPayload` — explainability payload for reason drawer

## Public Runtime Surface

### Constants

- `MY_WORK_QUERY_KEY_PREFIX` — TanStack Query key prefix
- `MY_WORK_PRIORITY_LANES` — ordered priority lane definitions
- `MY_WORK_REPLAYABLE_ACTIONS` — offline-replayable action keys
- `MY_WORK_SYNC_STATUSES` — sync status enumeration
- `MY_WORK_SOURCE_PRIORITY` — source ranking priority order

### Registry

- `MyWorkRegistry` — central adapter registry with `register()`, `unregister()`, `getAdapters()`, `getHealthReport()`

### Normalization APIs

- `MY_WORK_TRANSITION_GRAPH` — allowed state transitions
- `isTransitionAllowed(from, to)` — validate state transition
- `isTerminalState(state)` — check for terminal state
- `isActiveLaneState(state)` — check for active lane state
- `applyStateTransition(item, targetState)` — apply state transition with result typing
- `dedupeItems(items)` — deterministic dedupe with merge traceability
- `applySupersession(items)` — supersession detection and application
- `computeRankingScore(item, context?)` — compute numeric ranking score
- `rankItems(items, context?)` — sort items by deterministic ranking
- `assignLane(item)` — assign priority lane
- `computeCounts(items)` — compute count rollup from item set
- `projectFeedResult(items, healthState?)` — project items into `IMyWorkFeedResult`

### Adapters (5)

- `bicAdapter` — BIC Next Move work items
- `handoffAdapter` — Workflow Handoff items
- `acknowledgmentAdapter` — Acknowledgment/sign-off items
- `notificationAdapter` — Notification Intelligence items
- `draftResumeAdapter` — Session State draft resume items

### Aggregation API

- `aggregateFeed(registry, query, context)` — full pipeline: load → normalize → dedupe → supersede → rank → project
- `loadSources(registry, query, context)` — load from all enabled adapters with per-source outcomes
- `buildQueueHealth(outcomes)` — compute queue health from source load outcomes

### Hooks (7 + provider)

- `MyWorkProvider` / `useMyWorkContext` — runtime context provider and consumer
- `useMyWork(options?)` — primary feed hook returning items, counts, loading/error state
- `useMyWorkCounts()` — count-only hook for badge/header surfaces
- `useMyWorkPanel()` — grouped panel hook with lane-based grouping
- `useMyWorkActions()` — inline action execution hook with optimistic updates
- `useMyWorkReasoning()` / `buildReasoningPayload()` — explainability payload hook and builder
- `useMyWorkTeamFeed(options?)` / `projectTeamFeed()` — team/delegation feed hook and projector
- `useMyWorkOfflineState()` — offline state and queued action hook
- `myWorkKeys` — TanStack Query key factory

### Store

- `MyWorkPanelStoreProvider` / `useMyWorkPanelStore` — panel UI state (open/close, selected item, scroll position)

### Components (12)

- `HbcMyWorkLauncher` — entry point that opens tile or panel; carries badge count
- `HbcMyWorkBadge` — top-level unread/actionable count badge
- `HbcMyWorkTile` — compact summary card with count breakdown
- `HbcMyWorkPanel` — slide-out panel with grouped item list
- `HbcMyWorkFeed` — full page feed with filtering, search, team toggle
- `HbcMyWorkTeamFeed` — team/delegation feed view
- `HbcMyWorkListItem` — single work item row with inline actions
- `HbcMyWorkReasonDrawer` — explainability drawer (why-here, why-ranked)
- `HbcMyWorkPlanningBar` — filter/sort bar for feed planning view
- `HbcMyWorkSourceHealth` — source health and degradation indicator
- `HbcMyWorkEmptyState` — empty/no-results state
- `HbcMyWorkOfflineBanner` — offline status and queued action banner

### Telemetry

- `FeedTelemetry` — telemetry emitter for time-to-first-action, queue age, suppressed duplicate rate, stale-item detection, inline-action completion rate

## Testing Exports

From `@hbc/my-work-feed/testing`:

### Factory Functions (7 + aliases)

- `createMockMyWorkItem(overrides?)` — canonical work item factory
- `createMockMyWorkQuery(overrides?)` — query factory
- `createMockMyWorkFeedResult(overrides?)` — feed result factory
- `createMockSourceAdapter(overrides?)` — adapter factory
- `createMockRegistryEntry(overrides?)` — registry entry factory
- `createMockRuntimeContext(overrides?)` — runtime context factory
- `createMockMyWorkTeamScenario(overrides?)` — team scenario factory

### Aliases (backward compatibility)

- `createMockMyWorkFeed` → `createMockMyWorkFeedResult`
- `createMockMyWorkRuntimeContext` → `createMockRuntimeContext`
- `createMockMyWorkAdapter` → `createMockSourceAdapter`

### Union Constants

- `mockItemClasses` — all `MyWorkItemClass` values
- `mockPriorityLanes` — all `MyWorkPriority` values
- `mockStates` — all `MyWorkState` values
- `mockOwnerTypes` — all `MyWorkOwnerType` values
- `mockSources` — all `MyWorkSource` values
- `mockSyncStatuses` — all `MyWorkSyncStatus` values

### Scenario Fixtures

- `mockMyWorkScenarios` — pre-built multi-item scenario fixtures for common feed states

## Boundary Notes

- Canonical feed semantics are package-owned in `@hbc/my-work-feed`.
- Source modules own their adapters; the registry is the only coordination point.
- No deep/private import paths are part of the supported API contract.
- All visual components compose `@hbc/ui-kit` primitives.

## Related Artifacts

- [SF29 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF29-My-Work-Feed.md)
- [ADR-0115](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0115-my-work-feed-architecture.md)
- [My Work Feed Adoption Guide](/Users/bobbyfetting/hb-intel/docs/how-to/developer/my-work-feed-adoption-guide.md)

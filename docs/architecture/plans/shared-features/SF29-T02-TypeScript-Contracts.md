# SF29-T02 - TypeScript Contracts: My Work Feed

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF29-T02 contracts task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Lock canonical public contracts for normalized work items, registry entries, explainability, permissions, queue-health state, and multi-surface projections.

---

## Types to Define

```ts
export type MyWorkItemClass =
  | 'owned-action'
  | 'inbound-handoff'
  | 'pending-approval'
  | 'attention-item'
  | 'queued-follow-up'
  | 'contextual-signal';

export type MyWorkOwnershipKind = 'user' | 'role' | 'company' | 'system';
export type MyWorkPriorityLane = 'now' | 'soon' | 'watch' | 'deferred';
export type MyWorkState =
  | 'new'
  | 'active'
  | 'blocked'
  | 'waiting'
  | 'deferred'
  | 'superseded'
  | 'completed';

export interface IMyWorkItem {
  id: string;
  canonicalKey: string;
  itemClass: MyWorkItemClass;
  state: MyWorkState;
  priorityLane: MyWorkPriorityLane;
  title: string;
  actionLabel: string;
  source: MyWorkSource;
  sourceTrace: IMyWorkSourceTrace[];
  ownership: IMyWorkOwnership;
  context: IMyWorkContext;
  ranking: IMyWorkRankingExplanation;
  lifecycle: IMyWorkLifecyclePreview;
  permissions: IMyWorkPermissionState;
  attentionPolicy: IMyWorkAttentionPolicy;
  dedupe?: IMyWorkDedupeMetadata;
  supersession?: IMyWorkSupersessionMetadata;
  actions: IMyWorkActionDefinition[];
  timestamps: IMyWorkTimestampState;
}
```

Additional contracts must include:

- `IMyWorkQuery`
- `IMyWorkSavedGrouping`
- `IMyWorkCounts`
- `IMyWorkFeedResult`
- `IMyWorkTeamFeedResult`
- `IMyWorkRegistryEntry`
- `IMyWorkSourceAdapter`
- `IMyWorkCommandResult`
- `IMyWorkOfflineState`
- `IMyWorkQueueHealth`
- `IMyWorkReasoningPayload`

---

## Contract Requirements

- ownership must normalize `user | role | company | system`
- every item must preserve source traceability even after dedupe
- every item must include human-readable and structured ranking reasons
- every item must declare `canAct`, `cannotActReason`, and `nextStepSummary`
- team-feed contracts must remain projections over `IMyWorkItem`, not a separate item type
- component prop contracts must import canonical item/query types rather than duplicating local shape definitions

---

## Constants to Lock

- `MY_WORK_QUERY_KEY_PREFIX = 'my-work'`
- `MY_WORK_PRIORITY_LANES = ['now', 'soon', 'watch', 'deferred']`
- `MY_WORK_REPLAYABLE_ACTIONS = ['mark-read', 'defer', 'undefer', 'pin-today', 'pin-week', 'waiting-on']`
- `MY_WORK_SYNC_STATUSES = ['live', 'cached', 'partial', 'queued']`

---

## Verification Commands

```bash
pnpm --filter @hbc/my-work-feed check-types
pnpm --filter @hbc/my-work-feed test -- contracts
rg -n "interface IMyWork|type MyWork" packages/my-work-feed/src/types
```

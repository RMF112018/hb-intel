# SF28-T02 - TypeScript Contracts: Activity Timeline

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF28-T02 contracts task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Lock primitive-owned public contracts for normalized activity events, actor attribution, append-only provenance, query/filter semantics, event confidence, read-model dedupe, and telemetry. Consumer contracts remain projection-only.

---

## Types to Define

```ts
export type ActivityEventType =
  | 'created'
  | 'edited'
  | 'field-changed'
  | 'comment-added'
  | 'acknowledged'
  | 'assigned'
  | 'reassigned'
  | 'handoff-started'
  | 'handoff-completed'
  | 'published'
  | 'superseded'
  | 'revoked'
  | 'exported'
  | 'status-changed'
  | 'due-date-changed'
  | 'attachment-added'
  | 'workflow-triggered'
  | 'system-alert';

export type ActivityTimelineMode = 'record' | 'related' | 'workspace';
export type ActivityActorType = 'user' | 'system' | 'workflow' | 'service';
export type ActivitySyncState = 'authoritative' | 'queued-local' | 'replayed' | 'degraded';
export type ActivityEventConfidence =
  | 'trusted-authoritative'
  | 'queued-local-only'
  | 'replayed-awaiting-confirmation'
  | 'degraded-source-context';

export interface IActivityEvent {
  eventId: string;
  type: ActivityEventType;
  actor: IActivityActorAttribution;
  primaryRef: IActivityObjectRef;
  relatedRefs: IActivityRelatedRef[];
  timestampIso: string;
  summary: string;
  details: string | null;
  diffEntries: IActivityDiffEntry[];
  context: IActivityContextStamp;
  confidence: ActivityEventConfidence;
  syncState: ActivitySyncState;
  recommendedOpenAction: IActivityRecommendedOpenAction | null;
  dedupe: IActivityDedupeState | null;
}
```

Additional contracts must include:

- `IActivityActorAttribution`
- `IActivityObjectRef`
- `IActivityRelatedRef`
- `IActivityDiffEntry`
- `IActivityContextStamp`
- `IActivityQuery`
- `IActivityFilterState`
- `IActivityTimelinePage`
- `IActivityEventGroup`
- `IActivityRecommendedOpenAction`
- `IActivityEmissionInput`
- `IActivityDedupeState`
- `IActivityStorageRecord`
- `IActivitySourceHealthState`

---

## Semantic Contract Requirements

- actor attribution must support:
  - `initiatedBy`
  - `executedBy`
  - `onBehalfOf`
  - `serviceIdentity`
- object and related references must support:
  - module key
  - project scope where available
  - record id
  - version id
  - publish/handoff/export link ids where applicable
- context stamp must answer:
  - where the event came from
  - whether it was emitted locally or persisted remotely
  - whether it is correlated to a parent workflow/event
  - what should be opened next for context
- dedupe state must distinguish:
  - raw evidence retained
  - projection suppressed or merged
  - reason for suppression
- query/filter state must support:
  - event types
  - actor
  - timeframe
  - related records
  - module scope
  - include/exclude system events

---

## Reason-Code Enums to Lock

- `ActivityEventSourceReasonCode`
- `ActivityConfidenceDowngradeReasonCode`
- `ActivityDiffSuppressionReasonCode`
- `ActivityDedupeReasonCode`
- `ActivityQueryExclusionReasonCode`

These enums are required so explainability, source-adapter behavior, and telemetry remain deterministic and testable.

---

## Constants to Lock

- `ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT = 25`
- `ACTIVITY_TIMELINE_GROUPING_DEFAULT = 'relative-date'`
- `ACTIVITY_TIMELINE_SYNC_STATES = ['authoritative', 'queued-local', 'replayed', 'degraded']`
- `ACTIVITY_TIMELINE_CONFIDENCE_STATES = ['trusted-authoritative', 'queued-local-only', 'replayed-awaiting-confirmation', 'degraded-source-context']`

---

## Verification Commands

```bash
pnpm --filter @hbc/activity-timeline check-types
pnpm --filter @hbc/activity-timeline test -- contracts
pnpm --filter @hbc/ui-kit check-types
```

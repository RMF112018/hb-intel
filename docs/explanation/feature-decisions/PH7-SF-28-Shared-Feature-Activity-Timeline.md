# PH7-SF-28: Activity Timeline — Shared Cross-Module History, Audit Trail & Event Feed Surface

**Priority Tier:** 2 — Application Layer (shared package; cross-module history and transparency utility)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (not yet interview-locked)
**Mold Breaker Source:** UX-MB §3 (Unified Work Graph); UX-MB §11 (Transparent Systems)

---

## Problem Solved

In a serious operational platform, users need to understand not only the current state of a record but how it got there:

- who created it
- who edited it
- who acknowledged it
- who handed it off
- who published or superseded it
- what changed, when, and why
- what related actions happened around it

Without a shared event-history layer, each module may show fragments of this history differently — or not at all. The result is familiar:

- audit information scattered across records, comments, notifications, and version logs
- no common timeline surface for users trying to understand recent activity
- harder troubleshooting when a record changed state unexpectedly
- accountability gaps because operational actions are not surfaced consistently
- reduced trust in the platform because the system cannot clearly explain “what happened”

The **Activity Timeline** package is the shared event-feed surface that turns platform activity into visible, understandable history. It is not a replacement for version snapshots or document history. It is the cross-module narrative layer that explains the operational life of a record.

---

## Mold Breaker Rationale

The Unified Work Graph concept depends on more than relationships between records; it depends on making work history legible. The Transparent Systems principle likewise requires the platform to expose what the system did and why, rather than hiding operational transitions behind silent backend actions.

`@hbc/activity-timeline` gives HB Intel that transparency:

1. It creates a common language for operational events.
2. It lets every module surface activity history using the same visual and data model.
3. It links responsibility, state change, publication, acknowledgment, and related-item movement into one coherent timeline.
4. It reinforces trust by making the platform explain itself.

This package should be event-driven and configuration-friendly. Modules emit normalized events; the timeline package renders and filters them consistently.

---

## Activity Timeline Model

The package should support both record-centric and workspace-centric history views.

### Timeline Modes
- **Record Timeline** — history for one record
- **Related Activity Timeline** — history across related records or a work graph slice
- **Workspace Feed** — recent events across a module, project, or queue

### Common Event Types
- created
- edited
- field-changed
- comment-added
- acknowledged
- assigned / reassigned
- handoff-started / handoff-completed
- published / superseded / revoked
- exported
- status-changed
- due-date-changed
- attachment-added
- workflow-triggered
- system-generated alert

### Core Timeline Questions It Should Answer
- What changed?
- Who did it?
- When did it happen?
- What record/version/issue did it affect?
- Was it user-initiated or system-initiated?
- What should I open next to understand the context?

---

## Activity Timeline Structure

A normalized activity event should capture five dimensions:

### 1. Actor
- user
- system
- workflow
- service account

### 2. Action
- what happened in clear operational language

### 3. Object
- the record or artifact affected
- related record references where applicable

### 4. Time
- timestamp
- optional duration / SLA context

### 5. Context
- project
- module
- record version
- issue/publish link
- related-item link
- optional diff summary

---

## Interface Contract

```typescript
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

export interface IActivityActor {
  actorType: 'user' | 'system' | 'workflow' | 'service';
  actorId?: string;
  displayName: string;
}

export interface IActivityReference {
  recordId: string;
  moduleKey: string;
  title?: string;
  versionId?: string;
  publishId?: string;
}

export interface IActivityEvent {
  eventId: string;
  type: ActivityEventType;
  actor: IActivityActor;
  primaryRef: IActivityReference;
  relatedRefs?: IActivityReference[];
  timestampIso: string;
  summary: string;
  details?: string;
  diffSummary?: {
    fieldLabel: string;
    from?: string;
    to?: string;
  }[];
  initiatedBySystem?: boolean;
}

export interface IActivityTimelineQuery {
  moduleKey?: string;
  projectId?: string;
  recordId?: string;
  includeRelated?: boolean;
  eventTypes?: ActivityEventType[];
  limit?: number;
}
```

---

## Component Architecture

```
packages/activity-timeline/src/
├── components/
│   ├── HbcActivityTimeline.tsx         # primary timeline surface
│   ├── ActivityEventRow.tsx            # standardized event row renderer
│   ├── ActivityEventIcon.tsx           # event-type icon mapping
│   ├── ActivityFilterBar.tsx           # event type / actor / timeframe filtering
│   ├── ActivityDiffPopover.tsx         # field-level change detail
│   └── ActivityEmptyState.tsx          # no activity / loading guidance
├── hooks/
│   ├── useActivityTimeline.ts          # query and filter orchestration
│   └── useActivityEmitter.ts           # standardized event emission helper
├── adapters/
│   ├── sharePointActivityAdapter.ts    # MVP storage/query adapter
│   └── azureActivityAdapter.ts         # future event store adapter
├── formatters/
│   ├── summarizeEvent.ts
│   └── groupEventsByDate.ts
├── types.ts
└── index.ts
```

---

## Component Specifications

### `HbcActivityTimeline` — Unified History Surface

```typescript
interface HbcActivityTimelineProps {
  query: IActivityTimelineQuery;
  mode: 'record' | 'related' | 'workspace';
}
```

**Visual behavior:**
- renders events in reverse chronological order
- groups by relative date and exact timestamp
- shows actor, action summary, primary object, and optional contextual links
- allows filter-by-type and filter-by-actor without leaving the page
- supports compact mode for side panels and full mode for dedicated timeline pages

### `ActivityEventRow` — Standard Event Presentation

Each row should show:
- event icon / type
- summary sentence
- actor identity
- timestamp
- link to affected record
- optional “show details” affordance for diffs or related references

### `ActivityDiffPopover` — Targeted Change Detail

Used when the event includes field-level change data. It should keep diffs concise:
- field label
- previous value
- new value

The goal is context, not a full raw audit dump.

### `useActivityEmitter` — Shared Event Emission Helper

Modules and shared packages should use a common emission helper to avoid inconsistent event creation. This hook or utility should normalize event metadata and reduce the chance of partial or malformed timeline entries.

---

## Relationship to Versioned Record

The timeline is not a substitute for `@hbc/versioned-record`.

- `@hbc/versioned-record` preserves authoritative snapshots
- `@hbc/activity-timeline` explains the operational story between and around those snapshots

A user might open the timeline to see that a record was reassigned, acknowledged, and later published. They might then open the version snapshot to inspect the exact document state at publish time. These capabilities should complement each other.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/versioned-record` | version references and change-context links |
| `@hbc/workflow-handoff` | handoff-started / completed events |
| `@hbc/publish-workflow` | published / superseded / revoked events |
| `@hbc/acknowledgment` | acknowledgment events |
| `@hbc/notification-intelligence` | optional system-alert events |
| `@hbc/export-runtime` | optional exported events |
| `@hbc/related-items` | related record references in cross-record timelines |
| `@hbc/ui-kit` | list, filter, popover, badge, and timestamp presentation primitives |

---

## Expected Consumers

- any record detail page that needs a “history” or “activity” tab
- project-canvas side panels showing recent project activity
- shared work queues that need recent-event context
- admin/governance tools showing configuration change history
- future analytics on operational flow and action timing

---

## Priority & ROI

**Priority:** P2 — implement once enough stable platform events exist to justify a unified history surface  
**Estimated build effort:** 3–4 sprint-weeks (event contract, timeline renderer, filter bar, event emission helper, MVP adapter, cross-package integrations)  
**ROI:** major transparency improvement, reduced troubleshooting effort, stronger accountability, and a consistent event narrative layer that increases user trust in the platform

---

## Definition of Done

- [ ] normalized activity-event contract defined
- [ ] timeline query contract defined for record, related, and workspace modes
- [ ] shared timeline renderer implemented
- [ ] filter bar implemented for type / actor / timeframe
- [ ] shared event emission helper implemented
- [ ] version, handoff, publish, and acknowledgment event adapters integrated
- [ ] SharePoint-backed MVP event storage/query path implemented
- [ ] optional diff details supported
- [ ] compact and full timeline display modes implemented
- [ ] unit tests on event formatting, grouping, filtering, and emission normalization
- [ ] E2E test: edit record → handoff → publish → open timeline and verify ordered event chain

---

## ADR Reference

Create `docs/architecture/adr/0037-activity-timeline.md` documenting the normalized activity-event schema, the distinction between history narrative and authoritative version storage, the event emission strategy, and the decision to make cross-module operational transparency a shared platform package.

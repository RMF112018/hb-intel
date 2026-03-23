# @hbc/activity-timeline

Cross-module activity timeline primitive for HB Intel. Provides normalized event contracts, emitter helpers, append-only storage adapters, query orchestration, and timeline composition for all Phase 3 modules.

## Overview

`@hbc/activity-timeline` is the shared package that owns activity event normalization, storage, query orchestration, and timeline composition across all HB Intel modules. Individual feature modules emit events via adapter seams; the timeline normalizes, stores, and renders the combined history.

## Event-Truth and Narrative-Projection Boundary

Timeline truth is **append-only and audit-friendly** (L-02). Events are immutable after publication. Summaries, groupings, and formatted displays are readable projections — not the system of record. Raw event evidence is never silently discarded (L-07).

## Timeline Modes

Three timeline projections over one canonical event model (L-06):

- **Record timeline** — events for a specific source record
- **Related timeline** — events across related records
- **Workspace timeline** — all events within a project context

## Actor Attribution

Every event distinguishes (L-05):

- `changedByUpn` / `changedByName` — the user or system that caused the event
- `sourceModule` — the module that emitted the event
- Event `category` classifies the action type (record-change, status-change, milestone, approval, handoff, alert, system)
- Event `significance` classifies importance (routine, notable, critical)

## Storage Strategy

**MVP:** SharePoint-backed append-only event persistence with read-optimized query projection (L-04).

**Future:** Azure event store is a compatibility seam, not an MVP dependency. The `IActivityStorageAdapter` interface enables migration without breaking consumers.

## UI-Kit Ownership

Reusable timeline visual surfaces belong in `@hbc/ui-kit` (L-08):

- `HbcActivityTimeline` — full timeline surface
- `ActivityEventRow` — individual event row
- `ActivityEventIcon` — event type iconography
- `ActivityFilterBar` — filter controls
- `ActivityDiffPopover` — diff detail surface
- `ActivityEmptyState` — empty/degraded states

`@hbc/activity-timeline` exports runtime state and thin composition shells only.

## Testing

```typescript
import { /* test factories */ } from '@hbc/activity-timeline/testing';
```

Test factories and mock adapters are exported from the `/testing` subpath, excluded from production bundles. Coverage threshold: 95/95/95/95.

## Related

- [SF28 Master Plan](../../docs/architecture/plans/shared-features/SF28-Activity-Timeline.md)
- [SF28-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF28-T09-Testing-and-Deployment.md)
- [P3-D1 — Project Activity Contract](../../docs/architecture/plans/MASTER/phase-3-deliverables/P3-D1-Project-Activity-Contract.md)

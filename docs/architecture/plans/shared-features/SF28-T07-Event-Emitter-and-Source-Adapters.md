# SF28-T07 - Event Emitter and Source Adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF28-T07 integration task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Document boundary-safe source-adapter patterns and the canonical shared emission helper used to create normalized activity events across current and future HB Intel packages.

---

## Shared Emitter Contract

`useActivityEmitter()` is the mandatory shared helper for module and primitive event emission.

It must:

- validate emission input against canonical event contracts
- normalize actor attribution and source stamps
- attach correlation and causation metadata
- classify queued-local versus authoritative event state correctly
- prevent package-specific free-form event payload drift

Direct ad hoc event-shape creation in consuming packages is prohibited.

---

## Current First-Party Integration Contracts

- `@hbc/versioned-record`
  - version references, field diff context, and snapshot deep links
- `@hbc/workflow-handoff`
  - handoff-started and handoff-completed event emission
- `@hbc/acknowledgment`
  - acknowledgment and approval-related events
- `@hbc/notification-intelligence`
  - optional system-alert event projections and troubleshooting context
- `@hbc/related-items`
  - related-record references and upgrade path from the existing no-op activity adapter seam
- `@hbc/session-state`
  - queued-local event continuity and replay state handoff
- `@hbc/project-canvas`
  - timeline tile/sidebar consumption and deep-link context
- `@hbc/query-hooks`
  - query key alignment and data-fetch orchestration boundary
- `@hbc/data-access`
  - storage/retrieval adapter integration boundary
- `@hbc/ui-kit`
  - reusable timeline rendering surfaces

---

## Future Seams Only

The following are documented as future integration seams and must not be MVP dependencies:

- `@hbc/export-runtime`
- `@hbc/publish-workflow`

They are planned features in repo documentation but are not current package truth under `current-state-map.md`.

---

## Boundary Rules

- adapters do not re-implement normalization, dedupe, confidence, or replay logic
- emitter helpers remain primitive-owned
- related-items and other current seams may log dev-mode no-op output today, but SF28 must define the canonical upgrade path
- export and publish activity contracts may be reserved now, but not required for initial package delivery

---

## Verification Commands

```bash
pnpm --filter @hbc/activity-timeline check-types
pnpm --filter @hbc/activity-timeline test -- adapters
rg -n "activityTimelineAdapter|emitGovernanceEvent|useActivityEmitter" packages
```

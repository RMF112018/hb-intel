# SF28-T04 - Hooks and State Model: Activity Timeline

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF28-T04 hooks/state task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Define primitive hooks and derived state for querying, filtering, emitting, diff inspection, pending-event interpretation, and source-health visibility without duplicating event-lifecycle logic in adapters.

---

## Hooks to Define

- `useActivityTimeline()`
  - canonical query orchestration for any timeline mode
- `useActivityFilters()`
  - filter state, chip state, and reset/default behavior
- `useActivityEmitter()`
  - shared event emission helper and normalization guard
- `useActivityDiff()`
  - diff expansion and suppression reason handling
- `useActivityWorkspaceFeed()`
  - workspace-scoped convenience projection over `useActivityTimeline()`
- `useActivityRecordTimeline()`
  - record-scoped convenience projection over `useActivityTimeline()`
- `useActivityRelatedTimeline()`
  - related-scope convenience projection over `useActivityTimeline()`
- `useActivitySourceHealth()`
  - source degradation, replay, and pending-event health state

---

## Cache Keys

- `['activity-timeline', 'record', queryKey]`
- `['activity-timeline', 'related', queryKey]`
- `['activity-timeline', 'workspace', queryKey]`
- `['activity-timeline', 'filters', scopeKey]`
- `['activity-timeline', 'source-health', scopeKey]`

---

## Derived State Requirements

Primitive state must derive:

- readable actor labels from attribution payloads
- relative-date and exact-time grouping state
- recommended-open targets for affected records or related workflow context
- confidence and sync-state labels
- diff availability and suppression reason state
- pending queued-local event state sourced from `@hbc/session-state`
- source-health/degraded-state messaging

These derived fields are mandatory so every consuming surface does not invent its own event interpretation locally.

---

## Adapter Boundary Rules

- adapters map primitive state to module-specific deep links, labels, and source metadata only
- adapters must not recompute event confidence, dedupe, replay meaning, or actor truth outside primitive selectors
- adapter-level event emission must call `useActivityEmitter()` or an equivalent primitive helper

---

## State Guarantees

- stable return shape across loading/success/error
- explicit visibility for authoritative, queued-local, replayed, and degraded states
- consistent grouping, filter semantics, and summary rendering across record/related/workspace modes
- no contradictory “persisted” messaging for local-only pending events

---

## Verification Commands

```bash
pnpm --filter @hbc/activity-timeline check-types
pnpm --filter @hbc/activity-timeline test -- hooks
pnpm --filter @hbc/activity-timeline test -- filters
```

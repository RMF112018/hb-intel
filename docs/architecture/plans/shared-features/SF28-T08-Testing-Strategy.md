# SF28-T08 - Testing Strategy: Activity Timeline

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** All L-01 through L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF28-T08 testing task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Define fixture exports and scenario matrix for event correctness, actor attribution, diff summarization, filter behavior, projection dedupe, replay/pending semantics, and timeline rendering consistency.

---

## Testing Exports

Primitive (`@hbc/activity-timeline/testing`):

- `createMockActivityEvent(overrides?)`
- `createMockActivityQuery(overrides?)`
- `createMockActivityDiffEntry(overrides?)`
- `createMockActorAttribution(overrides?)`
- `createMockStorageRecord(overrides?)`
- `mockActivityEventGroups`

Canonical scenarios:

1. user-originated event with authoritative persistence
2. system-originated event with explicit system label
3. workflow-originated event with correlation and causation metadata
4. service-account event with on-behalf-of attribution
5. field-level diff event with concise popover data
6. related-record event correlated across `primaryRef` and `relatedRefs`
7. replayed event after queued-local emission
8. deduplicated projection retaining raw evidence reference
9. degraded-source event with confidence downgrade
10. record / related / workspace mode projection parity

---

## Unit Tests

- normalization guards and canonical event-shape validation
- actor attribution mapping and label derivation
- diff summarization and suppression reason mapping
- projection grouping and dedupe behavior
- filter inclusion/exclusion logic
- telemetry schema validation

---

## Hook and UI Tests

- hook loading/error/refresh/replay transitions
- queued-local to authoritative reconciliation behavior
- source-health state rendering
- timeline row content parity across compact and full surfaces
- diff popover and filter bar interaction behavior

---

## Storybook and Playwright

Storybook matrix:

- record vs related vs workspace
- authoritative vs queued-local vs replayed vs degraded
- user vs system vs workflow vs service actors
- diff-available vs diff-suppressed rows

Playwright flow:

1. user opens a record timeline
2. filter by event type and actor
3. inspect diff popover
4. navigate to related activity
5. verify queued-local event reconciles without double-render confusion
6. verify timeline links open the correct context target

---

## Quality Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95

---

## Verification Commands

```bash
pnpm --filter @hbc/activity-timeline test --coverage
pnpm --filter @hbc/ui-kit test -- HbcActivityTimeline
pnpm --filter @hbc/ui-kit test -- ActivityFilterBar
```

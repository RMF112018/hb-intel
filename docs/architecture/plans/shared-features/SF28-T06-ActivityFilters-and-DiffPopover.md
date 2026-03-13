# SF28-T06 - ActivityFilters and DiffPopover

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** L-06, L-07, L-08, L-10
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T02-T05

> **Doc Classification:** Canonical Normative Plan - SF28-T06 filter/diff UI task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Define reusable filter, diff, and empty/degraded-state surfaces that reduce audit friction while preserving enough event detail for troubleshooting and transparency.

---

## `ActivityFilterBar`

Behavior:

- supports filtering by event type, actor, timeframe, related record, module scope, and source kind
- uses safe defaults that foreground the most relevant recent activity before advanced filtering is needed
- preserves filter state predictably across record, related, and workspace modes where policy allows

Friction-reduction requirements:

- filter chips and quick presets should reduce clicks for common audit tasks
- system-event filtering must be explicit rather than hidden
- reset behavior must be obvious and non-destructive

---

## `ActivityDiffPopover`

Behavior:

- renders concise field-level diffs only when diff data exists and is safe to display
- shows field label, previous value, new value, and optional diff suppression reason
- truncates overly large values safely while preserving access to the affected record/version for deeper inspection

Trust requirements:

- if a diff is hidden, truncated, redacted, or unavailable, the reason must be visible
- the popover explains context; it does not replace authoritative version history

---

## `ActivityEmptyState`

Must support:

- no activity yet
- no results after filtering
- degraded source state
- loading and retry guidance

The empty state should reduce confusion, not merely declare “nothing here.”

---

## UI Ownership Rule

`ActivityFilterBar`, `ActivityDiffPopover`, and `ActivityEmptyState` are reusable visual surfaces and belong in `@hbc/ui-kit`.
`@hbc/activity-timeline` remains responsible for filter/query logic, diff availability, and reason-code state.

---

## Verification Commands

```bash
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test -- ActivityFilterBar
pnpm --filter @hbc/ui-kit test -- ActivityDiffPopover
pnpm --filter @hbc/ui-kit test -- ActivityEmptyState
```

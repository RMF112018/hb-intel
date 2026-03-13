# SF28-T05 - ActivityTimeline and EventRow

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** L-05, L-06, L-08, L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T02-T04

> **Doc Classification:** Canonical Normative Plan - SF28-T05 UI surface task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Define reusable timeline-rendering surfaces in `@hbc/ui-kit` for readable event history, chronology grouping, actor/context visibility, and compact-versus-full embed behavior.

---

## `HbcActivityTimeline`

Behavior:

- renders reverse chronological activity grouped by relative date with exact timestamps
- supports record, related, and workspace feed layouts from the same event contract
- supports compact, embedded, side-panel, and full-page rendering densities
- projects loading, degraded, and empty states without hiding source health

Explainability requirements:

- each visible row clearly surfaces actor, action, object, time, and context
- system-, workflow-, and service-originated events must be visually distinct from user-originated events
- queued-local, replayed, deduplicated, or degraded rows must label their truth state explicitly

---

## `ActivityEventRow`

Each row must show:

- event icon and event-type label
- summary sentence
- actor identity
- timestamp
- affected record/object link
- optional context badges for version, handoff, publish, export, or related-item lineage
- optional affordance to inspect diff details or related references

Rows must answer “what happened?” quickly without forcing users into a details drawer first.

---

## `ActivityEventIcon`

- map canonical event types to accessible, consistent iconography
- distinguish system/workflow activity visually without implying error by default
- preserve readable fallback behavior if a new event type has not yet been assigned a custom icon

---

## UI Ownership Rule

`HbcActivityTimeline`, `ActivityEventRow`, and `ActivityEventIcon` are reusable visual surfaces and therefore belong in `@hbc/ui-kit`.
`@hbc/activity-timeline` supplies only the runtime contracts, selectors, and composition state required to drive them.

---

## Verification Commands

```bash
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test -- HbcActivityTimeline
pnpm --filter @hbc/ui-kit test -- ActivityEventRow
```

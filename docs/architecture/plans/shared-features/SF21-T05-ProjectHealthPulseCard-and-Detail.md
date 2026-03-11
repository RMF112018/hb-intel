# SF21-T05 - ProjectHealthPulseCard and ProjectHealthPulseDetail

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-06 through D-09
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF21-T05 card/detail UI task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define compact and detail pulse interfaces for project-level health consumption.

---

## `ProjectHealthPulseCard`

Behavior:

- no-emoji visual language (Fluent UI primitives only)
- overall health badge as primary focus
- 2x2 dimension grid (Cost/Time/Field/Office)
- amber indicator for excluded metrics
- top recommended action line with deep-link

Interactions:

- overall badge click opens detail panel
- dimension click opens/scrolls to corresponding detail tab

Complexity:

- Essential: compact summary
- Standard/Expert: full compact card with recommended action

---

## `ProjectHealthPulseDetail`

Behavior:

- tabbed layout: Cost, Time, Field, Office
- each tab shows trend sparkline, leading/lagging sections, metric rows
- 90-day history chart expandable
- amber banner for excluded metrics with inline-edit jump links
- top recommended action shown above tabs

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- ProjectHealthPulseCard
pnpm --filter @hbc/features-project-hub test -- ProjectHealthPulseDetail
```

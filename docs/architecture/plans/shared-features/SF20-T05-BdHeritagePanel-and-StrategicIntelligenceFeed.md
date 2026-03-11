# SF20-T05 - BdHeritagePanel and StrategicIntelligenceFeed

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-03, D-07, D-08, D-09
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF20-T05 heritage/feed UI task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define rendering and interaction contracts for read-only heritage panel and approved strategic intelligence feed.

---

## `BdHeritagePanel`

Behavior:

- collapsible panel titled `BD Heritage`
- header includes decision badge, client context, handoff date
- strategic context section (priorities, competitive context, relationships)
- BD team section with contact affordances
- link to versioned scorecard snapshot
- explicit lock/read-only indicator

Complexity:

- Essential: collapsed summary only
- Standard: full heritage section without approval history
- Expert: full section with expanded context metadata

---

## `StrategicIntelligenceFeed`

Behavior:

- render approved entries with type badges, contributor metadata, tags, timestamps
- optional inline filtering by entry type/tags
- show empty state with contribution CTA when no approved entries

Visibility:

- approved entries visible across modules
- pending/rejected entries excluded from general feed views

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- BdHeritagePanel
pnpm --filter @hbc/features-business-development test -- StrategicIntelligenceFeed
```

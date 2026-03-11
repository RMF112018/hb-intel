# SF20-T05 - BdHeritagePanel and StrategicIntelligenceFeed

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-02, L-03, L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF20-T05 heritage/feed UI task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define rendering and interaction contracts for heritage panel and intelligence feed as a projection over `@hbc/strategic-intelligence` state.

---

## `BdHeritagePanel`

Behavior:
- collapsible panel titled `BD Heritage & Intelligence`
- header includes decision badge, client context, handoff date
- strategic context section + ownership avatar cues for active gaps
- deep-link affordances via `@hbc/related-items`
- explicit immutable provenance indicator

Complexity:
- Essential: collapsed badge only
- Standard: read-only panel + approved feed summary
- Expert: full panel with expanded diagnostics and route to form/queue/configure link

---

## `StrategicIntelligenceFeed`

Behavior:
- render approved entries with type badges, contributor metadata, tags, timestamps
- show owner avatar and BIC linkage for risk/gap entries
- inline filter by entry type/tags and status projection hints
- empty state presents contextual contribution CTA by role

Visibility:
- approved entries visible cross-module
- pending/rejected entries visible only in authorized contributor/approver contexts

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- BdHeritagePanel
pnpm --filter @hbc/features-business-development test -- StrategicIntelligenceFeed
pnpm --filter @hbc/strategic-intelligence test -- components
```

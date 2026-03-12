# SF20-T05 - BdHeritagePanel and StrategicIntelligenceFeed

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-02, L-03, L-05, L-08, L-09, L-10
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF20-T05 heritage/feed UI task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define rendering and interaction contracts for Heritage Snapshot and Living Strategic Intelligence surfaces, including trust indicators, stale/conflict states, suggestions, explainability, and sensitivity-aware projections.

---

## `BdHeritagePanel`

Behavior:
- split panel into two explicit sections: `Heritage Snapshot` (immutable) and `Living Strategic Intelligence` (additive)
- header includes decision badge, client context, handoff date, and immutable provenance indicator
- include commitment register summary strip with unresolved warning count
- display participant acknowledgment completion state for handoff review mode
- deep-link affordances via `@hbc/related-items`

Trust and state rendering:
- per-entry trust strip: reliability tier + provenance class + last validated/review-by + stale warning
- supersession/conflict badge with resolution-note affordance
- inherited/approved/pending/rejected/stale/conflicted visual distinctions
- redaction indicator when visibility policy limits content

Complexity:
- Essential: collapsed heritage + trust badge summary
- Standard: read-only panel + approved feed + suggestion highlights
- Expert: full panel with diagnostics, explainability drawer, and workflow CTAs

---

## `StrategicIntelligenceFeed`

Behavior:
- render entries with state badges, trust metadata, contributor metadata, and timestamps
- show owner avatar and BIC linkage for risk/gap entries
- inline filter by state, type, tags, trust tier, stale status
- empty state presents contextual contribution CTA by role

Suggestion and explainability behavior:
- render `Suggested Heritage` and `Suggested Intelligence` cards proactively
- each suggestion includes explainability context (`why shown`, matched metadata, reuse history)
- suggestion actions (`accept`, `dismiss`, `defer`) feed telemetry pathways

Visibility:
- approved entries visible cross-module per sensitivity policy
- pending/rejected entries visible only in authorized contributor/approver contexts
- redacted projections rendered where full visibility is restricted

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- BdHeritagePanel
pnpm --filter @hbc/features-business-development test -- StrategicIntelligenceFeed
pnpm --filter @hbc/features-business-development test -- SuggestedIntelligenceCard
pnpm --filter @hbc/features-business-development test -- IntelligenceExplainabilityDrawer
pnpm --filter @hbc/strategic-intelligence test -- components
```

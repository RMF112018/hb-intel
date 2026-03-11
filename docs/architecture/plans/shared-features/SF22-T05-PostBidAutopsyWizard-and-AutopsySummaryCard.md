# SF22-T05 - PostBidAutopsyWizard and AutopsySummaryCard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** L-02, L-03, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF22-T05 wizard/summary UI task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define wizard and summary-card contracts, including complexity behavior, section ownership cues, inline AI actions, and deep-link behavior.

---

## `PostBidAutopsyWizard`

Behavior:
- 5-step sequential wizard using `@hbc/step-wizard`
- section validation and draft persistence on change
- section-level avatar ownership markers from BIC projection
- inline AI actions for summarize/suggest/compare workflows

Complexity:
- Essential: collapsed autopsy badge + guided resume flow
- Standard: full wizard experience
- Expert: full wizard + retrospective sliders + expanded insights callouts

AI constraints:
- inline only (no sidecar)
- source citation required
- explicit approval required before persistence

---

## `AutopsySummaryCard`

Behavior:
- outcome badge + primary factor + key retrospective finding
- deep-links into related findings and seeded intelligence entries
- benchmark-impact hint chips where update signals exist

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- PostBidAutopsyWizard
pnpm --filter @hbc/features-estimating test -- PostBidAutopsyWizard
pnpm --filter @hbc/features-business-development test -- AutopsySummaryCard
pnpm --filter @hbc/post-bid-autopsy test -- components
```

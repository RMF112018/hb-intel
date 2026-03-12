# SF22-T06 - AutopsyListView and LearningInsightsDashboard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-03, L-06, L-08, L-10, L-11, L-12, L-14
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF22-T06 list/insights task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define list-view and insights-dashboard contracts for confidence-weighted triage, stale/supersession handling, and flywheel pattern/reinsertion operations.

---

## `AutopsyListView`

Behavior:
- role-scoped autopsy rows with status, confidence, due date, owners, and escalation markers
- sortable/filterable by outcome, status, confidence, project type, and date
- deep-link actions to wizard, summary, and related items

Required triage queues:
- `needs-corroboration`
- `ready-to-publish`
- `stale-needs-revalidation`
- `conflict-review`

Row indicators:
- superseded/archived markers
- disagreement marker
- manual-override governance marker

---

## `LearningInsightsDashboard`

Behavior:
- KPI cards and trends for baseline + flywheel quality metrics
- by-role and by-complexity visibility tuning
- expert retrospective slices and comparator controls

Required insights:
- repeat-pattern detection surfaces
- corroboration progression and promotion lifecycle
- reinsertion opportunities for future pursuit decision points
- stale/revalidation backlog and latency

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- AutopsyListView
pnpm --filter @hbc/features-estimating test -- AutopsyListView
pnpm --filter @hbc/features-business-development test -- LearningInsightsDashboard
pnpm --filter @hbc/post-bid-autopsy test -- insights
```

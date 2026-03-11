# SF22-T06 - AutopsyListView and LearningInsightsDashboard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** L-03, L-05, L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF22-T06 list/insights task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define list-view and insights-dashboard contracts for role-based monitoring, KPI trends, and expert-level retrospective visibility.

---

## `AutopsyListView`

Behavior:
- role-scoped autopsy rows with status, due date, owners, and escalation markers
- sortable/filterable by outcome, status, project type, and date
- deep-link actions to wizard, summary, and related items

---

## `LearningInsightsDashboard`

Behavior:
- KPI cards and trends for:
  - autopsy completion latency
  - repeat-error reduction rate
  - intelligence seeding conversion rate
  - benchmark accuracy lift
  - autopsy CES
- by-role and by-complexity visibility tuning
- expert-only retrospective detail slices and comparator controls

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- AutopsyListView
pnpm --filter @hbc/features-estimating test -- AutopsyListView
pnpm --filter @hbc/features-business-development test -- LearningInsightsDashboard
pnpm --filter @hbc/post-bid-autopsy test -- insights
```

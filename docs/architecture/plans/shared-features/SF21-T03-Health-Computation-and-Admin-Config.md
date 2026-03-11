# SF21-T03 - Health Computation and Admin Config

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-02 through D-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF21-T03 computation/config task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define deterministic per-dimension calculators, composite scoring, stale-exclusion behavior, and admin configuration validation rules.

---

## Per-Dimension Compute Model

For each dimension:

- compute leading sub-score from leading metrics
- compute lagging sub-score from lagging metrics
- combine via `leading * 0.70 + lagging * 0.30`
- classify by status bands

Status bands:

- `85-100`: on-track
- `65-84`: watch
- `40-64`: at-risk
- `0-39`: critical
- no valid metrics: data-pending

---

## Missing/Stale Metric Exclusion Rule

- metric is excluded if value is null or stale beyond threshold
- excluded metrics do not contribute `0`
- remaining metric weights are re-normalized within the affected group
- dimension flags `hasExcludedMetrics = true`

---

## Composite Score Model

- overall score is weighted average of four dimension scores using admin config
- default weights: field 0.40, time 0.30, cost 0.15, office 0.15
- weights must sum to 1.0 (save blocked otherwise)

---

## Admin Config Validation

- all dimension weights present
- sum equals exactly `1.0`
- staleness threshold positive integer
- per-metric overrides non-negative

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- computors
pnpm --filter @hbc/features-project-hub test -- admin-config
```

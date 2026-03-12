# SF21-T03 - Health Computation and Admin Config

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** D-02 through D-13  
**Estimated Effort:** 1.2 sprint-weeks  
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF21-T03 computation/config task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define deterministic per-dimension calculators, confidence computation, compound-risk rules, recommendation-priority inputs, Office suppression behavior, and admin governance validation rules.

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
- no valid metrics or confidence unreliable: data-pending

---

## Dimension Signal Requirements

- **Time** must include look-ahead reliability, near-critical-path volatility, schedule update quality.
- **Cost** must include forecast confidence, forecast update age, pending change-order aging.
- **Field** must include production throughput reliability, rework trend, plan-complete reliability.
- **Office** must include clustering and severity-weighted overdue signals with low-impact suppression.

---

## Confidence Model Computation

- derive confidence tier and score at dimension and overall levels
- confidence factors include freshness, excluded-metric ratio, manual influence, trend-history sufficiency, integration completeness
- low/unreliable confidence must emit human-readable reason list

---

## Compound-Risk Rules

- evaluate cross-dimension interactions after per-dimension scoring
- required rule families:
  - time-field deterioration
  - cost-time escalation
  - office backlog amplification
- emit risk signals with severity and affected dimensions
- compound risk influences triage sort and recommendation urgency

---

## Missing/Stale Metric Exclusion Rule

- metric excluded if value is null or stale beyond threshold
- excluded metrics do not contribute `0`
- remaining metric weights re-normalized within group
- dimension flags `hasExcludedMetrics = true`
- exclusion contributes to confidence degradation reasons

---

## Top Recommended Action Prioritization Inputs

- recommendation ranking uses urgency, impact, reversibility window, owner availability, confidence weight
- output includes reason code and source-link provenance

---

## Office Suppression and Governance Config Validation

- weights sum to `1.0`
- staleness threshold positive integer
- per-metric overrides non-negative
- manual governance thresholds within valid ranges
- suppression policy settings present and valid
- triage defaults must map to supported buckets/sort options

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- computors
pnpm --filter @hbc/features-project-hub test -- admin-config
pnpm --filter @hbc/features-project-hub test -- compound-risk
pnpm --filter @hbc/features-project-hub test -- confidence
```

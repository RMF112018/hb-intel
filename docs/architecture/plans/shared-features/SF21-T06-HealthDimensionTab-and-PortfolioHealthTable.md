# SF21-T06 - HealthDimensionTab and PortfolioHealthTable

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** D-06 through D-13  
**Estimated Effort:** 1.1 sprint-weeks  
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF21-T06 tab/portfolio/admin UI task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define tab internals, inline edit governance, portfolio triage behavior, and admin controls for suppression/governance policies.

---

## `HealthDimensionTab` + `HealthMetricInlineEdit`

Behavior:

- metric rows grouped by leading vs lagging
- stale/missing metrics flagged and linked from amber banner
- inline edit allowed only for stubbed metrics and authorized roles
- saves set manual-entry metadata and clear stale state
- override workflow captures reason, actor, timestamp; approval visibility shown for configured sensitive metrics
- aging overrides display governance warning state

Permissions:

- edit requires `project-health:write`
- sensitive override approval paths honor admin governance policy

---

## `PortfolioHealthTable`

Behavior:

- sortable tabular portfolio view for leadership/PX
- columns include overall, confidence, dimensions, compound risk, top action summary
- supports project drill-in actions

Portfolio Triage Mode (required):

- buckets: `attention-now`, `trending-down`, `data-quality-risk`, `recovering`
- sorting: deterioration velocity, compound-risk severity, unresolved action backlog
- filters: status, low-confidence, compound-risk-active, manual-influence-heavy
- triage reasons shown per row for transparency

---

## `HealthPulseAdminPanel`

Behavior:

- weight sliders enforce sum-to-100 rule
- staleness threshold controls with per-metric overrides
- manual-entry governance controls (approval-required metrics, influence thresholds, max override age)
- Office suppression controls (low-impact suppression, clustering window, severity weights)
- default triage bucket/sort settings
- save blocked on invalid configuration

Permissions:

- admin role required (`hbc-admin`)

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- HealthDimensionTab
pnpm --filter @hbc/features-project-hub test -- PortfolioHealthTable
pnpm --filter @hbc/features-project-hub test -- HealthPulseAdminPanel
pnpm --filter @hbc/features-project-hub test -- ManualOverrideGovernance
```

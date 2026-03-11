# SF21-T06 - HealthDimensionTab and PortfolioHealthTable

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-06 through D-09
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF21-T06 tab/portfolio/admin UI task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define per-dimension tab internals, inline edit constraints, portfolio table behavior, and admin panel contracts.

---

## `HealthDimensionTab` + `HealthMetricInlineEdit`

Behavior:

- metric rows grouped by leading vs lagging
- stale/missing metrics flagged and linked from amber banner
- inline edit allowed only for Procore-stubbed metrics and authorized roles
- saves set manual-entry metadata and clear stale state

Permissions:

- edit requires `project-health:write`

---

## `PortfolioHealthTable`

Behavior:

- sortable tabular portfolio view for leadership
- columns include overall + four dimensions + top action summary
- supports status filtering and project drill-in actions

---

## `HealthPulseAdminPanel`

Behavior:

- weight sliders enforce sum-to-100 rule
- staleness threshold controls with per-metric overrides
- save blocked on invalid configuration

Permissions:

- admin role required (`hbc-admin`)

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- HealthDimensionTab
pnpm --filter @hbc/features-project-hub test -- PortfolioHealthTable
pnpm --filter @hbc/features-project-hub test -- HealthPulseAdminPanel
```

# SF21 - Project Health Pulse (`@hbc/features-project-hub`)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Priority Tier:** 2 - Application Layer (Project Hub differentiator)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md`

> **Doc Classification:** Canonical Normative Plan - SF21 implementation master plan for Project Health Pulse; governs SF21-T01 through SF21-T09.

---

## Purpose

SF21 delivers a real-time four-dimension project health indicator that is predictive-first (leading indicators 70%), role-aware, and action-oriented for both project and portfolio decision making.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Package alignment | Implement in `@hbc/features-project-hub`; no standalone pulse package |
| D-02 | Health formula | Each dimension uses `leading 70% + lagging 30%` scoring |
| D-03 | Composite weighting | Overall score uses admin-configurable weights (default field/time/cost/office = 40/30/15/15) |
| D-04 | Status bands | `on-track`, `watch`, `at-risk`, `critical`, `data-pending` |
| D-05 | Missing/stale metrics | Stale/missing Procore-stubbed metrics are excluded (not zeroed) with re-normalized dimension scoring |
| D-06 | Inline edit policy | Procore-stubbed metrics editable only in detail panel with permission checks |
| D-07 | Complexity behavior | Essential compact/minimal, Standard detail tabs, Expert diagnostics/history/admin links |
| D-08 | Recommended action | Top action is derived from BIC + notification context and linked to source item |
| D-09 | Portfolio surface | Leadership portfolio table is a required first-class surface |
| D-10 | Testing sub-path | `@hbc/features-project-hub/testing` exports canonical pulse fixtures |

---

## Package Directory Structure

```text
packages/features/project-hub/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- health-pulse/
|  |  |- types/
|  |  |  |- IProjectHealthPulse.ts
|  |  |  |- index.ts
|  |  |- computors/
|  |  |  |- costHealth.ts
|  |  |  |- timeHealth.ts
|  |  |  |- fieldHealth.ts
|  |  |  |- officeHealth.ts
|  |  |  |- compositeHealth.ts
|  |  |  |- index.ts
|  |  |- api/
|  |  |  |- ProjectHealthPulseApi.ts
|  |  |  |- HealthPulseAdminConfigApi.ts
|  |  |  |- index.ts
|  |  |- hooks/
|  |  |  |- useProjectHealthPulse.ts
|  |  |  |- useHealthPulseAdminConfig.ts
|  |  |  |- index.ts
|  |  |- components/
|  |  |  |- ProjectHealthPulseCard.tsx
|  |  |  |- ProjectHealthPulseDetail.tsx
|  |  |  |- HealthDimensionTab.tsx
|  |  |  |- HealthMetricInlineEdit.tsx
|  |  |  |- PortfolioHealthTable.tsx
|  |  |  |- HealthPulseAdminPanel.tsx
|  |  |  |- index.ts
|  |  |- index.ts
|  |- testing/
|     |- index.ts
|     |- createMockProjectHealthPulse.ts
|     |- createMockHealthDimension.ts
|     |- createMockHealthMetric.ts
|     |- mockProjectHealthStates.ts
|  |- __tests__/
|     |- setup.ts
|     |- compositeHealth.test.ts
|     |- useProjectHealthPulse.test.ts
|     |- useHealthPulseAdminConfig.test.ts
|     |- ProjectHealthPulseCard.test.tsx
|     |- ProjectHealthPulseDetail.test.tsx
|     |- PortfolioHealthTable.test.tsx
```

---

## Definition of Done

- [ ] multi-dimension contracts and status model are fully documented
- [ ] 70/30 compute model and composite weighting model are documented
- [ ] stale/missing metric exclusion and re-normalization behavior documented
- [ ] card/detail/tab/inline-edit/portfolio/admin-panel contracts documented
- [ ] integration contracts (BIC, notification, auth, complexity, canvas) documented
- [ ] testing fixture sub-path documented
- [ ] SF21-T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF21 + ADR-0110 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF21-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF21-T02-TypeScript-Contracts.md` | pulse contracts and constants |
| `SF21-T03-Health-Computation-and-Admin-Config.md` | dimension calculators, composite, admin config rules |
| `SF21-T04-Hooks-and-State-Model.md` | `useProjectHealthPulse` and config hook state model |
| `SF21-T05-ProjectHealthPulseCard-and-Detail.md` | compact card and detail panel contracts |
| `SF21-T06-HealthDimensionTab-and-PortfolioHealthTable.md` | tab/inline-edit/portfolio/admin panel contracts |
| `SF21-T07-Reference-Integrations.md` | shared-feature integration boundaries |
| `SF21-T08-Testing-Strategy.md` | fixtures + unit/component/storybook/e2e matrix |
| `SF21-T09-Testing-and-Deployment.md` | closure checklist + ADR/docs/index/state-map updates |

# SF18 - Estimating Bid Readiness (`@hbc/features-estimating`)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Priority Tier:** 2 - Application Layer (estimating differentiator)
**Estimated Effort:** 2-3 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md`

> **Doc Classification:** Canonical Normative Plan - SF18 implementation master plan for Estimating Bid Readiness; governs SF18-T01 through SF18-T09.

---

## Purpose

SF18 replaces static bid stage labels with a real-time readiness signal that computes submission health, highlights blockers, and routes accountability for unresolved preparation criteria.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Package alignment | Implement in `@hbc/features-estimating`; no standalone bid-readiness package |
| D-02 | Scoring model | Weighted criteria score (0-100) with configurable default criteria |
| D-03 | Blocker semantics | Incomplete blocker criteria force non-ready classifications regardless of raw score band |
| D-04 | Status mapping | `ready-to-bid`, `nearly-ready`, `attention-needed`, `not-ready` with deterministic thresholds |
| D-05 | Admin configurability | Admin can adjust criteria weights, blocker flags, and trade coverage threshold |
| D-06 | Due-date sensitivity | `daysUntilDue` and overdue state are first-class and drive urgency behavior |
| D-07 | Complexity behavior | Essential signal-only; Standard checklist/dashboard; Expert weighted diagnostic detail + config entry |
| D-08 | Accountability integrations | Incomplete blockers map to BIC ownership; `<48h + blockers` triggers immediate notification flow |
| D-09 | SPFx constraints | app-shell-safe components only for route/modal/tooltip usage |
| D-10 | Testing sub-path | `@hbc/features-estimating/testing` exports canonical bid-readiness fixtures |

---

## Package Directory Structure

```text
packages/features/estimating/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- bid-readiness/
|  |  |- types/
|  |  |  |- IBidReadiness.ts
|  |  |  |- index.ts
|  |  |- model/
|  |  |  |- computeBidReadiness.ts
|  |  |  |- classifyBidReadiness.ts
|  |  |  |- mergeBidReadinessConfig.ts
|  |  |  |- index.ts
|  |  |- config/
|  |  |  |- defaultBidReadinessCriteria.ts
|  |  |  |- bidReadinessThresholdPolicy.ts
|  |  |  |- index.ts
|  |  |- hooks/
|  |  |  |- useBidReadiness.ts
|  |  |  |- useBidReadinessCriteria.ts
|  |  |  |- useBidReadinessConfig.ts
|  |  |  |- index.ts
|  |  |- components/
|  |  |  |- BidReadinessSignal.tsx
|  |  |  |- BidReadinessDashboard.tsx
|  |  |  |- BidReadinessChecklist.tsx
|  |  |  |- index.ts
|  |  |- api/
|  |  |  |- BidReadinessConfigApi.ts
|  |  |  |- index.ts
|  |  |- index.ts
|  |- testing/
|     |- index.ts
|     |- createMockBidReadinessCriterion.ts
|     |- createMockBidReadinessState.ts
|     |- createMockEstimatingPursuitForReadiness.ts
|     |- mockBidReadinessStates.ts
|  |- __tests__/
|     |- setup.ts
|     |- computeBidReadiness.test.ts
|     |- mergeBidReadinessConfig.test.ts
|     |- useBidReadiness.test.ts
|     |- BidReadinessSignal.test.tsx
|     |- BidReadinessDashboard.test.tsx
|     |- BidReadinessChecklist.test.tsx
```

---

## Definition of Done

- [ ] weighted readiness contracts are fully documented
- [ ] blocker precedence and status classification contracts are documented
- [ ] default criteria and admin-config override model are documented
- [ ] signal/dashboard/checklist component contracts are documented
- [ ] BIC, acknowledgment, sharepoint-docs, notification, and complexity integrations are documented
- [ ] testing fixture sub-path is documented
- [ ] SF18-T09 includes SF11-grade documentation and deployment requirements
- [ ] `current-state-map.md` includes SF18 + ADR-0107 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF18-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF18-T02-TypeScript-Contracts.md` | bid-readiness contracts and constants |
| `SF18-T03-Readiness-Model-and-Configuration.md` | scoring engine, blocker precedence, config merge rules |
| `SF18-T04-Hooks-and-State-Model.md` | useBidReadiness/useBidReadinessCriteria/useBidReadinessConfig |
| `SF18-T05-BidReadinessSignal-and-Dashboard.md` | compact and detail signal UI contracts |
| `SF18-T06-BidReadinessChecklist-and-AdminConfig.md` | checklist and admin configuration UX contracts |
| `SF18-T07-Reference-Integrations.md` | bic/acknowledgment/docs/notifications/complexity integrations |
| `SF18-T08-Testing-Strategy.md` | fixtures, test matrix, storybook and e2e scenarios |
| `SF18-T09-Testing-and-Deployment.md` | closure checklist, ADR template, docs/index/state-map updates |

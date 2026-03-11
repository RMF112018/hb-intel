# SF22 - Post-Bid Learning Loop (`@hbc/features-business-development` + `@hbc/features-estimating` adapters over `@hbc/post-bid-autopsy`)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Priority Tier:** 2 - Application Layer (cross-module intelligence; BD + Estimating)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0111-post-bid-learning-loop.md` + companion `@hbc/post-bid-autopsy` ADR

> **Doc Classification:** Canonical Normative Plan - SF22 implementation master plan for Post-Bid Learning Loop; governs SF22-T01 through SF22-T09.

---

## Purpose

SF22 implements structured post-bid autopsy as a cross-module adapter over the reusable Tier-1 `@hbc/post-bid-autopsy` primitive, turning bid outcomes into governed intelligence that updates both strategic context and benchmark quality over time.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire autopsy model/lifecycle is provided by Tier-1 `@hbc/post-bid-autopsy` |
| L-02 | BIC ownership | Per-section autopsy gaps create granular BIC ownership with avatar projection in wizard + My Work |
| L-03 | Complexity behavior | Essential collapsed badge; Standard full wizard; Expert retrospective sliders + insights dashboard |
| L-04 | Offline resilience | Service worker caching + IndexedDB via `@hbc/versioned-record` + Background Sync + optimistic statuses |
| L-05 | AI embedding | Inline AI actions only in wizard/summary/dashboard; source citation + explicit approval required |
| L-06 | Deep-linking/provenance/telemetry | Deep-links via `@hbc/related-items`, My Work placement via `@hbc/project-canvas`, immutable provenance via `@hbc/versioned-record`, five UX KPIs |

---

## Package Directory Structure

```text
packages/post-bid-autopsy/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |- model/
|  |- api/
|  |- hooks/
|  |- components/
|- testing/

packages/features/business-development/
|- src/post-bid-learning/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/

packages/features/estimating/
|- src/post-bid-learning/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/
```

---

## Definition of Done

- [ ] SF22 is documented as BD/Estimating adapters over `@hbc/post-bid-autopsy`
- [ ] all L-01 through L-06 decisions are represented in plan-family documents
- [ ] per-section BIC ownership and avatar projection contracts are documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert
- [ ] offline queue/replay model with `Saved locally` and `Queued to sync` is documented
- [ ] inline AI citation/approval constraints are documented
- [ ] benchmark update + intelligence seeding contracts are documented
- [ ] SF22-T09 includes SF11-grade closure and governance checks
- [ ] `current-state-map.md` update requirements include SF22 + ADR-0111 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF22-T01-Package-Scaffold.md` | primitive + adapter scaffolds and README requirements |
| `SF22-T02-TypeScript-Contracts.md` | canonical primitive contracts + adapter projections |
| `SF22-T03-Autopsy-Trigger-and-Lifecycle-Storage.md` | trigger, SLA, persistence, offline replay, snapshot freeze |
| `SF22-T04-Hooks-and-State-Model.md` | primitive hooks + adapter orchestration contracts |
| `SF22-T05-PostBidAutopsyWizard-and-AutopsySummaryCard.md` | wizard + summary UX contracts |
| `SF22-T06-AutopsyListView-and-LearningInsightsDashboard.md` | list/insights visibility and KPI contracts |
| `SF22-T07-Reference-Integrations.md` | Tier-1 integration boundaries |
| `SF22-T08-Testing-Strategy.md` | fixtures, scenario matrix, quality gates |
| `SF22-T09-Testing-and-Deployment.md` | closure checklist + ADR/docs/index/state-map updates |

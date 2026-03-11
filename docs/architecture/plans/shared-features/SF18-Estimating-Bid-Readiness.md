# SF18 - Estimating Bid Readiness (`@hbc/features-estimating`)

**Plan Version:** 2.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Priority Tier:** 2 - Application Layer (estimating differentiator)
**Estimated Effort:** 2-3 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md` + companion `@hbc/health-indicator` ADR

> **Doc Classification:** Canonical Normative Plan - SF18 implementation master plan for Estimating Bid Readiness; governs SF18-T01 through SF18-T09.

---

## Purpose

SF18 now implements Estimating Bid Readiness as a domain adapter over the reusable Tier-1 `@hbc/health-indicator` primitive. Estimating owns profile defaults, UX composition, and module fit; core scoring/state/versioning/telemetry contracts are owned by the primitive.

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire readiness model is provided by Tier-1 `@hbc/health-indicator` |
| L-02 | Criterion ownership | Per-criterion BIC ownership via `@hbc/bic-next-move`; blockers-first ordering |
| L-03 | Progressive disclosure | `@hbc/complexity` controls Essential/Standard/Expert behavior for Signal, Dashboard, Checklist |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync + optimistic indicators |
| L-05 | AI embedding | Checklist rows expose inline AI actions with cited sources and explicit approval; no sidecar chat |
| L-06 | Deep-linking, provenance, telemetry | `@hbc/related-items` deep-links, `@hbc/project-canvas` My Work placement, immutable `@hbc/versioned-record` provenance, five UX KPIs |

---

## Governance Alignment (PH7 Shared Features Evaluation)

SF18 aligns with the PH7 shared-feature governance rule: capabilities become shared primitives only when configuration-driven, reused across modules, domain-agnostic, and materially reducing duplicated implementation. `@hbc/health-indicator` satisfies this rule; SF18 is now a bounded Estimating profile over that primitive.

---

## Package Directory Structure

```text
packages/features/estimating/
|- src/
|  |- bid-readiness/
|  |  |- profiles/
|  |  |  |- estimatingBidReadinessProfile.ts
|  |  |- adapters/
|  |  |  |- mapPursuitToHealthIndicatorItem.ts
|  |  |  |- mapHealthIndicatorStateToBidReadinessView.ts
|  |  |- hooks/
|  |  |  |- useBidReadiness.ts
|  |  |- components/
|  |  |  |- BidReadinessSignal.tsx
|  |  |  |- BidReadinessDashboard.tsx
|  |  |  |- BidReadinessChecklist.tsx
|  |  |- telemetry/
|  |  |  |- bidReadinessKpiEmitter.ts
|  |  |- index.ts
|  |- testing/
|     |- createMockHealthIndicatorState.ts
|     |- createMockBidReadinessProfile.ts
```

Core health computation, version lifecycle, and telemetry schema live in `@hbc/health-indicator`.

---

## Definition of Done

- [ ] all SF18 docs use the six locked decisions and no legacy decision-ID semantics
- [ ] SF18 contracts reference `IHealthIndicator*` as canonical core contracts
- [ ] BIC blockers-first ownership and avatar projection into Signal/My Work are documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert across all three surfaces
- [ ] offline strategy includes SW caching, IndexedDB, Background Sync, optimistic state badges
- [ ] inline AI action behavior includes source citation + explicit approval constraints
- [ ] `@hbc/related-items`, `@hbc/project-canvas`, `@hbc/versioned-record`, and KPI telemetry contracts are documented
- [ ] T09 closure includes companion primitive ADR and KPI validation evidence

---

## Task File Index

| File | Contents |
|---|---|
| `SF18-T01-Package-Scaffold.md` | adapter scaffold, exports, README and dependency boundaries |
| `SF18-T02-TypeScript-Contracts.md` | `IHealthIndicator*` canonical contracts + SF18 adapter aliases |
| `SF18-T03-Readiness-Model-and-Configuration.md` | estimating profile defaults, admin controls, provenance and KPI contracts |
| `SF18-T04-Hooks-and-State-Model.md` | hook orchestration from primitive state to estimating UX state |
| `SF18-T05-BidReadinessSignal-and-Dashboard.md` | complexity-aware signal/dashboard behavior over primitive output |
| `SF18-T06-BidReadinessChecklist-and-AdminConfig.md` | checklist/admin UX, inline AI actions, offline state indicators |
| `SF18-T07-Reference-Integrations.md` | tier-1 integration contracts and boundary rules |
| `SF18-T08-Testing-Strategy.md` | fixtures, scenario matrix, offline and KPI verification |
| `SF18-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates |

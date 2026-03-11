# SF19 - BD Score Benchmark Ghost Overlay (`@hbc/features-business-development` adapter over `@hbc/score-benchmark`)

**Plan Version:** 2.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Priority Tier:** 2 - Application Layer (BD differentiator)
**Estimated Effort:** 3-4 sprint-weeks
**ADR Required:** `docs/architecture/adr/0103-bd-score-benchmark-ghost-overlay.md` + companion `@hbc/score-benchmark` ADR

> **Doc Classification:** Canonical Normative Plan - SF19 implementation master plan for BD score benchmarking; governs SF19-T01 through SF19-T09.

---

## Purpose

SF19 now implements BD score benchmarking as a domain adapter over the reusable Tier-1 `@hbc/score-benchmark` primitive. BD owns profile defaults, UX composition, and module fit; core benchmark computation/state/versioning/telemetry contracts are owned by the primitive.

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire benchmark model is provided by Tier-1 `@hbc/score-benchmark` |
| L-02 | Criterion ownership | Per-criterion Win Zone gap ownership via `@hbc/bic-next-move`; blockers-first with avatar projection |
| L-03 | Progressive disclosure | `@hbc/complexity` controls Essential/Standard/Expert behavior (Essential badge only; Standard summary + ghost context; Expert full overlays + filters) |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync + optimistic indicators |
| L-05 | AI embedding | Ghost Overlay and WinZoneIndicator expose inline AI actions with cited sources, explicit approval, and auto-created BIC records; no sidecar chat |
| L-06 | Deep-linking, provenance, telemetry | `@hbc/related-items` deep-links, `@hbc/project-canvas` My Work placement, immutable `@hbc/versioned-record` provenance/snapshot freeze, five UX KPIs |

---

## Governance Alignment (PH7 Shared Features Evaluation)

SF19 aligns with the PH7 shared-feature governance rule: capabilities become shared primitives only when configuration-driven, reused across modules, domain-agnostic, and materially reducing duplicated implementation. `@hbc/score-benchmark` satisfies this rule; SF19 is a bounded BD profile over that primitive.

---

## Evidence-Informed Design Notes

- CRM scoring systems establish factor-based scoring and explainability patterns, but do not provide SF19-style per-criterion active ghost overlays on live Go/No-Go scorecards.
- Offline runtime follows established PWA patterns: explicit cache strategy, durable IndexedDB state, and deferred sync replay for queued writes.
- KPI surfaces follow operations-grade indicator guidance: thresholded status bands, trend visibility, and consistent target comparison.
- Provenance and governance language maps to version history/approval/retention expectations via `@hbc/versioned-record`.

---

## Package Directory Structure

```text
packages/features/business-development/
|- src/
|  |- score-benchmark/
|  |  |- profiles/
|  |  |  |- businessDevelopmentScoreBenchmarkProfile.ts
|  |  |- adapters/
|  |  |  |- mapBdScorecardToScoreBenchmarkItem.ts
|  |  |  |- mapScoreBenchmarkStateToBdView.ts
|  |  |- hooks/
|  |  |  |- useScoreBenchmark.ts
|  |  |- components/
|  |  |  |- ScoreBenchmarkGhostOverlay.tsx
|  |  |  |- BenchmarkSummaryPanel.tsx
|  |  |  |- WinZoneIndicator.tsx
|  |  |  |- BenchmarkFilterPanel.tsx
|  |  |- telemetry/
|  |  |  |- scoreBenchmarkKpiEmitter.ts
|  |  |- index.ts
|  |- testing/
|     |- createMockScoreBenchmarkState.ts
|     |- createMockScoreBenchmarkProfile.ts
```

Core benchmark computation, filter semantics, version lifecycle, and telemetry schema live in `@hbc/score-benchmark`.

---

## Definition of Done

- [ ] all SF19 docs use locked L-01 through L-06 and no legacy D-* semantics
- [ ] SF19 contracts reference `IScoreBenchmark*` as canonical core contracts
- [ ] BIC blockers-first ownership and avatar projection into overlay tooltip/My Work are documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert across all benchmark surfaces
- [ ] offline strategy includes service worker caching, IndexedDB, Background Sync, optimistic state badges
- [ ] inline AI actions include source citation + explicit approval + auto-BIC creation constraints
- [ ] `@hbc/related-items`, `@hbc/project-canvas`, `@hbc/versioned-record`, `@hbc/notification-intelligence`, `@hbc/health-indicator`, and KPI telemetry contracts are documented
- [ ] T09 closure includes companion primitive ADR and KPI validation evidence

---

## Task File Index

| File | Contents |
|---|---|
| `SF19-T01-Package-Scaffold.md` | primitive + adapter scaffold, exports, README and boundary rules |
| `SF19-T02-TypeScript-Contracts.md` | canonical primitive contracts + SF19 adapter aliases |
| `SF19-T03-Benchmark-Aggregation-and-API.md` | primitive lifecycle, recompute model, provenance-aware API boundaries |
| `SF19-T04-Hooks-and-State-Model.md` | hook orchestration from primitive state to BD UX state + offline replay |
| `SF19-T05-ScoreBenchmarkGhostOverlay-and-Summary.md` | complexity-aware overlay and summary behavior |
| `SF19-T06-WinZoneIndicator-and-BenchmarkFilterPanel.md` | indicator/filter contracts + inline AI action controls |
| `SF19-T07-Reference-Integrations.md` | Tier-1 integration contracts and boundary rules |
| `SF19-T08-Testing-Strategy.md` | fixtures, scenario matrix, offline/AI/KPI verification |
| `SF19-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates |

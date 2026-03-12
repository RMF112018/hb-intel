# SF19 - BD Score Benchmark Ghost Overlay (`@hbc/features-business-development` adapter over `@hbc/score-benchmark`)

**Plan Version:** 2.1
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Priority Tier:** 2 - Application Layer (BD differentiator)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md` + companion `@hbc/score-benchmark` ADR

> **Doc Classification:** Canonical Normative Plan - SF19 implementation master plan for BD score benchmarking; governs SF19-T01 through SF19-T09.

---

## Purpose

SF19 implements BD score benchmarking as a domain adapter over the reusable Tier-1 `@hbc/score-benchmark` primitive. BD owns profile defaults, recommendation copy, and UX composition; core benchmark computation/state/versioning/governance/telemetry contracts are owned by the primitive.

---

## Architectural Realignment Status

Realignment patch applied: 2026-03-12

- benchmark confidence and confidence-reason model added as primitive-owned contracts
- expanded similarity scoring model and strength bands added as primitive-owned contracts
- recommendation state engine (`Pursue`, `Pursue with Caution`, `Hold for Review`, `No-Bid Recommended`) locked to primitive runtime
- filter-governance and anti-benchmark-shopping controls moved to primitive filter semantics with adapter policy inputs
- reviewer consensus/disagreement and explainability surfaces rebaselined across T04-T06
- learning-loop recalibration and predictive-value monitoring integrated into T03/T07/T08/T09 scope

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire benchmark model is provided by Tier-1 `@hbc/score-benchmark` |
| L-02 | Criterion ownership | Per-criterion Win Zone gap ownership via `@hbc/bic-next-move`; blockers-first with avatar projection |
| L-03 | Progressive disclosure | `@hbc/complexity` controls Essential/Standard/Expert behavior (Essential badge only; Standard summary + trusted benchmark context; Expert full overlays + filters + governance diagnostics) |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync + optimistic indicators |
| L-05 | AI embedding | Overlay/indicator expose inline AI actions with cited sources, explicit approval, and governed no-bid rationale capture; no sidecar chat |
| L-06 | Deep-linking/provenance | `@hbc/related-items` deep-links, `@hbc/project-canvas` My Work placement, immutable `@hbc/versioned-record` provenance/snapshot freeze |
| L-07 | Confidence model | Benchmark confidence tiering and confidence reasons are primitive-owned and auditable |
| L-08 | Similarity + recommendation engine | Similarity scoring, win/loss overlap handling, and recommendation-state derivation are primitive-owned with adapter profile thresholds |
| L-09 | Governance guardrails | Anti-benchmark-shopping controls (default cohort lock, change audit, delta warnings, approved cohorts) are primitive filter-governance semantics |
| L-10 | Learning-loop telemetry | Recalibration/predictive-value monitoring and decision-quality telemetry are primitive-owned and projected by the adapter |

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
|  |  |  |- SimilarPursuitsPanel.tsx
|  |  |  |- BenchmarkExplainabilityPanel.tsx
|  |  |  |- ReviewerConsensusPanel.tsx
|  |  |- telemetry/
|  |  |  |- scoreBenchmarkKpiEmitter.ts
|  |  |- index.ts
|  |- testing/
|     |- createMockScoreBenchmarkState.ts
|     |- createMockScoreBenchmarkProfile.ts
```

Core benchmark computation, confidence/similarity/recommendation engines, filter semantics, governance audit contracts, version lifecycle, and telemetry schema live in `@hbc/score-benchmark`.

---

## Definition of Done

- [ ] all SF19 docs use locked L-01 through L-10 and no legacy D-* semantics
- [ ] SF19 contracts include confidence/similarity/recommendation/consensus/governance/recalibration models as canonical primitive contracts
- [ ] recommendation states, no-bid rationale capture, and reviewer disagreement visibility are documented end-to-end
- [ ] BIC blockers-first ownership and avatar projection into overlay tooltip/My Work are documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert across overlay, summary, explainability, similar pursuits, and consensus surfaces
- [ ] filter guardrails include default-lock behavior, approved cohort policy, immutable filter-change audit events, and warning thresholds
- [ ] offline strategy includes service worker caching, IndexedDB, Background Sync, optimistic state badges, and queued governance event replay
- [ ] inline AI actions include source citation + explicit approval + governed no-bid artifact constraints
- [ ] `@hbc/related-items`, `@hbc/project-canvas`, `@hbc/versioned-record`, `@hbc/notification-intelligence`, `@hbc/health-indicator`, and KPI telemetry contracts are documented
- [ ] T09 closure includes companion primitive ADR and decision-quality telemetry validation evidence

---

## Task File Index

| File | Contents |
|---|---|
| `SF19-T01-Package-Scaffold.md` | primitive + adapter scaffold, exports, README and boundary rules including decision-support/governance/recalibration submodules |
| `SF19-T02-TypeScript-Contracts.md` | canonical primitive contracts for confidence/similarity/recommendation/consensus/governance/recalibration + SF19 adapter aliases |
| `SF19-T03-Benchmark-Aggregation-and-API.md` | primitive lifecycle, recommendation derivation, overlap handling, filter-governance enforcement, and recalibration APIs |
| `SF19-T04-Hooks-and-State-Model.md` | hook orchestration from primitive state to BD UX state, side-panel context persistence, offline replay |
| `SF19-T05-ScoreBenchmarkGhostOverlay-and-Summary.md` | complexity-aware overlay/summary behavior including confidence, recommendation, explainability, and similar pursuits |
| `SF19-T06-WinZoneIndicator-and-BenchmarkFilterPanel.md` | indicator/filter contracts with loss-risk overlap handling and anti-shopping guardrail UX |
| `SF19-T07-Reference-Integrations.md` | Tier-1 integration contracts including no-bid rationale persistence and SF22 recalibration signal ingestion |
| `SF19-T08-Testing-Strategy.md` | fixtures, scenario matrix, trust/governance/recalibration verification |
| `SF19-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates, and governance integrity checks |

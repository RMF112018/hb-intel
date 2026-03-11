# SF19 - BD Score Benchmark Ghost Overlay (`@hbc/features-business-development`)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Priority Tier:** 2 - Application Layer (BD differentiator)
**Estimated Effort:** 3-4 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md`

> **Doc Classification:** Canonical Normative Plan - SF19 implementation master plan for BD score benchmarking; governs SF19-T01 through SF19-T09.

---

## Purpose

SF19 turns BD scorecards into benchmarked decision support by overlaying historical win/loss criterion context, win-zone distance, and actionable deltas directly on active score evaluation workflows.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Package alignment | Implement in `@hbc/features-business-development`; no standalone benchmark package |
| D-02 | Benchmark model | Pre-aggregated criterion benchmark stats with win/loss averages and win-zone range |
| D-03 | Sample threshold | Minimum 5 comparable records required for benchmark rendering |
| D-04 | Privacy strategy | Store aggregate statistics only (no raw outcome payload exposure in overlay path) |
| D-05 | Refresh strategy | Nightly benchmark aggregation job writes cached benchmark snapshots |
| D-06 | Filter context | Project type, value range, geography, and owner type are canonical comparison filters |
| D-07 | Complexity behavior | Essential: hidden; Standard: summary + win-zone indicator; Expert: full per-criterion ghost overlay + filters |
| D-08 | Integration behavior | Versioned closed outcomes + post-bid learning feed benchmark datasets; AI risk-assessment can consume benchmark summary context |
| D-09 | SPFx constraints | app-shell-safe overlays, tooltips, and filter controls only |
| D-10 | Testing sub-path | `@hbc/features-business-development/testing` exports canonical benchmark fixtures |

---

## Package Directory Structure

```text
packages/features/business-development/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- score-benchmark/
|  |  |- types/
|  |  |  |- IScoreBenchmark.ts
|  |  |  |- index.ts
|  |  |- model/
|  |  |  |- computeWinZoneDistance.ts
|  |  |  |- resolveBenchmarkSignificance.ts
|  |  |  |- applyBenchmarkFilters.ts
|  |  |  |- index.ts
|  |  |- api/
|  |  |  |- ScoreBenchmarkApi.ts
|  |  |  |- ScoreBenchmarkAggregationApi.ts
|  |  |  |- index.ts
|  |  |- hooks/
|  |  |  |- useScoreBenchmark.ts
|  |  |  |- useBenchmarkFilters.ts
|  |  |  |- index.ts
|  |  |- components/
|  |  |  |- ScoreBenchmarkGhostOverlay.tsx
|  |  |  |- BenchmarkSummaryPanel.tsx
|  |  |  |- WinZoneIndicator.tsx
|  |  |  |- BenchmarkFilterPanel.tsx
|  |  |  |- index.ts
|  |  |- index.ts
|  |- testing/
|     |- index.ts
|     |- createMockScorecardBenchmark.ts
|     |- createMockGhostOverlayState.ts
|     |- createMockBenchmarkFilterContext.ts
|     |- mockScoreBenchmarkStates.ts
|  |- __tests__/
|     |- setup.ts
|     |- computeWinZoneDistance.test.ts
|     |- applyBenchmarkFilters.test.ts
|     |- useScoreBenchmark.test.ts
|     |- ScoreBenchmarkGhostOverlay.test.tsx
|     |- BenchmarkSummaryPanel.test.tsx
|     |- WinZoneIndicator.test.tsx
|     |- BenchmarkFilterPanel.test.tsx
```

---

## Definition of Done

- [ ] benchmark contracts and significance semantics documented
- [ ] nightly pre-aggregation and list/API model documented
- [ ] ghost overlay, summary panel, indicator, and filter panel contracts documented
- [ ] complexity-gated rendering model documented
- [ ] data-seeding/versioned-record/ai-assist/post-bid-learning integration boundaries documented
- [ ] testing fixture sub-path documented
- [ ] SF19-T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF19 + ADR-0108 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF19-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF19-T02-TypeScript-Contracts.md` | benchmark contracts/constants |
| `SF19-T03-Benchmark-Aggregation-and-API.md` | nightly aggregation model + APIs |
| `SF19-T04-Hooks-and-State-Model.md` | useScoreBenchmark/useBenchmarkFilters |
| `SF19-T05-ScoreBenchmarkGhostOverlay-and-Summary.md` | per-criterion overlay and summary contracts |
| `SF19-T06-WinZoneIndicator-and-BenchmarkFilterPanel.md` | spectrum and filtering UX contracts |
| `SF19-T07-Reference-Integrations.md` | shared-feature integration boundaries |
| `SF19-T08-Testing-Strategy.md` | fixtures and test matrix |
| `SF19-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates |

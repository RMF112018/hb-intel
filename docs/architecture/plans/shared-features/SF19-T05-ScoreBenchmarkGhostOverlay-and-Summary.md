# SF19-T05 - ScoreBenchmarkGhostOverlay and BenchmarkSummaryPanel

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-02, L-03, L-05, L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF19-T05 overlay/summary UI task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define per-criterion ghost overlay and overall benchmark summary contracts for BD scorecard surfaces, projected from `@hbc/score-benchmark` state.

---

## `ScoreBenchmarkGhostOverlay`

Behavior:
- render Win Zone translucent band
- render win/loss average markers
- render current criterion score over benchmark context
- render criterion owner avatar and BIC ownership metadata for below-zone gaps
- render insufficient-data warning when sample below threshold

Tooltip rules:
- in zone: show `In Win Zone`
- below zone: show points below zone entry + owner + deep-link
- insufficient data: show record gap to threshold
- inline AI actions include source citation + approval control

Complexity:
- Essential: single `Benchmark context available` badge only
- Standard: Win Zone context + summary-aligned tooltip
- Expert: full ghost bars + ownership avatars + filter affordances

---

## `BenchmarkSummaryPanel`

Behavior:
- show current total score and overall Win Zone range
- show distance-to-win-zone metric
- show sample context summary for applied filters
- show sync state badges (`Saved locally`, `Queued to sync`)
- expose action to open filter panel

Complexity:
- Essential: minimal badge and high-level state only
- Standard: visible summary card with no expert filter controls
- Expert: visible with expanded diagnostics and filter controls

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- ScoreBenchmarkGhostOverlay
pnpm --filter @hbc/features-business-development test -- BenchmarkSummaryPanel
pnpm --filter @hbc/score-benchmark test -- components
```

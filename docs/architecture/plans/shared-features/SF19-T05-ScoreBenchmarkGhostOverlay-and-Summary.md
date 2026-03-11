# SF19-T05 - ScoreBenchmarkGhostOverlay and BenchmarkSummaryPanel

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-03, D-04, D-07, D-09
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF19-T05 overlay/summary UI task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define per-criterion ghost overlay and overall benchmark summary contracts for BD scorecard surfaces.

---

## `ScoreBenchmarkGhostOverlay`

Behavior:

- render win-zone translucent band
- render win/loss average markers
- render current criterion score over benchmark context
- render insufficient-data warning when sample below threshold

Tooltip rules:

- in zone: show "In Win Zone"
- below zone: show points below zone entry
- insufficient data: show record gap to threshold

Complexity:

- Essential: hidden
- Standard: hidden
- Expert: visible

---

## `BenchmarkSummaryPanel`

Behavior:

- show current total score and overall win zone range
- show distance-to-win-zone metric
- show sample context summary for applied filters
- expose action to open filter panel

Complexity:

- Essential: hidden
- Standard: visible
- Expert: visible + expanded diagnostics

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- ScoreBenchmarkGhostOverlay
pnpm --filter @hbc/features-business-development test -- BenchmarkSummaryPanel
```

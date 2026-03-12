# SF19-T05 - ScoreBenchmarkGhostOverlay and BenchmarkSummaryPanel

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-02, L-03, L-05, L-06, L-07, L-08
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF19-T05 overlay/summary UI task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define per-criterion ghost overlay and benchmark summary decision-support contracts, including confidence context, recommendation states, explainability access, and similar-pursuits framing.

---

## `ScoreBenchmarkGhostOverlay`

Behavior:
- render Win Zone translucent band
- render Loss Risk Zone band
- render overlap warning state when Win/Loss zones intersect
- render win/loss average markers and current criterion score
- render criterion owner avatar and BIC ownership metadata for below-zone gaps
- render confidence tier chip and confidence-reason tooltip
- render insufficient-data warning when sample below threshold

Tooltip rules:
- in zone: show `In Win Zone`
- below zone: show points below zone entry + owner + deep-link
- overlap: show `Ambiguous benchmark overlap - review confidence and consensus`
- insufficient data: show record gap to threshold
- inline AI actions include source citation + explicit approval

---

## `BenchmarkSummaryPanel`

Behavior:
- show current total score and overall Win Zone range
- show recommendation state banner (`Pursue`, `Pursue with Caution`, `Hold for Review`, `No-Bid Recommended`)
- show distance-to-win-zone metric and loss-risk overlap marker
- show sample/similarity context summary for applied filters
- show sync state badges (`Saved locally`, `Queued to sync`)
- expose action to open filter panel
- expose action to launch no-bid rationale workflow when applicable

---

## Additional Panels in T05 Scope

- `SimilarPursuitsPanel`
  - displays most-similar pursuits list with similarity strength framing (`highly similar`/`loosely similar`)
  - supports deep-links with context-preserving return path
- `BenchmarkExplainabilityPanel`
  - displays criterion reason codes, key contributors, and historical examples
  - highlights weak-confidence caveats and predictive-band warnings
- `ReviewerConsensusPanel`
  - displays reviewer variance, consensus strength, and largest disagreements
  - surfaces role-based score comparisons and escalation callouts

---

## Complexity Behavior

- Essential: single `Benchmark context available` badge and recommendation badge only
- Standard: Win Zone + recommendation + confidence summary; read-only panel previews
- Expert: full ghost bars, ownership avatars, filter affordances, full panel interactivity

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- ScoreBenchmarkGhostOverlay
pnpm --filter @hbc/features-business-development test -- BenchmarkSummaryPanel
pnpm --filter @hbc/features-business-development test -- SimilarPursuitsPanel
pnpm --filter @hbc/features-business-development test -- BenchmarkExplainabilityPanel
pnpm --filter @hbc/features-business-development test -- ReviewerConsensusPanel
pnpm --filter @hbc/score-benchmark test -- components
```

# SF19-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF19-T08 testing task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define fixture exports and quality coverage matrix for primitive lifecycle, adapter hooks, benchmark decision-support UX surfaces, governance guardrails, recalibration signals, offline replay, inline AI actions, and decision-quality telemetry.

---

## Testing Exports

Primitive (`@hbc/score-benchmark/testing`):
- `createMockScorecardBenchmark(overrides?)`
- `createMockScoreGhostOverlayState(overrides?)`
- `createMockBenchmarkFilterContext(overrides?)`
- `createMockBenchmarkConfidence(overrides?)`
- `createMockSimilarityResult(overrides?)`
- `createMockBenchmarkRecommendation(overrides?)`
- `createMockReviewerConsensus(overrides?)`
- `createMockFilterGovernanceEvent(overrides?)`
- `mockScoreBenchmarkStates`

Adapter (`@hbc/features-business-development/testing`):
- `createMockScoreBenchmarkProfile(overrides?)`
- `createMockBdScoreBenchmarkView(overrides?)`

Canonical states:
1. in Win Zone with high confidence
2. below Win Zone with moderate confidence
3. above Win Zone
4. insufficient data / caution
5. loss-risk overlap active
6. weak similarity (`loosely-similar`) cohort
7. recommendation state per all four states
8. reviewer disagreement high variance
9. filter governance warning triggered
10. stale benchmark timestamp
11. saved locally
12. queued to sync
13. sync replay resolved
14. recalibration signal emitted

---

## Unit Tests

- win-zone/loss-risk overlap precedence and recommendation fallback
- confidence tier computation and confidence-reason derivation
- similarity factor weighting and strength-band assignment
- filter-governance audit event generation and warning thresholds
- lifecycle recompute, recalibration signal emission, and snapshot freeze contracts
- provenance-safe payload shaping for no-bid rationale and filter events
- telemetry emission shape and threshold mappings (legacy + expanded decision-quality metrics)

---

## Hook/Component Tests

- primitive hooks: refresh/loading/error/sync transitions + governance warning + panel context restoration
- adapter hooks: projection of ownership, My Work metadata, recommendation copy, and escalation links
- ghost overlay marker/band/avatar/confidence rendering
- summary panel recommendation-state and no-bid rationale launch behavior
- indicator/filter interaction with guardrail enforcement
- similar pursuits, explainability, and reviewer consensus panel behavior
- complexity gating across Essential/Standard/Expert
- inline AI action citation + approval + no-bid artifact creation callbacks

---

## Storybook and Playwright

Storybook matrix:
- recommendation state x complexity tier
- confidence tier (`high/moderate/low/insufficient`)
- similarity strength (`highly/moderately/loosely similar`)
- sufficient/insufficient sample data
- overlap/no-overlap zone states
- default/custom/guardrail-warning filter contexts
- offline/sync status variants

Playwright scenarios:
1. below-zone score displays distance, owner, and recommendation
2. filter change updates benchmark context while logging governance event
3. low-confidence state renders caution indicator and recommendation downgrade
4. reviewer disagreement surfaces consensus warning and escalation action
5. no-bid recommendation requires approved rationale artifact before finalization
6. similar pursuits panel deep-link preserves return context
7. explainability panel shows reason codes and historical examples
8. offline mutation shows `Saved locally` then `Queued to sync` until replay

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95

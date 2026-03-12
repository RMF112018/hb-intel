# SF19-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF19-T04 hooks task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define primitive and adapter hook behavior for benchmark loading, confidence/recommendation state projection, side-panel context persistence, filter-governance warnings, offline queueing, and replay-safe sync.

---

## Primitive Hook: `useScoreBenchmarkState`

Responsibilities:
- load `IScoreGhostOverlayState` for current entity
- resolve confidence/similarity state and recommendation state transitions
- resolve reviewer consensus/disagreement metadata
- compute normalized `distanceToWinZone` and loss-risk overlap status
- expose loading/error/refresh/sync and governance-warning states
- emit telemetry deltas through primitive KPI channels

Cache key:
- `['score-benchmark', entityId, filterContext, reviewerContext]`

---

## Primitive Hook: `useScoreBenchmarkFilters`

Responsibilities:
- manage filter context and defaults
- enforce cohort lock/default policy
- validate value-range bounds and approved cohort constraints
- emit immutable filter-governance events on changes
- invalidate benchmark queries on change

Cache key:
- `['score-benchmark', 'filters', entityId]`

---

## Primitive Hook: `useBenchmarkDecisionSupport`

Responsibilities:
- expose confidence reasons and explainability payloads
- expose recommendation rationale and no-bid rationale draft state
- expose most-similar-pursuits payload and panel metadata
- expose recalibration signal summaries for reviewer/admin views

---

## BD Adapter Hook: `useScoreBenchmark`

Responsibilities:
- map primitive state into BD scorecard view model
- project criterion gap ownership avatars from `@hbc/bic-next-move`
- project recommendation state copy, no-bid rationale prompts, and escalation routes
- surface My Work placement metadata for `@hbc/project-canvas`

---

## Side-Panel Context and Navigation Guarantees

- open/close state for SimilarPursuitsPanel, ExplainabilityPanel, and ReviewerConsensusPanel is URL-query-backed
- back/forward navigation restores panel context without refetch churn
- deep-link entry into panel context hydrates base overlay state first, then panel detail state

---

## Offline and Sync State Guarantees

- stable return shape across loading/success/error
- optimistic save paths surface explicit statuses:
  - `Saved locally`
  - `Queued to sync`
- queued writes include recommendation overrides, no-bid rationale saves, and filter-governance events
- background replay reconciles local queue and publishes immutable version metadata
- stale benchmark warning surfaces when generation timestamp exceeds threshold

---

## Verification Commands

```bash
pnpm --filter @hbc/score-benchmark test -- hooks
pnpm --filter @hbc/features-business-development test -- score-benchmark-hooks
pnpm --filter @hbc/score-benchmark check-types
```

# SF19-T06 - WinZoneIndicator and BenchmarkFilterPanel

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-03, L-05, L-06, L-08, L-09
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF19-T06 indicator/filter task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define Win Zone indicator and filter governance controls used to contextualize benchmark comparisons, including loss-risk overlap handling and anti-benchmark-shopping guardrail UX.

---

## `WinZoneIndicator`

Behavior:
- render loss-risk/borderline/win-zone spectrum with threshold bands
- show current score marker
- show Win Zone boundaries and win-average marker
- show Loss Risk Zone boundaries and loss-average marker
- show distance-to-win-zone annotation
- show overlap status when Win and Loss zones intersect
- expose inline AI actions with citation, approval, and governed no-bid rationale generation

Recommendation interaction:
- indicator displays current recommendation state token
- low-confidence or high-overlap states force caution framing in indicator copy

Complexity:
- Essential: compact indicator state only
- Standard: visible indicator + recommendation and AI quick actions
- Expert: detailed markers, diagnostics, and filter-linked behavior

---

## `BenchmarkFilterPanel`

Filters:
- `projectType`
- `deliveryMethod`
- `procurementType`
- `valueRange`
- `geography`
- `ownerType`
- `incumbentRelationship`
- `competitorCount`
- `scheduleComplexity`

Governance behavior:
- default benchmark cohort cannot be silently changed
- approved cohort restrictions are enforced
- large benchmark deltas trigger warning confirmation
- every filter/cohort adjustment emits immutable governance audit event
- reset-to-defaults respects locked cohort policy

Runtime behavior:
- live updates benchmark query context
- validates value-range bounds and policy constraints
- projects updated benchmark deltas into summary/indicator in one refresh cycle

Accessibility:
- keyboard navigable controls
- announced filter change summary and guardrail warnings

Visibility:
- Essential: not shown
- Standard: read-only cohort/context summary
- Expert: full filter/governance controls visible

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- WinZoneIndicator
pnpm --filter @hbc/features-business-development test -- BenchmarkFilterPanel
pnpm --filter @hbc/score-benchmark test -- filters
pnpm --filter @hbc/score-benchmark test -- governance
```

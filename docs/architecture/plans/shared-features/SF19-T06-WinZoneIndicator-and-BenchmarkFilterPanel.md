# SF19-T06 - WinZoneIndicator and BenchmarkFilterPanel

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-03, L-05, L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF19-T06 indicator/filter task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define Win Zone indicator visualization and filter controls used to contextualize benchmark comparisons, with inline AI actions and approval flow.

---

## `WinZoneIndicator`

Behavior:
- render loss/borderline/win-zone spectrum with threshold bands
- show current score marker
- show Win Zone boundaries and win-average marker
- show distance-to-win-zone annotation
- expose inline AI actions with citation, approval, and auto-BIC creation

Complexity:
- Essential: compact indicator state only
- Standard: visible indicator + AI quick actions
- Expert: detailed markers, diagnostics, and filter-linked behavior

---

## `BenchmarkFilterPanel`

Filters:
- `projectType`
- `valueRange`
- `geography`
- `ownerType`

Behavior:
- live updates benchmark query context
- reset-to-defaults based on current scorecard characteristics
- validates value-range bounds
- projects updated benchmark deltas into summary/indicator in one refresh cycle

Accessibility:
- keyboard navigable controls
- announced filter change summary

Visibility:
- Essential: not shown
- Standard: not shown (read-only summary context)
- Expert: visible

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- WinZoneIndicator
pnpm --filter @hbc/features-business-development test -- BenchmarkFilterPanel
pnpm --filter @hbc/score-benchmark test -- filters
```

# SF19-T06 - WinZoneIndicator and BenchmarkFilterPanel

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-06, D-07, D-09
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF19-T06 indicator/filter task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define win-zone spectrum visualization and filter controls used to contextualize benchmark comparisons.

---

## `WinZoneIndicator`

Behavior:

- render loss/borderline/win zone spectrum
- show current score marker
- show win-zone boundaries and win-average marker
- show distance-to-win-zone annotation

Complexity:

- Essential: hidden
- Standard: visible
- Expert: visible with detailed markers

---

## `BenchmarkFilterPanel`

Filters:

- `projectType`
- `valueRange`
- `geography`
- `ownerType`

Behavior:

- live-updates benchmark query context
- reset-to-defaults based on current scorecard characteristics
- validates value range bounds

Accessibility:

- keyboard navigable controls
- announced filter change summary

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- WinZoneIndicator
pnpm --filter @hbc/features-business-development test -- BenchmarkFilterPanel
```

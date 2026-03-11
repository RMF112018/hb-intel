# SF19-T09 - Testing and Deployment: BD Score Benchmark

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.55 sprint-weeks
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF19-T09 testing/deployment task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Finalize SF19 with SF11-grade closure requirements: testing completion, ADR template, adoption guide, API reference, README conformance, ADR index update, blueprint progress comment, and `current-state-map` governance updates.

---

## 3-Line Plan

1. Complete aggregation, hook, and UI validation at >=95% coverage.
2. Pass mechanical gates and architecture boundary checks.
3. Publish ADR-0108 and all required documentation/index/state-map updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] score benchmark remains within `@hbc/features-business-development`
- [ ] no app-route imports into package runtime
- [ ] benchmark APIs return aggregate stats only
- [ ] raw scorecard outcomes are not exposed via overlay contracts
- [ ] app-shell-safe component composition validated
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors: `pnpm --filter @hbc/features-business-development check-types`
- [ ] benchmark/filter/overlay contracts stable end-to-end
- [ ] sample-size significance contracts stable
- [ ] distance-to-win-zone contract stable

### Build & Package
- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in BD consumers
- [ ] turbo build with dependencies succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements >=95)
- [ ] aggregation and significance tests complete
- [ ] hook transition tests complete
- [ ] overlay/indicator/filter component tests complete
- [ ] end-to-end benchmark scenario passing

### Storage/API (Benchmarks + Aggregation)
- [ ] benchmark aggregate schema validated
- [ ] nightly aggregation job contract validated
- [ ] filter-context lookup behavior validated
- [ ] benchmark generation timestamp and staleness behavior validated

### Integration
- [ ] data-seeding enrichment behavior validated
- [ ] versioned-record closed-outcome integration validated
- [ ] complexity-tier rendering behavior validated
- [ ] AI assist read-only context integration validated (if enabled)

### Documentation
- [ ] `docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md` written and accepted
- [ ] `docs/how-to/developer/bd-score-benchmark-adoption-guide.md` written
- [ ] `docs/reference/bd-score-benchmark/api.md` written
- [ ] `packages/features/business-development/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0108 entry
- [ ] `current-state-map.md §2` updated with SF19 and ADR-0108 linkage

---

## ADR-0108: BD Score Benchmark Ghost Overlay

**File:** `docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md`

```markdown
# ADR-0108 - BD Score Benchmark Ghost Overlay

**Status:** Accepted
**Date:** 2026-03-11
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-19 referenced ADR-0028. Canonical ADR number for SF19 is ADR-0108.

## Context

BD scorecards require historical win/loss context to produce reliable go/no-go intelligence.

## Decisions

### D-01 - Package Alignment
Implement score benchmarking within `@hbc/features-business-development`.

### D-02 - Benchmark Model
Use pre-aggregated criterion benchmark statistics.

### D-03 - Sample Threshold
Require minimum sample size for confidence rendering.

### D-04 - Privacy Strategy
Expose aggregate benchmark values only.

### D-05 - Refresh Strategy
Compute benchmarks on nightly schedule.

### D-06 - Filter Context
Apply project type/value/geography/owner filters.

### D-07 - Complexity Behavior
Essential hidden, Standard summary, Expert full overlay.

### D-08 - Integration Behavior
Consume seeded/history/autopsy outcomes and expose read-only benchmark context.

### D-09 - Platform Constraints
Use app-shell-safe UI primitives.

### D-10 - Testing Sub-Path
Expose canonical fixtures via `@hbc/features-business-development/testing`.

## Compliance

This ADR is locked and superseded only by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/bd-score-benchmark-adoption-guide.md`

Required sections:

1. loading benchmark state in BD scorecard screens
2. configuring and applying benchmark filter context
3. composing ghost overlay, summary panel, and win-zone indicator
4. handling insufficient-data and staleness states
5. integrating benchmark summary with AI risk assessment context
6. using testing fixtures from `@hbc/features-business-development/testing`

---

## API Reference

**File:** `docs/reference/bd-score-benchmark/api.md`

Must include export table entries for:

- `IScorecardBenchmark`
- `IScoreGhostOverlayState`
- `IBenchmarkFilterContext`
- `useScoreBenchmark`
- `useBenchmarkFilters`
- `ScoreBenchmarkGhostOverlay`
- `BenchmarkSummaryPanel`
- `WinZoneIndicator`
- `BenchmarkFilterPanel`
- testing exports (`createMockScorecardBenchmark`, `createMockGhostOverlayState`, `createMockBenchmarkFilterContext`, `mockScoreBenchmarkStates`)

---

## Package README Conformance

**File:** `packages/features/business-development/README.md`

Verify README contains:

- score benchmark overview
- quick-start setup
- aggregation/filter architecture summary
- exports table
- boundary rules
- links to SF19 master, T09, ADR-0108, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0108](architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md) | BD Score Benchmark Ghost Overlay | Accepted | 2026-03-11 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update section 2 with:

- SF19 plan-family row
- ADR-0108 row linkage
- optional doc rows (if authored in same pass):
  - `docs/how-to/developer/bd-score-benchmark-adoption-guide.md`
  - `docs/reference/bd-score-benchmark/api.md`
- next unreserved ADR number after ADR-0108 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/features-business-development...
pnpm turbo run lint --filter @hbc/features-business-development...
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development test --coverage

# Boundary checks
rg -n "from 'apps/" packages/features/business-development/src
rg -n "raw.*outcome|pursuitId" packages/features/business-development/src/score-benchmark

# Documentation checks
test -f docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md
test -f docs/how-to/developer/bd-score-benchmark-adoption-guide.md
test -f docs/reference/bd-score-benchmark/api.md
test -f packages/features/business-development/README.md
```

---

## Blueprint Progress Comment

Append to `SF19-BD-Score-Benchmark.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF19 completed: {DATE}
T01-T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md
Documentation added:
  - docs/how-to/developer/bd-score-benchmark-adoption-guide.md
  - docs/reference/bd-score-benchmark/api.md
  - packages/features/business-development/README.md
docs/README.md ADR index updated: ADR-0108 row appended.
current-state-map.md section 2 updated with SF19 and ADR-0108 rows.
-->
```

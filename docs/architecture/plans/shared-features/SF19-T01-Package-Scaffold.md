# SF19-T01 - Package Scaffold: SF19 adapter + `@hbc/score-benchmark` primitive

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01, L-03, L-04, L-06, L-07, L-08, L-09, L-10
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF19 master plan

> **Doc Classification:** Canonical Normative Plan - SF19-T01 scaffold task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define scaffold boundaries for Tier-1 primitive `@hbc/score-benchmark` and the BD adapter in `@hbc/features-business-development`, including decision-support submodules (confidence, similarity, recommendation, governance, explainability, recalibration).

---

## Required Files

```text
packages/score-benchmark/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/types/index.ts
|- src/model/index.ts
|- src/model/confidence/
|- src/model/similarity/
|- src/model/recommendation/
|- src/model/governance/
|- src/model/recalibration/
|- src/model/explainability/
|- src/api/index.ts
|- src/hooks/index.ts
|- src/components/index.ts
|- testing/index.ts

packages/features/business-development/
|- src/score-benchmark/index.ts
|- src/score-benchmark/profiles/index.ts
|- src/score-benchmark/adapters/index.ts
|- src/score-benchmark/hooks/index.ts
|- src/score-benchmark/components/index.ts
|- src/score-benchmark/components/SimilarPursuitsPanel.tsx
|- src/score-benchmark/components/BenchmarkExplainabilityPanel.tsx
|- src/score-benchmark/components/ReviewerConsensusPanel.tsx
|- testing/createMockScoreBenchmarkProfile.ts
```

---

## Package Contract Requirements

- primitive package name is `@hbc/score-benchmark`
- BD package consumes primitive public exports only
- primitive export map includes runtime `./` and testing `./testing`
- testing exports are excluded from production bundle
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive and adapter check-types/build/test targets
- scaffold must isolate governance and recalibration modules from adapter UI composition logic

---

## README Requirements

**Primitive file:** `packages/score-benchmark/README.md`

Must include:
1. benchmark primitive overview and cross-module usage
2. confidence/similarity/recommendation ownership model
3. filter-governance and anti-shopping guardrail model
4. offline model (cache/IndexedDB/sync) and provenance model
5. decision-quality telemetry contract summary
6. exports table
7. architecture boundary rules
8. testing entrypoint guidance (`@hbc/score-benchmark/testing`)
9. links to SF19 master, SF19-T09, ADR-0108, and companion primitive ADR

**Adapter file:** `packages/features/business-development/README.md`

Must include:
1. BD score benchmark adapter overview
2. profile defaults and recommendation copy/composition points
3. complexity behavior summary including side-panel surfaces
4. linkbacks to primitive docs and SF19 plan family

---

## Verification Commands

```bash
pnpm --filter @hbc/score-benchmark check-types
pnpm --filter @hbc/score-benchmark build
pnpm --filter @hbc/score-benchmark test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development test -- score-benchmark
```

# SF19-T01 - Package Scaffold: SF19 adapter + `@hbc/score-benchmark` primitive

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01, L-03, L-04, L-06
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** SF19 master plan

> **Doc Classification:** Canonical Normative Plan - SF19-T01 scaffold task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define the SF19 scaffolding split between the Tier-1 primitive `@hbc/score-benchmark` and the BD adapter in `@hbc/features-business-development`, with dual exports, strict coverage gates, and required README structure.

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

---

## README Requirements

**Primitive file:** `packages/score-benchmark/README.md`

Must include:
1. benchmark primitive overview and cross-module usage
2. offline model (cache/IndexedDB/sync) and provenance model
3. KPI contract summary and status/threshold guidance
4. exports table
5. architecture boundary rules
6. testing entrypoint guidance (`@hbc/score-benchmark/testing`)
7. links to SF19 master, SF19-T09, ADR-0103 and companion primitive ADR

**Adapter file:** `packages/features/business-development/README.md`

Must include:
1. BD score benchmark adapter overview
2. profile defaults and composition points
3. complexity behavior summary
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

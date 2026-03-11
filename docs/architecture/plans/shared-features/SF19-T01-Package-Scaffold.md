# SF19-T01 - Package Scaffold: `@hbc/features-business-development` (Score Benchmark)

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-01, D-09, D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF19 master plan

> **Doc Classification:** Canonical Normative Plan - SF19-T01 scaffold task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define the SF19 scaffold in `@hbc/features-business-development` with dual exports, strict coverage gates, and mandatory README structure.

---

## Required Files

```text
packages/features/business-development/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/score-benchmark/index.ts
|- src/score-benchmark/types/index.ts
|- src/score-benchmark/model/index.ts
|- src/score-benchmark/api/index.ts
|- src/score-benchmark/hooks/index.ts
|- src/score-benchmark/components/index.ts
|- testing/index.ts
|- src/__tests__/setup.ts
```

---

## Package Contract Requirements

- package name remains `@hbc/features-business-development`
- export map includes runtime `./` and testing `./testing`
- testing exports are excluded from production bundle
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include score-benchmark check-types/build/test targets

---

## README Requirement (Mandatory in T01)

**File:** `packages/features/business-development/README.md`

Must include:

1. score benchmark ghost overlay overview
2. quick-start consumption in BD scorecard flows
3. benchmark aggregation and filter architecture summary
4. exports table
5. architecture boundary rules
6. testing entrypoint guidance (`@hbc/features-business-development/testing`)
7. links to SF19 master, SF19-T09, ADR-0108 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development build
pnpm --filter @hbc/features-business-development test --coverage
test -f packages/features/business-development/README.md
```

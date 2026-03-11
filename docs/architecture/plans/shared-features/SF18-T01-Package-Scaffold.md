# SF18-T01 - Package Scaffold: `@hbc/features-estimating` (Bid Readiness)

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-01, D-09, D-10
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** SF18 master plan

> **Doc Classification:** Canonical Normative Plan - SF18-T01 scaffold task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define the bid-readiness scaffold in `@hbc/features-estimating` with dual runtime/testing exports, strict coverage thresholds, and mandatory README requirements.

---

## Required Files

```text
packages/features/estimating/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/bid-readiness/index.ts
|- src/bid-readiness/types/index.ts
|- src/bid-readiness/model/index.ts
|- src/bid-readiness/config/index.ts
|- src/bid-readiness/hooks/index.ts
|- src/bid-readiness/components/index.ts
|- src/bid-readiness/api/index.ts
|- testing/index.ts
|- src/__tests__/setup.ts
```

---

## Package Contract Requirements

- package name remains `@hbc/features-estimating`
- export map includes runtime `./` and testing `./testing`
- testing exports are isolated from production bundle output
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include bid-readiness typecheck/build/test surfaces

---

## README Requirement (Mandatory in T01)

**File:** `packages/features/estimating/README.md`

Must include:

1. bid-readiness overview and business outcome
2. quick-start consumption for estimating routes
3. readiness model and configuration architecture summary
4. exported hooks/components/types table
5. architecture boundary rules
6. testing entrypoint guidance (`@hbc/features-estimating/testing`)
7. links to SF18 master, SF18-T09, ADR-0107 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating build
pnpm --filter @hbc/features-estimating test --coverage
test -f packages/features/estimating/README.md
```

# SF22-T01 - Package Scaffold: `@hbc/post-bid-autopsy` primitive + SF22 adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** L-01, L-03, L-04, L-06
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** SF22 master plan

> **Doc Classification:** Canonical Normative Plan - SF22-T01 scaffold task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define SF22 scaffolding across `@hbc/post-bid-autopsy` and the BD/Estimating adapter surfaces with dual runtime/testing exports, coverage gates, and README requirements.

---

## Required Files

```text
packages/post-bid-autopsy/
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

packages/features/business-development/src/post-bid-learning/
|- index.ts
|- profiles/index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts

packages/features/estimating/src/post-bid-learning/
|- index.ts
|- profiles/index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts
```

---

## Package Contract Requirements

- primitive package name is `@hbc/post-bid-autopsy`
- adapters consume primitive public exports only
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive and adapter check-types/build/test targets

---

## README Requirement (Mandatory in T01)

Must include:
1. post-bid autopsy flywheel overview
2. adapter-over-primitive boundary rules
3. trigger/SLA + offline replay model summary
4. exports table
5. testing entrypoint guidance (`@hbc/post-bid-autopsy/testing`)
6. links to SF22 master, SF22-T09, ADR-0111 and companion primitive ADR

---

## Verification Commands

```bash
pnpm --filter @hbc/post-bid-autopsy check-types
pnpm --filter @hbc/post-bid-autopsy build
pnpm --filter @hbc/post-bid-autopsy test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```

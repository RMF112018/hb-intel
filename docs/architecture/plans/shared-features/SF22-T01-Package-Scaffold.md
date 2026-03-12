# SF22-T01 - Package Scaffold: `@hbc/post-bid-autopsy` primitive + SF22 adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-01, L-03, L-04, L-06, L-07, L-08, L-10, L-12, L-14
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF22 master plan

> **Doc Classification:** Canonical Normative Plan - SF22-T01 scaffold task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define SF22 scaffolding across `@hbc/post-bid-autopsy` and BD/Estimating adapter surfaces with explicit module boundaries for evidence/confidence/taxonomy/governance/publication/telemetry.

---

## Required Files

```text
packages/post-bid-autopsy/
|- src/index.ts
|- src/types/index.ts
|- src/model/index.ts
|- src/model/evidence/index.ts
|- src/model/confidence/index.ts
|- src/model/taxonomy/index.ts
|- src/model/governance/index.ts
|- src/model/publication/index.ts
|- src/api/index.ts
|- src/hooks/index.ts
|- src/components/index.ts
|- src/telemetry/index.ts
|- testing/index.ts

packages/features/business-development/src/post-bid-learning/
packages/features/estimating/src/post-bid-learning/
|- index.ts
|- profiles/index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts
|- telemetry/index.ts
```

---

## Package Contract Requirements

- primitive package name is `@hbc/post-bid-autopsy`
- adapters consume primitive public exports only
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95`
- scripts include primitive and adapter check-types/build/test targets
- scaffold boundaries must prevent UI-layer reimplementation of lifecycle/governance engines

---

## README Requirement (Mandatory in T01)

Must include:
1. post-bid intelligence flywheel overview
2. adapter-over-primitive boundary rules
3. evidence/confidence/taxonomy/governance model summary
4. lifecycle/publication gating summary
5. exports table
6. testing entrypoint guidance (`@hbc/post-bid-autopsy/testing`)
7. links to SF22 master, SF22-T09, ADR-0112 and companion primitive ADR

---

## Verification Commands

```bash
pnpm --filter @hbc/post-bid-autopsy check-types
pnpm --filter @hbc/post-bid-autopsy build
pnpm --filter @hbc/post-bid-autopsy test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```

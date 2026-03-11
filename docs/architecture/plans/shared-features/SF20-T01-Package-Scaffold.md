# SF20-T01 - Package Scaffold: SF20 adapter + `@hbc/strategic-intelligence` primitive

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01, L-03, L-04, L-06
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** SF20 master plan

> **Doc Classification:** Canonical Normative Plan - SF20-T01 scaffold task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define SF20 scaffolding split between primitive `@hbc/strategic-intelligence` and BD adapter `@hbc/features-business-development`, with runtime/testing exports and coverage gates.

---

## Required Files

```text
packages/strategic-intelligence/
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
|- src/strategic-intelligence/index.ts
|- src/strategic-intelligence/profiles/index.ts
|- src/strategic-intelligence/adapters/index.ts
|- src/strategic-intelligence/hooks/index.ts
|- src/strategic-intelligence/components/index.ts
|- testing/createMockStrategicIntelligenceProfile.ts
```

---

## Package Contract Requirements

- primitive package name is `@hbc/strategic-intelligence`
- BD adapter consumes primitive public exports only
- testing exports excluded from production bundle
- coverage thresholds are `95/95/95/95`
- scripts include primitive and adapter check-types/build/test targets

---

## README Requirements

Primitive README must include:
1. strategic-intelligence primitive overview
2. offline model and provenance/snapshot model
3. KPI schema summary and operational indicator notes
4. exports table and boundaries
5. testing guidance (`@hbc/strategic-intelligence/testing`)
6. links to SF20 master, T09, ADR-0105 and companion ADR

Adapter README must include:
1. SF20 BD adapter usage across BD/Estimating/Project Hub
2. complexity behavior summary
3. profile and projection contracts
4. links to primitive contracts and SF20 plan family

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence check-types
pnpm --filter @hbc/strategic-intelligence build
pnpm --filter @hbc/strategic-intelligence test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development test -- strategic-intelligence
```

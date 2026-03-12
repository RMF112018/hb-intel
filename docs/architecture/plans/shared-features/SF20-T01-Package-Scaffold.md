# SF20-T01 - Package Scaffold: SF20 adapter + `@hbc/strategic-intelligence` primitive

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01, L-02, L-03, L-05, L-06, L-08, L-09, L-10
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** SF20 master plan

> **Doc Classification:** Canonical Normative Plan - SF20-T01 scaffold task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define SF20 scaffolding split between primitive `@hbc/strategic-intelligence` and BD adapter `@hbc/features-business-development`, with runtime/testing exports, coverage gates, and submodule boundaries for trust/workflow/governance/reuse explainability.

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
|- src/model/heritage-snapshot/
|- src/model/living-intelligence/
|- src/model/trust/
|- src/model/commitments/
|- src/model/acknowledgment/
|- src/model/sensitivity/
|- src/model/conflict-resolution/
|- src/model/suggestions/
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
|- src/strategic-intelligence/components/HandoffReviewPanel.tsx
|- src/strategic-intelligence/components/CommitmentRegisterPanel.tsx
|- src/strategic-intelligence/components/SuggestedIntelligenceCard.tsx
|- src/strategic-intelligence/components/IntelligenceExplainabilityDrawer.tsx
|- testing/createMockStrategicIntelligenceProfile.ts
```

---

## Package Contract Requirements

- primitive package name is `@hbc/strategic-intelligence`
- BD adapter consumes primitive public exports only
- testing exports excluded from production bundle
- coverage thresholds are `95/95/95/95`
- scripts include primitive and adapter check-types/build/test targets
- trust/workflow/governance modules must remain primitive-owned; adapter code composes view behavior only

---

## README Requirements

Primitive README must include:
1. strategic-intelligence primitive overview
2. Heritage Snapshot vs Living Intelligence contract model
3. trust/reliability/provenance/recency and sensitivity/redaction model
4. handoff acknowledgment + commitment lifecycle model
5. suggestion/explainability contract summary
6. offline model and provenance/snapshot model
7. telemetry schema summary and operational indicator notes
8. exports table and boundaries
9. testing guidance (`@hbc/strategic-intelligence/testing`)
10. links to SF20 master, T09, ADR-0109, and companion ADR

Adapter README must include:
1. SF20 BD adapter usage across BD/Estimating/Project Hub
2. complexity behavior summary
3. profile and projection contracts
4. sensitivity/redaction rendering expectations
5. links to primitive contracts and SF20 plan family

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence check-types
pnpm --filter @hbc/strategic-intelligence build
pnpm --filter @hbc/strategic-intelligence test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development test -- strategic-intelligence
```

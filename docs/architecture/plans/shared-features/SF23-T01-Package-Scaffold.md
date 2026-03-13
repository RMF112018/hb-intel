# SF23-T01 - Package Scaffold: `@hbc/record-form` primitive + SF23 adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01, L-03, L-04, L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF23 master plan

> **Doc Classification:** Canonical Normative Plan - SF23-T01 scaffold task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define scaffolding across `@hbc/record-form` and module adapter surfaces with runtime/testing exports, trust/recovery/review seams, and README boundary requirements that match current package-governance rules.

---

## Required Files

```text
packages/record-form/
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
|- src/adapters/index.ts
|- testing/index.ts

packages/features/business-development/src/record-form/
|- index.ts
|- profiles/index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts

packages/features/estimating/src/record-form/
|- index.ts
|- profiles/index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts
```

Scaffold expectations must leave explicit room for:

- explanation state
- recovery state
- review-step state
- next recommended action derivation
- state-confidence derivation
- replay/conflict diagnostics

---

## Package Contract Requirements

- primitive package name is `@hbc/record-form`
- adapters consume primitive public exports only
- module schemas/rules remain adapter-owned and projection-only
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive and adapter check-types/build/test targets
- runtime/orchestration ownership remains in `@hbc/record-form`
- reusable visual primitives and presentational components belong in `@hbc/ui-kit` per `CLAUDE.md`
- local components in `@hbc/record-form` must remain thin composition shells over runtime state and `@hbc/ui-kit` building blocks

---

## README Requirement (Mandatory in T01)

Must include:

1. shared record authoring runtime overview
2. adapter-over-primitive boundary rules
3. trust-state vocabulary and explainability contract summary
4. recovery/replay and local-vs-server-vs-restored draft model summary
5. next recommended action and review-step semantics summary
6. testing entrypoint guidance (`@hbc/record-form/testing`)
7. links to SF23 master, SF23-T09, ADR-0114 and companion primitive ADR

---

## Export Expectations

Primitive exports must reserve public surface for:

- explanation-state models
- review-step models
- recovery-state models
- sync/trust-state models
- next recommended action selectors
- conflict and replay diagnostics

These exports are required so adapters do not re-invent lifecycle interpretation locally.

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form check-types
pnpm --filter @hbc/record-form build
pnpm --filter @hbc/record-form test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```

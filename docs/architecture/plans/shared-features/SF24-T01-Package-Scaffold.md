# SF24-T01 - Package Scaffold: `@hbc/export-runtime` primitive + SF24 adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01, L-03, L-04, L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF24 master plan

> **Doc Classification:** Canonical Normative Plan - SF24-T01 scaffold task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define scaffolding across `@hbc/export-runtime` and module adapter surfaces with runtime/testing exports, truth/receipt/progress seams, and README boundary requirements that match current package-governance rules.

---

## Required Files

```text
packages/export-runtime/
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
|- src/composers/index.ts
|- src/renderers/index.ts
|- src/templates/index.ts
|- testing/index.ts

packages/features/business-development/src/export-runtime/
|- index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts

packages/features/estimating/src/export-runtime/
|- index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts
```

Scaffold expectations must leave explicit room for:

- export-truth state
- receipt state
- artifact-confidence state
- progress and retry state
- review-step and handoff state
- top recommended export derivation
- restored receipt and stale-artifact diagnostics

---

## Package Contract Requirements

- primitive package name is `@hbc/export-runtime`
- adapters consume primitive public exports only
- module-specific payload composition remains adapter-owned and projection-only
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive and adapter check-types/build/test targets
- runtime/orchestration ownership remains in `@hbc/export-runtime`
- reusable visual primitives and presentational components belong in `@hbc/ui-kit` per `CLAUDE.md`
- local components in `@hbc/export-runtime` must remain thin composition shells over runtime state and `@hbc/ui-kit` building blocks

---

## README Requirement (Mandatory in T01)

Must include:

1. shared export runtime overview
2. adapter-over-primitive boundary rules
3. export-truth vocabulary and explainability contract summary
4. receipt/progress/replay and local-vs-remote-vs-restored receipt model summary
5. top recommended export and review/handoff semantics summary
6. renderer/composer/template export table
7. testing entrypoint guidance (`@hbc/export-runtime/testing`)
8. links to SF24 master, SF24-T09, ADR-0114 and companion primitive ADR

---

## Export Expectations

Primitive exports must reserve public surface for:

- truth/context stamp models
- receipt-state models
- artifact-confidence models
- review-step models
- next recommended export selectors
- retry/failure/restore diagnostics

These exports are required so adapters do not re-invent export lifecycle interpretation locally.

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime check-types
pnpm --filter @hbc/export-runtime build
pnpm --filter @hbc/export-runtime test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```

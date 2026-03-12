# SF24-T01 - Package Scaffold: `@hbc/export-runtime` primitive + SF24 adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01, L-03, L-04, L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF24 master plan

> **Doc Classification:** Canonical Normative Plan - SF24-T01 scaffold task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define scaffolding across `@hbc/export-runtime` and module adapter surfaces with dual runtime/testing exports, coverage gates, and README boundary requirements.

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

---

## Package Contract Requirements

- primitive package name is `@hbc/export-runtime`
- adapters consume primitive public exports only
- module-specific payload composition remains adapter-owned and projection-only
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive and adapter check-types/build/test targets

---

## README Requirement (Mandatory in T01)

Must include:
1. shared export runtime overview
2. adapter-over-primitive boundary rules
3. offline queue/replay + optimistic status model summary
4. renderer/composer/template export table
5. testing entrypoint guidance (`@hbc/export-runtime/testing`)
6. links to SF24 master, SF24-T09, ADR-0108 and companion primitive ADR

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime check-types
pnpm --filter @hbc/export-runtime build
pnpm --filter @hbc/export-runtime test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```


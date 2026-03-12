# SF25-T01 - Package Scaffold: `@hbc/publish-workflow` primitive + SF25 adapters

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-01, L-03, L-04, L-06
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF25 master plan

> **Doc Classification:** Canonical Normative Plan - SF25-T01 scaffold task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Define scaffolding across `@hbc/publish-workflow` and module adapter surfaces with dual runtime/testing exports, coverage gates, and README boundary requirements.

---

## Required Files

```text
packages/publish-workflow/
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
|- src/rules/index.ts
|- src/adapters/index.ts
|- testing/index.ts

packages/features/business-development/src/publish-workflow/
|- index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts

packages/features/estimating/src/publish-workflow/
|- index.ts
|- adapters/index.ts
|- hooks/index.ts
|- components/index.ts
```

---

## Package Contract Requirements

- primitive package name is `@hbc/publish-workflow`
- adapters consume primitive public exports only
- module-specific publication policies remain adapter-owned and projection-only
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive and adapter check-types/build/test targets

---

## README Requirement (Mandatory in T01)

Must include:
1. shared publish workflow runtime overview
2. adapter-over-primitive boundary rules
3. offline queue/replay + optimistic status model summary
4. state machine/readiness rule/approval rule export table
5. testing entrypoint guidance (`@hbc/publish-workflow/testing`)
6. links to SF25 master, SF25-T09, ADR-0109 and companion primitive ADR

---

## Verification Commands

```bash
pnpm --filter @hbc/publish-workflow check-types
pnpm --filter @hbc/publish-workflow build
pnpm --filter @hbc/publish-workflow test --coverage
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-estimating check-types
```


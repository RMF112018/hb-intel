# SF20-T01 - Package Scaffold: `@hbc/features-business-development` (Heritage & Intelligence)

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-01, D-09, D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF20 master plan

> **Doc Classification:** Canonical Normative Plan - SF20-T01 scaffold task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define SF20 scaffold under `@hbc/features-business-development` with dual runtime/testing exports, strict coverage thresholds, and mandatory README requirements.

---

## Required Files

```text
packages/features/business-development/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/heritage-intelligence/index.ts
|- src/heritage-intelligence/types/index.ts
|- src/heritage-intelligence/api/index.ts
|- src/heritage-intelligence/hooks/index.ts
|- src/heritage-intelligence/components/index.ts
|- testing/index.ts
|- src/__tests__/setup.ts
```

---

## Package Contract Requirements

- package name remains `@hbc/features-business-development`
- export map includes runtime `./` and testing `./testing`
- testing entrypoint excluded from production bundle
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include heritage-intelligence check-types/build/test targets

---

## README Requirement (Mandatory in T01)

**File:** `packages/features/business-development/README.md`

Must include:

1. BD heritage and strategic intelligence overview
2. quick-start usage across BD/Estimating/Project Hub surfaces
3. data source + approval workflow architecture summary
4. exports table
5. architecture boundary rules
6. testing entrypoint guidance (`@hbc/features-business-development/testing`)
7. links to SF20 master, SF20-T09, ADR-0109 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development build
pnpm --filter @hbc/features-business-development test --coverage
test -f packages/features/business-development/README.md
```

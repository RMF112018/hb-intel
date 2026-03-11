# SF21-T01 - Package Scaffold: `@hbc/features-project-hub` (Project Health Pulse)

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-01, D-09, D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF21 master plan

> **Doc Classification:** Canonical Normative Plan - SF21-T01 scaffold task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define SF21 scaffold under `@hbc/features-project-hub` with dual runtime/testing exports, strict coverage thresholds, and mandatory README requirements.

---

## Required Files

```text
packages/features/project-hub/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/health-pulse/index.ts
|- src/health-pulse/types/index.ts
|- src/health-pulse/computors/index.ts
|- src/health-pulse/api/index.ts
|- src/health-pulse/hooks/index.ts
|- src/health-pulse/components/index.ts
|- testing/index.ts
|- src/__tests__/setup.ts
```

---

## Package Contract Requirements

- package name remains `@hbc/features-project-hub`
- export map includes runtime `./` and testing `./testing`
- testing entrypoint excluded from production bundle
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include health-pulse check-types/build/test targets

---

## README Requirement (Mandatory in T01)

**File:** `packages/features/project-hub/README.md`

Must include:

1. project health pulse overview and value proposition
2. quick-start usage in project and portfolio surfaces
3. computation and admin-config architecture summary
4. exports table
5. architecture boundary rules
6. testing entrypoint guidance (`@hbc/features-project-hub/testing`)
7. links to SF21 master, SF21-T09, ADR-0110 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub check-types
pnpm --filter @hbc/features-project-hub build
pnpm --filter @hbc/features-project-hub test --coverage
test -f packages/features/project-hub/README.md
```

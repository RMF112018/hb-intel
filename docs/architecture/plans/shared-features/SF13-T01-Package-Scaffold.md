# SF13-T01 — Package Scaffold: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-01, D-07, D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF13 master plan

> **Doc Classification:** Canonical Normative Plan — SF13-T01 scaffold task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Create `@hbc/project-canvas` package scaffold with runtime/testing exports, strict coverage gates, and mandatory README scaffold.

---

## Required Files

```text
packages/project-canvas/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/index.ts
├── src/types/index.ts
├── src/constants/index.ts
├── src/registry/index.ts
├── src/api/index.ts
├── src/hooks/index.ts
├── src/components/index.ts
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## Package Requirements

- Name: `@hbc/project-canvas`
- Exports: `"."`, `"./testing"`
- DnD dependency: `@dnd-kit/core`
- `sideEffects: false`
- Coverage thresholds: lines/branches/functions/statements all `95`

---

## README Requirement (Mandatory in T01)

**File:** `packages/project-canvas/README.md`

Must include:

1. Overview + role-based canvas model
2. Quick start usage
3. Role-default and locking model summary
4. Tile registry and editor model summary
5. Exports table
6. Architecture boundaries
7. Links to SF13 master/T09 and ADR-0102 path

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas check-types
pnpm --filter @hbc/project-canvas build
pnpm --filter @hbc/project-canvas test --coverage
test -f packages/project-canvas/README.md
```

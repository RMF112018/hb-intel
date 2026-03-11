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
├── src/hooks/useCanvasRecommendations.ts
├── src/components/index.ts
├── src/components/AIInsightTile.tsx
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
- Tile registry contract supports Essential/Standard/Expert lazy variants per tile
- AI tile extension point scaffolded through `AIInsightTile` container

---

## README Requirement (Mandatory in T01)

**File:** `packages/project-canvas/README.md`

Must include:

1. Overview + role-based canvas model
2. Quick start usage
3. Role-default and locking model summary
4. Smart defaulting behavior driven by Project Health Pulse
5. Mandatory governance tier + one-click “Apply to all projects” behavior
6. Tile registry/editor model summary including dynamic recommendation ordering
7. Data-source badge model (`Live`/`Manual`/`Hybrid`) and notification-summary intelligent hub
8. AIInsightTile container registration model
9. Exports table
10. Architecture boundaries
11. Links to SF13 master/T09 and ADR-0102 path

---

## Verification Commands

```bash
pnpm --filter @hbc/project-canvas check-types
pnpm --filter @hbc/project-canvas build
pnpm --filter @hbc/project-canvas test --coverage
test -f packages/project-canvas/README.md
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF13-T01 completed: 2026-03-11
- Created 30 new files in packages/project-canvas/ (package.json, tsconfig.json, tsconfig.build.json, vitest.config.ts, setup.ts, types, constants, registry, api, hooks, components, testing factories, README)
- Updated tsconfig.base.json with @hbc/project-canvas path mappings
- All verification gates passed: check-types (0 errors), build (0 errors), test (passWithNoTests), README exists
- Monorepo gates passed: pnpm turbo run build (37/37), pnpm turbo run check-types (50/50)
- Follows @hbc/session-state (SF12) patterns exactly: dual exports, ESM .js extensions, v8 coverage 95%, Partial<T> testing factories
Next: SF13-T02 (TypeScript Contracts — full type implementation)
-->

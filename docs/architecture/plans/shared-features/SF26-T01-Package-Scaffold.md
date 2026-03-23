# SF26-T01 - Package Scaffold: `@hbc/saved-views`

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-01, L-04, L-06
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF26 master plan

> **Doc Classification:** Canonical Normative Plan — SF26-T01 scaffold task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define scaffolding for `@hbc/saved-views` with persistence/runtime/testing exports, compatibility and scope seams, and README boundary requirements aligned to current package-governance rules and the `@hbc/ui-kit` visual ownership rule.

---

## Required Files

```text
packages/saved-views/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/types/index.ts
|- src/model/index.ts
|- src/storage/index.ts
|- src/hooks/index.ts
|- src/adapters/index.ts
|- src/telemetry/index.ts
|- testing/index.ts
```

Scaffold expectations must leave explicit room for:

- scope ownership and permission models
- schema versioning and compatibility metadata
- reconciliation state and user-facing explanation
- module adapter seam (`ISavedViewStateMapper<TState>`)
- co-dependency surface for export and bulk-actions handoff
- SharePoint MVP persistence and Azure migration seam

---

## Package Contract Requirements

- package name is `@hbc/saved-views`
- module adapters consume primitive public exports only via `ISavedViewStateMapper<TState>`
- module schemas, column keys, and filter field definitions remain module-owned and adapter-projected
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include `check-types`, `build`, and `test` targets
- runtime and persistence ownership remain in `@hbc/saved-views`
- reusable visual primitives and presentational surfaces belong in `@hbc/ui-kit` per `CLAUDE.md`
- local components in `@hbc/saved-views` must remain thin composition shells over runtime state and `@hbc/ui-kit` building blocks

---

## README Requirement (Mandatory in T01)

Must include:

1. shared workspace-state persistence runtime overview
2. scope model summary — personal/team/role/system ownership and permission rules
3. `ISavedViewStateMapper<TState>` module adapter boundary rules
4. schema compatibility and reconciliation contract summary
5. co-dependency surface — export-runtime and bulk-actions handoff
6. testing entrypoint guidance (`@hbc/saved-views/testing`)
7. links to SF26 master plan, SF26-T09, and ADR-0116

---

## Export Expectations

Public surface must reserve exports for:

- `ISavedViewDefinition`, `ISavedViewStateMapper<TState>`, `SavedViewScope`
- `IFilterClause`, `ISortDefinition`, `IGroupDefinition`, `IViewPresentationState`
- scope permission helpers
- compatibility metadata and reconciliation result types
- lifecycle action types (save, apply, default, share, delete)
- telemetry event types

These exports are required so module adapters do not re-invent scope, compatibility, or lifecycle logic locally.

---

## Verification Commands

```bash
pnpm --filter @hbc/saved-views check-types
pnpm --filter @hbc/saved-views build
pnpm --filter @hbc/saved-views test --coverage
```

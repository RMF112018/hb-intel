# SF26-T07 - Reference Integrations: Export Runtime, Bulk Actions, Complexity, Auth, and TanStack Table Mapper

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-05, L-06
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF26-T04

> **Doc Classification:** Canonical Normative Plan — SF26-T07 reference integrations task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define the integration contracts between `@hbc/saved-views` and its four Tier-1 and Tier-2 consumers: `@hbc/export-runtime` (SF-24), `@hbc/bulk-actions` (SF-27), `@hbc/complexity`, and `@hbc/auth`. Also defines the first-class TanStack Table state mapper.

---

## Export Runtime Integration (SF-24)

`@hbc/export-runtime` receives the active `ISavedViewContext` as an export context parameter. This allows the exported artifact to reflect the current column set, sort order, and filter state without requiring the export package to hold a reference to saved-views internals.

```typescript
// In @hbc/export-runtime:
interface IExportRequest {
  // ... existing fields ...
  savedViewContext?: ISavedViewContext; // active view state injected by the module surface
}
```

Integration requirements:

- the module surface is responsible for passing `activeViewContext` from `useSavedViews` into the export request
- `@hbc/export-runtime` uses `savedViewContext.activePresentation.visibleColumnKeys` to filter exported columns when present
- `@hbc/export-runtime` uses `savedViewContext.activeFilterClauses` for export scope labeling (e.g., "Exported with active filters: Owner = Smith")
- `@hbc/saved-views` does not depend on `@hbc/export-runtime`; the dependency is one-directional

---

## Bulk Actions Integration (SF-27)

`@hbc/bulk-actions` receives the active `ISavedViewContext` to understand which data subset the user is working in when a bulk action is initiated.

```typescript
// In @hbc/bulk-actions:
interface IBulkActionExecutionContext {
  // ... existing fields ...
  savedViewContext?: ISavedViewContext; // active view state injected by the module surface
}
```

Integration requirements:

- the module surface is responsible for passing `activeViewContext` from `useSavedViews` into the bulk action invocation
- `@hbc/bulk-actions` may use `savedViewContext.activeFilterClauses` to scope eligibility checks
- `@hbc/saved-views` does not depend on `@hbc/bulk-actions`; the dependency is one-directional
- SF-26 and SF-27 are scaffolded together in Phase 3 Stage 5.4/5.6 to establish this handoff contract early

---

## Complexity Integration (`@hbc/complexity`)

`@hbc/saved-views` uses the current complexity level to provide role-appropriate default views.

```typescript
/** Resolved at view load time; not re-evaluated during a session unless complexity level changes */
interface IComplexityViewDefault {
  complexityLevel: 'essential' | 'standard' | 'expert';
  defaultViewId: string | undefined;
}
```

- when no personal default exists, the complexity level is used to select a role-scoped view that matches the user's current rendering mode
- this allows a user in Essential mode to receive a simplified column set by default without manual configuration

---

## Auth Integration (`@hbc/auth`)

All scope permission checks delegate to `@hbc/auth`. `@hbc/saved-views` does not evaluate role or team membership directly.

```typescript
// Auth capability keys resolved via @hbc/auth:
// 'saved-views:write:team'
// 'saved-views:write:role'
// 'saved-views:write:system'
```

The `ISavedViewScopePermissions` shape (defined in T02) is populated by the hook layer by calling `@hbc/auth` capability checks at load time.

---

## TanStack Table State Mapper

The first-class module adapter for TanStack Table state. Implements `ISavedViewStateMapper<TanStackTableState>` where `TanStackTableState` is the normalized cross-module table state type.

```typescript
import type { ISavedViewStateMapper, ISavedViewDefinition, ISavedViewSchemaDescriptor } from '@hbc/saved-views';

export function createTanStackTableMapper(
  moduleKey: string,
  workspaceKey: string,
  schema: ISavedViewSchemaDescriptor
): ISavedViewStateMapper<TanStackTableState> {
  return {
    serialize(state) { /* map TanStack column visibility, sorting, grouping, filtering to ISavedViewDefinition shape */ },
    deserialize(view) { /* map ISavedViewDefinition back to TanStack state */ },
    currentSchemaVersion() { return schema.schemaVersion; },
    currentSchema() { return schema; },
  };
}
```

This mapper ships with `@hbc/saved-views` as the canonical TanStack Table integration path. Modules using TanStack Table must use or extend this mapper rather than writing their own serialization logic.

---

## Integration Boundary Summary

| Consumer | Dependency Direction | Handoff Mechanism |
|---|---|---|
| `@hbc/export-runtime` | export → saved-views (one-way) | `ISavedViewContext` passed via `IExportRequest.savedViewContext` |
| `@hbc/bulk-actions` | bulk-actions → saved-views (one-way) | `ISavedViewContext` passed via `IBulkActionExecutionContext.savedViewContext` |
| `@hbc/complexity` | saved-views → complexity (one-way) | Complexity level read to select default view at load time |
| `@hbc/auth` | saved-views → auth (one-way) | Scope permissions resolved via capability checks |

`@hbc/saved-views` does not take a runtime dependency on `@hbc/export-runtime` or `@hbc/bulk-actions`. The handoff is achieved through the shared `ISavedViewContext` type.

---

## Verification Commands

```bash
pnpm --filter @hbc/saved-views check-types
pnpm --filter @hbc/saved-views test --coverage
pnpm --filter @hbc/export-runtime check-types
pnpm --filter @hbc/bulk-actions check-types
```

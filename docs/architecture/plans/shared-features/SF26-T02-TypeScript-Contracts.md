# SF26-T02 - TypeScript Contracts: View Model, Scope, Compatibility, and Co-dependency Surface

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-01, L-02, L-03, L-04, L-05
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF26-T01

> **Doc Classification:** Canonical Normative Plan — SF26-T02 contracts task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define the canonical TypeScript contracts for saved-view definitions, scope ownership, schema compatibility metadata, module adapter interface, and the co-dependency surface types that allow export and bulk-action packages to consume active view state.

---

## Core View Contracts

```typescript
export type SavedViewScope = 'personal' | 'team' | 'role' | 'system';

export interface IFilterClause {
  field: string;
  operator:
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'in'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'between'
    | 'is-empty'
    | 'is-not-empty';
  value?: unknown;
}

export interface ISortDefinition {
  field: string;
  direction: 'asc' | 'desc';
}

export interface IGroupDefinition {
  field: string;
}

export interface IViewPresentationState {
  density?: 'compact' | 'standard' | 'comfortable';
  visibleColumnKeys?: string[];
  columnOrder?: string[];
}

export interface ISavedViewDefinition {
  viewId: string;
  moduleKey: string;
  workspaceKey: string;
  title: string;
  description?: string;
  scope: SavedViewScope;
  ownerUserId?: string;
  filterClauses: IFilterClause[];
  sortBy: ISortDefinition[];
  groupBy: IGroupDefinition[];
  presentation: IViewPresentationState;
  isDefault?: boolean;
  schemaVersion: number;
  createdAtIso: string;
  updatedAtIso: string;
}
```

---

## Module Adapter Contract

```typescript
export interface ISavedViewStateMapper<TState> {
  /** Serialize current workspace state into a storable view definition shape. */
  serialize(state: TState): Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>;

  /** Restore workspace state from a stored view definition. */
  deserialize(view: ISavedViewDefinition): TState;

  /**
   * Provide the current schema version for this module's workspace.
   * Used during compatibility checks to detect drift since the view was saved.
   */
  currentSchemaVersion(): number;

  /**
   * Declare which column keys, filter fields, and grouping fields are currently
   * valid. Used by compatibility reconciliation to identify removed or renamed fields.
   */
  currentSchema(): ISavedViewSchemaDescriptor;
}

export interface ISavedViewSchemaDescriptor {
  moduleKey: string;
  workspaceKey: string;
  validColumnKeys: string[];
  validFilterFields: string[];
  validGroupFields: string[];
  schemaVersion: number;
}
```

---

## Schema Compatibility Contracts

```typescript
export type SavedViewCompatibilityStatus =
  | 'compatible'
  | 'degraded-compatible'
  | 'incompatible';

export interface ISavedViewCompatibilityResult {
  status: SavedViewCompatibilityStatus;
  removedColumns: string[];
  removedFilterFields: string[];
  removedGroupFields: string[];
  fallbackApplied: boolean;
  userExplanation: string;
}
```

`degraded-compatible` means the view can be applied with some fields removed; the reconciled state is presented to the user with the `ViewCompatibilityBanner` before applying.
`incompatible` means the view cannot be applied without losing so much information that applying would be misleading; the user must reset or rebuild.

---

## Scope Permission Contract

```typescript
export interface ISavedViewScopePermissions {
  canSavePersonal: boolean;
  canSaveTeam: boolean;
  canSaveRole: boolean;
  canSaveSystem: boolean;
  teamIds: string[];
  roleIds: string[];
}

export interface ISavedViewOwnershipCheck {
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
}
```

Scope permission evaluation is auth-delegated; `@hbc/saved-views` calls `@hbc/auth` for capability resolution and does not hard-code permission logic.

---

## Co-dependency Surface Types

These types are the handoff surface for SF-24 export and SF-27 bulk actions. Both consumers receive a snapshot of the active view state; neither holds a live reference into saved-views internals.

```typescript
/** Exported by @hbc/saved-views; consumed by @hbc/export-runtime and @hbc/bulk-actions */
export interface ISavedViewContext {
  activeViewId: string | undefined;
  activeViewTitle: string | undefined;
  activeFilterClauses: IFilterClause[];
  activeSortBy: ISortDefinition[];
  activeGroupBy: IGroupDefinition[];
  activePresentation: IViewPresentationState;
  moduleKey: string;
  workspaceKey: string;
}
```

---

## Lifecycle Action Types

```typescript
export type SavedViewAction =
  | { type: 'apply'; viewId: string }
  | { type: 'save'; patch: Partial<ISavedViewDefinition> }
  | { type: 'save-as-new'; definition: Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'> }
  | { type: 'set-default'; viewId: string }
  | { type: 'clear-default'; moduleKey: string; workspaceKey: string }
  | { type: 'delete'; viewId: string }
  | { type: 'duplicate'; viewId: string; newTitle: string }
  | { type: 'share'; viewId: string; targetScope: 'team' | 'role' | 'system' };
```

---

## Verification Commands

```bash
pnpm --filter @hbc/saved-views check-types
pnpm --filter @hbc/saved-views test --coverage
```

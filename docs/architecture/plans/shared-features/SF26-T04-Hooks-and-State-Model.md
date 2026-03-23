# SF26-T04 - Hooks and State Model: `useSavedViews`, `useViewCompatibility`, and `useWorkspaceStateMapper`

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-01, L-02, L-03, L-04, L-05
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** SF26-T03

> **Doc Classification:** Canonical Normative Plan — SF26-T04 hooks and state task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define the three primary hooks that expose saved-view lifecycle, schema compatibility, and module adapter state to consuming surfaces — including the `ISavedViewContext` handoff shape used by bulk actions and export runtime.

---

## `useSavedViews`

Primary lifecycle hook. Owns load, apply, save, set-default, share, delete, and duplicate operations for a given module workspace.

```typescript
interface UseSavedViewsOptions {
  moduleKey: string;
  workspaceKey: string;
  adapter: ISavedViewsStorageAdapter;
  permissions: ISavedViewScopePermissions;
}

interface UseSavedViewsResult {
  views: ISavedViewDefinition[];
  activeView: ISavedViewDefinition | undefined;
  defaultView: ISavedViewDefinition | undefined;
  isLoading: boolean;
  error: string | undefined;

  applyView(viewId: string): void;
  saveCurrentView(patch: Partial<ISavedViewDefinition>): Promise<void>;
  saveAsNew(definition: Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>): Promise<void>;
  setDefault(viewId: string): Promise<void>;
  clearDefault(): Promise<void>;
  deleteView(viewId: string): Promise<void>;
  duplicateView(viewId: string, newTitle: string): Promise<void>;

  /** Snapshot of active view state for export and bulk-actions co-dependency handoff. */
  activeViewContext: ISavedViewContext;
}
```

### Derived State

- `activeView` — the view with `viewId` matching the currently applied view; `undefined` if workspace is in unsaved state
- `defaultView` — the view marked `isDefault: true` for the current user and workspace; falls through personal → role → system scope order
- `activeViewContext` — a snapshot of active filter, sort, group, and presentation state projected into the `ISavedViewContext` shape; updated on every apply or workspace state change

---

## `useViewCompatibility`

Compatibility check hook. Runs reconciliation when a view is about to be applied.

```typescript
interface UseViewCompatibilityOptions {
  view: ISavedViewDefinition;
  mapper: ISavedViewStateMapper<unknown>;
}

interface UseViewCompatibilityResult {
  isChecking: boolean;
  result: ISavedViewCompatibilityResult | undefined;
  canApply: boolean;
  requiresUserConfirmation: boolean;
}
```

- `canApply` is `true` for `compatible` and `degraded-compatible` results; `false` for `incompatible`
- `requiresUserConfirmation` is `true` when status is `degraded-compatible` — the `ViewCompatibilityBanner` must be rendered before the workspace state changes

---

## `useWorkspaceStateMapper`

Adapter composition hook. Connects a module's `ISavedViewStateMapper<TState>` to the hooks layer, providing a stable serialization/deserialization interface for the save and apply flows.

```typescript
interface UseWorkspaceStateMapperOptions<TState> {
  mapper: ISavedViewStateMapper<TState>;
  currentState: TState;
}

interface UseWorkspaceStateMapperResult<TState> {
  serialized: Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>;
  deserialize(view: ISavedViewDefinition): TState;
  currentSchemaVersion: number;
  currentSchema: ISavedViewSchemaDescriptor;
}
```

---

## Unsaved-Changes Tracking

The hooks layer must track whether the current workspace state differs from the active view's persisted state.

- `hasUnsavedChanges: boolean` — derived from comparing `serialized` output of current workspace state to the active view's persisted definition
- surfaces must expose this signal so the save button remains discoverable when the user has modified the workspace

---

## Active View Context for Co-dependencies

`activeViewContext` is the stable snapshot exported to SF-24 (Export Runtime) and SF-27 (Bulk Actions). Consumers receive this value as a prop or context injection; they do not hold a reference to the saved-views hook directly. This keeps the co-dependency surface narrow and testable.

---

## Verification Commands

```bash
pnpm --filter @hbc/saved-views check-types
pnpm --filter @hbc/saved-views test --coverage
```

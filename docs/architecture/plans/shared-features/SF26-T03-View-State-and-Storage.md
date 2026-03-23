# SF26-T03 - View State and Storage: Lifecycle, SharePoint MVP, Schema Versioning, and Reconciliation

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-01, L-02, L-03, L-04
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF26-T02

> **Doc Classification:** Canonical Normative Plan — SF26-T03 state and storage task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define view lifecycle semantics, SharePoint-backed MVP persistence, schema versioning strategy, and compatibility reconciliation logic — including the user-visible explanation contract for degraded and incompatible views.

---

## View Lifecycle States

| State | Description |
|---|---|
| `active` | view is loaded and applied to the workspace |
| `default` | view is the module/workspace default for this user or scope |
| `saved` | view is persisted; not currently active |
| `unsaved-changes` | active view has local changes not yet persisted |
| `degraded-compatible` | applied with one or more fields removed; `ViewCompatibilityBanner` shown |
| `incompatible` | cannot be applied without misleading state loss; requires user action |
| `pending-share` | share action submitted; awaiting server confirmation |
| `deleted` | view has been removed; no longer available for apply |

---

## Storage Architecture (MVP)

### SharePoint Persistence Path

- saved views are persisted as SharePoint list items within a module-specific list
- each item stores a serialized `ISavedViewDefinition` payload with `schemaVersion` and scope metadata
- personal-scope writes require user write access to the personal views list
- team/role-scope writes require the corresponding team or role write capability
- system-scope writes are admin-only

### Storage Adapter Interface

```typescript
export interface ISavedViewsStorageAdapter {
  loadViews(moduleKey: string, workspaceKey: string): Promise<ISavedViewDefinition[]>;
  saveView(view: ISavedViewDefinition): Promise<ISavedViewDefinition>;
  deleteView(viewId: string): Promise<void>;
  setDefault(viewId: string, moduleKey: string, workspaceKey: string): Promise<void>;
  clearDefault(moduleKey: string, workspaceKey: string): Promise<void>;
}
```

Two adapter implementations are required:

- `sharePointSavedViewsAdapter` — MVP; operates against a SharePoint list
- `azureSavedViewsAdapter` — migration seam; stubbed interface, not production-ready in Phase 3

---

## Schema Versioning Strategy

- each `ISavedViewDefinition` records the `schemaVersion` at time of save
- each module adapter declares `currentSchemaVersion()` and `currentSchema()`
- when a view is applied, the runtime compares the stored `schemaVersion` to `currentSchemaVersion()`
- version mismatch triggers the compatibility reconciliation flow before applying

### Version Increment Rules

- the module adapter must increment `currentSchemaVersion()` whenever:
  - a column key is renamed or removed
  - a filter field is renamed or removed
  - a grouping field is renamed or removed
- adding new optional fields does not require a version increment (views remain compatible)

---

## Compatibility Reconciliation Logic

Reconciliation runs before applying any view whose `schemaVersion` differs from the current module schema.

```
reconcile(view: ISavedViewDefinition, schema: ISavedViewSchemaDescriptor): ISavedViewCompatibilityResult
```

Steps:

1. identify columns in `presentation.visibleColumnKeys` not in `schema.validColumnKeys` → `removedColumns`
2. identify filter fields in `filterClauses` not in `schema.validFilterFields` → `removedFilterFields`
3. identify group fields in `groupBy` not in `schema.validGroupFields` → `removedGroupFields`
4. if all three sets are empty → return `compatible`
5. if removed items are present but applying without them still yields a meaningful view → return `degraded-compatible` with `fallbackApplied: true` and a `userExplanation` string
6. if the removed items make the view unrecognizable or empty → return `incompatible`

### User-Facing Explanation Requirements

`degraded-compatible` explanations must name the specific fields removed:

> "2 columns are no longer available and have been removed from this view: Cost Code, Budget Variance."

`incompatible` explanations must tell the user what to do:

> "This saved view references fields that no longer exist in the current workspace. Reset the view or save a new one."

---

## Write Safeguards

- overwriting a team/role/system-scope view requires permission confirmation before submission
- deleting a shared view that others may be using must display a scope-aware warning: "This view is shared with your team. Deleting it will remove it for all team members."
- applying a `degraded-compatible` view presents the `ViewCompatibilityBanner` before the workspace state changes; the user may cancel

---

## Verification Commands

```bash
pnpm --filter @hbc/saved-views check-types
pnpm --filter @hbc/saved-views test --coverage
```

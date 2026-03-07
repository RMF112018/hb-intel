# HbcDataTable

**Decision Reference:** D-PH4C-12

Virtualized data table with sorting, pagination, and density controls.

## Import

```tsx
import { HbcDataTable } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<T>[]` | required | Column definitions with header, cell renderer, and sizing metadata. |
| `data` | `T[]` | required | Row data array. |
| `enableSorting` | `boolean` | `false` | Enables interactive sort headers. |
| `enableColumnConfig` | `boolean` | `false` | Enables internal column sizing and configuration behavior. |
| `savedViewsConfig` | `HbcDataTableSavedViewsConfig \| undefined` | `undefined` | Enables PH4C config-only saved-views integration via internal `useSavedViews`. |
| `isLoading` | `boolean` | `false` | Shows layout-matched shimmer overlay. |
| `emptyStateConfig` | `DataTableEmptyStateConfig` | `undefined` | Empty-state title/description/action configuration. |

### `savedViewsConfig` (optional)

When `savedViewsConfig` is provided, `HbcDataTable`:
- invokes `useSavedViews` internally
- manages saved-view state internally (config-only pattern, D-PH4C-09)
- captures and reapplies sorting + column visibility/order state
- forwards lifecycle callbacks (`onViewSaved`, `onViewDeleted`, `onViewApplied`)

Example:

```tsx
<HbcDataTable
  data={rows}
  columns={columns}
  enableSorting
  enableColumnConfig
  savedViewsConfig={{
    tableId: 'accounting-transactions',
    userId: currentUser.id,
    onViewSaved: (view) => toast.success(`Saved ${view.name}`),
  }}
/>
```

### `HbcDataTableSavedViewsConfig`

| Property | Type | Required | Description |
|---|---|---|---|
| `tableId` | `string` | Yes | Stable per-table persistence key namespace. |
| `userId` | `string` | Yes | Per-user saved-view scope key. |
| `projectId` | `string` | No | Optional project scope for project views. |
| `onViewSaved` | `(view: SavedViewEntry) => void` | No | Callback after create/save completes. |
| `onViewDeleted` | `(viewId: string) => void` | No | Callback after delete completes. |
| `onViewApplied` | `(viewId: string, view: SavedViewEntry) => void` | No | Callback after view state is applied to table. |

### Deferred Scope (Post-PH4C)

Full controlled/uncontrolled dual-mode APIs for saved views are intentionally deferred beyond PH4C.  
Current PH4C integration is config-only: consumers provide IDs/callbacks, while `HbcDataTable` owns the saved-view state lifecycle.

## Usage

```tsx
const columns: ColumnDef<Project>[] = [
  { accessorKey: 'name', header: 'Project Name', sortable: true },
  { accessorKey: 'status', header: 'Status', cell: (info) => <HbcStatusBadge variant={info.getValue()} /> }
];

<HbcDataTable
  columns={columns}
  data={projects}
  pagination={{ pageSize: 25, pageIndex: 0 }}
  sorting={{ columnId: 'name', direction: 'asc' }}
  density="default"
  emptyState={<HbcEmptyState title="No projects" description="Create one to start." />}
/>
```

## Field Mode Behavior

Alternating row background colors adapt in Field Mode. Stripe colors use hbcFieldTheme tokens with lighter backgrounds for visibility on dark surfaces. Header row maintains contrast with darker background.

## Accessibility

- Implements `role="grid"` with `role="row"` for each row
- Column headers have `aria-sort` indicating sort state
- Sortable columns are keyboard accessible
- Pagination controls are keyboard navigable
- Screen readers announce row and column count
- Focus indicators clearly visible on cells and controls

## SPFx Constraints

No SPFx-specific constraints.

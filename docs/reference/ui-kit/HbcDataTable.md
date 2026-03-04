# HbcDataTable

Virtualized data table with sorting, pagination, and density controls.

## Import

```tsx
import { HbcDataTable } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | ColumnDef<T>[] | required | Column definitions with header, cell, sortable |
| data | T[] | required | Array of row data |
| pagination | PaginationState | undefined | Pagination config: pageSize, pageIndex |
| sorting | SortingState | undefined | Sorting config: columnId, direction |
| density | DensityTier | 'default' | Row density: 'compact', 'default', 'spacious' |
| emptyState | ReactNode | undefined | Custom empty state UI |

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

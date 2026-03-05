# ListLayout

**Phase:** 4b.3 | **Blueprint:** §1f, §2c

Four-zone list page layout with filter toolbar, saved views bar, table zone, and floating bulk action bar. Used when `WorkspacePageShell` has `layout="list"`.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `primaryFilters` | `ListFilterDef[]` | No | Primary filter definitions (shown in toolbar) |
| `advancedFilters` | `ListFilterDef[]` | No | Advanced filters (expandable panel) |
| `activeFilters` | `Record<string, string \| string[]>` | No | Active filter values (controlled) |
| `onFilterChange` | `(key, value) => void` | No | Filter change handler |
| `onClearAllFilters` | `() => void` | No | Clear all filters handler |
| `searchValue` | `string` | No | Search input value (controlled) |
| `onSearchChange` | `(value) => void` | No | Search change handler |
| `searchPlaceholder` | `string` | No | Search placeholder text |
| `savedViewsEnabled` | `boolean` | No | Enable saved views bar |
| `savedViews` | `ListSavedViewEntry[]` | No | Saved view entries |
| `activeViewId` | `string` | No | Active view ID |
| `onViewSelect` | `(viewId) => void` | No | View selection handler |
| `onSaveView` | `() => void` | No | Save current view handler |
| `viewMode` | `'table' \| 'card'` | No | Current view mode (default: `'table'`) |
| `onViewModeChange` | `(mode) => void` | No | View mode toggle handler |
| `selectedCount` | `number` | No | Number of selected rows (triggers bulk bar) |
| `bulkActions` | `ListBulkAction[]` | No | Bulk action definitions |
| `onClearSelection` | `() => void` | No | Clear selection handler |
| `showingCount` | `number` | No | Currently shown item count |
| `totalCount` | `number` | No | Total item count |
| `children` | `ReactNode` | Yes | Table/card content |

## Zones

1. **FilterToolbar** (sticky) — search + primary filters + pill strip + more filters + view toggle + count
2. **SavedViewsBar** (conditional) — horizontal view buttons with scope indicators
3. **Table Zone** (flexGrow) — children slot for HbcDataTable or card grid
4. **BulkActionBar** (floating) — appears when rows selected

## Usage

### Via WorkspacePageShell (recommended)

```tsx
<WorkspacePageShell
  layout="list"
  title="RFIs"
  listConfig={{
    filterStoreKey: 'rfis',
    primaryFilters: [...],
    savedViewsEnabled: true,
    selectable: true,
    bulkActions: [...],
  }}
>
  <HbcDataTable columns={columns} data={data} />
</WorkspacePageShell>
```

### Direct usage

```tsx
import { ListLayout } from '@hbc/ui-kit';

<ListLayout
  primaryFilters={filters}
  activeFilters={activeFilters}
  onFilterChange={handleFilterChange}
  searchValue={search}
  onSearchChange={setSearch}
  showingCount={42}
  totalCount={156}
>
  <HbcDataTable columns={columns} data={data} />
</ListLayout>
```

## Design Decisions

- **Controlled props pattern** — parent page owns filter state, no internal Zustand store
- **Deferred to Phase 5+:** `useFilterStore`, `HbcLocationFilter`, service worker deep-link caching, AI-suggested filters, saved views persistence backend

## Data Attribute

`data-hbc-layout="list"` — available for CSS hooks.

## Storybook

`Layouts/ListLayout` — Default, PrimaryFiltersApplied, AdvancedFilterPanelOpen, ZeroResults, SavedViewsBar, SingleRowSelected, MultipleRowsSelected, CardViewMode, AllVariants, FieldMode, A11yTest

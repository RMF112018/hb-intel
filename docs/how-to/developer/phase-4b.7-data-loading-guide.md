# Phase 4b.7 — Data Loading & State Handling Guide

**Binding Decision:** D-06 — Loading/empty/error states must be passed via props to WorkspacePageShell; pages must never render their own spinners, empty states, or error UIs.

## Standard Dashboard Page Pattern

```tsx
import { WorkspacePageShell } from '@hbc/ui-kit';
import { useProjectDashboard } from '@hbc/query-hooks';

export function ProjectDashboard() {
  const { data, isLoading, isError, error, refetch } = useProjectDashboard();

  return (
    <WorkspacePageShell
      layout="dashboard"
      title="Project Dashboard"
      dashboardConfig={{
        kpiCards: data?.kpiCards,
        chartContent: data?.chart,
      }}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
      isEmpty={!isLoading && !isError && !data?.hasContent}
      emptyMessage="No project data available"
    >
      <ProjectDataZone data={data} />
    </WorkspacePageShell>
  );
}
```

When `isLoading` is true and `layout="dashboard"`, WorkspacePageShell renders a `DashboardSkeleton` with:
- 4-card KPI grid shimmer
- Chart area shimmer
- Data zone shimmer

This prevents layout shift when data arrives.

## Standard List Page Pattern

```tsx
import { WorkspacePageShell } from '@hbc/ui-kit';
import { useListFilterStoreBinding } from '@hbc/query-hooks';
import { useRfiList } from '../hooks/useRfiList';

const LIST_CONFIG = {
  filterStoreKey: 'rfis',
  primaryFilters: [
    { key: 'status', label: 'Status', type: 'select' as const, options: [...] },
    { key: 'priority', label: 'Priority', type: 'select' as const, options: [...] },
  ],
  savedViewsEnabled: true,
  bulkActions: [...],
};

export function RfiListPage() {
  const { data, isLoading, isError, error, refetch } = useRfiList();
  const filterProps = useListFilterStoreBinding('rfis');

  return (
    <WorkspacePageShell
      layout="list"
      title="RFIs"
      listConfig={LIST_CONFIG}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
      skeletonColumns={6}
      isEmpty={!isLoading && !isError && data?.items.length === 0}
      emptyMessage="No RFIs found"
      emptyActionLabel="Clear Filters"
      onEmptyAction={() => filterProps.onClearAllFilters()}
      actions={[
        { key: 'create', label: 'New RFI', onClick: handleCreate, primary: true },
      ]}
    >
      <RfiTable data={data?.items ?? []} {...filterProps} />
    </WorkspacePageShell>
  );
}
```

When `isLoading` is true and `layout="list"`, WorkspacePageShell renders a `ListSkeleton` with:
- Toolbar shimmer bar
- 10 ghost table rows (column count from `skeletonColumns`, default 5)

## Error Handling Pattern

Error state uses HBC design tokens (D-05 compliant):
- Background: `HBC_STATUS_RAMP_RED[90]` (light red)
- Border: `HBC_STATUS_COLORS.error` (red accent)
- Text: `HBC_STATUS_RAMP_RED[10]` (dark red)

When `onRetry` is provided, a "Try Again" button is rendered.

```tsx
<WorkspacePageShell
  layout="list"
  title="Submittals"
  isError
  errorMessage="Connection lost. Check your network."
  onRetry={() => queryClient.invalidateQueries({ queryKey: ['submittals'] })}
>
  <SubmittalTable />
</WorkspacePageShell>
```

## Empty State with "Clear Filters" Action

When a filtered list returns empty, offer a "Clear Filters" CTA:

```tsx
<WorkspacePageShell
  layout="list"
  title="RFIs"
  isEmpty={data?.items.length === 0}
  emptyMessage="No RFIs match your filters"
  emptyActionLabel="Clear Filters"
  onEmptyAction={() => filterProps.onClearAllFilters()}
>
  ...
</WorkspacePageShell>
```

## useFilterStore — Full Interface

The expanded `useFilterStore` (Zustand) supports:
- **Filters**: `getFilters(key)`, `setFilter(key, field, value)`, `clearFilter(key, field)`, `clearFilters(key)`, `hasActiveFilters(key)`, `getActivePills(key)`
- **Saved views**: `getSavedViews(key)`, `saveView(key, name, scope)`, `applyView(key, viewId)`, `deleteView(key, viewId)`, `getActiveView(key)`
- **Column config**: `getColumnConfig(key)`, `setColumnConfig(key, config)`
- **View mode**: `getViewMode(key)`, `setViewMode(key, mode)`
- **Pagination**: `getPagination(key)`, `setPagination(key, state)`
- **Deep-link**: `encodeFiltersToUrl(key)`, `decodeFiltersFromUrl()`

## useListFilterStoreBinding — ListLayout Auto-Wiring

The `useListFilterStoreBinding(key)` hook returns props compatible with `ListLayout`:

```tsx
const filterProps = useListFilterStoreBinding('rfis');
// Returns: { activeFilters, onFilterChange, onClearAllFilters, viewMode, onViewModeChange }
```

Controlled props always take precedence — if a parent passes `activeFilters` directly, those override store state.

## SPFx Saved Views (F-022)

`useSavedViews` uses a storage adapter pattern:
- **PWA / dev-harness**: `LocalStorageAdapter` (localStorage)
- **SPFx iframe**: `SessionStorageAdapter` (sessionStorage — cross-origin safe)

Detection: `globalThis._spPageContextInfo || globalThis.__spfxContext`

Full SharePoint REST API adapter deferred to Phase 5 (backend dependency).

## Anti-Patterns

### Never render your own spinner

```tsx
// WRONG — violates D-06
function MyPage() {
  const { isLoading } = useQuery(...);
  return (
    <WorkspacePageShell layout="list" title="Items">
      {isLoading ? <Spinner /> : <ItemTable />}
    </WorkspacePageShell>
  );
}

// CORRECT — pass state via props
function MyPage() {
  const { data, isLoading, isError, error, refetch } = useQuery(...);
  return (
    <WorkspacePageShell
      layout="list"
      title="Items"
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
    >
      <ItemTable data={data} />
    </WorkspacePageShell>
  );
}
```

### Never render your own empty state

```tsx
// WRONG — violates D-06
<WorkspacePageShell layout="list" title="Items">
  {data.length === 0 ? <p>No items</p> : <ItemTable data={data} />}
</WorkspacePageShell>

// CORRECT
<WorkspacePageShell
  layout="list"
  title="Items"
  isEmpty={data.length === 0}
  emptyMessage="No items found"
>
  <ItemTable data={data} />
</WorkspacePageShell>
```

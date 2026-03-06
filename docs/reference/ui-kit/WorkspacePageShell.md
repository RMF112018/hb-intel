# WorkspacePageShell

Mandatory outer container for every page in HB Intel (D-01). Renders breadcrumbs, command bar, banners, and state overlays (loading/empty/error). The `layout` prop enforces D-02 at the type level.

## Import

```tsx
import { WorkspacePageShell } from '@hbc/ui-kit';
// Or from the PWA facade:
import { WorkspacePageShell } from '@hbc/app-shell';

import type {
  WorkspacePageShellProps,
  PageLayout,
  BannerConfig,
  ListConfig,
  FilterDef,
  BulkAction,
} from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| layout | `PageLayout` | **required** | Layout variant: `'dashboard' \| 'list' \| 'form' \| 'detail' \| 'landing'` |
| title | `string` | **required** | Page title |
| breadcrumbs | `BreadcrumbItem[]` | `undefined` | Breadcrumb navigation segments |
| actions | `CommandBarAction[]` | `undefined` | Primary command bar actions |
| overflowActions | `CommandBarAction[]` | `undefined` | Overflow menu actions |
| dashboardConfig | `DashboardConfig` | `undefined` | Dashboard layout config (KPIs + chart) — used when `layout='dashboard'` |
| listConfig | `ListConfig` | `undefined` | List-mode config (filters, bulk actions) — used when `layout='list'` |
| isLoading | `boolean` | `false` | Show loading spinner overlay |
| isEmpty | `boolean` | `false` | Show empty state |
| isError | `boolean` | `false` | Show error state |
| errorMessage | `string` | `'An unexpected error occurred.'` | Error state message |
| onRetry | `() => void` | `undefined` | Retry handler for error state — renders "Try Again" button (D-06) |
| skeletonColumns | `number` | `5` | Number of columns for list skeleton loading state |
| emptyMessage | `string` | `'No items found.'` | Empty state message |
| emptyActionLabel | `string` | `undefined` | Empty state CTA label |
| onEmptyAction | `() => void` | `undefined` | Empty state CTA handler |
| banner | `BannerConfig` | `undefined` | Page-level banner |
| supportedModes | `('office' \| 'field')[]` | `undefined` | Supported device modes |
| children | `ReactNode` | **required** | Page content |

## PageLayout Type

```ts
type PageLayout = 'dashboard' | 'list' | 'form' | 'detail' | 'landing';
```

## BannerConfig

```ts
interface BannerConfig {
  variant: BannerVariant; // 'info' | 'success' | 'warning' | 'error'
  message: ReactNode;
  dismissible?: boolean;
}
```

## DashboardConfig (Phase 4b.3)

```ts
interface DashboardConfig {
  kpiCards?: KpiCardData[];
  chartContent?: ReactNode;
}
```

When `layout='dashboard'`, WPS wraps children in `DashboardLayout` with the config props. See [DashboardLayout.md](./DashboardLayout.md).

## ListConfig (Phase 4b.3)

```ts
interface ListConfig {
  filterStoreKey: string;
  primaryFilters?: ListFilterDef[];
  advancedFilters?: ListFilterDef[];
  savedViewsEnabled?: boolean;
  selectable?: boolean;
  bulkActions?: ListBulkAction[];
}
```

When `layout='list'`, WPS wraps children in `ListLayout` with the config props. See [ListLayout.md](./ListLayout.md).

## Layout Variant Behavior (Phase 4b.3 LAYOUT_MAP)

| Layout | WPS Behavior |
|--------|-------------|
| `dashboard` | Wraps children in `DashboardLayout` with `dashboardConfig` props |
| `list` | Wraps children in `ListLayout` with `listConfig` props |
| `form` | Pass-through — page composes `CreateUpdateLayout` directly |
| `detail` | Pass-through — page composes `DetailLayout` directly |
| `landing` | Pass-through — page composes `ToolLandingLayout` directly |

## Usage

```tsx
<WorkspacePageShell
  layout="list"
  title="RFIs"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'RFIs' },
  ]}
  actions={[
    { key: 'create', label: 'New RFI', onClick: handleCreate, primary: true },
  ]}
  banner={{
    variant: 'warning',
    message: '3 overdue RFIs',
    dismissible: true,
  }}
>
  <RFITable />
</WorkspacePageShell>
```

### State Overlays (D-06)

D-06 requires all loading/empty/error states to be passed via props — pages must never render their own spinners, empty states, or error UIs.

```tsx
// Loading — layout-aware skeleton (Phase 4b.7)
// Dashboard layout → DashboardSkeleton (4-card KPI grid + chart shimmer)
// List layout → ListSkeleton (toolbar + 10 ghost rows)
// Other layouts → HbcSpinner centered
<WorkspacePageShell layout="dashboard" title="Overview" isLoading>
  <Dashboard />  {/* Not rendered while loading */}
</WorkspacePageShell>

// List loading with custom column count
<WorkspacePageShell layout="list" title="RFIs" isLoading skeletonColumns={7}>
  <RFITable />
</WorkspacePageShell>

// Error with retry
<WorkspacePageShell
  layout="list"
  title="RFIs"
  isError
  errorMessage="Failed to load RFIs"
  onRetry={() => refetch()}
>
  <RFITable />
</WorkspacePageShell>

// Empty with CTA
<WorkspacePageShell
  layout="list"
  title="RFIs"
  isEmpty
  emptyMessage="No RFIs yet"
  emptyActionLabel="Create First RFI"
  onEmptyAction={handleCreate}
>
  <RFITable />
</WorkspacePageShell>
```

## ListConfigContext

For Phase 4b.3 layout variant rendering, `listConfig` is stored in React context:

```tsx
import { ListConfigContext } from '@hbc/ui-kit';

function MyListLayout() {
  const listConfig = React.useContext(ListConfigContext);
  // Use listConfig for filter bar, bulk actions, etc.
}
```

## Data Attributes

- `data-hbc-ui="workspace-page-shell"` — root element
- `data-layout={layout}` — layout variant for Phase 4b.3 styling hooks

## Accessibility

- Breadcrumbs render `HbcBreadcrumbs` with `role="navigation"` and `aria-label="Breadcrumb"`
- Loading state uses `HbcSpinner` with `role="status"`
- Error state renders a styled card with clear error message
- Empty state uses `HbcEmptyState` with optional CTA
- Banner uses `HbcBanner` with appropriate `role="alert"` or `role="status"`

## Page Actions Pattern (D-03)

All page actions must flow through WorkspacePageShell's `actions` and `overflowActions` props. Do **not** place buttons directly in the page content zone.

### Correct

```tsx
<WorkspacePageShell
  layout="list"
  title="RFIs"
  actions={[
    { key: 'create', label: 'New RFI', onClick: handleCreate, primary: true },
    { key: 'export', label: 'Export', onClick: handleExport },
  ]}
  overflowActions={[
    { key: 'archive', label: 'Archive All', onClick: handleArchive },
    { key: 'delete', label: 'Delete All', onClick: handleDelete, isDestructive: true },
  ]}
>
  <RFITable />
</WorkspacePageShell>
```

### Prohibited

```tsx
{/* ESLint rule hbc/no-direct-buttons-in-content will warn */}
<WorkspacePageShell layout="list" title="RFIs">
  <HbcButton onClick={handleCreate}>New RFI</HbcButton>
  <RFITable />
</WorkspacePageShell>
```

## CommandBarAction Interface

```ts
interface CommandBarAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  isDestructive?: boolean;  // Renders as danger-styled (red) button
  tooltip?: string;         // Tooltip text on hover
}
```

- `primary` renders as accent-colored button
- `isDestructive` renders as red/danger button (overrides primary styling)
- `tooltip` wraps the button in `HbcTooltip`
- `overflowActions` renders a "More" overflow menu with `Menu`/`MenuItem`

## Field Mode Behavior (PH4B.4 §4b.4.3)

When field mode is active (`data-theme="field"`), WorkspacePageShell adapts page actions:

| Element | Office Mode | Field Mode |
|---------|------------|------------|
| Command bar zone | Visible | Hidden |
| Primary action | Button in command bar | 56px FAB (bottom-right, above bottom nav) |
| Secondary actions | Buttons in command bar | Injected into Cmd+K palette |
| Overflow actions | "More" menu | Injected into Cmd+K palette |

The FAB renders with `data-hbc-ui="fab-primary"` and `aria-label={primaryAction.label}`.

Secondary actions are written to a module-level store (`fieldModeActionsStore`) and consumed by `HbcCommandPalette` via `useFieldModeActions()`.

## Active Sidebar State (D-04)

Sidebar active state is derived **automatically** from the router. Pages must never manually set active nav state.

- `root-route.tsx` calls `useRouterState().location.pathname` and matches against sidebar item `href` values
- The matched item's `id` is passed as `activeItemId` through `HbcAppShell` → `HbcSidebar` → `HbcBottomNav`
- Path matching: `path === item.href || path.startsWith(item.href + '/')` — longest match wins
- Adding a nav item requires only adding an entry to `NAV_ITEMS` in `@hbc/shell`

See [ADR-0039](../../architecture/adr/ADR-0039-navigation-and-active-state.md) for full rationale.

## SPFx Constraints

Depends on `useProjectStore` from `@hbc/shell` for active project context. In SPFx environments, ensure the shell store is properly initialized.

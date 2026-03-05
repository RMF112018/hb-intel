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
| listConfig | `ListConfig` | `undefined` | List-mode config (Phase 4b.3 context) |
| isLoading | `boolean` | `false` | Show loading spinner overlay |
| isEmpty | `boolean` | `false` | Show empty state |
| isError | `boolean` | `false` | Show error state |
| errorMessage | `string` | `'An unexpected error occurred.'` | Error state message |
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

## ListConfig (Phase 4b.3)

```ts
interface ListConfig {
  filterStoreKey: string;
  primaryFilters: FilterDef[];
  advancedFilters?: FilterDef[];
  savedViewsEnabled?: boolean;
  selectable?: boolean;
  bulkActions?: BulkAction[];
}
```

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

### State Overlays

```tsx
// Loading
<WorkspacePageShell layout="list" title="RFIs" isLoading>
  <RFITable />  {/* Not rendered while loading */}
</WorkspacePageShell>

// Error
<WorkspacePageShell layout="list" title="RFIs" isError errorMessage="Server error">
  <RFITable />
</WorkspacePageShell>

// Empty
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

## SPFx Constraints

Depends on `useProjectStore` from `@hbc/shell` for active project context. In SPFx environments, ensure the shell store is properly initialized.

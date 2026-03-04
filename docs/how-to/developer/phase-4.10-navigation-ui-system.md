# Phase 4.10 — Navigation UI System (Developer Guide)

**Phase:** 4.10 | **Reference:** PH4.10-UI-Design-Plan.md §10, Blueprint §2c

## Overview

Phase 4.10 delivers six standalone navigation components for the HB Intel Design System:

| Component | Purpose |
|-----------|---------|
| **HbcBreadcrumbs** | Breadcrumb navigation with max 3 levels, Focus Mode |
| **HbcTabs** | Tab bar with 3px orange underline, lazy panels, keyboard nav |
| **HbcPagination** | Page numbers with ellipsis truncation, page size selector |
| **HbcSearch** | Two-variant search (global wrapper + local input with debounce) |
| **HbcTree** | Accessible tree view with ARIA tree pattern and keyboard nav |
| **SparkleIcon** | AI sparkle icon replacing Star in HbcCommandPalette |

## When to Use Each Component

### HbcBreadcrumbs
Use for page-level navigation context. Max 3 levels are shown; longer paths truncate with "…" prefix. In **Focus Mode**, sticky positioning and borders are removed for minimal chrome.

```tsx
import { HbcBreadcrumbs } from '@hbc/ui-kit';

<HbcBreadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'RFIs', href: '/rfis' },
    { label: 'RFI-0042' },
  ]}
  onNavigate={(href) => router.push(href)}
/>
```

### HbcTabs
Use for content section switching. Supports two patterns:
1. **Controlled** (without `panels`): Consumer manages content rendering
2. **With panels**: Lazy rendering — only the active panel is mounted

```tsx
import { HbcTabs } from '@hbc/ui-kit';

// Controlled pattern
<HbcTabs
  tabs={[{ id: 'overview', label: 'Overview' }, { id: 'details', label: 'Details' }]}
  activeTabId={activeTab}
  onTabChange={setActiveTab}
/>

// With lazy panels
<HbcTabs
  tabs={tabs}
  activeTabId={activeTab}
  onTabChange={setActiveTab}
  panels={[
    { tabId: 'overview', content: <OverviewPanel /> },
    { tabId: 'details', content: <DetailsPanel /> },
  ]}
/>
```

**Keyboard navigation:** ArrowLeft/Right cycles through enabled tabs (wraps around, skips disabled).

### HbcPagination
Use below data tables or lists. Automatically hidden when all items fit on one page. Not integrated into HbcDataTable — use as a standalone footer.

```tsx
import { HbcPagination } from '@hbc/ui-kit';

<HbcPagination
  totalItems={250}
  currentPage={page}
  pageSize={25}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

### HbcSearch
Two variants via discriminated union:

- **`variant="global"`**: Wraps `HbcGlobalSearch` without re-registering Cmd+K
- **`variant="local"`**: Native input with 200ms debounce, Search icon, clear button

```tsx
import { HbcSearch } from '@hbc/ui-kit';

// Global (in header)
<HbcSearch variant="global" onSearchOpen={openPalette} />

// Local (in-page filter)
<HbcSearch
  variant="local"
  value={filter}
  onSearch={setFilter}
  placeholder="Filter items..."
/>
```

### HbcTree
Use for hierarchical navigation (project trees, document trees). Full ARIA tree pattern with keyboard navigation.

**Keyboard shortcuts:**
- Arrow Down/Up: Next/previous visible node
- Arrow Right: Expand node or move to first child
- Arrow Left: Collapse node or move to parent
- Enter/Space: Select node
- Home/End: Jump to first/last visible node

```tsx
import { HbcTree } from '@hbc/ui-kit';

<HbcTree
  nodes={treeData}
  selectedNodeId={selectedId}
  onNodeSelect={setSelectedId}
/>
```

## Field Mode Support

All components accept `isFieldMode` prop for dark surface tokens (`HBC_SURFACE_FIELD`). The global search variant inherits from the header context and does not need this prop.

## Design Decisions

- **Tab underline color**: HbcTabs uses `#F37021` (orange) per V2.1 spec. DetailLayout retains `HBC_PRIMARY_BLUE`. See ADR-0023.
- **Non-breaking extraction**: HbcBreadcrumbs and HbcTabs are new standalone components. DetailLayout continues using its inline implementations until explicitly migrated.
- **SparkleIcon**: Replaces Star in HbcCommandPalette AI results for V2.1 compliance. Pure visual change.

# Phase 4.7 — Data Visualization & Table System (Developer Guide)

**Category:** How-to (Developer)
**Phase:** 4.7
**Reference:** PH4.7-UI-Design-Plan.md §7.1–7.4, Blueprint §1d

## Overview

Phase 4.7 enhances `HbcDataTable` with V2.1 features and adds new visualization components. This guide covers usage of each feature.

---

## Adaptive Density System

The table automatically detects the optimal density tier based on device capabilities:

| Tier | Trigger | Row Height | Font Size |
|------|---------|-----------|-----------|
| `touch` | `pointer: coarse` + width < 1024 | 64px | 16px |
| `standard` | Default | 48px | 14px |
| `compact` | `pointer: fine` + width >= 1440 | 36px | 13px |

### Usage

```tsx
<HbcDataTable
  data={data}
  columns={columns}
  toolId="buyout-schedule"       // localStorage persistence key
  densityTier="compact"          // manual override (optional)
  onDensityChange={(tier) => {}} // tier change callback
/>
```

### Standalone Hook

```tsx
import { useAdaptiveDensity } from '@hbc/ui-kit';

const { tier, config, setManualOverride } = useAdaptiveDensity({
  toolId: 'my-tool',
  isFieldMode: false,
});
```

In **Field Mode**, the table defaults to `touch` tier for sunlight legibility.

---

## Responsibility Heat Map

Highlights rows where the current user is the responsible party:

```tsx
<HbcDataTable
  data={rfis}
  columns={columns}
  responsibilityField="assigneeId"
  currentUserId={currentUser.id}
/>
```

Matching rows display a 4px solid `#F37021` left border with `#FFF5EE` background (light mode) or `#2A1F0F` (Field Mode). In card-stack mobile view, the accent appears as a top border instead.

---

## Card-Stack Mobile View

When viewport is < 640px and `mobileCardFields` is set, the table renders as a card stack:

```tsx
<HbcDataTable
  data={data}
  columns={columns}
  mobileCardFields={['id', 'name', 'status', 'amount']}
/>
```

Cards show the specified fields with labels, and a chevron to expand full details inline. Row selection and responsibility heat map both work in card mode.

---

## Inline Editing

Enable double-click cell editing:

```tsx
<HbcDataTable
  data={data}
  columns={columns}
  editableColumns={['name', 'amount']}
  onCellEdit={(rowId, columnId, newValue) => {
    // Update your data source
  }}
/>
```

- **Double-click** an editable cell to enter edit mode
- **Tab** moves to the next editable cell
- **Enter** or **blur** saves the value
- **Escape** reverts changes
- Editable cells show a subtle dashed bottom border

---

## Column Configuration

Enable column show/hide, resize, and reorder:

```tsx
<HbcDataTable
  data={data}
  columns={columns}
  enableColumnConfig
  columnVisibility={{ category: false }}
  onColumnVisibilityChange={setVisibility}
  columnOrder={order}
  onColumnOrderChange={setOrder}
/>
```

- Column resize: drag handles on column header borders
- Column visibility: controlled via `columnVisibility` state
- Column reorder: controlled via `columnOrder` state

---

## Shimmer Skeletons

When `isLoading={true}`, the table shows layout-matched skeleton rows that respect:
- Exact column widths from your column definitions
- Row height from the active density tier
- A 1.5s shimmer gradient animation
- Crossfade transition (200ms ease-out) when data loads

---

## Data Freshness Indicator

```tsx
<HbcDataTable
  data={data}
  columns={columns}
  isStale={isCacheData}
  emptyStateConfig={{
    title: 'No results found',
    description: 'Try adjusting your search filters.',
    action: <button onClick={clearFilters}>Clear Filters</button>,
  }}
/>
```

- `isStale={true}`: dashed top border indicates cached data
- Border transitions to solid when fresh data loads

---

## HbcKpiCard

Standalone KPI metric card with trend indicators and click-to-filter:

```tsx
import { HbcKpiCard } from '@hbc/ui-kit';

<HbcKpiCard
  label="Total RFIs"
  value={142}
  trend={{ direction: 'up', label: '+12% MoM' }}
  color="#004B87"
  isActive={isFiltered}
  onClick={() => toggleFilter('rfi')}
/>
```

- Max 5 cards per row (use flex container with wrap)
- Active state: 2px solid `#004B87` border + `#E8F1F8` background
- Trend colors: up (green), down (red), flat (muted)

---

## Chart Components

Typed wrappers around the existing `HbcChart` lazy-load infrastructure:

### HbcBarChart

```tsx
import { HbcBarChart } from '@hbc/ui-kit';

<HbcBarChart
  title="RFIs by Category"
  data={[
    { category: 'Structural', value: 42 },
    { category: 'MEP', value: 28 },
  ]}
  orientation="horizontal"
  onBarClick={(item) => filterByCategory(item.category)}
/>
```

### HbcDonutChart

```tsx
import { HbcDonutChart } from '@hbc/ui-kit';

<HbcDonutChart
  title="Status Breakdown"
  data={[
    { name: 'Open', value: 42, color: '#3B9FFF' },
    { name: 'Closed', value: 65, color: '#00C896' },
  ]}
  innerRadius="50%"
  onSliceClick={(item) => filterByStatus(item.name)}
/>
```

### HbcLineChart

```tsx
import { HbcLineChart } from '@hbc/ui-kit';

<HbcLineChart
  title="Monthly Trend"
  xAxisLabels={['Jan', 'Feb', 'Mar', 'Apr']}
  series={[
    { name: 'RFIs', data: [10, 15, 22, 18] },
  ]}
  areaFill
  onPointClick={(seriesName, index) => {}}
/>
```

All charts use the HBC brand palette via the `hb-intel` ECharts theme and reflow on sidebar expand/collapse.

---

## Saved Views

The `useSavedViews` hook manages table view persistence with CRUD, deep-link URLs, and limit enforcement:

```tsx
import { useSavedViews } from '@hbc/ui-kit';

const {
  views,
  activeView,
  createView,
  updateView,
  deleteView,
  activateView,
  getDeepLink,
  configFromUrl,
  isNearLimit,
  isAtLimit,
} = useSavedViews({
  toolId: 'buyout-schedule',
  userId: currentUser.id,
  projectId: activeProject.id,
});
```

- Max 20 personal views per user per tool (warns at 18)
- Deep-link: `?view=base64(JSON.stringify(config))`
- Integrates with `HbcCommandBar` saved views dropdown
- Currently persists to localStorage; SharePoint adapter will be plugged in later

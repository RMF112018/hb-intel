# DashboardLayout

**Phase:** 4b.3 | **Blueprint:** §1f, §2c

Responsive dashboard layout with KPI card grid, chart zone, and data zone. Used when `WorkspacePageShell` has `layout="dashboard"`.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `kpiCards` | `KpiCardData[]` | No | KPI card data for the responsive grid |
| `chartContent` | `ReactNode` | No | Full-width chart slot below KPI grid |
| `children` | `ReactNode` | Yes | Data zone content (flexGrow: 1) |

## Usage

### Via WorkspacePageShell (recommended)

```tsx
<WorkspacePageShell
  layout="dashboard"
  title="Project Dashboard"
  dashboardConfig={{
    kpiCards: [
      { id: 'revenue', label: 'Revenue', value: '$2.4M', trend: 'up', trendValue: '+12%' },
    ],
    chartContent: <RevenueChart />,
  }}
>
  <RecentActivityFeed />
</WorkspacePageShell>
```

### Direct usage (inside WPS)

```tsx
import { DashboardLayout } from '@hbc/ui-kit';

<DashboardLayout kpiCards={kpiCards} chartContent={<Chart />}>
  <DataTable />
</DashboardLayout>
```

## Responsive Grid

| Breakpoint | Columns | Token(s) |
|---|---|---|
| ≥ 1200px (desktop) | 4 columns | `HBC_BREAKPOINT_DESKTOP` |
| 1024–1199px (tablet) | 3 columns | `HBC_BREAKPOINT_SIDEBAR` – `HBC_BREAKPOINT_CONTENT_MEDIUM` |
| 768–1023px (sm-tablet) | 2 columns | `HBC_BREAKPOINT_MOBILE + 1` – `HBC_BREAKPOINT_SIDEBAR - 1` |
| ≤ 767px (mobile) | 1 column | `HBC_BREAKPOINT_MOBILE` |

## Data Attribute

`data-hbc-layout="dashboard"` — available for CSS hooks.

## Storybook

`Layouts/DashboardLayout` — Default, WithoutKpis, WithoutChart, AllVariants, FieldMode, A11yTest

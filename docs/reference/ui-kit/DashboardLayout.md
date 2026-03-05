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

| Breakpoint | Columns |
|-----------|---------|
| > 1200px | 4 columns |
| 768-1199px | 2 columns |
| < 768px | 1 column |

## Data Attribute

`data-hbc-layout="dashboard"` — available for CSS hooks.

## Storybook

`Layouts/DashboardLayout` — Default, WithoutKpis, WithoutChart, AllVariants, FieldMode, A11yTest

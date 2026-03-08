# PH7-Estimating-7 — Estimate Analytics

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-Estimating-1 (Foundation) · PH7-Estimating-6 (Estimate Tracking Log)
**Blocks:** PH7-Estimating-8 (Templates) — analytics is the final analytical view before templates

---

## Summary

Implement the Estimate Analytics page (`EstimateAnalyticsPage.tsx`) as a dedicated analytics and reporting view for the Estimating module. This page displays fiscal year comparison metrics, KPI strip (Total Submitted, Win Rate %, Total Awarded Value, Not Awarded Value), and four recharts-based visualizations: (1) Monthly Submission Volume (BarChart with submitted vs. awarded), (2) Win Rate by Estimate Type (horizontal BarChart), (3) Win Rate by Lead Estimator (horizontal BarChart), and (4) Fiscal Year Comparison table. All charts are lazy-loaded using React Suspense to minimize bundle size impact in SPFx contexts. This implementation enforces **Decision: Option C** (dedicated analytics view with recharts) from the feature planning phase.

## Why It Matters

Analytics provide critical business intelligence for the Estimating function: win rates by estimate type, estimator performance tracking, seasonal submission patterns, and year-over-year trending. By dedicating a separate page to analytics (rather than embedding them in the tracking log), we maintain clean separation of concerns, enable progressive enhancement (lazy loading), and allow teams to drill into trends without the bulk of transaction data. The fiscal year selector and dual-mode data access layer ensure compatibility with both PWA and SPFx deployments.

---

## Files to Create / Modify

| File | Action | Purpose |
|------|--------|---------|
| `packages/features/estimating/src/EstimateAnalyticsPage.tsx` | Create | Main analytics page shell with header, fiscal year selector, KPI strip, and lazy-loaded chart containers |
| `packages/features/estimating/src/components/analytics/MonthlyVolumeChart.tsx` | Create | Recharts BarChart: monthly submission volume (submitted vs. awarded) |
| `packages/features/estimating/src/components/analytics/EstimateTypeBreakdownChart.tsx` | Create | Recharts horizontal BarChart: win rate % by estimate type with color-coding |
| `packages/features/estimating/src/components/analytics/EstimatorBreakdownChart.tsx` | Create | Recharts horizontal BarChart: win rate % by lead estimator with custom tooltip |
| `packages/features/estimating/src/components/analytics/FiscalYearComparisonTable.tsx` | Create | HTML table: year-over-year comparison with KPIs and % change indicators |
| `packages/features/estimating/src/data/estimatingQueries.ts` | Modify | Add `fetchEstimatingAnalytics(fiscalYear)` and `fetchEstimatingAnalyticsComparison()` query hooks |
| `packages/models/src/estimating/IEstimatingAnalytics.ts` | Modify | Add `IMonthlyVolume`, `IEstimateTypeBreakdown`, `IEstimatorBreakdown`, `IEstimatingAnalyticsComparison` models (if not already present) |
| `apps/estimating/src/router/routes.ts` | Modify | Add route for `/analytics` with lazy-loaded `EstimateAnalyticsPage` and `estimating:read` RBAC guard |
| `packages/features/estimating/package.json` | Modify | Add `recharts` as a direct dependency (if not inherited from `@hbc/ui-kit`) |

---

## Implementation

### 1. Main Analytics Page

**File:** `packages/features/estimating/src/EstimateAnalyticsPage.tsx`

```typescript
import type { ReactNode } from 'react';
import { useState, Suspense, lazy } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { WorkspacePageShell, HbcCard, HbcButton, HbcSelect, Text } from '@hbc/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchEstimatingAnalytics, fetchEstimatingAnalyticsComparison } from './data/estimatingQueries.js';
import type { IEstimatingAnalytics, IEstimatingAnalyticsComparison } from '@hbc/models';

// Lazy-load chart components to reduce initial bundle size for SPFx constrained contexts
const MonthlyVolumeChart = lazy(() =>
  import('./components/analytics/MonthlyVolumeChart.js').then((m) => ({
    default: m.MonthlyVolumeChart,
  }))
);
const EstimateTypeBreakdownChart = lazy(() =>
  import('./components/analytics/EstimateTypeBreakdownChart.js').then((m) => ({
    default: m.EstimateTypeBreakdownChart,
  }))
);
const EstimatorBreakdownChart = lazy(() =>
  import('./components/analytics/EstimatorBreakdownChart.js').then((m) => ({
    default: m.EstimatorBreakdownChart,
  }))
);
const FiscalYearComparisonTable = lazy(() =>
  import('./components/analytics/FiscalYearComparisonTable.js').then((m) => ({
    default: m.FiscalYearComparisonTable,
  }))
);

/**
 * ChartLoader
 *
 * Fallback UI while chart component is loading
 */
function ChartLoader(): ReactNode {
  return (
    <div
      style={{
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Loading chart…</Text>
    </div>
  );
}

/**
 * formatCurrency
 *
 * Format a numeric value as currency (USD) with appropriate precision and unit suffix.
 * Examples: 1500000 → "$1.5M", 50000 → "$50K", 999 → "$999"
 */
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

/**
 * EstimateAnalyticsPage
 *
 * Dedicated analytics and reporting view for the Estimating module.
 * Displays:
 * - Fiscal year selector (dropdown)
 * - KPI strip: Total Submitted, Win Rate %, Total Awarded Value, Not Awarded Value
 * - Monthly Submission Volume chart (recharts BarChart)
 * - Win Rate by Estimate Type chart (recharts horizontal BarChart)
 * - Win Rate by Lead Estimator chart (recharts horizontal BarChart)
 * - Fiscal Year Comparison table (current vs. previous year)
 *
 * All chart components are lazy-loaded to minimize bundle size impact.
 * RBAC: Routes.ts enforces estimating:read permission before rendering this page.
 */
export function EstimateAnalyticsPage(): ReactNode {
  const navigate = useNavigate();
  const [fiscalYear, setFiscalYear] = useState(String(new Date().getFullYear()));

  // Fetch analytics data for selected fiscal year
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['estimating', 'analytics', fiscalYear],
    queryFn: () => fetchEstimatingAnalytics(fiscalYear),
  });

  // Fetch year-over-year comparison
  const { data: comparison } = useQuery({
    queryKey: ['estimating', 'analytics', 'comparison'],
    queryFn: fetchEstimatingAnalyticsComparison,
  });

  // KPI cards: Total Submitted, Win Rate %, Total Awarded Value, Not Awarded Value
  const kpis = [
    {
      label: 'Submitted',
      value: analytics?.totalSubmitted ?? '—',
    },
    {
      label: 'Win Rate',
      value: analytics?.winRatePercent != null ? `${analytics.winRatePercent.toFixed(1)}%` : '—',
    },
    {
      label: 'Total Awarded',
      value: analytics?.totalAwardedValue != null ? formatCurrency(analytics.totalAwardedValue) : '—',
    },
    {
      label: 'Not Awarded',
      value: analytics?.totalNotAwardedValue != null ? formatCurrency(analytics.totalNotAwardedValue) : '—',
    },
  ];

  return (
    <WorkspacePageShell layout="list" title="Estimate Analytics">
      {/* Toolbar: Fiscal year selector and back button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text weight="semibold">Fiscal Year</Text>
          <HbcSelect
            value={fiscalYear}
            onChange={setFiscalYear}
            options={['2026', '2025', '2024', '2023'].map((y) => ({
              value: y,
              label: y,
            }))}
          />
        </div>
        <HbcButton appearance="subtle" onClick={() => navigate({ to: '/log' })}>
          ← Back to Log
        </HbcButton>
      </div>

      {/* KPI Strip: 4 stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {kpis.map((kpi) => (
          <HbcCard key={kpi.label} size="small">
            <Text size={200} style={{ display: 'block', marginBottom: 4 }}>
              {kpi.label}
            </Text>
            <Text size={700} weight="bold">
              {kpi.value}
            </Text>
          </HbcCard>
        ))}
      </div>

      {/* Monthly Submission Volume Chart */}
      <HbcCard style={{ marginBottom: 20 }}>
        <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
          Monthly Submission Volume — FY {fiscalYear}
        </Text>
        <Suspense fallback={<ChartLoader />}>
          <MonthlyVolumeChart data={analytics?.monthlyVolume ?? []} isLoading={isLoading} />
        </Suspense>
      </HbcCard>

      {/* Win Rate by Estimate Type Chart */}
      <HbcCard style={{ marginBottom: 20 }}>
        <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
          Win Rate by Estimate Type
        </Text>
        <Suspense fallback={<ChartLoader />}>
          <EstimateTypeBreakdownChart data={analytics?.byEstimateType ?? []} isLoading={isLoading} />
        </Suspense>
      </HbcCard>

      {/* Win Rate by Lead Estimator Chart */}
      <HbcCard style={{ marginBottom: 20 }}>
        <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
          Win Rate by Lead Estimator
        </Text>
        <Suspense fallback={<ChartLoader />}>
          <EstimatorBreakdownChart data={analytics?.byEstimator ?? []} isLoading={isLoading} />
        </Suspense>
      </HbcCard>

      {/* Fiscal Year Comparison Table */}
      {comparison && (
        <HbcCard>
          <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
            Year-over-Year Comparison
          </Text>
          <Suspense fallback={<ChartLoader />}>
            <FiscalYearComparisonTable current={comparison.current} previous={comparison.previous} />
          </Suspense>
        </HbcCard>
      )}
    </WorkspacePageShell>
  );
}
```

---

### 2. Chart Components

#### 2.1 MonthlyVolumeChart

**File:** `packages/features/estimating/src/components/analytics/MonthlyVolumeChart.tsx`

```typescript
import type { ReactNode } from 'react';
import type { IMonthlyVolume } from '@hbc/models';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Text } from '@hbc/ui-kit';

/**
 * MonthlyVolumeChart
 *
 * Recharts BarChart showing monthly submission volume with two bars:
 * - Submitted (blue): total estimates submitted in each month
 * - Awarded (green): total awards in each month
 *
 * Displays 12 months of fiscal year data.
 */
export function MonthlyVolumeChart({
  data,
  isLoading,
}: {
  data: IMonthlyVolume[];
  isLoading: boolean;
}): ReactNode {
  if (isLoading) {
    return (
      <div
        style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Loading…</Text>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--colorNeutralForeground3)',
        }}
      >
        <Text>No data for selected fiscal year.</Text>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--colorNeutralStroke2)"
        />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="submitted"
          name="Submitted"
          fill="var(--colorBrandBackground)"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="awarded"
          name="Awarded"
          fill="var(--colorStatusSuccessBackground1)"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### 2.2 EstimateTypeBreakdownChart

**File:** `packages/features/estimating/src/components/analytics/EstimateTypeBreakdownChart.tsx`

```typescript
import type { ReactNode } from 'react';
import type { IEstimateTypeBreakdown } from '@hbc/models';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Text } from '@hbc/ui-kit';

/**
 * EstimateTypeBreakdownChart
 *
 * Recharts horizontal BarChart showing win rate (%) by estimate type.
 * Sorted in descending order by win rate for readability.
 *
 * Color-coding:
 * - Green (≥50%): strong performance
 * - Blue (30%-50%): moderate performance
 * - Orange (<30%): below target
 */
export function EstimateTypeBreakdownChart({
  data,
  isLoading,
}: {
  data: IEstimateTypeBreakdown[];
  isLoading: boolean;
}): ReactNode {
  if (isLoading || !data.length) {
    return (
      <div
        style={{
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--colorNeutralForeground3)',
        }}
      >
        <Text>{isLoading ? 'Loading…' : 'No data.'}</Text>
      </div>
    );
  }

  // Sort by win rate descending for readability
  const sorted = [...data].sort((a, b) => b.winRate - a.winRate);

  /**
   * getColor
   *
   * Return color based on win rate threshold
   */
  const getColor = (winRate: number): string => {
    if (winRate >= 50) return 'var(--colorStatusSuccessBackground1)';
    if (winRate >= 30) return 'var(--colorBrandBackground)';
    return 'var(--colorStatusWarningBackground1)';
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 36)}>
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 4, right: 60, left: 20, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="var(--colorNeutralStroke2)"
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="estimateType"
          width={160}
          tick={{ fontSize: 11 }}
        />
        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
        <Bar dataKey="winRate" name="Win Rate" radius={[0, 2, 2, 0]}>
          {sorted.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.winRate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### 2.3 EstimatorBreakdownChart

**File:** `packages/features/estimating/src/components/analytics/EstimatorBreakdownChart.tsx`

```typescript
import type { ReactNode } from 'react';
import type { IEstimatorBreakdown } from '@hbc/models';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Text } from '@hbc/ui-kit';

/**
 * EstimatorBreakdownChart
 *
 * Recharts horizontal BarChart showing win rate (%) by lead estimator.
 * Sorted in descending order by win rate.
 *
 * Custom tooltip displays estimator name, win rate %, submitted count, and awarded count.
 */
export function EstimatorBreakdownChart({
  data,
  isLoading,
}: {
  data: IEstimatorBreakdown[];
  isLoading: boolean;
}): ReactNode {
  if (isLoading || !data.length) {
    return (
      <div
        style={{
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--colorNeutralForeground3)',
        }}
      >
        <Text>{isLoading ? 'Loading…' : 'No data.'}</Text>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.winRate - a.winRate);

  /**
   * CustomTooltip
   *
   * Display additional context (submitted count, awarded count) alongside win rate
   */
  const CustomTooltip = ({ active, payload, label }: any): ReactNode => {
    if (!active || !payload?.length) return null;
    const entry = sorted.find((e) => e.estimatorName === label);
    return (
      <div
        style={{
          background: 'var(--colorNeutralBackground1)',
          border: '1px solid var(--colorNeutralStroke1)',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 12,
        }}
      >
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div>Win Rate: {payload[0].value.toFixed(1)}%</div>
        <div>
          Submitted: {entry?.submitted ?? 0} | Awarded: {entry?.awarded ?? 0}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 36)}>
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 4, right: 60, left: 20, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="var(--colorNeutralStroke2)"
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="estimatorName"
          width={140}
          tick={{ fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="winRate"
          name="Win Rate"
          fill="var(--colorBrandBackground)"
          radius={[0, 2, 2, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### 2.4 FiscalYearComparisonTable

**File:** `packages/features/estimating/src/components/analytics/FiscalYearComparisonTable.tsx`

```typescript
import type { ReactNode } from 'react';
import type { IEstimatingAnalytics } from '@hbc/models';
import { Text } from '@hbc/ui-kit';

/**
 * formatCurrency
 *
 * Format a numeric value as currency (USD) with appropriate precision and unit suffix.
 */
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

/**
 * pctChange
 *
 * Calculate and render percent change indicator with up/down arrow.
 * Returns '—' if previous value is 0 (no baseline for comparison).
 */
function pctChange(current: number, previous: number): ReactNode {
  if (previous === 0) {
    return (
      <span style={{ color: 'var(--colorNeutralForeground3)' }}>—</span>
    );
  }
  const delta = ((current - previous) / previous) * 100;
  const color = delta >= 0
    ? 'var(--colorStatusSuccessForeground1)'
    : 'var(--colorStatusDangerForeground1)';
  return (
    <span style={{ color, fontSize: 12 }}>
      {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

interface FiscalYearComparisonTableProps {
  current: IEstimatingAnalytics;
  previous: IEstimatingAnalytics;
}

/**
 * FiscalYearComparisonTable
 *
 * HTML table comparing current and previous fiscal years side-by-side.
 * Displays KPIs with year-over-year percent change indicators.
 */
export function FiscalYearComparisonTable({
  current,
  previous,
}: FiscalYearComparisonTableProps): ReactNode {
  const rows = [
    {
      label: 'Submitted',
      curr: current.totalSubmitted,
      prev: previous.totalSubmitted,
      format: (v: number) => String(v),
    },
    {
      label: 'Awarded',
      curr: current.totalAwarded,
      prev: previous.totalAwarded,
      format: (v: number) => String(v),
    },
    {
      label: 'Win Rate',
      curr: current.winRatePercent,
      prev: previous.winRatePercent,
      format: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      label: 'Total Awarded Value',
      curr: current.totalAwardedValue,
      prev: previous.totalAwardedValue,
      format: formatCurrency,
    },
    {
      label: 'Not Awarded Value',
      curr: current.totalNotAwardedValue,
      prev: previous.totalNotAwardedValue,
      format: formatCurrency,
    },
  ];

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
      }}
    >
      <thead>
        <tr style={{ borderBottom: '2px solid var(--colorNeutralStroke1)' }}>
          <th
            style={{
              textAlign: 'left',
              padding: '6px 8px',
              fontWeight: 600,
            }}
          >
            Metric
          </th>
          <th
            style={{
              textAlign: 'right',
              padding: '6px 8px',
              fontWeight: 600,
            }}
          >
            FY {current.fiscalYear}
          </th>
          <th
            style={{
              textAlign: 'right',
              padding: '6px 8px',
              fontWeight: 600,
            }}
          >
            FY {previous.fiscalYear}
          </th>
          <th
            style={{
              textAlign: 'right',
              padding: '6px 8px',
              fontWeight: 600,
            }}
          >
            Change
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, curr, prev, format }) => (
          <tr
            key={label}
            style={{ borderBottom: '1px solid var(--colorNeutralStroke2)' }}
          >
            <td style={{ padding: '6px 8px' }}>{label}</td>
            <td
              style={{
                textAlign: 'right',
                padding: '6px 8px',
                fontWeight: 500,
              }}
            >
              {format(curr)}
            </td>
            <td
              style={{
                textAlign: 'right',
                padding: '6px 8px',
                color: 'var(--colorNeutralForeground3)',
              }}
            >
              {format(prev)}
            </td>
            <td style={{ textAlign: 'right', padding: '6px 8px' }}>
              {pctChange(curr, prev)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### 3. Data Access Layer

**File:** `packages/features/estimating/src/data/estimatingQueries.ts` — **Modify**

Ensure the following query hooks are present. If already defined in PH7-Estimating-1, verify the signatures match. If not, add them now:

```typescript
/**
 * fetchEstimatingAnalytics
 *
 * Fetches analytics data for a specific fiscal year:
 * - KPIs: totalSubmitted, totalAwarded, winRatePercent, totalAwardedValue, totalNotAwardedValue
 * - Monthly volume data (12 months)
 * - Win rate breakdown by estimate type
 * - Win rate breakdown by lead estimator
 *
 * Uses the adapter pattern from @hbc/data-access for dual-mode (PWA/SPFx) compatibility.
 *
 * @param {string} fiscalYear - Fiscal year (e.g., "2026")
 * @returns {Promise<IEstimatingAnalytics>}
 */
export async function fetchEstimatingAnalytics(
  fiscalYear: string
): Promise<IEstimatingAnalytics> {
  const adapter = getEstimatingAdapter();
  return adapter.getAnalytics(fiscalYear);
}

/**
 * fetchEstimatingAnalyticsComparison
 *
 * Fetches year-over-year comparison data:
 * - Current fiscal year (derived from system date)
 * - Previous fiscal year
 * - Both in IEstimatingAnalytics format for side-by-side comparison
 *
 * Uses the adapter pattern from @hbc/data-access for dual-mode (PWA/SPFx) compatibility.
 *
 * @returns {Promise<IEstimatingAnalyticsComparison>}
 */
export async function fetchEstimatingAnalyticsComparison(): Promise<IEstimatingAnalyticsComparison> {
  const adapter = getEstimatingAdapter();
  return adapter.getAnalyticsComparison();
}
```

---

### 4. Data Models

**File:** `packages/models/src/estimating/IEstimatingAnalytics.ts` — **Modify**

Ensure the following models are defined. If already present from PH7-Estimating-1, verify they exist and match these signatures:

```typescript
/**
 * IMonthlyVolume
 *
 * Monthly submission and award volume for a single month
 */
export interface IMonthlyVolume {
  month: string; // formatted as "Jan", "Feb", etc.
  submitted: number;
  awarded: number;
}

/**
 * IEstimateTypeBreakdown
 *
 * Win rate analysis by estimate type
 */
export interface IEstimateTypeBreakdown {
  estimateType: string; // e.g., "Budget", "Design-Bid-Build", "Design-Build"
  count: number; // total submitted
  winRate: number; // percentage, e.g., 45.5
  totalAwardedValue: number; // in dollars
}

/**
 * IEstimatorBreakdown
 *
 * Win rate analysis by lead estimator
 */
export interface IEstimatorBreakdown {
  estimatorName: string;
  submitted: number;
  awarded: number;
  winRate: number; // percentage
  totalAwardedValue: number; // in dollars
}

/**
 * IEstimatingAnalytics
 *
 * Complete analytics snapshot for a fiscal year
 */
export interface IEstimatingAnalytics {
  fiscalYear: string; // e.g., "2026"
  totalSubmitted: number;
  totalAwarded: number;
  winRatePercent: number; // percentage, e.g., 45.5
  totalAwardedValue: number; // in dollars
  totalNotAwardedValue: number; // in dollars
  monthlyVolume: IMonthlyVolume[];
  byEstimateType: IEstimateTypeBreakdown[];
  byEstimator: IEstimatorBreakdown[];
}

/**
 * IEstimatingAnalyticsComparison
 *
 * Year-over-year comparison container
 */
export interface IEstimatingAnalyticsComparison {
  current: IEstimatingAnalytics;
  previous: IEstimatingAnalytics;
}
```

---

### 5. Package Dependency

**File:** `packages/features/estimating/package.json` — **Modify**

Ensure `recharts` is available. Add to `dependencies` or `devDependencies` (prefer inherited from `@hbc/ui-kit` if already present there):

```json
{
  "dependencies": {
    "recharts": "^2.10.0"
  }
}
```

**Alternatively**, if `recharts` is already a peer dependency or transitive dependency of `@hbc/ui-kit`, no change is needed. Verify by running:

```bash
pnpm list recharts
```

---

### 6. Routing

**File:** `apps/estimating/src/router/routes.ts` — **Modify**

Add the following route definition (if not already present):

```typescript
// Analytics page route
{
  path: '/analytics',
  component: lazy(() =>
    import('@hbc/features-estimating')
      .then((m) => ({ default: m.EstimateAnalyticsPage }))
  ),
  beforeLoad: requirePermission('estimating:read'),
  pendingComponent: () => <LoadingFallback />,
  errorComponent: ErrorBoundary,
},
```

---

## Verification

After implementing the page and components, verify:

1. **Build succeeds:**
   ```bash
   pnpm turbo run build
   ```

2. **Analytics page renders in dev-harness:**
   - Navigate to `/estimating/analytics`
   - Confirm the page loads with fiscal year selector and "Back to Log" button
   - Verify all four chart containers display (initially with loading fallbacks)
   - Wait for charts to load and verify data is displayed

3. **Charts render correctly:**
   - Monthly Volume chart shows blue and green bars
   - Estimate Type chart shows horizontal bars sorted by win rate
   - Estimator chart shows horizontal bars with custom tooltip on hover
   - Fiscal Year Comparison table displays with up/down indicators

4. **Fiscal year selection works:**
   - Select different fiscal years from dropdown (2026, 2025, 2024, 2023)
   - Confirm charts and KPIs update without page reload
   - Verify react query key includes fiscal year

5. **Navigation works:**
   - Click "Back to Log" button
   - Confirm navigation to `/estimating/log`

6. **RBAC enforced:**
   - Test without the `estimating:read` permission
   - Confirm the page is blocked and redirect to unauthorized page

7. **Lazy loading confirmed:**
   - Open browser DevTools → Network tab
   - Refresh analytics page
   - Monitor for separate chunk downloads for chart components
   - Verify MonthlyVolumeChart, EstimateTypeBreakdownChart, EstimatorBreakdownChart, FiscalYearComparisonTable are lazy-loaded

8. **Responsive design:**
   - Test at 375px (mobile), 768px (tablet), 1920px (desktop) widths
   - Confirm KPI cards stack correctly
   - Confirm table is readable on mobile (consider horizontal scroll if needed)

---

## Definition of Done

- [ ] `EstimateAnalyticsPage.tsx` created with all layout and toolbar logic
- [ ] `MonthlyVolumeChart.tsx` created and rendering recharts BarChart
- [ ] `EstimateTypeBreakdownChart.tsx` created and rendering horizontal BarChart with color-coding
- [ ] `EstimatorBreakdownChart.tsx` created and rendering horizontal BarChart with custom tooltip
- [ ] `FiscalYearComparisonTable.tsx` created and rendering comparison table
- [ ] `fetchEstimatingAnalytics` query hook defined in `estimatingQueries.ts`
- [ ] `fetchEstimatingAnalyticsComparison` query hook defined in `estimatingQueries.ts`
- [ ] All data models (`IMonthlyVolume`, `IEstimateTypeBreakdown`, `IEstimatorBreakdown`, `IEstimatingAnalytics`, `IEstimatingAnalyticsComparison`) defined in models package
- [ ] `recharts` dependency verified or added to package.json
- [ ] Route added to `apps/estimating/src/router/routes.ts` with RBAC guard
- [ ] Build passes: `pnpm turbo run build`
- [ ] All components render and charts display in dev-harness
- [ ] Fiscal year selection updates data without page reload
- [ ] RBAC enforcement verified
- [ ] Lazy loading verified in DevTools Network tab
- [ ] Responsive design verified at 375px, 768px, 1920px widths
- [ ] All imports use `@hbc/ui-kit`, not `@hbc/ui-kit/app-shell` (correct for PWA page)

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 7 (Analytics) plan created: 2026-03-08
Decision: Option C (dedicated analytics view with recharts) confirmed.
Ready for development. Next: PH7-Estimating-8 (Templates)
-->

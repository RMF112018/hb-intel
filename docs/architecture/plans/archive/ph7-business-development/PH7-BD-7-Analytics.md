# PH7-BD-7 — Business Development: Analytics

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-6 (Decisions, Versioning & Handoff) complete and passing build.
**Purpose:** Implement the BD Analytics page (`/bd/analytics`). Per Q64 (Option C), analytics are scoped to the individual BD Manager's own leads only. Covers: win rate, score distribution, criterion divergence, scoring trends over time, and breakdown by sector and region.

---

## Prerequisite Checks

Before starting this task:

- [ ] `IBdAnalyticsSummary`, `ICriterionDistribution`, `ICriterionDivergence`, `IScoresPeriodBucket`, `IBdManagerBreakdown`, `IBySectorBreakdown`, `IByRegionBreakdown` interfaces available from `@hbc/models`.
- [ ] `GET /api/bd/analytics` endpoint stub exists (or will be created in PH7-BD-8).
- [ ] recharts or equivalent charting library is available.
- [ ] `useBdRole()` hook returns `canViewAnalytics` flag.

---

## Task 1 — Analytics Route & Access Guard

**Route:** `/bd/analytics`

**Access rule (Q64 = Option C — BD Manager scoped to their own leads only):**
- BD Manager: can access, sees only their own scorecards' data.
- All other roles: route redirects to `/bd` with toast "Analytics are available to BD Managers only."

**Route guard:**
```typescript
beforeLoad: ({ context }) => {
  const role = context.auth?.bdAccessRole;
  if (role !== 'BdManager') {
    throw redirect({ to: '/bd' });
  }
}
```

---

## Task 2 — Analytics Page Layout

**Component:** `apps/pwa/src/routes/bd/analytics.tsx`

```
┌─ BD Analytics ────────────────────────────────────────────────┐
│  [Date Range Filter: Last 12 months ▼]                        │
│  [Sector Filter: All ▼]  [Region Filter: All ▼]              │
└──────────────────────────────────────────────────────────────┘

Row 1 — KPI Summary Cards
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Total Leads │  │  GO Rate    │  │ Avg Score   │  │ Avg Bid-to- │
│    {n}      │  │   {x}%      │  │  {n}/106    │  │  Decision   │
│             │  │             │  │             │  │  {n} days   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

Row 2 — Score Distribution & Win Rate Over Time
┌─ Score Distribution ────────┐  ┌─ Go/No-Go Trend (by Quarter) ┐
│  Bar chart: count of leads  │  │  Stacked bar: GO vs NO-GO     │
│  in each score bucket       │  │  per quarter                  │
│  (0-49, 50-64, 65-74,       │  │                               │
│   75-79, 80-106)            │  │                               │
└─────────────────────────────┘  └───────────────────────────────┘

Row 3 — Criterion Analysis
┌─ Average Score Per Criterion ──────────────────────────────────┐
│  Horizontal bar chart: 20 criteria × avg originator score     │
│  Color-coded: High/Average/Low zones                          │
│  Shows: {criterion name}  {avg score} / {max score}           │
└────────────────────────────────────────────────────────────────┘

┌─ Originator vs Committee Divergence ──────────────────────────┐
│  Horizontal bar chart: 20 criteria × avg |Orig - Comm| score  │
│  Highest divergence criteria at top                           │
└────────────────────────────────────────────────────────────────┘

Row 4 — Breakdown Tables
┌─ By Sector ─────────────────┐  ┌─ By Region ──────────────────┐
│  Sector │ Leads │ GO │ Rate │  │  Region │ Leads │ GO │ Rate   │
│  ───────┼───────┼────┼───── │  │  ───────┼───────┼────┼────── │
│  {data} │       │    │      │  │  {data} │       │    │       │
└─────────────────────────────┘  └──────────────────────────────┘
```

---

## Task 3 — Analytics Data Types (from `IBdAnalytics.ts`)

All data shapes are defined in `packages/models/src/bd/IBdAnalytics.ts` (created in PH7-BD-1). This task uses them as the contract for API responses and chart data:

**`IBdAnalyticsSummary`:**
```typescript
{
  totalLeads: number;
  totalGo: number;
  totalNoGo: number;
  totalClosed: number;
  goRate: number;               // Percentage (0–100)
  avgOriginatorTotal: number;
  avgCommitteeTotal: number;
  avgBidToDecisionDays: number;
  scoresDistribution: IScoresBucket[];
}
```

**`IScoresBucket`:**
```typescript
{ rangeLabel: string; count: number; }
// Ranges: '0–49', '50–64', '65–74', '75–79', '80–106'
```

**`ICriterionDistribution`:**
```typescript
{
  criterion: GoNoGoCriterion;
  criterionLabel: string;
  avgOriginatorScore: number;
  avgCommitteeScore: number;
  maxScore: number;     // highValue from CRITERION_DEFINITIONS
}
```

**`ICriterionDivergence`:**
```typescript
{
  criterion: GoNoGoCriterion;
  criterionLabel: string;
  avgAbsDivergence: number;   // avg |originator - committee|
  maxDivergence: number;
}
```

**`IScoresPeriodBucket`:**
```typescript
{
  periodLabel: string;  // e.g., 'Q1 2026'
  totalLeads: number;
  goCount: number;
  noGoCount: number;
}
```

**`IBySectorBreakdown` / `IByRegionBreakdown`:**
```typescript
{
  label: string;       // sector or region name
  totalLeads: number;
  goCount: number;
  noGoCount: number;
  goRate: number;
}
```

---

## Task 4 — Analytics Filter State

**Stored in `bdStore`** (extend from PH7-BD-2 Task 7):

```typescript
analyticsFilters: {
  dateRange: '3m' | '6m' | '12m' | '24m' | 'all';
  sector: ProjectSector | 'all';
  region: HbcRegion | 'all';
}
```

Filters are passed as query params to `GET /api/bd/analytics?bdManagerId={id}&dateRange={range}&sector={s}&region={r}`.

---

## Task 5 — Chart Components

**Files:**

| Component | Chart Type | Data Shape |
|---|---|---|
| `ScoreDistributionChart` | Vertical bar | `IScoresBucket[]` |
| `GoNoGoTrendChart` | Stacked bar (by quarter) | `IScoresPeriodBucket[]` |
| `CriterionAvgScoreChart` | Horizontal bar (20 criteria) | `ICriterionDistribution[]` |
| `CriterionDivergenceChart` | Horizontal bar (20 criteria) | `ICriterionDivergence[]` |
| `SectorBreakdownTable` | Table | `IBySectorBreakdown[]` |
| `RegionBreakdownTable` | Table | `IByRegionBreakdown[]` |

All chart components live in: `apps/pwa/src/components/bd/analytics/`

**Charting library:** Use recharts (available in ui-kit or installed in PWA app). Import: `import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'`.

**Accessibility:** All charts include `aria-label` descriptions and a tabular data fallback (collapsible "View data table" toggle below each chart).

---

## Task 6 — KPI Summary Cards

**Component:** `apps/pwa/src/components/bd/analytics/KpiSummaryCards.tsx`

Four `HbcCard` components in a responsive 4-column grid:

| Card | Value | Sub-label |
|---|---|---|
| Total Leads | `totalLeads` | "Scorecards submitted" |
| GO Rate | `{goRate}%` | `{totalGo} GO / {totalNoGo} NO-GO` |
| Avg Score | `{avgOriginatorTotal}/106` | `Committee: {avgCommitteeTotal}/106` |
| Avg Decision Time | `{avgBidToDecisionDays} days` | "Bid to decision" |

---

## Task 7 — Empty State

When the BD Manager has no scorecards yet, the analytics page shows:

```
No data yet. Once you submit your first scorecard, analytics will appear here.
```

When filter combination returns zero results:

```
No scorecards match the selected filters. Try adjusting the date range or removing filters.
```

---

## Task 8 — Data Fetching

**Hook:** `apps/pwa/src/hooks/useBdAnalytics.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

export function useBdAnalytics(filters: BdAnalyticsFilters) {
  return useQuery({
    queryKey: ['bd-analytics', filters],
    queryFn: () => fetchBdAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

API: `GET /api/bd/analytics?bdManagerId={id}&dateRange={range}&sector={s}&region={r}`

Returns: `IBdAnalyticsSummary` plus arrays for distribution, divergence, trend, sector, and region breakdowns.

---

## Task 9 — Verification

```bash
pnpm turbo run build
pnpm turbo run type-check

# Manual verification:
# 1. Navigate to /bd/analytics as BD Manager — page renders
# 2. Navigate to /bd/analytics as non-BD-Manager — redirected to /bd
# 3. KPI cards show correct values
# 4. Score distribution bars render correctly
# 5. Quarterly trend chart shows stacked GO/NO-GO bars
# 6. Criterion avg score chart shows all 20 criteria
# 7. Criterion divergence chart sorts by highest divergence
# 8. Sector and region breakdown tables render
# 9. Filter changes trigger re-fetch and update all charts
# 10. Empty state renders when no data
```

---

## Success Criteria

- [ ] BD-7.1 Analytics route is accessible only to BD Managers; all other roles redirected.
- [ ] BD-7.2 BD Manager sees only their own scorecards' data.
- [ ] BD-7.3 KPI summary cards show correct total leads, GO rate, avg score, avg decision time.
- [ ] BD-7.4 Score distribution chart renders 5 score buckets correctly.
- [ ] BD-7.5 Go/No-Go trend chart renders quarterly stacked bars.
- [ ] BD-7.6 Criterion average score chart renders all 20 criteria.
- [ ] BD-7.7 Criterion divergence chart sorts by highest average divergence.
- [ ] BD-7.8 Sector and region breakdown tables are correct.
- [ ] BD-7.9 Date range, sector, and region filters update all analytics data on change.
- [ ] BD-7.10 Empty state renders correctly when no data or no filter matches.
- [ ] BD-7.11 All charts include tabular data fallback for accessibility.
- [ ] BD-7.12 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-6 complete
-->

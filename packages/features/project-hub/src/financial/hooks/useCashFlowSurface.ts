/**
 * useCashFlowSurface — view-ready data hook for the Cash Flow surface.
 *
 * Role-aware, state-aware, complexity-aware.
 * Distinguishes evidence-backed actuals from projected months.
 * Uses existing computation functions from src/financial/cash-flow/.
 */

import { useMemo, useState, useCallback } from 'react';

import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

// ── View-Ready Types ────────────────────────────────────────────────

export type CashFlowSurfaceState = 'working' | 'review' | 'approved';

export interface CashFlowMonthRow {
  readonly id: string;
  readonly calendarDate: string;
  readonly periodMonth: number;
  readonly recordType: 'actual' | 'forecast';
  readonly inflows: number;
  readonly outflows: number;
  readonly netCashFlow: number;
  readonly cumulativeCashFlow: number;
  readonly retentionHeld: number;
  readonly confidenceScore: number | null;
  readonly forecastAccuracy: number | null;
  readonly isEditable: boolean;
  readonly isDeficit: boolean;
  readonly notes: string | null;
}

export interface CashFlowKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly severity: 'healthy' | 'watch' | 'at-risk' | 'critical' | 'neutral';
  readonly trend: 'up' | 'down' | 'flat';
  readonly trendLabel: string;
}

export interface CashFlowARBucket {
  readonly label: string;
  readonly amount: number;
  readonly isOverdue: boolean;
}

export interface CashFlowARSummary {
  readonly totalAR: number;
  readonly retainage: number;
  readonly buckets: readonly CashFlowARBucket[];
  readonly refreshedAt: string;
  readonly evidenceStatus: 'current' | 'stale' | 'missing';
}

export interface CashFlowTrendPoint {
  readonly month: string;
  readonly actual: number | null;
  readonly forecast: number | null;
  readonly cumulative: number;
  readonly isDeficit: boolean;
}

export interface CashFlowManualCorrection {
  readonly id: string;
  readonly month: string;
  readonly field: string;
  readonly originalValue: number;
  readonly correctedValue: number;
  readonly reason: string;
  readonly actor: string;
  readonly timestamp: string;
}

export interface CashFlowSurfaceData {
  readonly surfaceState: CashFlowSurfaceState;
  readonly kpis: readonly CashFlowKpi[];
  readonly months: readonly CashFlowMonthRow[];
  readonly arSummary: CashFlowARSummary;
  readonly trendPoints: readonly CashFlowTrendPoint[];
  readonly manualCorrections: readonly CashFlowManualCorrection[];
  readonly selectedMonthId: string | null;
  readonly selectMonth: (monthId: string | null) => void;
  readonly canEditForecasts: boolean;
  readonly editForecast: (monthId: string, field: 'inflows' | 'outflows', value: number) => void;
  readonly dirtyMonths: ReadonlySet<string>;
  readonly hasUnsavedChanges: boolean;
  readonly peakCashRequirement: number;
  readonly cashFlowAtRisk: number;
}

// ── Mock Data ───────────────────────────────────────────────────────

function buildMonths(isEditable: boolean): CashFlowMonthRow[] {
  const actuals: CashFlowMonthRow[] = [
    { id: 'cf-2024-06', calendarDate: '2024-06', periodMonth: 1, recordType: 'actual', inflows: 148134, outflows: 280809, netCashFlow: -132675, cumulativeCashFlow: -132675, retentionHeld: 6666, confidenceScore: null, forecastAccuracy: 86, isEditable: false, isDeficit: true, notes: null },
    { id: 'cf-2024-07', calendarDate: '2024-07', periodMonth: 2, recordType: 'actual', inflows: 351206, outflows: 249327, netCashFlow: 101879, cumulativeCashFlow: -30796, retentionHeld: 22470, confidenceScore: null, forecastAccuracy: 92, isEditable: false, isDeficit: true, notes: null },
    { id: 'cf-2024-08', calendarDate: '2024-08', periodMonth: 3, recordType: 'actual', inflows: 685672, outflows: 425183, netCashFlow: 260489, cumulativeCashFlow: 229693, retentionHeld: 56754, confidenceScore: null, forecastAccuracy: 88, isEditable: false, isDeficit: false, notes: null },
    { id: 'cf-2024-09', calendarDate: '2024-09', periodMonth: 4, recordType: 'actual', inflows: 892450, outflows: 612340, netCashFlow: 280110, cumulativeCashFlow: 509803, retentionHeld: 101290, confidenceScore: null, forecastAccuracy: 91, isEditable: false, isDeficit: false, notes: null },
  ];

  const forecasts: CashFlowMonthRow[] = [
    { id: 'cf-2024-10', calendarDate: '2024-10', periodMonth: 5, recordType: 'forecast', inflows: 750000, outflows: 580000, netCashFlow: 170000, cumulativeCashFlow: 679803, retentionHeld: 138790, confidenceScore: 85, forecastAccuracy: null, isEditable, isDeficit: false, notes: 'Major subcontractor payments expected' },
    { id: 'cf-2024-11', calendarDate: '2024-11', periodMonth: 6, recordType: 'forecast', inflows: 620000, outflows: 710000, netCashFlow: -90000, cumulativeCashFlow: 589803, retentionHeld: 169790, confidenceScore: 72, forecastAccuracy: null, isEditable, isDeficit: false, notes: 'Equipment mobilization peak' },
    { id: 'cf-2024-12', calendarDate: '2024-12', periodMonth: 7, recordType: 'forecast', inflows: 830000, outflows: 540000, netCashFlow: 290000, cumulativeCashFlow: 879803, retentionHeld: 211290, confidenceScore: 68, forecastAccuracy: null, isEditable, isDeficit: false, notes: null },
    { id: 'cf-2025-01', calendarDate: '2025-01', periodMonth: 8, recordType: 'forecast', inflows: 480000, outflows: 620000, netCashFlow: -140000, cumulativeCashFlow: 739803, retentionHeld: 235290, confidenceScore: 55, forecastAccuracy: null, isEditable, isDeficit: false, notes: 'Seasonal slowdown expected' },
  ];

  return [...actuals, ...forecasts];
}

const MOCK_KPIS: CashFlowKpi[] = [
  { id: 'cash-position', label: 'Current Cash Position', value: '$509,803', severity: 'healthy', trend: 'up', trendLabel: '+$280K this month' },
  { id: 'peak-requirement', label: 'Peak Cash Requirement', value: '-$132,675', severity: 'watch', trend: 'flat', trendLabel: 'Month 1 remains peak' },
  { id: 'at-risk', label: 'Cash Flow at Risk', value: '$0', severity: 'healthy', trend: 'flat', trendLabel: 'No deficit projected' },
  { id: 'near-term', label: 'Near-Term Exposure', value: '-$90K', severity: 'watch', trend: 'down', trendLabel: 'Nov equipment peak' },
  { id: 'collection', label: 'A/R Collection', value: '$114,144', severity: 'healthy', trend: 'flat', trendLabel: 'Aging stable' },
];

const MOCK_AR: CashFlowARSummary = {
  totalAR: 114144,
  retainage: 22470,
  buckets: [
    { label: 'Current (0-30)', amount: 55489, isOverdue: false },
    { label: '31-60 days', amount: 58655, isOverdue: false },
    { label: '61-90 days', amount: 0, isOverdue: false },
    { label: '90+ days', amount: 0, isOverdue: true },
  ],
  refreshedAt: '2026-03-27T08:00:00Z',
  evidenceStatus: 'current',
};

// ── State Resolution ────────────────────────────────────────────────

function resolveSurfaceState(viewerRole: FinancialViewerRole): CashFlowSurfaceState {
  if (viewerRole === 'pm') return 'working';
  if (viewerRole === 'pe' || viewerRole === 'leadership') return 'review';
  return 'working';
}

// ── Hook ─────────────────────────────────────────────────────────────

export interface UseCashFlowSurfaceOptions {
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
}

export function useCashFlowSurface(options?: UseCashFlowSurfaceOptions): CashFlowSurfaceData {
  const viewerRole = options?.viewerRole ?? 'pm';
  const complexity = options?.complexityTier ?? 'standard';

  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [dirtyMonthMap, setDirtyMonthMap] = useState<Map<string, Record<string, number>>>(new Map());

  const surfaceState = resolveSurfaceState(viewerRole);
  const canEditForecasts = surfaceState === 'working' && viewerRole === 'pm';

  const selectMonth = useCallback((monthId: string | null) => {
    setSelectedMonthId((prev) => (prev === monthId ? null : monthId));
  }, []);

  const editForecast = useCallback((monthId: string, field: 'inflows' | 'outflows', value: number) => {
    if (!canEditForecasts) return;
    setDirtyMonthMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(monthId) ?? {};
      next.set(monthId, { ...existing, [field]: value });
      return next;
    });
  }, [canEditForecasts]);

  const months = useMemo(() => buildMonths(canEditForecasts), [canEditForecasts]);
  const dirtyMonths = useMemo(() => new Set(dirtyMonthMap.keys()), [dirtyMonthMap]);

  const filteredKpis = complexity === 'essential' ? MOCK_KPIS.slice(0, 3) : MOCK_KPIS;

  const trendPoints: CashFlowTrendPoint[] = months.map((m) => ({
    month: m.calendarDate,
    actual: m.recordType === 'actual' ? m.cumulativeCashFlow : null,
    forecast: m.recordType === 'forecast' ? m.cumulativeCashFlow : null,
    cumulative: m.cumulativeCashFlow,
    isDeficit: m.isDeficit,
  }));

  return useMemo(
    () => ({
      surfaceState,
      kpis: filteredKpis,
      months,
      arSummary: MOCK_AR,
      trendPoints,
      manualCorrections: [],
      selectedMonthId,
      selectMonth,
      canEditForecasts,
      editForecast,
      dirtyMonths,
      hasUnsavedChanges: dirtyMonthMap.size > 0,
      peakCashRequirement: -132675,
      cashFlowAtRisk: 0,
    }),
    [surfaceState, filteredKpis, months, trendPoints, selectedMonthId, selectMonth, canEditForecasts, editForecast, dirtyMonths, dirtyMonthMap.size],
  );
}

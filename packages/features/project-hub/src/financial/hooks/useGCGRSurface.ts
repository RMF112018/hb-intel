/**
 * useGCGRSurface — view-ready data hook for the GC/GR Forecast surface.
 *
 * Mock data initially. Will wire to IFinancialRepository.
 * Stage 2 — Architecturally Defined (blocked on T04: IGCGRLine).
 */

import { useMemo } from 'react';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

export interface GCGRLineRow {
  readonly id: string;
  readonly division: string;
  readonly description: string;
  readonly budgetAmount: number;
  readonly forecastAmount: number;
  readonly varianceAmount: number;
  readonly variancePercent: number;
  readonly isOverBudget: boolean;
}

export interface GCGRSummary {
  readonly totalBudget: number;
  readonly totalForecast: number;
  readonly totalVariance: number;
  readonly lineCount: number;
  readonly overBudgetCount: number;
}

export interface GCGRSurfaceData {
  readonly lines: readonly GCGRLineRow[];
  readonly summary: GCGRSummary;
  readonly versionState: string;
  readonly isEditable: boolean;
  readonly reportingMonth: string;
}

const MOCK_LINES: GCGRLineRow[] = [
  { id: 'gcgr-1', division: '01', description: 'Project Management', budgetAmount: 180000, forecastAmount: 195000, varianceAmount: 15000, variancePercent: 8.3, isOverBudget: true },
  { id: 'gcgr-2', division: '02', description: 'Temporary Facilities', budgetAmount: 120000, forecastAmount: 110000, varianceAmount: -10000, variancePercent: -8.3, isOverBudget: false },
  { id: 'gcgr-3', division: '03', description: 'Safety & Protection', budgetAmount: 85000, forecastAmount: 82000, varianceAmount: -3000, variancePercent: -3.5, isOverBudget: false },
  { id: 'gcgr-4', division: '04', description: 'Equipment & Tools', budgetAmount: 65000, forecastAmount: 71000, varianceAmount: 6000, variancePercent: 9.2, isOverBudget: true },
  { id: 'gcgr-5', division: '05', description: 'Cleaning & Waste', budgetAmount: 45000, forecastAmount: 43000, varianceAmount: -2000, variancePercent: -4.4, isOverBudget: false },
];

export function useGCGRSurface(_options?: {
  viewerRole?: FinancialViewerRole;
  complexityTier?: FinancialComplexityTier;
}): GCGRSurfaceData {
  return useMemo(() => {
    const summary: GCGRSummary = {
      totalBudget: MOCK_LINES.reduce((s, l) => s + l.budgetAmount, 0),
      totalForecast: MOCK_LINES.reduce((s, l) => s + l.forecastAmount, 0),
      totalVariance: MOCK_LINES.reduce((s, l) => s + l.varianceAmount, 0),
      lineCount: MOCK_LINES.length,
      overBudgetCount: MOCK_LINES.filter((l) => l.isOverBudget).length,
    };

    return {
      lines: MOCK_LINES,
      summary,
      versionState: 'Working',
      isEditable: true,
      reportingMonth: 'March 2026',
    };
  }, []);
}

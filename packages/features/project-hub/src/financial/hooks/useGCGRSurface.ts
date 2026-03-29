/**
 * useGCGRSurface — view-ready data hook for the GC/GR Forecast surface.
 *
 * Wave 3B.1: facade-aware — sources GC/GR lines and rollup from
 * GCGRService via IFinancialRepository. Falls back to inline mock
 * data when facade data is loading.
 */

import { useMemo, useState, useEffect } from 'react';
import { useFinancialRepository } from './useFinancialRepository.js';
import { GCGRService } from '../services/GCGRService.js';
import type { GCGRLoadResult } from '../services/GCGRService.js';
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
  const repo = useFinancialRepository();
  const [facadeResult, setFacadeResult] = useState<GCGRLoadResult | null>(null);

  useEffect(() => {
    const service = new GCGRService(repo);
    service.load('proj-uuid-001', '2026-03').then(setFacadeResult).catch(() => {});
  }, [repo]);

  return useMemo(() => {
    // Use facade data when available, fall back to inline mock
    if (facadeResult) {
      return {
        lines: facadeResult.lines.map((l) => ({
          id: l.lineId,
          division: l.divisionCode,
          description: l.divisionDescription,
          budgetAmount: l.budgetAmount,
          forecastAmount: l.forecastAmount,
          varianceAmount: l.varianceAmount,
          variancePercent: l.budgetAmount !== 0 ? (l.varianceAmount / l.budgetAmount) * 100 : 0,
          isOverBudget: l.varianceAmount > 0,
        })),
        summary: {
          totalBudget: facadeResult.rollup.totalBudget,
          totalForecast: facadeResult.rollup.totalForecast,
          totalVariance: facadeResult.rollup.totalVariance,
          lineCount: facadeResult.rollup.lineCount,
          overBudgetCount: facadeResult.rollup.overBudgetLineCount,
        },
        versionState: (facadeResult.posture.currentVersionState as string) ?? 'Working',
        isEditable: facadeResult.isEditable,
        reportingMonth: facadeResult.posture.reportingPeriod,
      };
    }

    // Fallback to inline mock data
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
  }, [facadeResult]);
}

/**
 * useGCGRPosture — GC/GR Forecast operational posture hook.
 *
 * Wave 3B.3: computes the full operational posture for the GC/GR surface
 * by combining GCGRService load results with governance rules, role-aware
 * editability, rollup integrity, and blocker/warning evaluation.
 *
 * Exposes the narrow Forecast Summary rollup seam via gcgrTotalVariance.
 */

import { useMemo, useState, useEffect } from 'react';
import type { FinancialVersionState } from '../types/index.js';
import { useFinancialRepository } from './useFinancialRepository.js';
import { GCGRService } from '../services/GCGRService.js';
import type { GCGRLoadResult, GCGRDivisionGroup } from '../services/GCGRService.js';
import type { FinancialViewerRole } from './useFinancialControlCenter.js';
import type { IFinancialModulePosture } from '@hbc/data-access';

// ── Types ──────────────────────────────────────────────────────────────

export type GCGRPostureState =
  | 'editable'
  | 'view-only'
  | 'blocked'
  | 'warning'
  | 'stale'
  | 'loading'
  | 'error';

export interface GCGRPostureBlocker {
  readonly id: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly actionLabel?: string;
  readonly actionToolSlug?: string;
}

export interface GCGRRollupIntegrity {
  /** Total variance across all lines — feeds IFinancialForecastSummary.gcgrTotalVariance */
  readonly totalVariance: number;
  /** Total budget for all lines. */
  readonly totalBudget: number;
  /** Total forecast for all lines. */
  readonly totalForecast: number;
  /** Number of over-budget lines. */
  readonly overBudgetCount: number;
  /** Total line count. */
  readonly lineCount: number;
  /** Whether the rollup is internally consistent (no computation drift). */
  readonly isConsistent: boolean;
  /** Category breakdown for worksheet-aligned visibility. */
  readonly categoryGroups: readonly GCGRDivisionGroup[];
}

export interface GCGRPosture {
  readonly state: GCGRPostureState;
  readonly label: string;
  readonly canEdit: boolean;
  readonly isStale: boolean;
  readonly blockers: readonly GCGRPostureBlocker[];
  readonly warnings: readonly GCGRPostureBlocker[];
  readonly rollup: GCGRRollupIntegrity;
  readonly versionState: FinancialVersionState | null;
  readonly versionNumber: number | null;
  readonly reportingPeriod: string | null;
  readonly isLoading: boolean;
  readonly modulePosture: IFinancialModulePosture | null;
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useGCGRPosture(
  projectId: string,
  reportingPeriod: string,
  viewerRole: FinancialViewerRole = 'pm',
): GCGRPosture {
  const repo = useFinancialRepository();
  const [loadResult, setLoadResult] = useState<GCGRLoadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const service = new GCGRService(repo);
    service.load(projectId, reportingPeriod)
      .then((result) => {
        setLoadResult(result);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setIsLoading(false);
      });
  }, [repo, projectId, reportingPeriod]);

  return useMemo(() => {
    if (isLoading) return createLoadingPosture();
    if (error || !loadResult) return createErrorPosture(error ?? 'No data');

    const posture = loadResult.posture;
    const versionState = posture.currentVersionState as FinancialVersionState | null;
    const service = new GCGRService(repo);

    // ── Blockers ─────────────────────────────────────────────────
    const blockers: GCGRPostureBlocker[] = [];
    const warnings: GCGRPostureBlocker[] = [];

    if (posture.staleBudgetLineCount > 0) {
      blockers.push({
        id: 'stale-budget',
        message: `${posture.staleBudgetLineCount} unresolved reconciliation condition${posture.staleBudgetLineCount > 1 ? 's' : ''} — GC/GR lines may reference stale budget data`,
        severity: 'warning',
        actionLabel: 'Resolve in Budget',
        actionToolSlug: 'budget',
      });
    }

    // Over-budget warning
    if (loadResult.rollup.overBudgetLineCount > 0) {
      warnings.push({
        id: 'over-budget-lines',
        message: `${loadResult.rollup.overBudgetLineCount} division${loadResult.rollup.overBudgetLineCount > 1 ? 's' : ''} over budget — review forecast amounts`,
        severity: 'warning',
      });
    }

    // Large total variance warning (> 10% of total budget)
    const variancePercent = loadResult.rollup.totalBudget > 0
      ? Math.abs(loadResult.rollup.totalVariance / loadResult.rollup.totalBudget) * 100
      : 0;
    if (variancePercent > 10) {
      warnings.push({
        id: 'large-variance',
        message: `Total GC/GR variance is ${variancePercent.toFixed(1)}% of budget — this will affect Forecast Summary`,
        severity: 'warning',
      });
    }

    // ── Editability ──────────────────────────────────────────────
    const canEdit = versionState === 'Working' && viewerRole === 'pm';
    const isStale = posture.staleBudgetLineCount > 0;

    // ── Rollup integrity ─────────────────────────────────────────
    const categoryGroups = service.groupByCategory(loadResult.lines);
    const computedVariance = loadResult.lines.reduce((sum, l) => sum + l.varianceAmount, 0);
    const isConsistent = Math.abs(computedVariance - loadResult.rollup.totalVariance) < 0.01;

    // ── Overall state ────────────────────────────────────────────
    let state: GCGRPostureState;
    let label: string;

    if (isStale) {
      state = 'stale';
      label = 'Budget data stale — reconciliation required before GC/GR values are reliable';
    } else if (canEdit) {
      state = warnings.length > 0 ? 'warning' : 'editable';
      label = warnings.length > 0 ? 'Editable with warnings' : 'Working draft — PM can edit';
    } else if (versionState === 'ConfirmedInternal' || versionState === 'PublishedMonthly') {
      state = 'view-only';
      label = versionState === 'ConfirmedInternal' ? 'Confirmed — immutable' : 'Published — immutable';
    } else if (versionState === 'Superseded') {
      state = 'view-only';
      label = 'Superseded — historical record';
    } else {
      state = 'view-only';
      label = 'Read-only';
    }

    return {
      state,
      label,
      canEdit,
      isStale,
      blockers,
      warnings,
      rollup: {
        totalVariance: loadResult.rollup.totalVariance,
        totalBudget: loadResult.rollup.totalBudget,
        totalForecast: loadResult.rollup.totalForecast,
        overBudgetCount: loadResult.rollup.overBudgetLineCount,
        lineCount: loadResult.rollup.lineCount,
        isConsistent,
        categoryGroups,
      },
      versionState,
      versionNumber: posture.currentVersionNumber,
      reportingPeriod: posture.reportingPeriod,
      isLoading: false,
      modulePosture: posture,
    };
  }, [loadResult, isLoading, error, viewerRole, repo]);
}

// ── Helpers ────────────────────────────────────────────────────────────

function createLoadingPosture(): GCGRPosture {
  return {
    state: 'loading', label: 'Loading GC/GR data...',
    canEdit: false, isStale: false, blockers: [], warnings: [],
    rollup: { totalVariance: 0, totalBudget: 0, totalForecast: 0, overBudgetCount: 0, lineCount: 0, isConsistent: true, categoryGroups: [] },
    versionState: null, versionNumber: null, reportingPeriod: null,
    isLoading: true, modulePosture: null,
  };
}

function createErrorPosture(error: string): GCGRPosture {
  return {
    state: 'error', label: `Error: ${error}`,
    canEdit: false, isStale: false,
    blockers: [{ id: 'error', message: error, severity: 'error' }],
    warnings: [],
    rollup: { totalVariance: 0, totalBudget: 0, totalForecast: 0, overBudgetCount: 0, lineCount: 0, isConsistent: true, categoryGroups: [] },
    versionState: null, versionNumber: null, reportingPeriod: null,
    isLoading: false, modulePosture: null,
  };
}

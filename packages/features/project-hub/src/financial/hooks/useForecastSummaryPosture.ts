/**
 * useForecastSummaryPosture — Forecast Summary operational posture hook.
 *
 * Wave 3A.3: computes the full operational posture for the Forecast Summary
 * surface by combining ForecastSummaryService load results with governance
 * rules, role-aware editability, and blocker/warning/stale evaluation.
 *
 * This hook drives all posture rendering decisions in ForecastSummaryPage.
 * It sources truth from the Financial repository facade, not inline state.
 */

import { useMemo, useState, useEffect } from 'react';
import type { FinancialVersionState } from '../types/index.js';
import { useFinancialRepository } from './useFinancialRepository.js';
import { ForecastSummaryService } from '../services/ForecastSummaryService.js';
import type { ForecastSummaryLoadResult } from '../services/ForecastSummaryService.js';
import type { FinancialViewerRole } from './useFinancialControlCenter.js';
import type { IFinancialModulePosture } from '@hbc/data-access';

// ── Types ──────────────────────────────────────────────────────────────

export type ForecastPostureState =
  | 'editable'
  | 'view-only'
  | 'blocked'
  | 'warning'
  | 'stale'
  | 'waiting'
  | 'loading'
  | 'error';

export interface ForecastPostureBlocker {
  readonly id: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly actionLabel?: string;
  readonly actionToolSlug?: string;
}

export interface ForecastSummaryPosture {
  /** Overall posture state for the surface. */
  readonly state: ForecastPostureState;
  /** Human-readable posture label. */
  readonly label: string;
  /** Can the PM edit fields on this surface right now? */
  readonly canEdit: boolean;
  /** Can the PM confirm this version right now? */
  readonly canConfirm: boolean;
  /** Can the PM derive a new version from this one? */
  readonly canDerive: boolean;
  /** Is the data stale (unresolved reconciliation conditions)? */
  readonly isStale: boolean;
  /** Active blockers preventing forward progress. */
  readonly blockers: readonly ForecastPostureBlocker[];
  /** Active warnings that don't block but need attention. */
  readonly warnings: readonly ForecastPostureBlocker[];
  /** Version state from the facade. */
  readonly versionState: FinancialVersionState | null;
  /** Version number. */
  readonly versionNumber: number | null;
  /** Reporting period. */
  readonly reportingPeriod: string | null;
  /** Checklist progress. */
  readonly checklistCompleted: number;
  readonly checklistRequired: number;
  readonly checklistTotal: number;
  /** Is data still loading from the facade? */
  readonly isLoading: boolean;
  /** Module posture from the facade for upstream consumption. */
  readonly modulePosture: IFinancialModulePosture | null;
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useForecastSummaryPosture(
  projectId: string,
  reportingPeriod: string,
  viewerRole: FinancialViewerRole = 'pm',
): ForecastSummaryPosture {
  const repo = useFinancialRepository();
  const [loadResult, setLoadResult] = useState<ForecastSummaryLoadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const service = new ForecastSummaryService(repo);
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
    if (isLoading) {
      return createLoadingPosture();
    }

    if (error || !loadResult) {
      return createErrorPosture(error ?? 'No data');
    }

    const posture = loadResult.posture;
    const versionState = posture.currentVersionState as FinancialVersionState | null;

    // ── Blockers ─────────────────────────────────────────────────
    const blockers: ForecastPostureBlocker[] = [];
    const warnings: ForecastPostureBlocker[] = [];

    if (posture.staleBudgetLineCount > 0) {
      blockers.push({
        id: 'stale-budget',
        message: `${posture.staleBudgetLineCount} unresolved reconciliation condition${posture.staleBudgetLineCount > 1 ? 's' : ''} — confirmation blocked`,
        severity: 'error',
        actionLabel: 'Resolve in Budget',
        actionToolSlug: 'budget',
      });
    }

    if (posture.checklistCompleted < posture.checklistRequired) {
      const remaining = posture.checklistRequired - posture.checklistCompleted;
      blockers.push({
        id: 'checklist-incomplete',
        message: `${remaining} required checklist item${remaining > 1 ? 's' : ''} incomplete — confirmation blocked`,
        severity: 'warning',
        actionLabel: 'Open Checklist',
        actionToolSlug: 'checklist',
      });
    }

    // Profit margin warning (non-blocking)
    if (loadResult.summary && loadResult.summary.profitMargin < 5) {
      warnings.push({
        id: 'low-profit-margin',
        message: `Profit margin at ${loadResult.summary.profitMargin.toFixed(1)}% — below 5% warning threshold`,
        severity: 'warning',
      });
    }

    // ── Editability ──────────────────────────────────────────────
    const canEdit = versionState === 'Working' && viewerRole === 'pm';
    const canConfirm = canEdit && blockers.length === 0 && posture.confirmationGateCanPass;
    const canDerive = versionState === 'ConfirmedInternal' || versionState === 'PublishedMonthly';
    const isStale = posture.staleBudgetLineCount > 0;

    // ── Overall state ────────────────────────────────────────────
    let state: ForecastPostureState;
    let label: string;

    if (blockers.length > 0 && versionState === 'Working') {
      state = 'blocked';
      label = `${blockers.length} blocker${blockers.length > 1 ? 's' : ''} — resolve before confirming`;
    } else if (isStale) {
      state = 'stale';
      label = 'Stale data — reconciliation required';
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
      canConfirm,
      canDerive,
      isStale,
      blockers,
      warnings,
      versionState,
      versionNumber: posture.currentVersionNumber,
      reportingPeriod: posture.reportingPeriod,
      checklistCompleted: posture.checklistCompleted,
      checklistRequired: posture.checklistRequired,
      checklistTotal: posture.checklistTotal,
      isLoading: false,
      modulePosture: posture,
    };
  }, [loadResult, isLoading, error, viewerRole]);
}

// ── Helpers ────────────────────────────────────────────────────────────

function createLoadingPosture(): ForecastSummaryPosture {
  return {
    state: 'loading',
    label: 'Loading forecast summary...',
    canEdit: false,
    canConfirm: false,
    canDerive: false,
    isStale: false,
    blockers: [],
    warnings: [],
    versionState: null,
    versionNumber: null,
    reportingPeriod: null,
    checklistCompleted: 0,
    checklistRequired: 0,
    checklistTotal: 0,
    isLoading: true,
    modulePosture: null,
  };
}

function createErrorPosture(error: string): ForecastSummaryPosture {
  return {
    state: 'error',
    label: `Error: ${error}`,
    canEdit: false,
    canConfirm: false,
    canDerive: false,
    isStale: false,
    blockers: [{ id: 'error', message: error, severity: 'error' }],
    warnings: [],
    versionState: null,
    versionNumber: null,
    reportingPeriod: null,
    checklistCompleted: 0,
    checklistRequired: 0,
    checklistTotal: 0,
    isLoading: false,
    modulePosture: null,
  };
}

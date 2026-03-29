/**
 * useBudgetImportPosture — Budget Import operational posture hook.
 *
 * Wave 3C.3: computes the full operational posture for the Budget Import
 * surface by combining BudgetImportService load results with governance
 * rules, reconciliation state, downstream stale-state impact, and
 * role-aware actionability.
 */

import { useMemo, useState, useEffect } from 'react';
import type { FinancialVersionState } from '../types/index.js';
import { useFinancialRepository } from './useFinancialRepository.js';
import { BudgetImportService } from '../services/BudgetImportService.js';
import type { BudgetImportLoadResult } from '../services/BudgetImportService.js';
import type { FinancialViewerRole } from './useFinancialControlCenter.js';
import type { IFinancialModulePosture } from '@hbc/data-access';

// ── Types ──────────────────────────────────────────────────────────────

export type BudgetImportPostureState =
  | 'actionable'
  | 'blocked'
  | 'warning'
  | 'invalid'
  | 'unmatched'
  | 'waiting'
  | 'loading'
  | 'error';

export interface BudgetImportPostureBlocker {
  readonly id: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly actionLabel?: string;
}

export interface BudgetImportDownstreamImpact {
  /** Pending reconciliation conditions block confirmation gate G3. */
  readonly confirmationBlocked: boolean;
  /** Number of stale budget lines affecting downstream forecast accuracy. */
  readonly staleBudgetLineCount: number;
  /** Budget changes may invalidate GC/GR variance and forecast summary. */
  readonly forecastImpacted: boolean;
}

export interface BudgetImportPosture {
  readonly state: BudgetImportPostureState;
  readonly label: string;
  readonly canImport: boolean;
  readonly canResolveCon: boolean;
  readonly canEditFTC: boolean;
  readonly isImportBlocked: boolean;
  readonly blockers: readonly BudgetImportPostureBlocker[];
  readonly warnings: readonly BudgetImportPostureBlocker[];
  readonly downstream: BudgetImportDownstreamImpact;
  readonly lineCount: number;
  readonly pendingConditionCount: number;
  readonly versionState: FinancialVersionState | null;
  readonly reportingPeriod: string | null;
  readonly isLoading: boolean;
  readonly modulePosture: IFinancialModulePosture | null;
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useBudgetImportPosture(
  projectId: string,
  reportingPeriod: string,
  viewerRole: FinancialViewerRole = 'pm',
): BudgetImportPosture {
  const repo = useFinancialRepository();
  const [loadResult, setLoadResult] = useState<BudgetImportLoadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const service = new BudgetImportService(repo);
    service.load(projectId, reportingPeriod)
      .then((result) => { setLoadResult(result); setIsLoading(false); })
      .catch((err) => { setError(err instanceof Error ? err.message : 'Failed to load'); setIsLoading(false); });
  }, [repo, projectId, reportingPeriod]);

  return useMemo(() => {
    if (isLoading) return createLoadingPosture();
    if (error || !loadResult) return createErrorPosture(error ?? 'No data');

    const posture = loadResult.posture;
    const versionState = posture.currentVersionState as FinancialVersionState | null;
    const isPM = viewerRole === 'pm';
    const isWorking = versionState === 'Working';

    // ── Blockers ─────────────────────────────────────────────────
    const blockers: BudgetImportPostureBlocker[] = [];
    const warnings: BudgetImportPostureBlocker[] = [];

    if (loadResult.isImportBlocked) {
      blockers.push({
        id: 'import-blocked',
        message: loadResult.blockReason ?? 'Import requires a Working version',
        severity: 'error',
      });
    }

    if (loadResult.pendingConditionCount > 0) {
      blockers.push({
        id: 'pending-reconciliation',
        message: `${loadResult.pendingConditionCount} reconciliation condition${loadResult.pendingConditionCount > 1 ? 's' : ''} pending — confirmation blocked (gate G3)`,
        severity: 'error',
        actionLabel: 'Resolve conditions',
      });
    }

    if (!isPM && isWorking) {
      warnings.push({
        id: 'non-pm-view',
        message: 'Budget import and FTC editing require PM role',
        severity: 'info',
      });
    }

    // ── Downstream impact ────────────────────────────────────────
    const downstream: BudgetImportDownstreamImpact = {
      confirmationBlocked: loadResult.pendingConditionCount > 0,
      staleBudgetLineCount: loadResult.staleBudgetLineCount,
      forecastImpacted: loadResult.staleBudgetLineCount > 0 || loadResult.pendingConditionCount > 0,
    };

    // ── Actionability ────────────────────────────────────────────
    const canImport = isPM && isWorking && !loadResult.isImportBlocked;
    const canResolveCon = isPM && isWorking && loadResult.pendingConditionCount > 0;
    const canEditFTC = isPM && isWorking;

    // ── Overall state ────────────────────────────────────────────
    let state: BudgetImportPostureState;
    let label: string;

    if (loadResult.isImportBlocked) {
      state = 'blocked';
      label = 'Import blocked — version is not Working';
    } else if (loadResult.pendingConditionCount > 0) {
      state = 'unmatched';
      label = `${loadResult.pendingConditionCount} unresolved reconciliation condition${loadResult.pendingConditionCount > 1 ? 's' : ''}`;
    } else if (warnings.length > 0) {
      state = 'warning';
      label = 'View-only for non-PM roles';
    } else if (canImport) {
      state = 'actionable';
      label = 'Ready for import or FTC editing';
    } else {
      state = 'waiting';
      label = 'Read-only';
    }

    return {
      state, label,
      canImport, canResolveCon, canEditFTC,
      isImportBlocked: loadResult.isImportBlocked,
      blockers, warnings, downstream,
      lineCount: loadResult.lines.length,
      pendingConditionCount: loadResult.pendingConditionCount,
      versionState,
      reportingPeriod: posture.reportingPeriod,
      isLoading: false,
      modulePosture: posture,
    };
  }, [loadResult, isLoading, error, viewerRole]);
}

// ── Helpers ────────────────────────────────────────────────────────────

function createLoadingPosture(): BudgetImportPosture {
  return {
    state: 'loading', label: 'Loading budget data...',
    canImport: false, canResolveCon: false, canEditFTC: false,
    isImportBlocked: false, blockers: [], warnings: [],
    downstream: { confirmationBlocked: false, staleBudgetLineCount: 0, forecastImpacted: false },
    lineCount: 0, pendingConditionCount: 0,
    versionState: null, reportingPeriod: null,
    isLoading: true, modulePosture: null,
  };
}

function createErrorPosture(error: string): BudgetImportPosture {
  return {
    state: 'error', label: `Error: ${error}`,
    canImport: false, canResolveCon: false, canEditFTC: false,
    isImportBlocked: false,
    blockers: [{ id: 'error', message: error, severity: 'error' }],
    warnings: [],
    downstream: { confirmationBlocked: false, staleBudgetLineCount: 0, forecastImpacted: false },
    lineCount: 0, pendingConditionCount: 0,
    versionState: null, reportingPeriod: null,
    isLoading: false, modulePosture: null,
  };
}

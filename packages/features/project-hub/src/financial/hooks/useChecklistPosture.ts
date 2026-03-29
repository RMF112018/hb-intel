/**
 * useChecklistPosture — Forecast Versioning & Checklist operational posture hook.
 *
 * Wave 3D.3: computes the full operational posture for the Checklist surface
 * by combining ForecastVersioningService load results with governance rules,
 * checklist gating, role-aware actionability, and lifecycle posture.
 */

import { useMemo, useState, useEffect } from 'react';
import type { FinancialVersionState } from '../types/index.js';
import { useFinancialRepository } from './useFinancialRepository.js';
import { ForecastVersioningService } from '../services/ForecastVersioningService.js';
import type { VersionLedgerLoadResult, ChecklistGroupSummary } from '../services/ForecastVersioningService.js';
import type { FinancialViewerRole } from './useFinancialControlCenter.js';
import type { IFinancialModulePosture } from '@hbc/data-access';

// ── Types ──────────────────────────────────────────────────────────────

export type ChecklistPostureState =
  | 'editable'
  | 'view-only'
  | 'blocked'
  | 'warning'
  | 'stale'
  | 'loading'
  | 'error';

export interface ChecklistPostureBlocker {
  readonly id: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly actionLabel?: string;
  readonly actionToolSlug?: string;
}

export interface ChecklistGatePostureDetail {
  readonly canConfirm: boolean;
  readonly gateBlockers: readonly string[];
  readonly requiredCompleted: number;
  readonly requiredTotal: number;
  readonly totalCompleted: number;
  readonly totalItems: number;
  readonly allRequiredComplete: boolean;
  readonly staleBudgetLineCount: number;
}

export interface ChecklistPosture {
  readonly state: ChecklistPostureState;
  readonly label: string;
  readonly canEditChecklist: boolean;
  readonly canConfirmVersion: boolean;
  readonly canDeriveVersion: boolean;
  readonly canDesignateCandidate: boolean;
  readonly isStale: boolean;
  readonly blockers: readonly ChecklistPostureBlocker[];
  readonly warnings: readonly ChecklistPostureBlocker[];
  readonly gate: ChecklistGatePostureDetail;
  readonly checklistGroups: readonly ChecklistGroupSummary[];
  readonly versionState: FinancialVersionState | null;
  readonly versionNumber: number | null;
  readonly reportingPeriod: string | null;
  readonly isReportCandidate: boolean;
  readonly isLoading: boolean;
  readonly modulePosture: IFinancialModulePosture | null;
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useChecklistPosture(
  projectId: string,
  reportingPeriod: string,
  viewerRole: FinancialViewerRole = 'pm',
): ChecklistPosture {
  const repo = useFinancialRepository();
  const [loadResult, setLoadResult] = useState<VersionLedgerLoadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const service = new ForecastVersioningService(repo);
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
    const service = new ForecastVersioningService(repo);

    // ── Checklist analysis ───────────────────────────────────────
    const checklistGroups = service.groupChecklistByCategory(loadResult.checklist);
    const summary = service.getChecklistSummary(loadResult.checklist);

    // ── Blockers ─────────────────────────────────────────────────
    const blockers: ChecklistPostureBlocker[] = [];
    const warnings: ChecklistPostureBlocker[] = [];

    if (!summary.allRequiredComplete && isWorking) {
      const remaining = summary.requiredTotal - summary.requiredCompleted;
      blockers.push({
        id: 'checklist-incomplete',
        message: `${remaining} required checklist item${remaining > 1 ? 's' : ''} incomplete — confirmation blocked (gate G2)`,
        severity: 'error',
      });
    }

    if (posture.staleBudgetLineCount > 0) {
      blockers.push({
        id: 'stale-budget',
        message: `${posture.staleBudgetLineCount} unresolved reconciliation condition${posture.staleBudgetLineCount > 1 ? 's' : ''} — confirmation blocked (gate G3)`,
        severity: 'error',
        actionLabel: 'Resolve in Budget',
        actionToolSlug: 'budget',
      });
    }

    if (!isPM && isWorking) {
      warnings.push({
        id: 'non-pm-view',
        message: 'Checklist editing and version transitions require PM role',
        severity: 'info',
      });
    }

    // Incomplete optional items warning (non-blocking)
    const optionalIncomplete = summary.total - summary.completed - (summary.requiredTotal - summary.requiredCompleted);
    if (optionalIncomplete > 0 && summary.allRequiredComplete) {
      warnings.push({
        id: 'optional-incomplete',
        message: `${optionalIncomplete} optional item${optionalIncomplete > 1 ? 's' : ''} still incomplete`,
        severity: 'info',
      });
    }

    // ── Actionability ────────────────────────────────────────────
    const canEditChecklist = isPM && isWorking;
    const canConfirmVersion = loadResult.canConfirm;
    const canDeriveVersion = loadResult.canDerive && isPM;
    const canDesignateCandidate = loadResult.canDesignate && isPM;
    const isStale = posture.staleBudgetLineCount > 0;

    // ── Gate detail ──────────────────────────────────────────────
    const gate: ChecklistGatePostureDetail = {
      canConfirm: loadResult.gateResult.canConfirm,
      gateBlockers: loadResult.gateResult.blockers,
      requiredCompleted: summary.requiredCompleted,
      requiredTotal: summary.requiredTotal,
      totalCompleted: summary.completed,
      totalItems: summary.total,
      allRequiredComplete: summary.allRequiredComplete,
      staleBudgetLineCount: posture.staleBudgetLineCount,
    };

    // ── Overall state ────────────────────────────────────────────
    let state: ChecklistPostureState;
    let label: string;

    if (isStale) {
      state = 'stale';
      label = 'Budget data stale — reconciliation required';
    } else if (blockers.length > 0 && isWorking) {
      state = 'blocked';
      label = `${blockers.length} blocker${blockers.length > 1 ? 's' : ''} preventing confirmation`;
    } else if (canEditChecklist && !summary.allRequiredComplete) {
      state = 'warning';
      label = `Checklist in progress — ${summary.requiredCompleted}/${summary.requiredTotal} required items`;
    } else if (canEditChecklist && summary.allRequiredComplete) {
      state = 'editable';
      label = 'All required items complete — ready to confirm';
    } else if (versionState === 'ConfirmedInternal' || versionState === 'PublishedMonthly') {
      state = 'view-only';
      label = versionState === 'ConfirmedInternal' ? 'Confirmed — checklist frozen' : 'Published — checklist frozen';
    } else {
      state = 'view-only';
      label = 'Read-only';
    }

    return {
      state, label,
      canEditChecklist, canConfirmVersion, canDeriveVersion, canDesignateCandidate,
      isStale, blockers, warnings, gate, checklistGroups,
      versionState,
      versionNumber: posture.currentVersionNumber,
      reportingPeriod: posture.reportingPeriod,
      isReportCandidate: posture.isReportCandidate,
      isLoading: false, modulePosture: posture,
    };
  }, [loadResult, isLoading, error, viewerRole, repo]);
}

// ── Helpers ────────────────────────────────────────────────────────────

function createLoadingPosture(): ChecklistPosture {
  return {
    state: 'loading', label: 'Loading checklist...',
    canEditChecklist: false, canConfirmVersion: false, canDeriveVersion: false, canDesignateCandidate: false,
    isStale: false, blockers: [], warnings: [],
    gate: { canConfirm: false, gateBlockers: [], requiredCompleted: 0, requiredTotal: 0, totalCompleted: 0, totalItems: 0, allRequiredComplete: false, staleBudgetLineCount: 0 },
    checklistGroups: [],
    versionState: null, versionNumber: null, reportingPeriod: null, isReportCandidate: false,
    isLoading: true, modulePosture: null,
  };
}

function createErrorPosture(error: string): ChecklistPosture {
  return {
    state: 'error', label: `Error: ${error}`,
    canEditChecklist: false, canConfirmVersion: false, canDeriveVersion: false, canDesignateCandidate: false,
    isStale: false, blockers: [{ id: 'error', message: error, severity: 'error' }], warnings: [],
    gate: { canConfirm: false, gateBlockers: [error], requiredCompleted: 0, requiredTotal: 0, totalCompleted: 0, totalItems: 0, allRequiredComplete: false, staleBudgetLineCount: 0 },
    checklistGroups: [],
    versionState: null, versionNumber: null, reportingPeriod: null, isReportCandidate: false,
    isLoading: false, modulePosture: null,
  };
}

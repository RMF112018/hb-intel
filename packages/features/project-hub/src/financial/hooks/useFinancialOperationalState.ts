/**
 * useFinancialOperationalState — runtime-honesty evaluation hook.
 *
 * Evaluates the current Financial surface's operational posture:
 * data freshness, editability, blockers, next action, and ownership.
 *
 * This hook provides the canonical runtime-truth contract that all
 * Financial surfaces use to disclose their operational state to users.
 *
 * Currently returns mock posture. Will wire to IFinancialRepository
 * and real version/period/review state when data layer exists.
 */

import { useMemo } from 'react';
import type { FinancialVersionState } from '../types/index.js';

// ── Types ──────────────────────────────────────────────────────────────

export type DataSourceState = 'live' | 'cached' | 'stale' | 'partial' | 'failed' | 'mock';
export type EditabilityState = 'editable' | 'read-only' | 'locked' | 'blocked' | 'approval-pending';
export type ReadinessState = 'ready' | 'blocked' | 'warning' | 'not-started';

export interface OperationalBlocker {
  readonly id: string;
  readonly label: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly actionLabel?: string;
  readonly actionToolSlug?: string;
}

export interface NextAction {
  readonly label: string;
  readonly owner: string;
  readonly ownerRole: 'PM' | 'PER' | 'System' | 'Leadership';
  readonly toolSlug?: string;
  readonly isBlocked: boolean;
  readonly blockReason?: string;
}

export interface FinancialOperationalState {
  /** Data source truthfulness — is this live, cached, stale, or mock? */
  readonly dataSource: DataSourceState;
  /** Data source disclosure label for the user. */
  readonly dataSourceLabel: string;
  /** Can the user edit on this surface right now? */
  readonly editability: EditabilityState;
  /** Editability disclosure label. */
  readonly editabilityLabel: string;
  /** Current version state (Working, ConfirmedInternal, etc.) */
  readonly versionState: FinancialVersionState | null;
  /** Current reporting period. */
  readonly reportingPeriod: string | null;
  /** Readiness posture for confirmation/publication. */
  readonly readiness: ReadinessState;
  /** Readiness disclosure label. */
  readonly readinessLabel: string;
  /** Active blockers preventing forward progress. */
  readonly blockers: readonly OperationalBlocker[];
  /** The single most important next action. */
  readonly nextAction: NextAction | null;
  /** Whether the current data is from mock/stub sources. */
  readonly isMockData: boolean;
}

// ── Hook ───────────────────────────────────────────────────────────────

export interface UseFinancialOperationalStateOptions {
  readonly toolSlug?: string;
  readonly versionState?: string;
  readonly staleBudgetLineCount?: number;
  readonly checklistComplete?: boolean;
  readonly isReportCandidate?: boolean;
  readonly reviewCustodyStatus?: string;
}

export function useFinancialOperationalState(
  options: UseFinancialOperationalStateOptions = {},
): FinancialOperationalState {
  const {
    toolSlug,
    versionState = 'Working',
    staleBudgetLineCount = 0,
    checklistComplete = false,
    isReportCandidate = false,
  } = options;

  return useMemo(() => {
    // ── Data source ──────────────────────────────────────────────
    // Currently all Financial data is mock. This will change when
    // IFinancialRepository is implemented.
    const dataSource: DataSourceState = 'mock';
    const dataSourceLabel = 'Sample data — not connected to live project data';

    // ── Editability ──────────────────────────────────────────────
    let editability: EditabilityState;
    let editabilityLabel: string;

    if (versionState === 'Working') {
      editability = 'editable';
      editabilityLabel = 'Working draft — PM can edit';
    } else if (versionState === 'ConfirmedInternal') {
      editability = 'locked';
      editabilityLabel = 'Confirmed — immutable; derive a new version to edit';
    } else if (versionState === 'PublishedMonthly') {
      editability = 'locked';
      editabilityLabel = 'Published — immutable; derive a new version to edit';
    } else if (versionState === 'Superseded') {
      editability = 'read-only';
      editabilityLabel = 'Superseded — historical record, read-only';
    } else {
      editability = 'read-only';
      editabilityLabel = 'Read-only';
    }

    // ── Blockers ─────────────────────────────────────────────────
    const blockers: OperationalBlocker[] = [];

    if (staleBudgetLineCount > 0) {
      blockers.push({
        id: 'stale-budget',
        label: `${staleBudgetLineCount} unresolved reconciliation condition${staleBudgetLineCount > 1 ? 's' : ''} — confirmation blocked`,
        severity: 'error',
        actionLabel: 'Resolve in Budget',
        actionToolSlug: 'budget',
      });
    }

    if (!checklistComplete && versionState === 'Working') {
      blockers.push({
        id: 'checklist-incomplete',
        label: 'Forecast checklist has incomplete required items — confirmation blocked',
        severity: 'warning',
        actionLabel: 'Open Checklist',
        actionToolSlug: 'checklist',
      });
    }

    // ── Readiness ────────────────────────────────────────────────
    let readiness: ReadinessState;
    let readinessLabel: string;

    if (versionState === 'PublishedMonthly') {
      readiness = 'ready';
      readinessLabel = 'Published for current period';
    } else if (versionState === 'ConfirmedInternal' && isReportCandidate) {
      readiness = 'ready';
      readinessLabel = 'Report candidate — eligible for publication';
    } else if (blockers.length > 0) {
      readiness = 'blocked';
      readinessLabel = `${blockers.length} blocker${blockers.length > 1 ? 's' : ''} preventing confirmation`;
    } else if (versionState === 'Working' && checklistComplete && staleBudgetLineCount === 0) {
      readiness = 'ready';
      readinessLabel = 'Ready to confirm';
    } else {
      readiness = 'warning';
      readinessLabel = 'In progress — not yet ready for confirmation';
    }

    // ── Next action ──────────────────────────────────────────────
    let nextAction: NextAction | null = null;

    if (versionState === 'Working') {
      if (blockers.length > 0) {
        nextAction = {
          label: `Resolve ${blockers.length} blocker${blockers.length > 1 ? 's' : ''} before confirming`,
          owner: 'Project Manager',
          ownerRole: 'PM',
          toolSlug: blockers[0].actionToolSlug,
          isBlocked: true,
          blockReason: blockers[0].label,
        };
      } else if (checklistComplete && staleBudgetLineCount === 0) {
        nextAction = {
          label: 'Confirm version for internal review',
          owner: 'Project Manager',
          ownerRole: 'PM',
          toolSlug: toolSlug ?? 'forecast',
          isBlocked: false,
        };
      } else {
        nextAction = {
          label: 'Complete forecast checklist and resolve import conditions',
          owner: 'Project Manager',
          ownerRole: 'PM',
          toolSlug: 'checklist',
          isBlocked: false,
        };
      }
    } else if (versionState === 'ConfirmedInternal' && !isReportCandidate) {
      nextAction = {
        label: 'Designate as report candidate for publication',
        owner: 'Project Manager',
        ownerRole: 'PM',
        toolSlug: 'publication',
        isBlocked: false,
      };
    } else if (versionState === 'ConfirmedInternal' && isReportCandidate) {
      nextAction = {
        label: 'Awaiting publication handoff (P3-F1)',
        owner: 'System',
        ownerRole: 'System',
        isBlocked: false,
      };
    }

    return {
      dataSource,
      dataSourceLabel,
      editability,
      editabilityLabel,
      versionState: (versionState as FinancialVersionState) ?? null,
      reportingPeriod: 'March 2026',
      readiness,
      readinessLabel,
      blockers,
      nextAction,
      isMockData: true,
    };
  }, [toolSlug, versionState, staleBudgetLineCount, checklistComplete, isReportCandidate]);
}

/**
 * useFinancialSessionHistory — operational session history and recovery evaluation.
 *
 * Provides structured session history for import, revision, review, and
 * publication workflows. Evaluates recovery paths for failed/partial sessions.
 *
 * Currently returns mock data. Will wire to IFinancialRepository.
 */

import { useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────

export type SessionStatus = 'complete' | 'partial' | 'failed' | 'in-progress' | 'superseded' | 'returned';

export type SessionType = 'budget-import' | 'version-derivation' | 'version-confirmation' | 'review-submission' | 'review-return' | 'publication' | 'export-run' | 'period-close';

export interface OperationalSession {
  readonly id: string;
  readonly type: SessionType;
  readonly status: SessionStatus;
  readonly label: string;
  readonly actor: string;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly scope: string;
  readonly outcomeLabel: string;
  readonly affectedRecordCount: number;
  readonly unresolvedCount: number;
  readonly recoveryPath: RecoveryPath | null;
}

export interface RecoveryPath {
  readonly action: string;
  readonly description: string;
  readonly toolSlug: string;
  readonly isDestructive: boolean;
}

export interface ReconciliationOutcome {
  readonly sessionId: string;
  readonly totalProcessed: number;
  readonly matched: number;
  readonly created: number;
  readonly ambiguous: number;
  readonly resolved: number;
  readonly pendingResolution: number;
  readonly dismissed: number;
}

export interface RevisionLineage {
  readonly versionNumber: number;
  readonly state: string;
  readonly derivedFrom: number | null;
  readonly derivationReason: string | null;
  readonly confirmedAt: string | null;
  readonly publishedAt: string | null;
  readonly supersededAt: string | null;
  readonly isCurrent: boolean;
}

export interface FinancialSessionHistoryData {
  readonly sessions: readonly OperationalSession[];
  readonly reconciliation: ReconciliationOutcome | null;
  readonly revisionLineage: readonly RevisionLineage[];
  readonly hasFailedSessions: boolean;
  readonly hasPartialSessions: boolean;
  readonly hasPendingReconciliation: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────────

const MOCK_SESSIONS: OperationalSession[] = [
  {
    id: 'ses-001',
    type: 'budget-import',
    status: 'complete',
    label: 'Budget CSV Import — March 2026',
    actor: 'John Smith',
    startedAt: '2026-03-05T10:30:00Z',
    completedAt: '2026-03-05T10:31:15Z',
    scope: '142 budget lines processed',
    outcomeLabel: '140 matched, 2 new lines created, 0 ambiguous',
    affectedRecordCount: 142,
    unresolvedCount: 0,
    recoveryPath: null,
  },
  {
    id: 'ses-002',
    type: 'budget-import',
    status: 'partial',
    label: 'Budget CSV Re-Import — March 2026 (cost code update)',
    actor: 'John Smith',
    startedAt: '2026-03-12T14:00:00Z',
    completedAt: '2026-03-12T14:01:30Z',
    scope: '145 budget lines processed',
    outcomeLabel: '138 matched, 3 new, 4 ambiguous — 2 reconciliation conditions pending',
    affectedRecordCount: 145,
    unresolvedCount: 2,
    recoveryPath: {
      action: 'Resolve reconciliation conditions',
      description: 'Navigate to Budget Import and resolve the 2 pending ambiguous matches. Confirmation is blocked until all conditions are resolved.',
      toolSlug: 'budget',
      isDestructive: false,
    },
  },
  {
    id: 'ses-003',
    type: 'version-derivation',
    status: 'complete',
    label: 'Version 3 derived from Version 2',
    actor: 'John Smith',
    startedAt: '2026-03-03T09:00:00Z',
    completedAt: '2026-03-03T09:00:05Z',
    scope: 'Full version derivation (NewPeriod)',
    outcomeLabel: 'Budget lines, GC/GR, checklist, cash flow copied; 1 annotation carried forward',
    affectedRecordCount: 142,
    unresolvedCount: 0,
    recoveryPath: null,
  },
  {
    id: 'ses-004',
    type: 'version-confirmation',
    status: 'failed',
    label: 'Version 3 confirmation attempt',
    actor: 'John Smith',
    startedAt: '2026-03-15T16:00:00Z',
    completedAt: '2026-03-15T16:00:01Z',
    scope: 'Confirmation gate evaluation',
    outcomeLabel: 'BLOCKED — 3 required checklist items incomplete, 2 reconciliation conditions unresolved',
    affectedRecordCount: 0,
    unresolvedCount: 5,
    recoveryPath: {
      action: 'Complete checklist and resolve import conditions',
      description: 'Complete the 3 remaining required checklist items and resolve the 2 pending reconciliation conditions. Then retry confirmation.',
      toolSlug: 'checklist',
      isDestructive: false,
    },
  },
];

const MOCK_RECONCILIATION: ReconciliationOutcome = {
  sessionId: 'ses-002',
  totalProcessed: 145,
  matched: 138,
  created: 3,
  ambiguous: 4,
  resolved: 2,
  pendingResolution: 2,
  dismissed: 0,
};

const MOCK_LINEAGE: RevisionLineage[] = [
  { versionNumber: 1, state: 'PublishedMonthly', derivedFrom: null, derivationReason: null, confirmedAt: '2026-01-28T16:00:00Z', publishedAt: '2026-01-31T18:00:00Z', supersededAt: '2026-02-03T09:00:00Z', isCurrent: false },
  { versionNumber: 2, state: 'PublishedMonthly', derivedFrom: 1, derivationReason: 'NewPeriod', confirmedAt: '2026-02-25T15:00:00Z', publishedAt: '2026-02-28T18:00:00Z', supersededAt: '2026-03-03T09:00:00Z', isCurrent: false },
  { versionNumber: 3, state: 'Working', derivedFrom: 2, derivationReason: 'NewPeriod', confirmedAt: null, publishedAt: null, supersededAt: null, isCurrent: true },
];

// ── Hook ───────────────────────────────────────────────────────────────

export function useFinancialSessionHistory(): FinancialSessionHistoryData {
  return useMemo(() => {
    const hasFailedSessions = MOCK_SESSIONS.some((s) => s.status === 'failed');
    const hasPartialSessions = MOCK_SESSIONS.some((s) => s.status === 'partial');
    const hasPendingReconciliation = MOCK_RECONCILIATION.pendingResolution > 0;

    return {
      sessions: MOCK_SESSIONS,
      reconciliation: MOCK_RECONCILIATION,
      revisionLineage: MOCK_LINEAGE,
      hasFailedSessions,
      hasPartialSessions,
      hasPendingReconciliation,
    };
  }, []);
}

import type { IReconciliationStatusInput, IMilestoneRecord } from '../src/schedule/types/index.js';

/**
 * Pre-built reconciliation status scenarios for all 7 status conditions.
 */
export const mockCommitmentScenarios: Record<string, IReconciliationStatusInput> = {
  aligned: {
    committedStartDate: null,
    committedFinishDate: null,
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: null,
    approvalRequired: false,
    approvedBy: null,
    rejectionReason: null,
  },
  alignedExactMatch: {
    committedStartDate: '2026-04-01T00:00:00Z',
    committedFinishDate: '2026-06-01T00:00:00Z',
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: 0,
    approvalRequired: false,
    approvedBy: null,
    rejectionReason: null,
  },
  pmOverride: {
    committedStartDate: '2026-04-01T00:00:00Z',
    committedFinishDate: '2026-06-15T00:00:00Z',
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: 14,
    approvalRequired: false,
    approvedBy: null,
    rejectionReason: null,
  },
  sourceAhead: {
    committedStartDate: '2026-04-01T00:00:00Z',
    committedFinishDate: '2026-05-15T00:00:00Z',
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: -17,
    approvalRequired: false,
    approvedBy: null,
    rejectionReason: null,
  },
  conflictRequiresReview: {
    committedStartDate: '2026-04-01T00:00:00Z',
    committedFinishDate: '2026-08-15T00:00:00Z',
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: 75,
    approvalRequired: false,
    approvedBy: null,
    rejectionReason: null,
  },
  pendingApproval: {
    committedStartDate: '2026-04-01T00:00:00Z',
    committedFinishDate: '2026-07-01T00:00:00Z',
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: 30,
    approvalRequired: true,
    approvedBy: null,
    rejectionReason: null,
  },
  approved: {
    committedStartDate: '2026-04-01T00:00:00Z',
    committedFinishDate: '2026-07-01T00:00:00Z',
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: 30,
    approvalRequired: true,
    approvedBy: 'pe-user-001',
    rejectionReason: null,
  },
  rejected: {
    committedStartDate: '2026-04-01T00:00:00Z',
    committedFinishDate: '2026-07-01T00:00:00Z',
    sourceStartDate: '2026-04-01T00:00:00Z',
    sourceFinishDate: '2026-06-01T00:00:00Z',
    finishVarianceDays: 30,
    approvalRequired: true,
    approvedBy: null,
    rejectionReason: 'Insufficient justification for 30-day slip',
  },
};

/**
 * Pre-built milestone status scenarios for all 7 status paths.
 */
export const mockMilestoneStatusScenarios: Record<string, Pick<IMilestoneRecord, 'actualDate' | 'varianceDays' | 'status'>> = {
  onTrack: { actualDate: null, varianceDays: -5, status: 'OnTrack' },
  onTrackZero: { actualDate: null, varianceDays: 0, status: 'OnTrack' },
  atRisk: { actualDate: null, varianceDays: 10, status: 'AtRisk' },
  atRiskBoundary: { actualDate: null, varianceDays: 14, status: 'AtRisk' },
  delayed: { actualDate: null, varianceDays: 20, status: 'Delayed' },
  delayedBoundary: { actualDate: null, varianceDays: 30, status: 'Delayed' },
  critical: { actualDate: null, varianceDays: 45, status: 'Critical' },
  achieved: { actualDate: '2026-11-30', varianceDays: -15, status: 'Achieved' },
  superseded: { actualDate: null, varianceDays: 0, status: 'Superseded' },
};

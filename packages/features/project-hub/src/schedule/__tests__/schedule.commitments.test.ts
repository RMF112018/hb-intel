import { describe, expect, it } from 'vitest';

import { DEFAULT_MILESTONE_THRESHOLDS } from '../constants/index.js';
import {
  calculateForecastDate,
  calculateMilestoneStatus,
  calculateRevisedBaselineDate,
  calculateVarianceDays,
  createReconciliationEntry,
  isApprovalRequired,
  isMilestoneActivity,
  resolveReconciliationStatus,
} from '../commitments/index.js';
import {
  mockCommitmentScenarios,
  mockMilestoneStatusScenarios,
} from '../../../testing/mockCommitmentScenarios.js';

describe('P3-E5-T02 schedule commitments', () => {
  describe('resolveReconciliationStatus (§2.1)', () => {
    it('returns Aligned when no committed dates (using source truth)', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.aligned)).toBe('Aligned');
    });

    it('returns Aligned when committed matches source exactly', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.alignedExactMatch)).toBe('Aligned');
    });

    it('returns PMOverride when committed differs within threshold', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.pmOverride)).toBe('PMOverride');
    });

    it('returns SourceAhead when source has moved past committed', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.sourceAhead)).toBe('SourceAhead');
    });

    it('returns ConflictRequiresReview when variance is large', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.conflictRequiresReview)).toBe('ConflictRequiresReview');
    });

    it('returns PendingApproval when approval required but not granted', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.pendingApproval)).toBe('PendingApproval');
    });

    it('returns Approved when approval required and granted', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.approved)).toBe('Approved');
    });

    it('returns Rejected when rejection reason is present', () => {
      expect(resolveReconciliationStatus(mockCommitmentScenarios.rejected)).toBe('Rejected');
    });
  });

  describe('calculateVarianceDays', () => {
    it('returns null when no committed date', () => {
      expect(calculateVarianceDays(null, '2026-06-01')).toBeNull();
    });

    it('returns positive days when committed is later than source', () => {
      const days = calculateVarianceDays('2026-06-15', '2026-06-01');
      expect(days).toBe(14);
    });

    it('returns negative days when committed is earlier than source', () => {
      const days = calculateVarianceDays('2026-05-15', '2026-06-01');
      expect(days).toBe(-17);
    });

    it('returns 0 when dates match', () => {
      const days = calculateVarianceDays('2026-06-01', '2026-06-01');
      expect(days).toBe(0);
    });
  });

  describe('isApprovalRequired (§21.1)', () => {
    it('returns false when no variance', () => {
      expect(isApprovalRequired(null, 14)).toBe(false);
    });

    it('returns false when variance is within threshold', () => {
      expect(isApprovalRequired(10, 14)).toBe(false);
    });

    it('returns false when variance equals threshold', () => {
      expect(isApprovalRequired(14, 14)).toBe(false);
    });

    it('returns true when variance exceeds threshold', () => {
      expect(isApprovalRequired(15, 14)).toBe(true);
    });

    it('returns true for negative variance exceeding threshold', () => {
      expect(isApprovalRequired(-20, 14)).toBe(true);
    });
  });

  describe('calculateMilestoneStatus (§4.3)', () => {
    const thresholds = DEFAULT_MILESTONE_THRESHOLDS;

    it('returns Achieved when actualDate is set', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.achieved, thresholds)).toBe('Achieved');
    });

    it('returns Superseded when status is Superseded', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.superseded, thresholds)).toBe('Superseded');
    });

    it('returns OnTrack when variance is negative', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.onTrack, thresholds)).toBe('OnTrack');
    });

    it('returns OnTrack when variance is zero', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.onTrackZero, thresholds)).toBe('OnTrack');
    });

    it('returns AtRisk when variance is 1-14 days', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.atRisk, thresholds)).toBe('AtRisk');
    });

    it('returns AtRisk at the 14-day boundary', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.atRiskBoundary, thresholds)).toBe('AtRisk');
    });

    it('returns Delayed when variance is 15-30 days', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.delayed, thresholds)).toBe('Delayed');
    });

    it('returns Delayed at the 30-day boundary', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.delayedBoundary, thresholds)).toBe('Delayed');
    });

    it('returns Critical when variance exceeds 30 days', () => {
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.critical, thresholds)).toBe('Critical');
    });

    it('respects custom thresholds', () => {
      const customThresholds = { atRiskThresholdDays: 7, delayedThresholdDays: 14 };
      // 10 days would be AtRisk with defaults but Delayed with custom
      expect(calculateMilestoneStatus(mockMilestoneStatusScenarios.atRisk, customThresholds)).toBe('Delayed');
    });
  });

  describe('calculateForecastDate', () => {
    it('returns committedFinishDate when set', () => {
      expect(calculateForecastDate('2026-07-01', '2026-06-01')).toBe('2026-07-01');
    });

    it('returns sourceFinishDate when no commitment', () => {
      expect(calculateForecastDate(null, '2026-06-01')).toBe('2026-06-01');
    });
  });

  describe('calculateRevisedBaselineDate', () => {
    it('returns null when no baseline', () => {
      expect(calculateRevisedBaselineDate(null, 0)).toBeNull();
    });

    it('returns baseline unchanged when zero extension', () => {
      expect(calculateRevisedBaselineDate('2026-12-15', 0)).toBe('2026-12-15');
    });

    it('adds extension days to baseline', () => {
      expect(calculateRevisedBaselineDate('2026-12-15', 14)).toBe('2026-12-29');
    });

    it('handles month boundary correctly', () => {
      expect(calculateRevisedBaselineDate('2026-01-25', 10)).toBe('2026-02-04');
    });
  });

  describe('isMilestoneActivity (§4.1)', () => {
    it('returns true for TT_Mile', () => {
      expect(isMilestoneActivity('TT_Mile', false)).toBe(true);
    });

    it('returns true for TT_FinMile', () => {
      expect(isMilestoneActivity('TT_FinMile', false)).toBe(true);
    });

    it('returns true when override is set regardless of type', () => {
      expect(isMilestoneActivity('TT_Task', true)).toBe(true);
    });

    it('returns false for regular task without override', () => {
      expect(isMilestoneActivity('TT_Task', false)).toBe(false);
    });

    it('returns false for LOE without override', () => {
      expect(isMilestoneActivity('TT_LOE', false)).toBe(false);
    });
  });

  describe('createReconciliationEntry (§2.2)', () => {
    it('creates a complete reconciliation record', () => {
      const entry = createReconciliationEntry(
        'commit-001',
        'Aligned',
        'PMOverride',
        'PMEdit',
        {
          projectId: 'proj-001',
          sourceVersionId: 'ver-001',
          priorCommittedFinish: null,
          newCommittedFinish: '2026-07-01T00:00:00Z',
          causationCode: 'WEATHER',
          explanation: 'Weather delay extended timeline',
          createdBy: 'user-pm-001',
        },
      );

      expect(entry.commitmentId).toBe('commit-001');
      expect(entry.priorStatus).toBe('Aligned');
      expect(entry.newStatus).toBe('PMOverride');
      expect(entry.triggeredBy).toBe('PMEdit');
      expect(entry.priorCommittedFinish).toBeNull();
      expect(entry.newCommittedFinish).toBe('2026-07-01T00:00:00Z');
      expect(entry.causationCode).toBe('WEATHER');
      expect(entry.explanation).toBe('Weather delay extended timeline');
      expect(entry.reconciliationId).toBeTruthy();
      expect(entry.createdAt).toBeTruthy();
      expect(entry.createdBy).toBe('user-pm-001');
    });

    it('defaults optional fields to null', () => {
      const entry = createReconciliationEntry(
        'commit-002',
        'PMOverride',
        'PendingApproval',
        'System',
        {
          projectId: 'proj-001',
          sourceVersionId: 'ver-002',
          priorCommittedFinish: '2026-06-15T00:00:00Z',
          newCommittedFinish: '2026-07-15T00:00:00Z',
          createdBy: 'system',
        },
      );

      expect(entry.causationCode).toBeNull();
      expect(entry.explanation).toBeNull();
    });
  });
});

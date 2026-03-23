import { describe, expect, it } from 'vitest';

import {
  applyVarianceSignConvention,
  calculateDaysSinceLastImport,
  convertDaysToHours,
  convertHoursToDays,
  evaluateAutoPublishEligibility,
  getApprovalThresholdForType,
  getAuthorityLayerForRecord,
  getFieldSummaryForRecord,
  isActivityDeleteFlagged,
} from '../business-rules/index.js';

describe('P3-E5-T10 schedule business rules', () => {
  describe('getApprovalThresholdForType (§21.1)', () => {
    it('returns 5 for ActivityForecast', () => {
      expect(getApprovalThresholdForType('ActivityForecast')).toBe(5);
    });

    it('returns 3 for MilestoneCommitment', () => {
      expect(getApprovalThresholdForType('MilestoneCommitment')).toBe(3);
    });

    it('returns 1 for CompletionForecast', () => {
      expect(getApprovalThresholdForType('CompletionForecast')).toBe(1);
    });
  });

  describe('convertHoursToDays (§21.2)', () => {
    it('converts 40 hours to 5 days at 8hr/day', () => {
      expect(convertHoursToDays(40)).toBe(5);
    });

    it('converts with custom hours per day', () => {
      expect(convertHoursToDays(40, 10)).toBe(4);
    });

    it('returns 0 for 0 hours', () => {
      expect(convertHoursToDays(0)).toBe(0);
    });

    it('handles fractional results', () => {
      expect(convertHoursToDays(12, 8)).toBe(1.5);
    });
  });

  describe('convertDaysToHours (§21.2)', () => {
    it('converts 5 days to 40 hours at 8hr/day', () => {
      expect(convertDaysToHours(5)).toBe(40);
    });

    it('converts with custom hours per day', () => {
      expect(convertDaysToHours(5, 10)).toBe(50);
    });
  });

  describe('evaluateAutoPublishEligibility (§21.3)', () => {
    it('returns true when all criteria met', () => {
      expect(evaluateAutoPublishEligibility({
        noHardPublishBlockers: true,
        overallStatusOnTrackOrAtRisk: true,
        confidenceLabelHighOrModerate: true,
        noConflictRequiresReviewMilestones: true,
        sourceWithinFreshnessWindow: true,
        lifecycleTransitionValid: true,
      })).toBe(true);
    });

    it('returns false when any criterion fails', () => {
      expect(evaluateAutoPublishEligibility({
        noHardPublishBlockers: true,
        overallStatusOnTrackOrAtRisk: false,
        confidenceLabelHighOrModerate: true,
        noConflictRequiresReviewMilestones: true,
        sourceWithinFreshnessWindow: true,
        lifecycleTransitionValid: true,
      })).toBe(false);
    });

    it('returns false when hard blockers present', () => {
      expect(evaluateAutoPublishEligibility({
        noHardPublishBlockers: false,
        overallStatusOnTrackOrAtRisk: true,
        confidenceLabelHighOrModerate: true,
        noConflictRequiresReviewMilestones: true,
        sourceWithinFreshnessWindow: true,
        lifecycleTransitionValid: true,
      })).toBe(false);
    });
  });

  describe('applyVarianceSignConvention (§21.4)', () => {
    it('returns positive when behind schedule', () => {
      expect(applyVarianceSignConvention('2026-04-15', '2026-04-01')).toBe(14);
    });

    it('returns negative when ahead of schedule', () => {
      expect(applyVarianceSignConvention('2026-03-25', '2026-04-01')).toBe(-7);
    });

    it('returns 0 when on time', () => {
      expect(applyVarianceSignConvention('2026-04-01', '2026-04-01')).toBe(0);
    });
  });

  describe('calculateDaysSinceLastImport (§21.6)', () => {
    it('calculates correct days', () => {
      expect(calculateDaysSinceLastImport('2026-03-01', '2026-03-31')).toBe(30);
    });

    it('returns 0 for same day', () => {
      expect(calculateDaysSinceLastImport('2026-03-23', '2026-03-23')).toBe(0);
    });
  });

  describe('isActivityDeleteFlagged (§21.7)', () => {
    it('returns true when flagged', () => {
      expect(isActivityDeleteFlagged(true)).toBe(true);
    });

    it('returns false when not flagged', () => {
      expect(isActivityDeleteFlagged(false)).toBe(false);
    });
  });

  describe('getFieldSummaryForRecord (§28)', () => {
    it('finds CanonicalScheduleSource', () => {
      const entry = getFieldSummaryForRecord('CanonicalScheduleSource');
      expect(entry?.section).toBe('1.1');
      expect(entry?.primaryKey).toBe('sourceId');
      expect(entry?.authorityLayer).toBe('MasterSchedule');
    });

    it('finds FieldWorkPackage', () => {
      const entry = getFieldSummaryForRecord('FieldWorkPackage');
      expect(entry?.authorityLayer).toBe('FieldExecution');
    });

    it('returns undefined for unknown record type', () => {
      expect(getFieldSummaryForRecord('NonExistent')).toBeUndefined();
    });
  });

  describe('getAuthorityLayerForRecord (§28)', () => {
    it('returns MasterSchedule for ImportedActivitySnapshot', () => {
      expect(getAuthorityLayerForRecord('ImportedActivitySnapshot')).toBe('MasterSchedule');
    });

    it('returns Analytics for ConfidenceRecord', () => {
      expect(getAuthorityLayerForRecord('ConfidenceRecord')).toBe('Analytics');
    });

    it('returns CrossLayer for AcknowledgementRecord', () => {
      expect(getAuthorityLayerForRecord('AcknowledgementRecord')).toBe('CrossLayer');
    });

    it('returns undefined for unknown', () => {
      expect(getAuthorityLayerForRecord('Unknown')).toBeUndefined();
    });
  });
});

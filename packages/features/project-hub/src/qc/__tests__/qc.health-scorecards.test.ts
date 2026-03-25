import { describe, expect, it } from 'vitest';
import {
  isQualityHealthSnapshotImmutable,
  isEnterpriseRollupProjectEditable,
  isScorecardFormulasMoeGoverned,
  canProjectOverrideScorecardFormula,
  isRootCauseAnalysisMandatory,
  isLearningCandidatePublishable,
  canProjectPublishLearningCandidate,
  isValidLearningTransition,
  getStatusBandForScore,
  isConfidenceSufficient,
  isRollupInputFrozenPerSnapshot,
  mustScorecardDrillBackToSource,
  isWeightingLeadingDominant,
  canHealthProjectionBeDirectlyEdited,
  isRecurrenceEnterpriseEligible,
} from '../../index.js';

describe('QC health-scorecards business rules', () => {
  describe('immutability and editability', () => {
    it('isQualityHealthSnapshotImmutable returns true', () => {
      expect(isQualityHealthSnapshotImmutable()).toBe(true);
    });

    it('isEnterpriseRollupProjectEditable returns false', () => {
      expect(isEnterpriseRollupProjectEditable()).toBe(false);
    });
  });

  describe('governance rules', () => {
    it('isScorecardFormulasMoeGoverned returns true', () => {
      expect(isScorecardFormulasMoeGoverned()).toBe(true);
    });

    it('canProjectOverrideScorecardFormula returns false', () => {
      expect(canProjectOverrideScorecardFormula()).toBe(false);
    });
  });

  describe('isRootCauseAnalysisMandatory', () => {
    it('returns true for ISSUE_REOPENED', () => {
      expect(isRootCauseAnalysisMandatory('ISSUE_REOPENED')).toBe(true);
    });

    it('returns true for RECURRENCE_DETECTED', () => {
      expect(isRootCauseAnalysisMandatory('RECURRENCE_DETECTED')).toBe(true);
    });

    it('returns true for HIGH_SEVERITY', () => {
      expect(isRootCauseAnalysisMandatory('HIGH_SEVERITY')).toBe(true);
    });

    it('returns true for REPEATED_ORG_PATTERN', () => {
      expect(isRootCauseAnalysisMandatory('REPEATED_ORG_PATTERN')).toBe(true);
    });

    it('returns true for LEARNING_QUALIFIED', () => {
      expect(isRootCauseAnalysisMandatory('LEARNING_QUALIFIED')).toBe(true);
    });
  });

  describe('isLearningCandidatePublishable', () => {
    it('returns true for MOE_APPROVED', () => {
      expect(isLearningCandidatePublishable('MOE_APPROVED')).toBe(true);
    });

    it('returns false for DRAFT', () => {
      expect(isLearningCandidatePublishable('DRAFT')).toBe(false);
    });

    it('returns false for CONFIRMED', () => {
      expect(isLearningCandidatePublishable('CONFIRMED')).toBe(false);
    });
  });

  describe('canProjectPublishLearningCandidate', () => {
    it('returns false', () => {
      expect(canProjectPublishLearningCandidate()).toBe(false);
    });
  });

  describe('isValidLearningTransition', () => {
    it('DRAFT to CONFIRMED is valid', () => {
      expect(isValidLearningTransition('DRAFT', 'CONFIRMED')).toBe(true);
    });

    it('CONFIRMED to SUBMITTED_FOR_REVIEW is valid', () => {
      expect(isValidLearningTransition('CONFIRMED', 'SUBMITTED_FOR_REVIEW')).toBe(true);
    });

    it('SUBMITTED_FOR_REVIEW to MOE_APPROVED is valid', () => {
      expect(isValidLearningTransition('SUBMITTED_FOR_REVIEW', 'MOE_APPROVED')).toBe(true);
    });

    it('MOE_REJECTED to CONFIRMED is valid', () => {
      expect(isValidLearningTransition('MOE_REJECTED', 'CONFIRMED')).toBe(true);
    });

    it('MOE_APPROVED to PUBLISHED_AS_UPDATE is valid', () => {
      expect(isValidLearningTransition('MOE_APPROVED', 'PUBLISHED_AS_UPDATE')).toBe(true);
    });

    it('DRAFT to MOE_APPROVED is invalid', () => {
      expect(isValidLearningTransition('DRAFT', 'MOE_APPROVED')).toBe(false);
    });

    it('PUBLISHED_AS_UPDATE to DRAFT is invalid', () => {
      expect(isValidLearningTransition('PUBLISHED_AS_UPDATE', 'DRAFT')).toBe(false);
    });
  });

  describe('getStatusBandForScore', () => {
    it('returns CRITICAL for score 10 with HIGH confidence', () => {
      expect(getStatusBandForScore(10, 'HIGH')).toBe('CRITICAL');
    });

    it('returns AT_RISK for score 30 with HIGH confidence', () => {
      expect(getStatusBandForScore(30, 'HIGH')).toBe('AT_RISK');
    });

    it('returns WATCH for score 50 with MODERATE confidence', () => {
      expect(getStatusBandForScore(50, 'MODERATE')).toBe('WATCH');
    });

    it('returns HEALTHY for score 80 with HIGH confidence', () => {
      expect(getStatusBandForScore(80, 'HIGH')).toBe('HEALTHY');
    });

    it('returns DATA_PENDING for score 80 with INSUFFICIENT_DATA confidence', () => {
      expect(getStatusBandForScore(80, 'INSUFFICIENT_DATA')).toBe('DATA_PENDING');
    });
  });

  describe('isConfidenceSufficient', () => {
    it('returns true for HIGH', () => {
      expect(isConfidenceSufficient('HIGH')).toBe(true);
    });

    it('returns true for MODERATE', () => {
      expect(isConfidenceSufficient('MODERATE')).toBe(true);
    });

    it('returns false for LOW', () => {
      expect(isConfidenceSufficient('LOW')).toBe(false);
    });

    it('returns false for INSUFFICIENT_DATA', () => {
      expect(isConfidenceSufficient('INSUFFICIENT_DATA')).toBe(false);
    });
  });

  describe('snapshot and rollup rules', () => {
    it('isRollupInputFrozenPerSnapshot returns true', () => {
      expect(isRollupInputFrozenPerSnapshot()).toBe(true);
    });

    it('mustScorecardDrillBackToSource returns true', () => {
      expect(mustScorecardDrillBackToSource()).toBe(true);
    });

    it('isWeightingLeadingDominant returns true', () => {
      expect(isWeightingLeadingDominant()).toBe(true);
    });

    it('canHealthProjectionBeDirectlyEdited returns false', () => {
      expect(canHealthProjectionBeDirectlyEdited()).toBe(false);
    });
  });

  describe('isRecurrenceEnterpriseEligible', () => {
    it('returns true for REPEAT_ENTERPRISE_CANDIDATE', () => {
      expect(isRecurrenceEnterpriseEligible('REPEAT_ENTERPRISE_CANDIDATE')).toBe(true);
    });

    it('returns false for FIRST_OCCURRENCE', () => {
      expect(isRecurrenceEnterpriseEligible('FIRST_OCCURRENCE')).toBe(false);
    });

    it('returns false for RECURRING', () => {
      expect(isRecurrenceEnterpriseEligible('RECURRING')).toBe(false);
    });
  });
});

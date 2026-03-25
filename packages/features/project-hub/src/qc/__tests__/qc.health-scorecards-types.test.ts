import { describe, expect, it } from 'vitest';
import {
  QC_QUALITY_STATUS_BANDS,
  QC_SCORECARD_DOMAINS,
  QC_CONFIDENCE_TIERS,
  QC_ROLLUP_BANDS,
  QC_LEARNING_CANDIDATE_STATES,
  QC_LEARNING_TARGET_TYPES,
  QC_ANALYSIS_MANDATORY_REASONS,
  QC_WEIGHTING_PHILOSOPHIES,
  QC_DRILLDOWN_DIMENSIONS,
  QC_MANUAL_REVIEW_PRESSURE_LEVELS,
  QC_QUALITY_STATUS_BAND_LABELS,
  QC_SCORECARD_DOMAIN_LABELS,
  QC_CONFIDENCE_TIER_LABELS,
  QC_ROLLUP_BAND_LABELS,
  QC_LEARNING_CANDIDATE_STATE_LABELS,
  QC_ANALYSIS_MANDATORY_REASON_LABELS,
  SCORECARD_WEIGHT_DEFINITIONS,
  DRILLDOWN_DIMENSION_DEFINITIONS,
  LEARNING_PIPELINE_VALID_TRANSITIONS,
  ANALYSIS_MANDATORY_CONDITIONS,
  LEARNING_TARGET_DEFINITIONS,
  STATUS_BAND_THRESHOLDS,
} from '../../index.js';
import type {
  IScorecardDomainScore,
  IEnhancedQualityHealthSnapshotFields,
  IEnhancedRollupInputFields,
  ILearningCandidate,
  IEnterpriseRollupProjection,
} from '../../index.js';

describe('QC health-scorecards contract stability', () => {
  describe('enum array lengths', () => {
    it('QC_QUALITY_STATUS_BANDS has 5 members', () => {
      expect(QC_QUALITY_STATUS_BANDS).toHaveLength(5);
    });

    it('QC_SCORECARD_DOMAINS has 5 members', () => {
      expect(QC_SCORECARD_DOMAINS).toHaveLength(5);
    });

    it('QC_CONFIDENCE_TIERS has 4 members', () => {
      expect(QC_CONFIDENCE_TIERS).toHaveLength(4);
    });

    it('QC_ROLLUP_BANDS has 5 members', () => {
      expect(QC_ROLLUP_BANDS).toHaveLength(5);
    });

    it('QC_LEARNING_CANDIDATE_STATES has 6 members', () => {
      expect(QC_LEARNING_CANDIDATE_STATES).toHaveLength(6);
    });

    it('QC_LEARNING_TARGET_TYPES has 7 members', () => {
      expect(QC_LEARNING_TARGET_TYPES).toHaveLength(7);
    });

    it('QC_ANALYSIS_MANDATORY_REASONS has 5 members', () => {
      expect(QC_ANALYSIS_MANDATORY_REASONS).toHaveLength(5);
    });

    it('QC_WEIGHTING_PHILOSOPHIES has 2 members', () => {
      expect(QC_WEIGHTING_PHILOSOPHIES).toHaveLength(2);
    });

    it('QC_DRILLDOWN_DIMENSIONS has 8 members', () => {
      expect(QC_DRILLDOWN_DIMENSIONS).toHaveLength(8);
    });

    it('QC_MANUAL_REVIEW_PRESSURE_LEVELS has 5 members', () => {
      expect(QC_MANUAL_REVIEW_PRESSURE_LEVELS).toHaveLength(5);
    });
  });

  describe('label map key counts', () => {
    it('QC_QUALITY_STATUS_BAND_LABELS has 5 entries', () => {
      expect(Object.keys(QC_QUALITY_STATUS_BAND_LABELS)).toHaveLength(5);
    });

    it('QC_SCORECARD_DOMAIN_LABELS has 5 entries', () => {
      expect(Object.keys(QC_SCORECARD_DOMAIN_LABELS)).toHaveLength(5);
    });

    it('QC_CONFIDENCE_TIER_LABELS has 4 entries', () => {
      expect(Object.keys(QC_CONFIDENCE_TIER_LABELS)).toHaveLength(4);
    });

    it('QC_ROLLUP_BAND_LABELS has 5 entries', () => {
      expect(Object.keys(QC_ROLLUP_BAND_LABELS)).toHaveLength(5);
    });

    it('QC_LEARNING_CANDIDATE_STATE_LABELS has 6 entries', () => {
      expect(Object.keys(QC_LEARNING_CANDIDATE_STATE_LABELS)).toHaveLength(6);
    });

    it('QC_ANALYSIS_MANDATORY_REASON_LABELS has 5 entries', () => {
      expect(Object.keys(QC_ANALYSIS_MANDATORY_REASON_LABELS)).toHaveLength(5);
    });
  });

  describe('definition array lengths', () => {
    it('SCORECARD_WEIGHT_DEFINITIONS has 5 rows', () => {
      expect(SCORECARD_WEIGHT_DEFINITIONS).toHaveLength(5);
    });

    it('DRILLDOWN_DIMENSION_DEFINITIONS has 8 rows', () => {
      expect(DRILLDOWN_DIMENSION_DEFINITIONS).toHaveLength(8);
    });

    it('LEARNING_PIPELINE_VALID_TRANSITIONS has 6 entries', () => {
      expect(LEARNING_PIPELINE_VALID_TRANSITIONS).toHaveLength(6);
    });

    it('ANALYSIS_MANDATORY_CONDITIONS has 5 entries', () => {
      expect(ANALYSIS_MANDATORY_CONDITIONS).toHaveLength(5);
    });

    it('LEARNING_TARGET_DEFINITIONS has 7 entries', () => {
      expect(LEARNING_TARGET_DEFINITIONS).toHaveLength(7);
    });

    it('STATUS_BAND_THRESHOLDS has 5 entries', () => {
      expect(STATUS_BAND_THRESHOLDS).toHaveLength(5);
    });
  });

  describe('scorecard weight integrity', () => {
    it('scorecard weights sum to 1.0', () => {
      const sum = SCORECARD_WEIGHT_DEFINITIONS.reduce((acc, def) => acc + def.weight, 0);
      expect(sum).toBeCloseTo(1.0);
    });
  });

  describe('compile-time typing', () => {
    it('IScorecardDomainScore satisfies shape', () => {
      const score: IScorecardDomainScore = {
        domain: 'PLAN_GATE_READINESS',
        numericScore: 85,
        statusBand: 'HEALTHY',
        weight: 0.25,
        topDrivers: ['Gate completion rate'],
        drilldownAvailable: true,
      };
      expect(score.domain).toBe('PLAN_GATE_READINESS');
    });

    it('IEnhancedQualityHealthSnapshotFields satisfies shape', () => {
      const snapshot: IEnhancedQualityHealthSnapshotFields = {
        planGateReadinessScore: {
          domain: 'PLAN_GATE_READINESS',
          numericScore: 85,
          statusBand: 'HEALTHY',
          weight: 0.25,
          topDrivers: [],
          drilldownAvailable: true,
        },
        issueActionPerformanceScore: {
          domain: 'ISSUE_ACTION_PERFORMANCE',
          numericScore: 70,
          statusBand: 'HEALTHY',
          weight: 0.25,
          topDrivers: [],
          drilldownAvailable: true,
        },
        exceptionDependencyScore: {
          domain: 'EXCEPTION_DEPENDENCY_PRESSURE',
          numericScore: 55,
          statusBand: 'WATCH',
          weight: 0.20,
          topDrivers: [],
          drilldownAvailable: true,
        },
        evidenceVerificationScore: {
          domain: 'EVIDENCE_VERIFICATION_QUALITY',
          numericScore: 90,
          statusBand: 'HEALTHY',
          weight: 0.15,
          topDrivers: [],
          drilldownAvailable: true,
        },
        recurrenceLearningScore: {
          domain: 'RECURRENCE_LEARNING_POSTURE',
          numericScore: 60,
          statusBand: 'WATCH',
          weight: 0.15,
          topDrivers: [],
          drilldownAvailable: false,
        },
        overallQualityScore: 74,
        overallQualityStatus: 'HEALTHY',
        confidenceTier: 'HIGH',
        manualReviewPressure: 'LOW',
        governedFormulaVersion: '1.0.0',
        projectOverlayVersion: null,
        sourceProjectQcSnapshotId: 'snap-1',
        topRecommendedActionRefs: ['action-1'],
        drilldownAvailability: ['WORK_PACKAGE', 'RESPONSIBLE_ORG'],
      };
      expect(snapshot.overallQualityScore).toBe(74);
    });

    it('IEnhancedRollupInputFields satisfies shape', () => {
      const rollup: IEnhancedRollupInputFields = {
        organizationDisplayName: 'Acme Corp',
        workPackageRefs: ['WP-001'],
        openIssueCount: 5,
        overdueIssueCount: 1,
        verifiedClosureRate: 0.92,
        reopenedCount: 0,
        recurrenceQualifiedCount: 0,
        deviationCount: 2,
        approvalLagDays: 3,
        advisoryFailureCount: 0,
        planGateFailureCount: 1,
        evidenceRejectionCount: 0,
        rollupBand: 'ACCEPTABLE',
      };
      expect(rollup.organizationDisplayName).toBe('Acme Corp');
    });

    it('ILearningCandidate satisfies shape', () => {
      const candidate: ILearningCandidate = {
        learningCandidateId: 'lc-1',
        projectId: 'proj-1',
        rootCauseRecordId: 'rc-1',
        state: 'DRAFT',
        targetType: 'STANDARD',
        recommendationSummary: 'Update welding procedure',
        submittedByUserId: null,
        submittedAt: null,
        moeReviewOutcome: null,
        publishedUpdateNoticeId: null,
      };
      expect(candidate.learningCandidateId).toBe('lc-1');
    });

    it('IEnterpriseRollupProjection satisfies shape', () => {
      const projection: IEnterpriseRollupProjection = {
        projectionId: 'erp-1',
        organizationKey: 'ORG-A',
        aggregatedFromProjectIds: ['proj-1', 'proj-2'],
        compositeRollupBand: 'STRONG',
        isProjectEditable: false,
        computedAt: '2026-03-25T00:00:00Z',
      };
      expect(projection.projectionId).toBe('erp-1');
    });
  });
});

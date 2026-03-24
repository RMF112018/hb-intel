import { describe, expect, it } from 'vitest';

import { deriveSafetyPosture, createPERProjection } from '../../index.js';
import type { ISafetyCompositeScorecard } from '../../index.js';

const baseScorecard: ISafetyCompositeScorecard = {
  projectId: 'proj-001',
  computedAt: '2026-03-24T10:00:00Z',
  inspectionTrend: {
    latestNormalizedScore: 85,
    trendDirection: 'STABLE',
    windowWeeks: 4,
    inspectionCount: 4,
    latestInspectionDate: '2026-03-20',
  },
  correctiveActions: {
    openCount: 2,
    overdueCount: 0,
    criticalOpenCount: 0,
    averageDaysOpen: 3,
    majorOverdueCount: 0,
  },
  readiness: {
    projectDecision: 'READY',
    subcontractorsNotReady: 0,
    activitiesWithHardBlockers: 0,
    activeProjectBlockers: 0,
    activeExceptions: 0,
  },
  blockers: {
    hardBlockersActive: 0,
    softBlockersActive: 0,
    exceptionsActive: 0,
    overridesActive: 0,
  },
  compliance: {
    ssspStatus: 'APPROVED',
    inspectionCurrentWeekComplete: true,
    subcontractorsWithMissingSubmissions: 0,
    certificationsExpiringSoon: 0,
    certificationsExpired: 0,
    orientationCompletionRate: 1.0,
  },
  overallPosture: 'NORMAL',
};

describe('P3-E8-T09 Publication business rules', () => {
  // =========================================================================
  // Safety Posture Derivation (§2.2)
  // =========================================================================

  describe('deriveSafetyPosture', () => {
    it('NORMAL when no issues', () => {
      expect(deriveSafetyPosture(baseScorecard)).toBe('NORMAL');
    });

    it('CRITICAL when HARD blockers active', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        blockers: { ...baseScorecard.blockers, hardBlockersActive: 1 },
      })).toBe('CRITICAL');
    });

    it('CRITICAL when CRITICAL CA open', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        correctiveActions: { ...baseScorecard.correctiveActions, criticalOpenCount: 1 },
      })).toBe('CRITICAL');
    });

    it('CRITICAL when project NOT_READY', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        readiness: { ...baseScorecard.readiness, projectDecision: 'NOT_READY' },
      })).toBe('CRITICAL');
    });

    it('AT_RISK when MAJOR CA overdue', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        correctiveActions: { ...baseScorecard.correctiveActions, majorOverdueCount: 1 },
      })).toBe('AT_RISK');
    });

    it('AT_RISK when 2+ subcontractors NOT_READY', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        readiness: { ...baseScorecard.readiness, subcontractorsNotReady: 2 },
      })).toBe('AT_RISK');
    });

    it('AT_RISK when inspection score < 70', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        inspectionTrend: { ...baseScorecard.inspectionTrend, latestNormalizedScore: 65 },
      })).toBe('AT_RISK');
    });

    it('ATTENTION when READY_WITH_EXCEPTION', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        readiness: { ...baseScorecard.readiness, projectDecision: 'READY_WITH_EXCEPTION' },
      })).toBe('ATTENTION');
    });

    it('ATTENTION when trend DECLINING', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        inspectionTrend: { ...baseScorecard.inspectionTrend, trendDirection: 'DECLINING' },
      })).toBe('ATTENTION');
    });

    it('ATTENTION when 1 subcontractor NOT_READY', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        readiness: { ...baseScorecard.readiness, subcontractorsNotReady: 1 },
      })).toBe('ATTENTION');
    });

    it('ATTENTION when certifications expired', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        compliance: { ...baseScorecard.compliance, certificationsExpired: 1 },
      })).toBe('ATTENTION');
    });

    it('INSUFFICIENT_DATA when project < 2 weeks and no inspections', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        inspectionTrend: { ...baseScorecard.inspectionTrend, inspectionCount: 0, latestNormalizedScore: null },
      }, 1)).toBe('INSUFFICIENT_DATA');
    });

    it('CRITICAL takes priority over AT_RISK', () => {
      expect(deriveSafetyPosture({
        ...baseScorecard,
        blockers: { ...baseScorecard.blockers, hardBlockersActive: 1 },
        correctiveActions: { ...baseScorecard.correctiveActions, majorOverdueCount: 2 },
      })).toBe('CRITICAL');
    });
  });

  // =========================================================================
  // PER Projection (§2.3)
  // =========================================================================

  describe('createPERProjection', () => {
    it('creates sanitized projection from scorecard', () => {
      const projection = createPERProjection(baseScorecard, 3, { NEAR_MISS: 2, FIRST_AID: 1 });

      expect(projection.projectId).toBe('proj-001');
      expect(projection.overallPosture).toBe('NORMAL');
      expect(projection.inspectionScoreBand).toBe('MED'); // 85 → MED
      expect(projection.trendDirection).toBe('STABLE');
      expect(projection.openCorrectiveActionCount).toBe(2);
      expect(projection.overdueCorrectiveActionCount).toBe(0);
      expect(projection.projectReadinessDecision).toBe('READY');
      expect(projection.activeBlockerCount).toBe(0);
      expect(projection.incidentCountThisMonth).toBe(3);
      expect(projection.incidentTypeSummary).toEqual({ NEAR_MISS: 2, FIRST_AID: 1 });
      expect(projection.ssspApproved).toBe(true);
    });

    it('returns HIGH band for score >= 90', () => {
      const highScorecard = {
        ...baseScorecard,
        inspectionTrend: { ...baseScorecard.inspectionTrend, latestNormalizedScore: 95 },
      };
      const projection = createPERProjection(highScorecard, 0, {});
      expect(projection.inspectionScoreBand).toBe('HIGH');
    });

    it('returns LOW band for score < 70', () => {
      const lowScorecard = {
        ...baseScorecard,
        inspectionTrend: { ...baseScorecard.inspectionTrend, latestNormalizedScore: 55 },
      };
      const projection = createPERProjection(lowScorecard, 0, {});
      expect(projection.inspectionScoreBand).toBe('LOW');
    });

    it('returns null band when no inspections', () => {
      const noInspScorecard = {
        ...baseScorecard,
        inspectionTrend: { ...baseScorecard.inspectionTrend, latestNormalizedScore: null },
      };
      const projection = createPERProjection(noInspScorecard, 0, {});
      expect(projection.inspectionScoreBand).toBeNull();
    });

    it('ssspApproved false when SSSP not approved', () => {
      const draftScorecard = {
        ...baseScorecard,
        compliance: { ...baseScorecard.compliance, ssspStatus: 'DRAFT' as const },
      };
      const projection = createPERProjection(draftScorecard, 0, {});
      expect(projection.ssspApproved).toBe(false);
    });
  });
});

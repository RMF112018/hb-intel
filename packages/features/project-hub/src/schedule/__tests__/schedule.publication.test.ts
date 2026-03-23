import { describe, expect, it } from 'vitest';

import { DEFAULT_MILESTONE_THRESHOLDS, DEFAULT_SCHEDULE_SUMMARY_THRESHOLDS } from '../constants/index.js';
import {
  buildMilestoneSummary,
  calculateScheduleOverallStatus,
  createPublishedActivitySnapshot,
  findNextMilestone,
  hasUnresolvedHardBlockers,
  transitionPublicationStatus,
  validatePublicationAdvance,
} from '../publication/index.js';
import { createMockPublicationRecord } from '../../../testing/createMockPublicationRecord.js';
import { mockPublicationBlockers, scheduleSummaryVarianceScenarios } from '../../../testing/mockPublicationScenarios.js';

describe('P3-E5-T03 schedule publication', () => {
  describe('transitionPublicationStatus (§3.1)', () => {
    it('Draft → ReadyForReview via submit', () => {
      expect(transitionPublicationStatus('Draft', 'submit')).toBe('ReadyForReview');
    });

    it('ReadyForReview → Published via approve', () => {
      expect(transitionPublicationStatus('ReadyForReview', 'approve')).toBe('Published');
    });

    it('ReadyForReview → Draft via reject', () => {
      expect(transitionPublicationStatus('ReadyForReview', 'reject')).toBe('Draft');
    });

    it('Published → Superseded via supersede', () => {
      expect(transitionPublicationStatus('Published', 'supersede')).toBe('Superseded');
    });

    it('throws on invalid transition: Draft → approve', () => {
      expect(() => transitionPublicationStatus('Draft', 'approve')).toThrow(
        "Invalid publication transition: cannot 'approve' from 'Draft'",
      );
    });

    it('throws on invalid transition: Superseded → submit', () => {
      expect(() => transitionPublicationStatus('Superseded', 'submit')).toThrow();
    });

    it('throws on invalid transition: Published → approve', () => {
      expect(() => transitionPublicationStatus('Published', 'approve')).toThrow();
    });
  });

  describe('validatePublicationAdvance', () => {
    it('allows Draft → ReadyForReview always', () => {
      const pub = createMockPublicationRecord({ lifecycleStatus: 'Draft' });
      const result = validatePublicationAdvance(pub, 'ReadyForReview');
      expect(result.canAdvance).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('blocks ReadyForReview → Published with unresolved hard blocker', () => {
      const pub = createMockPublicationRecord({
        lifecycleStatus: 'ReadyForReview',
        reviewedBy: 'pe-001',
        blockers: [mockPublicationBlockers.unresolvedHard],
      });
      const result = validatePublicationAdvance(pub, 'Published');
      expect(result.canAdvance).toBe(false);
      expect(result.blockers[0]).toContain('UNRESOLVED_CRITICAL_BLOCKER');
    });

    it('blocks ReadyForReview → Published without PE reviewer', () => {
      const pub = createMockPublicationRecord({
        lifecycleStatus: 'ReadyForReview',
        reviewedBy: null,
        blockers: [],
      });
      const result = validatePublicationAdvance(pub, 'Published');
      expect(result.canAdvance).toBe(false);
      expect(result.blockers[0]).toContain('PE reviewer');
    });

    it('allows ReadyForReview → Published with resolved blockers and PE reviewer', () => {
      const pub = createMockPublicationRecord({
        lifecycleStatus: 'ReadyForReview',
        reviewedBy: 'pe-001',
        blockers: [mockPublicationBlockers.resolvedHard, mockPublicationBlockers.unresolvedSoft],
      });
      const result = validatePublicationAdvance(pub, 'Published');
      expect(result.canAdvance).toBe(true);
    });

    it('allows Published → Superseded always', () => {
      const pub = createMockPublicationRecord({ lifecycleStatus: 'Published' });
      const result = validatePublicationAdvance(pub, 'Superseded');
      expect(result.canAdvance).toBe(true);
    });
  });

  describe('createPublishedActivitySnapshot (§3.3)', () => {
    const source = {
      externalActivityKey: 'src-001::A1000',
      sourceActivityCode: 'A1000',
      activityName: 'Excavation',
      targetStartDate: '2026-02-01',
      targetFinishDate: '2026-04-01',
      percentComplete: 50,
      totalFloatHrs: 80,
      activityType: 'TT_Task',
    };

    it('uses source dates when no commitment', () => {
      const snap = createPublishedActivitySnapshot('pub-001', source, null, '2026-04-01');
      expect(snap.publishedStartDate).toBe('2026-02-01');
      expect(snap.publishedFinishDate).toBe('2026-04-01');
      expect(snap.committedFinishDate).toBeNull();
      expect(snap.reconciliationStatus).toBe('Aligned');
      expect(snap.varianceFromBaselineDays).toBe(0);
    });

    it('uses committed dates when present', () => {
      const commitment = {
        committedStartDate: '2026-02-15',
        committedFinishDate: '2026-04-15',
        reconciliationStatus: 'PMOverride' as const,
      };
      const snap = createPublishedActivitySnapshot('pub-001', source, commitment, '2026-04-01');
      expect(snap.publishedStartDate).toBe('2026-02-15');
      expect(snap.publishedFinishDate).toBe('2026-04-15');
      expect(snap.committedFinishDate).toBe('2026-04-15');
      expect(snap.varianceFromBaselineDays).toBe(14);
    });

    it('detects milestone from activity type', () => {
      const mileSource = { ...source, activityType: 'TT_Mile' };
      const snap = createPublishedActivitySnapshot('pub-001', mileSource, null, null);
      expect(snap.isMilestone).toBe(true);
    });

    it('detects critical path from float', () => {
      const critSource = { ...source, totalFloatHrs: 0 };
      const snap = createPublishedActivitySnapshot('pub-001', critSource, null, null);
      expect(snap.isCriticalPath).toBe(true);
    });
  });

  describe('calculateScheduleOverallStatus (§19.2)', () => {
    const thresholds = DEFAULT_SCHEDULE_SUMMARY_THRESHOLDS;

    it('returns OnTrack for negative variance', () => {
      expect(calculateScheduleOverallStatus(scheduleSummaryVarianceScenarios.onTrack, thresholds)).toBe('OnTrack');
    });

    it('returns OnTrack for zero variance', () => {
      expect(calculateScheduleOverallStatus(scheduleSummaryVarianceScenarios.onTrackZero, thresholds)).toBe('OnTrack');
    });

    it('returns AtRisk for 1-7 days', () => {
      expect(calculateScheduleOverallStatus(scheduleSummaryVarianceScenarios.atRisk, thresholds)).toBe('AtRisk');
    });

    it('returns AtRisk at 7-day boundary', () => {
      expect(calculateScheduleOverallStatus(scheduleSummaryVarianceScenarios.atRiskBoundary, thresholds)).toBe('AtRisk');
    });

    it('returns Delayed for 8-21 days', () => {
      expect(calculateScheduleOverallStatus(scheduleSummaryVarianceScenarios.delayed, thresholds)).toBe('Delayed');
    });

    it('returns Delayed at 21-day boundary', () => {
      expect(calculateScheduleOverallStatus(scheduleSummaryVarianceScenarios.delayedBoundary, thresholds)).toBe('Delayed');
    });

    it('returns Critical above 21 days', () => {
      expect(calculateScheduleOverallStatus(scheduleSummaryVarianceScenarios.critical, thresholds)).toBe('Critical');
    });
  });

  describe('buildMilestoneSummary', () => {
    it('aggregates counts for mixed milestone set', () => {
      const milestones = [
        { actualDate: '2026-03-01', varianceDays: -5, status: 'Achieved' as const },
        { actualDate: '2026-02-15', varianceDays: 0, status: 'Achieved' as const },
        { actualDate: null, varianceDays: -3, status: 'OnTrack' as const },
        { actualDate: null, varianceDays: 10, status: 'AtRisk' as const },
        { actualDate: null, varianceDays: 25, status: 'Delayed' as const },
        { actualDate: null, varianceDays: 45, status: 'Critical' as const },
      ];
      const summary = buildMilestoneSummary(milestones, DEFAULT_MILESTONE_THRESHOLDS);
      expect(summary.total).toBe(6);
      expect(summary.achieved).toBe(2);
      expect(summary.onTrack).toBe(1);
      expect(summary.atRisk).toBe(1);
      expect(summary.delayed).toBe(1);
      expect(summary.critical).toBe(1);
      expect(summary.notStarted).toBe(0);
    });

    it('returns all zeros for empty set', () => {
      const summary = buildMilestoneSummary([], DEFAULT_MILESTONE_THRESHOLDS);
      expect(summary.total).toBe(0);
      expect(summary.achieved).toBe(0);
    });
  });

  describe('findNextMilestone', () => {
    it('picks earliest future milestone', () => {
      const milestones = [
        { milestoneName: 'Late', forecastDate: '2026-12-01', varianceDays: 5, status: 'AtRisk' as const, actualDate: null },
        { milestoneName: 'Early', forecastDate: '2026-06-01', varianceDays: -3, status: 'OnTrack' as const, actualDate: null },
      ];
      const next = findNextMilestone(milestones);
      expect(next?.milestoneName).toBe('Early');
      expect(next?.publishedForecastDate).toBe('2026-06-01');
    });

    it('returns null when all milestones are achieved', () => {
      const milestones = [
        { milestoneName: 'Done', forecastDate: '2026-03-01', varianceDays: 0, status: 'Achieved' as const, actualDate: '2026-03-01' },
      ];
      expect(findNextMilestone(milestones)).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(findNextMilestone([])).toBeNull();
    });

    it('skips superseded milestones', () => {
      const milestones = [
        { milestoneName: 'Superseded', forecastDate: '2026-05-01', varianceDays: 0, status: 'Superseded' as const, actualDate: null },
        { milestoneName: 'Active', forecastDate: '2026-07-01', varianceDays: 3, status: 'AtRisk' as const, actualDate: null },
      ];
      const next = findNextMilestone(milestones);
      expect(next?.milestoneName).toBe('Active');
    });
  });

  describe('hasUnresolvedHardBlockers', () => {
    it('returns true with unresolved Hard blocker', () => {
      expect(hasUnresolvedHardBlockers([mockPublicationBlockers.unresolvedHard])).toBe(true);
    });

    it('returns false with only resolved Hard blocker', () => {
      expect(hasUnresolvedHardBlockers([mockPublicationBlockers.resolvedHard])).toBe(false);
    });

    it('returns false with only Soft blockers', () => {
      expect(hasUnresolvedHardBlockers([mockPublicationBlockers.unresolvedSoft])).toBe(false);
    });

    it('returns false for empty array', () => {
      expect(hasUnresolvedHardBlockers([])).toBe(false);
    });
  });
});

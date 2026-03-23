import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SCHEDULE_SUMMARY_THRESHOLDS,
  PUBLICATION_INITIATOR_ROLES,
  PUBLICATION_LIFECYCLE_STATUSES,
  PUBLICATION_TYPES,
  PUBLISH_BLOCKER_SEVERITIES,
  SCHEDULE_OVERALL_STATUSES,
} from '../constants/index.js';

describe('P3-E5-T03 contract stability', () => {
  describe('§3.1 publication types', () => {
    it('has exactly 6 publication types', () => {
      expect(PUBLICATION_TYPES).toHaveLength(6);
      expect(PUBLICATION_TYPES).toEqual([
        'MonthlyUpdate',
        'MilestoneReview',
        'IssueUpdate',
        'RecoveryPlan',
        'BaselineEstablishment',
        'AutoPublish',
      ]);
    });
  });

  describe('§3.1 lifecycle statuses', () => {
    it('has exactly 4 lifecycle statuses in order', () => {
      expect(PUBLICATION_LIFECYCLE_STATUSES).toHaveLength(4);
      expect(PUBLICATION_LIFECYCLE_STATUSES).toEqual([
        'Draft',
        'ReadyForReview',
        'Published',
        'Superseded',
      ]);
    });
  });

  describe('§3.1 initiator roles', () => {
    it('has exactly 3 initiator roles', () => {
      expect(PUBLICATION_INITIATOR_ROLES).toHaveLength(3);
      expect(PUBLICATION_INITIATOR_ROLES).toEqual(['PM', 'Scheduler', 'PE']);
    });
  });

  describe('§3.2 blocker severities', () => {
    it('has exactly 2 severities', () => {
      expect(PUBLISH_BLOCKER_SEVERITIES).toHaveLength(2);
      expect(PUBLISH_BLOCKER_SEVERITIES).toEqual(['Hard', 'Soft']);
    });
  });

  describe('§19 overall statuses', () => {
    it('has exactly 4 overall statuses', () => {
      expect(SCHEDULE_OVERALL_STATUSES).toHaveLength(4);
      expect(SCHEDULE_OVERALL_STATUSES).toEqual([
        'OnTrack',
        'AtRisk',
        'Delayed',
        'Critical',
      ]);
    });
  });

  describe('§19.2 default thresholds', () => {
    it('has atRiskThresholdDays = 7', () => {
      expect(DEFAULT_SCHEDULE_SUMMARY_THRESHOLDS.atRiskThresholdDays).toBe(7);
    });

    it('has delayedThresholdDays = 21', () => {
      expect(DEFAULT_SCHEDULE_SUMMARY_THRESHOLDS.delayedThresholdDays).toBe(21);
    });

    it('has criticalThresholdDays = 21', () => {
      expect(DEFAULT_SCHEDULE_SUMMARY_THRESHOLDS.criticalThresholdDays).toBe(21);
    });
  });
});

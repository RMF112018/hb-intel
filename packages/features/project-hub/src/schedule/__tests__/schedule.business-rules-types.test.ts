import { describe, expect, it } from 'vitest';

import {
  AUTO_PUBLISH_CRITERIA_KEYS,
  DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS,
  DEFAULT_HOURS_PER_DAY,
  DEFAULT_PPC_ROLLING_WINDOW,
  DEFAULT_STALENESS_THRESHOLD_DAYS,
  FIELD_SUMMARY_INDEX,
  INTENT_REPLAY_STATUSES,
  SCHEDULE_AUTHORITY_LAYERS,
  SCHEDULE_CAPABILITIES,
} from '../constants/index.js';

describe('P3-E5-T10 contract stability', () => {
  describe('§21.1 commitment approval thresholds', () => {
    it('has 3 default thresholds', () => {
      expect(DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS).toHaveLength(3);
    });

    it('ActivityForecast = 5 days', () => {
      const af = DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS.find((t) => t.commitmentType === 'ActivityForecast');
      expect(af?.thresholdDays).toBe(5);
    });

    it('MilestoneCommitment = 3 days', () => {
      const mc = DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS.find((t) => t.commitmentType === 'MilestoneCommitment');
      expect(mc?.thresholdDays).toBe(3);
    });

    it('CompletionForecast = 1 day', () => {
      const cf = DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS.find((t) => t.commitmentType === 'CompletionForecast');
      expect(cf?.thresholdDays).toBe(1);
    });
  });

  describe('§21.2 duration conversion', () => {
    it('default hours per day = 8', () => { expect(DEFAULT_HOURS_PER_DAY).toBe(8); });
  });

  describe('§21.3 auto-publish criteria', () => {
    it('has 6 criteria keys', () => { expect(AUTO_PUBLISH_CRITERIA_KEYS).toHaveLength(6); });
  });

  describe('§21.6 staleness', () => {
    it('default threshold = 30 days', () => { expect(DEFAULT_STALENESS_THRESHOLD_DAYS).toBe(30); });
  });

  describe('§21.10 PPC', () => {
    it('default rolling window = 4', () => { expect(DEFAULT_PPC_ROLLING_WINDOW).toBe(4); });
  });

  describe('§21.9 intent replay', () => {
    it('has 5 statuses', () => { expect(INTENT_REPLAY_STATUSES).toHaveLength(5); });
  });

  describe('§22 capabilities', () => {
    it('has 12 capabilities', () => { expect(SCHEDULE_CAPABILITIES).toHaveLength(12); });
    it('each has description and dependencies', () => {
      for (const cap of SCHEDULE_CAPABILITIES) {
        expect(cap.description).toBeTruthy();
        expect(Array.isArray(cap.dependencies)).toBe(true);
      }
    });
  });

  describe('§28 field summary', () => {
    it('has 33 entries', () => { expect(FIELD_SUMMARY_INDEX).toHaveLength(33); });
    it('has 10 authority layers', () => { expect(SCHEDULE_AUTHORITY_LAYERS).toHaveLength(10); });
    it('each entry has all required fields', () => {
      for (const entry of FIELD_SUMMARY_INDEX) {
        expect(entry.recordType).toBeTruthy();
        expect(entry.section).toBeTruthy();
        expect(entry.primaryKey).toBeTruthy();
        expect(entry.authorityLayer).toBeTruthy();
      }
    });
  });
});

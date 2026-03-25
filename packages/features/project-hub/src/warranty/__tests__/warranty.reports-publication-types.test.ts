import { describe, expect, it } from 'vitest';

import {
  WARRANTY_ACTIVITY_EVENT_DEFINITIONS,
  WARRANTY_ACTIVITY_EVENT_KEYS,
  WARRANTY_HEALTH_BAND_DEFINITIONS,
  WARRANTY_HEALTH_BANDS,
  WARRANTY_HEALTH_METRIC_DEFINITIONS,
  WARRANTY_REPORT_DESIGNATION_DEFINITIONS,
  WARRANTY_REPORT_DESIGNATION_KEYS,
  WARRANTY_WORK_QUEUE_PRIORITIES,
  WARRANTY_WORK_QUEUE_RULE_DEFINITIONS,
  WARRANTY_WORK_QUEUE_RULE_IDS,
} from '../../index.js';

describe('P3-E14-T10 Stage 8 reports-publication contract stability', () => {
  describe('Activity Spine', () => {
    it('has 24 event keys per T09 §3.2', () => { expect(WARRANTY_ACTIVITY_EVENT_KEYS).toHaveLength(24); });
    it('has 24 event definitions', () => { expect(WARRANTY_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(24); });
  });
  describe('Health Spine', () => {
    it('has 16 metric definitions (6 leading + 5 lagging + 5 recurring)', () => {
      expect(WARRANTY_HEALTH_METRIC_DEFINITIONS).toHaveLength(16);
    });
    it('has 6 leading indicators', () => {
      expect(WARRANTY_HEALTH_METRIC_DEFINITIONS.filter((m) => m.category === 'Leading')).toHaveLength(6);
    });
    it('has 5 lagging indicators', () => {
      expect(WARRANTY_HEALTH_METRIC_DEFINITIONS.filter((m) => m.category === 'Lagging')).toHaveLength(5);
    });
    it('has 5 recurring failure signals', () => {
      expect(WARRANTY_HEALTH_METRIC_DEFINITIONS.filter((m) => m.category === 'RecurringFailure')).toHaveLength(5);
    });
    it('has 4 health bands per T09 §4.5', () => { expect(WARRANTY_HEALTH_BAND_DEFINITIONS).toHaveLength(4); });
    it('WARRANTY_HEALTH_BANDS has 4', () => { expect(WARRANTY_HEALTH_BANDS).toHaveLength(4); });
  });
  describe('Work Queue', () => {
    it('has 20 rule IDs per T09 §5.2', () => { expect(WARRANTY_WORK_QUEUE_RULE_IDS).toHaveLength(20); });
    it('has 20 rule definitions', () => { expect(WARRANTY_WORK_QUEUE_RULE_DEFINITIONS).toHaveLength(20); });
    it('has 5 priority levels', () => { expect(WARRANTY_WORK_QUEUE_PRIORITIES).toHaveLength(5); });
    it('WQ-WAR-08 is Critical', () => {
      expect(WARRANTY_WORK_QUEUE_RULE_DEFINITIONS.find((r) => r.ruleId === 'WQ-WAR-08')?.priority).toBe('Critical');
    });
    it('WQ-WAR-14 is Critical', () => {
      expect(WARRANTY_WORK_QUEUE_RULE_DEFINITIONS.find((r) => r.ruleId === 'WQ-WAR-14')?.priority).toBe('Critical');
    });
  });
  describe('Reports', () => {
    it('has 8 report designation keys per T09 §6.2', () => { expect(WARRANTY_REPORT_DESIGNATION_KEYS).toHaveLength(8); });
    it('has 8 report designation definitions', () => { expect(WARRANTY_REPORT_DESIGNATION_DEFINITIONS).toHaveLength(8); });
  });
});

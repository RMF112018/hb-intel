import { describe, expect, it } from 'vitest';

import {
  ORIENTATION_TOPIC_DEFINITIONS,
  ORIENTATION_WORK_QUEUE_TRIGGERS,
  CERTIFICATION_WORK_QUEUE_TRIGGERS,
  EXPIRING_SOON_THRESHOLD_DAYS,
  ORIENTATION_PENDING_ESCALATION_DAYS,
  REQUIRED_EVIDENCE_METHODS,
} from '../../index.js';

describe('P3-E8-T07 Compliance contract stability', () => {
  describe('Orientation topic definitions', () => {
    it('defines 8 topics per §1.2', () => {
      expect(ORIENTATION_TOPIC_DEFINITIONS).toHaveLength(8);
    });

    it('has at least 6 required topics', () => {
      const required = ORIENTATION_TOPIC_DEFINITIONS.filter((t) => t.isRequired);
      expect(required.length).toBeGreaterThanOrEqual(6);
    });

    it('each topic has a unique key', () => {
      const keys = ORIENTATION_TOPIC_DEFINITIONS.map((t) => t.topicKey);
      expect(new Set(keys).size).toBe(8);
    });
  });

  describe('Work queue triggers', () => {
    it('orientation has 3 triggers per §1', () => {
      expect(ORIENTATION_WORK_QUEUE_TRIGGERS).toHaveLength(3);
    });

    it('certification has 3 triggers per §3', () => {
      expect(CERTIFICATION_WORK_QUEUE_TRIGGERS).toHaveLength(3);
    });
  });

  describe('Thresholds', () => {
    it('expiring soon is 30 days', () => {
      expect(EXPIRING_SOON_THRESHOLD_DAYS).toBe(30);
    });

    it('orientation pending escalation is 2 days', () => {
      expect(ORIENTATION_PENDING_ESCALATION_DAYS).toBe(2);
    });
  });

  describe('Evidence requirements', () => {
    it('PHYSICAL_SIGNATURE requires evidence', () => {
      expect(REQUIRED_EVIDENCE_METHODS).toContain('PHYSICAL_SIGNATURE');
    });

    it('only 1 method requires evidence', () => {
      expect(REQUIRED_EVIDENCE_METHODS).toHaveLength(1);
    });
  });
});

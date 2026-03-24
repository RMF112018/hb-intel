import { describe, expect, it } from 'vitest';

import {
  SAFETY_POSTURES,
  SAFETY_ACTIVITY_EVENT_TYPES,
  SAFETY_RELATIONSHIP_TYPES,
  SAFETY_REPORT_TYPES,
  SAFETY_ACTIVITY_EVENTS,
  SAFETY_WORK_QUEUE_RULES,
  SAFETY_RELATED_ITEMS,
  SAFETY_REPORTS,
  SAFETY_HANDOFF_SCENARIOS,
  SAFETY_NEXT_MOVE_PROMPTS,
  SAFETY_POSTURE_LABELS,
  SAFETY_REPORT_TYPE_LABELS,
} from '../../index.js';

describe('P3-E8-T09 Publication contract stability', () => {
  describe('Enum arrays', () => {
    it('SAFETY_POSTURES has 5 values per §2.2', () => { expect(SAFETY_POSTURES).toHaveLength(5); });
    it('SAFETY_ACTIVITY_EVENT_TYPES has 18 values per §3', () => { expect(SAFETY_ACTIVITY_EVENT_TYPES).toHaveLength(18); });
    it('SAFETY_RELATIONSHIP_TYPES has 6 values per §5', () => { expect(SAFETY_RELATIONSHIP_TYPES).toHaveLength(6); });
    it('SAFETY_REPORT_TYPES has 7 values per §6', () => { expect(SAFETY_REPORT_TYPES).toHaveLength(7); });
  });

  describe('Activity spine events', () => {
    it('defines 18 event declarations per §3', () => {
      expect(SAFETY_ACTIVITY_EVENTS).toHaveLength(18);
    });

    it('each event has a unique type', () => {
      const types = SAFETY_ACTIVITY_EVENTS.map((e) => e.eventType);
      expect(new Set(types).size).toBe(18);
    });
  });

  describe('Work queue rules', () => {
    it('defines 25 rules (WQ-SAF-01 through WQ-SAF-25) per §4', () => {
      expect(SAFETY_WORK_QUEUE_RULES).toHaveLength(25);
    });

    it('rule IDs are sequential WQ-SAF-01 through WQ-SAF-25', () => {
      for (let i = 1; i <= 25; i++) {
        const id = `WQ-SAF-${String(i).padStart(2, '0')}`;
        expect(SAFETY_WORK_QUEUE_RULES.find((r) => r.ruleId === id)).toBeDefined();
      }
    });

    it('each rule has a unique ID', () => {
      const ids = SAFETY_WORK_QUEUE_RULES.map((r) => r.ruleId);
      expect(new Set(ids).size).toBe(25);
    });
  });

  describe('Related items', () => {
    it('defines 8 relationship declarations per §5', () => {
      expect(SAFETY_RELATED_ITEMS).toHaveLength(8);
    });
  });

  describe('Reports', () => {
    it('defines 7 reports per §6', () => {
      expect(SAFETY_REPORTS).toHaveLength(7);
    });

    it('incident register has privacy enforced', () => {
      const incidentReport = SAFETY_REPORTS.find((r) => r.reportType === 'INCIDENT_REGISTER');
      expect(incidentReport?.privacyEnforced).toBe(true);
    });
  });

  describe('Handoff scenarios', () => {
    it('defines 6 scenarios per §7', () => {
      expect(SAFETY_HANDOFF_SCENARIOS).toHaveLength(6);
    });
  });

  describe('Next-move prompts', () => {
    it('defines 7 prompts per §8', () => {
      expect(SAFETY_NEXT_MOVE_PROMPTS).toHaveLength(7);
    });
  });

  describe('Label maps', () => {
    it('posture labels cover all values', () => {
      for (const p of SAFETY_POSTURES) expect(SAFETY_POSTURE_LABELS[p]).toBeTruthy();
    });

    it('report type labels cover all values', () => {
      for (const r of SAFETY_REPORT_TYPES) expect(SAFETY_REPORT_TYPE_LABELS[r]).toBeTruthy();
    });
  });
});

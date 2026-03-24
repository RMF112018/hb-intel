import { describe, expect, it } from 'vitest';

import {
  READINESS_EVALUATION_LEVELS,
  READINESS_DECISIONS,
  READINESS_BLOCKER_TYPES,
  EXCEPTION_STATUSES,
  OVERRIDE_STATUSES,
  PROJECT_BLOCKERS,
  SUBCONTRACTOR_BLOCKERS,
  ACTIVITY_BLOCKERS,
  READINESS_WORK_QUEUE_TRIGGERS,
  OVERRIDE_REQUIRED_ACKNOWLEDGERS,
  EXCEPTION_MIN_RATIONALE_LENGTH,
  READINESS_EVALUATION_LEVEL_LABELS,
  READINESS_DECISION_LABELS,
  BLOCKER_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
  OVERRIDE_STATUS_LABELS,
} from '../../index.js';

describe('P3-E8-T08 Readiness contract stability', () => {
  describe('Enum arrays', () => {
    it('READINESS_EVALUATION_LEVELS has 3 values', () => { expect(READINESS_EVALUATION_LEVELS).toHaveLength(3); });
    it('READINESS_DECISIONS has 3 values', () => { expect(READINESS_DECISIONS).toHaveLength(3); });
    it('READINESS_BLOCKER_TYPES has 2 values', () => { expect(READINESS_BLOCKER_TYPES).toHaveLength(2); });
    it('EXCEPTION_STATUSES has 3 values', () => { expect(EXCEPTION_STATUSES).toHaveLength(3); });
    it('OVERRIDE_STATUSES has 4 values', () => { expect(OVERRIDE_STATUSES).toHaveLength(4); });
  });

  describe('Blocker matrices', () => {
    it('PROJECT_BLOCKERS has 8 definitions per §4', () => {
      expect(PROJECT_BLOCKERS).toHaveLength(8);
    });

    it('SUBCONTRACTOR_BLOCKERS has 9 definitions per §5', () => {
      expect(SUBCONTRACTOR_BLOCKERS).toHaveLength(9);
    });

    it('ACTIVITY_BLOCKERS has 8 definitions per §6', () => {
      expect(ACTIVITY_BLOCKERS).toHaveLength(8);
    });

    it('total blockers = 25', () => {
      expect(PROJECT_BLOCKERS.length + SUBCONTRACTOR_BLOCKERS.length + ACTIVITY_BLOCKERS.length).toBe(25);
    });

    it('all project blockers have PROJECT level', () => {
      expect(PROJECT_BLOCKERS.every((b) => b.evaluationLevel === 'PROJECT')).toBe(true);
    });

    it('all subcontractor blockers have SUBCONTRACTOR level', () => {
      expect(SUBCONTRACTOR_BLOCKERS.every((b) => b.evaluationLevel === 'SUBCONTRACTOR')).toBe(true);
    });

    it('all activity blockers have ACTIVITY level', () => {
      expect(ACTIVITY_BLOCKERS.every((b) => b.evaluationLevel === 'ACTIVITY')).toBe(true);
    });

    it('HARD blockers are never excepable', () => {
      const allBlockers = [...PROJECT_BLOCKERS, ...SUBCONTRACTOR_BLOCKERS, ...ACTIVITY_BLOCKERS];
      const hardBlockers = allBlockers.filter((b) => b.blockerType === 'HARD');
      expect(hardBlockers.every((b) => b.excepable === false)).toBe(true);
    });

    it('SOFT blockers are always excepable', () => {
      const allBlockers = [...PROJECT_BLOCKERS, ...SUBCONTRACTOR_BLOCKERS, ...ACTIVITY_BLOCKERS];
      const softBlockers = allBlockers.filter((b) => b.blockerType === 'SOFT');
      expect(softBlockers.every((b) => b.excepable === true)).toBe(true);
    });
  });

  describe('Override acknowledgers', () => {
    it('PROJECT requires SafetyManager + PM', () => {
      expect(OVERRIDE_REQUIRED_ACKNOWLEDGERS.PROJECT).toHaveLength(2);
      expect(OVERRIDE_REQUIRED_ACKNOWLEDGERS.PROJECT).toContain('SafetyManager');
      expect(OVERRIDE_REQUIRED_ACKNOWLEDGERS.PROJECT).toContain('PM');
    });

    it('SUBCONTRACTOR requires SafetyManager + PM', () => {
      expect(OVERRIDE_REQUIRED_ACKNOWLEDGERS.SUBCONTRACTOR).toHaveLength(2);
    });

    it('ACTIVITY requires SafetyManager + PM + Superintendent', () => {
      expect(OVERRIDE_REQUIRED_ACKNOWLEDGERS.ACTIVITY).toHaveLength(3);
      expect(OVERRIDE_REQUIRED_ACKNOWLEDGERS.ACTIVITY).toContain('Superintendent');
    });
  });

  describe('Work queue triggers', () => {
    it('defines 5 triggers per §10', () => {
      expect(READINESS_WORK_QUEUE_TRIGGERS).toHaveLength(5);
    });
  });

  describe('Exception validation', () => {
    it('min rationale length is 20 characters', () => {
      expect(EXCEPTION_MIN_RATIONALE_LENGTH).toBe(20);
    });
  });

  describe('Label maps', () => {
    it('evaluation level labels', () => { for (const l of READINESS_EVALUATION_LEVELS) expect(READINESS_EVALUATION_LEVEL_LABELS[l]).toBeTruthy(); });
    it('decision labels', () => { for (const d of READINESS_DECISIONS) expect(READINESS_DECISION_LABELS[d]).toBeTruthy(); });
    it('blocker type labels', () => { for (const t of READINESS_BLOCKER_TYPES) expect(BLOCKER_TYPE_LABELS[t]).toBeTruthy(); });
    it('exception status labels', () => { for (const s of EXCEPTION_STATUSES) expect(EXCEPTION_STATUS_LABELS[s]).toBeTruthy(); });
    it('override status labels', () => { for (const s of OVERRIDE_STATUSES) expect(OVERRIDE_STATUS_LABELS[s]).toBeTruthy(); });
  });
});

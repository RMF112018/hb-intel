import { describe, expect, it } from 'vitest';

import {
  BASELINE_STATUSES,
  BASELINE_FIELD_TYPES,
  ASSUMPTION_CATEGORIES,
  ASSUMPTION_RISK_LEVELS,
  STAGE7_ACTIVITY_EVENTS,
  STAGE7_HEALTH_METRICS,
  STAGE7_WORK_QUEUE_ITEMS,
  BASELINE_SECTION_DEFINITIONS,
  BASELINE_STATUS_TRANSITIONS,
  CRITICAL_BASELINE_FIELDS,
  ASSUMPTION_CATEGORY_DEFINITIONS,
  STAGE7_ACTIVITY_EVENT_DEFINITIONS,
  STAGE7_HEALTH_METRIC_DEFINITIONS,
  STAGE7_WORK_QUEUE_ITEM_DEFINITIONS,
  BASELINE_STATUS_LABELS,
  BASELINE_FIELD_TYPE_LABELS,
  ASSUMPTION_CATEGORY_LABELS,
  ASSUMPTION_RISK_LEVEL_LABELS,
} from '../../index.js';

describe('P3-E11-T10 Stage 7 Startup execution baseline contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('BaselineStatus', () => {
    it('has exactly 4 statuses per T06 §2.1', () => {
      expect(BASELINE_STATUSES).toHaveLength(4);
    });
  });

  describe('BaselineFieldType', () => {
    it('has exactly 6 field types per T06 §4', () => {
      expect(BASELINE_FIELD_TYPES).toHaveLength(6);
    });
  });

  describe('AssumptionCategory', () => {
    it('has exactly 9 categories per T06 §8', () => {
      expect(ASSUMPTION_CATEGORIES).toHaveLength(9);
    });
  });

  describe('AssumptionRiskLevel', () => {
    it('has exactly 3 risk levels per T06 §7', () => {
      expect(ASSUMPTION_RISK_LEVELS).toHaveLength(3);
    });
  });

  describe('Stage7ActivityEvent', () => {
    it('has exactly 3 events per T10 §2 Stage 7', () => {
      expect(STAGE7_ACTIVITY_EVENTS).toHaveLength(3);
    });
  });

  describe('Stage7HealthMetric', () => {
    it('has exactly 1 metric per T10 §2 Stage 7', () => {
      expect(STAGE7_HEALTH_METRICS).toHaveLength(1);
    });
  });

  describe('Stage7WorkQueueItem', () => {
    it('has exactly 1 work queue item per T10 §2 Stage 7', () => {
      expect(STAGE7_WORK_QUEUE_ITEMS).toHaveLength(1);
    });
  });

  // -- Section definitions ---------------------------------------------------

  describe('Baseline section definitions', () => {
    it('has exactly 11 sections per T06 §3.1', () => {
      expect(BASELINE_SECTION_DEFINITIONS).toHaveLength(11);
    });

    it('section numbers run 1 through 11', () => {
      const numbers = BASELINE_SECTION_DEFINITIONS.map((s) => s.sectionNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('each section has title and captureMode', () => {
      for (const s of BASELINE_SECTION_DEFINITIONS) {
        expect(s.sectionTitle).toBeTruthy();
        expect(s.captureMode).toBeTruthy();
      }
    });

    it('Section VII references ResponsibilityMatrix', () => {
      const s7 = BASELINE_SECTION_DEFINITIONS.find((s) => s.sectionNumber === 7);
      expect(s7?.captureMode).toContain('ResponsibilityMatrix');
    });
  });

  // -- Approval flow ---------------------------------------------------------

  describe('Baseline status transitions', () => {
    it('has exactly 4 transitions per T06 §2.1', () => {
      expect(BASELINE_STATUS_TRANSITIONS).toHaveLength(4);
    });

    it('includes Draft → Submitted', () => {
      expect(BASELINE_STATUS_TRANSITIONS.some((t) => t.from === 'Draft' && t.to === 'Submitted')).toBe(true);
    });

    it('includes Submitted → Draft (revert)', () => {
      expect(BASELINE_STATUS_TRANSITIONS.some((t) => t.from === 'Submitted' && t.to === 'Draft')).toBe(true);
    });

    it('includes Submitted → Approved', () => {
      expect(BASELINE_STATUS_TRANSITIONS.some((t) => t.from === 'Submitted' && t.to === 'Approved')).toBe(true);
    });

    it('includes Approved → Archived', () => {
      expect(BASELINE_STATUS_TRANSITIONS.some((t) => t.from === 'Approved' && t.to === 'Archived')).toBe(true);
    });
  });

  // -- Critical fields -------------------------------------------------------

  describe('Critical baseline fields', () => {
    it('has exactly 7 critical fields per T06 §2.3', () => {
      expect(CRITICAL_BASELINE_FIELDS).toHaveLength(7);
    });

    it('includes safetyOfficerName from Section IV', () => {
      const f = CRITICAL_BASELINE_FIELDS.find((f) => f.fieldKey === 'safetyOfficerName');
      expect(f).toBeDefined();
      expect(f?.sectionNumber).toBe(4);
    });

    it('includes projectStartDate from Section VI', () => {
      const f = CRITICAL_BASELINE_FIELDS.find((f) => f.fieldKey === 'projectStartDate');
      expect(f).toBeDefined();
      expect(f?.sectionNumber).toBe(6);
    });

    it('5 of 7 critical fields are in Section VI', () => {
      const sec6 = CRITICAL_BASELINE_FIELDS.filter((f) => f.sectionNumber === 6);
      expect(sec6).toHaveLength(5);
    });

    it('2 of 7 critical fields are in Section IV', () => {
      const sec4 = CRITICAL_BASELINE_FIELDS.filter((f) => f.sectionNumber === 4);
      expect(sec4).toHaveLength(2);
    });
  });

  // -- Assumption categories -------------------------------------------------

  describe('Assumption category definitions', () => {
    it('has exactly 9 definitions per T06 §8', () => {
      expect(ASSUMPTION_CATEGORY_DEFINITIONS).toHaveLength(9);
    });

    it('each definition has category, label, and description', () => {
      for (const def of ASSUMPTION_CATEGORY_DEFINITIONS) {
        expect(def.category).toBeTruthy();
        expect(def.label).toBeTruthy();
        expect(def.description).toBeTruthy();
      }
    });
  });

  // -- Spine publication -----------------------------------------------------

  describe('Stage 7 spine publication', () => {
    it('has 3 activity event definitions', () => {
      expect(STAGE7_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(3);
    });

    it('has 1 health metric definition', () => {
      expect(STAGE7_HEALTH_METRIC_DEFINITIONS).toHaveLength(1);
    });

    it('has 1 work queue item definition', () => {
      expect(STAGE7_WORK_QUEUE_ITEM_DEFINITIONS).toHaveLength(1);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 4 statuses', () => {
      expect(Object.keys(BASELINE_STATUS_LABELS)).toHaveLength(4);
    });

    it('labels all 6 field types', () => {
      expect(Object.keys(BASELINE_FIELD_TYPE_LABELS)).toHaveLength(6);
    });

    it('labels all 9 assumption categories', () => {
      expect(Object.keys(ASSUMPTION_CATEGORY_LABELS)).toHaveLength(9);
    });

    it('labels all 3 risk levels', () => {
      expect(Object.keys(ASSUMPTION_RISK_LEVEL_LABELS)).toHaveLength(3);
    });
  });
});

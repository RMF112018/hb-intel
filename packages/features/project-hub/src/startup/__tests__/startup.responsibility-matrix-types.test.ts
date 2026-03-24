import { describe, expect, it } from 'vitest';

import {
  MATRIX_SHEETS,
  PM_ROLE_CODES,
  FIELD_ROLE_CODES,
  ASSIGNMENT_VALUES,
  PM_TASK_CATEGORIES,
  FIELD_TASK_CATEGORIES,
  STAGE6_ACTIVITY_EVENTS,
  STAGE6_HEALTH_METRICS,
  STAGE6_WORK_QUEUE_ITEMS,
  PM_TASK_CATEGORY_DEFINITIONS,
  FIELD_TASK_CATEGORY_DEFINITIONS,
  PM_CRITICAL_CATEGORIES,
  FIELD_CRITICAL_CATEGORIES,
  PM_ASSIGNMENT_BEARING_ROW_COUNT,
  PM_REMINDER_ONLY_ROW_COUNT,
  PM_TOTAL_GOVERNED_ROW_COUNT,
  FIELD_ASSIGNMENT_BEARING_ROW_COUNT,
  GOVERNED_ROW_IMMUTABLE_FIELDS,
  STAGE6_ACTIVITY_EVENT_DEFINITIONS,
  STAGE6_HEALTH_METRIC_DEFINITIONS,
  STAGE6_WORK_QUEUE_ITEM_DEFINITIONS,
  PM_ROLE_CODE_LABELS,
  FIELD_ROLE_CODE_LABELS,
  ASSIGNMENT_VALUE_LABELS,
  MATRIX_SHEET_LABELS,
} from '../../index.js';

describe('P3-E11-T10 Stage 6 Startup responsibility matrix contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('MatrixSheet', () => {
    it('has exactly 2 sheets per T05 §2', () => {
      expect(MATRIX_SHEETS).toHaveLength(2);
    });
  });

  describe('PMRoleCode', () => {
    it('has exactly 7 PM role columns per T05 §6', () => {
      expect(PM_ROLE_CODES).toHaveLength(7);
    });
  });

  describe('FieldRoleCode', () => {
    it('has exactly 5 Field role columns per T05 §7', () => {
      expect(FIELD_ROLE_CODES).toHaveLength(5);
    });
  });

  describe('AssignmentValue', () => {
    it('has exactly 4 assignment values per T05 §8', () => {
      expect(ASSIGNMENT_VALUES).toHaveLength(4);
    });
  });

  describe('PMTaskCategory', () => {
    it('has exactly 7 PM task categories per T05 §8', () => {
      expect(PM_TASK_CATEGORIES).toHaveLength(7);
    });
  });

  describe('FieldTaskCategory', () => {
    it('has exactly 4 Field task categories per T05 §10', () => {
      expect(FIELD_TASK_CATEGORIES).toHaveLength(4);
    });
  });

  // -- Row counts ------------------------------------------------------------

  describe('Row counts', () => {
    it('PM assignment-bearing rows total 71', () => {
      expect(PM_ASSIGNMENT_BEARING_ROW_COUNT).toBe(71);
    });

    it('PM reminder-only rows total 11', () => {
      expect(PM_REMINDER_ONLY_ROW_COUNT).toBe(11);
    });

    it('PM total governed rows = 82', () => {
      expect(PM_TOTAL_GOVERNED_ROW_COUNT).toBe(82);
    });

    it('PM assignment-bearing + reminder-only = total', () => {
      expect(PM_ASSIGNMENT_BEARING_ROW_COUNT + PM_REMINDER_ONLY_ROW_COUNT).toBe(PM_TOTAL_GOVERNED_ROW_COUNT);
    });

    it('Field assignment-bearing rows total 27', () => {
      expect(FIELD_ASSIGNMENT_BEARING_ROW_COUNT).toBe(27);
    });

    it('PM category definitions sum to 71 assignment-bearing', () => {
      const total = PM_TASK_CATEGORY_DEFINITIONS.reduce((sum, c) => sum + c.assignmentBearingRowCount, 0);
      expect(total).toBe(71);
    });

    it('Field category definitions sum to 27 assignment-bearing', () => {
      const total = FIELD_TASK_CATEGORY_DEFINITIONS.reduce((sum, c) => sum + c.assignmentBearingRowCount, 0);
      expect(total).toBe(27);
    });
  });

  // -- Category definitions --------------------------------------------------

  describe('PM task category definitions', () => {
    it('has exactly 7 definitions', () => {
      expect(PM_TASK_CATEGORY_DEFINITIONS).toHaveLength(7);
    });

    it('each definition has required fields', () => {
      for (const def of PM_TASK_CATEGORY_DEFINITIONS) {
        expect(def.category).toBeTruthy();
        expect(def.label).toBeTruthy();
        expect(def.assignmentBearingRowCount).toBeGreaterThan(0);
        expect(typeof def.isCritical).toBe('boolean');
      }
    });
  });

  describe('Field task category definitions', () => {
    it('has exactly 4 definitions', () => {
      expect(FIELD_TASK_CATEGORY_DEFINITIONS).toHaveLength(4);
    });

    it('each definition has required fields', () => {
      for (const def of FIELD_TASK_CATEGORY_DEFINITIONS) {
        expect(def.category).toBeTruthy();
        expect(def.label).toBeTruthy();
        expect(def.assignmentBearingRowCount).toBeGreaterThan(0);
        expect(typeof def.isCritical).toBe('boolean');
      }
    });
  });

  // -- Critical categories ---------------------------------------------------

  describe('Critical categories', () => {
    it('PM has 3 critical categories: PX, QAQC, ProjAcct', () => {
      expect(PM_CRITICAL_CATEGORIES).toHaveLength(3);
      expect(PM_CRITICAL_CATEGORIES).toContain('PX');
      expect(PM_CRITICAL_CATEGORIES).toContain('QAQC');
      expect(PM_CRITICAL_CATEGORIES).toContain('ProjAcct');
    });

    it('Field has 2 critical categories: LeadSuper, QAQC_Field', () => {
      expect(FIELD_CRITICAL_CATEGORIES).toHaveLength(2);
      expect(FIELD_CRITICAL_CATEGORIES).toContain('LeadSuper');
      expect(FIELD_CRITICAL_CATEGORIES).toContain('QAQC_Field');
    });

    it('total 5 critical categories across both sheets', () => {
      expect(PM_CRITICAL_CATEGORIES.length + FIELD_CRITICAL_CATEGORIES.length).toBe(5);
    });

    it('PM category definitions match critical list', () => {
      const criticalFromDefs = PM_TASK_CATEGORY_DEFINITIONS.filter((d) => d.isCritical).map((d) => d.category);
      expect(criticalFromDefs.sort()).toEqual([...PM_CRITICAL_CATEGORIES].sort());
    });

    it('Field category definitions match critical list', () => {
      const criticalFromDefs = FIELD_TASK_CATEGORY_DEFINITIONS.filter((d) => d.isCritical).map((d) => d.category);
      expect(criticalFromDefs.sort()).toEqual([...FIELD_CRITICAL_CATEGORIES].sort());
    });
  });

  // -- Immutable fields ------------------------------------------------------

  describe('Governed row immutable fields', () => {
    it('has exactly 3 immutable fields', () => {
      expect(GOVERNED_ROW_IMMUTABLE_FIELDS).toHaveLength(3);
    });

    it('includes taskDescription, taskCategory, sheet', () => {
      expect(GOVERNED_ROW_IMMUTABLE_FIELDS).toContain('taskDescription');
      expect(GOVERNED_ROW_IMMUTABLE_FIELDS).toContain('taskCategory');
      expect(GOVERNED_ROW_IMMUTABLE_FIELDS).toContain('sheet');
    });
  });

  // -- Spine publication -----------------------------------------------------

  describe('Stage 6 spine publication', () => {
    it('has 2 activity events', () => {
      expect(STAGE6_ACTIVITY_EVENTS).toHaveLength(2);
      expect(STAGE6_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(2);
    });

    it('has 1 health metric', () => {
      expect(STAGE6_HEALTH_METRICS).toHaveLength(1);
      expect(STAGE6_HEALTH_METRIC_DEFINITIONS).toHaveLength(1);
    });

    it('has 2 work queue items', () => {
      expect(STAGE6_WORK_QUEUE_ITEMS).toHaveLength(2);
      expect(STAGE6_WORK_QUEUE_ITEM_DEFINITIONS).toHaveLength(2);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 7 PM roles', () => {
      expect(Object.keys(PM_ROLE_CODE_LABELS)).toHaveLength(7);
    });

    it('labels all 5 Field roles', () => {
      expect(Object.keys(FIELD_ROLE_CODE_LABELS)).toHaveLength(5);
    });

    it('labels all 4 assignment values', () => {
      expect(Object.keys(ASSIGNMENT_VALUE_LABELS)).toHaveLength(4);
    });

    it('labels all 2 sheets', () => {
      expect(Object.keys(MATRIX_SHEET_LABELS)).toHaveLength(2);
    });
  });
});

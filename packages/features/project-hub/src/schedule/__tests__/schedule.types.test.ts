import { describe, expect, it } from 'vitest';

import {
  BASELINE_TYPES,
  CALENDAR_TYPES,
  IMPORT_VALIDATION_RULES,
  PERCENT_COMPLETE_BASES,
  SCHEDULE_ACCESS_ACTIONS,
  SCHEDULE_ACTIVITY_TYPES,
  SCHEDULE_AUTHORITY_ROLES,
  SCHEDULE_CONSTRAINT_TYPE_LABELS,
  SCHEDULE_CONSTRAINT_TYPES,
  SCHEDULE_IMPORT_FORMATS,
  SCHEDULE_INTEGRATION_BOUNDARIES,
  SCHEDULE_LAYERS,
  SCHEDULE_MODULE_SCOPE,
  SCHEDULE_SOURCE_OWNER_ROLES,
  SCHEDULE_SOURCE_SYSTEMS,
  SCHEDULE_STATUS_CODES,
  SCHEDULE_VERSION_STATUS_DESCRIPTIONS,
  SCHEDULE_VERSION_STATUSES,
} from '../constants/index.js';

describe('P3-E5-T01 contract stability', () => {
  describe('module scope', () => {
    it('has correct module scope identifier', () => {
      expect(SCHEDULE_MODULE_SCOPE).toBe('schedule');
    });
  });

  describe('§1.1 source systems', () => {
    it('has exactly 5 source systems', () => {
      expect(SCHEDULE_SOURCE_SYSTEMS).toHaveLength(5);
    });

    it('contains all expected systems', () => {
      expect(SCHEDULE_SOURCE_SYSTEMS).toEqual([
        'PrimaveraP6',
        'MSProject',
        'Asta',
        'Oracle',
        'Other',
      ]);
    });

    it('has exactly 3 source owner roles', () => {
      expect(SCHEDULE_SOURCE_OWNER_ROLES).toHaveLength(3);
      expect(SCHEDULE_SOURCE_OWNER_ROLES).toEqual(['PM', 'Scheduler', 'PE']);
    });
  });

  describe('§1.2 version statuses', () => {
    it('has exactly 6 version statuses', () => {
      expect(SCHEDULE_VERSION_STATUSES).toHaveLength(6);
    });

    it('contains all expected statuses in lifecycle order', () => {
      expect(SCHEDULE_VERSION_STATUSES).toEqual([
        'Processing',
        'Parsed',
        'Active',
        'Superseded',
        'Failed',
        'Secondary',
      ]);
    });

    it('has a description for every status', () => {
      expect(SCHEDULE_VERSION_STATUS_DESCRIPTIONS).toHaveLength(6);
      for (const status of SCHEDULE_VERSION_STATUSES) {
        expect(
          SCHEDULE_VERSION_STATUS_DESCRIPTIONS.find((d) => d.status === status),
        ).toBeDefined();
      }
    });

    it('has exactly 3 import formats', () => {
      expect(SCHEDULE_IMPORT_FORMATS).toHaveLength(3);
      expect(SCHEDULE_IMPORT_FORMATS).toEqual(['XER', 'XML', 'CSV']);
    });
  });

  describe('§1.3 baseline types', () => {
    it('has exactly 4 baseline types', () => {
      expect(BASELINE_TYPES).toHaveLength(4);
    });

    it('contains all expected types', () => {
      expect(BASELINE_TYPES).toEqual([
        'ContractBaseline',
        'ApprovedRevision',
        'RecoveryBaseline',
        'Scenario',
      ]);
    });
  });

  describe('§1.4 activity types and status codes', () => {
    it('has exactly 5 activity types', () => {
      expect(SCHEDULE_ACTIVITY_TYPES).toHaveLength(5);
    });

    it('contains all expected activity types', () => {
      expect(SCHEDULE_ACTIVITY_TYPES).toEqual([
        'TT_Task',
        'TT_Mile',
        'TT_LOE',
        'TT_FinMile',
        'TT_WBS',
      ]);
    });

    it('has exactly 3 status codes', () => {
      expect(SCHEDULE_STATUS_CODES).toHaveLength(3);
      expect(SCHEDULE_STATUS_CODES).toEqual([
        'TK_NotStart',
        'TK_Active',
        'TK_Complete',
      ]);
    });

    it('has exactly 4 percent complete bases', () => {
      expect(PERCENT_COMPLETE_BASES).toHaveLength(4);
      expect(PERCENT_COMPLETE_BASES).toEqual([
        'Duration',
        'Physical',
        'Units',
        'Manual',
      ]);
    });
  });

  describe('§1.4.1 constraint types', () => {
    it('has exactly 8 constraint types', () => {
      expect(SCHEDULE_CONSTRAINT_TYPES).toHaveLength(8);
    });

    it('contains all expected constraint types', () => {
      expect(SCHEDULE_CONSTRAINT_TYPES).toEqual([
        'CS_MSOA',
        'CS_MFOA',
        'CS_MSON',
        'CS_MFON',
        'CS_SNLF',
        'CS_FNLF',
        'CS_MEOA',
        'CS_MEON',
      ]);
    });

    it('has a label entry for every constraint type', () => {
      expect(SCHEDULE_CONSTRAINT_TYPE_LABELS).toHaveLength(8);
      for (const type of SCHEDULE_CONSTRAINT_TYPES) {
        const label = SCHEDULE_CONSTRAINT_TYPE_LABELS.find((l) => l.type === type);
        expect(label).toBeDefined();
        expect(label!.abbreviation).toBeTruthy();
        expect(label!.meaning).toBeTruthy();
      }
    });
  });

  describe('§1.6 import validation rules', () => {
    it('has exactly 10 import validation rules', () => {
      expect(IMPORT_VALIDATION_RULES).toHaveLength(10);
    });

    it('has 5 error-severity rules (4 unconditional abort + 1 conditional)', () => {
      const errorRules = IMPORT_VALIDATION_RULES.filter((r) => r.severity === 'error');
      expect(errorRules).toHaveLength(5);
      const abortRules = errorRules.filter((r) => r.behavior === 'Abort parse');
      expect(abortRules).toHaveLength(4);
    });

    it('has exactly 1 informational rule', () => {
      const infoRules = IMPORT_VALIDATION_RULES.filter((r) => r.severity === 'informational');
      expect(infoRules).toHaveLength(1);
    });
  });

  describe('§17 calendar types', () => {
    it('has exactly 2 calendar types', () => {
      expect(CALENDAR_TYPES).toHaveLength(2);
      expect(CALENDAR_TYPES).toEqual(['SourceCalendar', 'OperatingCalendar']);
    });
  });

  describe('authority model', () => {
    it('has exactly 6 authority roles', () => {
      expect(SCHEDULE_AUTHORITY_ROLES).toHaveLength(6);
      expect(SCHEDULE_AUTHORITY_ROLES).toEqual([
        'PM',
        'PE',
        'Scheduler',
        'Superintendent',
        'Foreman',
        'MOE',
      ]);
    });

    it('has exactly 5 access actions', () => {
      expect(SCHEDULE_ACCESS_ACTIONS).toHaveLength(5);
      expect(SCHEDULE_ACCESS_ACTIONS).toEqual([
        'read',
        'write',
        'approve',
        'configure',
        'publish',
      ]);
    });

    it('has exactly 4 layers', () => {
      expect(SCHEDULE_LAYERS).toHaveLength(4);
      expect(SCHEDULE_LAYERS).toEqual([
        'master-schedule',
        'operating',
        'field-execution',
        'published-forecast',
      ]);
    });
  });

  describe('integration boundaries', () => {
    it('has exactly 5 integration boundaries', () => {
      expect(SCHEDULE_INTEGRATION_BOUNDARIES).toHaveLength(5);
    });

    it('has exactly 1 active inbound boundary (CPM import)', () => {
      const active = SCHEDULE_INTEGRATION_BOUNDARIES.filter((b) => b.status === 'active');
      expect(active).toHaveLength(1);
      expect(active[0].direction).toBe('inbound');
      expect(active[0].key).toBe('cpm-schedule-import');
    });

    it('has 4 planned outbound boundaries', () => {
      const planned = SCHEDULE_INTEGRATION_BOUNDARIES.filter((b) => b.status === 'planned');
      expect(planned).toHaveLength(4);
      for (const b of planned) {
        expect(b.direction).toBe('outbound');
      }
    });
  });
});

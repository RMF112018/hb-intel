import { describe, expect, it } from 'vitest';

import {
  canSubmitResponsibilityMatrixCertification,
  computeMatrixReadiness,
  hasPrimaryCoverage,
  isAssignmentAcknowledged,
  isCriticalCategory,
  isCustomRowFieldMutable,
  isGovernedRowFieldImmutable,
} from '../../index.js';

import { createMockResponsibilityAssignment } from '../../../testing/createMockResponsibilityAssignment.js';

describe('P3-E11-T10 Stage 6 Startup responsibility matrix business rules', () => {
  // -- Governed Row Immutability (T05 §4) ------------------------------------

  describe('isGovernedRowFieldImmutable', () => {
    it('returns true for taskDescription', () => {
      expect(isGovernedRowFieldImmutable('taskDescription')).toBe(true);
    });

    it('returns true for taskCategory', () => {
      expect(isGovernedRowFieldImmutable('taskCategory')).toBe(true);
    });

    it('returns true for sheet', () => {
      expect(isGovernedRowFieldImmutable('sheet')).toBe(true);
    });

    it('returns false for sortOrder', () => {
      expect(isGovernedRowFieldImmutable('sortOrder')).toBe(false);
    });

    it('returns false for assignedPersonName', () => {
      expect(isGovernedRowFieldImmutable('assignedPersonName')).toBe(false);
    });
  });

  describe('isCustomRowFieldMutable', () => {
    it('allows taskDescription on custom rows', () => {
      expect(isCustomRowFieldMutable('taskDescription')).toBe(true);
    });

    it('disallows sheet on custom rows', () => {
      expect(isCustomRowFieldMutable('sheet')).toBe(false);
    });

    it('disallows taskCategory on custom rows', () => {
      expect(isCustomRowFieldMutable('taskCategory')).toBe(false);
    });
  });

  // -- Critical Category (T05 §9.2) ------------------------------------------

  describe('isCriticalCategory', () => {
    it('PM PX is critical', () => {
      expect(isCriticalCategory('PM', 'PX')).toBe(true);
    });

    it('PM QAQC is critical', () => {
      expect(isCriticalCategory('PM', 'QAQC')).toBe(true);
    });

    it('PM ProjAcct is critical', () => {
      expect(isCriticalCategory('PM', 'ProjAcct')).toBe(true);
    });

    it('PM SPM is not critical', () => {
      expect(isCriticalCategory('PM', 'SPM')).toBe(false);
    });

    it('PM PA is not critical', () => {
      expect(isCriticalCategory('PM', 'PA')).toBe(false);
    });

    it('Field LeadSuper is critical', () => {
      expect(isCriticalCategory('Field', 'LeadSuper')).toBe(true);
    });

    it('Field QAQC_Field is critical', () => {
      expect(isCriticalCategory('Field', 'QAQC_Field')).toBe(true);
    });

    it('Field MEPSuper is not critical', () => {
      expect(isCriticalCategory('Field', 'MEPSuper')).toBe(false);
    });

    it('Field InteriorEnvelope is not critical', () => {
      expect(isCriticalCategory('Field', 'InteriorEnvelope')).toBe(false);
    });
  });

  // -- Primary Coverage (T05 §9.1) -------------------------------------------

  describe('hasPrimaryCoverage', () => {
    it('returns true when Primary with named person exists', () => {
      expect(hasPrimaryCoverage([
        createMockResponsibilityAssignment({ value: 'Primary', assignedPersonName: 'John Smith' }),
      ])).toBe(true);
    });

    it('returns false when Primary exists but no name', () => {
      expect(hasPrimaryCoverage([
        createMockResponsibilityAssignment({ value: 'Primary', assignedPersonName: null }),
      ])).toBe(false);
    });

    it('returns false when Primary has empty name', () => {
      expect(hasPrimaryCoverage([
        createMockResponsibilityAssignment({ value: 'Primary', assignedPersonName: '' }),
      ])).toBe(false);
    });

    it('returns false when only Support exists', () => {
      expect(hasPrimaryCoverage([
        createMockResponsibilityAssignment({ value: 'Support', assignedPersonName: 'Jane Doe' }),
      ])).toBe(false);
    });

    it('returns false for empty assignments', () => {
      expect(hasPrimaryCoverage([])).toBe(false);
    });

    it('returns true when one of multiple assignments is Primary with name', () => {
      expect(hasPrimaryCoverage([
        createMockResponsibilityAssignment({ value: 'Support', assignedPersonName: 'Jane Doe' }),
        createMockResponsibilityAssignment({ value: 'Primary', assignedPersonName: 'John Smith' }),
      ])).toBe(true);
    });
  });

  // -- Assignment Acknowledgment (T05 §9.2) ----------------------------------

  describe('isAssignmentAcknowledged', () => {
    it('returns true when acknowledgedAt is populated', () => {
      expect(isAssignmentAcknowledged({ acknowledgedAt: '2026-03-24T10:00:00Z' })).toBe(true);
    });

    it('returns false when acknowledgedAt is null', () => {
      expect(isAssignmentAcknowledged({ acknowledgedAt: null })).toBe(false);
    });
  });

  // -- Certification Eligibility (T05 §9.1 + §9.2) --------------------------

  describe('canSubmitResponsibilityMatrixCertification', () => {
    const makePMRow = (category: string, critical: boolean, rowId: string) => ({
      rowId, matrixId: 'mtx-001', projectId: 'proj-001', sheet: 'PM' as const,
      taskCategory: category, taskDescription: 'Test', isCriticalCategory: critical,
      isCustomRow: false, isReminderOnly: false, sortOrder: 1,
    });

    const makeFieldRow = (category: string, critical: boolean, rowId: string) => ({
      rowId, matrixId: 'mtx-001', projectId: 'proj-001', sheet: 'Field' as const,
      taskCategory: category, taskDescription: 'Test', isCriticalCategory: critical,
      isCustomRow: false, isReminderOnly: false, sortOrder: 1,
    });

    it('returns true when all categories have named Primary and critical acknowledged', () => {
      const rows = [
        makePMRow('PX', true, 'r1'),
        makeFieldRow('LeadSuper', true, 'r2'),
      ];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r1', value: 'Primary', assignedPersonName: 'PE Person', acknowledgedAt: '2026-03-24T10:00:00Z' }),
        createMockResponsibilityAssignment({ rowId: 'r2', value: 'Primary', assignedPersonName: 'Super Person', acknowledgedAt: '2026-03-24T10:00:00Z' }),
      ];
      expect(canSubmitResponsibilityMatrixCertification(rows, assignments)).toBe(true);
    });

    it('returns false when PM category missing Primary', () => {
      const rows = [makePMRow('PX', true, 'r1')];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r1', value: 'Support', assignedPersonName: 'John' }),
      ];
      expect(canSubmitResponsibilityMatrixCertification(rows, assignments)).toBe(false);
    });

    it('returns false when Field category missing Primary', () => {
      const rows = [
        makePMRow('SPM', false, 'r1'),
        makeFieldRow('LeadSuper', true, 'r2'),
      ];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r1', value: 'Primary', assignedPersonName: 'PM Person' }),
      ];
      expect(canSubmitResponsibilityMatrixCertification(rows, assignments)).toBe(false);
    });

    it('returns false when critical Primary not acknowledged', () => {
      const rows = [makePMRow('PX', true, 'r1')];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r1', value: 'Primary', assignedPersonName: 'PE Person', acknowledgedAt: null }),
      ];
      expect(canSubmitResponsibilityMatrixCertification(rows, assignments)).toBe(false);
    });

    it('excludes reminder-only rows from certification gate', () => {
      const rows = [
        { rowId: 'r1', matrixId: 'mtx-001', projectId: 'proj-001', sheet: 'PM' as const,
          taskCategory: 'SPM', taskDescription: 'Monthly reminder', isCriticalCategory: false,
          isCustomRow: false, isReminderOnly: true, sortOrder: 1 },
        makePMRow('PA', false, 'r2'),
      ];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r2', value: 'Primary', assignedPersonName: 'PA Person' }),
      ];
      expect(canSubmitResponsibilityMatrixCertification(rows, assignments)).toBe(true);
    });

    it('excludes custom rows from certification gate', () => {
      const rows = [
        { rowId: 'r1', matrixId: 'mtx-001', projectId: 'proj-001', sheet: 'PM' as const,
          taskCategory: 'Custom', taskDescription: 'Custom task', isCriticalCategory: false,
          isCustomRow: true, isReminderOnly: false, sortOrder: 1 },
        makePMRow('PA', false, 'r2'),
      ];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r2', value: 'Primary', assignedPersonName: 'PA Person' }),
      ];
      expect(canSubmitResponsibilityMatrixCertification(rows, assignments)).toBe(true);
    });

    it('non-critical categories do not need acknowledgment', () => {
      const rows = [makePMRow('SPM', false, 'r1')];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r1', value: 'Primary', assignedPersonName: 'SPM Person', acknowledgedAt: null }),
      ];
      expect(canSubmitResponsibilityMatrixCertification(rows, assignments)).toBe(true);
    });
  });

  // -- Matrix Readiness Computation ------------------------------------------

  describe('computeMatrixReadiness', () => {
    it('counts PM and Field rows with Primary correctly', () => {
      const rows = [
        { rowId: 'r1', matrixId: 'm', projectId: 'p', sheet: 'PM' as const, taskCategory: 'PX', taskDescription: 't', isCriticalCategory: true, isCustomRow: false, isReminderOnly: false, sortOrder: 1 },
        { rowId: 'r2', matrixId: 'm', projectId: 'p', sheet: 'PM' as const, taskCategory: 'SPM', taskDescription: 't', isCriticalCategory: false, isCustomRow: false, isReminderOnly: false, sortOrder: 2 },
        { rowId: 'r3', matrixId: 'm', projectId: 'p', sheet: 'Field' as const, taskCategory: 'LeadSuper', taskDescription: 't', isCriticalCategory: true, isCustomRow: false, isReminderOnly: false, sortOrder: 1 },
      ];
      const assignments = [
        createMockResponsibilityAssignment({ rowId: 'r1', value: 'Primary', assignedPersonName: 'PE', acknowledgedAt: '2026-03-24' }),
        createMockResponsibilityAssignment({ rowId: 'r3', value: 'Primary', assignedPersonName: 'Super', acknowledgedAt: null }),
      ];
      const readiness = computeMatrixReadiness(rows, assignments);
      expect(readiness.pmRowsWithPrimaryCount).toBe(1);
      expect(readiness.fieldRowsWithPrimaryCount).toBe(1);
      expect(readiness.unacknowledgedCriticalCount).toBe(1); // r3 LeadSuper not acked
    });

    it('excludes reminder-only rows from counts', () => {
      const rows = [
        { rowId: 'r1', matrixId: 'm', projectId: 'p', sheet: 'PM' as const, taskCategory: 'SPM', taskDescription: 'reminder', isCriticalCategory: false, isCustomRow: false, isReminderOnly: true, sortOrder: 1 },
      ];
      const readiness = computeMatrixReadiness(rows, []);
      expect(readiness.pmRowsWithPrimaryCount).toBe(0);
    });
  });

  // -- Mock factory -----------------------------------------------------------

  describe('createMockResponsibilityAssignment', () => {
    it('creates a valid default assignment', () => {
      const asgn = createMockResponsibilityAssignment();
      expect(asgn.assignmentId).toBe('asgn-001');
      expect(asgn.roleCode).toBe('PX');
      expect(asgn.value).toBeNull();
      expect(asgn.acknowledgedAt).toBeNull();
    });

    it('accepts overrides', () => {
      const asgn = createMockResponsibilityAssignment({ value: 'Primary', assignedPersonName: 'Test User' });
      expect(asgn.value).toBe('Primary');
      expect(asgn.assignedPersonName).toBe('Test User');
    });
  });
});

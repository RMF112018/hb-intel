import { describe, expect, it } from 'vitest';

import {
  canSetTaskResult,
  canSubmitTaskLibraryCertification,
  computeCompletionPercentage,
  getTaskGatingEffect,
  isImmutableTemplateField,
  isTaskEditableDuringStabilization,
  isTaskOverdue,
  shouldAutoCreateBlocker,
} from '../../index.js';

import { createMockStartupTaskInstance } from '../../../testing/createMockStartupTaskInstance.js';
import { createMockTaskBlocker } from '../../../testing/createMockTaskBlocker.js';

describe('P3-E11-T10 Stage 2 Startup task library business rules', () => {
  // -- Template Immutability (T03 §2) ----------------------------------------

  describe('isImmutableTemplateField', () => {
    it('returns true for taskNumber', () => {
      expect(isImmutableTemplateField('taskNumber')).toBe(true);
    });

    it('returns true for title', () => {
      expect(isImmutableTemplateField('title')).toBe(true);
    });

    it('returns true for sectionCode', () => {
      expect(isImmutableTemplateField('sectionCode')).toBe(true);
    });

    it('returns true for severity', () => {
      expect(isImmutableTemplateField('severity')).toBe(true);
    });

    it('returns false for result (editable)', () => {
      expect(isImmutableTemplateField('result')).toBe(false);
    });

    it('returns false for notes (editable)', () => {
      expect(isImmutableTemplateField('notes')).toBe(false);
    });

    it('returns false for assignedUserId (editable)', () => {
      expect(isImmutableTemplateField('assignedUserId')).toBe(false);
    });
  });

  // -- Dependency Validation (T03 §5) ----------------------------------------

  describe('canSetTaskResult', () => {
    it('allows YES when all dependencies are YES', () => {
      expect(canSetTaskResult('YES', [{ taskNumber: '2.3', result: 'YES' }])).toBe(true);
    });

    it('blocks YES when a dependency is not YES', () => {
      expect(canSetTaskResult('YES', [{ taskNumber: '2.3', result: 'NO' }])).toBe(false);
    });

    it('blocks YES when a dependency is null', () => {
      expect(canSetTaskResult('YES', [{ taskNumber: '2.3', result: null }])).toBe(false);
    });

    it('allows YES when no dependencies', () => {
      expect(canSetTaskResult('YES', [])).toBe(true);
    });

    it('allows NO regardless of dependency state', () => {
      expect(canSetTaskResult('NO', [{ taskNumber: '2.3', result: null }])).toBe(true);
    });

    it('allows NA regardless of dependency state', () => {
      expect(canSetTaskResult('NA', [{ taskNumber: '2.3', result: 'NO' }])).toBe(true);
    });

    it('blocks YES when one of multiple dependencies unsatisfied', () => {
      expect(canSetTaskResult('YES', [
        { taskNumber: '2.4', result: 'YES' },
        { taskNumber: '2.6', result: 'NO' },
      ])).toBe(false);
    });

    it('allows YES when all multiple dependencies are YES', () => {
      expect(canSetTaskResult('YES', [
        { taskNumber: '2.4', result: 'YES' },
        { taskNumber: '2.6', result: 'YES' },
      ])).toBe(true);
    });
  });

  // -- Overdue Logic (T03 §6) ------------------------------------------------

  describe('isTaskOverdue', () => {
    const now = new Date('2026-03-24');

    it('returns true when due date passed and result is null', () => {
      expect(isTaskOverdue('2026-03-01', null, now)).toBe(true);
    });

    it('returns true when due date passed and result is NO', () => {
      expect(isTaskOverdue('2026-03-01', 'NO', now)).toBe(true);
    });

    it('returns false when due date passed but result is YES', () => {
      expect(isTaskOverdue('2026-03-01', 'YES', now)).toBe(false);
    });

    it('returns false when due date passed but result is NA', () => {
      expect(isTaskOverdue('2026-03-01', 'NA', now)).toBe(false);
    });

    it('returns false when due date is in the future', () => {
      expect(isTaskOverdue('2026-12-31', null, now)).toBe(false);
    });

    it('returns false when dueDate is null', () => {
      expect(isTaskOverdue(null, null, now)).toBe(false);
    });
  });

  // -- Auto-Blocker Creation (T03 §8.3) --------------------------------------

  describe('shouldAutoCreateBlocker', () => {
    it('returns true for CRITICAL + NO', () => {
      expect(shouldAutoCreateBlocker('CRITICAL', 'NO')).toBe(true);
    });

    it('returns false for HIGH + NO', () => {
      expect(shouldAutoCreateBlocker('HIGH', 'NO')).toBe(false);
    });

    it('returns false for STANDARD + NO', () => {
      expect(shouldAutoCreateBlocker('STANDARD', 'NO')).toBe(false);
    });

    it('returns false for CRITICAL + YES', () => {
      expect(shouldAutoCreateBlocker('CRITICAL', 'YES')).toBe(false);
    });

    it('returns false for CRITICAL + NA', () => {
      expect(shouldAutoCreateBlocker('CRITICAL', 'NA')).toBe(false);
    });

    it('returns false for CRITICAL + null (unreviewed)', () => {
      expect(shouldAutoCreateBlocker('CRITICAL', null)).toBe(false);
    });
  });

  // -- Stabilization Editability (T03 §11) -----------------------------------

  describe('isTaskEditableDuringStabilization', () => {
    it('editable in DRAFT regardless', () => {
      expect(isTaskEditableDuringStabilization(false, 'DRAFT')).toBe(true);
    });

    it('editable in ACTIVE_PLANNING regardless', () => {
      expect(isTaskEditableDuringStabilization(false, 'ACTIVE_PLANNING')).toBe(true);
    });

    it('editable in READINESS_REVIEW regardless', () => {
      expect(isTaskEditableDuringStabilization(false, 'READINESS_REVIEW')).toBe(true);
    });

    it('editable in READY_FOR_MOBILIZATION regardless', () => {
      expect(isTaskEditableDuringStabilization(false, 'READY_FOR_MOBILIZATION')).toBe(true);
    });

    it('activeDuringStabilization=true editable in MOBILIZED', () => {
      expect(isTaskEditableDuringStabilization(true, 'MOBILIZED')).toBe(true);
    });

    it('activeDuringStabilization=false locked in MOBILIZED', () => {
      expect(isTaskEditableDuringStabilization(false, 'MOBILIZED')).toBe(false);
    });

    it('activeDuringStabilization=true editable in STABILIZING', () => {
      expect(isTaskEditableDuringStabilization(true, 'STABILIZING')).toBe(true);
    });

    it('activeDuringStabilization=false locked in STABILIZING', () => {
      expect(isTaskEditableDuringStabilization(false, 'STABILIZING')).toBe(false);
    });

    it('never editable in BASELINE_LOCKED', () => {
      expect(isTaskEditableDuringStabilization(true, 'BASELINE_LOCKED')).toBe(false);
      expect(isTaskEditableDuringStabilization(false, 'BASELINE_LOCKED')).toBe(false);
    });

    it('never editable in ARCHIVED', () => {
      expect(isTaskEditableDuringStabilization(true, 'ARCHIVED')).toBe(false);
    });
  });

  // -- Certification Eligibility (T03 §13) -----------------------------------

  describe('canSubmitTaskLibraryCertification', () => {
    it('returns true when all instances have results', () => {
      const instances = [
        { ...createMockStartupTaskInstance({ result: 'YES' }), instanceId: 'a' },
        { ...createMockStartupTaskInstance({ result: 'NO', severity: 'STANDARD', gatingImpact: 'ADVISORY' }), instanceId: 'b' },
      ];
      expect(canSubmitTaskLibraryCertification(instances, [])).toBe(true);
    });

    it('returns true when unreviewed instance has open blocker', () => {
      const instances = [
        { ...createMockStartupTaskInstance({ result: null, severity: 'HIGH', gatingImpact: 'REQUIRES_BLOCKER_IF_OPEN' }), instanceId: 'a' },
      ];
      const blockers = [
        createMockTaskBlocker({ instanceId: 'a', blockerStatus: 'OPEN', description: 'Waiting on info' }),
      ];
      expect(canSubmitTaskLibraryCertification(instances, blockers)).toBe(true);
    });

    it('returns false when unreviewed instance has no blocker', () => {
      const instances = [
        { ...createMockStartupTaskInstance({ result: null }), instanceId: 'a' },
      ];
      expect(canSubmitTaskLibraryCertification(instances, [])).toBe(false);
    });

    it('returns false when CRITICAL NO has no blocker or waiver', () => {
      const instances = [
        { ...createMockStartupTaskInstance({ result: 'NO', severity: 'CRITICAL', gatingImpact: 'BLOCKS_CERTIFICATION' }), instanceId: 'a' },
      ];
      expect(canSubmitTaskLibraryCertification(instances, [])).toBe(false);
    });

    it('returns true when CRITICAL NO has open blocker with description', () => {
      const instances = [
        { ...createMockStartupTaskInstance({ result: 'NO', severity: 'CRITICAL', gatingImpact: 'BLOCKS_CERTIFICATION' }), instanceId: 'a' },
      ];
      const blockers = [
        createMockTaskBlocker({ instanceId: 'a', description: 'Owner contract pending' }),
      ];
      expect(canSubmitTaskLibraryCertification(instances, blockers)).toBe(true);
    });

    it('returns false when auto-created blocker has empty description', () => {
      const instances = [
        { ...createMockStartupTaskInstance({ result: 'NO', severity: 'CRITICAL', gatingImpact: 'BLOCKS_CERTIFICATION' }), instanceId: 'a' },
      ];
      const blockers = [
        createMockTaskBlocker({ instanceId: 'a', isAutoCreated: true, description: '' }),
      ];
      expect(canSubmitTaskLibraryCertification(instances, blockers)).toBe(false);
    });

    it('returns false when HIGH NO/null has no blocker', () => {
      const instances = [
        { ...createMockStartupTaskInstance({ result: 'NO', severity: 'HIGH', gatingImpact: 'REQUIRES_BLOCKER_IF_OPEN' }), instanceId: 'a' },
      ];
      expect(canSubmitTaskLibraryCertification(instances, [])).toBe(false);
    });
  });

  // -- Completion Percentage (T03 §13.2) -------------------------------------

  describe('computeCompletionPercentage', () => {
    it('returns 100 when all YES', () => {
      expect(computeCompletionPercentage(['YES', 'YES', 'YES'])).toBe(100);
    });

    it('returns 0 when all NO', () => {
      expect(computeCompletionPercentage(['NO', 'NO', 'NO'])).toBe(0);
    });

    it('returns 50 when half YES half NO', () => {
      expect(computeCompletionPercentage(['YES', 'NO'])).toBe(50);
    });

    it('excludes NA from both numerator and denominator', () => {
      expect(computeCompletionPercentage(['YES', 'NA', 'NO'])).toBe(50);
    });

    it('returns 100 when all NA', () => {
      expect(computeCompletionPercentage(['NA', 'NA'])).toBe(100);
    });

    it('null results count as non-YES in denominator', () => {
      expect(computeCompletionPercentage(['YES', null, null])).toBeCloseTo(33.33, 1);
    });

    it('returns 100 for empty array', () => {
      expect(computeCompletionPercentage([])).toBe(100);
    });
  });

  // -- Gating Effect (T03 §4) -----------------------------------------------

  describe('getTaskGatingEffect', () => {
    it('returns no-enforcement for YES result', () => {
      expect(getTaskGatingEffect('CRITICAL', 'BLOCKS_CERTIFICATION', 'YES')).toBe('no-enforcement');
    });

    it('returns no-enforcement for NA result', () => {
      expect(getTaskGatingEffect('HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'NA')).toBe('no-enforcement');
    });

    it('returns blocks-submission for BLOCKS_CERTIFICATION + NO', () => {
      expect(getTaskGatingEffect('CRITICAL', 'BLOCKS_CERTIFICATION', 'NO')).toBe('blocks-submission');
    });

    it('returns blocks-submission for BLOCKS_CERTIFICATION + null', () => {
      expect(getTaskGatingEffect('CRITICAL', 'BLOCKS_CERTIFICATION', null)).toBe('blocks-submission');
    });

    it('returns requires-blocker-for-submission for REQUIRES_BLOCKER_IF_OPEN + NO', () => {
      expect(getTaskGatingEffect('HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'NO')).toBe('requires-blocker-for-submission');
    });

    it('returns advisory-only for ADVISORY + NO', () => {
      expect(getTaskGatingEffect('STANDARD', 'ADVISORY', 'NO')).toBe('advisory-only');
    });

    it('returns advisory-only for ADVISORY + null', () => {
      expect(getTaskGatingEffect('STANDARD', 'ADVISORY', null)).toBe('advisory-only');
    });
  });

  // -- Mock factories --------------------------------------------------------

  describe('createMockStartupTaskInstance', () => {
    it('creates a valid default instance', () => {
      const inst = createMockStartupTaskInstance();
      expect(inst.instanceId).toBe('inst-001');
      expect(inst.result).toBeNull();
      expect(inst.publicationState).toBe('DRAFT');
    });

    it('accepts overrides', () => {
      const inst = createMockStartupTaskInstance({ result: 'YES', taskNumber: '1.1' });
      expect(inst.result).toBe('YES');
      expect(inst.taskNumber).toBe('1.1');
    });
  });

  describe('createMockTaskBlocker', () => {
    it('creates a valid default blocker', () => {
      const blk = createMockTaskBlocker();
      expect(blk.blockerId).toBe('blk-001');
      expect(blk.blockerStatus).toBe('OPEN');
      expect(blk.isAutoCreated).toBe(false);
    });

    it('accepts overrides', () => {
      const blk = createMockTaskBlocker({ blockerStatus: 'RESOLVED', isAutoCreated: true });
      expect(blk.blockerStatus).toBe('RESOLVED');
      expect(blk.isAutoCreated).toBe(true);
    });
  });
});

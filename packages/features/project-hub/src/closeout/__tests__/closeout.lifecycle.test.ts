import { describe, expect, it } from 'vitest';

import {
  canTransitionState,
  getTransitionForStates,
  requiresPEApprovalForTransition,
  isTerminalLifecycleState,
  isNoRollbackState,
  getMilestoneForState,
  isExternalDependency,
  requiresPEApprovalForMilestone,
  evaluateArchiveReadyCriteria,
  areAllArchiveReadyCriteriaMet,
  getWorkQueueTriggersForState,
  CLOSEOUT_LIFECYCLE_STATES,
} from '../../index.js';

import {
  createMockCloseoutMilestoneRecord,
  createMockArchiveReadyContext,
} from '../../../testing/createMockCloseoutMilestone.js';

describe('P3-E10-T04 Closeout lifecycle business rules', () => {
  // -- State Machine (§2) ----------------------------------------------------

  describe('canTransitionState', () => {
    it('allows all 8 valid transitions per §2.2', () => {
      expect(canTransitionState('NOT_STARTED', 'ACTIVATED')).toBe(true);
      expect(canTransitionState('ACTIVATED', 'IN_PROGRESS')).toBe(true);
      expect(canTransitionState('IN_PROGRESS', 'INSPECTIONS_CLEARED')).toBe(true);
      expect(canTransitionState('INSPECTIONS_CLEARED', 'TURNOVER_COMPLETE')).toBe(true);
      expect(canTransitionState('TURNOVER_COMPLETE', 'OWNER_ACCEPTANCE')).toBe(true);
      expect(canTransitionState('OWNER_ACCEPTANCE', 'FINAL_COMPLETION')).toBe(true);
      expect(canTransitionState('FINAL_COMPLETION', 'ARCHIVE_READY')).toBe(true);
      expect(canTransitionState('ARCHIVE_READY', 'ARCHIVED')).toBe(true);
    });

    it('rejects skipping states', () => {
      expect(canTransitionState('NOT_STARTED', 'IN_PROGRESS')).toBe(false);
      expect(canTransitionState('ACTIVATED', 'INSPECTIONS_CLEARED')).toBe(false);
      expect(canTransitionState('IN_PROGRESS', 'OWNER_ACCEPTANCE')).toBe(false);
    });

    it('rejects backward transitions', () => {
      expect(canTransitionState('ARCHIVED', 'ARCHIVE_READY')).toBe(false);
      expect(canTransitionState('IN_PROGRESS', 'ACTIVATED')).toBe(false);
    });

    it('rejects self-transitions', () => {
      for (const state of CLOSEOUT_LIFECYCLE_STATES) {
        expect(canTransitionState(state, state)).toBe(false);
      }
    });
  });

  describe('getTransitionForStates', () => {
    it('returns transition definition for valid pair', () => {
      const t = getTransitionForStates('NOT_STARTED', 'ACTIVATED');
      expect(t).toBeDefined();
      expect(t?.triggerType).toBe('System');
    });

    it('returns undefined for invalid pair', () => {
      expect(getTransitionForStates('NOT_STARTED', 'ARCHIVED')).toBeUndefined();
    });
  });

  describe('requiresPEApprovalForTransition', () => {
    it('TURNOVER_COMPLETE → OWNER_ACCEPTANCE requires PE', () => {
      expect(requiresPEApprovalForTransition('TURNOVER_COMPLETE', 'OWNER_ACCEPTANCE')).toBe(true);
    });

    it('FINAL_COMPLETION → ARCHIVE_READY requires PE', () => {
      expect(requiresPEApprovalForTransition('FINAL_COMPLETION', 'ARCHIVE_READY')).toBe(true);
    });

    it('ARCHIVE_READY → ARCHIVED requires PE', () => {
      expect(requiresPEApprovalForTransition('ARCHIVE_READY', 'ARCHIVED')).toBe(true);
    });

    it('system transitions do not require PE', () => {
      expect(requiresPEApprovalForTransition('NOT_STARTED', 'ACTIVATED')).toBe(false);
      expect(requiresPEApprovalForTransition('ACTIVATED', 'IN_PROGRESS')).toBe(false);
      expect(requiresPEApprovalForTransition('IN_PROGRESS', 'INSPECTIONS_CLEARED')).toBe(false);
    });
  });

  describe('isTerminalLifecycleState', () => {
    it('only ARCHIVED is terminal', () => {
      expect(isTerminalLifecycleState('ARCHIVED')).toBe(true);
    });

    it('all other states are not terminal', () => {
      const nonTerminal = CLOSEOUT_LIFECYCLE_STATES.filter((s) => s !== 'ARCHIVED');
      for (const state of nonTerminal) {
        expect(isTerminalLifecycleState(state)).toBe(false);
      }
    });
  });

  describe('isNoRollbackState', () => {
    it('FINAL_COMPLETION, ARCHIVE_READY, ARCHIVED have no rollback', () => {
      expect(isNoRollbackState('FINAL_COMPLETION')).toBe(true);
      expect(isNoRollbackState('ARCHIVE_READY')).toBe(true);
      expect(isNoRollbackState('ARCHIVED')).toBe(true);
    });

    it('earlier states allow rollback', () => {
      expect(isNoRollbackState('NOT_STARTED')).toBe(false);
      expect(isNoRollbackState('ACTIVATED')).toBe(false);
      expect(isNoRollbackState('IN_PROGRESS')).toBe(false);
      expect(isNoRollbackState('INSPECTIONS_CLEARED')).toBe(false);
      expect(isNoRollbackState('TURNOVER_COMPLETE')).toBe(false);
      expect(isNoRollbackState('OWNER_ACCEPTANCE')).toBe(false);
    });
  });

  // -- Milestone Rules (§4) --------------------------------------------------

  describe('getMilestoneForState', () => {
    it('ACTIVATED has CHECKLIST_ACTIVATED milestone', () => {
      expect(getMilestoneForState('ACTIVATED')).toBe('CHECKLIST_ACTIVATED');
    });

    it('INSPECTIONS_CLEARED has CO_OBTAINED milestone', () => {
      expect(getMilestoneForState('INSPECTIONS_CLEARED')).toBe('CO_OBTAINED');
    });

    it('OWNER_ACCEPTANCE has OWNER_ACCEPTANCE milestone', () => {
      expect(getMilestoneForState('OWNER_ACCEPTANCE')).toBe('OWNER_ACCEPTANCE');
    });

    it('ARCHIVE_READY has ARCHIVE_READY milestone', () => {
      expect(getMilestoneForState('ARCHIVE_READY')).toBe('ARCHIVE_READY');
    });

    it('NOT_STARTED has no milestone', () => {
      expect(getMilestoneForState('NOT_STARTED')).toBeUndefined();
    });
  });

  describe('isExternalDependency', () => {
    it('CO_OBTAINED is external (AHJ)', () => {
      expect(isExternalDependency('CO_OBTAINED')).toBe(true);
    });

    it('OWNER_ACCEPTANCE is external (Owner)', () => {
      expect(isExternalDependency('OWNER_ACCEPTANCE')).toBe(true);
    });

    it('TASKS_COMPLETE is not external', () => {
      expect(isExternalDependency('TASKS_COMPLETE')).toBe(false);
    });

    it('ARCHIVE_READY is not external', () => {
      expect(isExternalDependency('ARCHIVE_READY')).toBe(false);
    });
  });

  describe('requiresPEApprovalForMilestone', () => {
    it('OWNER_ACCEPTANCE requires PE approval', () => {
      expect(requiresPEApprovalForMilestone('OWNER_ACCEPTANCE')).toBe(true);
    });

    it('ARCHIVE_READY requires PE approval', () => {
      expect(requiresPEApprovalForMilestone('ARCHIVE_READY')).toBe(true);
    });

    it('CO_OBTAINED does not require PE approval', () => {
      expect(requiresPEApprovalForMilestone('CO_OBTAINED')).toBe(false);
    });
  });

  // -- Archive-Ready Gate (§4.3) ---------------------------------------------

  describe('evaluateArchiveReadyCriteria', () => {
    it('all pass when context is fully satisfied', () => {
      const context = createMockArchiveReadyContext();
      const results = evaluateArchiveReadyCriteria(context);
      expect(results).toHaveLength(8);
      expect(results.every((r) => r.passed)).toBe(true);
    });

    it('criterion 1 fails when completion < 100 and NA items lack justification', () => {
      const context = createMockArchiveReadyContext({
        completionPercentage: 95,
        allNonYesItemsHaveNaJustification: false,
      });
      const results = evaluateArchiveReadyCriteria(context);
      expect(results[0].passed).toBe(false);
    });

    it('criterion 1 passes when completion < 100 but all NA have justification', () => {
      const context = createMockArchiveReadyContext({
        completionPercentage: 95,
        allNonYesItemsHaveNaJustification: true,
      });
      const results = evaluateArchiveReadyCriteria(context);
      expect(results[0].passed).toBe(true);
    });

    it('criterion 5 fails when scorecards not approved', () => {
      const context = createMockArchiveReadyContext({
        scorecardsCompleteMilestoneApproved: false,
      });
      const results = evaluateArchiveReadyCriteria(context);
      expect(results[4].passed).toBe(false);
    });

    it('criterion 8 fails when financial payment not confirmed', () => {
      const context = createMockArchiveReadyContext({
        financialFinalPaymentConfirmed: false,
      });
      const results = evaluateArchiveReadyCriteria(context);
      expect(results[7].passed).toBe(false);
    });
  });

  describe('areAllArchiveReadyCriteriaMet', () => {
    it('returns true when all criteria pass', () => {
      expect(areAllArchiveReadyCriteriaMet(createMockArchiveReadyContext())).toBe(true);
    });

    it('returns false when any criterion fails', () => {
      expect(areAllArchiveReadyCriteriaMet(createMockArchiveReadyContext({
        item311YesWithDate: false,
      }))).toBe(false);
    });
  });

  // -- Work Queue Triggers (§7) ----------------------------------------------

  describe('getWorkQueueTriggersForState', () => {
    it('IN_PROGRESS has C.O. trigger', () => {
      const triggers = getWorkQueueTriggersForState('IN_PROGRESS');
      expect(triggers.length).toBeGreaterThan(0);
      expect(triggers[0].workQueueItem).toContain('C.O.');
    });

    it('FINAL_COMPLETION has multiple triggers', () => {
      const triggers = getWorkQueueTriggersForState('FINAL_COMPLETION');
      expect(triggers.length).toBeGreaterThanOrEqual(2);
    });

    it('ARCHIVED has no triggers', () => {
      expect(getWorkQueueTriggersForState('ARCHIVED')).toHaveLength(0);
    });

    it('NOT_STARTED has no triggers', () => {
      expect(getWorkQueueTriggersForState('NOT_STARTED')).toHaveLength(0);
    });
  });

  // -- Mock factories --------------------------------------------------------

  describe('createMockCloseoutMilestoneRecord', () => {
    it('creates a valid default milestone record', () => {
      const record = createMockCloseoutMilestoneRecord();
      expect(record.milestoneId).toBeTruthy();
      expect(record.milestoneKey).toBe('CHECKLIST_ACTIVATED');
      expect(record.status).toBe('PENDING');
    });

    it('accepts overrides', () => {
      const record = createMockCloseoutMilestoneRecord({
        milestoneKey: 'CO_OBTAINED',
        status: 'APPROVED',
      });
      expect(record.milestoneKey).toBe('CO_OBTAINED');
      expect(record.status).toBe('APPROVED');
    });
  });

  describe('createMockArchiveReadyContext', () => {
    it('creates a fully passing context by default', () => {
      const ctx = createMockArchiveReadyContext();
      expect(ctx.completionPercentage).toBe(100);
      expect(ctx.financialFinalPaymentConfirmed).toBe(true);
    });
  });
});

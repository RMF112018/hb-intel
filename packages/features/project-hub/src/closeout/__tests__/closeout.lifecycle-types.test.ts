import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_LIFECYCLE_STATES,
  CLOSEOUT_MILESTONE_STATUSES,
  CLOSEOUT_MILESTONE_EVIDENCE_TYPES,
  CLOSEOUT_FULL_MILESTONE_KEYS,
  CLOSEOUT_LIFECYCLE_LAYERS,
  CLOSEOUT_TRANSITION_TRIGGER_TYPES,
  CLOSEOUT_LIFECYCLE_STATE_DEFINITIONS,
  CLOSEOUT_STATE_TRANSITIONS,
  CLOSEOUT_MILESTONE_DEFINITIONS,
  CLOSEOUT_ARCHIVE_READY_CRITERIA,
  CLOSEOUT_PE_APPROVAL_MATRIX,
  CLOSEOUT_WORK_QUEUE_TRIGGERS,
  CLOSEOUT_LIFECYCLE_STATE_LABELS,
  CLOSEOUT_MILESTONE_STATUS_LABELS,
  CLOSEOUT_FULL_MILESTONE_KEY_LABELS,
} from '../../index.js';

describe('P3-E10-T04 Closeout lifecycle contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('CloseoutLifecycleState', () => {
    it('has exactly 9 states per §2.1', () => {
      expect(CLOSEOUT_LIFECYCLE_STATES).toHaveLength(9);
    });

    it('includes all 9 states in correct order', () => {
      expect([...CLOSEOUT_LIFECYCLE_STATES]).toEqual([
        'NOT_STARTED', 'ACTIVATED', 'IN_PROGRESS', 'INSPECTIONS_CLEARED',
        'TURNOVER_COMPLETE', 'OWNER_ACCEPTANCE', 'FINAL_COMPLETION',
        'ARCHIVE_READY', 'ARCHIVED',
      ]);
    });
  });

  describe('CloseoutMilestoneStatus', () => {
    it('has exactly 5 statuses per §4.1', () => {
      expect(CLOSEOUT_MILESTONE_STATUSES).toHaveLength(5);
    });
  });

  describe('CloseoutMilestoneEvidenceType', () => {
    it('has exactly 6 evidence types per §4.1', () => {
      expect(CLOSEOUT_MILESTONE_EVIDENCE_TYPES).toHaveLength(6);
    });
  });

  describe('CloseoutFullMilestoneKey', () => {
    it('has exactly 13 milestone keys per §4.2', () => {
      expect(CLOSEOUT_FULL_MILESTONE_KEYS).toHaveLength(13);
    });

    it('includes all 13 keys', () => {
      expect([...CLOSEOUT_FULL_MILESTONE_KEYS]).toEqual([
        'CHECKLIST_ACTIVATED', 'TASKS_COMPLETE', 'DOCUMENTS_COMPLETE', 'CO_OBTAINED',
        'TURNOVER_COMPLETE', 'OWNER_ACCEPTANCE', 'LIENS_RELEASED', 'FILES_RETURNED',
        'FINAL_COMPLETION', 'SCORECARDS_COMPLETE', 'LESSONS_APPROVED',
        'AUTOPSY_COMPLETE', 'ARCHIVE_READY',
      ]);
    });
  });

  describe('CloseoutLifecycleLayer', () => {
    it('has exactly 2 layers per §1', () => {
      expect(CLOSEOUT_LIFECYCLE_LAYERS).toHaveLength(2);
    });
  });

  describe('CloseoutTransitionTriggerType', () => {
    it('has exactly 3 trigger types', () => {
      expect(CLOSEOUT_TRANSITION_TRIGGER_TYPES).toHaveLength(3);
    });
  });

  // -- State definitions -----------------------------------------------------

  describe('Lifecycle state definitions', () => {
    it('has exactly 9 definitions per §2.1', () => {
      expect(CLOSEOUT_LIFECYCLE_STATE_DEFINITIONS).toHaveLength(9);
    });

    it('each definition has all required fields', () => {
      for (const def of CLOSEOUT_LIFECYCLE_STATE_DEFINITIONS) {
        expect(def.state).toBeTruthy();
        expect(def.code).toBeTruthy();
        expect(def.description).toBeTruthy();
      }
    });
  });

  // -- State transitions -----------------------------------------------------

  describe('State transitions', () => {
    it('has exactly 8 transitions per §2.2', () => {
      expect(CLOSEOUT_STATE_TRANSITIONS).toHaveLength(8);
    });

    it('each transition has all required fields', () => {
      for (const t of CLOSEOUT_STATE_TRANSITIONS) {
        expect(t.from).toBeTruthy();
        expect(t.to).toBeTruthy();
        expect(t.triggerType).toBeTruthy();
        expect(t.triggerCondition).toBeTruthy();
        expect(typeof t.peApprovalRequired).toBe('boolean');
      }
    });

    it('exactly 3 transitions require PE approval', () => {
      const peRequired = CLOSEOUT_STATE_TRANSITIONS.filter((t) => t.peApprovalRequired);
      expect(peRequired).toHaveLength(3);
    });
  });

  // -- Milestone definitions -------------------------------------------------

  describe('Milestone definitions', () => {
    it('has exactly 13 milestones per §4.2', () => {
      expect(CLOSEOUT_MILESTONE_DEFINITIONS).toHaveLength(13);
    });

    it('each milestone has all required fields', () => {
      for (const m of CLOSEOUT_MILESTONE_DEFINITIONS) {
        expect(m.key).toBeTruthy();
        expect(m.label).toBeTruthy();
        expect(m.evidenceType).toBeTruthy();
        expect(typeof m.externalDependency).toBe('boolean');
        expect(typeof m.peApprovalRequired).toBe('boolean');
      }
    });

    it('exactly 2 milestones have external dependencies per §6', () => {
      const external = CLOSEOUT_MILESTONE_DEFINITIONS.filter((m) => m.externalDependency);
      expect(external.map((m) => m.key)).toEqual(['CO_OBTAINED', 'OWNER_ACCEPTANCE']);
    });

    it('exactly 2 milestones require PE approval per §4.2', () => {
      const peRequired = CLOSEOUT_MILESTONE_DEFINITIONS.filter((m) => m.peApprovalRequired);
      expect(peRequired.map((m) => m.key)).toEqual(['OWNER_ACCEPTANCE', 'ARCHIVE_READY']);
    });
  });

  // -- Archive-ready criteria ------------------------------------------------

  describe('Archive-ready criteria', () => {
    it('has exactly 8 criteria per §4.3', () => {
      expect(CLOSEOUT_ARCHIVE_READY_CRITERIA).toHaveLength(8);
    });

    it('criteria are numbered 1-8', () => {
      const numbers = CLOSEOUT_ARCHIVE_READY_CRITERIA.map((c) => c.criterionNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('each criterion has description and check mechanism', () => {
      for (const c of CLOSEOUT_ARCHIVE_READY_CRITERIA) {
        expect(c.description).toBeTruthy();
        expect(c.checkMechanism).toBeTruthy();
      }
    });
  });

  // -- PE approval matrix ----------------------------------------------------

  describe('PE approval matrix', () => {
    it('has exactly 12 rows per §5', () => {
      expect(CLOSEOUT_PE_APPROVAL_MATRIX).toHaveLength(12);
    });

    it('each row has all required fields', () => {
      for (const row of CLOSEOUT_PE_APPROVAL_MATRIX) {
        expect(row.action).toBeTruthy();
        expect(row.pmAuthority).toBeTruthy();
        expect(row.suptAuthority).toBeTruthy();
        expect(row.peAuthority).toBeTruthy();
      }
    });
  });

  // -- Work queue triggers ---------------------------------------------------

  describe('Work queue triggers', () => {
    it('has exactly 8 triggers per §7', () => {
      expect(CLOSEOUT_WORK_QUEUE_TRIGGERS).toHaveLength(8);
    });

    it('each trigger has all required fields', () => {
      for (const t of CLOSEOUT_WORK_QUEUE_TRIGGERS) {
        expect(t.trigger).toBeTruthy();
        expect(t.workQueueItem).toBeTruthy();
        expect(t.assignee).toBeTruthy();
        expect(t.priority).toBeTruthy();
        expect(t.autoCloseWhen).toBeTruthy();
      }
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 9 lifecycle states', () => {
      expect(Object.keys(CLOSEOUT_LIFECYCLE_STATE_LABELS)).toHaveLength(9);
    });

    it('labels all 5 milestone statuses', () => {
      expect(Object.keys(CLOSEOUT_MILESTONE_STATUS_LABELS)).toHaveLength(5);
    });

    it('labels all 13 milestone keys', () => {
      expect(Object.keys(CLOSEOUT_FULL_MILESTONE_KEY_LABELS)).toHaveLength(13);
    });
  });
});

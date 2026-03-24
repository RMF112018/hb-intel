import { describe, expect, it } from 'vitest';

import {
  canStartupSafetyWriteToSafetyModule,
  canSubmitSafetyReadinessCertification,
  computeSafetyReadinessCounts,
  getEscalationLevel,
  isRemediationDocumented,
  isValidRemediationTransition,
  shouldAutoCreateRemediation,
  shouldCreateProgramBlocker,
} from '../../index.js';

import { createMockSafetyReadinessItem } from '../../../testing/createMockSafetyReadinessItem.js';
import { createMockSafetyRemediationRecord } from '../../../testing/createMockSafetyRemediationRecord.js';

describe('P3-E11-T10 Stage 3 Startup safety readiness business rules', () => {
  // -- Remediation State Machine (T07 §5.0) ----------------------------------

  describe('isValidRemediationTransition', () => {
    it('allows PENDING → IN_PROGRESS', () => {
      expect(isValidRemediationTransition('PENDING', 'IN_PROGRESS')).toBe(true);
    });

    it('allows PENDING → ESCALATED', () => {
      expect(isValidRemediationTransition('PENDING', 'ESCALATED')).toBe(true);
    });

    it('allows PENDING → RESOLVED', () => {
      expect(isValidRemediationTransition('PENDING', 'RESOLVED')).toBe(true);
    });

    it('allows IN_PROGRESS → RESOLVED', () => {
      expect(isValidRemediationTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    });

    it('allows IN_PROGRESS → ESCALATED', () => {
      expect(isValidRemediationTransition('IN_PROGRESS', 'ESCALATED')).toBe(true);
    });

    it('allows ESCALATED → IN_PROGRESS', () => {
      expect(isValidRemediationTransition('ESCALATED', 'IN_PROGRESS')).toBe(true);
    });

    it('allows ESCALATED → RESOLVED', () => {
      expect(isValidRemediationTransition('ESCALATED', 'RESOLVED')).toBe(true);
    });

    it('rejects RESOLVED → PENDING', () => {
      expect(isValidRemediationTransition('RESOLVED', 'PENDING')).toBe(false);
    });

    it('rejects RESOLVED → IN_PROGRESS', () => {
      expect(isValidRemediationTransition('RESOLVED', 'IN_PROGRESS')).toBe(false);
    });

    it('rejects RESOLVED → ESCALATED', () => {
      expect(isValidRemediationTransition('RESOLVED', 'ESCALATED')).toBe(false);
    });

    it('rejects same-state PENDING → PENDING', () => {
      expect(isValidRemediationTransition('PENDING', 'PENDING')).toBe(false);
    });
  });

  // -- Auto-Creation (T07 §5.1) ----------------------------------------------

  describe('shouldAutoCreateRemediation', () => {
    it('returns true for Fail', () => {
      expect(shouldAutoCreateRemediation('Fail')).toBe(true);
    });

    it('returns false for Pass', () => {
      expect(shouldAutoCreateRemediation('Pass')).toBe(false);
    });

    it('returns false for NA', () => {
      expect(shouldAutoCreateRemediation('NA')).toBe(false);
    });

    it('returns false for null', () => {
      expect(shouldAutoCreateRemediation(null)).toBe(false);
    });
  });

  // -- Documentation Check (T07 §7) ------------------------------------------

  describe('isRemediationDocumented', () => {
    it('returns true when all 3 fields populated', () => {
      expect(isRemediationDocumented({
        remediationNote: 'Need fall protection installed',
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
      })).toBe(true);
    });

    it('returns false when remediationNote is null', () => {
      expect(isRemediationDocumented({
        remediationNote: null,
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
      })).toBe(false);
    });

    it('returns false when remediationNote is empty', () => {
      expect(isRemediationDocumented({
        remediationNote: '',
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
      })).toBe(false);
    });

    it('returns false when assignedPersonName is null', () => {
      expect(isRemediationDocumented({
        remediationNote: 'Fix needed',
        assignedPersonName: null,
        dueDate: '2026-04-01',
      })).toBe(false);
    });

    it('returns false when dueDate is null', () => {
      expect(isRemediationDocumented({
        remediationNote: 'Fix needed',
        assignedPersonName: 'John Smith',
        dueDate: null,
      })).toBe(false);
    });
  });

  // -- Certification Eligibility (T07 §7) ------------------------------------

  describe('canSubmitSafetyReadinessCertification', () => {
    it('returns true when all items assessed and no Fails', () => {
      const items = [
        { itemId: 'a', result: 'Pass' as const },
        { itemId: 'b', result: 'NA' as const },
      ];
      expect(canSubmitSafetyReadinessCertification(items, [])).toBe(true);
    });

    it('returns false when any item has null result', () => {
      const items = [
        { itemId: 'a', result: 'Pass' as const },
        { itemId: 'b', result: null },
      ];
      expect(canSubmitSafetyReadinessCertification(items, [])).toBe(false);
    });

    it('returns true when Fail item has documented remediation', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      const remediations = [createMockSafetyRemediationRecord({
        itemId: 'a',
        remediationNote: 'Fall protection needed',
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
        remediationStatus: 'PENDING',
        escalationLevel: 'NONE',
        programBlockerRef: null,
      })];
      expect(canSubmitSafetyReadinessCertification(items, remediations)).toBe(true);
    });

    it('returns false when Fail item has no remediation', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      expect(canSubmitSafetyReadinessCertification(items, [])).toBe(false);
    });

    it('returns false when Fail item has undocumented remediation (no note)', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      const remediations = [createMockSafetyRemediationRecord({
        itemId: 'a',
        remediationNote: null,
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
      })];
      expect(canSubmitSafetyReadinessCertification(items, remediations)).toBe(false);
    });

    it('returns false when Fail item has no assignedPersonName', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      const remediations = [createMockSafetyRemediationRecord({
        itemId: 'a',
        remediationNote: 'Fix needed',
        assignedPersonName: null,
        dueDate: '2026-04-01',
      })];
      expect(canSubmitSafetyReadinessCertification(items, remediations)).toBe(false);
    });

    it('returns false when Fail item has no dueDate', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      const remediations = [createMockSafetyRemediationRecord({
        itemId: 'a',
        remediationNote: 'Fix needed',
        assignedPersonName: 'John Smith',
        dueDate: null,
      })];
      expect(canSubmitSafetyReadinessCertification(items, remediations)).toBe(false);
    });

    it('returns false when PX-escalated remediation exists', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      const remediations = [createMockSafetyRemediationRecord({
        itemId: 'a',
        remediationNote: 'Fix needed',
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
        escalationLevel: 'PX',
        remediationStatus: 'ESCALATED',
      })];
      expect(canSubmitSafetyReadinessCertification(items, remediations)).toBe(false);
    });

    it('returns false when program blocker ref exists on unresolved remediation', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      const remediations = [createMockSafetyRemediationRecord({
        itemId: 'a',
        remediationNote: 'Fix needed',
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
        programBlockerRef: 'blk-001',
        remediationStatus: 'PENDING',
        escalationLevel: 'NONE',
      })];
      expect(canSubmitSafetyReadinessCertification(items, remediations)).toBe(false);
    });

    it('allows PX remediation when resolved', () => {
      const items = [{ itemId: 'a', result: 'Fail' as const }];
      const remediations = [createMockSafetyRemediationRecord({
        itemId: 'a',
        remediationNote: 'Fix needed',
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
        escalationLevel: 'PX',
        remediationStatus: 'RESOLVED',
      })];
      expect(canSubmitSafetyReadinessCertification(items, remediations)).toBe(true);
    });
  });

  // -- Escalation Level (T07 §5.2) -------------------------------------------

  describe('getEscalationLevel', () => {
    const now = new Date('2026-03-24T12:00:00Z');

    it('returns NONE when no thresholds breached', () => {
      const rem = createMockSafetyRemediationRecord({
        remediationStatus: 'PENDING',
        assignedPersonName: 'John Smith',
        dueDate: '2026-04-01',
        createdAt: '2026-03-24T00:00:00Z',
      });
      expect(getEscalationLevel(rem, now)).toBe('NONE');
    });

    it('returns PM when unassigned after 2 days', () => {
      const rem = createMockSafetyRemediationRecord({
        remediationStatus: 'PENDING',
        assignedPersonName: null,
        createdAt: '2026-03-21T00:00:00Z',
      });
      expect(getEscalationLevel(rem, now)).toBe('PM');
    });

    it('returns NONE when unassigned but less than 2 days', () => {
      const rem = createMockSafetyRemediationRecord({
        remediationStatus: 'PENDING',
        assignedPersonName: null,
        createdAt: '2026-03-23T00:00:00Z',
      });
      expect(getEscalationLevel(rem, now)).toBe('NONE');
    });

    it('returns PM when overdue', () => {
      const rem = createMockSafetyRemediationRecord({
        remediationStatus: 'IN_PROGRESS',
        assignedPersonName: 'John Smith',
        dueDate: '2026-03-23',
        createdAt: '2026-03-20T00:00:00Z',
      });
      expect(getEscalationLevel(rem, now)).toBe('PM');
    });

    it('returns PX when overdue by 3+ days', () => {
      const rem = createMockSafetyRemediationRecord({
        remediationStatus: 'IN_PROGRESS',
        assignedPersonName: 'John Smith',
        dueDate: '2026-03-20',
        createdAt: '2026-03-15T00:00:00Z',
      });
      expect(getEscalationLevel(rem, now)).toBe('PX');
    });

    it('returns NONE when resolved regardless of overdue', () => {
      const rem = createMockSafetyRemediationRecord({
        remediationStatus: 'RESOLVED',
        assignedPersonName: 'John Smith',
        dueDate: '2026-03-01',
        createdAt: '2026-02-01T00:00:00Z',
      });
      expect(getEscalationLevel(rem, now)).toBe('NONE');
    });
  });

  // -- Program Blocker Creation (T07 §5.3) -----------------------------------

  describe('shouldCreateProgramBlocker', () => {
    it('returns true for PX escalation', () => {
      expect(shouldCreateProgramBlocker('PX')).toBe(true);
    });

    it('returns false for PM escalation', () => {
      expect(shouldCreateProgramBlocker('PM')).toBe(false);
    });

    it('returns false for NONE', () => {
      expect(shouldCreateProgramBlocker('NONE')).toBe(false);
    });
  });

  // -- Safety Readiness Counts (T07 §3) --------------------------------------

  describe('computeSafetyReadinessCounts', () => {
    it('counts all Pass results', () => {
      const counts = computeSafetyReadinessCounts(['Pass', 'Pass', 'Pass']);
      expect(counts.passCount).toBe(3);
      expect(counts.failCount).toBe(0);
      expect(counts.naCount).toBe(0);
    });

    it('counts mixed results', () => {
      const counts = computeSafetyReadinessCounts(['Pass', 'Fail', 'NA', 'Pass']);
      expect(counts.passCount).toBe(2);
      expect(counts.failCount).toBe(1);
      expect(counts.naCount).toBe(1);
    });

    it('excludes null from all counts', () => {
      const counts = computeSafetyReadinessCounts(['Pass', null, 'Fail']);
      expect(counts.passCount).toBe(1);
      expect(counts.failCount).toBe(1);
      expect(counts.naCount).toBe(0);
    });

    it('handles all null', () => {
      const counts = computeSafetyReadinessCounts([null, null]);
      expect(counts.passCount).toBe(0);
      expect(counts.failCount).toBe(0);
      expect(counts.naCount).toBe(0);
    });

    it('handles empty array', () => {
      const counts = computeSafetyReadinessCounts([]);
      expect(counts.passCount).toBe(0);
      expect(counts.failCount).toBe(0);
      expect(counts.naCount).toBe(0);
    });
  });

  // -- Non-Interference (T07 §2.1) -------------------------------------------

  describe('canStartupSafetyWriteToSafetyModule', () => {
    it('always returns false', () => {
      expect(canStartupSafetyWriteToSafetyModule()).toBe(false);
    });
  });

  // -- Mock factories --------------------------------------------------------

  describe('createMockSafetyReadinessItem', () => {
    it('creates a valid default item', () => {
      const item = createMockSafetyReadinessItem();
      expect(item.itemId).toBe('sri-001');
      expect(item.result).toBeNull();
      expect(item.hasOpenRemediation).toBe(false);
    });

    it('accepts overrides', () => {
      const item = createMockSafetyReadinessItem({ result: 'Pass', itemNumber: '2.5' });
      expect(item.result).toBe('Pass');
      expect(item.itemNumber).toBe('2.5');
    });
  });

  describe('createMockSafetyRemediationRecord', () => {
    it('creates a valid default remediation', () => {
      const rem = createMockSafetyRemediationRecord();
      expect(rem.remediationId).toBe('rem-001');
      expect(rem.remediationStatus).toBe('PENDING');
      expect(rem.escalationLevel).toBe('NONE');
    });

    it('accepts overrides', () => {
      const rem = createMockSafetyRemediationRecord({ remediationStatus: 'RESOLVED', escalationLevel: 'PX' });
      expect(rem.remediationStatus).toBe('RESOLVED');
      expect(rem.escalationLevel).toBe('PX');
    });
  });
});

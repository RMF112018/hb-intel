import { describe, expect, it } from 'vitest';

import {
  calculateDaysOpen,
  isConstraintOverdue,
  generateConstraintNumber,
  validateConstraintRecordImmutability,
  isTerminalConstraintStatus,
  isValidConstraintTransition,
  transitionConstraintStatus,
  CONSTRAINT_STATUSES,
  TERMINAL_CONSTRAINT_STATUSES,
} from '../../index.js';

import { createMockConstraintRecord } from '../../../testing/createMockConstraintRecord.js';

describe('P3-E6-T02 Constraint Ledger business rules', () => {
  // ── calculateDaysOpen ───────────────────────────────────────────────

  describe('calculateDaysOpen', () => {
    it('returns 0 for same day', () => {
      expect(calculateDaysOpen('2026-03-15', '2026-03-15')).toBe(0);
    });

    it('returns 30 for 30 days apart', () => {
      expect(calculateDaysOpen('2026-02-01', '2026-03-03')).toBe(30);
    });

    it('returns 1 for one day apart', () => {
      expect(calculateDaysOpen('2026-03-14', '2026-03-15')).toBe(1);
    });

    it('returns 0 when today is before dateIdentified', () => {
      expect(calculateDaysOpen('2026-03-15', '2026-03-10')).toBe(0);
    });
  });

  // ── isTerminalConstraintStatus ──────────────────────────────────────

  describe('isTerminalConstraintStatus', () => {
    it('returns true for Resolved', () => {
      expect(isTerminalConstraintStatus('Resolved')).toBe(true);
    });

    it('returns true for Void', () => {
      expect(isTerminalConstraintStatus('Void')).toBe(true);
    });

    it('returns true for Cancelled', () => {
      expect(isTerminalConstraintStatus('Cancelled')).toBe(true);
    });

    it('returns true for Superseded', () => {
      expect(isTerminalConstraintStatus('Superseded')).toBe(true);
    });

    it('returns false for non-terminal statuses', () => {
      const nonTerminal = CONSTRAINT_STATUSES.filter(
        (s) => !(TERMINAL_CONSTRAINT_STATUSES as readonly string[]).includes(s),
      );
      for (const status of nonTerminal) {
        expect(isTerminalConstraintStatus(status)).toBe(false);
      }
    });
  });

  // ── isValidConstraintTransition ─────────────────────────────────────

  describe('isValidConstraintTransition', () => {
    it('allows Identified → UnderAction', () => {
      expect(isValidConstraintTransition('Identified', 'UnderAction')).toBe(true);
    });

    it('allows Identified → Void', () => {
      expect(isValidConstraintTransition('Identified', 'Void')).toBe(true);
    });

    it('rejects Identified → Resolved', () => {
      expect(isValidConstraintTransition('Identified', 'Resolved')).toBe(false);
    });

    it('allows Pending → UnderAction (bidirectional)', () => {
      expect(isValidConstraintTransition('Pending', 'UnderAction')).toBe(true);
    });

    it('allows UnderAction → Resolved', () => {
      expect(isValidConstraintTransition('UnderAction', 'Resolved')).toBe(true);
    });

    it('rejects Resolved → any', () => {
      for (const status of CONSTRAINT_STATUSES) {
        expect(isValidConstraintTransition('Resolved', status)).toBe(false);
      }
    });
  });

  // ── transitionConstraintStatus ──────────────────────────────────────

  describe('transitionConstraintStatus', () => {
    const ctx = { actor: 'user-001', timestamp: '2026-03-15T10:00:00Z' };

    it('accepts valid non-terminal transition', () => {
      const record = createMockConstraintRecord({ status: 'Identified' });
      const result = transitionConstraintStatus(record, 'UnderAction', ctx);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('accepts Resolved with dateClosed and closureDocumentUri', () => {
      const record = createMockConstraintRecord({ status: 'UnderAction' });
      const result = transitionConstraintStatus(record, 'Resolved', {
        ...ctx,
        dateClosed: '2026-03-15',
        closureDocumentUri: 'https://docs.example.com/closure.pdf',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('rejects Resolved without dateClosed', () => {
      const record = createMockConstraintRecord({ status: 'UnderAction' });
      const result = transitionConstraintStatus(record, 'Resolved', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('dateClosed')]),
      );
    });

    it('warns when Resolved without closureDocumentUri', () => {
      const record = createMockConstraintRecord({ status: 'UnderAction' });
      const result = transitionConstraintStatus(record, 'Resolved', {
        ...ctx,
        dateClosed: '2026-03-15',
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('closureDocumentUri')]),
      );
    });

    it('rejects Void without closureReason', () => {
      const record = createMockConstraintRecord({ status: 'Identified' });
      const result = transitionConstraintStatus(record, 'Void', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('closureReason')]),
      );
    });

    it('rejects Superseded without successorConstraintId', () => {
      const record = createMockConstraintRecord({ status: 'Identified' });
      // Note: Identified → Superseded is not a valid transition anyway,
      // but test the successorConstraintId requirement on its own
      const result = transitionConstraintStatus(record, 'Superseded', {
        ...ctx,
        closureReason: 'Replaced by CON-012',
      });
      // Invalid transition AND missing successor
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('successorConstraintId')]),
      );
    });

    it('rejects transition from terminal status', () => {
      const record = createMockConstraintRecord({ status: 'Resolved' });
      const result = transitionConstraintStatus(record, 'Identified', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('terminal status')]),
      );
    });
  });

  // ── isConstraintOverdue (C-05) ──────────────────────────────────────

  describe('isConstraintOverdue', () => {
    it('returns true for open constraint past due date', () => {
      expect(
        isConstraintOverdue({ dueDate: '2026-01-01', status: 'Identified' }, '2026-03-15'),
      ).toBe(true);
    });

    it('returns false for open constraint before due date', () => {
      expect(
        isConstraintOverdue({ dueDate: '2026-06-01', status: 'UnderAction' }, '2026-03-15'),
      ).toBe(false);
    });

    it('returns false for resolved constraint past due date', () => {
      expect(
        isConstraintOverdue({ dueDate: '2026-01-01', status: 'Resolved' }, '2026-03-15'),
      ).toBe(false);
    });

    it('returns false for void constraint past due date', () => {
      expect(
        isConstraintOverdue({ dueDate: '2026-01-01', status: 'Void' }, '2026-03-15'),
      ).toBe(false);
    });

    it('returns false for superseded constraint past due date', () => {
      expect(
        isConstraintOverdue({ dueDate: '2026-01-01', status: 'Superseded' }, '2026-03-15'),
      ).toBe(false);
    });
  });

  // ── generateConstraintNumber ────────────────────────────────────────

  describe('generateConstraintNumber', () => {
    it('pads single digit to 3', () => {
      expect(generateConstraintNumber(1)).toBe('CON-001');
    });

    it('pads double digit to 3', () => {
      expect(generateConstraintNumber(42)).toBe('CON-042');
    });

    it('preserves triple digit', () => {
      expect(generateConstraintNumber(999)).toBe('CON-999');
    });

    it('handles numbers larger than 999', () => {
      expect(generateConstraintNumber(1234)).toBe('CON-1234');
    });
  });

  // ── validateConstraintRecordImmutability (C-01) ─────────────────────

  describe('validateConstraintRecordImmutability', () => {
    const original = createMockConstraintRecord();

    it('accepts changes to mutable fields', () => {
      const result = validateConstraintRecordImmutability(original, {
        title: 'Updated constraint title',
        priority: 1,
        owner: 'user-003',
      });
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('rejects changes to constraintId', () => {
      const result = validateConstraintRecordImmutability(original, { constraintId: 'different-id' });
      expect(result.valid).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([expect.stringContaining('constraintId')]),
      );
    });

    it('rejects changes to category', () => {
      const result = validateConstraintRecordImmutability(original, { category: 'SAFETY' });
      expect(result.valid).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([expect.stringContaining('category')]),
      );
    });

    it('rejects changes to parentRiskId', () => {
      const result = validateConstraintRecordImmutability(original, { parentRiskId: 'risk-999' });
      expect(result.valid).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([expect.stringContaining('parentRiskId')]),
      );
    });

    it('rejects changes to multiple immutable fields', () => {
      const result = validateConstraintRecordImmutability(original, {
        constraintId: 'different',
        projectId: 'different-proj',
        category: 'SAFETY',
      });
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(3);
    });

    it('accepts same value for immutable field (no actual change)', () => {
      const result = validateConstraintRecordImmutability(original, {
        constraintId: original.constraintId,
      });
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });
});

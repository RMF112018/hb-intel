import { describe, expect, it } from 'vitest';

import {
  generateChangeEventNumber,
  calculateTotalCostFromLineItems,
  validateChangeEventRecordImmutability,
  isTerminalChangeEventStatus,
  isValidChangeEventTransition,
  transitionChangeEventStatus,
  CHANGE_EVENT_STATUSES,
  TERMINAL_CHANGE_EVENT_STATUSES,
} from '../../index.js';

import { createMockChangeEventRecord } from '../../../testing/createMockChangeEventRecord.js';
import { createMockChangeLineItem } from '../../../testing/createMockChangeLineItem.js';

describe('P3-E6-T04 Change Ledger business rules', () => {
  // ── generateChangeEventNumber ───────────────────────────────────────

  describe('generateChangeEventNumber', () => {
    it('pads single digit to 3', () => {
      expect(generateChangeEventNumber(1)).toBe('CE-001');
    });

    it('pads double digit to 3', () => {
      expect(generateChangeEventNumber(42)).toBe('CE-042');
    });

    it('preserves triple digit', () => {
      expect(generateChangeEventNumber(999)).toBe('CE-999');
    });
  });

  // ── calculateTotalCostFromLineItems (CE-04) ─────────────────────────

  describe('calculateTotalCostFromLineItems', () => {
    it('sums line item totalCost values', () => {
      const items = [
        createMockChangeLineItem({ totalCost: 30000 }),
        createMockChangeLineItem({ lineItemId: 'li-002', totalCost: 20000 }),
        createMockChangeLineItem({ lineItemId: 'li-003', totalCost: 15000 }),
      ];
      expect(calculateTotalCostFromLineItems(items)).toBe(65000);
    });

    it('returns 0 for empty line items', () => {
      expect(calculateTotalCostFromLineItems([])).toBe(0);
    });

    it('handles negative values (credits)', () => {
      const items = [
        createMockChangeLineItem({ totalCost: 30000 }),
        createMockChangeLineItem({ lineItemId: 'li-002', totalCost: -5000 }),
      ];
      expect(calculateTotalCostFromLineItems(items)).toBe(25000);
    });
  });

  // ── isTerminalChangeEventStatus ─────────────────────────────────────

  describe('isTerminalChangeEventStatus', () => {
    it('returns true for terminal statuses', () => {
      for (const s of TERMINAL_CHANGE_EVENT_STATUSES) {
        expect(isTerminalChangeEventStatus(s)).toBe(true);
      }
    });

    it('returns false for non-terminal statuses', () => {
      const nonTerminal = CHANGE_EVENT_STATUSES.filter(
        (s) => !(TERMINAL_CHANGE_EVENT_STATUSES as readonly string[]).includes(s),
      );
      for (const s of nonTerminal) {
        expect(isTerminalChangeEventStatus(s)).toBe(false);
      }
    });
  });

  // ── isValidChangeEventTransition ────────────────────────────────────

  describe('isValidChangeEventTransition', () => {
    it('allows Identified → UnderAnalysis', () => {
      expect(isValidChangeEventTransition('Identified', 'UnderAnalysis')).toBe(true);
    });

    it('allows PendingApproval → Approved', () => {
      expect(isValidChangeEventTransition('PendingApproval', 'Approved')).toBe(true);
    });

    it('allows Rejected → UnderAnalysis (resubmission)', () => {
      expect(isValidChangeEventTransition('Rejected', 'UnderAnalysis')).toBe(true);
    });

    it('rejects Identified → Approved (must go through PendingApproval)', () => {
      expect(isValidChangeEventTransition('Identified', 'Approved')).toBe(false);
    });

    it('rejects Closed → any', () => {
      for (const s of CHANGE_EVENT_STATUSES) {
        expect(isValidChangeEventTransition('Closed', s)).toBe(false);
      }
    });
  });

  // ── transitionChangeEventStatus ─────────────────────────────────────

  describe('transitionChangeEventStatus', () => {
    const ctx = { actor: 'user-001', timestamp: '2026-03-15T10:00:00Z' };

    it('accepts valid non-gated transition', () => {
      const record = createMockChangeEventRecord({ status: 'Identified' });
      const result = transitionChangeEventStatus(record, 'UnderAnalysis', ctx);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects Approved without approvedDate (CE-03)', () => {
      const record = createMockChangeEventRecord({ status: 'PendingApproval', totalCostImpact: 50000 });
      const result = transitionChangeEventStatus(record, 'Approved', {
        ...ctx,
        approvedBy: 'user-exec',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('approvedDate')]),
      );
    });

    it('rejects Approved without approvedBy (CE-03)', () => {
      const record = createMockChangeEventRecord({ status: 'PendingApproval', totalCostImpact: 50000 });
      const result = transitionChangeEventStatus(record, 'Approved', {
        ...ctx,
        approvedDate: '2026-03-15',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('approvedBy')]),
      );
    });

    it('accepts Approved with all CE-03 requirements', () => {
      const record = createMockChangeEventRecord({ status: 'PendingApproval', totalCostImpact: 50000 });
      const result = transitionChangeEventStatus(record, 'Approved', {
        ...ctx,
        approvedDate: '2026-03-15',
        approvedBy: 'user-exec',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects Superseded without successorChangeEventId', () => {
      const record = createMockChangeEventRecord({ status: 'Identified' });
      const result = transitionChangeEventStatus(record, 'Superseded', {
        ...ctx,
        closureReason: 'Replaced by CE-012',
      });
      // Invalid transition AND missing successor
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('successorChangeEventId')]),
      );
    });

    it('rejects Void without closureReason', () => {
      const record = createMockChangeEventRecord({ status: 'Identified' });
      const result = transitionChangeEventStatus(record, 'Void', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('closureReason')]),
      );
    });

    it('rejects transition from terminal status', () => {
      const record = createMockChangeEventRecord({ status: 'Closed' });
      const result = transitionChangeEventStatus(record, 'Identified', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('terminal status')]),
      );
    });
  });

  // ── validateChangeEventRecordImmutability (CE-01) ───────────────────

  describe('validateChangeEventRecordImmutability', () => {
    const original = createMockChangeEventRecord();

    it('accepts changes to mutable fields', () => {
      const result = validateChangeEventRecordImmutability(original, {
        title: 'Updated title',
        totalCostImpact: 100000,
      });
      expect(result.valid).toBe(true);
    });

    it('rejects changes to changeEventId', () => {
      const result = validateChangeEventRecordImmutability(original, { changeEventId: 'different' });
      expect(result.valid).toBe(false);
    });

    it('rejects changes to origin', () => {
      const result = validateChangeEventRecordImmutability(original, { origin: 'OWNER_DIRECTIVE' });
      expect(result.valid).toBe(false);
    });

    it('rejects changes to changeEventNumber', () => {
      const result = validateChangeEventRecordImmutability(original, { changeEventNumber: 'CE-999' });
      expect(result.valid).toBe(false);
    });

    it('accepts same value for immutable field', () => {
      const result = validateChangeEventRecordImmutability(original, { changeEventId: original.changeEventId });
      expect(result.valid).toBe(true);
    });
  });
});

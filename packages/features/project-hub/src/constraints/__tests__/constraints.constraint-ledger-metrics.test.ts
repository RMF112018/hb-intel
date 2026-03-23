import { describe, expect, it } from 'vitest';

import {
  calculateOpenConstraintCount,
  calculateOverdueConstraintCount,
  calculateCriticalConstraintCount,
  calculateConstraintCountByCategory,
  calculateAvgDaysOpen,
  calculateMaxDaysOpen,
} from '../../index.js';

import { createMockConstraintRecord } from '../../../testing/createMockConstraintRecord.js';

const openConstraints = [
  createMockConstraintRecord({ constraintId: 'c1', status: 'Identified', priority: 2, category: 'DESIGN', dateIdentified: '2026-02-01', dueDate: '2026-06-01' }),
  createMockConstraintRecord({ constraintId: 'c2', status: 'UnderAction', priority: 1, category: 'SAFETY', dateIdentified: '2026-03-01', dueDate: '2026-01-01' }),
  createMockConstraintRecord({ constraintId: 'c3', status: 'Pending', priority: 3, category: 'DESIGN', dateIdentified: '2026-01-01', dueDate: '2026-06-01' }),
  createMockConstraintRecord({ constraintId: 'c4', status: 'Identified', priority: 1, category: 'PROCUREMENT', dateIdentified: '2026-02-15', dueDate: '2026-02-28' }),
];

const closedConstraints = [
  createMockConstraintRecord({ constraintId: 'c5', status: 'Resolved', priority: 1, category: 'LABOR', dueDate: '2025-01-01' }),
  createMockConstraintRecord({ constraintId: 'c6', status: 'Void', priority: 2, category: 'SCHEDULE', dueDate: '2025-01-01' }),
  createMockConstraintRecord({ constraintId: 'c7', status: 'Cancelled', priority: 3, category: 'COST', dueDate: '2025-01-01' }),
  createMockConstraintRecord({ constraintId: 'c8', status: 'Superseded', priority: 4, category: 'OTHER', dueDate: '2025-01-01' }),
];

const allConstraints = [...openConstraints, ...closedConstraints];

describe('P3-E6-T02 Constraint Ledger health spine metrics', () => {
  describe('calculateOpenConstraintCount', () => {
    it('counts only non-terminal constraints', () => {
      expect(calculateOpenConstraintCount(allConstraints)).toBe(4);
    });

    it('returns 0 for all-closed list', () => {
      expect(calculateOpenConstraintCount(closedConstraints)).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateOpenConstraintCount([])).toBe(0);
    });
  });

  describe('calculateOverdueConstraintCount', () => {
    it('counts open constraints past due date', () => {
      // c2 (dueDate 2026-01-01) and c4 (dueDate 2026-02-28) are overdue at 2026-03-15
      expect(calculateOverdueConstraintCount(allConstraints, '2026-03-15')).toBe(2);
    });

    it('excludes closed constraints even if past due', () => {
      expect(calculateOverdueConstraintCount(closedConstraints, '2026-03-15')).toBe(0);
    });

    it('returns 0 when no constraints are overdue', () => {
      expect(calculateOverdueConstraintCount(allConstraints, '2025-01-01')).toBe(0);
    });
  });

  describe('calculateCriticalConstraintCount', () => {
    it('counts open constraints with priority 1 (Critical)', () => {
      // c2 (priority 1, UnderAction) and c4 (priority 1, Identified)
      expect(calculateCriticalConstraintCount(allConstraints)).toBe(2);
    });

    it('excludes closed critical constraints', () => {
      expect(calculateCriticalConstraintCount(closedConstraints)).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateCriticalConstraintCount([])).toBe(0);
    });
  });

  describe('calculateConstraintCountByCategory', () => {
    it('groups open constraints by category', () => {
      const counts = calculateConstraintCountByCategory(allConstraints);
      expect(counts).toEqual({
        DESIGN: 2,
        SAFETY: 1,
        PROCUREMENT: 1,
      });
    });

    it('excludes closed constraints', () => {
      const counts = calculateConstraintCountByCategory(closedConstraints);
      expect(counts).toEqual({});
    });

    it('returns empty object for empty list', () => {
      expect(calculateConstraintCountByCategory([])).toEqual({});
    });
  });

  describe('calculateAvgDaysOpen', () => {
    it('calculates mean daysOpen for open constraints', () => {
      // At 2026-03-23:
      // c1: 2026-02-01 → 50 days
      // c2: 2026-03-01 → 22 days
      // c3: 2026-01-01 → 81 days
      // c4: 2026-02-15 → 36 days
      // Mean = (50 + 22 + 81 + 36) / 4 = 47.25
      const avg = calculateAvgDaysOpen(allConstraints, '2026-03-23');
      expect(avg).toBeCloseTo(47.25, 1);
    });

    it('returns 0 for all-closed list', () => {
      expect(calculateAvgDaysOpen(closedConstraints, '2026-03-15')).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateAvgDaysOpen([], '2026-03-15')).toBe(0);
    });
  });

  describe('calculateMaxDaysOpen', () => {
    it('returns maximum daysOpen for open constraints', () => {
      // c3: 2026-01-01 → 81 days at 2026-03-23 (longest open)
      const max = calculateMaxDaysOpen(allConstraints, '2026-03-23');
      expect(max).toBe(81);
    });

    it('returns 0 for all-closed list', () => {
      expect(calculateMaxDaysOpen(closedConstraints, '2026-03-15')).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateMaxDaysOpen([], '2026-03-15')).toBe(0);
    });
  });
});

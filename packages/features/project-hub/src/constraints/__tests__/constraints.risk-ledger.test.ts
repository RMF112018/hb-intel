import { describe, expect, it } from 'vitest';

import {
  calculateRiskScore,
  isRiskOverdue,
  generateRiskNumber,
  validateRiskRecordImmutability,
  isTerminalRiskStatus,
  isValidRiskTransition,
  transitionRiskStatus,
  RISK_STATUSES,
  TERMINAL_RISK_STATUSES,
} from '../../index.js';

import { createMockRiskRecord } from '../../../testing/createMockRiskRecord.js';

describe('P3-E6-T01 Risk Ledger business rules', () => {
  // ── calculateRiskScore (R-04) ───────────────────────────────────────

  describe('calculateRiskScore', () => {
    it('returns 1 for minimum values (1 × 1)', () => {
      expect(calculateRiskScore(1, 1)).toBe(1);
    });

    it('returns 25 for maximum values (5 × 5)', () => {
      expect(calculateRiskScore(5, 5)).toBe(25);
    });

    it('returns 12 for (3 × 4)', () => {
      expect(calculateRiskScore(3, 4)).toBe(12);
    });

    it('returns 10 for (2 × 5)', () => {
      expect(calculateRiskScore(2, 5)).toBe(10);
    });
  });

  // ── isTerminalRiskStatus ────────────────────────────────────────────

  describe('isTerminalRiskStatus', () => {
    it('returns true for Closed', () => {
      expect(isTerminalRiskStatus('Closed')).toBe(true);
    });

    it('returns true for Void', () => {
      expect(isTerminalRiskStatus('Void')).toBe(true);
    });

    it('returns true for Cancelled', () => {
      expect(isTerminalRiskStatus('Cancelled')).toBe(true);
    });

    it('returns false for non-terminal statuses', () => {
      const nonTerminal = RISK_STATUSES.filter(
        (s) => !(TERMINAL_RISK_STATUSES as readonly string[]).includes(s),
      );
      for (const status of nonTerminal) {
        expect(isTerminalRiskStatus(status)).toBe(false);
      }
    });
  });

  // ── isValidRiskTransition ───────────────────────────────────────────

  describe('isValidRiskTransition', () => {
    it('allows Identified → UnderAssessment', () => {
      expect(isValidRiskTransition('Identified', 'UnderAssessment')).toBe(true);
    });

    it('allows Identified → Void', () => {
      expect(isValidRiskTransition('Identified', 'Void')).toBe(true);
    });

    it('rejects Identified → Closed', () => {
      expect(isValidRiskTransition('Identified', 'Closed')).toBe(false);
    });

    it('allows UnderAssessment → MaterializationPending', () => {
      expect(isValidRiskTransition('UnderAssessment', 'MaterializationPending')).toBe(true);
    });

    it('allows MaterializationPending → Closed', () => {
      expect(isValidRiskTransition('MaterializationPending', 'Closed')).toBe(true);
    });

    it('rejects Closed → any', () => {
      for (const status of RISK_STATUSES) {
        expect(isValidRiskTransition('Closed', status)).toBe(false);
      }
    });
  });

  // ── transitionRiskStatus ────────────────────────────────────────────

  describe('transitionRiskStatus', () => {
    const ctx = { actor: 'user-001', timestamp: '2026-03-15T10:00:00Z' };

    it('accepts valid non-terminal transition', () => {
      const record = createMockRiskRecord({ status: 'Identified' });
      const result = transitionRiskStatus(record, 'UnderAssessment', ctx);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts valid terminal transition with closureReason', () => {
      const record = createMockRiskRecord({ status: 'MaterializationPending' });
      const result = transitionRiskStatus(record, 'Closed', {
        ...ctx,
        closureReason: 'Constraint resolved the issue.',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects terminal transition without closureReason', () => {
      const record = createMockRiskRecord({ status: 'Identified' });
      const result = transitionRiskStatus(record, 'Void', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('closureReason')]),
      );
    });

    it('rejects invalid transition', () => {
      const record = createMockRiskRecord({ status: 'Identified' });
      const result = transitionRiskStatus(record, 'Closed', {
        ...ctx,
        closureReason: 'Attempt to skip states.',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid transition')]),
      );
    });

    it('rejects transition from terminal status', () => {
      const record = createMockRiskRecord({ status: 'Closed' });
      const result = transitionRiskStatus(record, 'Identified', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('terminal status')]),
      );
    });
  });

  // ── isRiskOverdue ───────────────────────────────────────────────────

  describe('isRiskOverdue', () => {
    it('returns true for open risk past target date', () => {
      expect(
        isRiskOverdue({ targetMitigationDate: '2026-01-01', status: 'Identified' }, '2026-03-15'),
      ).toBe(true);
    });

    it('returns false for open risk before target date', () => {
      expect(
        isRiskOverdue({ targetMitigationDate: '2026-06-01', status: 'Identified' }, '2026-03-15'),
      ).toBe(false);
    });

    it('returns false for closed risk past target date', () => {
      expect(
        isRiskOverdue({ targetMitigationDate: '2026-01-01', status: 'Closed' }, '2026-03-15'),
      ).toBe(false);
    });

    it('returns false for void risk past target date', () => {
      expect(
        isRiskOverdue({ targetMitigationDate: '2026-01-01', status: 'Void' }, '2026-03-15'),
      ).toBe(false);
    });
  });

  // ── generateRiskNumber ──────────────────────────────────────────────

  describe('generateRiskNumber', () => {
    it('pads single digit to 3', () => {
      expect(generateRiskNumber(1)).toBe('RISK-001');
    });

    it('pads double digit to 3', () => {
      expect(generateRiskNumber(42)).toBe('RISK-042');
    });

    it('preserves triple digit', () => {
      expect(generateRiskNumber(999)).toBe('RISK-999');
    });

    it('handles numbers larger than 999', () => {
      expect(generateRiskNumber(1234)).toBe('RISK-1234');
    });
  });

  // ── validateRiskRecordImmutability (R-01) ───────────────────────────

  describe('validateRiskRecordImmutability', () => {
    const original = createMockRiskRecord();

    it('accepts changes to mutable fields', () => {
      const result = validateRiskRecordImmutability(original, {
        title: 'Updated title for this risk',
        probability: 4,
        owner: 'user-003',
      });
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('rejects changes to riskId', () => {
      const result = validateRiskRecordImmutability(original, { riskId: 'different-id' });
      expect(result.valid).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([expect.stringContaining('riskId')]),
      );
    });

    it('rejects changes to category', () => {
      const result = validateRiskRecordImmutability(original, { category: 'FINANCIAL' });
      expect(result.valid).toBe(false);
      expect(result.violations).toEqual(
        expect.arrayContaining([expect.stringContaining('category')]),
      );
    });

    it('rejects changes to multiple immutable fields', () => {
      const result = validateRiskRecordImmutability(original, {
        riskId: 'different',
        projectId: 'different-proj',
        category: 'FINANCIAL',
      });
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(3);
    });

    it('accepts same value for immutable field (no actual change)', () => {
      const result = validateRiskRecordImmutability(original, { riskId: original.riskId });
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });
});

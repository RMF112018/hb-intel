import { describe, expect, it } from 'vitest';

import {
  evaluateReadiness,
  canExceptBlocker,
  isExceptionValid,
  isOverrideComplete,
  getRequiredAcknowledgersForOverride,
  shouldAutoLapseException,
  shouldAutoLapseOverride,
  isHardBlockerActive,
} from '../../index.js';

import type { IOverrideSignature } from '../../index.js';

const mockSig: IOverrideSignature = {
  userId: 'user-001',
  userName: 'Test',
  role: 'SafetyManager',
  acknowledgedAt: '2026-03-24T10:00:00Z',
  comments: null,
};

describe('P3-E8-T08 Readiness business rules', () => {
  // =========================================================================
  // Readiness Decision (§9)
  // =========================================================================

  describe('evaluateReadiness', () => {
    it('HARD blockers → NOT_READY', () => {
      expect(evaluateReadiness(1, 0)).toBe('NOT_READY');
    });

    it('HARD + SOFT blockers → NOT_READY', () => {
      expect(evaluateReadiness(2, 3)).toBe('NOT_READY');
    });

    it('SOFT only → READY_WITH_EXCEPTION', () => {
      expect(evaluateReadiness(0, 2)).toBe('READY_WITH_EXCEPTION');
    });

    it('no blockers → READY', () => {
      expect(evaluateReadiness(0, 0)).toBe('READY');
    });
  });

  // =========================================================================
  // Blocker Exception (§7)
  // =========================================================================

  describe('canExceptBlocker', () => {
    it('SOFT + excepable → true', () => { expect(canExceptBlocker('SOFT', true)).toBe(true); });
    it('HARD + excepable → false', () => { expect(canExceptBlocker('HARD', true)).toBe(false); });
    it('SOFT + not excepable → false', () => { expect(canExceptBlocker('SOFT', false)).toBe(false); });
    it('HARD + not excepable → false', () => { expect(canExceptBlocker('HARD', false)).toBe(false); });
  });

  describe('isExceptionValid', () => {
    it('20+ characters → valid', () => {
      expect(isExceptionValid('This is a valid rationale text.')).toBe(true);
    });

    it('exactly 20 characters → valid', () => {
      expect(isExceptionValid('12345678901234567890')).toBe(true);
    });

    it('19 characters → invalid', () => {
      expect(isExceptionValid('1234567890123456789')).toBe(false);
    });

    it('empty → invalid', () => {
      expect(isExceptionValid('')).toBe(false);
    });

    it('whitespace-only → invalid', () => {
      expect(isExceptionValid('   ')).toBe(false);
    });
  });

  // =========================================================================
  // Override Governance (§8)
  // =========================================================================

  describe('isOverrideComplete', () => {
    it('PROJECT: SM + PM signed → complete', () => {
      expect(isOverrideComplete(
        { safetyManagerAcknowledgment: mockSig, pmAcknowledgment: mockSig, superintendentAcknowledgment: null },
        'PROJECT',
      )).toBe(true);
    });

    it('PROJECT: SM only → incomplete', () => {
      expect(isOverrideComplete(
        { safetyManagerAcknowledgment: mockSig, pmAcknowledgment: null, superintendentAcknowledgment: null },
        'PROJECT',
      )).toBe(false);
    });

    it('ACTIVITY: all 3 signed → complete', () => {
      expect(isOverrideComplete(
        { safetyManagerAcknowledgment: mockSig, pmAcknowledgment: mockSig, superintendentAcknowledgment: mockSig },
        'ACTIVITY',
      )).toBe(true);
    });

    it('ACTIVITY: SM + PM only → incomplete (needs Superintendent)', () => {
      expect(isOverrideComplete(
        { safetyManagerAcknowledgment: mockSig, pmAcknowledgment: mockSig, superintendentAcknowledgment: null },
        'ACTIVITY',
      )).toBe(false);
    });

    it('SUBCONTRACTOR: SM + PM signed → complete', () => {
      expect(isOverrideComplete(
        { safetyManagerAcknowledgment: mockSig, pmAcknowledgment: mockSig, superintendentAcknowledgment: null },
        'SUBCONTRACTOR',
      )).toBe(true);
    });
  });

  describe('getRequiredAcknowledgersForOverride', () => {
    it('PROJECT → 2 roles', () => { expect(getRequiredAcknowledgersForOverride('PROJECT')).toHaveLength(2); });
    it('ACTIVITY → 3 roles', () => { expect(getRequiredAcknowledgersForOverride('ACTIVITY')).toHaveLength(3); });
  });

  // =========================================================================
  // Auto-Lapse (§7, §8)
  // =========================================================================

  describe('shouldAutoLapseException', () => {
    it('past expiration → lapse', () => {
      expect(shouldAutoLapseException('2026-03-20T00:00:00Z', '2026-03-24T00:00:00Z')).toBe(true);
    });

    it('future expiration → no lapse', () => {
      expect(shouldAutoLapseException('2026-04-01T00:00:00Z', '2026-03-24T00:00:00Z')).toBe(false);
    });

    it('null expiration → no lapse', () => {
      expect(shouldAutoLapseException(null, '2026-03-24T00:00:00Z')).toBe(false);
    });
  });

  describe('shouldAutoLapseOverride', () => {
    it('past expiration → lapse', () => {
      expect(shouldAutoLapseOverride('2026-03-20T00:00:00Z', '2026-03-24T00:00:00Z')).toBe(true);
    });

    it('future expiration → no lapse', () => {
      expect(shouldAutoLapseOverride('2026-04-01T00:00:00Z', '2026-03-24T00:00:00Z')).toBe(false);
    });

    it('null expiration → no lapse', () => {
      expect(shouldAutoLapseOverride(null, '2026-03-24T00:00:00Z')).toBe(false);
    });
  });

  // =========================================================================
  // Blocker Helpers
  // =========================================================================

  describe('isHardBlockerActive', () => {
    it('has HARD blocker → true', () => {
      expect(isHardBlockerActive([
        { blockerId: 'BLK-1', blockerType: 'HARD', description: 'test', isExcepted: false },
      ])).toBe(true);
    });

    it('HARD blocker excepted → false', () => {
      expect(isHardBlockerActive([
        { blockerId: 'BLK-1', blockerType: 'HARD', description: 'test', isExcepted: true },
      ])).toBe(false);
    });

    it('only SOFT → false', () => {
      expect(isHardBlockerActive([
        { blockerId: 'BLK-1', blockerType: 'SOFT', description: 'test', isExcepted: false },
      ])).toBe(false);
    });

    it('empty → false', () => {
      expect(isHardBlockerActive([])).toBe(false);
    });
  });
});

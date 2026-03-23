import { describe, expect, it } from 'vitest';

import {
  calculateOpenRiskCount,
  calculateHighRiskCount,
  calculateOverdueRiskCount,
  calculateRiskCountByCategory,
  calculateMaterializationRate,
} from '../../index.js';

import { createMockRiskRecord } from '../../../testing/createMockRiskRecord.js';

const openRisks = [
  createMockRiskRecord({ riskId: 'r1', status: 'Identified', riskScore: 12, category: 'SITE_CONDITIONS', targetMitigationDate: '2026-06-01' }),
  createMockRiskRecord({ riskId: 'r2', status: 'UnderAssessment', riskScore: 20, category: 'FINANCIAL', targetMitigationDate: '2026-01-01' }),
  createMockRiskRecord({ riskId: 'r3', status: 'Mitigated', riskScore: 6, category: 'SITE_CONDITIONS', targetMitigationDate: '2026-06-01' }),
  createMockRiskRecord({ riskId: 'r4', status: 'Accepted', riskScore: 15, category: 'SCHEDULE', targetMitigationDate: '2026-06-01' }),
  createMockRiskRecord({ riskId: 'r5', status: 'MaterializationPending', riskScore: 25, category: 'FINANCIAL', statusDate: '2026-03-10', targetMitigationDate: '2026-02-01' }),
];

const closedRisks = [
  createMockRiskRecord({ riskId: 'r6', status: 'Closed', riskScore: 20, category: 'PROCUREMENT', targetMitigationDate: '2025-01-01' }),
  createMockRiskRecord({ riskId: 'r7', status: 'Void', riskScore: 10, category: 'LABOR', targetMitigationDate: '2025-01-01' }),
  createMockRiskRecord({ riskId: 'r8', status: 'Cancelled', riskScore: 16, category: 'SCOPE', targetMitigationDate: '2025-01-01' }),
];

const allRisks = [...openRisks, ...closedRisks];

describe('P3-E6-T01 Risk Ledger health spine metrics', () => {
  describe('calculateOpenRiskCount', () => {
    it('counts only non-terminal risks', () => {
      expect(calculateOpenRiskCount(allRisks)).toBe(5);
    });

    it('returns 0 for all-closed list', () => {
      expect(calculateOpenRiskCount(closedRisks)).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateOpenRiskCount([])).toBe(0);
    });
  });

  describe('calculateHighRiskCount', () => {
    it('counts open risks with score >= default threshold (15)', () => {
      // r2 (20), r4 (15), r5 (25) are open and >= 15
      expect(calculateHighRiskCount(allRisks)).toBe(3);
    });

    it('uses custom threshold when provided', () => {
      // r2 (20), r5 (25) are open and >= 20
      expect(calculateHighRiskCount(allRisks, 20)).toBe(2);
    });

    it('excludes closed risks even with high scores', () => {
      // r6 (20, Closed) should not count
      expect(calculateHighRiskCount(closedRisks, 10)).toBe(0);
    });
  });

  describe('calculateOverdueRiskCount', () => {
    it('counts open risks past target mitigation date', () => {
      // r2 (targetMitigationDate 2026-01-01) and r5 (2026-02-01) are overdue at 2026-03-15
      expect(calculateOverdueRiskCount(allRisks, '2026-03-15')).toBe(2);
    });

    it('excludes closed risks even if past date', () => {
      expect(calculateOverdueRiskCount(closedRisks, '2026-03-15')).toBe(0);
    });

    it('returns 0 when no risks are overdue', () => {
      expect(calculateOverdueRiskCount(allRisks, '2025-01-01')).toBe(0);
    });
  });

  describe('calculateRiskCountByCategory', () => {
    it('groups open risks by category', () => {
      const counts = calculateRiskCountByCategory(allRisks);
      expect(counts).toEqual({
        SITE_CONDITIONS: 2,
        FINANCIAL: 2,
        SCHEDULE: 1,
      });
    });

    it('excludes closed risks', () => {
      const counts = calculateRiskCountByCategory(closedRisks);
      expect(counts).toEqual({});
    });

    it('returns empty object for empty list', () => {
      expect(calculateRiskCountByCategory([])).toEqual({});
    });
  });

  describe('calculateMaterializationRate', () => {
    it('counts risks that moved to MaterializationPending within period', () => {
      // r5 has statusDate 2026-03-10 and status MaterializationPending
      expect(calculateMaterializationRate(allRisks, '2026-03-01', '2026-03-31')).toBe(1);
    });

    it('returns 0 when no materializations in period', () => {
      expect(calculateMaterializationRate(allRisks, '2026-01-01', '2026-02-28')).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateMaterializationRate([], '2026-01-01', '2026-12-31')).toBe(0);
    });
  });
});

import { describe, expect, it } from 'vitest';

import {
  calculateOpenChangeEventCount,
  calculatePendingApprovalCount,
  calculateTotalPendingCostImpact,
  calculateTotalApprovedCostImpact,
  calculateChangeEventCountByOrigin,
} from '../../index.js';

import { createMockChangeEventRecord } from '../../../testing/createMockChangeEventRecord.js';

const openEvents = [
  createMockChangeEventRecord({ changeEventId: 'e1', status: 'Identified', origin: 'SITE_CONDITION', totalCostImpact: 0 }),
  createMockChangeEventRecord({ changeEventId: 'e2', status: 'UnderAnalysis', origin: 'DESIGN_CHANGE', totalCostImpact: 50000 }),
  createMockChangeEventRecord({ changeEventId: 'e3', status: 'PendingApproval', origin: 'SITE_CONDITION', totalCostImpact: 82000 }),
  createMockChangeEventRecord({ changeEventId: 'e4', status: 'PendingApproval', origin: 'OWNER_DIRECTIVE', totalCostImpact: 25000 }),
  createMockChangeEventRecord({ changeEventId: 'e5', status: 'Approved', origin: 'REGULATORY', totalCostImpact: 45000, approvedDate: '2026-03-10', approvedBy: 'user-exec' }),
  createMockChangeEventRecord({ changeEventId: 'e6', status: 'Rejected', origin: 'VALUE_ENGINEERING', totalCostImpact: -30000 }),
];

const closedEvents = [
  createMockChangeEventRecord({ changeEventId: 'e7', status: 'Closed', origin: 'SITE_CONDITION', totalCostImpact: 60000 }),
  createMockChangeEventRecord({ changeEventId: 'e8', status: 'Void', origin: 'OTHER', totalCostImpact: 0 }),
  createMockChangeEventRecord({ changeEventId: 'e9', status: 'Cancelled', origin: 'OWNER_DIRECTIVE', totalCostImpact: 10000 }),
  createMockChangeEventRecord({ changeEventId: 'e10', status: 'Superseded', origin: 'DESIGN_CHANGE', totalCostImpact: 40000 }),
];

const allEvents = [...openEvents, ...closedEvents];

describe('P3-E6-T04 Change Ledger health spine metrics', () => {
  describe('calculateOpenChangeEventCount', () => {
    it('counts only non-terminal events', () => {
      expect(calculateOpenChangeEventCount(allEvents)).toBe(6);
    });

    it('returns 0 for all-closed list', () => {
      expect(calculateOpenChangeEventCount(closedEvents)).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateOpenChangeEventCount([])).toBe(0);
    });
  });

  describe('calculatePendingApprovalCount', () => {
    it('counts PendingApproval events', () => {
      // e3 and e4
      expect(calculatePendingApprovalCount(allEvents)).toBe(2);
    });

    it('returns 0 when none pending', () => {
      expect(calculatePendingApprovalCount(closedEvents)).toBe(0);
    });
  });

  describe('calculateTotalPendingCostImpact', () => {
    it('sums totalCostImpact for PendingApproval events', () => {
      // e3 (82000) + e4 (25000) = 107000
      expect(calculateTotalPendingCostImpact(allEvents)).toBe(107000);
    });

    it('returns 0 when none pending', () => {
      expect(calculateTotalPendingCostImpact(closedEvents)).toBe(0);
    });
  });

  describe('calculateTotalApprovedCostImpact', () => {
    it('sums totalCostImpact for Approved and Closed events', () => {
      // e5 (45000, Approved) + e7 (60000, Closed) = 105000
      expect(calculateTotalApprovedCostImpact(allEvents)).toBe(105000);
    });

    it('returns 0 for empty list', () => {
      expect(calculateTotalApprovedCostImpact([])).toBe(0);
    });
  });

  describe('calculateChangeEventCountByOrigin', () => {
    it('groups open events by origin', () => {
      const counts = calculateChangeEventCountByOrigin(allEvents);
      expect(counts).toEqual({
        SITE_CONDITION: 2,
        DESIGN_CHANGE: 1,
        OWNER_DIRECTIVE: 1,
        REGULATORY: 1,
        VALUE_ENGINEERING: 1,
      });
    });

    it('excludes closed events', () => {
      expect(calculateChangeEventCountByOrigin(closedEvents)).toEqual({});
    });
  });
});

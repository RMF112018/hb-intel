import { describe, expect, it } from 'vitest';

import {
  calculateOpenDelayCount,
  calculateCriticalPathDelayCount,
  calculateTotalQuantifiedDelayDays,
  calculatePendingNotificationCount,
  calculateDelayCountByEventType,
} from '../../index.js';

import { createMockDelayRecord } from '../../../testing/createMockDelayRecord.js';
import { createMockTimeImpactRecord } from '../../../testing/createMockTimeImpactRecord.js';
import { createMockCommercialImpactRecord } from '../../../testing/createMockCommercialImpactRecord.js';

const openDelays = [
  createMockDelayRecord({ delayId: 'd1', status: 'Identified', criticalPathImpact: 'UNKNOWN', delayEventType: 'PROCUREMENT', delayStartDate: '2026-03-01', notificationDate: null }),
  createMockDelayRecord({ delayId: 'd2', status: 'UnderAnalysis', criticalPathImpact: 'CRITICAL', delayEventType: 'OWNER_DIRECTED', delayStartDate: '2026-01-01', notificationDate: null }),
  createMockDelayRecord({ delayId: 'd3', status: 'Quantified', criticalPathImpact: 'CRITICAL', delayEventType: 'PROCUREMENT', delayStartDate: '2026-02-01', notificationDate: '2026-02-05', timeImpact: createMockTimeImpactRecord({ estimatedCalendarDays: 14 }), commercialImpact: createMockCommercialImpactRecord() }),
  createMockDelayRecord({ delayId: 'd4', status: 'Dispositioned', criticalPathImpact: 'NON_CRITICAL', delayEventType: 'WEATHER_EXCEEDANCE', delayStartDate: '2026-02-01', notificationDate: '2026-02-10', timeImpact: createMockTimeImpactRecord({ estimatedCalendarDays: 7 }), commercialImpact: createMockCommercialImpactRecord(), dispositionOutcome: 'SettledByTime', dispositionNotes: 'Settled.' }),
];

const closedDelays = [
  createMockDelayRecord({ delayId: 'd5', status: 'Closed', criticalPathImpact: 'CRITICAL', delayEventType: 'DESIGN_CHANGE', timeImpact: createMockTimeImpactRecord({ estimatedCalendarDays: 21 }), commercialImpact: createMockCommercialImpactRecord() }),
  createMockDelayRecord({ delayId: 'd6', status: 'Void', delayEventType: 'OTHER' }),
  createMockDelayRecord({ delayId: 'd7', status: 'Cancelled', delayEventType: 'LABOR' }),
];

const allDelays = [...openDelays, ...closedDelays];

describe('P3-E6-T03 Delay Ledger health spine metrics', () => {
  describe('calculateOpenDelayCount', () => {
    it('counts only non-terminal delays', () => {
      expect(calculateOpenDelayCount(allDelays)).toBe(4);
    });

    it('returns 0 for all-closed list', () => {
      expect(calculateOpenDelayCount(closedDelays)).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateOpenDelayCount([])).toBe(0);
    });
  });

  describe('calculateCriticalPathDelayCount', () => {
    it('counts open delays with CRITICAL criticalPathImpact', () => {
      // d2 (UnderAnalysis, CRITICAL) and d3 (Quantified, CRITICAL)
      expect(calculateCriticalPathDelayCount(allDelays)).toBe(2);
    });

    it('excludes closed critical delays', () => {
      expect(calculateCriticalPathDelayCount(closedDelays)).toBe(0);
    });
  });

  describe('calculateTotalQuantifiedDelayDays', () => {
    it('sums estimatedCalendarDays for Quantified+ delays', () => {
      // d3 (Quantified, 14) + d4 (Dispositioned, 7) + d5 (Closed, 21) = 42
      expect(calculateTotalQuantifiedDelayDays(allDelays)).toBe(42);
    });

    it('returns 0 for delays without timeImpact', () => {
      const noImpact = [createMockDelayRecord({ status: 'Quantified', timeImpact: null })];
      expect(calculateTotalQuantifiedDelayDays(noImpact)).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculateTotalQuantifiedDelayDays([])).toBe(0);
    });
  });

  describe('calculatePendingNotificationCount', () => {
    it('counts open delays without notification past threshold', () => {
      // d2 has delayStartDate 2026-01-01, no notification — 83 days at 2026-03-25 > 7 day threshold
      // d1 has delayStartDate 2026-03-01 — 24 days at 2026-03-25 > 7 day threshold
      expect(calculatePendingNotificationCount(allDelays, '2026-03-25', 7)).toBe(2);
    });

    it('excludes delays with notification set', () => {
      // d3 and d4 have notificationDate set
      const withNotification = [openDelays[2], openDelays[3]];
      expect(calculatePendingNotificationCount(withNotification, '2026-03-25', 7)).toBe(0);
    });

    it('returns 0 for empty list', () => {
      expect(calculatePendingNotificationCount([], '2026-03-25')).toBe(0);
    });
  });

  describe('calculateDelayCountByEventType', () => {
    it('groups open delays by event type', () => {
      const counts = calculateDelayCountByEventType(allDelays);
      expect(counts).toEqual({
        PROCUREMENT: 2,
        OWNER_DIRECTED: 1,
        WEATHER_EXCEEDANCE: 1,
      });
    });

    it('excludes closed delays', () => {
      const counts = calculateDelayCountByEventType(closedDelays);
      expect(counts).toEqual({});
    });
  });
});

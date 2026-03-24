import { describe, expect, it } from 'vitest';

import {
  OBLIGATION_STATUSES,
  OBLIGATION_CATEGORIES,
  OBLIGATION_TRIGGER_BASES,
  MONITORING_PRIORITIES,
  CONTRACT_TYPES,
  STARTUP_DELIVERY_METHODS,
  STAGE5_ACTIVITY_EVENTS,
  STAGE5_HEALTH_METRICS,
  STAGE5_WORK_QUEUE_ITEMS,
  TERMINAL_OBLIGATION_STATUSES,
  OBLIGATION_STATE_TRANSITIONS,
  OBLIGATION_CATEGORY_DEFINITIONS,
  MONITORING_TRIGGER_RULES,
  MONITORING_PRIORITY_LEAD_DAYS,
  STAGE5_ACTIVITY_EVENT_DEFINITIONS,
  STAGE5_HEALTH_METRIC_DEFINITIONS,
  STAGE5_WORK_QUEUE_ITEM_DEFINITIONS,
  OBLIGATION_STATUS_LABELS,
  OBLIGATION_CATEGORY_LABELS,
  OBLIGATION_TRIGGER_BASIS_LABELS,
  MONITORING_PRIORITY_LABELS,
} from '../../index.js';

describe('P3-E11-T10 Stage 5 Startup contract obligations contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('ObligationStatus', () => {
    it('has exactly 5 statuses per T04 §4', () => {
      expect(OBLIGATION_STATUSES).toHaveLength(5);
    });
  });

  describe('ObligationCategory', () => {
    it('has exactly 12 categories per T04 §5', () => {
      expect(OBLIGATION_CATEGORIES).toHaveLength(12);
    });
  });

  describe('ObligationTriggerBasis', () => {
    it('has exactly 10 trigger bases per T04 §3.1', () => {
      expect(OBLIGATION_TRIGGER_BASES).toHaveLength(10);
    });
  });

  describe('MonitoringPriority', () => {
    it('has exactly 3 priorities per T04 §6.2', () => {
      expect(MONITORING_PRIORITIES).toHaveLength(3);
    });
  });

  describe('ContractType', () => {
    it('has exactly 9 contract types per T04 §9', () => {
      expect(CONTRACT_TYPES).toHaveLength(9);
    });
  });

  describe('DeliveryMethod', () => {
    it('has exactly 8 delivery methods per T04 §9', () => {
      expect(STARTUP_DELIVERY_METHODS).toHaveLength(8);
    });
  });

  describe('Stage5ActivityEvent', () => {
    it('has exactly 2 events per T10 §2 Stage 5', () => {
      expect(STAGE5_ACTIVITY_EVENTS).toHaveLength(2);
    });
  });

  describe('Stage5HealthMetric', () => {
    it('has exactly 2 metrics per T10 §2 Stage 5', () => {
      expect(STAGE5_HEALTH_METRICS).toHaveLength(2);
    });
  });

  describe('Stage5WorkQueueItem', () => {
    it('has exactly 3 work queue items per T10 §2 Stage 5', () => {
      expect(STAGE5_WORK_QUEUE_ITEMS).toHaveLength(3);
    });
  });

  // -- Terminal statuses -----------------------------------------------------

  describe('Terminal obligation statuses', () => {
    it('has exactly 3 terminal statuses', () => {
      expect(TERMINAL_OBLIGATION_STATUSES).toHaveLength(3);
    });

    it('includes SATISFIED, WAIVED, NOT_APPLICABLE', () => {
      expect(TERMINAL_OBLIGATION_STATUSES).toContain('SATISFIED');
      expect(TERMINAL_OBLIGATION_STATUSES).toContain('WAIVED');
      expect(TERMINAL_OBLIGATION_STATUSES).toContain('NOT_APPLICABLE');
    });
  });

  // -- State transitions -----------------------------------------------------

  describe('Obligation state transitions', () => {
    it('has exactly 9 valid transitions per T04 §4', () => {
      expect(OBLIGATION_STATE_TRANSITIONS).toHaveLength(9);
    });

    it('each transition has from, to, guard, and requiresPX', () => {
      for (const t of OBLIGATION_STATE_TRANSITIONS) {
        expect(t.from).toBeTruthy();
        expect(t.to).toBeTruthy();
        expect(t.guard).toBeTruthy();
        expect(typeof t.requiresPX).toBe('boolean');
      }
    });

    it('WAIVED transitions require PX', () => {
      const waivedTransitions = OBLIGATION_STATE_TRANSITIONS.filter((t) => t.to === 'WAIVED');
      expect(waivedTransitions.length).toBeGreaterThan(0);
      for (const t of waivedTransitions) {
        expect(t.requiresPX).toBe(true);
      }
    });

    it('terminal→OPEN reopens require PX', () => {
      const reopens = OBLIGATION_STATE_TRANSITIONS.filter(
        (t) => ['SATISFIED', 'NOT_APPLICABLE', 'WAIVED'].includes(t.from) && t.to === 'OPEN',
      );
      expect(reopens.length).toBe(3);
      for (const t of reopens) {
        expect(t.requiresPX).toBe(true);
      }
    });

    it('OPEN → IN_PROGRESS does not require PX', () => {
      const t = OBLIGATION_STATE_TRANSITIONS.find((tr) => tr.from === 'OPEN' && tr.to === 'IN_PROGRESS');
      expect(t?.requiresPX).toBe(false);
    });
  });

  // -- Category definitions --------------------------------------------------

  describe('Obligation category definitions', () => {
    it('has exactly 12 definitions per T04 §5', () => {
      expect(OBLIGATION_CATEGORY_DEFINITIONS).toHaveLength(12);
    });

    it('LIQUIDATED_DAMAGES auto-flags for monitoring', () => {
      const ld = OBLIGATION_CATEGORY_DEFINITIONS.find((c) => c.category === 'LIQUIDATED_DAMAGES');
      expect(ld?.autoFlagForMonitoring).toBe(true);
    });

    it('no other category auto-flags', () => {
      const autoFlagged = OBLIGATION_CATEGORY_DEFINITIONS.filter((c) => c.autoFlagForMonitoring);
      expect(autoFlagged).toHaveLength(1);
    });
  });

  // -- Monitoring rules ------------------------------------------------------

  describe('Monitoring trigger rules', () => {
    it('has exactly 5 rules per T04 §6.1', () => {
      expect(MONITORING_TRIGGER_RULES).toHaveLength(5);
    });
  });

  describe('Monitoring priority lead days', () => {
    it('has exactly 3 entries per T04 §6.2', () => {
      expect(MONITORING_PRIORITY_LEAD_DAYS).toHaveLength(3);
    });

    it('HIGH = 21 days', () => {
      const high = MONITORING_PRIORITY_LEAD_DAYS.find((p) => p.priority === 'HIGH');
      expect(high?.leadDays).toBe(21);
    });

    it('MEDIUM = 14 days', () => {
      const med = MONITORING_PRIORITY_LEAD_DAYS.find((p) => p.priority === 'MEDIUM');
      expect(med?.leadDays).toBe(14);
    });

    it('LOW = 7 days', () => {
      const low = MONITORING_PRIORITY_LEAD_DAYS.find((p) => p.priority === 'LOW');
      expect(low?.leadDays).toBe(7);
    });
  });

  // -- Spine publication definitions -----------------------------------------

  describe('Stage 5 spine publication', () => {
    it('has 2 activity event definitions', () => {
      expect(STAGE5_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(2);
    });

    it('has 2 health metric definitions', () => {
      expect(STAGE5_HEALTH_METRIC_DEFINITIONS).toHaveLength(2);
    });

    it('has 3 work queue item definitions', () => {
      expect(STAGE5_WORK_QUEUE_ITEM_DEFINITIONS).toHaveLength(3);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 5 statuses', () => {
      expect(Object.keys(OBLIGATION_STATUS_LABELS)).toHaveLength(5);
    });

    it('labels all 12 categories', () => {
      expect(Object.keys(OBLIGATION_CATEGORY_LABELS)).toHaveLength(12);
    });

    it('labels all 10 trigger bases', () => {
      expect(Object.keys(OBLIGATION_TRIGGER_BASIS_LABELS)).toHaveLength(10);
    });

    it('labels all 3 priorities', () => {
      expect(Object.keys(MONITORING_PRIORITY_LABELS)).toHaveLength(3);
    });
  });
});

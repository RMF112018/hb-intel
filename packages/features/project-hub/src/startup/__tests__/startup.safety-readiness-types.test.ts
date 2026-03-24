import { describe, expect, it } from 'vitest';

import {
  SAFETY_READINESS_SECTION_TITLES,
  SAFETY_READINESS_RESULTS,
  REMEDIATION_STATUSES,
  ESCALATION_LEVELS,
  STAGE3_ACTIVITY_EVENTS,
  STAGE3_HEALTH_METRICS,
  STAGE3_WORK_QUEUE_ITEMS,
  SAFETY_READINESS_SECTIONS,
  SAFETY_SECTION_1_ITEMS,
  SAFETY_SECTION_2_ITEMS,
  SAFETY_ALL_ITEM_TEMPLATES,
  REMEDIATION_STATE_TRANSITIONS,
  ESCALATION_THRESHOLDS,
  SAFETY_IMMUTABLE_ITEM_FIELDS,
  STAGE3_ACTIVITY_EVENT_DEFINITIONS,
  STAGE3_HEALTH_METRIC_DEFINITIONS,
  STAGE3_WORK_QUEUE_ITEM_DEFINITIONS,
  SAFETY_READINESS_SECTION_TITLE_LABELS,
  SAFETY_READINESS_RESULT_LABELS,
  REMEDIATION_STATUS_LABELS,
  ESCALATION_LEVEL_LABELS,
} from '../../index.js';

describe('P3-E11-T10 Stage 3 Startup safety readiness contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('SafetyReadinessSectionTitle', () => {
    it('has exactly 2 section titles per T07 §3', () => {
      expect(SAFETY_READINESS_SECTION_TITLES).toHaveLength(2);
    });
  });

  describe('SafetyReadinessResult', () => {
    it('has exactly 3 result values per T07 §4', () => {
      expect(SAFETY_READINESS_RESULTS).toHaveLength(3);
    });
  });

  describe('RemediationStatus', () => {
    it('has exactly 4 statuses per T07 §5', () => {
      expect(REMEDIATION_STATUSES).toHaveLength(4);
    });
  });

  describe('EscalationLevel', () => {
    it('has exactly 3 levels per T07 §5.2', () => {
      expect(ESCALATION_LEVELS).toHaveLength(3);
    });
  });

  describe('Stage3ActivityEvent', () => {
    it('has exactly 4 events per T10 §2 Stage 3', () => {
      expect(STAGE3_ACTIVITY_EVENTS).toHaveLength(4);
    });
  });

  describe('Stage3HealthMetric', () => {
    it('has exactly 2 metrics per T10 §2 Stage 3', () => {
      expect(STAGE3_HEALTH_METRICS).toHaveLength(2);
    });
  });

  describe('Stage3WorkQueueItem', () => {
    it('has exactly 4 work queue items', () => {
      expect(STAGE3_WORK_QUEUE_ITEMS).toHaveLength(4);
    });
  });

  // -- Section definitions ---------------------------------------------------

  describe('Section definitions', () => {
    it('has exactly 2 sections', () => {
      expect(SAFETY_READINESS_SECTIONS).toHaveLength(2);
    });

    it('Section 1 has 4 items', () => {
      const s1 = SAFETY_READINESS_SECTIONS.find((s) => s.sectionNumber === 1);
      expect(s1?.itemCount).toBe(4);
    });

    it('Section 2 has 28 items', () => {
      const s2 = SAFETY_READINESS_SECTIONS.find((s) => s.sectionNumber === 2);
      expect(s2?.itemCount).toBe(28);
    });

    it('total across sections is 32', () => {
      const total = SAFETY_READINESS_SECTIONS.reduce((sum, s) => sum + s.itemCount, 0);
      expect(total).toBe(32);
    });
  });

  // -- Item template catalog -------------------------------------------------

  describe('Item template catalog', () => {
    it('Section 1 has exactly 4 items', () => {
      expect(SAFETY_SECTION_1_ITEMS).toHaveLength(4);
    });

    it('Section 2 has exactly 28 items', () => {
      expect(SAFETY_SECTION_2_ITEMS).toHaveLength(28);
    });

    it('combined catalog has exactly 32 items', () => {
      expect(SAFETY_ALL_ITEM_TEMPLATES).toHaveLength(32);
    });

    it('every item has required fields', () => {
      for (const item of SAFETY_ALL_ITEM_TEMPLATES) {
        expect(item.itemNumber).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.sectionTitle).toBeTruthy();
      }
    });

    it('item numbers are unique across the catalog', () => {
      const numbers = SAFETY_ALL_ITEM_TEMPLATES.map((i) => i.itemNumber);
      expect(new Set(numbers).size).toBe(32);
    });

    it('all Section 1 items have sectionTitle = AreasOfHighestRisk', () => {
      for (const item of SAFETY_SECTION_1_ITEMS) {
        expect(item.sectionTitle).toBe('AreasOfHighestRisk');
      }
    });

    it('all Section 2 items have sectionTitle = OtherRisks', () => {
      for (const item of SAFETY_SECTION_2_ITEMS) {
        expect(item.sectionTitle).toBe('OtherRisks');
      }
    });

    it('Section 1 starts with 1.1', () => {
      expect(SAFETY_SECTION_1_ITEMS[0].itemNumber).toBe('1.1');
    });

    it('Section 2 starts with 2.1', () => {
      expect(SAFETY_SECTION_2_ITEMS[0].itemNumber).toBe('2.1');
    });

    it('Section 2 ends with 2.28', () => {
      expect(SAFETY_SECTION_2_ITEMS[SAFETY_SECTION_2_ITEMS.length - 1].itemNumber).toBe('2.28');
    });
  });

  // -- Remediation state transitions -----------------------------------------

  describe('Remediation state transitions', () => {
    it('has exactly 7 valid transitions per T07 §5.0', () => {
      expect(REMEDIATION_STATE_TRANSITIONS).toHaveLength(7);
    });

    it('each transition has from, to, and description', () => {
      for (const t of REMEDIATION_STATE_TRANSITIONS) {
        expect(t.from).toBeTruthy();
        expect(t.to).toBeTruthy();
        expect(t.description).toBeTruthy();
      }
    });

    it('includes PENDING → IN_PROGRESS', () => {
      expect(REMEDIATION_STATE_TRANSITIONS.some((t) => t.from === 'PENDING' && t.to === 'IN_PROGRESS')).toBe(true);
    });

    it('includes ESCALATED → RESOLVED', () => {
      expect(REMEDIATION_STATE_TRANSITIONS.some((t) => t.from === 'ESCALATED' && t.to === 'RESOLVED')).toBe(true);
    });

    it('includes ESCALATED → IN_PROGRESS (acknowledgment)', () => {
      expect(REMEDIATION_STATE_TRANSITIONS.some((t) => t.from === 'ESCALATED' && t.to === 'IN_PROGRESS')).toBe(true);
    });
  });

  // -- Escalation thresholds -------------------------------------------------

  describe('Escalation thresholds', () => {
    it('has exactly 3 thresholds per T07 §5.2', () => {
      expect(ESCALATION_THRESHOLDS).toHaveLength(3);
    });

    it('only PX threshold creates ProgramBlocker', () => {
      const pxThreshold = ESCALATION_THRESHOLDS.find((t) => t.escalateTo === 'PX');
      expect(pxThreshold?.createsProgramBlocker).toBe(true);
      const pmThresholds = ESCALATION_THRESHOLDS.filter((t) => t.escalateTo === 'PM');
      for (const t of pmThresholds) {
        expect(t.createsProgramBlocker).toBe(false);
      }
    });
  });

  // -- Immutable fields ------------------------------------------------------

  describe('Immutable item fields', () => {
    it('has exactly 2 immutable fields per T07 §4', () => {
      expect(SAFETY_IMMUTABLE_ITEM_FIELDS).toHaveLength(2);
    });

    it('includes itemNumber and description', () => {
      expect(SAFETY_IMMUTABLE_ITEM_FIELDS).toContain('itemNumber');
      expect(SAFETY_IMMUTABLE_ITEM_FIELDS).toContain('description');
    });
  });

  // -- Spine publication definitions -----------------------------------------

  describe('Stage 3 spine publication', () => {
    it('has 4 activity event definitions', () => {
      expect(STAGE3_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(4);
    });

    it('has 2 health metric definitions', () => {
      expect(STAGE3_HEALTH_METRIC_DEFINITIONS).toHaveLength(2);
    });

    it('has 4 work queue item definitions', () => {
      expect(STAGE3_WORK_QUEUE_ITEM_DEFINITIONS).toHaveLength(4);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 2 section titles', () => {
      expect(Object.keys(SAFETY_READINESS_SECTION_TITLE_LABELS)).toHaveLength(2);
    });

    it('labels all 3 results', () => {
      expect(Object.keys(SAFETY_READINESS_RESULT_LABELS)).toHaveLength(3);
    });

    it('labels all 4 remediation statuses', () => {
      expect(Object.keys(REMEDIATION_STATUS_LABELS)).toHaveLength(4);
    });

    it('labels all 3 escalation levels', () => {
      expect(Object.keys(ESCALATION_LEVEL_LABELS)).toHaveLength(3);
    });
  });
});

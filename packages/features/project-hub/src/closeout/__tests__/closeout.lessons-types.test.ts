import { describe, expect, it } from 'vitest';

import {
  LESSON_CATEGORIES,
  DELIVERY_METHODS,
  MARKET_SECTORS,
  PROJECT_SIZE_BANDS,
  IMPACT_MAGNITUDES,
  LESSON_CATEGORY_LABELS,
  DELIVERY_METHOD_LABELS,
  MARKET_SECTOR_LABELS,
  PROJECT_SIZE_BAND_LABELS,
  IMPACT_MAGNITUDE_LABELS,
  IMPACT_MAGNITUDE_THRESHOLDS,
  APPROVED_ACTION_VERBS,
  LESSONS_LAYER_DEFINITIONS,
  LESSONS_WORKFLOW_STEPS,
  LESSONS_BUSINESS_RULES,
  LESSONS_AUTOPSY_RELATIONSHIP_TABLE,
} from '../../index.js';

describe('P3-E10-T05 Closeout lessons contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('LessonCategory', () => {
    it('has exactly 15 categories per §2.1', () => {
      expect(LESSON_CATEGORIES).toHaveLength(15);
    });

    it('starts with PreConstruction and ends with Other', () => {
      expect(LESSON_CATEGORIES[0]).toBe('PreConstruction');
      expect(LESSON_CATEGORIES[14]).toBe('Other');
    });
  });

  describe('DeliveryMethod', () => {
    it('has exactly 7 methods per §2.2', () => {
      expect(DELIVERY_METHODS).toHaveLength(7);
    });
  });

  describe('MarketSector', () => {
    it('has exactly 13 sectors per §2.2', () => {
      expect(MARKET_SECTORS).toHaveLength(13);
    });
  });

  describe('ProjectSizeBand', () => {
    it('has exactly 6 bands per §2.2', () => {
      expect(PROJECT_SIZE_BANDS).toHaveLength(6);
    });
  });

  describe('ImpactMagnitude', () => {
    it('has exactly 4 magnitudes per §2.2', () => {
      expect(IMPACT_MAGNITUDES).toHaveLength(4);
    });

    it('ordered Minor → Critical', () => {
      expect([...IMPACT_MAGNITUDES]).toEqual(['Minor', 'Moderate', 'Significant', 'Critical']);
    });
  });

  // -- Thresholds ------------------------------------------------------------

  describe('Impact magnitude thresholds', () => {
    it('has exactly 4 threshold rows per §3.2', () => {
      expect(IMPACT_MAGNITUDE_THRESHOLDS).toHaveLength(4);
    });

    it('each threshold has all required fields', () => {
      for (const t of IMPACT_MAGNITUDE_THRESHOLDS) {
        expect(t.magnitude).toBeTruthy();
        expect(t.costCondition).toBeTruthy();
        expect(t.scheduleCondition).toBeTruthy();
        expect(typeof t.costMin).toBe('number');
        expect(typeof t.scheduleDaysMin).toBe('number');
      }
    });

    it('Critical has null upper bounds', () => {
      const critical = IMPACT_MAGNITUDE_THRESHOLDS.find((t) => t.magnitude === 'Critical');
      expect(critical?.costMax).toBeNull();
      expect(critical?.scheduleDaysMax).toBeNull();
    });
  });

  // -- Approved action verbs -------------------------------------------------

  describe('Approved action verbs', () => {
    it('has exactly 32 verbs per §4', () => {
      expect(APPROVED_ACTION_VERBS.size).toBe(32);
    });

    it('includes key verbs', () => {
      expect(APPROVED_ACTION_VERBS.has('establish')).toBe(true);
      expect(APPROVED_ACTION_VERBS.has('implement')).toBe(true);
      expect(APPROVED_ACTION_VERBS.has('require')).toBe(true);
      expect(APPROVED_ACTION_VERBS.has('verify')).toBe(true);
    });

    it('all stored lowercase', () => {
      for (const verb of APPROVED_ACTION_VERBS) {
        expect(verb).toBe(verb.toLowerCase());
      }
    });
  });

  // -- Layer definitions -----------------------------------------------------

  describe('Layer definitions', () => {
    it('has exactly 3 layers per §1', () => {
      expect(LESSONS_LAYER_DEFINITIONS).toHaveLength(3);
    });

    it('each layer has all required fields', () => {
      for (const layer of LESSONS_LAYER_DEFINITIONS) {
        expect(layer.layer).toBeTruthy();
        expect(layer.recordType).toBeTruthy();
        expect(layer.purpose).toBeTruthy();
      }
    });
  });

  // -- Workflow steps --------------------------------------------------------

  describe('Workflow steps', () => {
    it('has exactly 4 steps per §5', () => {
      expect(LESSONS_WORKFLOW_STEPS).toHaveLength(4);
    });

    it('steps are numbered 1-4', () => {
      const numbers = LESSONS_WORKFLOW_STEPS.map((s) => s.stepNumber);
      expect(numbers).toEqual([1, 2, 3, 4]);
    });
  });

  // -- Business rules --------------------------------------------------------

  describe('Business rules', () => {
    it('has exactly 9 rules per §6', () => {
      expect(LESSONS_BUSINESS_RULES).toHaveLength(9);
    });

    it('rules are numbered 1-9', () => {
      const numbers = LESSONS_BUSINESS_RULES.map((r) => r.ruleNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  // -- Autopsy relationship --------------------------------------------------

  describe('Autopsy relationship table', () => {
    it('has exactly 7 aspects per §8', () => {
      expect(LESSONS_AUTOPSY_RELATIONSHIP_TABLE).toHaveLength(7);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 15 categories', () => {
      expect(Object.keys(LESSON_CATEGORY_LABELS)).toHaveLength(15);
    });

    it('labels all 7 delivery methods', () => {
      expect(Object.keys(DELIVERY_METHOD_LABELS)).toHaveLength(7);
    });

    it('labels all 13 market sectors', () => {
      expect(Object.keys(MARKET_SECTOR_LABELS)).toHaveLength(13);
    });

    it('labels all 6 size bands', () => {
      expect(Object.keys(PROJECT_SIZE_BAND_LABELS)).toHaveLength(6);
    });

    it('labels all 4 impact magnitudes', () => {
      expect(Object.keys(IMPACT_MAGNITUDE_LABELS)).toHaveLength(4);
    });
  });
});

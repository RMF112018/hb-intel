import { describe, expect, it } from 'vitest';

import {
  SCORECARD_SECTION_KEYS,
  PERFORMANCE_RATINGS,
  SCORECARD_SCORE_VALUES,
  SCORECARD_SCORE_DEFINITIONS,
  SCORECARD_SECTION_DEFINITIONS,
  SCORECARD_PERFORMANCE_RATING_RANGES,
  SCORECARD_SAFETY_CRITERIA,
  SCORECARD_QUALITY_CRITERIA,
  SCORECARD_SCHEDULE_CRITERIA,
  SCORECARD_COST_MGMT_CRITERIA,
  SCORECARD_COMMUNICATION_CRITERIA,
  SCORECARD_WORKFORCE_CRITERIA,
  SCORECARD_ALL_CRITERIA,
  SCORECARD_VISIBILITY_RULES,
  SCORECARD_ORG_ACCESS_RULES,
  SCORECARD_SECTION_KEY_LABELS,
  SCORECARD_PERFORMANCE_RATING_LABELS,
} from '../../index.js';

describe('P3-E10-T06 Closeout scorecard contract stability', () => {
  describe('ScorecardSectionKey', () => {
    it('has exactly 6 sections per §2.2', () => {
      expect(SCORECARD_SECTION_KEYS).toHaveLength(6);
    });
  });

  describe('PerformanceRating', () => {
    it('has exactly 5 ratings per §3.3', () => {
      expect(PERFORMANCE_RATINGS).toHaveLength(5);
    });
  });

  describe('ScorecardScoreValue', () => {
    it('has 6 values (1-5 + NA) per §2.1', () => {
      expect(SCORECARD_SCORE_VALUES).toHaveLength(6);
    });
  });

  describe('Score definitions', () => {
    it('has 6 definitions per §2.1', () => {
      expect(SCORECARD_SCORE_DEFINITIONS).toHaveLength(6);
    });

    it('each has score, label, definition', () => {
      for (const def of SCORECARD_SCORE_DEFINITIONS) {
        expect(def.label).toBeTruthy();
        expect(def.definition).toBeTruthy();
      }
    });
  });

  describe('Section definitions', () => {
    it('has exactly 6 sections per §2.2', () => {
      expect(SCORECARD_SECTION_DEFINITIONS).toHaveLength(6);
    });

    it('weights sum to 1.00', () => {
      const totalWeight = SCORECARD_SECTION_DEFINITIONS.reduce((sum, s) => sum + s.weight, 0);
      expect(Math.round(totalWeight * 100) / 100).toBe(1.00);
    });

    it('total criteria count is 29', () => {
      const totalCriteria = SCORECARD_SECTION_DEFINITIONS.reduce((sum, s) => sum + s.criteriaCount, 0);
      expect(totalCriteria).toBe(29);
    });
  });

  describe('Performance rating ranges', () => {
    it('has exactly 5 ranges per §3.3', () => {
      expect(SCORECARD_PERFORMANCE_RATING_RANGES).toHaveLength(5);
    });

    it('ranges are contiguous from 1.00 to 5.00', () => {
      expect(SCORECARD_PERFORMANCE_RATING_RANGES[0].maxScore).toBe(5.00);
      expect(SCORECARD_PERFORMANCE_RATING_RANGES[4].minScore).toBe(1.00);
    });
  });

  describe('Criterion catalogs', () => {
    it('Safety has 5 criteria', () => { expect(SCORECARD_SAFETY_CRITERIA).toHaveLength(5); });
    it('Quality has 5 criteria', () => { expect(SCORECARD_QUALITY_CRITERIA).toHaveLength(5); });
    it('Schedule has 5 criteria', () => { expect(SCORECARD_SCHEDULE_CRITERIA).toHaveLength(5); });
    it('CostMgmt has 5 criteria', () => { expect(SCORECARD_COST_MGMT_CRITERIA).toHaveLength(5); });
    it('Communication has 5 criteria', () => { expect(SCORECARD_COMMUNICATION_CRITERIA).toHaveLength(5); });
    it('Workforce has 4 criteria', () => { expect(SCORECARD_WORKFORCE_CRITERIA).toHaveLength(4); });

    it('all criteria combined = 29', () => {
      expect(SCORECARD_ALL_CRITERIA).toHaveLength(29);
    });

    it('each criterion has required fields', () => {
      for (const c of SCORECARD_ALL_CRITERIA) {
        expect(c.sectionKey).toBeTruthy();
        expect(c.number).toBeTruthy();
        expect(c.criterion).toBeTruthy();
        expect(c.evidenceGuidance).toBeTruthy();
      }
    });
  });

  describe('Visibility rules', () => {
    it('has exactly 8 rules per §5.1', () => {
      expect(SCORECARD_VISIBILITY_RULES).toHaveLength(8);
    });
  });

  describe('Org access rules', () => {
    it('has exactly 3 rules per §5.3', () => {
      expect(SCORECARD_ORG_ACCESS_RULES).toHaveLength(3);
    });
  });

  describe('Label maps', () => {
    it('labels all 6 section keys', () => {
      expect(Object.keys(SCORECARD_SECTION_KEY_LABELS)).toHaveLength(6);
    });

    it('labels all 5 performance ratings', () => {
      expect(Object.keys(SCORECARD_PERFORMANCE_RATING_LABELS)).toHaveLength(5);
    });
  });
});

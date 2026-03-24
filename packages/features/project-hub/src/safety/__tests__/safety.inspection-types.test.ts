import { describe, expect, it } from 'vitest';

import {
  STANDARD_TEMPLATE_SECTIONS,
  SCORE_BAND_THRESHOLDS,
  CA_DUE_DATE_RULES,
  INSPECTION_WORK_QUEUE_TRIGGERS,
  APPLICABILITY_CONDITIONS,
  INSPECTION_ITEM_RESPONSE_VALUES,
  INSPECTION_TREND_DIRECTIONS,
  INSPECTION_SCORE_BANDS,
  APPLICABILITY_CONDITION_LABELS,
  INSPECTION_ITEM_RESPONSE_VALUE_LABELS,
  INSPECTION_TREND_DIRECTION_LABELS,
  INSPECTION_SCORE_BAND_LABELS,
  DEFAULT_TREND_WINDOW_WEEKS,
  MINIMUM_TREND_DATA_POINTS,
  TREND_DIRECTION_THRESHOLD,
  NORMALIZED_SCORE_PRECISION,
} from '../../index.js';

describe('P3-E8-T04 Inspection program contract stability', () => {
  describe('Standard template', () => {
    it('has exactly 12 sections per §2.2', () => {
      expect(STANDARD_TEMPLATE_SECTIONS).toHaveLength(12);
    });

    it('default weights sum to exactly 100', () => {
      const total = STANDARD_TEMPLATE_SECTIONS.reduce((sum, s) => sum + s.defaultWeight, 0);
      expect(total).toBe(100);
    });

    it('each section has a unique key', () => {
      const keys = STANDARD_TEMPLATE_SECTIONS.map((s) => s.sectionKey);
      expect(new Set(keys).size).toBe(12);
    });
  });

  describe('Score band thresholds', () => {
    it('defines 3 bands (HIGH, MED, LOW)', () => {
      expect(SCORE_BAND_THRESHOLDS).toHaveLength(3);
    });

    it('HIGH threshold is 90', () => {
      expect(SCORE_BAND_THRESHOLDS.find((t) => t.band === 'HIGH')?.minScore).toBe(90);
    });

    it('MED threshold is 70', () => {
      expect(SCORE_BAND_THRESHOLDS.find((t) => t.band === 'MED')?.minScore).toBe(70);
    });

    it('LOW threshold is 0', () => {
      expect(SCORE_BAND_THRESHOLDS.find((t) => t.band === 'LOW')?.minScore).toBe(0);
    });
  });

  describe('CA due date rules', () => {
    it('defines 3 severity rules', () => {
      expect(CA_DUE_DATE_RULES).toHaveLength(3);
    });

    it('CRITICAL is 0 business days (same day)', () => {
      expect(CA_DUE_DATE_RULES.find((r) => r.severity === 'CRITICAL')?.businessDays).toBe(0);
    });

    it('MAJOR is 3 business days', () => {
      expect(CA_DUE_DATE_RULES.find((r) => r.severity === 'MAJOR')?.businessDays).toBe(3);
    });

    it('MINOR is 7 business days', () => {
      expect(CA_DUE_DATE_RULES.find((r) => r.severity === 'MINOR')?.businessDays).toBe(7);
    });
  });

  describe('Work queue triggers', () => {
    it('defines 4 triggers per §7', () => {
      expect(INSPECTION_WORK_QUEUE_TRIGGERS).toHaveLength(4);
    });
  });

  describe('Enum arrays', () => {
    it('APPLICABILITY_CONDITIONS has 4 values', () => { expect(APPLICABILITY_CONDITIONS).toHaveLength(4); });
    it('INSPECTION_ITEM_RESPONSE_VALUES has 3 values', () => { expect(INSPECTION_ITEM_RESPONSE_VALUES).toHaveLength(3); });
    it('INSPECTION_TREND_DIRECTIONS has 4 values', () => { expect(INSPECTION_TREND_DIRECTIONS).toHaveLength(4); });
    it('INSPECTION_SCORE_BANDS has 3 values', () => { expect(INSPECTION_SCORE_BANDS).toHaveLength(3); });
  });

  describe('Label map completeness', () => {
    it('applicability condition labels', () => {
      for (const c of APPLICABILITY_CONDITIONS) expect(APPLICABILITY_CONDITION_LABELS[c]).toBeTruthy();
    });
    it('item response value labels', () => {
      for (const v of INSPECTION_ITEM_RESPONSE_VALUES) expect(INSPECTION_ITEM_RESPONSE_VALUE_LABELS[v]).toBeTruthy();
    });
    it('trend direction labels', () => {
      for (const d of INSPECTION_TREND_DIRECTIONS) expect(INSPECTION_TREND_DIRECTION_LABELS[d]).toBeTruthy();
    });
    it('score band labels', () => {
      for (const b of INSPECTION_SCORE_BANDS) expect(INSPECTION_SCORE_BAND_LABELS[b]).toBeTruthy();
    });
  });

  describe('Scoring configuration', () => {
    it('normalized score precision is 1 decimal', () => {
      expect(NORMALIZED_SCORE_PRECISION).toBe(1);
    });

    it('default trend window is 4 weeks', () => {
      expect(DEFAULT_TREND_WINDOW_WEEKS).toBe(4);
    });

    it('minimum trend data points is 2', () => {
      expect(MINIMUM_TREND_DATA_POINTS).toBe(2);
    });

    it('trend direction threshold is 5 points', () => {
      expect(TREND_DIRECTION_THRESHOLD).toBe(5);
    });
  });
});

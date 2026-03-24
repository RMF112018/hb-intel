import { describe, expect, it } from 'vitest';

import {
  calculateNormalizedScore,
  deriveScoreBand,
  computeTrendDirection,
  getCADueDateDays,
  validateWeightsSum,
  isTemplatePinningValid,
} from '../../index.js';

import type { IInspectionSectionResponse, ISectionScoringWeight } from '../../index.js';
import type { IInspectionTrendDataPoint } from '../../index.js';

// -- Test Helpers -----------------------------------------------------------

const makeResponse = (
  sectionKey: string,
  isApplicable: boolean,
  passCount: number,
  failCount: number,
  naCount: number = 0,
): IInspectionSectionResponse => ({
  sectionKey,
  isApplicable,
  notApplicableReason: isApplicable ? null : 'Not active on site',
  itemResponses: [
    ...Array.from({ length: passCount }, (_, i) => ({
      itemKey: `${sectionKey}-pass-${i}`,
      response: 'PASS' as const,
      numericValue: null,
      notes: null,
      correctiveActionId: null,
      evidenceRecordIds: [],
    })),
    ...Array.from({ length: failCount }, (_, i) => ({
      itemKey: `${sectionKey}-fail-${i}`,
      response: 'FAIL' as const,
      numericValue: null,
      notes: 'Failed item',
      correctiveActionId: null,
      evidenceRecordIds: [],
    })),
    ...Array.from({ length: naCount }, (_, i) => ({
      itemKey: `${sectionKey}-na-${i}`,
      response: 'N_A' as const,
      numericValue: null,
      notes: null,
      correctiveActionId: null,
      evidenceRecordIds: [],
    })),
  ],
  sectionScore: null,
  sectionMaxScore: null,
  sectionNotes: null,
});

const makeWeights = (entries: Array<{ key: string; weight: number }>): ISectionScoringWeight[] =>
  entries.map((e) => ({ sectionKey: e.key, weight: e.weight }));

describe('P3-E8-T04 Inspection scoring and business rules', () => {
  // =========================================================================
  // Normalized Scoring Algorithm (§4.1)
  // =========================================================================

  describe('calculateNormalizedScore', () => {
    it('returns zeros when no applicable sections', () => {
      const result = calculateNormalizedScore(
        [makeResponse('s1', false, 0, 0)],
        makeWeights([{ key: 's1', weight: 100 }]),
      );
      expect(result.applicableSectionCount).toBe(0);
      expect(result.rawScore).toBe(0);
      expect(result.maxPossibleScore).toBe(0);
      expect(result.normalizedScore).toBe(0);
    });

    it('scores single section all pass = 100', () => {
      const result = calculateNormalizedScore(
        [makeResponse('s1', true, 5, 0)],
        makeWeights([{ key: 's1', weight: 100 }]),
      );
      expect(result.applicableSectionCount).toBe(1);
      expect(result.normalizedScore).toBe(100);
    });

    it('scores single section half pass = 50', () => {
      const result = calculateNormalizedScore(
        [makeResponse('s1', true, 5, 5)],
        makeWeights([{ key: 's1', weight: 100 }]),
      );
      expect(result.normalizedScore).toBe(50);
    });

    it('reweights when some sections are N/A', () => {
      // Two sections, equal weight. One N/A, one all-pass.
      // Result: applicable section gets renormalized to 100% → score = 100
      const result = calculateNormalizedScore(
        [
          makeResponse('s1', true, 10, 0),
          makeResponse('s2', false, 0, 0),
        ],
        makeWeights([{ key: 's1', weight: 50 }, { key: 's2', weight: 50 }]),
      );
      expect(result.applicableSectionCount).toBe(1);
      expect(result.normalizedScore).toBe(100);
    });

    it('handles two applicable sections with different pass rates', () => {
      // s1: 50 weight, 8/10 pass = 80%
      // s2: 50 weight, 6/10 pass = 60%
      // normalized = (80*50 + 60*50) / (50+50) = 70
      const result = calculateNormalizedScore(
        [
          makeResponse('s1', true, 8, 2),
          makeResponse('s2', true, 6, 4),
        ],
        makeWeights([{ key: 's1', weight: 50 }, { key: 's2', weight: 50 }]),
      );
      expect(result.normalizedScore).toBe(70);
    });

    it('excludes N_A item responses from scoring', () => {
      // Section with 5 pass, 0 fail, 3 N/A → 5/5 applicable = 100%
      const result = calculateNormalizedScore(
        [makeResponse('s1', true, 5, 0, 3)],
        makeWeights([{ key: 's1', weight: 100 }]),
      );
      expect(result.normalizedScore).toBe(100);
    });

    it('rounds to 1 decimal place', () => {
      // 1/3 pass = 33.333...% → rounds to 33.3
      const result = calculateNormalizedScore(
        [makeResponse('s1', true, 1, 2)],
        makeWeights([{ key: 's1', weight: 100 }]),
      );
      expect(result.normalizedScore).toBe(33.3);
    });
  });

  // =========================================================================
  // Score Band Derivation (§5.2)
  // =========================================================================

  describe('deriveScoreBand', () => {
    it('95 → HIGH', () => { expect(deriveScoreBand(95)).toBe('HIGH'); });
    it('90 → HIGH (boundary)', () => { expect(deriveScoreBand(90)).toBe('HIGH'); });
    it('89 → MED', () => { expect(deriveScoreBand(89)).toBe('MED'); });
    it('75 → MED', () => { expect(deriveScoreBand(75)).toBe('MED'); });
    it('70 → MED (boundary)', () => { expect(deriveScoreBand(70)).toBe('MED'); });
    it('69 → LOW', () => { expect(deriveScoreBand(69)).toBe('LOW'); });
    it('50 → LOW', () => { expect(deriveScoreBand(50)).toBe('LOW'); });
    it('0 → LOW', () => { expect(deriveScoreBand(0)).toBe('LOW'); });
    it('100 → HIGH', () => { expect(deriveScoreBand(100)).toBe('HIGH'); });
  });

  // =========================================================================
  // Trend Direction (§5.1)
  // =========================================================================

  describe('computeTrendDirection', () => {
    const pt = (score: number, week: string = '2026-W10'): IInspectionTrendDataPoint => ({
      inspectionWeek: week,
      normalizedScore: score,
      inspectionDate: '2026-03-10',
      inspectionId: `insp-${score}`,
    });

    it('returns INSUFFICIENT_DATA for 0 points', () => {
      expect(computeTrendDirection([])).toBe('INSUFFICIENT_DATA');
    });

    it('returns INSUFFICIENT_DATA for 1 point', () => {
      expect(computeTrendDirection([pt(80)])).toBe('INSUFFICIENT_DATA');
    });

    it('returns IMPROVING when recent > prior by ≥ 5', () => {
      expect(computeTrendDirection([pt(70), pt(80)])).toBe('IMPROVING');
    });

    it('returns DECLINING when recent < prior by ≥ 5', () => {
      expect(computeTrendDirection([pt(80), pt(70)])).toBe('DECLINING');
    });

    it('returns STABLE when within ±5', () => {
      expect(computeTrendDirection([pt(80), pt(83)])).toBe('STABLE');
    });

    it('handles 3+ data points (recent 2 avg vs prior avg)', () => {
      // Prior: [70], recent 2: [80, 82] → recent avg 81, prior avg 70, diff = 11 → IMPROVING
      expect(computeTrendDirection([pt(70), pt(80), pt(82)])).toBe('IMPROVING');
    });

    it('handles declining 3+ data points', () => {
      // Prior: [90], recent 2: [75, 78] → recent avg 76.5, prior avg 90, diff = -13.5 → DECLINING
      expect(computeTrendDirection([pt(90), pt(75), pt(78)])).toBe('DECLINING');
    });

    it('handles stable 3+ data points', () => {
      // Prior: [80], recent 2: [82, 81] → recent avg 81.5, prior avg 80, diff = 1.5 → STABLE
      expect(computeTrendDirection([pt(80), pt(82), pt(81)])).toBe('STABLE');
    });
  });

  // =========================================================================
  // CA Due Date (§6)
  // =========================================================================

  describe('getCADueDateDays', () => {
    it('CRITICAL = 0 (same day)', () => { expect(getCADueDateDays('CRITICAL')).toBe(0); });
    it('MAJOR = 3 business days', () => { expect(getCADueDateDays('MAJOR')).toBe(3); });
    it('MINOR = 7 business days', () => { expect(getCADueDateDays('MINOR')).toBe(7); });
  });

  // =========================================================================
  // Weight Validation (§2.2)
  // =========================================================================

  describe('validateWeightsSum', () => {
    it('returns true when sum = 100', () => {
      expect(validateWeightsSum(makeWeights([
        { key: 's1', weight: 50 }, { key: 's2', weight: 50 },
      ]))).toBe(true);
    });

    it('returns false when sum ≠ 100', () => {
      expect(validateWeightsSum(makeWeights([
        { key: 's1', weight: 50 }, { key: 's2', weight: 40 },
      ]))).toBe(false);
    });

    it('returns true for standard template weights', () => {
      // Import the standard template and check
      expect(validateWeightsSum(
        [10, 10, 12, 8, 8, 8, 7, 7, 6, 8, 8, 8].map((w, i) => ({
          sectionKey: `s${i}`,
          weight: w,
        })),
      )).toBe(true);
    });
  });

  // =========================================================================
  // Template Pinning (§2.4)
  // =========================================================================

  describe('isTemplatePinningValid', () => {
    it('ACTIVE is valid for pinning', () => { expect(isTemplatePinningValid('ACTIVE')).toBe(true); });
    it('DRAFT is not valid', () => { expect(isTemplatePinningValid('DRAFT')).toBe(false); });
    it('RETIRED is not valid', () => { expect(isTemplatePinningValid('RETIRED')).toBe(false); });
  });
});

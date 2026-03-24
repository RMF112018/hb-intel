import { describe, expect, it } from 'vitest';

import {
  extractCostSignal,
  extractScheduleSignal,
  getMagnitudeForCost,
  getMagnitudeForSchedule,
  resolveMultiSignalMagnitude,
  deriveImpactMagnitude,
  isRecommendationActionVerbValid,
  getRecommendationValidationError,
  canCreateLessonEntry,
  canSubmitLessonsReport,
  isOneReportPerProjectEnforced,
  normalizeKeywords,
  calculateAggregateStats,
} from '../../index.js';

import { createMockLessonsLearnedSnapshot } from '../../../testing/createMockLessonsSnapshot.js';

describe('P3-E10-T05 Closeout lessons business rules', () => {
  // -- Cost Signal Extraction (§3.1) -----------------------------------------

  describe('extractCostSignal', () => {
    it('extracts dollar amount from "$50,000"', () => {
      expect(extractCostSignal('Lost $50,000 due to rework')).toBe(50000);
    });

    it('extracts dollar amount from "$1.5M"', () => {
      expect(extractCostSignal('Impact was $1.5M over budget')).toBe(1500000);
    });

    it('extracts dollar amount from "$500K"', () => {
      expect(extractCostSignal('Saved $500K through value engineering')).toBe(500000);
    });

    it('extracts plain dollar amount from "$5000"', () => {
      expect(extractCostSignal('Cost $5000 for repairs')).toBe(5000);
    });

    it('returns null when no cost signal', () => {
      expect(extractCostSignal('Caused a significant delay')).toBeNull();
    });
  });

  // -- Schedule Signal Extraction (§3.1) -------------------------------------

  describe('extractScheduleSignal', () => {
    it('extracts "15 days"', () => {
      expect(extractScheduleSignal('Delayed 15 days')).toBe(15);
    });

    it('extracts "3 weeks" as 15 working days', () => {
      expect(extractScheduleSignal('Lost 3 weeks')).toBe(15);
    });

    it('extracts "2 calendar days"', () => {
      expect(extractScheduleSignal('Only 2 calendar days impact')).toBe(2);
    });

    it('returns null when no schedule signal', () => {
      expect(extractScheduleSignal('Cost overrun of $10,000')).toBeNull();
    });
  });

  // -- Magnitude Lookup (§3.2) -----------------------------------------------

  describe('getMagnitudeForCost', () => {
    it('$5,000 → Minor', () => {
      expect(getMagnitudeForCost(5000)).toBe('Minor');
    });

    it('$25,000 → Moderate', () => {
      expect(getMagnitudeForCost(25000)).toBe('Moderate');
    });

    it('$100,000 → Significant', () => {
      expect(getMagnitudeForCost(100000)).toBe('Significant');
    });

    it('$300,000 → Critical', () => {
      expect(getMagnitudeForCost(300000)).toBe('Critical');
    });
  });

  describe('getMagnitudeForSchedule', () => {
    it('1 day → Minor', () => {
      expect(getMagnitudeForSchedule(1)).toBe('Minor');
    });

    it('5 days → Moderate', () => {
      expect(getMagnitudeForSchedule(5)).toBe('Moderate');
    });

    it('15 days → Significant', () => {
      expect(getMagnitudeForSchedule(15)).toBe('Significant');
    });

    it('45 days → Critical', () => {
      expect(getMagnitudeForSchedule(45)).toBe('Critical');
    });
  });

  // -- Multi-signal Resolution -----------------------------------------------

  describe('resolveMultiSignalMagnitude', () => {
    it('higher magnitude governs when both present', () => {
      expect(resolveMultiSignalMagnitude('Minor', 'Critical')).toBe('Critical');
      expect(resolveMultiSignalMagnitude('Significant', 'Moderate')).toBe('Significant');
    });

    it('returns non-null when only one signal present', () => {
      expect(resolveMultiSignalMagnitude('Moderate', null)).toBe('Moderate');
      expect(resolveMultiSignalMagnitude(null, 'Critical')).toBe('Critical');
    });

    it('returns null when both null', () => {
      expect(resolveMultiSignalMagnitude(null, null)).toBeNull();
    });
  });

  // -- Full Derivation (§3) --------------------------------------------------

  describe('deriveImpactMagnitude', () => {
    it('derives Moderate from "$50,000"', () => {
      const result = deriveImpactMagnitude('Rework cost $50,000');
      expect(result.derivedMagnitude).toBe('Moderate');
      expect(result.costSignal).toBe(50000);
      expect(result.scheduleSignal).toBeNull();
      expect(result.multiSignalApplied).toBe(false);
    });

    it('derives Significant from "15 days"', () => {
      const result = deriveImpactMagnitude('Delayed 15 days');
      expect(result.derivedMagnitude).toBe('Significant');
      expect(result.scheduleSignal).toBe(15);
    });

    it('derives Critical when both cost and schedule are high', () => {
      const result = deriveImpactMagnitude('Cost $300,000 and delayed 45 days');
      expect(result.derivedMagnitude).toBe('Critical');
      expect(result.multiSignalApplied).toBe(true);
    });

    it('returns null when no signals found', () => {
      const result = deriveImpactMagnitude('Had a negative impact on the project');
      expect(result.derivedMagnitude).toBeNull();
      expect(result.costSignal).toBeNull();
      expect(result.scheduleSignal).toBeNull();
    });
  });

  // -- Recommendation Validation (§4) ----------------------------------------

  describe('isRecommendationActionVerbValid', () => {
    it('accepts approved verbs (case-insensitive)', () => {
      expect(isRecommendationActionVerbValid('Establish weekly coordination meetings')).toBe(true);
      expect(isRecommendationActionVerbValid('implement safety audits')).toBe(true);
      expect(isRecommendationActionVerbValid('REQUIRE pre-task planning')).toBe(true);
    });

    it('rejects non-action-verb starts', () => {
      expect(isRecommendationActionVerbValid('The team should implement')).toBe(false);
      expect(isRecommendationActionVerbValid('We need to establish')).toBe(false);
      expect(isRecommendationActionVerbValid('Consider implementing')).toBe(false);
    });

    it('rejects empty input', () => {
      expect(isRecommendationActionVerbValid('')).toBe(false);
      expect(isRecommendationActionVerbValid('   ')).toBe(false);
    });
  });

  describe('getRecommendationValidationError', () => {
    it('returns null for valid recommendations', () => {
      expect(getRecommendationValidationError('Establish weekly meetings')).toBeNull();
    });

    it('returns error message for invalid recommendations', () => {
      const error = getRecommendationValidationError('The project should');
      expect(error).toContain('action verb');
    });
  });

  // -- Workflow Rules (§5, §6) -----------------------------------------------

  describe('canCreateLessonEntry', () => {
    it('always returns true (rolling capture per §6 rule 1)', () => {
      expect(canCreateLessonEntry()).toBe(true);
    });
  });

  describe('canSubmitLessonsReport', () => {
    it('returns true when >= 1 linked and 0 unlinked', () => {
      expect(canSubmitLessonsReport(1, 0)).toBe(true);
      expect(canSubmitLessonsReport(5, 0)).toBe(true);
    });

    it('returns false when 0 linked entries (rule 3)', () => {
      expect(canSubmitLessonsReport(0, 0)).toBe(false);
    });

    it('returns false when unlinked entries exist (rule 4)', () => {
      expect(canSubmitLessonsReport(3, 2)).toBe(false);
    });
  });

  describe('isOneReportPerProjectEnforced', () => {
    it('always true per §6 rule 2', () => {
      expect(isOneReportPerProjectEnforced()).toBe(true);
    });
  });

  describe('normalizeKeywords', () => {
    it('lowercases and trims', () => {
      expect(normalizeKeywords(['  Safety ', 'QUALITY'])).toEqual(['safety', 'quality']);
    });

    it('deduplicates', () => {
      expect(normalizeKeywords(['safety', 'Safety', 'SAFETY'])).toEqual(['safety']);
    });

    it('removes empty strings after trim', () => {
      expect(normalizeKeywords(['safety', '', '  ', 'quality'])).toEqual(['safety', 'quality']);
    });
  });

  // -- Snapshot Aggregation (§7) ---------------------------------------------

  describe('calculateAggregateStats', () => {
    it('computes correct category and magnitude counts', () => {
      const entries = [
        { lessonNumber: 1, category: 'Safety' as const, phaseEncountered: 'Execution', applicability: 4, keywords: [], situation: '', impact: '', impactMagnitude: 'Critical' as const, rootCause: '', response: null, recommendation: 'Implement audits' },
        { lessonNumber: 2, category: 'Safety' as const, phaseEncountered: 'Execution', applicability: 3, keywords: [], situation: '', impact: '', impactMagnitude: 'Moderate' as const, rootCause: '', response: null, recommendation: 'Review procedures' },
        { lessonNumber: 3, category: 'Schedule' as const, phaseEncountered: 'Execution', applicability: 5, keywords: [], situation: '', impact: '', impactMagnitude: 'Significant' as const, rootCause: '', response: null, recommendation: 'Establish milestones' },
      ];

      const stats = calculateAggregateStats(entries);
      expect(stats.categoryCounts.Safety).toBe(2);
      expect(stats.categoryCounts.Schedule).toBe(1);
      expect(stats.categoryCounts.Quality).toBe(0);
      expect(stats.magnitudeCounts.Critical).toBe(1);
      expect(stats.magnitudeCounts.Moderate).toBe(1);
      expect(stats.magnitudeCounts.Significant).toBe(1);
      expect(stats.highApplicabilityCount).toBe(2); // applicability >= 4
      expect(stats.criticalAndSignificantCount).toBe(2); // Critical + Significant
    });

    it('returns zero counts for empty entries', () => {
      const stats = calculateAggregateStats([]);
      expect(stats.highApplicabilityCount).toBe(0);
      expect(stats.criticalAndSignificantCount).toBe(0);
    });
  });

  // -- Mock factory ----------------------------------------------------------

  describe('createMockLessonsLearnedSnapshot', () => {
    it('creates a valid default snapshot', () => {
      const snapshot = createMockLessonsLearnedSnapshot();
      expect(snapshot.snapshotId).toBeTruthy();
      expect(snapshot.entryCount).toBe(1);
      expect(snapshot.entries).toHaveLength(1);
    });

    it('accepts overrides', () => {
      const snapshot = createMockLessonsLearnedSnapshot({ entryCount: 5 });
      expect(snapshot.entryCount).toBe(5);
    });
  });
});

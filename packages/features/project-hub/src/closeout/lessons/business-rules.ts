/**
 * P3-E10-T05 Lessons Learned Operating Model business rules.
 * Impact magnitude derivation, recommendation validation, workflow rules, snapshot aggregation.
 */

import type { ImpactMagnitude, LessonCategory } from './enums.js';
import type { IImpactDerivationResult, ILessonAggregateStats, ILessonSnapshotEntry, IRecommendationValidationResult } from './types.js';
import { APPROVED_ACTION_VERBS, IMPACT_MAGNITUDE_THRESHOLDS } from './constants.js';

// -- Impact Magnitude Derivation (§3) ---------------------------------------

/** Magnitude ordering for multi-signal comparison. */
const MAGNITUDE_ORDER: Readonly<Record<ImpactMagnitude, number>> = {
  Minor: 0,
  Moderate: 1,
  Significant: 2,
  Critical: 3,
};

/**
 * Extracts a dollar amount from impact text per T05 §3.1.
 * Matches patterns like "$50,000", "$50K", "$1.5M", "$1.5 million", "50 thousand dollars".
 * Returns the amount in dollars, or null if no cost signal found.
 */
export const extractCostSignal = (text: string): number | null => {
  // Match $N patterns with optional commas and decimals.
  // Multiplier patterns (M/K/million/thousand) must be checked before bare $N.
  const dollarPatterns = [
    /\$\s*([\d,]+(?:\.\d+)?)\s*(?:million)\b/i,
    /\$\s*([\d,]+(?:\.\d+)?)\s*(?:thousand)\b/i,
    /\$\s*([\d,]+(?:\.\d+)?)([mk])\b/i,
    /([\d,]+(?:\.\d+)?)\s*(?:million)\s*dollars/i,
    /([\d,]+(?:\.\d+)?)\s*(?:thousand)\s*dollars/i,
    /([\d,]+(?:\.\d+)?)\s*dollars/i,
    /\$\s*([\d,]+(?:\.\d+)?)\b/i,
  ];

  for (const pattern of dollarPatterns) {
    const match = text.match(pattern);
    if (match) {
      const raw = parseFloat(match[1].replace(/,/g, ''));
      if (isNaN(raw)) continue;
      const lowerContext = match[0].toLowerCase();
      // Check for explicit multiplier suffix
      if (lowerContext.includes('million')) return raw * 1_000_000;
      if (lowerContext.includes('thousand')) return raw * 1_000;
      // Check for M/K single-letter suffix (captured in group 2 by the $N[mk] pattern)
      if (match[2]) {
        const suffix = match[2].toLowerCase();
        if (suffix === 'm') return raw * 1_000_000;
        if (suffix === 'k') return raw * 1_000;
      }
      return raw;
    }
  }
  return null;
};

/**
 * Extracts a schedule duration in calendar days from impact text per T05 §3.1.
 * Matches patterns like "15 days", "3 weeks", "2 calendar days".
 * Weeks are converted at ×5 for working days per spec.
 * Returns days, or null if no schedule signal found.
 */
export const extractScheduleSignal = (text: string): number | null => {
  const weekMatch = text.match(/(\d+)\s*weeks?\b/i);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 5;

  const dayMatch = text.match(/(\d+)\s*(?:calendar\s+)?days?\b/i);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  return null;
};

/**
 * Returns the impact magnitude for a cost amount per T05 §3.2.
 */
export const getMagnitudeForCost = (amount: number): ImpactMagnitude => {
  for (const t of IMPACT_MAGNITUDE_THRESHOLDS) {
    if (t.costMax === null) return t.magnitude;
    if (amount >= t.costMin && amount <= t.costMax) return t.magnitude;
  }
  return 'Critical';
};

/**
 * Returns the impact magnitude for a schedule duration per T05 §3.2.
 */
export const getMagnitudeForSchedule = (days: number): ImpactMagnitude => {
  for (const t of IMPACT_MAGNITUDE_THRESHOLDS) {
    if (t.scheduleDaysMax === null) return t.magnitude;
    if (days >= t.scheduleDaysMin && days <= t.scheduleDaysMax) return t.magnitude;
  }
  return 'Critical';
};

/**
 * Resolves multi-signal magnitude per T05 §3: higher magnitude governs.
 */
export const resolveMultiSignalMagnitude = (
  costMag: ImpactMagnitude | null,
  scheduleMag: ImpactMagnitude | null,
): ImpactMagnitude | null => {
  if (costMag === null && scheduleMag === null) return null;
  if (costMag === null) return scheduleMag;
  if (scheduleMag === null) return costMag;
  return MAGNITUDE_ORDER[costMag] >= MAGNITUDE_ORDER[scheduleMag] ? costMag : scheduleMag;
};

/**
 * Derives impact magnitude from impact text per T05 §3.
 * Returns null if no cost or schedule signals found (422 at API boundary).
 */
export const deriveImpactMagnitude = (impactText: string): IImpactDerivationResult => {
  const costSignal = extractCostSignal(impactText);
  const scheduleSignal = extractScheduleSignal(impactText);

  const costMag = costSignal !== null ? getMagnitudeForCost(costSignal) : null;
  const scheduleMag = scheduleSignal !== null ? getMagnitudeForSchedule(scheduleSignal) : null;
  const multiSignalApplied = costMag !== null && scheduleMag !== null;

  return {
    derivedMagnitude: resolveMultiSignalMagnitude(costMag, scheduleMag),
    costSignal,
    scheduleSignal,
    multiSignalApplied,
  };
};

// -- Recommendation Validation (§4) -----------------------------------------

/**
 * Checks if recommendation starts with an approved action verb per T05 §4.
 * Case-insensitive check against the controlled verb list.
 */
export const isRecommendationActionVerbValid = (recommendation: string): boolean => {
  const trimmed = recommendation.trim();
  if (trimmed.length === 0) return false;
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
  return APPROVED_ACTION_VERBS.has(firstWord);
};

/**
 * Returns validation error message or null if valid per T05 §4.
 */
export const getRecommendationValidationError = (recommendation: string): string | null => {
  if (isRecommendationActionVerbValid(recommendation)) return null;
  return "Recommendation must begin with an action verb (e.g., 'Establish...', 'Require...', 'Implement...'). Revise the recommendation to start with a directive.";
};

// -- Workflow Rules (§5, §6) ------------------------------------------------

/**
 * Lesson entries may be created at any project lifecycle state per T05 §6 rule 1.
 */
export const canCreateLessonEntry = (): true => true;

/**
 * Report may be submitted when >= 1 entry linked and 0 unlinked per T05 §6 rules 3-4.
 */
export const canSubmitLessonsReport = (
  linkedEntryCount: number,
  unlinkedEntryCount: number,
): boolean => linkedEntryCount >= 1 && unlinkedEntryCount === 0;

/**
 * One report per project is always enforced per T05 §6 rule 2.
 */
export const isOneReportPerProjectEnforced = (): true => true;

/**
 * Normalizes keywords: lowercase, trim, deduplicate per T05 §6 rule 8.
 */
export const normalizeKeywords = (keywords: readonly string[]): readonly string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const kw of keywords) {
    const normalized = kw.trim().toLowerCase();
    if (normalized.length > 0 && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  return result;
};

// -- Snapshot Aggregation (§7) ----------------------------------------------

/**
 * Calculates aggregate statistics for a lessons snapshot per T05 §7.
 */
export const calculateAggregateStats = (
  entries: ReadonlyArray<ILessonSnapshotEntry>,
): ILessonAggregateStats => {
  const categoryCounts = {} as Record<LessonCategory, number>;
  const magnitudeCounts = {} as Record<ImpactMagnitude, number>;
  let highApplicabilityCount = 0;
  let criticalAndSignificantCount = 0;

  // Initialize counts
  const allCategories: LessonCategory[] = [
    'PreConstruction', 'EstimatingBid', 'Procurement', 'Schedule', 'CostBudget',
    'Safety', 'Quality', 'Subcontractors', 'DesignRFIs', 'OwnerClient',
    'TechnologyBIM', 'WorkforceLabor', 'Commissioning', 'CloseoutTurnover', 'Other',
  ];
  for (const cat of allCategories) categoryCounts[cat] = 0;

  const allMagnitudes: ImpactMagnitude[] = ['Minor', 'Moderate', 'Significant', 'Critical'];
  for (const mag of allMagnitudes) magnitudeCounts[mag] = 0;

  for (const entry of entries) {
    categoryCounts[entry.category] = (categoryCounts[entry.category] ?? 0) + 1;
    magnitudeCounts[entry.impactMagnitude] = (magnitudeCounts[entry.impactMagnitude] ?? 0) + 1;
    if (entry.applicability >= 4) highApplicabilityCount++;
    if (entry.impactMagnitude === 'Critical' || entry.impactMagnitude === 'Significant') {
      criticalAndSignificantCount++;
    }
  }

  return {
    categoryCounts,
    magnitudeCounts,
    highApplicabilityCount,
    criticalAndSignificantCount,
  };
};

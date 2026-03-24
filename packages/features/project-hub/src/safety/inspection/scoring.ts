/**
 * P3-E8-T04 Inspection normalized scoring algorithm (§4.1).
 * Pure function — no side effects, deterministic.
 */

import type { IInspectionSectionResponse } from '../records/types.js';
import type { ISectionScoringWeight } from '../records/types.js';
import type { IInspectionScoringResult } from './types.js';
import { NORMALIZED_SCORE_PRECISION } from './constants.js';

/**
 * §4.1: Calculate normalized inspection score from section responses and weights.
 *
 * Algorithm:
 * 1. Filter to applicable sections only
 * 2. If no applicable sections → return all zeros
 * 3. Renormalize weights for applicable sections to sum to 100
 * 4. Per section: (passCount / applicableItemCount) × renormalizedWeight
 * 5. normalizedScore = (rawScore / maxPossibleScore) × 100, rounded to 1dp
 */
export const calculateNormalizedScore = (
  sectionResponses: readonly IInspectionSectionResponse[],
  scoringWeights: readonly ISectionScoringWeight[],
): IInspectionScoringResult => {
  // Step 1: Filter to applicable sections
  const applicableSections = sectionResponses.filter((s) => s.isApplicable);
  const applicableSectionCount = applicableSections.length;

  if (applicableSectionCount === 0) {
    return { applicableSectionCount: 0, rawScore: 0, maxPossibleScore: 0, normalizedScore: 0 };
  }

  // Step 2: Get weights for applicable sections
  const applicableWeights = applicableSections.map((section) => {
    const weightEntry = scoringWeights.find((w) => w.sectionKey === section.sectionKey);
    return { sectionKey: section.sectionKey, weight: weightEntry?.weight ?? 0 };
  });

  // Step 3: Sum applicable weights and renormalize
  const totalApplicableWeight = applicableWeights.reduce((sum, w) => sum + w.weight, 0);

  if (totalApplicableWeight === 0) {
    return { applicableSectionCount, rawScore: 0, maxPossibleScore: 0, normalizedScore: 0 };
  }

  // Step 4: Score each applicable section
  let rawScore = 0;
  let maxPossibleScore = 0;

  for (const section of applicableSections) {
    const weightEntry = applicableWeights.find((w) => w.sectionKey === section.sectionKey);
    const renormalizedWeight = ((weightEntry?.weight ?? 0) / totalApplicableWeight) * 100;

    // Count applicable items (exclude N_A responses)
    const applicableItems = section.itemResponses.filter((item) => item.response !== 'N_A');
    const passCount = applicableItems.filter((item) => item.response === 'PASS').length;
    const applicableItemCount = applicableItems.length;

    if (applicableItemCount > 0) {
      const sectionScore = (passCount / applicableItemCount) * renormalizedWeight;
      rawScore += sectionScore;
    }

    maxPossibleScore += renormalizedWeight;
  }

  // Step 5: Normalize and round
  const normalizedScore = maxPossibleScore > 0
    ? Math.round(((rawScore / maxPossibleScore) * 100) * Math.pow(10, NORMALIZED_SCORE_PRECISION)) / Math.pow(10, NORMALIZED_SCORE_PRECISION)
    : 0;

  return { applicableSectionCount, rawScore, maxPossibleScore, normalizedScore };
};

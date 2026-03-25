import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  SECTION_SOURCE_MODULES,
  ROLLUP_FORMULA_TYPES,
  SUB_SCORECARD_SECTIONS,
  PERFORMANCE_RATING_BANDS,
  REPORT_LESSON_CATEGORIES,
  REPORT_IMPACT_MAGNITUDES,
  // Label maps
  SECTION_SOURCE_MODULE_LABELS,
  ROLLUP_FORMULA_TYPE_LABELS,
  PERFORMANCE_RATING_BAND_LABELS,
  REPORT_IMPACT_MAGNITUDE_LABELS,
  // Constants
  PX_REVIEW_SECTION_MAP,
  OWNER_REPORT_SECTION_MAP,
  ROLLUP_FORMULA_DEFINITIONS,
  SUB_SCORECARD_SECTION_WEIGHTS,
  PERFORMANCE_RATING_THRESHOLDS,
  REPORT_IMPACT_MAGNITUDE_THRESHOLDS,
  CONTENT_TYPE_PROHIBITIONS,
  SUB_SCORECARD_INGESTION_CONTRACT,
  LESSONS_LEARNED_INGESTION_CONTRACT,
  // Business rules
  doesReportsComputeSubScorecardScores,
  doesReportsModifyLessonsData,
  isCustomDataBindingAllowed,
  isFormulaOverrideAllowed,
  isPmCrossSectionAggregationAllowed,
  isRollupFormulaGovernedByMoe,
  getPerformanceRatingForScore,
  doSubScorecardWeightsSumToOne,
  getSectionSourceBinding,
  isPxReviewSectionLocked,
  isOwnerReportSectionConfigurable,
  isConnectorDataAccessedDirectly,
  getReportImpactMagnitudeForCost,
  isSourceModuleSnapshotRequiredForGeneration,
  // Types (import-only checks)
  type ISectionSourceBinding,
  type IRollupFormulaDefinition,
  type ISubScorecardSectionWeight,
  type IPerformanceRatingThreshold,
} from '../index.js';

// =============================================================================
// Contract Stability
// =============================================================================

describe('P3-E9-T06 section-sources — contract stability', () => {
  // -- Enum array lengths -----------------------------------------------------

  it('SECTION_SOURCE_MODULES has 8 members', () => {
    expect(SECTION_SOURCE_MODULES).toHaveLength(8);
  });

  it('ROLLUP_FORMULA_TYPES has 5 members', () => {
    expect(ROLLUP_FORMULA_TYPES).toHaveLength(5);
  });

  it('SUB_SCORECARD_SECTIONS has 6 members', () => {
    expect(SUB_SCORECARD_SECTIONS).toHaveLength(6);
  });

  it('PERFORMANCE_RATING_BANDS has 5 members', () => {
    expect(PERFORMANCE_RATING_BANDS).toHaveLength(5);
  });

  it('LESSON_CATEGORIES has 16 members', () => {
    expect(REPORT_LESSON_CATEGORIES).toHaveLength(16);
  });

  it('REPORT_IMPACT_MAGNITUDES has 4 members', () => {
    expect(REPORT_IMPACT_MAGNITUDES).toHaveLength(4);
  });

  // -- Label map key counts ---------------------------------------------------

  it('SECTION_SOURCE_MODULE_LABELS has 8 keys', () => {
    expect(Object.keys(SECTION_SOURCE_MODULE_LABELS)).toHaveLength(8);
  });

  it('ROLLUP_FORMULA_TYPE_LABELS has 5 keys', () => {
    expect(Object.keys(ROLLUP_FORMULA_TYPE_LABELS)).toHaveLength(5);
  });

  it('PERFORMANCE_RATING_BAND_LABELS has 5 keys', () => {
    expect(Object.keys(PERFORMANCE_RATING_BAND_LABELS)).toHaveLength(5);
  });

  it('REPORT_IMPACT_MAGNITUDE_LABELS has 4 keys', () => {
    expect(Object.keys(REPORT_IMPACT_MAGNITUDE_LABELS)).toHaveLength(4);
  });

  // -- Section maps -----------------------------------------------------------

  it('PX_REVIEW_SECTION_MAP has 9 sections', () => {
    expect(PX_REVIEW_SECTION_MAP).toHaveLength(9);
  });

  it('OWNER_REPORT_SECTION_MAP has 7 sections', () => {
    expect(OWNER_REPORT_SECTION_MAP).toHaveLength(7);
  });

  // -- Rollup definitions -----------------------------------------------------

  it('ROLLUP_FORMULA_DEFINITIONS has 5 formulas', () => {
    expect(ROLLUP_FORMULA_DEFINITIONS).toHaveLength(5);
  });

  it('all rollup formulas are governed by MOE', () => {
    for (const def of ROLLUP_FORMULA_DEFINITIONS) {
      expect(def.isGovernedByMoe).toBe(true);
    }
  });

  // -- Sub scorecard weights --------------------------------------------------

  it('SUB_SCORECARD_SECTION_WEIGHTS has 6 sections', () => {
    expect(SUB_SCORECARD_SECTION_WEIGHTS).toHaveLength(6);
  });

  it('sub scorecard weights sum to 1.0', () => {
    const sum = SUB_SCORECARD_SECTION_WEIGHTS.reduce((acc, w) => acc + w.weight, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
  });

  // -- Performance rating thresholds ------------------------------------------

  it('PERFORMANCE_RATING_THRESHOLDS has 5 bands', () => {
    expect(PERFORMANCE_RATING_THRESHOLDS).toHaveLength(5);
  });

  // -- Impact magnitude thresholds --------------------------------------------

  it('REPORT_IMPACT_MAGNITUDE_THRESHOLDS has 4 magnitudes', () => {
    expect(REPORT_IMPACT_MAGNITUDE_THRESHOLDS).toHaveLength(4);
  });

  // -- Content type prohibitions ----------------------------------------------

  it('CONTENT_TYPE_PROHIBITIONS has 4 prohibitions', () => {
    expect(CONTENT_TYPE_PROHIBITIONS).toHaveLength(4);
  });

  // -- Ingestion contracts ----------------------------------------------------

  it('SUB_SCORECARD_INGESTION_CONTRACT.reportsComputesScores is false', () => {
    expect(SUB_SCORECARD_INGESTION_CONTRACT.reportsComputesScores).toBe(false);
  });

  it('LESSONS_LEARNED_INGESTION_CONTRACT.reportsModifiesData is false', () => {
    expect(LESSONS_LEARNED_INGESTION_CONTRACT.reportsModifiesData).toBe(false);
  });

  // -- Type checks (compile-time, runtime shape validation) -------------------

  it('ISectionSourceBinding shape is correct', () => {
    const binding: ISectionSourceBinding = {
      sectionKey: 'test',
      familyKey: 'PX_REVIEW',
      sourceModule: null,
      contentType: 'MODULE_SNAPSHOT',
      snapshotApiRef: null,
      rollupFormulaRef: null,
    };
    expect(binding.sectionKey).toBe('test');
  });

  it('IRollupFormulaDefinition shape is correct', () => {
    const def: IRollupFormulaDefinition = {
      formulaType: 'FINANCIAL_SUMMARY',
      displayName: 'Test',
      sourceModules: ['FINANCIAL'],
      isGovernedByMoe: true,
      formulaDescription: 'Test formula',
    };
    expect(def.formulaType).toBe('FINANCIAL_SUMMARY');
  });

  it('ISubScorecardSectionWeight shape is correct', () => {
    const weight: ISubScorecardSectionWeight = {
      section: 'SAFETY',
      weight: 0.2,
      criterionCount: 5,
    };
    expect(weight.section).toBe('SAFETY');
  });

  it('IPerformanceRatingThreshold shape is correct', () => {
    const threshold: IPerformanceRatingThreshold = {
      band: 'EXCEPTIONAL',
      minScore: 4.5,
      maxScore: 5.0,
    };
    expect(threshold.band).toBe('EXCEPTIONAL');
  });
});

// =============================================================================
// Business Rules
// =============================================================================

describe('P3-E9-T06 section-sources — business rules', () => {
  // -- Prohibition rules ------------------------------------------------------

  it('doesReportsComputeSubScorecardScores returns false', () => {
    expect(doesReportsComputeSubScorecardScores()).toBe(false);
  });

  it('doesReportsModifyLessonsData returns false', () => {
    expect(doesReportsModifyLessonsData()).toBe(false);
  });

  it('isCustomDataBindingAllowed returns false', () => {
    expect(isCustomDataBindingAllowed()).toBe(false);
  });

  it('isFormulaOverrideAllowed returns false', () => {
    expect(isFormulaOverrideAllowed()).toBe(false);
  });

  it('isPmCrossSectionAggregationAllowed returns false', () => {
    expect(isPmCrossSectionAggregationAllowed()).toBe(false);
  });

  // -- Rollup governance ------------------------------------------------------

  it('isRollupFormulaGovernedByMoe returns true for FINANCIAL_SUMMARY', () => {
    expect(isRollupFormulaGovernedByMoe('FINANCIAL_SUMMARY')).toBe(true);
  });

  it('isRollupFormulaGovernedByMoe returns true for SCHEDULE_SUMMARY', () => {
    expect(isRollupFormulaGovernedByMoe('SCHEDULE_SUMMARY')).toBe(true);
  });

  it('isRollupFormulaGovernedByMoe returns true for SAFETY_SUMMARY', () => {
    expect(isRollupFormulaGovernedByMoe('SAFETY_SUMMARY')).toBe(true);
  });

  it('isRollupFormulaGovernedByMoe returns true for BUDGET_STATUS', () => {
    expect(isRollupFormulaGovernedByMoe('BUDGET_STATUS')).toBe(true);
  });

  it('isRollupFormulaGovernedByMoe returns true for MILESTONE_PROGRESS', () => {
    expect(isRollupFormulaGovernedByMoe('MILESTONE_PROGRESS')).toBe(true);
  });

  // -- Performance rating derivation ------------------------------------------

  it('getPerformanceRatingForScore 4.7 → EXCEPTIONAL', () => {
    expect(getPerformanceRatingForScore(4.7)).toBe('EXCEPTIONAL');
  });

  it('getPerformanceRatingForScore 4.0 → ABOVE_AVERAGE', () => {
    expect(getPerformanceRatingForScore(4.0)).toBe('ABOVE_AVERAGE');
  });

  it('getPerformanceRatingForScore 3.0 → SATISFACTORY', () => {
    expect(getPerformanceRatingForScore(3.0)).toBe('SATISFACTORY');
  });

  it('getPerformanceRatingForScore 2.0 → BELOW_AVERAGE', () => {
    expect(getPerformanceRatingForScore(2.0)).toBe('BELOW_AVERAGE');
  });

  it('getPerformanceRatingForScore 1.2 → UNSATISFACTORY', () => {
    expect(getPerformanceRatingForScore(1.2)).toBe('UNSATISFACTORY');
  });

  it('getPerformanceRatingForScore 5.0 → EXCEPTIONAL (boundary)', () => {
    expect(getPerformanceRatingForScore(5.0)).toBe('EXCEPTIONAL');
  });

  it('getPerformanceRatingForScore 1.0 → UNSATISFACTORY (boundary)', () => {
    expect(getPerformanceRatingForScore(1.0)).toBe('UNSATISFACTORY');
  });

  // -- Sub scorecard weight validation ----------------------------------------

  it('doSubScorecardWeightsSumToOne returns true', () => {
    expect(doSubScorecardWeightsSumToOne()).toBe(true);
  });

  // -- Section source binding lookup ------------------------------------------

  it('getSectionSourceBinding returns binding for PX_REVIEW financial-summary', () => {
    const binding = getSectionSourceBinding('PX_REVIEW', 'financial-summary');
    expect(binding).not.toBeNull();
    expect(binding!.contentType).toBe('CALCULATED_ROLLUP');
  });

  it('getSectionSourceBinding returns null for PX_REVIEW unknown section', () => {
    expect(getSectionSourceBinding('PX_REVIEW', 'unknown')).toBeNull();
  });

  // -- PX Review lock ---------------------------------------------------------

  it('isPxReviewSectionLocked returns true', () => {
    expect(isPxReviewSectionLocked()).toBe(true);
  });

  // -- Owner report configurability -------------------------------------------

  it('isOwnerReportSectionConfigurable returns true for open-items', () => {
    expect(isOwnerReportSectionConfigurable('open-items')).toBe(true);
  });

  it('isOwnerReportSectionConfigurable returns true for owner-narrative', () => {
    expect(isOwnerReportSectionConfigurable('owner-narrative')).toBe(true);
  });

  it('isOwnerReportSectionConfigurable returns false for project-status-summary', () => {
    expect(isOwnerReportSectionConfigurable('project-status-summary')).toBe(false);
  });

  // -- Connector data access --------------------------------------------------

  it('isConnectorDataAccessedDirectly returns false', () => {
    expect(isConnectorDataAccessedDirectly()).toBe(false);
  });

  // -- Impact magnitude derivation --------------------------------------------

  it('getReportImpactMagnitudeForCost 5000 → MINOR', () => {
    expect(getReportImpactMagnitudeForCost(5000)).toBe('MINOR');
  });

  it('getReportImpactMagnitudeForCost 50000 → MODERATE', () => {
    expect(getReportImpactMagnitudeForCost(50000)).toBe('MODERATE');
  });

  it('getReportImpactMagnitudeForCost 500000 → SIGNIFICANT', () => {
    expect(getReportImpactMagnitudeForCost(500000)).toBe('SIGNIFICANT');
  });

  it('getReportImpactMagnitudeForCost 2000000 → CRITICAL', () => {
    expect(getReportImpactMagnitudeForCost(2000000)).toBe('CRITICAL');
  });

  // -- Source module snapshot requirement -------------------------------------

  it('isSourceModuleSnapshotRequiredForGeneration returns true', () => {
    expect(isSourceModuleSnapshotRequiredForGeneration()).toBe(true);
  });
});

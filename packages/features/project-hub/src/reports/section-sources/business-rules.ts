/**
 * P3-E9-T06 reports section-sources business rules.
 * Content type enforcement, rollup governance, ingestion ownership, performance rating derivation.
 */

import type { ReportImpactMagnitude, PerformanceRatingBand, RollupFormulaType } from './enums.js';
import type { ISectionSourceBinding } from './types.js';
import {
  OWNER_REPORT_SECTION_MAP,
  PERFORMANCE_RATING_THRESHOLDS,
  PX_REVIEW_SECTION_MAP,
  ROLLUP_FORMULA_DEFINITIONS,
  SUB_SCORECARD_SECTION_WEIGHTS,
} from './constants.js';

// -- Ingestion Ownership Rules ------------------------------------------------

/** Reports module never computes sub scorecard scores — P3-E10 owns scoring. */
export const doesReportsComputeSubScorecardScores = (): false => false;

/** Reports module never modifies lessons learned data — P3-E10 owns data. */
export const doesReportsModifyLessonsData = (): false => false;

// -- Content Type Prohibitions ------------------------------------------------

/** Custom data bindings are not allowed per LD-REP-08. */
export const isCustomDataBindingAllowed = (): false => false;

/** Rollup formula overrides are not allowed per LD-REP-08. */
export const isFormulaOverrideAllowed = (): false => false;

/** PM cross-section aggregation is not allowed per LD-REP-08. */
export const isPmCrossSectionAggregationAllowed = (): false => false;

// -- Rollup Governance --------------------------------------------------------

/** Returns whether a rollup formula is governed by MOE. */
export const isRollupFormulaGovernedByMoe = (formula: RollupFormulaType): boolean =>
  ROLLUP_FORMULA_DEFINITIONS.some((d) => d.formulaType === formula && d.isGovernedByMoe);

// -- Performance Rating Derivation --------------------------------------------

/** Returns the performance rating band for a given numeric score. */
export const getPerformanceRatingForScore = (score: number): PerformanceRatingBand => {
  for (const threshold of PERFORMANCE_RATING_THRESHOLDS) {
    if (score >= threshold.minScore && score <= threshold.maxScore) return threshold.band;
  }
  return 'UNSATISFACTORY'; // fallback for out-of-range
};

// -- Sub Scorecard Weight Validation ------------------------------------------

/** Returns whether sub scorecard section weights sum to 1.0. */
export const doSubScorecardWeightsSumToOne = (): boolean => {
  const sum = SUB_SCORECARD_SECTION_WEIGHTS.reduce((acc, w) => acc + w.weight, 0);
  return Math.abs(sum - 1.0) < 0.001;
};

// -- Section Source Binding Lookup --------------------------------------------

/** Returns the section source binding for a given family and section key. */
export const getSectionSourceBinding = (familyKey: string, sectionKey: string): ISectionSourceBinding | null => {
  if (familyKey === 'PX_REVIEW') {
    const section = PX_REVIEW_SECTION_MAP.find((s) => s.sectionKey === sectionKey);
    if (section) {
      return {
        sectionKey,
        familyKey,
        sourceModule: null,
        contentType: section.contentType,
        snapshotApiRef: null,
        rollupFormulaRef: null,
      };
    }
  }
  if (familyKey === 'OWNER_REPORT') {
    const section = OWNER_REPORT_SECTION_MAP.find((s) => s.sectionKey === sectionKey);
    if (section) {
      return {
        sectionKey,
        familyKey,
        sourceModule: null,
        contentType: section.contentType,
        snapshotApiRef: null,
        rollupFormulaRef: null,
      };
    }
  }
  return null;
};

// -- PX Review Lock -----------------------------------------------------------

/** PX Review section structure is always locked. */
export const isPxReviewSectionLocked = (): true => true;

// -- Owner Report Configurability ---------------------------------------------

/** Returns whether an owner report section is project-configurable. */
export const isOwnerReportSectionConfigurable = (sectionKey: string): boolean => {
  const section = OWNER_REPORT_SECTION_MAP.find((s) => s.sectionKey === sectionKey);
  return section !== undefined && section.isProjectConfigurable;
};

// -- Connector Data Access ----------------------------------------------------

/** Connector data is never accessed directly — always via snapshot. */
export const isConnectorDataAccessedDirectly = (): false => false;

// -- Impact Magnitude Derivation ----------------------------------------------

/** Returns the impact magnitude for a given USD cost value. */
export const getReportImpactMagnitudeForCost = (costUsd: number): ReportImpactMagnitude => {
  if (costUsd > 1_000_000) return 'CRITICAL';
  if (costUsd > 100_000) return 'SIGNIFICANT';
  if (costUsd > 10_000) return 'MODERATE';
  return 'MINOR';
};

// -- Source Module Snapshot Requirement ----------------------------------------

/** Source module snapshots are always required for report generation. */
export const isSourceModuleSnapshotRequiredForGeneration = (): true => true;

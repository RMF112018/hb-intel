/**
 * P3-E15-T10 Stage 8 Project QC Module health-scorecards business rules.
 */

import type {
  AnalysisMandatoryReason,
  ConfidenceTier,
  LearningCandidateState,
  QualityStatusBand,
} from './enums.js';
import type { RecurrenceClassification } from '../record-families/enums.js';
import {
  QC_ANALYSIS_MANDATORY_REASONS,
  LEARNING_PIPELINE_VALID_TRANSITIONS,
} from './constants.js';

// -- Immutability and Editability Rules ----------------------------------------

/** Quality health snapshots are always immutable once computed. */
export const isQualityHealthSnapshotImmutable = (): true => true;

/** Enterprise rollup projections are not directly editable by projects. */
export const isEnterpriseRollupProjectEditable = (): false => false;

// -- Governance Rules -----------------------------------------------------------

/** Scorecard formulas are governed by MOE. */
export const isScorecardFormulasMoeGoverned = (): true => true;

/** Projects cannot override scorecard formulas. */
export const canProjectOverrideScorecardFormula = (): false => false;

// -- Root Cause Analysis --------------------------------------------------------

/** Determines if root cause analysis is mandatory for the given reason. */
export const isRootCauseAnalysisMandatory = (reason: AnalysisMandatoryReason): boolean =>
  (QC_ANALYSIS_MANDATORY_REASONS as readonly string[]).includes(reason);

// -- Learning Pipeline ----------------------------------------------------------

/** A learning candidate is publishable only when MOE-approved. */
export const isLearningCandidatePublishable = (state: LearningCandidateState): boolean =>
  state === 'MOE_APPROVED';

/** Projects cannot directly publish learning candidates. */
export const canProjectPublishLearningCandidate = (): false => false;

/** Validates a learning candidate state transition. */
export const isValidLearningTransition = (
  from: LearningCandidateState,
  to: LearningCandidateState,
): boolean => LEARNING_PIPELINE_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

// -- Score Band Resolution ------------------------------------------------------

/** Resolves a numeric score and confidence tier to a quality status band. */
export const getStatusBandForScore = (
  score: number,
  confidenceTier: ConfidenceTier,
): QualityStatusBand => {
  if (confidenceTier === 'INSUFFICIENT_DATA') return 'DATA_PENDING';
  if (score <= 20) return 'CRITICAL';
  if (score <= 40) return 'AT_RISK';
  if (score <= 60) return 'WATCH';
  return 'HEALTHY';
};

/** Confidence is sufficient when HIGH or MODERATE. */
export const isConfidenceSufficient = (tier: ConfidenceTier): boolean =>
  tier === 'HIGH' || tier === 'MODERATE';

// -- Snapshot and Rollup Rules --------------------------------------------------

/** Rollup inputs are frozen per snapshot and cannot be edited after computation. */
export const isRollupInputFrozenPerSnapshot = (): true => true;

/** Scorecard drilldowns must navigate back to source records. */
export const mustScorecardDrillBackToSource = (): true => true;

/** The default weighting philosophy is leading-dominant. */
export const isWeightingLeadingDominant = (): true => true;

/** Health projections cannot be directly edited by projects. */
export const canHealthProjectionBeDirectlyEdited = (): false => false;

// -- Enterprise Recurrence Eligibility ------------------------------------------

/** Determines if a recurrence classification qualifies for enterprise escalation. */
export const isRecurrenceEnterpriseEligible = (
  classification: RecurrenceClassification,
): boolean => classification === 'REPEAT_ENTERPRISE_CANDIDATE';

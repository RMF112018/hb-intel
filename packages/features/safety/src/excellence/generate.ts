/**
 * Top-level orchestrator for Safety Field Excellence candidate scoring.
 *
 * Pure-domain pipeline: input domain models → fully populated
 * `SafetyExcellenceCandidateScore`. Backend Prompt 03 will call this with
 * data assembled from the Function App; the publish workflow in Prompt 04
 * persists the result into `Safety Field Excellence Candidate Scores`.
 */

import {
  averageAcceptedPercent,
  partitionInspections,
  totalNoAcrossAccepted,
} from './inspectionFiltering.js';
import { computeActivityExposureScore, deriveActivityEvidence } from './exposure.js';
import { computeCorrectiveActionScore, summarizeFindings } from './correctiveActions.js';
import { computeDataQualityScore } from './dataQuality.js';
import { computeConsistencyTrendScore } from './consistency.js';
import {
  computeCompositeScore,
  computeSafetyPerformanceScore,
  roundToHundredths,
} from './scoring.js';
import { evaluateEligibility } from './eligibility.js';
import { buildReasonSummary } from './narrative.js';
import {
  EXCELLENCE_GENERATOR_VERSION,
  type SafetyExcellenceCandidateInput,
  type SafetyExcellenceCandidateScore,
} from './types.js';

export function generateCandidateScore(
  input: SafetyExcellenceCandidateInput,
): SafetyExcellenceCandidateScore {
  const partition = partitionInspections(input.inspections);
  const inspectionCountWindow = partition.accepted.length;
  const inspectionCountRolling = partitionInspections(input.priorInspections).accepted.length;

  const safetyPerformanceScore = computeSafetyPerformanceScore(partition.accepted);
  const consistency = computeConsistencyTrendScore(partition.accepted, input.priorInspections);
  const evidence = deriveActivityEvidence(input);
  const exposure = computeActivityExposureScore(input, evidence, inspectionCountWindow);
  const summary = summarizeFindings(
    input.findings,
    input.priorFindings,
    input.projectWeek.projectNumber,
  );
  const corrective = computeCorrectiveActionScore(summary);
  const dataQuality = computeDataQualityScore(input.inspections, partition);

  const compositeRaw = computeCompositeScore({
    safetyPerformance: safetyPerformanceScore,
    consistencyTrend: consistency.score,
    activityExposure: exposure.score,
    correctiveAction: corrective.score,
    dataQuality: dataQuality.score,
  });

  const composite = roundToHundredths(compositeRaw);
  const averageInspectionScoreWindow =
    consistency.averageInspectionScoreWindow === null
      ? null
      : roundToHundredths(consistency.averageInspectionScoreWindow);
  const averageInspectionScoreRolling =
    consistency.averageInspectionScoreRolling === null
      ? null
      : roundToHundredths(consistency.averageInspectionScoreRolling);

  const narrative = buildReasonSummary({
    projectNumber: input.projectWeek.projectNumber,
    projectNameSnapshot: input.projectWeek.projectNameSnapshot,
    composite,
    parts: {
      safetyPerformance: safetyPerformanceScore,
      consistencyTrend: consistency.score,
      activityExposure: exposure.score,
      correctiveAction: corrective.score,
      dataQuality: dataQuality.score,
    },
    consistency,
    summary,
    evidence,
    inspectionCountWindow,
  });

  const totalNo = totalNoAcrossAccepted(partition.accepted);

  const eligibility = evaluateEligibility({
    input,
    partition,
    summary,
    evidence,
    dataQuality,
    composite,
    inspectionCountWindow,
    averageInspectionScoreWindow:
      averageInspectionScoreWindow !== null && Math.abs(averageInspectionScoreWindow - 100) < 1e-6
        ? 100
        : averageInspectionScoreWindow,
    totalNoAcrossAccepted: totalNo,
    hasMultiSignal: narrative.hasMultiSignal,
  });

  const sourceInspectionIds = partition.accepted.map((event) => event.id);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const generatorVersion = input.generatorVersion ?? EXCELLENCE_GENERATOR_VERSION;

  return {
    eligibilityStatus: eligibility.status,
    exclusionReasons: eligibility.exclusionReasons,
    compositeScore: composite,
    safetyPerformanceScore: roundToHundredths(safetyPerformanceScore),
    consistencyTrendScore: roundToHundredths(consistency.score),
    activityExposureScore: roundToHundredths(exposure.score),
    correctiveActionScore: roundToHundredths(corrective.score),
    dataQualityScore: roundToHundredths(dataQuality.score),
    inspectionCountWindow,
    inspectionCountRolling,
    averageInspectionScoreWindow,
    averageInspectionScoreRolling,
    inspectionTrendPct:
      consistency.inspectionTrendPct === null
        ? null
        : roundToHundredths(consistency.inspectionTrendPct),
    highestRiskFindingLevel: summary.highestRiskFindingLevel,
    highSeverityFindingCount: summary.highSeverityFindingCount,
    mediumSeverityFindingCount: summary.mediumSeverityFindingCount,
    openFindingCount: summary.openFindingCount,
    agedOpenFindingCount: summary.agedOpenFindingCount,
    repeatFindingCount: summary.repeatFindingCount,
    activityEvidenceStatus: evidence.status,
    activityEvidenceJson: JSON.stringify(evidence),
    reasonSummary: narrative.reasonSummary,
    sourceInspectionIds,
    sourceFindingIds: summary.sourceFindingIds,
    generatedAt,
    generatorVersion,
    publishRecommendation: eligibility.recommendation,
  };
}

export { averageAcceptedPercent };

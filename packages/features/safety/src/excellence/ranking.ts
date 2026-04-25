/**
 * Deterministic ranking of Safety Field Excellence candidate scores.
 *
 * Demoted candidates (`ineligible`/`do-not-publish`) never outrank
 * eligible or low-confidence candidates, regardless of raw composite.
 */

import type {
  SafetyExcellenceCandidateScore,
  SafetyExcellenceEligibilityStatus,
  SafetyActivityEvidenceStatus,
} from './types.js';

const ELIGIBILITY_RANK: Record<SafetyExcellenceEligibilityStatus, number> = {
  eligible: 4,
  'low-confidence': 3,
  'needs-review': 2,
  ineligible: 1,
};

const EVIDENCE_RANK: Record<SafetyActivityEvidenceStatus, number> = {
  proven: 3,
  inferred: 2,
  missing: 1,
};

export function rankCandidates(
  scores: ReadonlyArray<SafetyExcellenceCandidateScore>,
): ReadonlyArray<SafetyExcellenceCandidateScore> {
  return [...scores].sort(compareCandidates);
}

function compareCandidates(
  a: SafetyExcellenceCandidateScore,
  b: SafetyExcellenceCandidateScore,
): number {
  // 1. Demoted (do-not-publish) always sinks below others.
  const aDemoted = a.publishRecommendation === 'do-not-publish';
  const bDemoted = b.publishRecommendation === 'do-not-publish';
  if (aDemoted !== bDemoted) return aDemoted ? 1 : -1;

  // 2. Eligibility group.
  const eligibilityDelta = ELIGIBILITY_RANK[b.eligibilityStatus] - ELIGIBILITY_RANK[a.eligibilityStatus];
  if (eligibilityDelta !== 0) return eligibilityDelta;

  // 3. Composite score.
  if (a.compositeScore !== b.compositeScore) return b.compositeScore - a.compositeScore;

  // 4. Activity evidence quality.
  const evidenceDelta =
    EVIDENCE_RANK[b.activityEvidenceStatus] - EVIDENCE_RANK[a.activityEvidenceStatus];
  if (evidenceDelta !== 0) return evidenceDelta;

  // 5. Fewer high-severity, open, and aged findings rank higher.
  const aRisk = a.highSeverityFindingCount + a.openFindingCount + a.agedOpenFindingCount;
  const bRisk = b.highSeverityFindingCount + b.openFindingCount + b.agedOpenFindingCount;
  if (aRisk !== bRisk) return aRisk - bRisk;

  // 6. Stronger rolling consistency / higher trend.
  const aRolling = a.averageInspectionScoreRolling ?? -1;
  const bRolling = b.averageInspectionScoreRolling ?? -1;
  if (aRolling !== bRolling) return bRolling - aRolling;

  const aTrend = a.inspectionTrendPct ?? Number.NEGATIVE_INFINITY;
  const bTrend = b.inspectionTrendPct ?? Number.NEGATIVE_INFINITY;
  if (aTrend !== bTrend) return bTrend - aTrend;

  // 7. Final tie-breaker: newer generatedAt wins.
  return b.generatedAt.localeCompare(a.generatedAt);
}

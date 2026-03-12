export type BenchmarkConfidenceTier = 'high' | 'moderate' | 'low' | 'insufficient';

export type SimilarityStrengthBand = 'highly-similar' | 'moderately-similar' | 'loosely-similar';

export type ScoreBenchmarkRecommendationState =
  | 'Pursue'
  | 'Pursue with Caution'
  | 'Hold for Review'
  | 'No-Bid Recommended';

export interface ScoreBenchmarkItem {
  id: string;
  label: string;
  score: number;
}

export interface ConfidenceAssessment {
  tier: BenchmarkConfidenceTier;
  reasons: readonly string[];
  sampleSize: number;
}

export interface SimilarityAssessment {
  score: number;
  band: SimilarityStrengthBand;
  comparablePursuitCount: number;
}

export interface RecommendationAssessment {
  state: ScoreBenchmarkRecommendationState;
  rationale: readonly string[];
}

export interface GovernanceAssessment {
  defaultCohortLocked: boolean;
  approvedCohortApplied: boolean;
  filterChangeLogged: boolean;
  warningTriggered: boolean;
}

export interface RecalibrationAssessment {
  predictiveValue: number;
  reviewedAtIso: string;
  telemetryWindow: string;
}

export interface ExplainabilityAssessment {
  summary: string;
  reasonCodes: readonly string[];
}

export interface ScoreBenchmarkPrimitiveSnapshot {
  confidence: ConfidenceAssessment;
  similarity: SimilarityAssessment;
  recommendation: RecommendationAssessment;
  governance: GovernanceAssessment;
  recalibration: RecalibrationAssessment;
  explainability: ExplainabilityAssessment;
}

export interface ScoreBenchmarkProfile {
  profileId: string;
  recommendationCutoffs: {
    pursue: number;
    pursueWithCaution: number;
    holdForReview: number;
  };
  governancePolicy: {
    approvedCohorts: readonly string[];
    warningDeltaThreshold: number;
  };
}

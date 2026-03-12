import type {
  ScoreBenchmarkPrimitiveSnapshot,
  ScoreBenchmarkProfile,
} from '../types/index.js';
import {
  assessBenchmarkConfidence,
  assessSimilarity,
  deriveRecommendationState,
  evaluateFilterGovernance,
  createRecalibrationAssessment,
  buildExplainability,
} from '../model/index.js';

export interface ScoreBenchmarkRuntimeInput {
  benchmarkScore: number;
  sampleSize: number;
  similarityScore: number;
  comparablePursuitCount: number;
  selectedCohort: string;
  baselineCohort: string;
  deltaMagnitude: number;
  predictiveValue: number;
  reviewedAtIso: string;
  telemetryWindow: string;
  reasonCodes: readonly string[];
  profile: ScoreBenchmarkProfile;
}

export const createScoreBenchmarkSnapshot = (
  input: ScoreBenchmarkRuntimeInput
): ScoreBenchmarkPrimitiveSnapshot => ({
  confidence: assessBenchmarkConfidence({
    sampleSize: input.sampleSize,
    similarityScore: input.similarityScore,
  }),
  similarity: assessSimilarity({
    score: input.similarityScore,
    comparablePursuitCount: input.comparablePursuitCount,
  }),
  recommendation: deriveRecommendationState({
    benchmarkScore: input.benchmarkScore,
    profile: input.profile,
  }),
  governance: evaluateFilterGovernance({
    selectedCohort: input.selectedCohort,
    baselineCohort: input.baselineCohort,
    profile: input.profile,
    deltaMagnitude: input.deltaMagnitude,
  }),
  recalibration: createRecalibrationAssessment({
    predictiveValue: input.predictiveValue,
    reviewedAtIso: input.reviewedAtIso,
    telemetryWindow: input.telemetryWindow,
  }),
  explainability: buildExplainability({
    reasonCodes: input.reasonCodes,
  }),
});

export { ScoreBenchmarkApi } from './ScoreBenchmarkApi.js';
export { ScoreBenchmarkLifecycleApi } from './ScoreBenchmarkLifecycleApi.js';

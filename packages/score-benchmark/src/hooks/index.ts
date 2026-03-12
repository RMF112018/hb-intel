import { createScoreBenchmarkSnapshot } from '../api/index.js';
import type {
  ScoreBenchmarkPrimitiveSnapshot,
  ScoreBenchmarkProfile,
} from '../types/index.js';

export interface UseScoreBenchmarkSnapshotInput {
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

export const useScoreBenchmarkSnapshot = (
  input: UseScoreBenchmarkSnapshotInput
): ScoreBenchmarkPrimitiveSnapshot => createScoreBenchmarkSnapshot(input);

export { useScoreBenchmarkState } from './useScoreBenchmarkState.js';
export { useScoreBenchmarkFilters } from './useScoreBenchmarkFilters.js';
export { useBenchmarkDecisionSupport } from './useBenchmarkDecisionSupport.js';
export {
  createScoreBenchmarkStateQueryKey,
  createScoreBenchmarkFiltersQueryKey,
} from './queryKeys.js';
export {
  parseScoreBenchmarkPanelContext,
  serializeScoreBenchmarkPanelContext,
} from './panelUrlState.js';

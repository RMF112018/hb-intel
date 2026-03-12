import {
  useScoreBenchmarkSnapshot,
  type UseScoreBenchmarkSnapshotInput,
} from '@hbc/score-benchmark';
import {
  businessDevelopmentScoreBenchmarkProfile,
} from '../profiles/index.js';

export { useScoreBenchmark, type UseScoreBenchmarkInput, type UseScoreBenchmarkResult } from './useScoreBenchmark.js';

export interface UseBusinessDevelopmentScoreBenchmarkInput
  extends Omit<UseScoreBenchmarkSnapshotInput, 'profile'> {}

export const useBusinessDevelopmentScoreBenchmark = (
  input: UseBusinessDevelopmentScoreBenchmarkInput
) =>
  useScoreBenchmarkSnapshot({
    ...input,
    profile: businessDevelopmentScoreBenchmarkProfile,
  });

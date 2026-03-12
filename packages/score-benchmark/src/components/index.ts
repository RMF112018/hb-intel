import type { ScoreBenchmarkPrimitiveSnapshot } from '../types/index.js';

export interface ScoreBenchmarkPanelModel {
  title: string;
  snapshot: ScoreBenchmarkPrimitiveSnapshot;
}

export const createScoreBenchmarkPanelModel = (
  snapshot: ScoreBenchmarkPrimitiveSnapshot
): ScoreBenchmarkPanelModel => ({
  title: 'Score Benchmark',
  snapshot,
});

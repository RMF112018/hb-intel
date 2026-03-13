import type {
  IBenchmarkDatasetEnrichmentSignal,
  IPostBidAutopsy,
} from '../src/index.js';
import {
  createPostBidAutopsyApiScaffold,
  createPostBidAutopsyRecord,
} from '../src/index.js';

export const createMockPostBidAutopsyRecord = (
  overrides: Partial<IPostBidAutopsy> = {}
): IPostBidAutopsy =>
  createPostBidAutopsyRecord({
    autopsyId: 'autopsy-mock',
    pursuitId: 'pursuit-mock',
    scorecardId: 'scorecard-mock',
    ...overrides,
  });

export const createMockBenchmarkDatasetSignal = (
  overrides: Partial<IBenchmarkDatasetEnrichmentSignal> = {}
): IBenchmarkDatasetEnrichmentSignal => ({
  signalType: 'benchmark-dataset-enrichment',
  signalId: overrides.signalId ?? 'signal-mock',
  autopsyId: overrides.autopsyId ?? 'autopsy-mock',
  pursuitId: overrides.pursuitId ?? 'pursuit-mock',
  scorecardId: overrides.scorecardId ?? 'scorecard-mock',
  status: overrides.status ?? 'published',
  outcome: overrides.outcome ?? 'lost',
  confidenceTier: overrides.confidenceTier ?? 'moderate',
  confidenceScore: overrides.confidenceScore ?? 0.72,
  evidenceCoverage: overrides.evidenceCoverage ?? 0.88,
  sensitivityVisibility: overrides.sensitivityVisibility ?? 'internal',
  reasonCodes: overrides.reasonCodes ?? ['scaffold-signal'],
  publishedAt: overrides.publishedAt ?? '2026-03-13T00:00:00.000Z',
  benchmarkDimensionKeys: overrides.benchmarkDimensionKeys ?? ['delivery-model'],
  criterionImpacts:
    overrides.criterionImpacts ??
    [
      {
        criterionId: 'criterion-default',
        impactDirection: 'neutral',
        weight: 0.15,
      },
    ],
});

export const createMockPostBidAutopsyApi = () => createPostBidAutopsyApiScaffold();

import type { IHealthDimension } from '../src/health-pulse/types/index.js';
import { createMockHealthMetric, type DeepPartial } from './createMockHealthMetric.js';

const DEFAULT_METRICS = [
  createMockHealthMetric({
    key: 'forecast-confidence',
    label: 'Forecast confidence',
    value: 82,
    weight: 'leading',
  }),
  createMockHealthMetric({
    key: 'forecast-update-age',
    label: 'Forecast update age',
    value: 76,
    weight: 'lagging',
  }),
];

const mergeMetrics = (
  overrideMetrics: Array<DeepPartial<IHealthDimension['metrics'][number]>> | undefined
): IHealthDimension['metrics'] => {
  if (!overrideMetrics) {
    return DEFAULT_METRICS;
  }

  return overrideMetrics.map((metricOverride, index) =>
    createMockHealthMetric({
      ...DEFAULT_METRICS[index],
      ...metricOverride,
    })
  );
};

export const createMockHealthDimension = (
  overrides?: DeepPartial<IHealthDimension>
): IHealthDimension => {
  const base: IHealthDimension = {
    score: 79,
    status: 'watch',
    label: 'Cost',
    leadingScore: 81,
    laggingScore: 74,
    metrics: DEFAULT_METRICS,
    keyMetric: 'forecast-confidence',
    trend: 'stable',
    hasExcludedMetrics: false,
    confidence: {
      tier: 'moderate',
      score: 73,
      reasons: ['Minor exclusion impact'],
    },
  };

  return {
    ...base,
    ...overrides,
    metrics: mergeMetrics(overrides?.metrics),
    confidence: {
      ...base.confidence,
      ...overrides?.confidence,
      reasons: overrides?.confidence?.reasons ?? base.confidence.reasons,
    },
  };
};

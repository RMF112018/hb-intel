import { describe, expect, it } from 'vitest';
import {
  storybookMatrix,
  SummaryRecommendationStandard,
  OverlayInsufficientExpert,
  IndicatorOverlapQueuedSync,
  FilterPanelGuardrail,
} from './ScoreBenchmarkMatrix.stories.js';

describe('score benchmark storybook matrix', () => {
  it('covers recommendation by complexity and all required variants', () => {
    expect(storybookMatrix.recommendationByComplexity).toHaveLength(4);
    expect(storybookMatrix.confidenceTiers).toEqual(['high', 'moderate', 'low', 'insufficient']);
    expect(storybookMatrix.similarityStrengths).toEqual([
      'highly-similar',
      'moderately-similar',
      'loosely-similar',
    ]);
    expect(storybookMatrix.filterContexts).toContain('guardrail-warning');
    expect(storybookMatrix.syncVariants).toContain('queued-to-sync');
  });

  it('exposes deterministic render stories for summary/overlay/indicator/filter surfaces', () => {
    expect(SummaryRecommendationStandard).toBeTypeOf('function');
    expect(OverlayInsufficientExpert).toBeTypeOf('function');
    expect(IndicatorOverlapQueuedSync).toBeTypeOf('function');
    expect(FilterPanelGuardrail).toBeTypeOf('function');
  });
});

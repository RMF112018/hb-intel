import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  IBenchmarkDatasetEnrichmentSignal,
  IPredictiveDriftInputSignal,
  IRecalibrationInputSignal,
  PostBidLearningSignal,
} from '@hbc/post-bid-autopsy';

describe('post-bid learning signal public contracts', () => {
  it('exports a root union consumable from the public entrypoint', () => {
    const enrichmentSignal: IBenchmarkDatasetEnrichmentSignal = {
      signalType: 'benchmark-dataset-enrichment',
      signalId: 'sig-1',
      autopsyId: 'aut-1',
      pursuitId: 'pur-1',
      scorecardId: 'sc-1',
      status: 'published',
      outcome: 'lost',
      confidenceTier: 'moderate',
      confidenceScore: 0.64,
      evidenceCoverage: 0.85,
      sensitivityVisibility: 'internal',
      reasonCodes: ['owner-type-mismatch'],
      publishedAt: '2026-03-12T00:00:00.000Z',
      benchmarkDimensionKeys: ['projectType', 'geography'],
      criterionImpacts: [
        {
          criterionId: 'criterion-1',
          impactDirection: 'negative',
          weight: 0.4,
        },
      ],
    };

    const recalibrationSignal: IRecalibrationInputSignal = {
      signalType: 'recalibration-input',
      signalId: 'sig-2',
      autopsyId: 'aut-2',
      pursuitId: 'pur-2',
      scorecardId: 'sc-2',
      status: 'approved',
      outcome: 'won',
      confidenceTier: 'high',
      confidenceScore: 0.91,
      evidenceCoverage: 0.9,
      sensitivityVisibility: 'restricted',
      reasonCodes: ['outside-predictive-band'],
      publishedAt: '2026-03-12T00:00:00.000Z',
      correlationKeys: ['ownerType', 'scheduleComplexity'],
      recommendedWeightShift: 0.08,
      triggeredBy: 'autopsy-pattern',
    };

    const driftSignal: IPredictiveDriftInputSignal = {
      signalType: 'predictive-drift-input',
      signalId: 'sig-3',
      autopsyId: 'aut-3',
      pursuitId: 'pur-3',
      scorecardId: 'sc-3',
      status: 'published',
      outcome: 'no-bid',
      confidenceTier: 'low',
      confidenceScore: 0.42,
      evidenceCoverage: 0.77,
      sensitivityVisibility: 'public-summary',
      reasonCodes: ['weak-benchmark-confidence'],
      publishedAt: '2026-03-12T00:00:00.000Z',
      monitorWindowDays: 30,
      driftIndicators: [{ metric: 'winRateCorrelationLift', delta: -0.12 }],
    };

    const signals: PostBidLearningSignal[] = [
      enrichmentSignal,
      recalibrationSignal,
      driftSignal,
    ];

    expect(signals).toHaveLength(3);
    expect(signals[0].signalType).toBe('benchmark-dataset-enrichment');
  });

  it('remains read-only and boundary-safe by contract design', () => {
    type EnrichmentKey = keyof IBenchmarkDatasetEnrichmentSignal;

    const keys: EnrichmentKey[] = [
      'signalId',
      'autopsyId',
      'pursuitId',
      'scorecardId',
      'status',
      'outcome',
      'reasonCodes',
      'publishedAt',
      'benchmarkDimensionKeys',
    ];

    expect(keys).toContain('pursuitId');
    expect(keys).not.toContain('writeCommand' as EnrichmentKey);
    expect(keys).not.toContain('pursuitDetails' as EnrichmentKey);
  });

  it('provides discriminated union variants for all three signal classes', () => {
    type SignalType = PostBidLearningSignal['signalType'];

    expectTypeOf<SignalType>().toEqualTypeOf<
      | 'benchmark-dataset-enrichment'
      | 'recalibration-input'
      | 'predictive-drift-input'
    >();
  });
});

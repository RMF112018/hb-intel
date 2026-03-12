import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BenchmarkExplainabilityPanel } from './BenchmarkExplainabilityPanel.js';

describe('BenchmarkExplainabilityPanel', () => {
  it('renders reason codes, contributors, examples, and caveat warnings', () => {
    render(
      <BenchmarkExplainabilityPanel
        explainability={[
          {
            criterionId: 'c1',
            reasonCodes: ['outside-predictive-band', 'weak-benchmark-confidence'],
            narrative: 'Criterion outside predictive range.',
            relatedHistoricalExamples: [{ pursuitId: 'p-1', label: 'Example Pursuit' }],
          },
        ]}
        benchmarks={[
          {
            criterionId: 'c1',
            criterionLabel: 'Client Fit',
            winAvg: 70,
            lossAvg: 60,
            winZoneMin: 72,
            winZoneMax: 84,
            lossRiskZoneMin: 55,
            lossRiskZoneMax: 73,
            sampleSize: 7,
            isStatisticallySignificant: true,
            confidence: {
              tier: 'low',
              sampleSizeScore: 0.5,
              similarityScore: 0.6,
              recencyScore: 0.6,
              completenessScore: 0.7,
              reasons: ['weak-benchmark-confidence'],
              caution: true,
            },
            similarity: {
              overallSimilarity: 0.66,
              strengthBand: 'moderately-similar',
              factorBreakdown: [{ factor: 'projectType', weight: 0.2, matchScore: 0.7 }],
              mostSimilarPursuits: [],
            },
            explainability: {
              criterionId: 'c1',
              reasonCodes: ['outside-predictive-band'],
              narrative: 'Outside predictive band.',
              relatedHistoricalExamples: [],
            },
          },
        ]}
        complexity="Expert"
      />,
    );

    expect(screen.getByTestId('benchmark-explainability-list')).toBeInTheDocument();
    expect(screen.getByTestId('benchmark-explainability-weak-confidence-c1')).toBeInTheDocument();
    expect(screen.getByTestId('benchmark-explainability-predictive-warning-c1')).toBeInTheDocument();
  });
});

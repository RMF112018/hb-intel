import type React from 'react';
import type {
  IBenchmarkExplainability,
  IScorecardBenchmark,
} from '@hbc/score-benchmark';
import {
  getComplexityFlags,
  type ScoreBenchmarkComplexityMode,
} from './displayModel.js';

export interface BenchmarkExplainabilityPanelProps {
  readonly explainability: readonly IBenchmarkExplainability[];
  readonly benchmarks?: readonly IScorecardBenchmark[];
  readonly complexity: ScoreBenchmarkComplexityMode;
}

export function BenchmarkExplainabilityPanel({
  explainability,
  benchmarks = [],
  complexity,
}: BenchmarkExplainabilityPanelProps): JSX.Element {
  const flags = getComplexityFlags(complexity);

  return (
    <section aria-label="Benchmark Explainability Panel" data-testid="benchmark-explainability-panel">
      <h3>Benchmark Explainability</h3>

      {explainability.length === 0 ? (
        <p data-testid="benchmark-explainability-empty">No explainability entries available.</p>
      ) : (
        <ul data-testid="benchmark-explainability-list">
          {explainability.map((entry) => {
            const benchmark = benchmarks.find((item) => item.criterionId === entry.criterionId);
            const keyContributors = benchmark?.similarity.factorBreakdown.slice(0, 3) ?? [];
            const weakConfidence = benchmark?.confidence.tier === 'low' || benchmark?.confidence.tier === 'insufficient';
            const predictiveWarning = entry.reasonCodes.includes('outside-predictive-band');

            return (
              <li key={entry.criterionId} data-testid={`benchmark-explainability-${entry.criterionId}`}>
                <p>{entry.narrative}</p>
                <p>Reason Codes: {entry.reasonCodes.join(', ')}</p>
                {keyContributors.length > 0 ? (
                  <p>
                    Key contributors: {keyContributors.map((item) => `${item.factor}:${(item.matchScore * 100).toFixed(0)}%`).join(' · ')}
                  </p>
                ) : (
                  <p>Key contributors: none available</p>
                )}
                {entry.relatedHistoricalExamples.length > 0 ? (
                  <p>Historical examples: {entry.relatedHistoricalExamples.map((item) => item.label).join(', ')}</p>
                ) : null}
                {weakConfidence ? (
                  <p data-testid={`benchmark-explainability-weak-confidence-${entry.criterionId}`}>
                    Weak-confidence caveat: interpret benchmark with caution.
                  </p>
                ) : null}
                {predictiveWarning ? (
                  <p data-testid={`benchmark-explainability-predictive-warning-${entry.criterionId}`}>
                    Predictive-band warning detected.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {flags.isEssential ? <p data-testid="benchmark-explainability-essential-copy">Recommendation badge only in essential mode.</p> : null}
    </section>
  );
}

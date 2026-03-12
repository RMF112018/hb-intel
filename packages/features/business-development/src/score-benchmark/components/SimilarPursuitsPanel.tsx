import type React from 'react';
import type { ISimilarityModelResult } from '@hbc/score-benchmark';
import {
  getComplexityFlags,
  similarityLabelMap,
  type ScoreBenchmarkComplexityMode,
} from './displayModel.js';

export interface SimilarPursuitsPanelProps {
  readonly pursuits: ISimilarityModelResult['mostSimilarPursuits'];
  readonly similarityBand: ISimilarityModelResult['strengthBand'];
  readonly complexity: ScoreBenchmarkComplexityMode;
  readonly returnPath: string;
}

export function SimilarPursuitsPanel({
  pursuits,
  similarityBand,
  complexity,
  returnPath,
}: SimilarPursuitsPanelProps): JSX.Element {
  const flags = getComplexityFlags(complexity);
  const bandLabel = similarityLabelMap[similarityBand];

  return (
    <section aria-label="Similar Pursuits Panel" data-testid="similar-pursuits-panel">
      <h3>Most Similar Pursuits</h3>
      <p data-testid="similar-pursuits-strength">Benchmark based on {bandLabel} pursuits</p>

      {pursuits.length === 0 ? (
        <p data-testid="similar-pursuits-empty">No similar pursuits available.</p>
      ) : (
        <ul data-testid="similar-pursuits-list">
          {pursuits.map((pursuit) => (
            <li key={pursuit.pursuitId} data-testid={`similar-pursuit-${pursuit.pursuitId}`}>
              <a href={`/business-development/pursuits/${pursuit.pursuitId}?returnTo=${encodeURIComponent(returnPath)}`}>
                {pursuit.pursuitLabel}
              </a>
              {' · '}
              {(pursuit.similarity * 100).toFixed(0)}%
              {' · '}
              {pursuit.outcome}
            </li>
          ))}
        </ul>
      )}

      {flags.isEssential ? <p data-testid="similar-pursuits-essential-copy">Benchmark context available</p> : null}
    </section>
  );
}

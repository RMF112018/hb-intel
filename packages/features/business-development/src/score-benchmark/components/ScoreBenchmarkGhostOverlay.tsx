import type React from 'react';
import {
  BENCHMARK_MIN_SAMPLE_SIZE,
  type IBicOwnershipProjection,
  type IScoreGhostOverlayState,
} from '@hbc/score-benchmark';
import {
  getComplexityFlags,
  getCriterionCurrentScore,
  getCriterionTooltipCopy,
  getInsufficientDataGap,
  getOwnershipProjection,
  recommendationLabelMap,
  type ScoreBenchmarkComplexityMode,
} from './displayModel.js';

export interface ScoreBenchmarkGhostOverlayProps {
  readonly overlay: IScoreGhostOverlayState | null;
  readonly bicOwnershipProjections: readonly IBicOwnershipProjection[];
  readonly complexity: ScoreBenchmarkComplexityMode;
  readonly criterionScores?: Readonly<Record<string, number>>;
  readonly onOpenDeepLink?: (criterionId: string) => string;
  readonly onOpenExplainability?: (criterionId: string) => void;
}

export function ScoreBenchmarkGhostOverlay({
  overlay,
  bicOwnershipProjections,
  complexity,
  criterionScores,
  onOpenDeepLink,
  onOpenExplainability,
}: ScoreBenchmarkGhostOverlayProps): JSX.Element {
  const flags = getComplexityFlags(complexity);

  if (!overlay) {
    return (
      <section aria-label="Score Benchmark Ghost Overlay" data-testid="score-benchmark-ghost-overlay-empty">
        <p>No benchmark overlay is available.</p>
      </section>
    );
  }

  return (
    <section aria-label="Score Benchmark Ghost Overlay" data-testid="score-benchmark-ghost-overlay">
      <header>
        <h2>Score Benchmark Ghost Overlay</h2>
        {flags.isEssential ? (
          <>
            <span data-testid="overlay-essential-context-badge">Benchmark context available</span>
            <span data-testid="overlay-essential-recommendation-badge">
              {recommendationLabelMap[overlay.recommendation.state]}
            </span>
          </>
        ) : null}
      </header>

      {!flags.isEssential ? (
        <div data-testid="overlay-zones">
          <p data-testid="overlay-win-zone-band">
            Win Zone band: {overlay.overallWinZoneMin ?? 'n/a'} - {overlay.overallWinZoneMax ?? 'n/a'}
          </p>
          <p data-testid="overlay-loss-risk-zone-band">
            Loss Risk Zone band: {overlay.benchmarks[0]?.lossRiskZoneMin ?? 'n/a'} - {overlay.benchmarks[0]?.lossRiskZoneMax ?? 'n/a'}
          </p>
          {overlay.lossRiskOverlap ? (
            <p data-testid="overlay-overlap-warning">
              Ambiguous benchmark overlap - review confidence and consensus
            </p>
          ) : null}
        </div>
      ) : null}

      {!flags.isEssential ? (
        <ol data-testid="overlay-criteria-list">
          {overlay.benchmarks.map((benchmark) => {
            const criterionScore = getCriterionCurrentScore(benchmark, criterionScores);
            const ownership = getOwnershipProjection(bicOwnershipProjections, benchmark.criterionId);
            const tooltip = getCriterionTooltipCopy({
              benchmark,
              criterionScore,
              overlap: overlay.lossRiskOverlap,
              ownership,
            });

            return (
              <li key={benchmark.criterionId} data-testid={`overlay-criterion-${benchmark.criterionId}`}>
                <p>
                  {benchmark.criterionLabel}: current={criterionScore ?? 'n/a'}; winAvg={benchmark.winAvg ?? 'n/a'}; lossAvg={benchmark.lossAvg ?? 'n/a'}
                </p>
                <p data-testid={`overlay-criterion-tooltip-${benchmark.criterionId}`}>{tooltip}</p>
                <p data-testid={`overlay-confidence-chip-${benchmark.criterionId}`}>
                  Confidence: {benchmark.confidence.tier}
                </p>
                <p data-testid={`overlay-confidence-reasons-${benchmark.criterionId}`}>
                  {benchmark.confidence.reasons.join(', ') || 'No confidence reasons provided'}
                </p>

                {benchmark.sampleSize < BENCHMARK_MIN_SAMPLE_SIZE ? (
                  <p data-testid={`overlay-insufficient-data-${benchmark.criterionId}`}>
                    Insufficient data warning: {getInsufficientDataGap(benchmark.sampleSize)} record(s) below minimum threshold.
                  </p>
                ) : null}

                {flags.isExpert && ownership ? (
                  <div data-testid={`overlay-owner-${benchmark.criterionId}`}>
                    <p>Owner: {ownership.owner?.displayName ?? 'Unassigned'} ({ownership.owner?.role ?? 'unassigned'})</p>
                    {onOpenDeepLink ? (
                      <a href={onOpenDeepLink(benchmark.criterionId)} data-testid={`overlay-owner-deeplink-${benchmark.criterionId}`}>
                        Open ownership deep-link
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {flags.isExpert ? (
                  <div data-testid={`overlay-hbi-actions-${benchmark.criterionId}`}>
                    <button type="button" onClick={() => onOpenExplainability?.(benchmark.criterionId)}>
                      HBI Action: Explain benchmark (citation required)
                    </button>
                    <p>Approval required before final action.</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}

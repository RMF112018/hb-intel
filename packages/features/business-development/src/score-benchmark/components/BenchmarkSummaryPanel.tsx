import type React from 'react';
import type {
  IScoreBenchmarkDecisionSupportResult,
  IScoreBenchmarkStateResult,
} from '@hbc/score-benchmark';
import {
  getComplexityFlags,
  getSampleSummary,
  getSimilaritySummary,
  getSyncBadge,
  recommendationLabelMap,
  type ScoreBenchmarkComplexityMode,
} from './displayModel.js';

export interface BenchmarkSummaryPanelProps {
  readonly state: IScoreBenchmarkStateResult;
  readonly decisionSupport: IScoreBenchmarkDecisionSupportResult;
  readonly complexity: ScoreBenchmarkComplexityMode;
  readonly onOpenFilterPanel?: () => void;
  readonly onLaunchNoBidRationale?: () => void;
}

export function BenchmarkSummaryPanel({
  state,
  decisionSupport,
  complexity,
  onOpenFilterPanel,
  onLaunchNoBidRationale,
}: BenchmarkSummaryPanelProps): JSX.Element {
  const flags = getComplexityFlags(complexity);
  const overlay = state.overlay;

  if (!overlay) {
    return (
      <section aria-label="Benchmark Summary Panel" data-testid="benchmark-summary-panel-empty">
        <p>No benchmark summary is available.</p>
      </section>
    );
  }

  const badge = getSyncBadge(overlay.syncStatus);

  return (
    <section aria-label="Benchmark Summary Panel" data-testid="benchmark-summary-panel">
      <h2>Benchmark Summary</h2>
      <p data-testid="summary-total-score">Current total score: {overlay.overallWinAvg ?? 'n/a'}</p>
      <p data-testid="summary-win-zone-range">
        Overall Win Zone: {overlay.overallWinZoneMin ?? 'n/a'} - {overlay.overallWinZoneMax ?? 'n/a'}
      </p>

      <p data-testid="summary-recommendation-banner">
        Recommendation: {recommendationLabelMap[overlay.recommendation.state]}
      </p>

      {!flags.isEssential ? (
        <>
          <p data-testid="summary-distance-to-win-zone">
            Distance to Win Zone: {overlay.distanceToWinZone ?? 'n/a'}
          </p>
          <p data-testid="summary-loss-risk-overlap">
            Loss-risk overlap: {overlay.lossRiskOverlap ? 'Detected' : 'None'}
          </p>
          <p data-testid="summary-filter-context">{getSampleSummary(overlay)} · {getSimilaritySummary(overlay)}</p>
          {flags.isStandard ? (
            <p data-testid="summary-standard-preview">Read-only panel previews enabled.</p>
          ) : null}
          {flags.isExpert ? (
            <p data-testid="summary-expert-interactivity">Full panel interactivity enabled.</p>
          ) : null}
        </>
      ) : null}

      {badge ? <span data-testid="summary-sync-badge">{badge}</span> : null}

      <div data-testid="summary-actions">
        <button type="button" onClick={onOpenFilterPanel}>
          Open Filter Panel
        </button>

        {overlay.recommendation.state === 'no-bid-recommended' ? (
          <button type="button" onClick={onLaunchNoBidRationale} data-testid="summary-no-bid-action">
            Launch No-Bid Rationale Workflow
          </button>
        ) : null}
      </div>

      {decisionSupport.panelHydration.detailHydrated ? (
        <p data-testid="summary-panel-context-active">Panel context restored from URL.</p>
      ) : null}
    </section>
  );
}

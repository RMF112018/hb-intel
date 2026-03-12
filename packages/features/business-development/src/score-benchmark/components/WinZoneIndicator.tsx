import type React from 'react';
import type { IScoreGhostOverlayState } from '@hbc/score-benchmark';
import {
  confidenceLabelMap,
  getComplexityFlags,
  recommendationLabelMap,
  type ScoreBenchmarkComplexityMode,
} from './displayModel.js';

export interface WinZoneIndicatorProps {
  readonly overlay: IScoreGhostOverlayState | null;
  readonly complexity: ScoreBenchmarkComplexityMode;
  readonly currentScore?: number | null;
  readonly onOpenNoBidRationale?: () => void;
}

const hasLowConfidence = (overlay: IScoreGhostOverlayState): boolean =>
  overlay.benchmarks.some(
    (item) => item.confidence.tier === 'low' || item.confidence.tier === 'insufficient',
  );

export function WinZoneIndicator({
  overlay,
  complexity,
  currentScore,
  onOpenNoBidRationale,
}: WinZoneIndicatorProps): JSX.Element | null {
  const flags = getComplexityFlags(complexity);

  if (flags.isEssential && !overlay) {
    return null;
  }

  if (!overlay) {
    return (
      <section aria-label="Win Zone Indicator" data-testid="win-zone-indicator-empty">
        <p>No win-zone indicator data is available.</p>
      </section>
    );
  }

  const recommendationToken = recommendationLabelMap[overlay.recommendation.state];
  const lowConfidence = hasLowConfidence(overlay);
  const cautionFraming =
    lowConfidence || overlay.lossRiskOverlap
      ? 'Caution framing required due to low-confidence or overlap conditions.'
      : 'Benchmark confidence supports standard framing.';

  const resolvedScore = currentScore ?? overlay.overallWinAvg;
  const lossRiskMin = overlay.benchmarks[0]?.lossRiskZoneMin;
  const lossRiskMax = overlay.benchmarks[0]?.lossRiskZoneMax;

  return (
    <section aria-label="Win Zone Indicator" data-testid="win-zone-indicator">
      <h3>Win Zone Indicator</h3>
      <p data-testid="win-zone-recommendation-token">{recommendationToken}</p>

      {flags.isEssential ? (
        <p data-testid="win-zone-essential-copy">
          Indicator state: {recommendationToken} ({overlay.distanceToWinZone ?? 'n/a'} to win zone)
        </p>
      ) : (
        <>
          <div data-testid="win-zone-spectrum">
            <p>Loss-risk band: {lossRiskMin ?? 'n/a'} - {lossRiskMax ?? 'n/a'}</p>
            <p>Borderline band: {lossRiskMax ?? 'n/a'} - {overlay.overallWinZoneMin ?? 'n/a'}</p>
            <p>Win-zone band: {overlay.overallWinZoneMin ?? 'n/a'} - {overlay.overallWinZoneMax ?? 'n/a'}</p>
          </div>

          <div data-testid="win-zone-markers">
            <p>Current score marker: {resolvedScore ?? 'n/a'}</p>
            <p>Win average marker: {overlay.overallWinAvg ?? 'n/a'}</p>
            <p>Loss average marker: {overlay.overallLossAvg ?? 'n/a'}</p>
            <p>Distance to win zone: {overlay.distanceToWinZone ?? 'n/a'}</p>
          </div>

          {overlay.lossRiskOverlap ? (
            <p data-testid="win-zone-overlap-status">Overlap status: Win/Loss zones intersect.</p>
          ) : null}

          <p data-testid="win-zone-caution-copy">{cautionFraming}</p>

          {flags.isStandard || flags.isExpert ? (
            <div data-testid="win-zone-hbi-actions">
              <button type="button">HBI Quick Action: Explain score (citation required)</button>
              <button type="button" onClick={onOpenNoBidRationale}>
                HBI Quick Action: Generate governed no-bid rationale (approval required)
              </button>
            </div>
          ) : null}

          {flags.isExpert ? (
            <div data-testid="win-zone-expert-diagnostics">
              <p>
                Diagnostics: confidence tiers {overlay.benchmarks.map((item) => confidenceLabelMap[item.confidence.tier]).join(', ')}
              </p>
              <p>Filter-linked behavior: indicator refreshes after governed filter updates.</p>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

import type { HealthIndicatorStatus } from '@hbc/health-indicator';
import type { IScoreGhostOverlayState } from '@hbc/score-benchmark';

export interface IScoreBenchmarkHealthProjection {
  status: HealthIndicatorStatus;
  score: number;
}

export const mapScoreBenchmarkToHealthIndicator = (
  overlay: IScoreGhostOverlayState
): IScoreBenchmarkHealthProjection => {
  const winZoneMin = overlay.overallWinZoneMin ?? 0;
  const score = overlay.overallWinAvg ?? 0;

  if (overlay.recommendation.state === 'no-bid-recommended') {
    return { status: 'not-ready', score };
  }

  if (score >= winZoneMin && !overlay.lossRiskOverlap) {
    return { status: 'ready', score };
  }

  if (overlay.lossRiskOverlap || overlay.recommendation.state === 'hold-for-review') {
    return { status: 'attention-needed', score };
  }

  if (overlay.recommendation.state === 'pursue-with-caution') {
    return { status: 'nearly-ready', score };
  }

  return { status: 'ready', score };
};

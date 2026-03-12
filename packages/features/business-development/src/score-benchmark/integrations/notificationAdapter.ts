import type { NotificationTier } from '@hbc/notification-intelligence';
import type {
  IReviewerConsensus,
  IScoreGhostOverlayState,
} from '@hbc/score-benchmark';

export interface IBdScoreBenchmarkNotificationProjection {
  eventType: string;
  tier: NotificationTier;
  title: string;
  body: string;
}

export const resolveScoreBenchmarkNotifications = (
  overlay: IScoreGhostOverlayState,
  consensus: IReviewerConsensus
): IBdScoreBenchmarkNotificationProjection[] => {
  const notifications: IBdScoreBenchmarkNotificationProjection[] = [];

  if (overlay.lossRiskOverlap) {
    notifications.push({
      eventType: 'score-benchmark.loss-risk-overlap',
      tier: 'immediate',
      title: 'Loss-risk overlap detected',
      body: 'Benchmark overlap indicates elevated loss-risk; review recommendation and confidence context.',
    });
  }

  if (consensus.escalationRecommended) {
    notifications.push({
      eventType: 'score-benchmark.consensus-escalation',
      tier: 'watch',
      title: 'Reviewer consensus escalation suggested',
      body: 'High reviewer variance requires role-aware escalation follow-up.',
    });
  }

  if (overlay.recommendation.state === 'no-bid-recommended') {
    notifications.push({
      eventType: 'score-benchmark.no-bid-approval-overdue',
      tier: 'digest',
      title: 'No-bid rationale approval required',
      body: 'Recommendation is no-bid; immutable rationale artifact approval is still pending.',
    });
  }

  return notifications;
};

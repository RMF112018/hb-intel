import type { HealthIndicatorStatus } from '@hbc/health-indicator';
import type { IStrategicIntelligenceState } from '@hbc/strategic-intelligence';

export interface IStrategicIntelligenceHealthProjection {
  status: HealthIndicatorStatus;
  score: number;
}

export const mapStrategicIntelligenceToHealthIndicator = (
  state: IStrategicIntelligenceState
): IStrategicIntelligenceHealthProjection => {
  const total = state.livingEntries.length;
  if (total === 0) {
    return {
      status: 'not-ready',
      score: 0,
    };
  }

  const approved = state.livingEntries.filter((entry) => entry.lifecycleState === 'approved').length;
  const stale = state.livingEntries.filter((entry) => entry.trust.isStale).length;
  const openConflicts = state.livingEntries.flatMap((entry) => entry.conflicts).filter(
    (conflict) => conflict.resolutionStatus === 'open'
  ).length;

  const score = Math.round((approved / total) * 100);

  if (openConflicts > 0) {
    return { status: 'attention-needed', score };
  }

  if (stale > 0) {
    return { status: 'nearly-ready', score };
  }

  if (approved === total) {
    return { status: 'ready', score };
  }

  return { status: 'not-ready', score };
};

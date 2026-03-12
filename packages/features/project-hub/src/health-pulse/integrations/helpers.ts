import type { HealthStatus, ICompoundRiskSignal, PulseConfidenceTier } from '../types/index.js';

export const toStableProjectionId = (
  scope: string,
  projectId: string,
  qualifier?: string
): string => {
  return qualifier ? `${scope}::${projectId}::${qualifier}` : `${scope}::${projectId}`;
};

export const statusToNotificationTier = (status: HealthStatus): 'immediate' | 'watch' | 'digest' => {
  if (status === 'critical') return 'immediate';
  if (status === 'at-risk') return 'watch';
  return 'digest';
};

export const confidenceTierToNotificationTier = (
  tier: PulseConfidenceTier
): 'immediate' | 'watch' | 'digest' => {
  if (tier === 'unreliable') return 'immediate';
  if (tier === 'low') return 'watch';
  return 'digest';
};

export const hasModerateOrHigherCompoundRisk = (signals: ICompoundRiskSignal[]): boolean =>
  signals.some((signal) => signal.severity === 'moderate' || signal.severity === 'high' || signal.severity === 'critical');

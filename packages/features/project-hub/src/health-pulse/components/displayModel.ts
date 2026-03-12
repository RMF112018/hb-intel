import type { ComplexityTier } from '@hbc/complexity';
import type {
  HealthStatus,
  ICompoundRiskSignal,
  IHealthDimension,
  IProjectHealthPulse,
  PulseConfidenceTier,
} from '../types/index.js';
import type { StatusVariant } from '@hbc/ui-kit';

export type HealthDimensionKey = 'cost' | 'time' | 'field' | 'office';

export type ExplainabilitySection =
  | 'confidence'
  | 'why'
  | 'changed'
  | 'contributors'
  | 'matters-most';

export const getStatusVariant = (status: HealthStatus): StatusVariant => {
  if (status === 'on-track') return 'onTrack';
  if (status === 'watch') return 'warning';
  if (status === 'at-risk') return 'atRisk';
  if (status === 'critical') return 'critical';
  return 'pending';
};

export const getConfidenceVariant = (tier: PulseConfidenceTier): StatusVariant => {
  if (tier === 'high') return 'success';
  if (tier === 'moderate') return 'info';
  if (tier === 'low') return 'warning';
  return 'error';
};

export const getConfidenceLabel = (tier: PulseConfidenceTier): string => {
  if (tier === 'high') return 'Confidence: High';
  if (tier === 'moderate') return 'Confidence: Moderate';
  if (tier === 'low') return 'Confidence: Low';
  return 'Confidence: Unreliable';
};

export const isConfidenceCaution = (tier: PulseConfidenceTier): boolean =>
  tier === 'low' || tier === 'unreliable';

export const hasEscalatedCompoundRisk = (signals: ICompoundRiskSignal[]): boolean =>
  signals.some((signal) => signal.severity === 'moderate' || signal.severity === 'high' || signal.severity === 'critical');

export const getDimensionEntries = (pulse: IProjectHealthPulse): Array<[HealthDimensionKey, IHealthDimension]> => [
  ['cost', pulse.dimensions.cost],
  ['time', pulse.dimensions.time],
  ['field', pulse.dimensions.field],
  ['office', pulse.dimensions.office],
];

export const buildTrendSeries = (baseScore: number, trend: IHealthDimension['trend']): number[] => {
  const adjustments =
    trend === 'improving'
      ? [-8, -6, -5, -3, -2, 0, 1, 3, 4, 5, 6, 7, 8]
      : trend === 'declining'
        ? [8, 7, 6, 5, 4, 3, 1, 0, -2, -3, -5, -6, -8]
        : [0, 1, -1, 1, 0, -1, 1, 0, 0, 1, -1, 0, 0];

  return adjustments.map((delta) => Math.max(0, Math.min(100, Math.round(baseScore + delta))));
};

export const buildHistoryLabels = (points: number): string[] =>
  Array.from({ length: points }, (_, index) => `W${index + 1}`);

export const resolveComplexityTier = (
  explicitTier: ComplexityTier | undefined,
  contextTier: ComplexityTier | undefined
): ComplexityTier => explicitTier ?? contextTier ?? 'standard';

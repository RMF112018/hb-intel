import type { IAutopsyTelemetryState } from '../types/index.js';

export const POST_BID_AUTOPSY_TELEMETRY_EVENTS = Object.freeze([
  'post-bid-autopsy.evidence-reviewed',
  'post-bid-autopsy.confidence-scored',
  'post-bid-autopsy.publication-gated',
  'post-bid-autopsy.signal-published',
] as const);

export const createAutopsyTelemetryState = (
  overrides: Partial<IAutopsyTelemetryState> = {}
): IAutopsyTelemetryState => ({
  autopsyCompletionLatency: overrides.autopsyCompletionLatency ?? null,
  repeatErrorReductionRate: overrides.repeatErrorReductionRate ?? null,
  intelligenceSeedingConversionRate: overrides.intelligenceSeedingConversionRate ?? null,
  benchmarkAccuracyLift: overrides.benchmarkAccuracyLift ?? null,
  corroborationRate: overrides.corroborationRate ?? null,
  staleIntelligenceRate: overrides.staleIntelligenceRate ?? null,
  revalidationLatency: overrides.revalidationLatency ?? null,
  reinsertionAdoptionRate: overrides.reinsertionAdoptionRate ?? null,
  autopsyCes: overrides.autopsyCes ?? null,
});

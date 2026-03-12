/**
 * SF18-T06 deterministic scoring and summary composition wrappers.
 *
 * Canonical summary runtime is owned by `@hbc/health-indicator`; this module
 * preserves SF18 adapter-level API compatibility for existing consumers.
 *
 * @design D-SF18-T06, D-SF18-T03, D-SF18-T02
 */
import {
  buildHealthIndicatorSummary,
} from '@hbc/health-indicator';
import type {
  IHealthIndicatorCriterion,
  IReadinessSummaryPayload,
} from '../../types/index.js';
import {
  resolveBidReadinessProfileConfig,
  type IResolvedBidReadinessConfig,
} from './readinessConfigResolver.js';

/**
 * Composes a normalized readiness summary payload from criteria and resolved config.
 *
 * @design D-SF18-T06
 */
export function buildReadinessSummary(
  criteria: readonly IHealthIndicatorCriterion[],
  config: Pick<IResolvedBidReadinessConfig, 'profile' | 'governance'>,
  computedAt = new Date().toISOString(),
): IReadinessSummaryPayload {
  return buildHealthIndicatorSummary(criteria, config, computedAt) as IReadinessSummaryPayload;
}

/**
 * Convenience helper that resolves config first, then computes summary.
 *
 * @design D-SF18-T06
 */
export function evaluateReadinessSummary(
  criteria: readonly IHealthIndicatorCriterion[],
  override?: Parameters<typeof resolveBidReadinessProfileConfig>[0],
  computedAt = new Date().toISOString(),
): { summary: IReadinessSummaryPayload; config: IResolvedBidReadinessConfig } {
  const config = resolveBidReadinessProfileConfig(override);
  const summary = buildReadinessSummary(criteria, config, computedAt);
  return { summary, config };
}

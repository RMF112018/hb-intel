/**
 * Estimating readiness profile contract over canonical health-indicator criteria.
 *
 * @design D-SF18-T02
 */
import type { ReadinessProfileIdentifier } from '../constants/index.js';
import type { IHealthIndicatorCriterion } from './IHealthIndicatorCriterion.js';

export interface IEstimatingBidReadinessProfile {
  readonly profileId: ReadinessProfileIdentifier;
  readonly criteria: readonly IHealthIndicatorCriterion[];
  readonly thresholds: {
    readonly readyMinScore: number;
    readonly nearlyReadyMinScore: number;
    readonly attentionNeededMinScore: number;
  };
}

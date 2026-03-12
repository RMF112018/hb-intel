/**
 * Normalized score payload used across summary and detail readiness views.
 *
 * @design D-SF18-T02
 */
import type { BidReadinessStatus } from './BidReadinessStatus.js';
import type { ScoringBand } from '../constants/index.js';

export interface IReadinessScore {
  readonly value: number;
  readonly status: BidReadinessStatus;
  readonly band: ScoringBand;
  readonly computedAt: string;
}

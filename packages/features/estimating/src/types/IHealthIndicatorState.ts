/**
 * Canonical readiness state contract consumed by SF18 adapter contracts.
 *
 * @design D-SF18-T02
 */
import type { BidReadinessStatus } from './BidReadinessStatus.js';
import type { IHealthIndicatorCriterion } from './IHealthIndicatorCriterion.js';
import type { VersionedRecord } from './VersionedRecord.js';

export interface IHealthIndicatorState {
  readonly score: number;
  readonly status: BidReadinessStatus;
  readonly criteria: readonly IHealthIndicatorCriterion[];
  readonly blockers: readonly IHealthIndicatorCriterion[];
  readonly daysUntilDue: number | null;
  readonly isOverdue: boolean;
  readonly version: VersionedRecord;
}

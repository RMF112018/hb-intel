/**
 * Estimating-facing readiness view-state payload for compact and detailed UI surfaces.
 *
 * @design D-SF18-T02
 */
import type { SyncIndicator } from '../constants/index.js';
import type { BidReadinessStatus } from './BidReadinessStatus.js';
import type { IHealthIndicatorCriterion } from './IHealthIndicatorCriterion.js';
import type { IBicOwner } from './IBicOwner.js';
import type { VersionedRecord } from './VersionedRecord.js';
import type { IReadinessSummaryPayload } from './IReadinessSummaryPayload.js';

export interface IBidReadinessViewState {
  readonly status: BidReadinessStatus;
  readonly score: number;
  readonly blockers: readonly IHealthIndicatorCriterion[];
  readonly criteria: ReadonlyArray<{
    readonly criterion: IHealthIndicatorCriterion;
    readonly isComplete: boolean;
    readonly assignee: IBicOwner | null;
    readonly actionHref: string;
  }>;
  readonly summary: IReadinessSummaryPayload;
  readonly daysUntilDue: number | null;
  readonly isOverdue: boolean;
  readonly version: VersionedRecord;
  readonly syncIndicator: SyncIndicator;
}

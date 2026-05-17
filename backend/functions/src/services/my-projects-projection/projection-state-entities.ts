import type { ProjectionRunStatus, ProjectionRunType, SourceListKind } from './projection-types.js';

export const PROJECTION_STATE_PARTITION_KEY = 'MyProjectsProjection' as const;

export const PROJECTION_SUBSCRIPTION_STATUSES = [
  'healthy',
  'renewal-required',
  'missing',
  'failed',
] as const;
export type ProjectionSubscriptionStatus = (typeof PROJECTION_SUBSCRIPTION_STATUSES)[number];

export const PROJECTION_LEASE_TYPES = ['sync', 'rebuild', 'audit', 'purge'] as const;
export type ProjectionLeaseType = (typeof PROJECTION_LEASE_TYPES)[number];

export interface IProjectionSubscriptionEntity {
  readonly partitionKey: typeof PROJECTION_STATE_PARTITION_KEY;
  readonly rowKey: `Subscription:${SourceListKind}`;
  readonly SourceListKind: SourceListKind;
  readonly SourceSiteId: string;
  readonly SourceListId: string;
  readonly SubscriptionId?: string;
  readonly Resource?: string;
  readonly NotificationUrl?: string;
  readonly ExpirationDateTimeUtc?: string;
  readonly Status: ProjectionSubscriptionStatus;
  readonly LastCreateAttemptUtc?: string;
  readonly LastRenewalAttemptUtc?: string;
  readonly LastRenewalSuccessUtc?: string;
  readonly LastFailureCode?: string;
  readonly LastFailureAtUtc?: string;
}

export interface IProjectionDeltaStateEntity {
  readonly partitionKey: typeof PROJECTION_STATE_PARTITION_KEY;
  readonly rowKey: `DeltaState:${SourceListKind}`;
  readonly SourceListKind: SourceListKind;
  readonly DeltaLink?: string;
  readonly NeedsResync: boolean;
  readonly LastDeltaPullStartedUtc?: string;
  readonly LastDeltaPullSucceededUtc?: string;
  readonly LastDeltaPullFailedUtc?: string;
  readonly LastFailureCode?: string;
  readonly LastChangedItemCount?: number;
  readonly LastDeletedItemCount?: number;
  readonly LastProjectionBatchId?: string;
}

export interface IProjectionLeaseEntity {
  readonly partitionKey: typeof PROJECTION_STATE_PARTITION_KEY;
  readonly rowKey:
    | `Lease:Sync:${SourceListKind}`
    | 'Lease:Rebuild:Global'
    | 'Lease:DriftAudit:Global'
    | 'Lease:Purge:Global';
  readonly LeaseOwner: string;
  readonly LeaseAcquiredAtUtc: string;
  readonly LeaseExpiresAtUtc: string;
  readonly LeaseType: ProjectionLeaseType;
  readonly SourceListKind?: SourceListKind;
}

export interface IProjectionRunEntity {
  readonly partitionKey: typeof PROJECTION_STATE_PARTITION_KEY;
  readonly rowKey: string;
  readonly RunId: string;
  readonly RunType: ProjectionRunType;
  readonly StartedAtUtc: string;
  readonly CompletedAtUtc?: string;
  readonly Status: ProjectionRunStatus;
  readonly SourceListKind?: SourceListKind;
  readonly ProjectionBatchId?: string;
  readonly ChangedItemCount?: number;
  readonly DeletedItemCount?: number;
  readonly HelperRowsInserted?: number;
  readonly HelperRowsUpdated?: number;
  readonly HelperRowsReactivated?: number;
  readonly HelperRowsDeactivated?: number;
  readonly HelperRowsPurged?: number;
  readonly DriftMissingCount?: number;
  readonly DriftExtraCount?: number;
  readonly DriftContentMismatchCount?: number;
  readonly FailureCode?: string;
  readonly Notes?: string;
}

export function projectionRunRowKey(startedAtUtc: string, runId: string): string {
  if (typeof startedAtUtc !== 'string' || startedAtUtc.length === 0) {
    throw new RangeError('projectionRunRowKey: startedAtUtc must be a non-empty ISO-8601 string.');
  }
  if (typeof runId !== 'string' || runId.length === 0) {
    throw new RangeError('projectionRunRowKey: runId must be a non-empty string.');
  }
  return `Run:${startedAtUtc}:${runId}`;
}

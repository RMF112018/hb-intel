/**
 * Return contract for `useBidReadinessProfile`.
 *
 * @design D-SF18-T04
 */
import type { BidReadinessDataState } from './BidReadinessDataState.js';
import type { IEstimatingBidReadinessProfile } from './IEstimatingBidReadinessProfile.js';
import type { IReadinessGovernanceMetadata } from './IReadinessGovernanceMetadata.js';
import type { VersionedRecord } from './VersionedRecord.js';

export interface UseBidReadinessProfileResult {
  readonly state: BidReadinessDataState;
  readonly profile: IEstimatingBidReadinessProfile | null;
  readonly source: 'baseline' | 'admin-override' | 'fallback';
  readonly governance: IReadinessGovernanceMetadata | null;
  readonly version: VersionedRecord | null;
  readonly isLoading: boolean;
  readonly isDegraded: boolean;
  readonly error: Error | null;
  readonly validationErrors: readonly string[];
  readonly refresh: () => Promise<void>;
}

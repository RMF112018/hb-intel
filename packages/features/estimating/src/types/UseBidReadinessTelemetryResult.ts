/**
 * Return contract for `useBidReadinessTelemetry`.
 *
 * @design D-SF18-T04
 */
import type { BidReadinessDataState } from './BidReadinessDataState.js';
import type { IBidReadinessTelemetrySnapshot } from '../bid-readiness/telemetry/index.js';

export interface UseBidReadinessTelemetryResult {
  readonly state: BidReadinessDataState;
  readonly snapshot: IBidReadinessTelemetrySnapshot | null;
  readonly isLoading: boolean;
  readonly isDegraded: boolean;
  readonly isStale: boolean;
  readonly backfillPending: boolean;
  readonly lastEmittedAt: string | null;
  readonly error: Error | null;
  readonly refresh: () => Promise<void>;
}

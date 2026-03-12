/**
 * Return contract for `useBidReadiness`.
 *
 * @design D-SF18-T04
 */
import type { BidReadinessDataState } from './BidReadinessDataState.js';
import type { IBidReadinessViewState } from './IBidReadinessViewState.js';

export interface UseBidReadinessResult {
  readonly state: BidReadinessDataState;
  readonly viewState: IBidReadinessViewState | null;
  readonly blockerCount: number;
  readonly incompleteCount: number;
  readonly groupedCriteria: Readonly<Record<'blockers' | 'complete' | 'incomplete', readonly IBidReadinessViewState['criteria'][number][]>>;
  readonly isLoading: boolean;
  readonly isDegraded: boolean;
  readonly error: Error | null;
  readonly validationErrors: readonly string[];
  readonly refresh: () => Promise<void>;
}

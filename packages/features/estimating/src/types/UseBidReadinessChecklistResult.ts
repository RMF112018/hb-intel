/**
 * Return contract for `useBidReadinessChecklist`.
 *
 * @design D-SF18-T06
 */
import type { BidReadinessDataState } from './BidReadinessDataState.js';
import type { IBidReadinessChecklistItem } from './IBidReadinessChecklistItem.js';

export interface UseBidReadinessChecklistResult {
  readonly state: BidReadinessDataState;
  readonly items: readonly IBidReadinessChecklistItem[];
  readonly grouped: Readonly<Record<'blockers' | 'incomplete' | 'complete', readonly IBidReadinessChecklistItem[]>>;
  readonly completionPercent: number;
  readonly blockingIncompleteCount: number;
  readonly recomputeRequired: boolean;
  readonly isLoading: boolean;
  readonly isDegraded: boolean;
  readonly error: Error | null;
  readonly updateCompletion: (checklistItemId: string, isComplete: boolean) => void;
  readonly updateRationale: (checklistItemId: string, rationale: string) => void;
  readonly resetDraft: () => void;
}

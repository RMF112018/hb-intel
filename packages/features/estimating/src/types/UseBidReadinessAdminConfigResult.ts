/**
 * Return contract for `useBidReadinessAdminConfig`.
 *
 * @design D-SF18-T06
 */
import type { BidReadinessDataState } from './BidReadinessDataState.js';
import type {
  IBidReadinessAdminConfigDraft,
  IBidReadinessAdminConfigSnapshot,
} from './IBidReadinessAdminConfig.js';

export interface UseBidReadinessAdminConfigResult {
  readonly state: BidReadinessDataState;
  readonly snapshot: IBidReadinessAdminConfigSnapshot | null;
  readonly draft: IBidReadinessAdminConfigDraft | null;
  readonly validationErrors: readonly string[];
  readonly isLoading: boolean;
  readonly isDegraded: boolean;
  readonly error: Error | null;
  readonly setCriterionWeight: (criterionId: string, weight: number) => void;
  readonly setCriterionBlocker: (criterionId: string, isBlocker: boolean) => void;
  readonly setThreshold: (name: 'readyMinScore' | 'nearlyReadyMinScore' | 'attentionNeededMinScore', value: number) => void;
  readonly saveDraft: () => IBidReadinessAdminConfigSnapshot | null;
  readonly resetDraft: () => void;
}

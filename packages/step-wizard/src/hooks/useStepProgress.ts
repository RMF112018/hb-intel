import { useDraftStore } from '@hbc/session-state';
import { resolveDraftKey, computeIsComplete, computePercentComplete, type IStepWizardDraft } from '../state/draftPayload';
import type { IStepWizardConfig, IUseStepProgressReturn } from '../types/IStepWizard';

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Lightweight hook for HbcStepProgress list row rendering. (D-09)
 * Reads draft store synchronously — no network call, no TanStack Query.
 * Resolves draftKey from config and item (handles both string and function forms).
 */
export function useStepProgress<T>(
  config: IStepWizardConfig<T>,
  item: T
): IUseStepProgressReturn {
  const draftKey = resolveDraftKey(config, item);
  const draftStore = useDraftStore(draftKey);

  const draft = draftKey ? draftStore.read<IStepWizardDraft>() : null;

  if (!draft) {
    return {
      completedCount: 0,
      requiredCount: config.steps.filter((s) => s.required).length,
      percentComplete: 0,
      isComplete: false,
      isStale: false,
    };
  }

  const completedCount = config.steps.filter(
    (s) => draft.stepStatuses[s.stepId] === 'complete'
  ).length;
  const requiredCount = config.steps.filter((s) => s.required).length;
  const isComplete = computeIsComplete(config.steps, draft.stepStatuses);
  const percentComplete = computePercentComplete(config.steps, draft.stepStatuses);
  const isStale = Date.now() - new Date(draft.savedAt).getTime() > STALE_THRESHOLD_MS;

  return { completedCount, requiredCount, percentComplete, isComplete, isStale };
}

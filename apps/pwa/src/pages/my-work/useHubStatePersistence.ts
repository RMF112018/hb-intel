/**
 * useHubStatePersistence — P2-B2 §4–§5.
 * Wires @hbc/session-state draft persistence for the hub's query seed
 * and return UI state.
 */
import { useAutoSaveDraft, useDraft } from '@hbc/session-state';
import { HUB_DRAFT_KEYS, HUB_DRAFT_TTL } from './hubStateTypes.js';
import type { IMyWorkQuerySeedDraft, IMyWorkReturnState } from './hubStateTypes.js';
import type { IAutoSaveDraftResult } from '@hbc/session-state';
import type { IUseDraftResult } from '@hbc/session-state';

export interface IHubStatePersistence {
  querySeed: IAutoSaveDraftResult<IMyWorkQuerySeedDraft>;
  returnState: IUseDraftResult<IMyWorkReturnState>;
}

export function useHubStatePersistence(): IHubStatePersistence {
  const querySeed = useAutoSaveDraft<IMyWorkQuerySeedDraft>(
    HUB_DRAFT_KEYS.querySeed,
    HUB_DRAFT_TTL.querySeed,
    500,
  );

  const returnState = useDraft<IMyWorkReturnState>(
    HUB_DRAFT_KEYS.returnState,
    HUB_DRAFT_TTL.returnState,
  );

  return { querySeed, returnState };
}

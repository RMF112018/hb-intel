/**
 * Action mutation hook — SF29-T04
 * Handles replay-safe actions (offline queueable) and non-replayable actions (deep-link only).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnectivity, useSessionState } from '@hbc/session-state';
import { useMyWorkContext } from './MyWorkContext.js';
import { myWorkKeys } from './queryKeys.js';
import { applyStateTransition } from '../normalization/lifecycle.js';
import { MY_WORK_REPLAYABLE_ACTIONS } from '../constants/index.js';
import type { IMyWorkItem, IMyWorkCommandResult, MyWorkState } from '../types/index.js';

export interface IMyWorkActionRequest {
  actionKey: string;
  item: IMyWorkItem;
  payload?: unknown;
}

export interface IMyWorkActionResult extends IMyWorkCommandResult {
  cannotReplayOffline?: boolean;
  deepLinkHref?: string;
}

export interface IUseMyWorkActionsResult {
  executeAction: (request: IMyWorkActionRequest) => void;
  isPending: boolean;
  lastResult: IMyWorkActionResult | undefined;
}

const ACTION_TO_STATE: Record<string, MyWorkState> = {
  'mark-read': 'active',
  defer: 'deferred',
  undefer: 'active',
  'pin-today': 'active',
  'pin-week': 'active',
  'waiting-on': 'waiting',
};

function isReplayable(actionKey: string): boolean {
  return (MY_WORK_REPLAYABLE_ACTIONS as readonly string[]).includes(actionKey);
}

export function useMyWorkActions(): IUseMyWorkActionsResult {
  const { context } = useMyWorkContext();
  const connectivity = useConnectivity();
  const { queueOperation } = useSessionState();
  const queryClient = useQueryClient();
  const userId = context.currentUserId;

  const mutation = useMutation<IMyWorkActionResult, Error, IMyWorkActionRequest>({
    mutationFn: async (request: IMyWorkActionRequest): Promise<IMyWorkActionResult> => {
      const { actionKey, item } = request;
      const isOnline = connectivity === 'online';

      if (isReplayable(actionKey)) {
        const targetState = ACTION_TO_STATE[actionKey];

        // add-note-to-self has no state transition
        if (targetState) {
          const transition = applyStateTransition(item, targetState, new Date().toISOString());
          if (!transition.ok) {
            return { success: false, message: transition.message };
          }
        }

        if (!isOnline) {
          queueOperation({
            type: 'api-mutation',
            target: `my-work/${actionKey}/${item.workItemId}`,
            payload: request.payload ?? null,
            maxRetries: 3,
          });
        }

        return {
          success: true,
          affectedWorkItemIds: [item.workItemId],
        };
      }

      // Non-replayable action
      const deepLinkHref = item.context.href;
      if (!isOnline) {
        return { success: false, cannotReplayOffline: true, deepLinkHref };
      }
      return { success: true, deepLinkHref };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myWorkKeys.all(userId) });
    },
  });

  return {
    executeAction: mutation.mutate,
    isPending: mutation.isPending,
    lastResult: mutation.data,
  };
}

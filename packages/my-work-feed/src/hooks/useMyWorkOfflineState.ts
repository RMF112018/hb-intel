/**
 * Offline state hook — SF29-T04
 * Reads connectivity + queued operations from session-state and cache metadata from QueryClient.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useConnectivity, useSessionState } from '@hbc/session-state';
import { useMyWorkContext } from './MyWorkContext.js';
import { myWorkKeys } from './queryKeys.js';
import type { IMyWorkOfflineState } from '../types/index.js';

export interface IUseMyWorkOfflineStateResult {
  offlineState: IMyWorkOfflineState;
  triggerSync: () => Promise<void>;
}

export function useMyWorkOfflineState(): IUseMyWorkOfflineStateResult {
  const { context } = useMyWorkContext();
  const connectivity = useConnectivity();
  const sessionState = useSessionState();
  const queryClient = useQueryClient();
  const userId = context.currentUserId;

  const myWorkOps = sessionState.queuedOperations.filter((op) =>
    op.target.startsWith('my-work/'),
  );

  const feedQueryState = queryClient.getQueryState(myWorkKeys.feed(userId, {}));
  const lastSuccessfulSyncIso = feedQueryState?.dataUpdatedAt
    ? new Date(feedQueryState.dataUpdatedAt).toISOString()
    : '';

  const cachedData = queryClient.getQueryData(myWorkKeys.feed(userId, {})) as
    | { items?: unknown[] }
    | undefined;
  const cachedItemCount = cachedData?.items?.length ?? 0;

  const offlineState: IMyWorkOfflineState = {
    isOnline: connectivity === 'online',
    lastSuccessfulSyncIso,
    cachedItemCount,
    queuedActionCount: myWorkOps.length,
    queuedActions: myWorkOps.map((op) => {
      const parts = op.target.split('/');
      return {
        actionKey: parts[1] ?? '',
        workItemId: parts[2] ?? '',
        payload: op.payload,
        queuedAtIso: op.createdAt,
      };
    }),
  };

  return {
    offlineState,
    triggerSync: sessionState.triggerSync,
  };
}

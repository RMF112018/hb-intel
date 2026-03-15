import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyWorkProvider } from '../src/hooks/MyWorkContext.js';
import { MyWorkPanelStoreProvider } from '../src/store/MyWorkPanelStore.js';
import { createMockRuntimeContext, createMockMyWorkFeedResult } from '../testing/index.js';
import { mockMyWorkScenarios } from '../testing/mockMyWorkScenarios.js';
import type { IMyWorkRuntimeContext } from '../src/types/index.js';

/**
 * Storybook decorator that pre-populates the query cache with mock feed data.
 * Use this for components that call useMyWork/useMyWorkCounts internally.
 */
export function createMockFeedDecorator(options?: {
  context?: Partial<IMyWorkRuntimeContext>;
}) {
  const context = createMockRuntimeContext(options?.context);
  const feedResult = createMockMyWorkFeedResult({
    items: [
      mockMyWorkScenarios.overdueOwnedAction,
      mockMyWorkScenarios.blockedWithDependency,
      mockMyWorkScenarios.unacknowledgedHandoff,
      mockMyWorkScenarios.dedupedBicNotification,
      mockMyWorkScenarios.replayQueuedAction,
    ],
    totalCount: 5,
    unreadCount: 2,
    nowCount: 2,
    blockedCount: 1,
    waitingCount: 1,
    deferredCount: 0,
  });

  return function MockFeedDecorator(Story: React.FC) {
    const queryClient = React.useMemo(() => {
      const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      qc.setQueryData(
        ['my-work', context.currentUserId, 'feed', {}],
        feedResult,
      );
      return qc;
    }, []);

    return (
      <QueryClientProvider client={queryClient}>
        <MyWorkProvider context={context}>
          <MyWorkPanelStoreProvider>
            <Story />
          </MyWorkPanelStoreProvider>
        </MyWorkProvider>
      </QueryClientProvider>
    );
  };
}

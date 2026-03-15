/**
 * Shared test wrapper for hook tests — SF29-T04
 * Composes QueryClientProvider → MyWorkProvider → MyWorkPanelStoreProvider.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyWorkProvider } from '../hooks/MyWorkContext.js';
import { MyWorkPanelStoreProvider } from '../store/MyWorkPanelStore.js';
import { createMockRuntimeContext } from '@hbc/my-work-feed/testing';
import type { IMyWorkRuntimeContext, IMyWorkQuery } from '../types/index.js';
import type { ReactNode } from 'react';

export interface ITestWrapperOptions {
  context?: IMyWorkRuntimeContext;
  defaultQuery?: IMyWorkQuery;
  queryClient?: QueryClient;
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function createTestWrapper(options?: ITestWrapperOptions) {
  const queryClient = options?.queryClient ?? createTestQueryClient();
  const context = options?.context ?? createMockRuntimeContext();
  const defaultQuery = options?.defaultQuery;

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MyWorkProvider context={context} defaultQuery={defaultQuery}>
          <MyWorkPanelStoreProvider>{children}</MyWorkPanelStoreProvider>
        </MyWorkProvider>
      </QueryClientProvider>
    );
  };
}

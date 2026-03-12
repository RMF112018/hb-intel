/**
 * SF18-T08 shared hook/component test wrappers.
 *
 * @design D-SF18-T08
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { RenderOptions, RenderResult } from '@testing-library/react';

export function createQueryClientForTests(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithQueryClient(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult & { queryClient: QueryClient } {
  const queryClient = createQueryClientForTests();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const result = render(ui, {
    wrapper: Wrapper,
    ...options,
  });

  return {
    ...result,
    queryClient,
  };
}

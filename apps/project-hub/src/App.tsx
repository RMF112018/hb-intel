/**
 * App root — Provider hierarchy for SPFx webpart.
 * FluentProvider > QueryClientProvider > HbcErrorBoundary > RouterProvider
 */
import { FluentProvider } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { hbcLightTheme, HbcErrorBoundary } from '@hbc/ui-kit';
import { defaultQueryOptions } from '@hbc/query-hooks';
import { createWebpartRouter } from './router/index.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: defaultQueryOptions },
});

const router = createWebpartRouter();

export function App(): React.ReactNode {
  return (
    <FluentProvider theme={hbcLightTheme}>
      <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <RouterProvider router={router} />
        </HbcErrorBoundary>
      </QueryClientProvider>
    </FluentProvider>
  );
}

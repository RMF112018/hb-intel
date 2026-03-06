/**
 * App root — Provider hierarchy per Blueprint §2a, §2b, §2e.
 *
 * FluentProvider > QueryClientProvider > HbcErrorBoundary > RouterProvider
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { FluentProvider, HbcErrorBoundary, useHbcTheme } from '@hbc/ui-kit';
import { defaultQueryOptions } from '@hbc/query-hooks';
import type { AuthMode } from '@hbc/auth';
import { createAppRouter } from './router/index.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: defaultQueryOptions },
});

const router = createAppRouter();

interface AppProps {
  authMode: AuthMode;
}

export function App({ authMode: _authMode }: AppProps): React.ReactNode {
  const { resolvedTheme } = useHbcTheme();
  return (
    <FluentProvider theme={resolvedTheme}>
      <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <RouterProvider router={router} />
        </HbcErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </FluentProvider>
  );
}

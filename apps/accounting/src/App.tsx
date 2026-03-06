import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { FluentProvider, HbcErrorBoundary, useHbcTheme } from '@hbc/ui-kit';
import { defaultQueryOptions } from '@hbc/query-hooks';
import { createWebpartRouter } from './router/index.js';

const queryClient = new QueryClient({ defaultOptions: { queries: defaultQueryOptions } });
const router = createWebpartRouter();

export function App(): React.ReactNode {
  const { resolvedTheme } = useHbcTheme();
  return (
    <FluentProvider theme={resolvedTheme}>
      <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <RouterProvider router={router} />
        </HbcErrorBoundary>
      </QueryClientProvider>
    </FluentProvider>
  );
}

/**
 * App root — Provider hierarchy per Blueprint §2a, §2b, §2e.
 *
 * FluentProvider > MsalProvider (conditional) > QueryClientProvider
 *   > HbcErrorBoundary > RouterProvider > ReactQueryDevtools
 */
import { FluentProvider } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { hbcLightTheme, HbcErrorBoundary } from '@hbc/ui-kit';
import { defaultQueryOptions } from '@hbc/query-hooks';
import type { AuthMode } from '@hbc/auth';
import { createAppRouter } from './router/index.js';
import { MsalGuard } from './auth/MsalGuard.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: defaultQueryOptions },
});

const router = createAppRouter();

interface AppProps {
  authMode: AuthMode;
}

export function App({ authMode }: AppProps): React.ReactNode {
  const content = (
    <QueryClientProvider client={queryClient}>
      <HbcErrorBoundary>
        <RouterProvider router={router} />
      </HbcErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  return (
    <FluentProvider theme={hbcLightTheme}>
      {authMode === 'msal' ? <MsalGuard>{content}</MsalGuard> : content}
    </FluentProvider>
  );
}

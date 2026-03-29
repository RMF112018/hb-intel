import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { defaultQueryOptions } from '@hbc/query-hooks';
import { createWebpartRouter } from './router/index.js';

const queryClient = new QueryClient({ defaultOptions: { queries: defaultQueryOptions } });
const router = createWebpartRouter();

interface AppProps {
  spfxContext?: { pageContext: { user: { loginName: string } } };
}

export function App({ spfxContext }: AppProps): React.ReactNode {
  // SPFx-hosted surfaces run inside SharePoint's always-light chrome.
  // Force light theme to prevent OS dark-mode from creating visual incoherence.
  const forceTheme = spfxContext ? 'light' as const : undefined;

  return (
    <HbcThemeProvider forceTheme={forceTheme}>
      <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <ComplexityProvider spfxContext={spfxContext}>
            <RouterProvider router={router} />
          </ComplexityProvider>
        </HbcErrorBoundary>
      </QueryClientProvider>
    </HbcThemeProvider>
  );
}

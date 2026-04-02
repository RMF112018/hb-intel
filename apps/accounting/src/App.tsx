import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary, HbcToastProvider } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { defaultQueryOptions } from '@hbc/query-hooks';
import { createWebpartRouter } from './router/index.js';
import { AccountingBackendProvider } from './backend/AccountingBackendContext.js';

const queryClient = new QueryClient({ defaultOptions: { queries: defaultQueryOptions } });
const router = createWebpartRouter();

interface AppProps {
  spfxContext?: { pageContext: { user: { loginName: string } } };
  /** SPFx API token provider for production-mode auth. */
  getApiToken?: () => Promise<string>;
}

export function App({ spfxContext, getApiToken }: AppProps): React.ReactNode {
  return (
    <HbcThemeProvider>
      <HbcToastProvider>
        <QueryClientProvider client={queryClient}>
          <HbcErrorBoundary>
            <ComplexityProvider spfxContext={spfxContext}>
              <AccountingBackendProvider getApiToken={getApiToken}>
                <RouterProvider router={router} />
              </AccountingBackendProvider>
            </ComplexityProvider>
          </HbcErrorBoundary>
        </QueryClientProvider>
      </HbcToastProvider>
    </HbcThemeProvider>
  );
}

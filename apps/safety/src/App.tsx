import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { defaultQueryOptions } from '@hbc/query-hooks';
import {
  SafetyRepositoryProvider,
  configureSafetyListGuids,
  createSafetyInspectionRepository,
  type SafetyGuidOverlay,
  type SpHttpClient,
} from '@hbc/features-safety';
import { createWebpartRouter } from './router/index.js';

const queryClient = new QueryClient({ defaultOptions: { queries: defaultQueryOptions } });
const router = createWebpartRouter();

interface SpfxLikeContext {
  pageContext?: { user?: { loginName?: string } };
  spHttpClient?: unknown;
}

interface AppProps {
  spfxContext?: unknown;
}

export function App({ spfxContext }: AppProps): React.ReactNode {
  const typed = spfxContext as SpfxLikeContext | undefined;
  const repository = useMemo(() => {
    if (typeof window !== 'undefined') {
      const overlay = (window as unknown as { __HB_SAFETY_LIST_GUIDS__?: SafetyGuidOverlay })
        .__HB_SAFETY_LIST_GUIDS__;
      if (overlay) configureSafetyListGuids(overlay);
    }
    const client = adaptSpfxHttpClient(typed);
    if (client) {
      return createSafetyInspectionRepository({
        mode: 'sharepoint',
        sharepoint: { client },
      });
    }
    return createSafetyInspectionRepository({ mode: 'mock' });
  }, [typed]);

  // Safety is office-only (Phase-2 G-01): lock the theme to light so no
  // shell/field-mode inheritance can surface the field theme on this
  // SPFx-over-SharePoint surface. See plan §3.
  return (
    <HbcThemeProvider forceTheme="light">
      <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <ComplexityProvider
            spfxContext={
              typed?.pageContext?.user?.loginName
                ? { pageContext: { user: { loginName: typed.pageContext.user.loginName } } }
                : undefined
            }
          >
            <SafetyRepositoryProvider repository={repository}>
              <RouterProvider router={router} />
            </SafetyRepositoryProvider>
          </ComplexityProvider>
        </HbcErrorBoundary>
      </QueryClientProvider>
    </HbcThemeProvider>
  );
}

interface SpHttpClientLike {
  get: (url: string, configuration: unknown, options?: Record<string, unknown>) => Promise<Response>;
  post: (url: string, configuration: unknown, options?: Record<string, unknown>) => Promise<Response>;
}

function adaptSpfxHttpClient(spfxContext?: SpfxLikeContext): SpHttpClient | null {
  const sp = spfxContext?.spHttpClient as SpHttpClientLike | undefined;
  if (!sp || typeof sp.get !== 'function' || typeof sp.post !== 'function') return null;
  const SPHttpClientConfig = 1;
  return {
    get: (url, init) =>
      sp.get(url, SPHttpClientConfig, {
        headers: init?.headers,
      }),
    post: (url, body, init) =>
      sp.post(url, SPHttpClientConfig, {
        headers: init?.headers,
        body: body as BodyInit,
      }),
  };
}

/**
 * App root — Provider hierarchy per Blueprint §2a, §2b, §2e.
 *
 * HbcThemeProvider > MsalProvider (conditional) > QueryClientProvider
 *   > HbcErrorBoundary > RouterProvider > ReactQueryDevtools
 *   > DevToolbar (DEV only — D-PH5C-06/D-PH5C-02)
 */
import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary } from '@hbc/ui-kit';
import { defaultQueryOptions } from '@hbc/query-hooks';
import type { AuthMode } from '@hbc/auth';
import { createAppRouter } from './router/index.js';
import { MsalGuard } from './auth/MsalGuard.js';

// D-PH5C-06/D-PH5C-02: Lazily load persona switcher only in DEV mode — zero cost in production.
// ALIGNMENT: ShellCore.tsx PH5C.4 pattern.
let DevToolbar: ComponentType | null = null;
if (import.meta.env.DEV) {
  DevToolbar = lazy(() =>
    import('@hbc/shell/dev-toolbar').then((m) => ({ default: m.DevToolbar })),
  );
}

const queryClient = new QueryClient({
  defaultOptions: { queries: defaultQueryOptions },
});

const router = createAppRouter();

interface AppProps {
  authMode: AuthMode;
}

export function App({ authMode }: AppProps): React.ReactNode {
  const routerContent = (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  return (
    <HbcThemeProvider>
      <HbcErrorBoundary>
        {authMode === 'msal' ? <MsalGuard>{routerContent}</MsalGuard> : routerContent}
      </HbcErrorBoundary>
      {import.meta.env.DEV && DevToolbar ? (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      ) : null}
    </HbcThemeProvider>
  );
}

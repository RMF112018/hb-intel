/**
 * App root — Provider hierarchy per Blueprint §2a, §2b, §2e.
 *
 * HbcThemeProvider > MsalProvider (conditional) > QueryClientProvider
 *   > HbcErrorBoundary > RouterProvider > ReactQueryDevtools (DEV only)
 *   > DevToolbar (DEV only — D-PH5C-06/D-PH5C-02)
 */
import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { SessionStateProvider } from '@hbc/session-state';
import type { OperationExecutor } from '@hbc/session-state';
import { defaultQueryOptions } from '@hbc/query-hooks';
import type { AuthMode } from '@hbc/auth';
import { useAuthStore } from '@hbc/auth';
import { createProvisioningApiClient } from '@hbc/provisioning';
import { resolveSessionToken } from './utils/resolveSessionToken.js';
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

// UIF-010: Gate React Query devtools behind DEV — same pattern as DevToolbar.
let ReactQueryDevtoolsLazy: ComponentType<{ initialIsOpen: boolean }> | null = null;
if (import.meta.env.DEV) {
  ReactQueryDevtoolsLazy = lazy(() =>
    import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
  );
}

const queryClient = new QueryClient({
  defaultOptions: { queries: defaultQueryOptions },
});

/**
 * W0-G5-T04: Operation executor for queued offline actions.
 * Runs outside React (called by SyncEngine on reconnect).
 * Resolves auth imperatively via useAuthStore.getState().
 */
const pwaExecutor: OperationExecutor = async (operation) => {
  const session = useAuthStore.getState().session;
  const token = resolveSessionToken(session);
  const client = createProvisioningApiClient(
    import.meta.env.VITE_API_BASE_URL ?? '',
    async () => token,
  );

  if (operation.type === 'api-mutation' && operation.target === 'submitRequest') {
    await client.submitRequest(operation.payload as Parameters<typeof client.submitRequest>[0]);
    return;
  }

  // Wave 0: only submitRequest is queued. Log and skip unknown types.
  if (import.meta.env.DEV) {
    console.warn(`[PWA Executor] Unhandled operation type: ${operation.type}/${operation.target}`);
  }
};


const router = createAppRouter();

interface AppProps {
  authMode: AuthMode;
}

export function App({ authMode }: AppProps): React.ReactNode {
  const routerContent = (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && ReactQueryDevtoolsLazy && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsLazy initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );

  return (
    <HbcThemeProvider>
      <HbcErrorBoundary>
        <ComplexityProvider>
          <SessionStateProvider executor={pwaExecutor}>
            {authMode === 'msal' ? <MsalGuard>{routerContent}</MsalGuard> : routerContent}
          </SessionStateProvider>
        </ComplexityProvider>
      </HbcErrorBoundary>
      {import.meta.env.DEV && DevToolbar ? (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      ) : null}
    </HbcThemeProvider>
  );
}

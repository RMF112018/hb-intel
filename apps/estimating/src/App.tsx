import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { SessionStateProvider } from '@hbc/session-state';
import type { OperationExecutor } from '@hbc/session-state';
import { defaultQueryOptions } from '@hbc/query-hooks';
import { createWebpartRouter } from './router/index.js';
import {
  ProjectSetupBackendProvider,
  useProjectSetupBackend,
} from './project-setup/backend/ProjectSetupBackendContext.js';

const queryClient = new QueryClient({ defaultOptions: { queries: defaultQueryOptions } });
const router = createWebpartRouter();

/**
 * Estimating currently uses session-state for draft persistence and
 * connectivity/sync UI on Project Setup routes only.
 *
 * The SPFx limited-release surface does not dispatch queued offline mutations,
 * so the executor is intentionally a no-op until that workflow exists here.
 */
const estimatingSessionExecutor: OperationExecutor = async () => {};

interface AppProps {
  spfxContext?: { pageContext: { user: { loginName: string } } };
}

function AppRouter(): React.ReactNode {
  const { backendMode } = useProjectSetupBackend();

  return <RouterProvider key={backendMode} router={router} />;
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
            <SessionStateProvider executor={estimatingSessionExecutor}>
              <ProjectSetupBackendProvider>
                <AppRouter />
              </ProjectSetupBackendProvider>
            </SessionStateProvider>
          </ComplexityProvider>
        </HbcErrorBoundary>
      </QueryClientProvider>
    </HbcThemeProvider>
  );
}

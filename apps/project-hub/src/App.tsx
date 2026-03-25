/**
 * App root — Provider hierarchy for SPFx webpart.
 * HbcThemeProvider > QueryClientProvider > HbcErrorBoundary > RouterProvider
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { HbcThemeProvider, HbcErrorBoundary, WorkspacePageShell } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { defaultQueryOptions } from '@hbc/query-hooks';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { IEmptyStateContext, ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import { createWebpartRouter } from './router/index.js';
import type { ProjectHubSpfxInitState } from './spfx/initializeProjectHubContext.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: defaultQueryOptions },
});

const router = createWebpartRouter();

interface AppProps {
  spfxContext?: { pageContext: { user: { loginName: string } } };
  initState?: ProjectHubSpfxInitState;
}

const INIT_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'loading-failed',
    heading: 'Project context unavailable',
    description:
      context.isLoadError
        ? 'Project Hub could not initialize this SharePoint site from the canonical project registry.'
        : 'Project Hub could not resolve a canonical project for this SharePoint site.',
    coachingTip:
      'Confirm the project site is associated to a canonical registry record before using the Project Hub web part.',
  }),
};

function ProjectHubInitializationFallback({
  initState,
}: {
  initState: Exclude<ProjectHubSpfxInitState, { status: 'resolved' }>;
}): React.ReactNode {
  const context: IEmptyStateContext = {
    module: 'project-hub',
    view: 'spfx-initialization',
    hasActiveFilters: false,
    hasPermission: initState.status !== 'not-found',
    isFirstVisit: false,
    currentUserRole: 'user',
    isLoadError: initState.status === 'error',
  };

  return (
    <WorkspacePageShell layout="detail" title="Project Hub">
      <HbcSmartEmptyState
        config={INIT_EMPTY_CONFIG}
        context={context}
        variant="full-page"
      />
    </WorkspacePageShell>
  );
}

export function App({ spfxContext, initState }: AppProps): React.ReactNode {
  return (
    <HbcThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <ComplexityProvider spfxContext={spfxContext}>
            {initState && initState.status !== 'resolved' ? (
              <ProjectHubInitializationFallback initState={initState} />
            ) : (
              <RouterProvider router={router} />
            )}
          </ComplexityProvider>
        </HbcErrorBoundary>
      </QueryClientProvider>
    </HbcThemeProvider>
  );
}

import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

/**
 * Deployment posture: Project Setup only.
 *
 * Bids and Templates routes are not registered in this deployment.
 * The index route redirects to /project-setup.
 * Any unmatched route falls through to the root catch-all which also redirects.
 *
 * To re-enable Bids/Templates, add their routes back to webpartRoutes and
 * update the toolPickerItems in root-route.tsx.
 *
 * @see docs/architecture/reviews/estimating-project-setup-only-deployment-remediation.md
 */

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    useNavStore.getState().setActiveWorkspace('estimating');
    throw redirect({ to: '/project-setup' });
  },
});

const projectSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup',
  component: lazyRouteComponent(() => import('../pages/ProjectSetupPage.js').then((m) => ({ default: m.ProjectSetupPage }))),
});

const newProjectSetupRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup/new',
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as 'new-request' | 'clarification-return') ?? 'new-request',
    requestId: search.requestId as string | undefined,
  }),
  component: lazyRouteComponent(() => import('../pages/NewRequestPage.js').then((m) => ({ default: m.NewRequestPage }))),
});

const requestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup/$requestId',
  component: lazyRouteComponent(() => import('../pages/RequestDetailPage.js').then((m) => ({ default: m.RequestDetailPage }))),
});

export const webpartRoutes = [
  indexRoute,
  projectSetupRoute,
  newProjectSetupRequestRoute,
  requestDetailRoute,
];

import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

/**
 * Project Setup Requests — route definitions.
 *
 * This SPFx surface is scoped exclusively to Project Setup Requests.
 * Bids belong in a future Estimating SPFx surface; Templates belong
 * in a future Admin SPFx surface.
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

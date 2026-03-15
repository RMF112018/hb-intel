import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    useNavStore.getState().setActiveWorkspace('estimating');
  },
  component: lazyRouteComponent(() => import('../pages/BidsPage.js').then((m) => ({ default: m.BidsPage }))),
});

const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  component: lazyRouteComponent(() => import('../pages/TemplatesPage.js').then((m) => ({ default: m.TemplatesPage }))),
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
  templatesRoute,
  projectSetupRoute,
  newProjectSetupRequestRoute,
  requestDetailRoute,
];

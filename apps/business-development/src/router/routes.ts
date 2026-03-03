import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('business-development'); },
  component: lazyRouteComponent(() => import('../pages/PipelinePage.js').then((m) => ({ default: m.PipelinePage }))),
});

const opportunitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/opportunities',
  component: lazyRouteComponent(() => import('../pages/OpportunitiesPage.js').then((m) => ({ default: m.OpportunitiesPage }))),
});

export const webpartRoutes = [indexRoute, opportunitiesRoute];

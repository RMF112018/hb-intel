import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('safety'); },
  component: lazyRouteComponent(() => import('../pages/IncidentsPage.js').then((m) => ({ default: m.IncidentsPage }))),
});

const inspectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inspections',
  component: lazyRouteComponent(() => import('../pages/InspectionsPage.js').then((m) => ({ default: m.InspectionsPage }))),
});

export const webpartRoutes = [indexRoute, inspectionsRoute];

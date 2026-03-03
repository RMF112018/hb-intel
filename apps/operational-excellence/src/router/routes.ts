import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('operational-excellence'); },
  component: lazyRouteComponent(() => import('../pages/MetricsPage.js').then((m) => ({ default: m.MetricsPage }))),
});

const processRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/process-improvement',
  component: lazyRouteComponent(() => import('../pages/ProcessImprovementPage.js').then((m) => ({ default: m.ProcessImprovementPage }))),
});

export const webpartRoutes = [indexRoute, processRoute];

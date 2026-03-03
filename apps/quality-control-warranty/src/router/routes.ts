import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('quality-control-warranty'); },
  component: lazyRouteComponent(() => import('../pages/QualityChecksPage.js').then((m) => ({ default: m.QualityChecksPage }))),
});

const warrantyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/warranty',
  component: lazyRouteComponent(() => import('../pages/WarrantyTrackingPage.js').then((m) => ({ default: m.WarrantyTrackingPage }))),
});

export const webpartRoutes = [indexRoute, warrantyRoute];

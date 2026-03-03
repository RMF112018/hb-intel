/**
 * App routes — Foundation Plan Phase 6.
 * 3 routes: / (home), /observations, /safety-monitoring.
 * Each route lazy-loads its page component.
 */
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    useNavStore.getState().setActiveWorkspace('site-control');
  },
  component: lazyRouteComponent(
    () => import('../pages/HomePage.js').then((m) => ({ default: m.HomePage })),
  ),
});

const observationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observations',
  component: lazyRouteComponent(
    () => import('../pages/ObservationsPage.js').then((m) => ({ default: m.ObservationsPage })),
  ),
});

const safetyMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/safety-monitoring',
  component: lazyRouteComponent(
    () => import('../pages/SafetyMonitoringPage.js').then((m) => ({ default: m.SafetyMonitoringPage })),
  ),
});

export const appRoutes = [indexRoute, observationsRoute, safetyMonitoringRoute];

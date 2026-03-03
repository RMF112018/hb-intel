import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('human-resources'); },
  component: lazyRouteComponent(() => import('../pages/StaffingPage.js').then((m) => ({ default: m.StaffingPage }))),
});

const certificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/certifications',
  component: lazyRouteComponent(() => import('../pages/CertificationsPage.js').then((m) => ({ default: m.CertificationsPage }))),
});

export const webpartRoutes = [indexRoute, certificationsRoute];

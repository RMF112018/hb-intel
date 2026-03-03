import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('admin'); },
  component: lazyRouteComponent(() => import('../pages/SystemSettingsPage.js').then((m) => ({ default: m.SystemSettingsPage }))),
});

const errorLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/error-log',
  component: lazyRouteComponent(() => import('../pages/ErrorLogPage.js').then((m) => ({ default: m.ErrorLogPage }))),
});

const provisioningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provisioning-failures',
  component: lazyRouteComponent(() => import('../pages/ProvisioningFailuresPage.js').then((m) => ({ default: m.ProvisioningFailuresPage }))),
});

export const webpartRoutes = [indexRoute, errorLogRoute, provisioningRoute];

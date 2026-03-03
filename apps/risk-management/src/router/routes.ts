import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('risk-management'); },
  component: lazyRouteComponent(() => import('../pages/RiskRegisterPage.js').then((m) => ({ default: m.RiskRegisterPage }))),
});

const mitigationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mitigation',
  component: lazyRouteComponent(() => import('../pages/MitigationPage.js').then((m) => ({ default: m.MitigationPage }))),
});

export const webpartRoutes = [indexRoute, mitigationRoute];

import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('leadership'); },
  component: lazyRouteComponent(() => import('../pages/KpiDashboardPage.js').then((m) => ({ default: m.KpiDashboardPage }))),
});

const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portfolio',
  component: lazyRouteComponent(() => import('../pages/PortfolioOverviewPage.js').then((m) => ({ default: m.PortfolioOverviewPage }))),
});

export const webpartRoutes = [indexRoute, portfolioRoute];

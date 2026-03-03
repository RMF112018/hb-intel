import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('accounting'); },
  component: lazyRouteComponent(() => import('../pages/OverviewPage.js').then((m) => ({ default: m.OverviewPage }))),
});

const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  component: lazyRouteComponent(() => import('../pages/BudgetsPage.js').then((m) => ({ default: m.BudgetsPage }))),
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices',
  component: lazyRouteComponent(() => import('../pages/InvoicesPage.js').then((m) => ({ default: m.InvoicesPage }))),
});

export const webpartRoutes = [indexRoute, budgetsRoute, invoicesRoute];

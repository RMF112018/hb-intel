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

const projectReviewQueueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-review',
  component: lazyRouteComponent(() =>
    import('../pages/ProjectReviewQueuePage.js').then((m) => ({ default: m.ProjectReviewQueuePage }))
  ),
});

const projectReviewDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-review/$requestId',
  component: lazyRouteComponent(() =>
    import('../pages/ProjectReviewDetailPage.js').then((m) => ({ default: m.ProjectReviewDetailPage }))
  ),
});

export const webpartRoutes = [indexRoute, budgetsRoute, invoicesRoute, projectReviewQueueRoute, projectReviewDetailRoute];

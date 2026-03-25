/**
 * Webpart-scoped routes — Project Hub.
 */
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    useNavStore.getState().setActiveWorkspace('project-hub');
  },
  component: lazyRouteComponent(
    () => import('../pages/DashboardPage.js').then((m) => ({ default: m.DashboardPage })),
  ),
});

const preconstructionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/preconstruction',
  component: lazyRouteComponent(
    () => import('../pages/PreconstructionPage.js').then((m) => ({ default: m.PreconstructionPage })),
  ),
});

const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents',
  component: lazyRouteComponent(
    () => import('../pages/DocumentsPage.js').then((m) => ({ default: m.DocumentsPage })),
  ),
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team',
  component: lazyRouteComponent(
    () => import('../pages/TeamPage.js').then((m) => ({ default: m.TeamPage })),
  ),
});

export const webpartRoutes = [indexRoute, preconstructionRoute, documentsRoute, teamRoute];

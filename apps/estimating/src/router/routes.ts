import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('estimating'); },
  component: lazyRouteComponent(() => import('../pages/BidsPage.js').then((m) => ({ default: m.BidsPage }))),
});

const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  component: lazyRouteComponent(() => import('../pages/TemplatesPage.js').then((m) => ({ default: m.TemplatesPage }))),
});

const projectSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup',
  component: lazyRouteComponent(() => import('../pages/ProjectSetupPage.js').then((m) => ({ default: m.ProjectSetupPage }))),
});

export const webpartRoutes = [indexRoute, templatesRoute, projectSetupRoute];

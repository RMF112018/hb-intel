/**
 * Webpart-scoped routes — Project Hub.
 */
import { createElement } from 'react';
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import {
  PROJECT_HUB_SPFX_MODULES,
  type ProjectHubSpfxModuleSlug,
} from '@hbc/features-project-hub';
import { rootRoute } from './root-route.js';
import { ProjectModulePage } from '../pages/ProjectModulePage.js';

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

const moduleRoutes = PROJECT_HUB_SPFX_MODULES.map((module) => createRoute({
  getParentRoute: () => rootRoute,
  path: `/${module.slug}`,
  beforeLoad: () => {
    useNavStore.getState().setActiveWorkspace('project-hub');
  },
  component: () => createElement(ProjectModulePage, {
    moduleSlug: module.slug as ProjectHubSpfxModuleSlug,
  }),
}));

export const webpartRoutes = [indexRoute, ...moduleRoutes];

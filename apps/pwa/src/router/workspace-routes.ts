/**
 * Workspace routes — Blueprint §2c, §2f.
 * 14 workspace routes via createWorkspaceRoute() helper + index redirect.
 * Each route: syncs navStore in beforeLoad, lazy-loads page component.
 */
import { createRoute, redirect, lazyRouteComponent } from '@tanstack/react-router';
import type { WorkspaceId } from '@hbc/shell';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';
import { requireAuth, requireAdminAccessControl } from './route-guards.js';
import { WORKSPACE_TOOL_PICKERS, WORKSPACE_SIDEBARS } from './workspace-config.js';

function createWorkspaceRoute(
  workspaceId: WorkspaceId,
  importFn: () => Promise<{ default: React.ComponentType }>,
) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: workspaceId,
    beforeLoad: () => {
      requireAuth();
      const nav = useNavStore.getState();
      nav.setActiveWorkspace(workspaceId);

      // Set tool-picker items if defined for this workspace
      const toolPickerFactory = WORKSPACE_TOOL_PICKERS[workspaceId];
      if (toolPickerFactory) {
        nav.setToolPickerItems(toolPickerFactory(() => {}));
      }

      // Set sidebar items if defined for this workspace
      const sidebarFactory = WORKSPACE_SIDEBARS[workspaceId];
      if (sidebarFactory) {
        nav.setSidebarItems(sidebarFactory(() => {}));
      }
    },
    component: lazyRouteComponent(importFn),
  });
}

// Index route: / → /project-hub
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/project-hub' });
  },
});

// MVP workspace routes (Priority: Accounting → Estimating → Project Hub → Leadership → Business Development)
export const projectHubRoute = createWorkspaceRoute(
  'project-hub',
  () => import('../pages/ProjectHubPage.js').then((m) => ({ default: m.ProjectHubPage })),
);

export const accountingRoute = createWorkspaceRoute(
  'accounting',
  () => import('../pages/AccountingPage.js').then((m) => ({ default: m.AccountingPage })),
);

export const estimatingRoute = createWorkspaceRoute(
  'estimating',
  () => import('../pages/EstimatingPage.js').then((m) => ({ default: m.EstimatingPage })),
);

export const leadershipRoute = createWorkspaceRoute(
  'leadership',
  () => import('../pages/LeadershipPage.js').then((m) => ({ default: m.LeadershipPage })),
);

export const businessDevRoute = createWorkspaceRoute(
  'business-development',
  () => import('../pages/BusinessDevelopmentPage.js').then((m) => ({ default: m.BusinessDevelopmentPage })),
);

// Standard workspace routes
export const schedulingRoute = createWorkspaceRoute(
  'scheduling',
  () => import('../pages/SchedulingPage.js').then((m) => ({ default: m.SchedulingPage })),
);

export const buyoutRoute = createWorkspaceRoute(
  'buyout',
  () => import('../pages/BuyoutPage.js').then((m) => ({ default: m.BuyoutPage })),
);

export const complianceRoute = createWorkspaceRoute(
  'compliance',
  () => import('../pages/CompliancePage.js').then((m) => ({ default: m.CompliancePage })),
);

export const contractsRoute = createWorkspaceRoute(
  'contracts',
  () => import('../pages/ContractsPage.js').then((m) => ({ default: m.ContractsPage })),
);

export const riskRoute = createWorkspaceRoute(
  'risk',
  () => import('../pages/RiskPage.js').then((m) => ({ default: m.RiskPage })),
);

export const scorecardRoute = createWorkspaceRoute(
  'scorecard',
  () => import('../pages/ScorecardPage.js').then((m) => ({ default: m.ScorecardPage })),
);

export const pmpRoute = createWorkspaceRoute(
  'pmp',
  () => import('../pages/PmpPage.js').then((m) => ({ default: m.PmpPage })),
);

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  beforeLoad: () => {
    requireAuth();
    requireAdminAccessControl();
    const nav = useNavStore.getState();
    nav.setActiveWorkspace('admin');
  },
  component: lazyRouteComponent(
    () => import('../pages/AdminPage.js').then((m) => ({ default: m.AdminPage })),
  ),
});

export const siteControlRoute = createWorkspaceRoute(
  'site-control',
  () => import('../pages/SiteControlPage.js').then((m) => ({ default: m.SiteControlPage })),
);

// SPFx-only workspace routes (Phase 5 — 5 new workspaces)
export const safetyRoute = createWorkspaceRoute(
  'safety',
  () => import('../pages/SafetyPage.js').then((m) => ({ default: m.SafetyPage })),
);

export const qualityControlWarrantyRoute = createWorkspaceRoute(
  'quality-control-warranty',
  () => import('../pages/QualityControlWarrantyPage.js').then((m) => ({ default: m.QualityControlWarrantyPage })),
);

export const riskManagementRoute = createWorkspaceRoute(
  'risk-management',
  () => import('../pages/RiskManagementPage.js').then((m) => ({ default: m.RiskManagementPage })),
);

export const operationalExcellenceRoute = createWorkspaceRoute(
  'operational-excellence',
  () => import('../pages/OperationalExcellencePage.js').then((m) => ({ default: m.OperationalExcellencePage })),
);

export const humanResourcesRoute = createWorkspaceRoute(
  'human-resources',
  () => import('../pages/HumanResourcesPage.js').then((m) => ({ default: m.HumanResourcesPage })),
);

// 404 catch-all
export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: lazyRouteComponent(
    () => import('../pages/NotFoundPage.js').then((m) => ({ default: m.NotFoundPage })),
  ),
});

export const allRoutes = [
  indexRoute,
  projectHubRoute,
  accountingRoute,
  estimatingRoute,
  leadershipRoute,
  businessDevRoute,
  schedulingRoute,
  buyoutRoute,
  complianceRoute,
  contractsRoute,
  riskRoute,
  scorecardRoute,
  pmpRoute,
  adminRoute,
  siteControlRoute,
  safetyRoute,
  qualityControlWarrantyRoute,
  riskManagementRoute,
  operationalExcellenceRoute,
  humanResourcesRoute,
  notFoundRoute,
];

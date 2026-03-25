/**
 * Workspace routes — Blueprint §2c, §2f.
 * 14 workspace routes via createWorkspaceRoute() helper + index redirect.
 * Each route: syncs navStore in beforeLoad, lazy-loads page component.
 */
import { createElement } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { createRoute, redirect, lazyRouteComponent } from '@tanstack/react-router';
import type { WorkspaceId } from '@hbc/shell';
import { useNavStore, resolveLandingDecision, isMyWorkCohortEnabled } from '@hbc/shell';
import { useAuthStore } from '@hbc/auth';
import { rootRoute } from './root-route.js';
import { requireAuth, requireAdminAccessControl } from './route-guards.js';
import { WORKSPACE_TOOL_PICKERS, WORKSPACE_SIDEBARS } from './workspace-config.js';
import { triggerOnLeaveCapture } from '../pages/my-work/useHubReturnMemory.js';
import {
  ProjectHubControlCenterPage,
  ProjectHubNoAccessPage,
  ProjectHubPortfolioPage,
} from '../pages/ProjectHubPage.js';
import {
  resolveProjectHubProjectEntry,
  resolveProjectHubRootEntry,
  validateProjectHubSearch,
} from './projectHubRouting.js';

function createWorkspaceRoute(
  workspaceId: WorkspaceId,
  importFn: () => Promise<{ default: ComponentType }>,
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

function activateWorkspace(workspaceId: WorkspaceId): void {
  const nav = useNavStore.getState();
  nav.setActiveWorkspace(workspaceId);

  const toolPickerFactory = WORKSPACE_TOOL_PICKERS[workspaceId];
  if (toolPickerFactory) {
    nav.setToolPickerItems(toolPickerFactory(() => {}));
  }

  const sidebarFactory = WORKSPACE_SIDEBARS[workspaceId];
  if (sidebarFactory) {
    nav.setSidebarItems(sidebarFactory(() => {}));
  }
}

// Index route: / → cohort-aware landing (P2-B1 §11.3)
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const resolvedRoles = useAuthStore.getState().session?.resolvedRoles ?? [];
    const decision = resolveLandingDecision({
      resolvedRoles,
      runtimeMode: 'pwa',
      cohortEnabled: isMyWorkCohortEnabled(),
    });
    throw redirect({ to: decision.pathname });
  },
});

function ProjectHubRootRouteComponent(): ReactNode {
  const data = projectHubRoute.useLoaderData();
  const navigate = projectHubRoute.useNavigate();

  if (!data) {
    return createElement(ProjectHubNoAccessPage, {
      projects: [],
      reason: 'zero-projects',
    });
  }

  if (data.mode === 'portfolio') {
    return createElement(ProjectHubPortfolioPage, {
      projects: data.projects,
      onProjectSelect: (projectId: string) => {
        void navigate({ to: `/project-hub/${projectId}` });
      },
    });
  }

  return createElement(ProjectHubNoAccessPage, {
    projects: data.projects,
    reason: data.reason,
  });
}

function ProjectHubProjectRouteComponent(): ReactNode {
  const data = projectHubProjectRoute.useLoaderData();
  const navigate = projectHubProjectRoute.useNavigate();

  if (!data) {
    return createElement(ProjectHubNoAccessPage, {
      projects: [],
      reason: 'project-unavailable',
    });
  }

  if (data.mode === 'project') {
    return createElement(ProjectHubControlCenterPage, {
      project: data.project,
      projects: data.projects,
      section: data.section,
      onBackToPortfolio: () => {
        void navigate({ to: '/project-hub' });
      },
      onOpenReports: () => {
        void navigate({ to: `/project-hub/${data.project.id}/reports` });
      },
    });
  }

  return createElement(ProjectHubNoAccessPage, {
    projects: data.projects,
    reason: data.reason,
  });
}

function ProjectHubSectionRouteComponent(): ReactNode {
  const data = projectHubSectionRoute.useLoaderData();
  const navigate = projectHubSectionRoute.useNavigate();

  if (!data) {
    return createElement(ProjectHubNoAccessPage, {
      projects: [],
      reason: 'project-unavailable',
    });
  }

  if (data.mode === 'project') {
    return createElement(ProjectHubControlCenterPage, {
      project: data.project,
      projects: data.projects,
      section: data.section,
      onBackToPortfolio: () => {
        void navigate({ to: '/project-hub' });
      },
      onOpenReports: () => {
        void navigate({ to: `/project-hub/${data.project.id}/reports` });
      },
    });
  }

  return createElement(ProjectHubNoAccessPage, {
    projects: data.projects,
    reason: data.reason,
  });
}

// MVP workspace routes (Priority: Accounting → Estimating → Project Hub → Leadership → Business Development)
export const projectHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-hub',
  validateSearch: validateProjectHubSearch,
  beforeLoad: () => {
    requireAuth();
    activateWorkspace('project-hub');
  },
  loader: async () => {
    const result = await resolveProjectHubRootEntry();
    if (result.mode === 'redirect') {
      throw redirect({ to: result.redirectTo, replace: true });
    }
    return result;
  },
  component: ProjectHubRootRouteComponent,
});

export const projectHubProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-hub/$projectId',
  validateSearch: validateProjectHubSearch,
  beforeLoad: () => {
    requireAuth();
    activateWorkspace('project-hub');
  },
  loader: async ({ params }) => {
    const result = await resolveProjectHubProjectEntry(params.projectId, null);
    if (result.mode === 'redirect') {
      throw redirect({ to: result.redirectTo, replace: true });
    }
    return result;
  },
  component: ProjectHubProjectRouteComponent,
});

export const projectHubSectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-hub/$projectId/$section',
  validateSearch: validateProjectHubSearch,
  beforeLoad: () => {
    requireAuth();
    activateWorkspace('project-hub');
  },
  loader: async ({ params }) => {
    const result = await resolveProjectHubProjectEntry(params.projectId, params.section);
    if (result.mode === 'redirect') {
      throw redirect({ to: result.redirectTo, replace: true });
    }
    return result;
  },
  component: ProjectHubSectionRouteComponent,
});

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

// D-PH6F-6: Provisioning progress detail route (not a workspace — detail view with projectId param).
export const provisioningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'provisioning/$projectId',
  beforeLoad: () => {
    requireAuth();
  },
  component: lazyRouteComponent(
    () =>
      import('../routes/provisioning/ProvisioningProgressView.js').then((m) => ({
        default: m.ProvisioningProgressView,
      })),
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

// W0-G5-T03: Project setup wizard route with search params for mode/requestId.
export const projectSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'project-setup',
  validateSearch: (search: Record<string, unknown>): { mode: string; requestId?: string } => ({
    mode: (search.mode as string) ?? 'new-request',
    requestId: typeof search.requestId === 'string' ? search.requestId : undefined,
  }),
  beforeLoad: () => {
    requireAuth();
  },
  component: lazyRouteComponent(
    () =>
      import('../routes/project-setup/ProjectSetupPage.js').then((m) => ({
        default: m.ProjectSetupPage,
      })),
  ),
});

// W0-G5-T01: Requester's own request status list (non-workspace, auth-gated).
export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects',
  beforeLoad: () => {
    requireAuth();
  },
  component: lazyRouteComponent(
    () =>
      import('../routes/projects/ProjectsPage.js').then((m) => ({
        default: m.ProjectsPage,
      })),
  ),
});

// W0-G5-T05: Request detail / completion summary (non-workspace, auth-gated).
export const requestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'projects/$requestId',
  beforeLoad: () => {
    requireAuth();
  },
  component: lazyRouteComponent(
    () =>
      import('../routes/projects/RequestDetailPage.js').then((m) => ({
        default: m.RequestDetailPage,
      })),
  ),
});

// P2-B1 §11.2: /my-work route — personal work hub workspace.
// Uses direct createRoute (not createWorkspaceRoute) to support onLeave per P2-B2 §4.2.
export const myWorkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'my-work',
  // STT-03: Router-managed search params for KPI filter (replaces window.history.replaceState).
  validateSearch: (search: Record<string, unknown>): { filter?: string } => ({
    filter: typeof search.filter === 'string' ? search.filter : undefined,
  }),
  beforeLoad: () => {
    requireAuth();
    const nav = useNavStore.getState();
    nav.setActiveWorkspace('my-work');
    const toolPickerFactory = WORKSPACE_TOOL_PICKERS['my-work'];
    if (toolPickerFactory) {
      nav.setToolPickerItems(toolPickerFactory(() => {}));
    }
    const sidebarFactory = WORKSPACE_SIDEBARS['my-work'];
    if (sidebarFactory) {
      nav.setSidebarItems(sidebarFactory(() => {}));
    }
  },
  component: lazyRouteComponent(
    () => import('../pages/MyWorkPage.js').then((m) => ({ default: m.MyWorkPage })),
  ),
  // P2-B2 §4.2: Primary return-state capture trigger on SPA navigation away.
  onLeave: () => {
    triggerOnLeaveCapture();
  },
});

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
  projectHubProjectRoute,
  projectHubSectionRoute,
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
  provisioningRoute,
  siteControlRoute,
  safetyRoute,
  qualityControlWarrantyRoute,
  riskManagementRoute,
  operationalExcellenceRoute,
  humanResourcesRoute,
  projectSetupRoute,
  projectsRoute,
  requestDetailRoute,
  myWorkRoute,
  notFoundRoute,
];

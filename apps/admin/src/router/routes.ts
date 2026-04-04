import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { usePermissionStore } from '@hbc/auth';
import { rootRoute } from './root-route.js';
import { LEGACY_REDIRECTS } from './lane-registry.js';

/**
 * P5-03: Route definitions for the Admin operator console.
 *
 * Routes are derived from the canonical lane registry (P5-02).
 * Legacy routes redirect to their new lane paths for backward compatibility.
 */

const ADMIN_ACCESS_PERMISSION = 'admin:access-control:view';

function requireAdminAccessControl(): void {
  const permissionStore = usePermissionStore.getState();
  const hasPermission =
    permissionStore.hasPermission(ADMIN_ACCESS_PERMISSION) || permissionStore.hasPermission('*:*');
  if (!hasPermission) {
    throw redirect({ to: '/' });
  }
}

function adminBeforeLoad(): void {
  requireAdminAccessControl();
  useNavStore.getState().setActiveWorkspace('admin');
}

// --- Index route: operator landing ---

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    // Permission guard intentionally omitted on index to prevent infinite redirect loop.
    useNavStore.getState().setActiveWorkspace('admin');
  },
  component: lazyRouteComponent(() =>
    import('../pages/OperatorLandingPage.js').then((m) => ({ default: m.OperatorLandingPage })),
  ),
});

// --- Lane routes ---

const runsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/runs',
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: typeof search.projectId === 'string' ? search.projectId : undefined,
  }),
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/ProvisioningOversightPage.js').then((m) => ({
      default: m.ProvisioningOversightPage,
    })),
  ),
});

const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/OperationalDashboardPage.js').then((m) => ({
      default: m.OperationalDashboardPage,
    })),
  ),
});

const standardsConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/standards-config',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/StandardsConfigPage.js').then((m) => ({ default: m.StandardsConfigPage })),
  ),
});

const configRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/SystemSettingsPage.js').then((m) => ({ default: m.SystemSettingsPage })),
  ),
});

const errorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/errors',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/ErrorLogPage.js').then((m) => ({ default: m.ErrorLogPage })),
  ),
});

const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/SetupWizardPage.js').then((m) => ({ default: m.SetupWizardPage })),
  ),
});

const setupRunDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup/run/$runId',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/InstallRunDetailPage.js').then((m) => ({
      default: (props: Record<string, unknown>) => {
        const params = props as { runId?: string };
        return m.InstallRunDetailPage({ runId: params.runId ?? '' });
      },
    })),
  ),
});

const bindingStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup/bindings',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/BindingStatusPage.js').then((m) => ({ default: m.BindingStatusPage })),
  ),
});

const validationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/validation',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/ValidationLanePage.js').then((m) => ({ default: m.ValidationLanePage })),
  ),
});

const sharepointRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sharepoint',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/SharePointControlPage.js').then((m) => ({ default: m.SharePointControlPage })),
  ),
});

const entraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/entra',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/EntraLanePage.js').then((m) => ({ default: m.EntraLanePage })),
  ),
});

// --- White-glove routes (P9.1-08) ---

const whiteGloveConnectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/white-glove/connections',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/WhiteGloveConnectionsPage.js').then((m) => ({
      default: m.WhiteGloveConnectionsPage,
    })),
  ),
});

const whiteGloveReadinessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/white-glove/readiness',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/WhiteGloveReadinessPage.js').then((m) => ({
      default: m.WhiteGloveReadinessPage,
    })),
  ),
});

const whiteGloveLaunchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/white-glove/launch',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/WhiteGloveLaunchPage.js').then((m) => ({
      default: m.WhiteGloveLaunchPage,
    })),
  ),
});

const whiteGloveCheckpointsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/white-glove/checkpoints',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/WhiteGloveCheckpointPage.js').then((m) => ({
      default: m.WhiteGloveCheckpointPage,
    })),
  ),
});

const whiteGloveHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/white-glove/history',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/WhiteGloveRunHistoryPage.js').then((m) => ({
      default: m.WhiteGloveRunHistoryPage,
    })),
  ),
});

const whiteGloveRunDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/white-glove/history/$runId',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/WhiteGloveRunDetailPage.js').then((m) => ({
      default: (props: Record<string, unknown>) => {
        const params = props as { runId?: string };
        return m.WhiteGloveRunDetailPage({ runId: params.runId ?? '' });
      },
    })),
  ),
});

const whiteGloveStandardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/white-glove/standards',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/WhiteGlovePackageStandardsPage.js').then((m) => ({
      default: m.WhiteGlovePackageStandardsPage,
    })),
  ),
});

// --- Legacy redirect routes (backward compatibility) ---

const legacyProvisioningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provisioning-failures',
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: typeof search.projectId === 'string' ? search.projectId : undefined,
  }),
  beforeLoad: ({ search }) => {
    const target = LEGACY_REDIRECTS.find((r) => r.from === '/provisioning-failures');
    if (target) {
      throw redirect({ to: target.to, search: target.preserveSearch ? search : undefined });
    }
  },
});

const legacyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboards',
  beforeLoad: () => {
    const target = LEGACY_REDIRECTS.find((r) => r.from === '/dashboards');
    if (target) {
      throw redirect({ to: target.to });
    }
  },
});

const legacyErrorLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/error-log',
  beforeLoad: () => {
    const target = LEGACY_REDIRECTS.find((r) => r.from === '/error-log');
    if (target) {
      throw redirect({ to: target.to });
    }
  },
});

// --- Route tree export ---

export const webpartRoutes = [
  // Index
  indexRoute,
  // Lane routes
  runsRoute,
  healthRoute,
  standardsConfigRoute,
  configRoute,
  errorsRoute,
  setupRoute,
  setupRunDetailRoute,
  bindingStatusRoute,
  validationRoute,
  sharepointRoute,
  entraRoute,
  // White-glove routes
  whiteGloveConnectionsRoute,
  whiteGloveReadinessRoute,
  whiteGloveLaunchRoute,
  whiteGloveCheckpointsRoute,
  whiteGloveHistoryRoute,
  whiteGloveRunDetailRoute,
  whiteGloveStandardsRoute,
  // Legacy redirects
  legacyProvisioningRoute,
  legacyDashboardRoute,
  legacyErrorLogRoute,
];

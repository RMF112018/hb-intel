import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { usePermissionStore } from '@hbc/auth';
import { rootRoute } from './root-route.js';
import { LANES, LEGACY_REDIRECTS } from './lane-registry.js';

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
    import('../pages/LanePlaceholderPage.js').then((m) => ({
      default: () =>
        m.LanePlaceholderPage({
          title: 'Setup',
          laneId: 'setup',
          description: LANES.find((l) => l.id === 'setup')?.scaffoldMessage ?? '',
          deliversIn: LANES.find((l) => l.id === 'setup')?.deliversIn ?? 'a future phase',
        }),
    })),
  ),
});

const validationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/validation',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/LanePlaceholderPage.js').then((m) => ({
      default: () =>
        m.LanePlaceholderPage({
          title: 'Validation',
          laneId: 'validation',
          description: LANES.find((l) => l.id === 'validation')?.scaffoldMessage ?? '',
          deliversIn: LANES.find((l) => l.id === 'validation')?.deliversIn ?? 'a future phase',
        }),
    })),
  ),
});

const sharepointRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sharepoint',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/LanePlaceholderPage.js').then((m) => ({
      default: () =>
        m.LanePlaceholderPage({
          title: 'SharePoint',
          laneId: 'sharepoint',
          description: LANES.find((l) => l.id === 'sharepoint')?.scaffoldMessage ?? '',
          deliversIn: LANES.find((l) => l.id === 'sharepoint')?.deliversIn ?? 'a future phase',
        }),
    })),
  ),
});

const entraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/entra',
  beforeLoad: adminBeforeLoad,
  component: lazyRouteComponent(() =>
    import('../pages/LanePlaceholderPage.js').then((m) => ({
      default: () =>
        m.LanePlaceholderPage({
          title: 'Entra',
          laneId: 'entra',
          description: LANES.find((l) => l.id === 'entra')?.scaffoldMessage ?? '',
          deliversIn: LANES.find((l) => l.id === 'entra')?.deliversIn ?? 'a future phase',
        }),
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
  configRoute,
  errorsRoute,
  setupRoute,
  validationRoute,
  sharepointRoute,
  entraRoute,
  // Legacy redirects
  legacyProvisioningRoute,
  legacyDashboardRoute,
  legacyErrorLogRoute,
];

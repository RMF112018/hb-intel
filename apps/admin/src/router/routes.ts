import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { redirect } from '@tanstack/react-router';
import { usePermissionStore } from '@hbc/auth';
import { rootRoute } from './root-route.js';

const ADMIN_ACCESS_PERMISSION = 'admin:access-control:view';

function requireAdminAccessControl(): void {
  const permissionStore = usePermissionStore.getState();
  const hasPermission =
    permissionStore.hasPermission(ADMIN_ACCESS_PERMISSION) || permissionStore.hasPermission('*:*');
  if (!hasPermission) {
    throw redirect({ to: '/' });
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    // Note: requireAdminAccessControl() intentionally omitted here to prevent
    // infinite redirect loop (/ → no permission → redirect to / → ...).
    // Non-index routes still enforce the guard and redirect here on failure.
    useNavStore.getState().setActiveWorkspace('admin');
  },
  component: lazyRouteComponent(() => import('../pages/SystemSettingsPage.js').then((m) => ({ default: m.SystemSettingsPage }))),
});

const errorLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/error-log',
  beforeLoad: () => {
    requireAdminAccessControl();
    useNavStore.getState().setActiveWorkspace('admin');
  },
  component: lazyRouteComponent(() => import('../pages/ErrorLogPage.js').then((m) => ({ default: m.ErrorLogPage }))),
});

const provisioningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provisioning-failures',
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: typeof search.projectId === 'string' ? search.projectId : undefined,
  }),
  beforeLoad: () => {
    requireAdminAccessControl();
    useNavStore.getState().setActiveWorkspace('admin');
  },
  component: lazyRouteComponent(() => import('../pages/ProvisioningOversightPage.js').then((m) => ({ default: m.ProvisioningOversightPage }))),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboards',
  beforeLoad: () => {
    requireAdminAccessControl();
    useNavStore.getState().setActiveWorkspace('admin');
  },
  component: lazyRouteComponent(() => import('../pages/OperationalDashboardPage.js').then((m) => ({ default: m.OperationalDashboardPage }))),
});

export const webpartRoutes = [indexRoute, errorLogRoute, provisioningRoute, dashboardRoute];

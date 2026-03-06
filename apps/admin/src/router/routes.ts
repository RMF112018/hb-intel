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
    requireAdminAccessControl();
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
  component: lazyRouteComponent(() => import('../pages/SystemSettingsPage.js').then((m) => ({ default: () => m.SystemSettingsPage({ initialSection: 'audit-log' }) }))),
});

const provisioningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provisioning-failures',
  beforeLoad: () => {
    requireAdminAccessControl();
    useNavStore.getState().setActiveWorkspace('admin');
  },
  component: lazyRouteComponent(() => import('../pages/SystemSettingsPage.js').then((m) => ({ default: () => m.SystemSettingsPage({ initialSection: 'role-change-review' }) }))),
});

export const webpartRoutes = [indexRoute, errorLogRoute, provisioningRoute];

import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { ShellLayout } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';
import { AdminAlertBadge, useAdminAlerts } from '@hbc/features-admin';
import { useAlertPolling } from '../hooks/useAlertPolling.js';
import { useProbePolling } from '../hooks/useProbePolling.js';
import { getNavigationLanes } from './lane-registry.js';
import type { LaneDefinition } from './lane-registry.js';

/**
 * P5-03: Admin root route with operator-console navigation.
 *
 * Replaces the flat tool-picker with lane-driven navigation derived from
 * the canonical lane registry (P5-02). Preserves alert polling, probe
 * polling, and alert badge from the previous shell.
 */

const lanes = getNavigationLanes();

/** Build SimplifiedShellConfig from the lane registry. */
const ADMIN_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'IT Control Center',
  showBackToProjectHub: false,
  toolPickerItems: lanes.map((lane) => ({
    label: lane.label,
    path: lane.path,
  })),
};

const useLaneNavStyles = makeStyles({
  active: { fontWeight: 700 },
  inactive: { fontWeight: 400 },
  scaffold: { opacity: 0.7 },
});

function LaneNavItem({
  lane,
  isActive,
  onNavigate,
}: {
  readonly lane: LaneDefinition;
  readonly isActive: boolean;
  readonly onNavigate: (path: string) => void;
}): React.ReactNode {
  const styles = useLaneNavStyles();
  const className = [
    isActive ? styles.active : styles.inactive,
    lane.status === 'scaffold' ? styles.scaffold : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      data-lane-id={lane.id}
      data-lane-status={lane.status}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onNavigate(lane.path)}
    >
      {lane.label}
    </button>
  );
}

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // G6-T04: Start monitor polling when session is available
  useAlertPolling();

  // G6-T06: Start probe polling when session is available
  useProbePolling();

  // G6-T04: Live badge from useAdminAlerts (auto-polls via React Query)
  const { badge: alertBadge } = useAdminAlerts();

  const handleNavigate = (path: string): void => {
    navigate({ to: path });
  };

  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={ADMIN_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="operator-console-nav" aria-label="Operator console lanes">
          {lanes.map((lane) => (
            <LaneNavItem
              key={lane.id}
              lane={lane}
              isActive={pathname.startsWith(lane.path)}
              onNavigate={handleNavigate}
            />
          ))}
          <AdminAlertBadge
            badge={alertBadge}
            onOpenDashboard={() => navigate({ to: '/health' })}
          />
        </nav>
      }
    >
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({ component: RootComponent });

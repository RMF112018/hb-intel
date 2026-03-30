import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShellLayout, resolveProjectHubUrl } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';

/**
 * D-PH7-BW-6: Estimating root route with simplified shell config.
 * Project-scoped domain — shows Back to Project Hub.
 *
 * Deployment posture: Project Setup only.
 * Bids and Templates are hidden from navigation in this deployment.
 * To re-enable, add their toolPickerItems back and register their routes.
 *
 * @see docs/architecture/reviews/estimating-project-setup-only-deployment-remediation.md
 */
const ESTIMATING_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Estimating',
  showBackToProjectHub: true,
  projectHubUrl: resolveProjectHubUrl(),
  toolPickerItems: [
    { label: 'Project Setup', path: '/project-setup' },
  ],
};

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={ESTIMATING_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav">
          {ESTIMATING_SHELL_CONFIG.toolPickerItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate({ to: item.path })}
            >
              {item.label}
            </button>
          ))}
        </nav>
      }
    >
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({ component: RootComponent });

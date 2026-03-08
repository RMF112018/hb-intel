import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShellLayout, resolveProjectHubUrl } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';

/**
 * D-PH7-BW-6: Leadership root route with simplified shell config.
 * Project-scoped domain — shows Back to Project Hub.
 */
const LEADERSHIP_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Leadership',
  showBackToProjectHub: true,
  projectHubUrl: resolveProjectHubUrl(),
  toolPickerItems: [
    { label: 'KPI Dashboard', path: '/' },
    { label: 'Portfolio', path: '/portfolio' },
  ],
};

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={LEADERSHIP_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav">
          {LEADERSHIP_SHELL_CONFIG.toolPickerItems.map((item) => (
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

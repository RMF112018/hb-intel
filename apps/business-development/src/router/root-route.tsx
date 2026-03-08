import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';

/**
 * D-PH7-BW-6: Business Development root route with simplified shell config.
 * Portfolio-level domain — no Back to Project Hub.
 */
const BD_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Business Development',
  showBackToProjectHub: false,
  toolPickerItems: [
    { label: 'Pipeline', path: '/' },
    { label: 'Opportunities', path: '/opportunities' },
  ],
};

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={BD_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav">
          {BD_SHELL_CONFIG.toolPickerItems.map((item) => (
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

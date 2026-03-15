import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';

/**
 * D-PH7-BW-6: Admin root route with simplified shell config.
 * Tenant-level domain — no Back to Project Hub.
 */
const ADMIN_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Admin',
  showBackToProjectHub: false,
  toolPickerItems: [
    { label: 'System Settings', path: '/' },
    { label: 'Error Log', path: '/error-log' },
    { label: 'Provisioning Oversight', path: '/provisioning-failures' },
  ],
};

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={ADMIN_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav">
          {ADMIN_SHELL_CONFIG.toolPickerItems.map((item) => (
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

import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';

/**
 * D-PH7-BW-6: Operational Excellence root route with simplified shell config.
 * Org-level domain — no Back to Project Hub.
 */
const OE_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Operational Excellence',
  showBackToProjectHub: false,
  toolPickerItems: [
    { label: 'Metrics', path: '/' },
    { label: 'Process Improvement', path: '/process-improvement' },
  ],
};

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={OE_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav">
          {OE_SHELL_CONFIG.toolPickerItems.map((item) => (
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

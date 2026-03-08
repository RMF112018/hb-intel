import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';

/**
 * D-PH7-BW-6: Human Resources root route with simplified shell config.
 * Org-level domain — no Back to Project Hub.
 */
const HR_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Human Resources',
  showBackToProjectHub: false,
  toolPickerItems: [
    { label: 'Staffing', path: '/' },
    { label: 'Certifications', path: '/certifications' },
  ],
};

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={HR_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav">
          {HR_SHELL_CONFIG.toolPickerItems.map((item) => (
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

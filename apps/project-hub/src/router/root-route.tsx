import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';
import { PROJECT_HUB_SPFX_MODULES } from '@hbc/features-project-hub';

const PROJECT_HUB_TOOL_PICKER_ITEMS = [
  { label: 'Home', path: '/' },
  ...PROJECT_HUB_SPFX_MODULES.map((module) => ({
    label: module.navLabel,
    path: `/${module.slug}`,
  })),
];

/**
 * D-PH7-BW-6: Project Hub root route with simplified shell config.
 * IS the hub — no Back to Project Hub link.
 */
const PROJECT_HUB_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Project Hub',
  showBackToProjectHub: false,
  toolPickerItems: PROJECT_HUB_TOOL_PICKER_ITEMS,
};

function RootComponent(): React.ReactNode {
  const navigate = useNavigate();
  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={PROJECT_HUB_SHELL_CONFIG}
      toolPickerSlot={
        <nav data-hbc-shell="tool-picker-nav">
          {PROJECT_HUB_SHELL_CONFIG.toolPickerItems.map((item) => (
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

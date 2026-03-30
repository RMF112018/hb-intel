import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { ShellLayout, resolveProjectHubUrl } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';
import { HbcBanner, HbcButton } from '@hbc/ui-kit';
import { HBC_SPACE_SM, HBC_SPACE_XS } from '@hbc/ui-kit/theme';
import { useProjectSetupBackend } from '../project-setup/backend/ProjectSetupBackendContext.js';

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

const useStyles = makeStyles({
  backendModeControl: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: `${HBC_SPACE_XS}px`,
  },
  backendModeLabel: {
    fontSize: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    fontWeight: 600,
  },
  backendModeButtons: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
  },
  backendModeHelper: {
    fontSize: `${HBC_SPACE_SM}px`,
    color: 'var(--colorNeutralForeground3)',
  },
});

export function RootComponent(): React.ReactNode {
  const styles = useStyles();
  const navigate = useNavigate();
  const { backendMode, isUiReview, canSwitchBackendMode, setBackendMode } = useProjectSetupBackend();

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
      rightSlot={
        canSwitchBackendMode ? (
          <div className={styles.backendModeControl}>
            <span className={styles.backendModeLabel}>Backend Mode</span>
            <div className={styles.backendModeButtons}>
              <HbcButton
                type="button"
                size="sm"
                variant={backendMode === 'ui-review' ? 'primary' : 'secondary'}
                onClick={() => setBackendMode('ui-review')}
              >
                UI Review
              </HbcButton>
              <HbcButton
                type="button"
                size="sm"
                variant={backendMode === 'production' ? 'primary' : 'secondary'}
                onClick={() => setBackendMode('production')}
              >
                Production
              </HbcButton>
            </div>
            <span className={styles.backendModeHelper}>
              Mode: {backendMode === 'ui-review' ? 'UI Review' : 'Production'}. Saved in this browser.
            </span>
          </div>
        ) : undefined
      }
    >
      {isUiReview && (
        <HbcBanner variant="info">
          UI Review mode is active. Backend connections are disabled, and Project Setup is using local sample data saved in this browser.
        </HbcBanner>
      )}
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({ component: RootComponent });

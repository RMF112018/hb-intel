import { createRootRoute, Outlet } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { ShellLayout, resolveProjectHubUrl } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';
import { HbcBanner, HbcButton } from '@hbc/ui-kit';
import { HBC_SPACE_SM, HBC_SPACE_XS, bodySmall, label as labelType } from '@hbc/ui-kit/theme';
import { useProjectSetupBackend } from '../project-setup/backend/ProjectSetupBackendContext.js';

/**
 * Project Setup Requests root route with simplified shell config.
 * Project-scoped domain — shows Back to Project Hub.
 *
 * This SPFx surface is scoped exclusively to Project Setup Requests.
 * Bids and Templates are separate product surfaces (future Estimating SPFx
 * and Admin SPFx respectively).
 */
const PROJECT_SETUP_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: '',
  showBackToProjectHub: true,
  projectHubUrl: resolveProjectHubUrl(),
  toolPickerItems: [],
};

const useStyles = makeStyles({
  backendModeControl: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: `${HBC_SPACE_XS}px`,
  },
  backendModeLabel: {
    fontSize: bodySmall.fontSize,
    fontWeight: '600',
  },
  backendModeButtons: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
  },
  backendModeHelper: {
    fontSize: labelType.fontSize,
    color: 'var(--colorNeutralForeground3)',
  },
});

export function RootComponent(): React.ReactNode {
  const styles = useStyles();
  const { backendMode, isUiReview, canSwitchBackendMode, setBackendMode, productionBlocked, productionReadiness } = useProjectSetupBackend();

  return (
    <ShellLayout
      mode="simplified"
      simplifiedConfig={PROJECT_SETUP_SHELL_CONFIG}
      leftSlot={null}
      toolPickerSlot={null}
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
      {productionBlocked && productionReadiness && (
        <HbcBanner variant="warning">
          Production mode is not available. {productionReadiness.issues.join(' ')} Falling back to UI Review mode with local sample data.
        </HbcBanner>
      )}
      {isUiReview && !productionBlocked && (
        <HbcBanner variant="info">
          UI Review mode is active. Backend connections are disabled, and Project Setup is using local sample data saved in this browser.
        </HbcBanner>
      )}
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({ component: RootComponent });

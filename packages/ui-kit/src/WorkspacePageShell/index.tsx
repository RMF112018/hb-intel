/**
 * WorkspacePageShell — Mandatory outer container for every page (D-01)
 * PH4B.2 §Step 2 | PH4B.3 §Step 3 | Blueprint §1d
 *
 * Renders breadcrumbs, command bar, banner, and state overlays
 * (loading/empty/error). LAYOUT_MAP wires DashboardLayout and ListLayout;
 * form/detail/landing pass children through (page authors compose those directly).
 */
import * as React from 'react';
import { createContext } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useProjectStore } from '@hbc/shell';
import { HbcBreadcrumbs } from '../HbcBreadcrumbs/index.js';
import { HbcCommandBar } from '../HbcCommandBar/index.js';
import { HbcBanner } from '../HbcBanner/index.js';
import { HbcSpinner } from '../HbcSpinner/index.js';
import { HbcEmptyState } from '../HbcEmptyState/index.js';
import { HbcButton } from '../HbcButton/index.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { ListLayout } from '../layouts/ListLayout.js';
import { HBC_SURFACE_LIGHT, HBC_ACCENT_ORANGE, HBC_STATUS_COLORS } from '../theme/tokens.js';
import { elevationRaised } from '../theme/elevation.js';
import { heading2 } from '../theme/typography.js';
import { useFieldMode } from '../HbcAppShell/hooks/useFieldMode.js';
import { setFieldModeActions } from '../HbcCommandBar/fieldModeActionsStore.js';
import type { WorkspacePageShellProps, ListConfig } from './types.js';

// ---------------------------------------------------------------------------
// ListConfig context — still available for consumers needing programmatic access
// ---------------------------------------------------------------------------
export const ListConfigContext = createContext<ListConfig | undefined>(undefined);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    ...heading2,
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: '0',
  },
  projectContext: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  commandBarZone: {
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '8px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '16px',
  },
  stateOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    minHeight: '200px',
  },
  errorCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '32px',
    backgroundColor: '#FEF2F2',
    borderLeft: '4px solid #EF4444',
    borderRadius: '4px',
    maxWidth: '480px',
  },
  errorTitle: {
    ...heading2,
    color: '#991B1B',
    margin: '0',
    fontSize: '1rem',
  },
  errorMessage: {
    fontSize: '0.875rem',
    color: '#7F1D1D',
    margin: '0',
    textAlign: 'center' as const,
  },
  fab: {
    position: 'fixed',
    bottom: '72px',
    right: '16px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: HBC_ACCENT_ORANGE,
    color: '#FFFFFF',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: elevationRaised,
    cursor: 'pointer',
    zIndex: 10,
  },
  fabDestructive: {
    backgroundColor: HBC_STATUS_COLORS.error,
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function WorkspacePageShell({
  layout,
  title,
  breadcrumbs,
  actions,
  overflowActions,
  dashboardConfig,
  listConfig,
  isLoading = false,
  isEmpty = false,
  isError = false,
  errorMessage = 'An unexpected error occurred.',
  emptyMessage = 'No items found.',
  emptyActionLabel,
  onEmptyAction,
  banner,
  children,
}: WorkspacePageShellProps): React.ReactNode {
  const activeProject = useProjectStore((s) => s.activeProject);
  const styles = useStyles();
  const { isFieldMode } = useFieldMode();

  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  // Reset banner dismissed state when banner config changes
  React.useEffect(() => {
    setBannerDismissed(false);
  }, [banner?.message, banner?.variant]);

  const hasActions = (actions?.length ?? 0) > 0 || (overflowActions?.length ?? 0) > 0;

  // Field mode: derive primary + secondary actions — PH4B.4 §4b.4.3
  const primaryAction = actions?.find((a) => a.primary);
  const secondaryActions = React.useMemo(
    () => actions?.filter((a) => !a.primary) ?? [],
    [actions],
  );

  // Write secondary actions to field mode store for Cmd+K palette injection
  React.useEffect(() => {
    if (isFieldMode) {
      const allSecondary = [...secondaryActions, ...(overflowActions ?? [])];
      setFieldModeActions(allSecondary);
    } else {
      setFieldModeActions([]);
    }
    return () => setFieldModeActions([]);
  }, [isFieldMode, secondaryActions, overflowActions]);

  return (
    <ListConfigContext.Provider value={listConfig}>
      <div
        data-hbc-ui="workspace-page-shell"
        data-layout={layout}
        className={styles.root}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <HbcBreadcrumbs items={breadcrumbs} />
        )}

        {/* Banner */}
        {banner && !bannerDismissed && (
          <HbcBanner
            variant={banner.variant}
            onDismiss={banner.dismissible ? () => setBannerDismissed(true) : undefined}
          >
            {banner.message}
          </HbcBanner>
        )}

        {/* Header with title + command bar */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {activeProject && (
              <span className={styles.projectContext}>
                {activeProject.name} ({activeProject.number})
              </span>
            )}
          </div>
        </div>

        {/* Command bar — D-03: all page actions via actions/overflowActions props */}
        {hasActions && !isFieldMode && (
          <div className={styles.commandBarZone}>
            <HbcCommandBar actions={actions} overflowActions={overflowActions} />
          </div>
        )}

        {/* Field mode FAB — PH4B.4 §4b.4.3 */}
        {isFieldMode && primaryAction && (
          <button
            type="button"
            data-hbc-ui="fab-primary"
            aria-label={primaryAction.label}
            className={mergeClasses(
              styles.fab,
              primaryAction.isDestructive && styles.fabDestructive,
            )}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
          >
            {primaryAction.icon ?? '+'}
          </button>
        )}

        {/* Content area with state overlays + LAYOUT_MAP */}
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.stateOverlay}>
              <HbcSpinner size="lg" label="Loading page content" />
            </div>
          ) : isError ? (
            <div className={styles.stateOverlay}>
              <div className={styles.errorCard}>
                <h2 className={styles.errorTitle}>Something went wrong</h2>
                <p className={styles.errorMessage}>{errorMessage}</p>
              </div>
            </div>
          ) : isEmpty ? (
            <div className={styles.stateOverlay}>
              <HbcEmptyState
                title={emptyMessage}
                primaryAction={
                  emptyActionLabel && onEmptyAction ? (
                    <HbcButton variant="primary" onClick={onEmptyAction}>
                      {emptyActionLabel}
                    </HbcButton>
                  ) : undefined
                }
              />
            </div>
          ) : layout === 'dashboard' ? (
            <DashboardLayout
              kpiCards={dashboardConfig?.kpiCards}
              chartContent={dashboardConfig?.chartContent}
            >
              {children}
            </DashboardLayout>
          ) : layout === 'list' && listConfig ? (
            <ListLayout
              primaryFilters={listConfig.primaryFilters}
              advancedFilters={listConfig.advancedFilters}
              savedViewsEnabled={listConfig.savedViewsEnabled}
              bulkActions={listConfig.bulkActions}
            >
              {children}
            </ListLayout>
          ) : (
            children
          )}
        </div>
      </div>
    </ListConfigContext.Provider>
  );
}

export type {
  WorkspacePageShellProps,
  PageLayout,
  BannerConfig,
  DashboardConfig,
  ListConfig,
  FilterDef,
  BulkAction,
  ListFilterDef,
  ListBulkAction,
} from './types.js';

/**
 * WorkspacePageShell — Mandatory outer container for every page (D-01)
 * PH4B.2 §Step 2 | PH4B.3 §Step 3 | PH4B.7 §4b.7.1 + §4b.7.4 | Blueprint §1d
 *
 * Renders breadcrumbs, command bar, banner, and state overlays
 * (loading/empty/error). LAYOUT_MAP wires DashboardLayout and ListLayout;
 * form/detail/landing pass children through (page authors compose those directly).
 *
 * D-06: Loading/empty/error states passed via props — pages never render own spinners.
 * §4b.7.1: Error state uses HBC tokens (no hardcoded hex).
 * §4b.7.4: Layout-aware skeleton loading (DashboardSkeleton, ListSkeleton).
 */
import * as React from 'react';
import { createContext } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useNavStore, useProjectStore } from '@hbc/shell';
import { HbcBreadcrumbs } from '../HbcBreadcrumbs/index.js';
import { HbcCommandBar } from '../HbcCommandBar/index.js';
import { HbcBanner } from '../HbcBanner/index.js';
import { HbcSpinner } from '../HbcSpinner/index.js';
import { HbcEmptyState } from '../HbcEmptyState/index.js';
import { HbcButton } from '../HbcButton/index.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { ListLayout } from '../layouts/ListLayout.js';
import {
  HBC_SURFACE_LIGHT,
  HBC_ACCENT_ORANGE,
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_RED,
} from '../theme/tokens.js';
import { hbcSpacing } from '../theme/grid.js';
import { elevationRaised } from '../theme/elevation.js';
import { heading2, heading3, body } from '../theme/typography.js';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import { setFieldModeActions } from '../HbcCommandBar/fieldModeActionsStore.js';
import type { WorkspacePageShellProps, ListConfig } from './types.js';

// ---------------------------------------------------------------------------
// ListConfig context — still available for consumers needing programmatic access
// ---------------------------------------------------------------------------
export const ListConfigContext = createContext<ListConfig | undefined>(undefined);

// ---------------------------------------------------------------------------
// Shimmer keyframe for skeleton loading — PH4B.7 §4b.7.4
// ---------------------------------------------------------------------------
const shimmerKeyframe = {
  from: { backgroundPosition: '-200% 0' },
  to: { backgroundPosition: '200% 0' },
};

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
    paddingLeft: `${hbcSpacing.md}px`,
    paddingRight: `${hbcSpacing.md}px`,
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
    paddingLeft: `${hbcSpacing.md}px`,
    paddingRight: `${hbcSpacing.md}px`,
    paddingBottom: `${hbcSpacing.sm}px`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
    paddingLeft: `${hbcSpacing.md}px`,
    paddingRight: `${hbcSpacing.md}px`,
    paddingBottom: `${hbcSpacing.md}px`,
  },
  stateOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    minHeight: '200px',
  },
  // D-06 error state — all values from HBC tokens (§4b.7.1)
  errorCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: `${hbcSpacing.xl}px`,
    backgroundColor: HBC_STATUS_RAMP_RED[90],
    borderLeft: `4px solid ${HBC_STATUS_COLORS.error}`,
    borderRadius: '4px',
    maxWidth: '480px',
  },
  errorTitle: {
    ...heading3,
    color: HBC_STATUS_RAMP_RED[10],
    margin: '0',
  },
  errorMessage: {
    ...body,
    color: HBC_STATUS_RAMP_RED[10],
    margin: '0',
    textAlign: 'center' as const,
  },
  // Skeleton styles — PH4B.7 §4b.7.4
  shimmerBase: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    backgroundImage: `linear-gradient(90deg, transparent 25%, rgba(0,75,135,0.06) 50%, transparent 75%)`,
    backgroundSize: '200% 100%',
    animationName: shimmerKeyframe,
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    borderRadius: '4px',
  },
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${hbcSpacing.md}px`,
    width: '100%',
    flexGrow: 1,
  },
  // Dashboard skeleton
  dashKpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: `${hbcSpacing.md}px`,
  },
  dashKpiCard: {
    height: '96px',
  },
  dashChartArea: {
    height: '280px',
  },
  dashDataZone: {
    height: '200px',
  },
  // List skeleton
  listToolbar: {
    height: '40px',
    width: '100%',
  },
  listRow: {
    display: 'grid',
    gap: `${hbcSpacing.sm}px`,
    height: '36px',
  },
  listCell: {
    height: '100%',
  },
  fab: {
    position: 'fixed',
    bottom: '72px',
    right: `${hbcSpacing.md}px`,
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
// DashboardSkeleton — PH4B.7 §4b.7.4
// ---------------------------------------------------------------------------
function DashboardSkeleton(): React.ReactNode {
  const styles = useStyles();
  return (
    <div className={styles.skeletonContainer} data-hbc-ui="dashboard-skeleton">
      <div className={styles.dashKpiGrid}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={mergeClasses(styles.shimmerBase, styles.dashKpiCard)}
          />
        ))}
      </div>
      <div className={mergeClasses(styles.shimmerBase, styles.dashChartArea)} />
      <div className={mergeClasses(styles.shimmerBase, styles.dashDataZone)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ListSkeleton — PH4B.7 §4b.7.4
// ---------------------------------------------------------------------------
function ListSkeleton({ columns }: { columns: number }): React.ReactNode {
  const styles = useStyles();
  const rowStyle = { gridTemplateColumns: `repeat(${columns}, 1fr)` };
  return (
    <div className={styles.skeletonContainer} data-hbc-ui="list-skeleton">
      <div className={mergeClasses(styles.shimmerBase, styles.listToolbar)} />
      {Array.from({ length: 10 }, (_, rowIdx) => (
        <div key={rowIdx} className={styles.listRow} style={rowStyle}>
          {Array.from({ length: columns }, (_, colIdx) => (
            <div
              key={colIdx}
              className={mergeClasses(styles.shimmerBase, styles.listCell)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

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
  supportedModes,
  isLoading = false,
  isEmpty = false,
  isError = false,
  errorMessage = 'An unexpected error occurred.',
  onRetry,
  skeletonColumns,
  emptyMessage = 'No items found.',
  emptyActionLabel,
  onEmptyAction,
  banner,
  children,
}: WorkspacePageShellProps): React.ReactNode {
  const activeProject = useProjectStore((s) => s.activeProject);
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const styles = useStyles();
  const { isFieldMode, mode } = useHbcTheme();

  // PH4B.10: Guard against unsupported modes (D-09)
  if (supportedModes && !supportedModes.includes(mode)) {
    return (
      <div data-hbc-ui="workspace-page-shell" data-layout={layout} className={styles.root}>
        <div className={styles.stateOverlay}>
          <HbcEmptyState title={`This page is not available in ${mode} mode.`} />
        </div>
      </div>
    );
  }

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

  // Layout-aware loading content — PH4B.7 §4b.7.4
  const renderLoadingState = (): React.ReactNode => {
    if (layout === 'dashboard') return <DashboardSkeleton />;
    if (layout === 'list') return <ListSkeleton columns={skeletonColumns ?? 5} />;
    return (
      <div className={styles.stateOverlay}>
        <HbcSpinner size="lg" label="Loading page content" />
      </div>
    );
  };

  return (
    <ListConfigContext.Provider value={listConfig}>
      <div
        data-hbc-ui="workspace-page-shell"
        data-layout={layout}
        data-active-workspace={activeWorkspace ?? undefined}
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
            renderLoadingState()
          ) : isError ? (
            <div className={styles.stateOverlay}>
              <div className={styles.errorCard} role="alert">
                <h2 className={styles.errorTitle}>Something went wrong</h2>
                <p className={styles.errorMessage}>{errorMessage}</p>
                {onRetry && (
                  <HbcButton variant="primary" onClick={onRetry}>
                    Try Again
                  </HbcButton>
                )}
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

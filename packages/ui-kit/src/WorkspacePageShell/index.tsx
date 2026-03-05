/**
 * WorkspacePageShell — Mandatory outer container for every page (D-01)
 * PH4B.2 §Step 2 | Blueprint §1d
 *
 * Renders breadcrumbs, command bar, banner, and state overlays
 * (loading/empty/error). Layout variant rendering deferred to Phase 4b.3.
 * listConfig stored in React context for Phase 4b.3 consumption.
 */
import * as React from 'react';
import { createContext } from 'react';
import { makeStyles } from '@griffel/react';
import { useProjectStore } from '@hbc/shell';
import { HbcBreadcrumbs } from '../HbcBreadcrumbs/index.js';
import { HbcCommandBar } from '../HbcCommandBar/index.js';
import { HbcBanner } from '../HbcBanner/index.js';
import { HbcSpinner } from '../HbcSpinner/index.js';
import { HbcEmptyState } from '../HbcEmptyState/index.js';
import { HbcButton } from '../HbcButton/index.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { heading2 } from '../theme/typography.js';
import type { WorkspacePageShellProps, ListConfig } from './types.js';

// ---------------------------------------------------------------------------
// ListConfig context for Phase 4b.3 consumption
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

  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  // Reset banner dismissed state when banner config changes
  React.useEffect(() => {
    setBannerDismissed(false);
  }, [banner?.message, banner?.variant]);

  const allActions = [
    ...(actions ?? []),
    ...(overflowActions ?? []),
  ];

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

        {/* Command bar */}
        {allActions.length > 0 && (
          <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '8px' }}>
            <HbcCommandBar actions={allActions} />
          </div>
        )}

        {/* Content area with state overlays */}
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
  ListConfig,
  FilterDef,
  BulkAction,
} from './types.js';

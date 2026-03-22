/**
 * HubSecondaryZone — P2-D2 §2: analytics/oversight cards.
 *
 * G0 — P2-F1 §2.2: Renders analytics tiles via @hbc/project-canvas tile
 * registry through MyWorkCanvas. Hub-specific state (UIF-008 KPI filter,
 * team mode) is threaded to tile adapters via MyWorkHubTileContext.
 *
 * UIF-003: Entire section wrapped in HbcCard weight="primary" to give the
 * Insights zone a distinct visual surface with header divider. The 12-column
 * tile grid moves into the card body so MyWorkCanvas tile spans still work.
 *
 * UIF-026-addl: Insights freshness indicator unified with trust state from
 * useHubTrustState — same source as HubFreshnessIndicator alert banner.
 * Shows pulse dot during sync, checkmark on fresh, warning icon when degraded.
 *
 * Complexity gating: hidden at essential tier (primary zone only).
 * Role gating: individual tiles enforce P2-D1 §6 via defaultForRoles + RoleGate.
 */
import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HbcCard, heading3, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { StatusCompleteIcon, StatusAttentionIcon } from '@hbc/ui-kit/icons';
import { useComplexity } from '@hbc/complexity';
import { useMyWork } from '@hbc/my-work-feed';
import type { TeamMode } from '@hbc/shell';
import { MyWorkCanvas, MyWorkHubTileProvider } from './tiles/index.js';
import { formatRelativeTime } from './formatRelativeTime.js';
import { useHubTrustState } from './useHubTrustState.js';

const useStyles = makeStyles({
  heading: {
    ...heading3,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
  },
  // INS-011: Header row with heading + freshness subtitle
  headerRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  // UIF-026-addl: Unified sync state indicator — 12px per field-readability minimum.
  freshness: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: '400',
    color: 'var(--colorNeutralForeground3)',
  },
  // UIF-026-addl: Pulsing dot during active sync/revalidation.
  syncPulse: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--colorPaletteGreenForeground1)',
    animationName: {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.4 },
      '100%': { opacity: 1 },
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  // INS-004: Clean 2-column grid replaces the overcomplicated 12-column micro-grid.
  // UIF-043-addl: Single-column tile stack — each card group gets full panel width.
  // The right panel is already narrow (3fr/2fr or 7fr/5fr); splitting it further
  // into 2 columns made KPI cards unreadable. Vertical stacking is the correct layout.
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
});

export interface HubSecondaryZoneProps {
  teamMode?: TeamMode;
  /** UIF-008: Active KPI filter key (e.g. 'action-now', 'blocked', 'unread'). */
  activeFilter?: string | null;
  /** UIF-008: Callback when a KPI card is clicked. */
  onFilterChange?: (filter: string) => void;
}

export function HubSecondaryZone({
  teamMode = 'personal',
  activeFilter,
  onFilterChange,
}: HubSecondaryZoneProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();
  // UIF-026-addl: Derive trust state from the same source as HubFreshnessIndicator.
  const { feed, isLoading } = useMyWork();
  const trustState = useHubTrustState(feed, isLoading);
  const relativeTime = trustState.lastRefreshedIso
    ? formatRelativeTime(trustState.lastRefreshedIso)
    : null;

  if (tier === 'essential') return null;

  // UIF-026-addl: Sync state icon derived from unified trust state.
  let syncIcon: ReactNode = null;
  let syncLabel = relativeTime ? `Updated ${relativeTime}` : '';

  if (trustState.isStaleWhileRevalidating) {
    // Active sync — pulsing dot
    syncIcon = <span className={styles.syncPulse} aria-hidden="true" />;
    syncLabel = 'Refreshing…';
  } else if (trustState.freshness === 'partial' || trustState.degradedSourceCount > 0) {
    // Degraded — amber warning
    syncIcon = <StatusAttentionIcon size="sm" color={HBC_STATUS_COLORS.warning} />;
  } else if (trustState.freshness === 'live' && trustState.isWithinFreshnessWindow) {
    // Fresh — green checkmark
    syncIcon = <StatusCompleteIcon size="sm" color="var(--colorPaletteGreenForeground1)" />;
  }

  return (
    <HbcCard
      weight="primary"
      header={
        <div className={styles.headerRow}>
          <h3 className={styles.heading}>Insights</h3>
          {syncLabel && (
            <span className={styles.freshness}>
              {syncIcon}
              {syncLabel}
            </span>
          )}
        </div>
      }
    >
      <MyWorkHubTileProvider value={{ activeFilter, onFilterChange, teamMode }}>
        <div className={styles.tileGrid}>
          <MyWorkCanvas tilePrefix="my-work.analytics" complexityTier={tier} />
        </div>
      </MyWorkHubTileProvider>
    </HbcCard>
  );
}

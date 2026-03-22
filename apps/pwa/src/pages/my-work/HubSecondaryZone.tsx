/**
 * HubSecondaryZone — P2-D2 §2: analytics/oversight cards.
 *
 * ARC-01 / ARC-F1 / 2-B: Renders analytics tiles via HbcProjectCanvas from
 * @hbc/project-canvas (replaced custom MyWorkCanvas governance bypass).
 * Hub-specific state (UIF-008 KPI filter, team mode) is threaded to tile
 * adapters via MyWorkHubTileContext.
 *
 * UIF-003: Entire section wrapped in HbcCard weight="primary" to give the
 * Insights zone a distinct visual surface with header divider.
 *
 * UIF-026-addl: Insights freshness indicator unified with trust state from
 * useHubTrustState — same source as HubFreshnessIndicator alert banner.
 *
 * Complexity gating: hidden at essential tier (primary zone only).
 * Role gating: individual tiles enforce P2-D1 §6 via defaultForRoles + RoleGate.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, heading3, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { StatusCompleteIcon, StatusAttentionIcon } from '@hbc/ui-kit/icons';
import { useComplexity } from '@hbc/complexity';
import { useMyWork } from '@hbc/my-work-feed';
import { HbcProjectCanvas } from '@hbc/project-canvas';
import { useCurrentSession } from '@hbc/auth';
import type { TeamMode } from '@hbc/shell';
import { MyWorkHubTileProvider } from './tiles/index.js';
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
  // ARC-08: tileGrid removed — HbcProjectCanvas manages its own 12-column grid.
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
  const session = useCurrentSession();
  // UIF-026-addl: Derive trust state from the same source as HubFreshnessIndicator.
  const { feed, isLoading } = useMyWork();
  const trustState = useHubTrustState(feed, isLoading);
  // ARC-F4: Primary role from single session resolution site.
  const primaryRole = session?.resolvedRoles[0] ?? 'Member';
  const relativeTime = trustState.lastTrustedDataIso
    ? formatRelativeTime(trustState.lastTrustedDataIso)
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

  // PRS-01 resolved (option b): Tile arrangement and visibility are managed by
  // HbcProjectCanvas internally via useCanvasConfig + CanvasApi. P2-D5 §4
  // satisfied through canvas config store, not page-level hooks.
  return (
    <MyWorkHubTileProvider value={{ activeFilter, onFilterChange, teamMode }}>
      <HbcProjectCanvas
        projectId="my-work-hub"
        userId={session?.user?.id ?? ''}
        role={primaryRole}
        complexityTier={tier}
        editable
        title="My Analytics"
      />
    </MyWorkHubTileProvider>
  );
}

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
 * Complexity gating: hidden at essential tier (primary zone only).
 * Role gating: individual tiles enforce P2-D1 §6 via defaultForRoles + RoleGate.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, heading3, HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import type { TeamMode } from '@hbc/shell';
import { MyWorkCanvas, MyWorkHubTileProvider } from './tiles/index.js';

const useStyles = makeStyles({
  // UIF-003: heading is now the card header — gridColumn and spacing no longer needed.
  heading: {
    ...heading3,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
  },
  // INS-004: Clean 2-column grid replaces the overcomplicated 12-column micro-grid.
  // Each tile occupies one cell directly — no column-group wrappers needed.
  // Responsive: single-column on mobile (≤767px).
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
    },
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

  if (tier === 'essential') return null;

  return (
    <HbcCard
      weight="primary"
      header={<h3 className={styles.heading}>Insights</h3>}
    >
      <MyWorkHubTileProvider value={{ activeFilter, onFilterChange, teamMode }}>
        <div className={styles.tileGrid}>
          <MyWorkCanvas tilePrefix="my-work.analytics" complexityTier={tier} />
        </div>
      </MyWorkHubTileProvider>
    </HbcCard>
  );
}

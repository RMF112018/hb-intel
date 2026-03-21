/**
 * HubSecondaryZone — P2-D2 §2: analytics/oversight cards.
 *
 * G0 — P2-F1 §2.2: Renders analytics tiles via @hbc/project-canvas tile
 * registry through MyWorkCanvas. Hub-specific state (UIF-008 KPI filter,
 * team mode) is threaded to tile adapters via MyWorkHubTileContext.
 *
 * Complexity gating: hidden at essential tier (primary zone only).
 * Role gating: individual tiles enforce P2-D1 §6 via defaultForRoles + RoleGate.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { heading3 } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import type { TeamMode } from '@hbc/shell';
import { MyWorkCanvas, MyWorkHubTileProvider } from './tiles/index.js';

const useStyles = makeStyles({
  heading: {
    gridColumn: '1 / -1',
    ...heading3,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
    marginTop: '20px',
    marginBottom: '8px',
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
    <MyWorkHubTileProvider value={{ activeFilter, onFilterChange, teamMode }}>
      <h3 className={styles.heading}>Insights</h3>
      <MyWorkCanvas tilePrefix="my-work.analytics" complexityTier={tier} />
    </MyWorkHubTileProvider>
  );
}

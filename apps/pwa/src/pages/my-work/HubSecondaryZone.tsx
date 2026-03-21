/**
 * HubSecondaryZone — P2-D2 §2: analytics/oversight cards.
 *
 * Complexity gating: hidden at essential tier (primary zone only).
 * Role gating: individual cards enforce P2-D1 §6 via RoleGate.
 * P2-D4: TeamPortfolioCard shows delegated/team feed counts.
 * UIF-008: Passes KPI filter state to PersonalAnalyticsCard.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { heading3 } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import { PersonalAnalyticsCard } from './cards/PersonalAnalyticsCard.js';
import { TeamPortfolioCard } from './cards/TeamPortfolioCard.js';
import { AgingBlockedCard } from './cards/AgingBlockedCard.js';
import { AdminOversightCard } from './cards/AdminOversightCard.js';
import type { TeamMode } from '@hbc/shell';

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
    <>
      <h3 className={styles.heading}>Insights</h3>
      <PersonalAnalyticsCard activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <TeamPortfolioCard teamMode={teamMode} />
      <AgingBlockedCard />
      <AdminOversightCard />
    </>
  );
}

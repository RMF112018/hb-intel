/**
 * HubSecondaryZone — P2-D2 §2: analytics/oversight cards.
 *
 * Complexity gating: hidden at essential tier (primary zone only).
 * Role gating: individual cards enforce P2-D1 §6 via RoleGate.
 * P2-D4: TeamPortfolioCard shows delegated/team feed counts.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useComplexity } from '@hbc/complexity';
import { PersonalAnalyticsCard } from './cards/PersonalAnalyticsCard.js';
import { TeamPortfolioCard } from './cards/TeamPortfolioCard.js';
import { AgingBlockedCard } from './cards/AgingBlockedCard.js';
import { AdminOversightCard } from './cards/AdminOversightCard.js';
import type { TeamMode } from '@hbc/shell';

const useStyles = makeStyles({
  heading: { gridColumn: '1 / -1', marginTop: '8px', marginBottom: '0' },
});

export interface HubSecondaryZoneProps {
  teamMode?: TeamMode;
}

export function HubSecondaryZone({ teamMode = 'personal' }: HubSecondaryZoneProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  if (tier === 'essential') return null;

  return (
    <>
      <h3 className={styles.heading}>Insights</h3>
      <PersonalAnalyticsCard />
      <TeamPortfolioCard teamMode={teamMode} />
      <AgingBlockedCard />
      <AdminOversightCard />
    </>
  );
}

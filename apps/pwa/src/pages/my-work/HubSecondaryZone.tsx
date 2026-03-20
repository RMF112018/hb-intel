/**
 * HubSecondaryZone — P2-D2 §2: analytics/oversight cards.
 *
 * Canvas-governed in target state; currently uses direct 12-column grid
 * matching CANVAS_GRID_COLUMNS for future @hbc/project-canvas migration.
 *
 * Complexity gating: hidden at essential tier (primary zone only).
 * Role gating: individual cards enforce P2-D1 §6 via RoleGate.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useComplexity } from '@hbc/complexity';
import { PersonalAnalyticsCard } from './cards/PersonalAnalyticsCard.js';
import { TeamPortfolioCard } from './cards/TeamPortfolioCard.js';
import { AgingBlockedCard } from './cards/AgingBlockedCard.js';
import { AdminOversightCard } from './cards/AdminOversightCard.js';

const useStyles = makeStyles({
  heading: { gridColumn: '1 / -1', marginTop: '8px', marginBottom: '0' },
});

export function HubSecondaryZone(): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  if (tier === 'essential') return null;

  return (
    <>
      <h3 className={styles.heading}>Insights</h3>
      <PersonalAnalyticsCard />
      <TeamPortfolioCard />
      <AgingBlockedCard />
      <AdminOversightCard />
    </>
  );
}

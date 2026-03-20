/**
 * HubTertiaryZone — P2-D2 §2: utility/quick-access zone.
 *
 * Quick action shortcuts, recent context, and pinned tools.
 * Hidden at essential tier. All roles have access per P2-D1 §5.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useComplexity } from '@hbc/complexity';
import { QuickActionsCard } from './cards/QuickActionsCard.js';
import { RecentContextCard } from './cards/RecentContextCard.js';

const useStyles = makeStyles({
  heading: { gridColumn: '1 / -1', marginTop: '8px', marginBottom: '0' },
});

export function HubTertiaryZone(): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  if (tier === 'essential') return null;

  return (
    <>
      <h3 className={styles.heading}>Quick Access</h3>
      <QuickActionsCard />
      <RecentContextCard />
    </>
  );
}

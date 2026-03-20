/**
 * RecentContextCard — P2-D1 §6: available to all roles.
 * P2-A1 requirement: continue-working links and recent context
 * to keep the hub useful even with zero work items.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard } from '@hbc/ui-kit';

const useStyles = makeStyles({
  root: { gridColumn: 'span 8' },
});

export function RecentContextCard(): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <HbcCard weight="supporting" header={<span>Recent Context</span>}>
        <p>Recently visited projects and work items will appear here.</p>
      </HbcCard>
    </div>
  );
}

/**
 * QuickActionsCard — P2-D1 §6: available to all roles.
 * Common action shortcuts for the hub.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard } from '@hbc/ui-kit';

const useStyles = makeStyles({
  root: { gridColumn: 'span 4' },
  list: {
    listStyleType: 'none',
    ...({ padding: 0, margin: 0 } as Record<string, string | number>),
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

export function QuickActionsCard(): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <HbcCard weight="supporting" header={<span>Quick Actions</span>}>
        <ul className={styles.list}>
          <li><a href="/project-setup?mode=new-request">Create project request</a></li>
          <li><a href="/projects">View my requests</a></li>
          <li><a href="/project-hub">Go to Project Hub</a></li>
        </ul>
      </HbcCard>
    </div>
  );
}

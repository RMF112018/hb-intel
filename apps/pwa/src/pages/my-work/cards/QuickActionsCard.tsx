/**
 * QuickActionsCard — P2-D1 §6: available to all roles.
 * Common action shortcuts for the hub.
 *
 * Navigation uses useRouter().navigate() (TanStack Router) so actions
 * stay within the SPA and do not trigger full page reloads.
 * Action triggers use HbcButton variant="ghost" per UI governance.
 *
 * INS-013: heading4 treatment, simplified DOM (no ul/li), 4px gap,
 * leading semantic icons per action, full-width buttons.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useRouter } from '@tanstack/react-router';
import { HbcCard, HbcButton, heading4, Create, ViewList, ViewGrid } from '@hbc/ui-kit';

const useStyles = makeStyles({
  // INS-013: heading4 (14px/600) for the card header.
  heading: {
    ...heading4,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
  },
  // INS-013: Simple flex column with 4px gap — no ul/li wrappers.
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  // Full-width ghost buttons need left-aligned content for a proper row layout.
  btnStart: {
    justifyContent: 'flex-start',
  },
});

export function QuickActionsCard(): ReactNode {
  const styles = useStyles();
  const router = useRouter();

  return (
    <HbcCard weight="supporting" header={<span className={styles.heading}>Quick Actions</span>}>
      <div className={styles.actions}>
        <HbcButton
          variant="ghost"
          size="sm"
          fullWidth
          className={styles.btnStart}
          icon={<Create size="sm" />}
          onClick={() => router.navigate({ to: '/project-setup', search: { mode: 'new-request' } })}
        >
          Create project request
        </HbcButton>
        <HbcButton
          variant="ghost"
          size="sm"
          fullWidth
          className={styles.btnStart}
          icon={<ViewList size="sm" />}
          onClick={() => router.navigate({ to: '/projects' })}
        >
          View my requests
        </HbcButton>
        <HbcButton
          variant="ghost"
          size="sm"
          fullWidth
          className={styles.btnStart}
          icon={<ViewGrid size="sm" />}
          onClick={() => router.navigate({ to: '/project-hub' })}
        >
          Go to Project Hub
        </HbcButton>
      </div>
    </HbcCard>
  );
}

/**
 * QuickActionsCard — P2-D1 §6: available to all roles.
 * Common action shortcuts for the hub.
 *
 * Navigation uses useRouter().navigate() (TanStack Router) so actions
 * stay within the SPA and do not trigger full page reloads.
 * Action triggers use HbcButton variant="ghost" per UI governance.
 *
 * UIF-013: Added leading semantic icons per action, full-width buttons with
 * left-aligned content so hover state spans the full card width.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useRouter } from '@tanstack/react-router';
import { HbcCard, HbcButton, Create, ViewList, ViewGrid } from '@hbc/ui-kit';

const useStyles = makeStyles({
  list: {
    listStyleType: 'none',
    ...({ padding: 0, margin: 0 } as Record<string, string | number>),
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
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
    <HbcCard weight="supporting" header={<span>Quick Actions</span>}>
      <ul className={styles.list}>
        <li>
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
        </li>
        <li>
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
        </li>
        <li>
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
        </li>
      </ul>
    </HbcCard>
  );
}

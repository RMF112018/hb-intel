/**
 * QuickActionsCard — P2-D1 §6: available to all roles.
 * Common action shortcuts for the hub.
 *
 * Navigation uses useRouter().navigate() (TanStack Router) so actions
 * stay within the SPA and do not trigger full page reloads.
 * Action triggers use HbcButton variant="ghost" per UI governance.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useRouter } from '@tanstack/react-router';
import { HbcCard, HbcButton, ChevronForward } from '@hbc/ui-kit';

const useStyles = makeStyles({
  list: {
    listStyleType: 'none',
    ...({ padding: 0, margin: 0 } as Record<string, string | number>),
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
            icon={<ChevronForward size="sm" />}
            iconPosition="after"
            onClick={() => router.navigate({ to: '/project-setup', search: { mode: 'new-request' } })}
          >
            Create project request
          </HbcButton>
        </li>
        <li>
          <HbcButton
            variant="ghost"
            size="sm"
            icon={<ChevronForward size="sm" />}
            iconPosition="after"
            onClick={() => router.navigate({ to: '/projects' })}
          >
            View my requests
          </HbcButton>
        </li>
        <li>
          <HbcButton
            variant="ghost"
            size="sm"
            icon={<ChevronForward size="sm" />}
            iconPosition="after"
            onClick={() => router.navigate({ to: '/project-hub' })}
          >
            Go to Project Hub
          </HbcButton>
        </li>
      </ul>
    </HbcCard>
  );
}

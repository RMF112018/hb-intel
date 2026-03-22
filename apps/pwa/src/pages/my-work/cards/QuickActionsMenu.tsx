/**
 * QuickActionsMenu — P2-D1 §6: available to all roles.
 * Common action shortcuts for the hub.
 *
 * UIF-047-addl: Extracted from QuickActionsCard. Standalone menu component
 * with `data-hbc-ui="quick-actions-menu"` attribute.
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
  heading: {
    ...heading4,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  btnStart: {
    justifyContent: 'flex-start',
  },
});

export function QuickActionsMenu(): ReactNode {
  const styles = useStyles();
  const router = useRouter();

  return (
    <div data-hbc-ui="quick-actions-menu">
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
    </div>
  );
}

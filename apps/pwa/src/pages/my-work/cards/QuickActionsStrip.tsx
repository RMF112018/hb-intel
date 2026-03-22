/**
 * QuickActionsStrip — UIF-048-addl: Compact inline action strip for the tab row.
 *
 * Desktop-only horizontal row of ghost buttons — same actions as QuickActionsMenu
 * but without the HbcCard wrapper. Renders in HubTeamModeSelector's rightSlot.
 * Hidden below HBC_BREAKPOINT_SIDEBAR (1024px) via the parent's responsive rule.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useRouter } from '@tanstack/react-router';
import { HbcButton, Create, ViewList, ViewGrid } from '@hbc/ui-kit';

const useStyles = makeStyles({
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

export function QuickActionsStrip(): ReactNode {
  const styles = useStyles();
  const router = useRouter();

  return (
    <div className={styles.strip} data-hbc-ui="quick-actions-strip">
      <HbcButton
        variant="ghost"
        size="sm"
        icon={<Create size="sm" />}
        onClick={() => router.navigate({ to: '/project-setup', search: { mode: 'new-request' } })}
      >
        New
      </HbcButton>
      <HbcButton
        variant="ghost"
        size="sm"
        icon={<ViewList size="sm" />}
        onClick={() => router.navigate({ to: '/projects' })}
      >
        Requests
      </HbcButton>
      <HbcButton
        variant="ghost"
        size="sm"
        icon={<ViewGrid size="sm" />}
        onClick={() => router.navigate({ to: '/project-hub' })}
      >
        Hub
      </HbcButton>
    </div>
  );
}

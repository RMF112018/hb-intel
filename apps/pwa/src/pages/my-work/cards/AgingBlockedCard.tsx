/**
 * AgingBlockedCard — P2-D1 §6: Executive-only.
 * Aging and blocked item escalations (placeholder for first release).
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';

const useStyles = makeStyles({
  root: {
    gridColumn: 'span 6',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: { gridColumn: 'span 1' },
  },
});

export function AgingBlockedCard(): ReactNode {
  const styles = useStyles();

  return (
    <RoleGate requiredRole="Executive">
      <div className={styles.root}>
        <HbcCard weight="standard" header={<span>Aging &amp; Blocked</span>}>
          <p>Items requiring escalation or unblocking will appear here.</p>
        </HbcCard>
      </div>
    </RoleGate>
  );
}

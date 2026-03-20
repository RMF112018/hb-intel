/**
 * AdminOversightCard — P2-D1 §6: Administrator-only.
 * Admin oversight metrics (placeholder for first release).
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, HBC_BREAKPOINT_TABLET, HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';

const useStyles = makeStyles({
  root: {
    gridColumn: 'span 12',
    [`@media (max-width: ${HBC_BREAKPOINT_TABLET}px)`]: { gridColumn: 'span 6' },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: { gridColumn: 'span 1' },
  },
});

export function AdminOversightCard(): ReactNode {
  const styles = useStyles();

  return (
    <RoleGate requiredRole="Administrator">
      <div className={styles.root}>
        <HbcCard weight="supporting" header={<span>Admin Oversight</span>}>
          <p>System-wide oversight metrics and escalation queues will appear here.</p>
        </HbcCard>
      </div>
    </RoleGate>
  );
}

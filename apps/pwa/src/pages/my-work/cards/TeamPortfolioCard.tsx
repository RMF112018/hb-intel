/**
 * TeamPortfolioCard — P2-D1 §6: Executive-only.
 * Team portfolio summary (placeholder for first release).
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard } from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';

const useStyles = makeStyles({
  root: { gridColumn: 'span 6' },
});

export function TeamPortfolioCard(): ReactNode {
  const styles = useStyles();

  return (
    <RoleGate requiredRole="Executive">
      <div className={styles.root}>
        <HbcCard weight="standard" header={<span>Team Portfolio</span>}>
          <p>Team workload and delegation summary will appear here.</p>
        </HbcCard>
      </div>
    </RoleGate>
  );
}

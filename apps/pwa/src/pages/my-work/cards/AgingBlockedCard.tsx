/**
 * AgingBlockedCard — P2-D1 §6: Executive-only.
 * P2-D4 §3: Shows escalation-candidate scope counts.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, HbcKpiCard, HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';
import { useMyWorkTeamFeed } from '@hbc/my-work-feed';

const useStyles = makeStyles({
  root: {
    gridColumn: 'span 6',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: { gridColumn: 'span 1' },
  },
  kpiRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
});

export function AgingBlockedCard(): ReactNode {
  const styles = useStyles();
  const { teamFeed, isLoading } = useMyWorkTeamFeed({
    ownerScope: 'escalation-candidate',
  });

  return (
    <RoleGate requiredRole="Executive">
      <div className={styles.root}>
        <HbcCard weight="standard" header={<span>Aging &amp; Blocked</span>}>
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <div className={styles.kpiRow}>
              <HbcKpiCard label="Escalation Candidates" value={teamFeed?.escalationCandidateCount ?? 0} color="var(--colorPaletteRedForeground1)" />
              <HbcKpiCard label="Blocked" value={teamFeed?.blockedCount ?? 0} color="var(--colorPaletteYellowForeground1)" />
              <HbcKpiCard label="Aging" value={teamFeed?.agingCount ?? 0} />
            </div>
          )}
        </HbcCard>
      </div>
    </RoleGate>
  );
}

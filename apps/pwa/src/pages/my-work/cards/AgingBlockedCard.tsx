/**
 * AgingBlockedCard — P2-D1 §6: Executive-only.
 * P2-D4 §3: Shows escalation-candidate scope counts.
 *
 * UIF-008: Responsive KPI grid with semantic status ramp colors.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcKpiCard,
  HBC_BREAKPOINT_CONTENT_MEDIUM,
  HBC_BREAKPOINT_MOBILE,
  HBC_SPACE_MD,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
} from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';
import { useMyWorkTeamFeed } from '@hbc/my-work-feed';

const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(3, 1fr)',
    [`@media (max-width: ${HBC_BREAKPOINT_CONTENT_MEDIUM}px)`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
    },
  },
});

export function AgingBlockedCard(): ReactNode {
  const styles = useStyles();
  const { teamFeed, isLoading } = useMyWorkTeamFeed({
    ownerScope: 'escalation-candidate',
  });

  return (
    <RoleGate requiredRole="Executive">
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <div className={styles.kpiGrid}>
          <HbcKpiCard
            label="Escalation Candidates"
            value={teamFeed?.escalationCandidateCount ?? 0}
            color={HBC_STATUS_RAMP_RED[50]}
          />
          <HbcKpiCard
            label="Blocked"
            value={teamFeed?.blockedCount ?? 0}
            color={HBC_STATUS_RAMP_RED[50]}
          />
          <HbcKpiCard
            label="Aging"
            value={teamFeed?.agingCount ?? 0}
            color={HBC_STATUS_RAMP_AMBER[50]}
          />
        </div>
      )}
    </RoleGate>
  );
}

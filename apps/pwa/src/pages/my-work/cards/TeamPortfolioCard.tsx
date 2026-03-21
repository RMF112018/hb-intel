/**
 * TeamPortfolioCard — P2-D1 §6: Executive-only.
 * P2-D4 §3: Shows team feed counts (total, aging, blocked, escalation candidates).
 * Visible only in delegated-by-me or my-team mode.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, HbcKpiCard } from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';
import { useMyWorkTeamFeed } from '@hbc/my-work-feed';
import type { TeamMode } from '@hbc/shell';

const useStyles = makeStyles({
  kpiRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
});

export interface TeamPortfolioCardProps {
  teamMode: TeamMode;
}

export function TeamPortfolioCard({ teamMode }: TeamPortfolioCardProps): ReactNode {
  const styles = useStyles();
  const ownerScope = teamMode === 'my-team' ? 'my-team' : 'delegated-by-me';
  const { teamFeed, isLoading } = useMyWorkTeamFeed({
    ownerScope,
    enabled: teamMode !== 'personal',
  });

  if (teamMode === 'personal') return null;

  return (
    <RoleGate requiredRole="Executive">
      <HbcCard weight="standard" header={<span>Team Portfolio</span>}>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <div className={styles.kpiRow}>
            <HbcKpiCard label="Total Items" value={teamFeed?.totalCount ?? 0} />
            <HbcKpiCard label="Aging" value={teamFeed?.agingCount ?? 0} color="var(--colorPaletteYellowForeground1)" />
            <HbcKpiCard label="Blocked" value={teamFeed?.blockedCount ?? 0} color="var(--colorPaletteRedForeground1)" />
            <HbcKpiCard label="Escalation" value={teamFeed?.escalationCandidateCount ?? 0} />
          </div>
        )}
      </HbcCard>
    </RoleGate>
  );
}

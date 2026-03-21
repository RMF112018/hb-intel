/**
 * AgingBlockedCard — P2-D1 §6: Executive-only.
 * P2-D4 §3: Shows escalation-candidate scope counts.
 *
 * UIF-008: Responsive KPI grid with semantic status ramp colors.
 * UIF-001 fix: grid uses auto-fit + minmax so columns reflow to container width
 * instead of overflowing. Mirrors the fix applied to PersonalAnalyticsCard.
 * UIF-013-addl: All tiles interactive with click-to-filter (same pattern as
 * PersonalAnalyticsCard).
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcKpiCard,
  HbcSpinner,
  HBC_SPACE_MD,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
} from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';
import { useMyWorkTeamFeed } from '@hbc/my-work-feed';

// UIF-001: auto-fit + minmax(90px, 1fr) — same rationale as PersonalAnalyticsCard.
// 3 cards fit in a single row at ≥302px; wrap to 2+1 below that.
const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
  },
});

export interface AgingBlockedCardProps {
  /** UIF-013-addl: Currently active KPI filter key. */
  activeFilter?: string | null;
  /** UIF-013-addl: Callback when a KPI card is clicked. */
  onFilterChange?: (filter: string) => void;
}

export function AgingBlockedCard({
  activeFilter,
  onFilterChange,
}: AgingBlockedCardProps): ReactNode {
  const styles = useStyles();
  const { teamFeed, isLoading } = useMyWorkTeamFeed({
    ownerScope: 'escalation-candidate',
  });

  return (
    <RoleGate requiredRole="Executive">
      {isLoading ? (
        /* Per-tile loading — WorkspacePageShell isLoading is page-level, not applicable here. */
        /* eslint-disable-next-line @hb-intel/hbc/no-direct-spinner */
        <HbcSpinner size="sm" label="Loading insights" />
      ) : (
        <div className={styles.kpiGrid}>
          <HbcKpiCard
            label="Escalation Candidates"
            value={teamFeed?.escalationCandidateCount ?? 0}
            color={HBC_STATUS_RAMP_RED[50]}
            isActive={activeFilter === 'escalation'}
            onClick={() => onFilterChange?.('escalation')}
          />
          <HbcKpiCard
            label="Blocked"
            value={teamFeed?.blockedCount ?? 0}
            color={HBC_STATUS_RAMP_RED[50]}
            isActive={activeFilter === 'blocked'}
            onClick={() => onFilterChange?.('blocked')}
          />
          <HbcKpiCard
            label="Aging"
            value={teamFeed?.agingCount ?? 0}
            color={HBC_STATUS_RAMP_AMBER[50]}
            isActive={activeFilter === 'aging'}
            onClick={() => onFilterChange?.('aging')}
          />
        </div>
      )}
    </RoleGate>
  );
}

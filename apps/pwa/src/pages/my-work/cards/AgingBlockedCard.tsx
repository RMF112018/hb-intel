/**
 * AgingBlockedCard — P2-D1 §6: Executive-only.
 * P2-D4 §3: Shows escalation-candidate scope counts.
 *
 * UIF-008: Responsive KPI grid with semantic status ramp colors.
 * UIF-039-addl: Explicit 2-column grid (Escalation Candidates + Aging).
 * Duplicate "Blocked" card removed — PersonalAnalyticsCard handles that filter.
 * UIF-013-addl: All tiles interactive with click-to-filter.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcKpiCard,
  HbcSpinner,
  HBC_SPACE_MD,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_GRAY,
} from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';
import { useMyWorkTeamFeed } from '@hbc/my-work-feed';
import { Upload, StatusOverdueIcon } from '@hbc/ui-kit/icons';

// UIF-043-addl: Container-aware auto-fill grid — adapts to actual panel width.
// 2 cards (Escalation Candidates, Aging) flow into available columns.
const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
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
          {/* INS-009: Flat trend placeholders — replaced with real deltas when data model supports it */}
          <HbcKpiCard
            label="Escalation Candidates"
            value={teamFeed?.escalationCandidateCount ?? 0}
            color={HBC_STATUS_RAMP_AMBER[50]}
            icon={<Upload size="sm" />}
            trend={{ direction: 'flat', label: 'No change' }}
            ariaLabel={`Filter by Escalation Candidates: ${teamFeed?.escalationCandidateCount ?? 0} items`}
            isActive={activeFilter === 'escalation'}
            onClick={() => onFilterChange?.('escalation')}
          />
          {/* UIF-039-addl: Duplicate "Blocked" card removed — PersonalAnalyticsCard
              already renders the personal Blocked KPI with the same filter key. */}
          <HbcKpiCard
            label="Aging"
            value={teamFeed?.agingCount ?? 0}
            color={HBC_STATUS_RAMP_GRAY[50]}
            icon={<StatusOverdueIcon size="sm" />}
            trend={{ direction: 'flat', label: 'No change' }}
            ariaLabel={`Filter by Aging: ${teamFeed?.agingCount ?? 0} items`}
            isActive={activeFilter === 'aging'}
            onClick={() => onFilterChange?.('aging')}
          />
        </div>
      )}
    </RoleGate>
  );
}

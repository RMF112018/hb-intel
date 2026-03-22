/**
 * AgingBlockedCard — P2-D1 §6: Executive-only.
 * P2-D4 §3: Shows escalation-candidate scope counts.
 *
 * UIF-008: Responsive KPI grid with semantic status ramp colors.
 * UIF-039-addl: Duplicate "Blocked" card removed — PersonalAnalyticsCard handles that filter.
 * UIF-046-addl: On short viewports (< 700px height), collapses into a <details>
 * disclosure to prioritize hero + primary KPIs. Consistent with HubTertiaryZone pattern.
 * UIF-013-addl: All tiles interactive with click-to-filter.
 */
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { tokens } from '@fluentui/react-components';
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

const SHORT_VIEWPORT_HEIGHT = 700;

const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    minHeight: 0,
  },
  // UIF-046-addl: Disclosure wrapper for short viewports.
  disclosure: {
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius('8px'),
    overflow: 'hidden',
  },
  disclosureSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    listStyleType: 'none',
    '::-webkit-details-marker': { display: 'none' },
    '::marker': { display: 'none' },
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  disclosureBody: {
    padding: `0 12px 12px`,
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

  // UIF-046-addl: Detect short viewport for constrained-height collapse.
  const [isShort, setIsShort] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsShort(window.innerHeight < SHORT_VIEWPORT_HEIGHT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cardContent = (
    <div className={styles.kpiGrid}>
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
  );

  return (
    <RoleGate requiredRole="Executive">
      {isLoading ? (
        /* eslint-disable-next-line @hb-intel/hbc/no-direct-spinner */
        <HbcSpinner size="sm" label="Loading insights" />
      ) : isShort ? (
        <details className={styles.disclosure}>
          <summary className={styles.disclosureSummary}>
            More insights (2)
            <span aria-hidden="true">▾</span>
          </summary>
          <div className={styles.disclosureBody}>{cardContent}</div>
        </details>
      ) : (
        cardContent
      )}
    </RoleGate>
  );
}

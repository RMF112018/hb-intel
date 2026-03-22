/**
 * AdminOversightCard — P2-D1 §6: Administrator-only.
 * P2-D3: `ao-provisioning-health` — system-wide oversight metrics.
 *
 * Shows aggregate system KPIs from useMyWorkCounts() for Administrator users.
 * Gated by RoleGate so non-admins see nothing.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcCard,
  HbcKpiCard,
  HbcSpinner,
  HBC_SPACE_MD,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_GRAY,
  HBC_PRIMARY_BLUE,
  heading4,
} from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';
import { useMyWorkCounts } from '@hbc/my-work-feed';

const useStyles = makeStyles({
  heading: {
    ...heading4,
    margin: '0',
  },
  kpiRow: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
  },
});

export function AdminOversightCard(): ReactNode {
  const styles = useStyles();
  const { counts, isLoading } = useMyWorkCounts();

  return (
    <RoleGate requiredRole="Administrator">
      <HbcCard weight="standard" header={<span className={styles.heading}>Admin Oversight</span>}>
        {isLoading ? (
          // eslint-disable-next-line @hb-intel/hbc/no-direct-spinner
          <HbcSpinner size="sm" label="Loading oversight data" />
        ) : (
          <div className={styles.kpiRow}>
            <HbcKpiCard
              label="Total Items"
              value={counts?.totalCount ?? 0}
              color={HBC_PRIMARY_BLUE}
            />
            <HbcKpiCard
              label="Blocked"
              value={counts?.blockedCount ?? 0}
              color={HBC_STATUS_RAMP_RED[50]}
            />
            <HbcKpiCard
              label="Waiting"
              value={counts?.waitingCount ?? 0}
              color={HBC_STATUS_RAMP_AMBER[50]}
            />
            <HbcKpiCard
              label="Deferred"
              value={counts?.deferredCount ?? 0}
              color={HBC_STATUS_RAMP_GRAY[50]}
            />
          </div>
        )}
      </HbcCard>
    </RoleGate>
  );
}

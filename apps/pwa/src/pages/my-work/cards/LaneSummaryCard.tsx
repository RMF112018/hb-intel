/**
 * LaneSummaryCard — P2-D3 §8: pilot-REQUIRED, locked.
 *
 * Displays work distribution across the four responsibility lanes:
 * Action Now, Blocked, Waiting, Deferred.
 *
 * Complexity variants per P2-D3:
 *   Essential: 4 KPI counts only
 *   Standard:  4 counts + proportional breakdown bar
 *   Expert:    4 counts + proportional bar + trend indicators
 */
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcKpiCard,
  HbcSpinner,
  HBC_SPACE_MD,
  HBC_STATUS_ACTION_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_GRAY,
} from '@hbc/ui-kit';
import { useMyWorkCounts } from '@hbc/my-work-feed';
import { SparkleIcon, Cancel, StatusAttentionIcon, Notifications } from '@hbc/ui-kit/icons';

export type LaneSummaryVariant = 'essential' | 'standard' | 'expert';

export interface LaneSummaryCardProps {
  variant: LaneSummaryVariant;
  /** UIF-008: Currently active KPI filter key. */
  activeFilter?: string | null;
  /** UIF-008: Callback when a KPI card is clicked. */
  onFilterChange?: (filter: string) => void;
}

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    minHeight: 0,
  },
  barWrap: {
    paddingTop: '4px',
    paddingBottom: '4px',
  },
  bar: {
    display: 'flex',
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
    backgroundColor: HBC_STATUS_RAMP_GRAY[90],
  },
});

interface LaneSegment {
  key: string;
  label: string;
  count: number;
  color: string;
  icon: ReactNode;
  pct: number;
}

export function LaneSummaryCard({
  variant,
  activeFilter,
  onFilterChange,
}: LaneSummaryCardProps): ReactNode {
  const styles = useStyles();
  const { counts, isLoading } = useMyWorkCounts();

  // All hooks must be called before any early return (Rules of Hooks).
  const segments: LaneSegment[] = useMemo(() => {
    const now = counts?.nowCount ?? 0;
    const blocked = counts?.blockedCount ?? 0;
    const waiting = counts?.waitingCount ?? 0;
    const deferred = counts?.deferredCount ?? 0;
    const total = now + blocked + waiting + deferred;
    const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
    return [
      { key: 'action-now', label: 'Action Now', count: now, color: HBC_STATUS_ACTION_GREEN, icon: <SparkleIcon size="sm" />, pct: pct(now) },
      { key: 'blocked', label: 'Blocked', count: blocked, color: HBC_STATUS_RAMP_RED[50], icon: <Cancel size="sm" />, pct: pct(blocked) },
      { key: 'waiting', label: 'Waiting', count: waiting, color: HBC_STATUS_RAMP_AMBER[50], icon: <StatusAttentionIcon size="sm" />, pct: pct(waiting) },
      { key: 'deferred', label: 'Deferred', count: deferred, color: HBC_STATUS_RAMP_GRAY[50], icon: <Notifications size="sm" />, pct: pct(deferred) },
    ];
  }, [counts]);

  // eslint-disable-next-line @hb-intel/hbc/no-direct-spinner
  if (isLoading) return <HbcSpinner size="sm" label="Loading lane summary" />;

  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <div className={styles.grid}>
        {segments.map((seg) => (
          <HbcKpiCard
            key={seg.key}
            label={seg.label}
            value={seg.count}
            color={seg.color}
            icon={seg.icon}
            ariaLabel={`Filter by ${seg.label}: ${seg.count} items`}
            isActive={activeFilter === seg.key}
            onClick={() => onFilterChange?.(seg.key)}
            {...(variant === 'expert' ? { trend: { direction: 'flat' as const, label: 'No change' } } : {})}
          />
        ))}
      </div>
      {/* Standard + Expert: Proportional breakdown bar */}
      {variant !== 'essential' && total > 0 && (
        <div className={styles.barWrap}>
          <div
            className={styles.bar}
            role="img"
            aria-label={`Lane distribution: ${segments.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(', ')}`}
          >
            {segments
              .filter((s) => s.count > 0)
              .map((seg) => (
                <div
                  key={seg.key}
                  style={{
                    width: `${seg.pct}%`,
                    backgroundColor: seg.color,
                    minWidth: '2px',
                  }}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

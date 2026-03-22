/**
 * SourceBreakdownCard — P2-D3 §8: pilot-REQUIRED.
 *
 * Displays work distribution across source modules (Estimating, BD, etc.)
 * by grouping feed items by `context.moduleKey`.
 *
 * Complexity variants per P2-D3:
 *   Essential: Total count only
 *   Standard:  Horizontal stacked bar + per-module counts
 *   Expert:    Detailed table with module name, count, percentage
 */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  tokens,
  HbcCard,
  HbcSpinner,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_PRIMARY_BLUE,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_GRAY,
  heading4,
} from '@hbc/ui-kit';
import { useMyWork, formatModuleLabel } from '@hbc/my-work-feed';

export type SourceBreakdownVariant = 'essential' | 'standard' | 'expert';

export interface SourceBreakdownCardProps {
  variant: SourceBreakdownVariant;
}

/** Stable palette for module bar segments. */
const MODULE_COLORS = [
  HBC_PRIMARY_BLUE,
  HBC_STATUS_RAMP_GREEN[50],
  HBC_STATUS_RAMP_AMBER[50],
  HBC_STATUS_RAMP_INFO[50],
  HBC_STATUS_RAMP_RED[50],
  HBC_STATUS_RAMP_GRAY[50],
];

interface ModuleBucket {
  moduleKey: string;
  label: string;
  count: number;
  pct: number;
  color: string;
}

const useStyles = makeStyles({
  heading: {
    ...heading4,
    color: tokens.colorNeutralForeground1,
    margin: '0',
  },
  total: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
    padding: `${HBC_SPACE_SM}px 0`,
  },
  barWrap: {
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
  },
  bar: {
    display: 'flex',
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: HBC_STATUS_RAMP_GRAY[90],
  },
  legend: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_SM}px`,
    fontSize: '0.75rem',
    color: tokens.colorNeutralForeground2,
  },
  legendDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '4px',
    verticalAlign: 'middle',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    marginTop: `${HBC_SPACE_MD}px`,
  },
  tableRow: {
    borderBottom: `1px solid ${HBC_STATUS_RAMP_GRAY[90]}`,
  },
  tableCell: {
    padding: '6px 8px',
    textAlign: 'left',
  },
  tableCellRight: {
    padding: '6px 8px',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
});

export function SourceBreakdownCard({ variant }: SourceBreakdownCardProps): ReactNode {
  const styles = useStyles();
  const { feed, isLoading } = useMyWork();

  const buckets: ModuleBucket[] = useMemo(() => {
    if (!feed?.items) return [];
    const map = new Map<string, number>();
    for (const item of feed.items) {
      const key = item.context?.moduleKey ?? 'unknown';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const total = feed.items.length;
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([moduleKey, count], i) => ({
        moduleKey,
        label: formatModuleLabel(moduleKey),
        count,
        pct: total > 0 ? (count / total) * 100 : 0,
        color: MODULE_COLORS[i % MODULE_COLORS.length],
      }));
  }, [feed]);

  const total = feed?.items.length ?? 0;

  // eslint-disable-next-line @hb-intel/hbc/no-direct-spinner
  if (isLoading) return <HbcSpinner size="sm" label="Loading source breakdown" />;

  // Essential: total count only
  if (variant === 'essential') {
    return (
      <HbcCard weight="standard" header={<span className={styles.heading}>Sources</span>}>
        <div className={styles.total}>{total} items</div>
      </HbcCard>
    );
  }

  // Standard: bar + legend
  return (
    <HbcCard weight="standard" header={<span className={styles.heading}>Source Breakdown</span>}>
      {total === 0 ? (
        <div className={styles.total}>No items</div>
      ) : (
        <>
          <div className={styles.barWrap}>
            <div
              className={styles.bar}
              role="img"
              aria-label={`Source distribution: ${buckets.map((b) => `${b.label} ${b.count}`).join(', ')}`}
            >
              {buckets.map((b) => (
                <div
                  key={b.moduleKey}
                  style={{
                    width: `${b.pct}%`,
                    backgroundColor: b.color,
                    minWidth: b.count > 0 ? '2px' : 0,
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles.legend}>
            {buckets.map((b) => (
              <span key={b.moduleKey}>
                <span className={styles.legendDot} style={{ backgroundColor: b.color }} />
                {b.label} {b.count}
              </span>
            ))}
          </div>
          {/* Expert: detailed table with percentages */}
          {variant === 'expert' && (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableRow}>
                  <th className={styles.tableCell}>Module</th>
                  <th className={styles.tableCellRight}>Count</th>
                  <th className={styles.tableCellRight}>%</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((b) => (
                  <tr key={b.moduleKey} className={styles.tableRow}>
                    <td className={styles.tableCell}>{b.label}</td>
                    <td className={styles.tableCellRight}>{b.count}</td>
                    <td className={styles.tableCellRight}>{b.pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </HbcCard>
  );
}

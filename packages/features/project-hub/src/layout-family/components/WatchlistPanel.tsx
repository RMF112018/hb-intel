import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  Card,
  CardHeader,
  HBC_DENSITY_TOKENS,
  HBC_SPACE_SM,
  HBC_SPACE_XS,
  Text,
  useDensity,
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
} from '@hbc/ui-kit';

import type { WatchlistItem, WatchlistSummary } from '../hooks/useWatchlistSummary.js';
import { WATCHLIST_SIGNAL_TYPE_LABELS } from '../hooks/useWatchlistSummary.js';

const SEVERITY_COLORS: Record<WatchlistItem['severity'], string> = {
  critical: HBC_STATUS_COLORS.critical,
  high: HBC_STATUS_COLORS.atRisk,
  medium: HBC_STATUS_COLORS.warning,
};

const TREND_ICONS: Record<WatchlistItem['trend'], string> = {
  worsening: '\u2191',  // ↑
  stable: '\u2192',     // →
  improving: '\u2193',  // ↓
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
  header: {
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  headerCounts: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_XS}px`,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  criticalBadge: {
    backgroundColor: HBC_SURFACE_LIGHT['destructive-bg'],
    color: HBC_SURFACE_LIGHT['destructive-text'],
  },
  highBadge: {
    backgroundColor: HBC_STATUS_COLORS.warning + '33',
    color: HBC_STATUS_COLORS.warning,
  },
  itemList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['surface-2']}`,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  itemSelected: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-active'],
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_STATUS_COLORS.info,
  },
  itemComfortable: {
    padding: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px ${HBC_SPACE_SM}px`,
  },
  itemTouch: {
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px ${HBC_SPACE_SM}px`,
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_XS}px`,
  },
  severityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  trendIndicator: {
    fontSize: '12px',
    fontWeight: 600,
  },
  trendWorsening: { color: HBC_STATUS_COLORS.critical },
  trendStable: { color: HBC_STATUS_COLORS.neutral },
  trendImproving: { color: HBC_STATUS_COLORS.success },
});

export interface WatchlistPanelProps {
  readonly watchlist: WatchlistSummary;
  readonly selectedItemId: string | null;
  readonly onSelectItem: (id: string | null) => void;
}

export function WatchlistPanel({
  watchlist,
  selectedItemId,
  onSelectItem,
}: WatchlistPanelProps): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();

  return (
    <nav
      data-testid="watchlist-panel"
      className={styles.root}
    >
      <div className={styles.header}>
        <Text weight="semibold" size={200}>Watchlist</Text>
        <div className={styles.headerCounts}>
          {watchlist.criticalCount > 0 && (
            <span className={mergeClasses(styles.countBadge, styles.criticalBadge)}>
              {watchlist.criticalCount} critical
            </span>
          )}
          {watchlist.highCount > 0 && (
            <span className={mergeClasses(styles.countBadge, styles.highBadge)}>
              {watchlist.highCount} high
            </span>
          )}
        </div>
      </div>
      <div className={styles.itemList}>
        {watchlist.items.map((item) => {
          const isSelected = selectedItemId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`watchlist-item-${item.id}`}
              data-severity={item.severity}
              className={mergeClasses(
                styles.item,
                isSelected && styles.itemSelected,
                densityTier === 'comfortable' && styles.itemComfortable,
                densityTier === 'touch' && styles.itemTouch,
              )}
              onClick={() => onSelectItem(isSelected ? null : item.id)}
              aria-pressed={isSelected}
            >
              <div className={styles.itemHeader}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className={styles.severityDot}
                    style={{ backgroundColor: SEVERITY_COLORS[item.severity] }}
                  />
                  <Text size={200} weight="semibold">{item.projectName}</Text>
                </span>
                <span
                  className={mergeClasses(
                    styles.trendIndicator,
                    item.trend === 'worsening' && styles.trendWorsening,
                    item.trend === 'stable' && styles.trendStable,
                    item.trend === 'improving' && styles.trendImproving,
                  )}
                >
                  {TREND_ICONS[item.trend]}
                </span>
              </div>
              <Text size={200}>{WATCHLIST_SIGNAL_TYPE_LABELS[item.signalType]}</Text>
              <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>
                {item.owner} · {item.ageDays}d · {item.trend}
              </Text>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

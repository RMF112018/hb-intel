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
} from '@hbc/ui-kit';

import type { WatchlistItem, WatchlistSummary } from '../hooks/useWatchlistSummary.js';
import { WATCHLIST_SIGNAL_TYPE_LABELS } from '../hooks/useWatchlistSummary.js';

const SEVERITY_COLORS: Record<WatchlistItem['severity'], string> = {
  critical: '#A4262C',
  high: '#D83B01',
  medium: '#CA5010',
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
    borderRight: '1px solid #edebe9',
    backgroundColor: '#faf9f8',
  },
  header: {
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: '1px solid #edebe9',
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
    backgroundColor: '#FDE7E9',
    color: '#A4262C',
  },
  highBadge: {
    backgroundColor: '#FFF4CE',
    color: '#835C00',
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
    borderBottom: '1px solid #f3f2f1',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  itemSelected: {
    backgroundColor: '#EFF6FC',
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: '#0078D4',
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
  trendWorsening: { color: '#A4262C' },
  trendStable: { color: '#8A8886' },
  trendImproving: { color: '#107C10' },
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
              <Text size={100} style={{ color: '#605e5c' }}>
                {item.owner} · {item.ageDays}d · {item.trend}
              </Text>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

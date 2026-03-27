/**
 * HbcNavRail — generic collapsible navigation rail.
 *
 * Theme-aware: uses Fluent CSS custom properties (var(--colorNeutral*))
 * that resolve per theme context. No hardcoded light-mode values.
 */

import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';

import { HBC_DENSITY_TOKENS } from '../theme/density.js';
import { HBC_SPACE_SM, HBC_SPACE_XS } from '../theme/grid.js';
import { HBC_STATUS_COLORS } from '../theme/tokens.js';
import { Text } from '@fluentui/react-components';
import type { HbcNavRailProps, NavRailItemStatus } from '../layouts/multi-column-types.js';

const STATUS_COLOR_MAP: Record<NavRailItemStatus, string> = {
  healthy: HBC_STATUS_COLORS.success,
  watch: HBC_STATUS_COLORS.warning,
  'at-risk': HBC_STATUS_COLORS.atRisk,
  critical: HBC_STATUS_COLORS.critical,
  'no-data': HBC_STATUS_COLORS.neutral,
  'read-only': HBC_STATUS_COLORS.info,
  'review-only': HBC_STATUS_COLORS.inProgress,
  escalates: HBC_STATUS_COLORS.pending,
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: '1px solid var(--colorNeutralStroke1)',
  },
  collapseButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: `${HBC_SPACE_XS}px`,
    fontSize: '14px',
    color: 'var(--colorNeutralForeground3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    minHeight: '24px',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
    },
  },
  itemList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '150ms',
    backgroundColor: 'transparent',
    border: 'none',
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'transparent',
    width: '100%',
    textAlign: 'left',
    color: 'var(--colorNeutralForeground1)',
    ':hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'var(--colorBrandStroke1)',
      outlineOffset: '-2px',
      borderRadius: '2px',
    },
  },
  itemComfortable: {
    minHeight: `${HBC_DENSITY_TOKENS.comfortable.touchTargetMin}px`,
    padding: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px ${HBC_SPACE_SM}px`,
  },
  itemTouch: {
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px ${HBC_SPACE_SM}px`,
  },
  itemSelected: {
    borderLeftColor: 'var(--colorBrandStroke1)',
    backgroundColor: 'var(--colorNeutralBackground3)',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusDotTouch: {
    width: '14px',
    height: '14px',
  },
  itemLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: 'var(--colorNeutralBackground4)',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--colorNeutralForeground1)',
    padding: '0 4px',
    flexShrink: 0,
  },
  countBadgeUrgent: {
    backgroundColor: HBC_STATUS_COLORS.error,
    color: '#FFFFFF',
  },
  collapsedItem: {
    justifyContent: 'center',
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_XS}px`,
  },
});

export function HbcNavRail({
  items,
  selectedItemId,
  onSelectItem,
  collapsed,
  onToggleCollapse,
  title = 'Navigation',
  testId,
}: HbcNavRailProps): ReactNode {
  const styles = useStyles();

  const handleClick = (id: string): void => {
    onSelectItem(selectedItemId === id ? null : id);
  };

  return (
    <nav
      data-testid={testId ?? 'hbc-nav-rail'}
      data-collapsed={collapsed}
      className={styles.root}
    >
      <div className={styles.header}>
        {!collapsed && <Text weight="semibold" size={200}>{title}</Text>}
        <button
          type="button"
          className={styles.collapseButton}
          onClick={onToggleCollapse}
          aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          {collapsed ? '\u203A' : '\u2039'}
        </button>
      </div>
      <div className={styles.itemList}>
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const totalCount = item.issueCount + item.actionCount;

          return (
            <button
              key={item.id}
              type="button"
              data-testid={`nav-rail-item-${item.id}`}
              data-status={item.status}
              className={mergeClasses(
                styles.item,
                isSelected && styles.itemSelected,
                collapsed && styles.collapsedItem,
              )}
              onClick={() => handleClick(item.id)}
              aria-pressed={isSelected}
              title={collapsed ? `${item.label} — ${item.status}` : undefined}
            >
              <span
                className={styles.statusDot}
                style={{ backgroundColor: STATUS_COLOR_MAP[item.status] }}
                role="img"
                aria-label={item.status}
              />
              {!collapsed && (
                <>
                  <span className={styles.itemLabel}>
                    <Text size={200}>{item.label}</Text>
                  </span>
                  {totalCount > 0 && (
                    <span
                      className={mergeClasses(
                        styles.countBadge,
                        item.issueCount > 0 && styles.countBadgeUrgent,
                      )}
                    >
                      {totalCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { HbcNavRailProps, NavRailItem, NavRailItemStatus } from '../layouts/multi-column-types.js';

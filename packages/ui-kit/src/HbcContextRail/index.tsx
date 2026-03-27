/**
 * HbcContextRail — generic right-rail card stack with sections.
 *
 * Theme-aware: uses Fluent CSS custom properties that resolve per theme.
 */

import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Text } from '@fluentui/react-components';

import { HBC_DENSITY_TOKENS } from '../theme/density.js';
import { HBC_SPACE_SM, HBC_SPACE_XS } from '../theme/grid.js';
import { useDensity } from '../theme/useDensity.js';
import type { HbcContextRailProps } from '../layouts/multi-column-types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    overflowY: 'auto',
    overflowX: 'hidden',
    borderLeft: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
    padding: `${HBC_SPACE_SM}px`,
    height: '100%',
  },
  rootComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
    padding: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px`,
  },
  rootTouch: {
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_XS}px 0`,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: 'var(--colorNeutralBackground4)',
    fontSize: '11px',
    fontWeight: 600,
    padding: '0 4px',
    color: 'var(--colorNeutralForeground1)',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: `${HBC_SPACE_XS}px 0`,
    borderBottom: '1px solid var(--colorNeutralStroke2)',
  },
  itemRowComfortable: {
    minHeight: `${HBC_DENSITY_TOKENS.comfortable.touchTargetMin}px`,
  },
  itemRowTouch: {
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    padding: `${HBC_SPACE_SM}px 0`,
  },
  emptyText: {
    color: 'var(--colorNeutralForeground3)',
    padding: `${HBC_SPACE_XS}px 0`,
  },
  section: {
    backgroundColor: 'var(--colorNeutralBackground1)',
    borderRadius: '4px',
    border: '1px solid var(--colorNeutralStroke1)',
    padding: `${HBC_SPACE_SM}px`,
  },
  subtitle: {
    color: 'var(--colorNeutralForeground3)',
  },
});

export function HbcContextRail({
  sections,
  testId,
}: HbcContextRailProps): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();

  return (
    <aside
      data-testid={testId ?? 'hbc-context-rail'}
      className={mergeClasses(
        styles.root,
        densityTier === 'comfortable' && styles.rootComfortable,
        densityTier === 'touch' && styles.rootTouch,
      )}
    >
      {sections.map((section) => {
        const visibleItems = section.maxItems
          ? section.items.slice(0, section.maxItems)
          : section.items;

        return (
          <div key={section.id} className={styles.section} data-testid={`context-rail-section-${section.id}`}>
            <div className={styles.sectionHeader}>
              <Text weight="semibold" size={200}>{section.title}</Text>
              <span className={styles.countBadge}>{section.items.length}</span>
            </div>
            <div className={styles.itemList}>
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className={mergeClasses(
                    styles.itemRow,
                    densityTier === 'comfortable' && styles.itemRowComfortable,
                    densityTier === 'touch' && styles.itemRowTouch,
                  )}
                  data-testid={`context-rail-item-${item.id}`}
                >
                  <Text size={200}>{item.title}</Text>
                  {item.subtitle && (
                    <Text size={100} className={styles.subtitle}>{item.subtitle}</Text>
                  )}
                </div>
              ))}
              {section.items.length === 0 && (
                <Text size={200} className={styles.emptyText}>
                  {section.emptyMessage ?? 'No items'}
                </Text>
              )}
            </div>
          </div>
        );
      })}
    </aside>
  );
}

export type { HbcContextRailProps, ContextRailSection, ContextRailItem } from '../layouts/multi-column-types.js';

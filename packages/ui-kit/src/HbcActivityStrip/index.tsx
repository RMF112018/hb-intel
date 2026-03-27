/**
 * HbcActivityStrip — generic collapsible timeline strip.
 *
 * Theme-aware: uses Fluent CSS custom properties that resolve per theme.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { makeStyles } from '@griffel/react';

import { HBC_SPACE_SM, HBC_SPACE_XS } from '../theme/grid.js';
import { HBC_STATUS_COLORS } from '../theme/tokens.js';
import { Text } from '@fluentui/react-components';
import type { HbcActivityStripProps, ActivityStripEntry } from '../layouts/multi-column-types.js';

const DEFAULT_TYPE_COLORS: Readonly<Record<string, string>> = {
  decision: HBC_STATUS_COLORS.info,
  milestone: HBC_STATUS_COLORS.success,
  escalation: HBC_STATUS_COLORS.error,
  publication: HBC_STATUS_COLORS.inProgress,
  blocker: HBC_STATUS_COLORS.critical,
  handoff: HBC_STATUS_COLORS.warning,
  'state-change': HBC_STATUS_COLORS.neutral,
};

const useStyles = makeStyles({
  root: {
    borderTop: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
    },
  },
  summaryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
  },
  summaryCount: {
    color: 'var(--colorNeutralForeground3)',
  },
  timeline: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`,
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_XS}px`,
    flexShrink: 0,
    minWidth: '200px',
    maxWidth: '280px',
    padding: `${HBC_SPACE_XS}px`,
    borderRadius: '4px',
    backgroundColor: 'var(--colorNeutralBackground1)',
    border: '1px solid var(--colorNeutralStroke1)',
  },
  typeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '4px',
  },
  entryContent: {
    flex: 1,
    minWidth: 0,
  },
  entryMeta: {
    color: 'var(--colorNeutralForeground3)',
  },
  chevron: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground3)',
  },
});

export function HbcActivityStrip({
  entries,
  defaultCollapsed = true,
  typeLabels,
  typeColors,
  testId,
}: HbcActivityStripProps): ReactNode {
  const styles = useStyles();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const colors = typeColors ?? DEFAULT_TYPE_COLORS;

  return (
    <div
      data-testid={testId ?? 'hbc-activity-strip'}
      data-collapsed={collapsed}
      className={styles.root}
    >
      <div
        className={styles.header}
        onClick={() => setCollapsed(!collapsed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCollapsed(!collapsed); }}
        aria-expanded={!collapsed}
      >
        <div className={styles.summaryBadge}>
          <Text weight="semibold" size={200}>Activity</Text>
          <Text size={200} className={styles.summaryCount}>
            {entries.length} recent events
          </Text>
        </div>
        <span className={styles.chevron}>{collapsed ? '\u25B6' : '\u25BC'}</span>
      </div>
      {!collapsed && (
        <div className={styles.timeline}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.entry}>
              <span
                className={styles.typeDot}
                style={{ backgroundColor: colors[entry.type] ?? HBC_STATUS_COLORS.neutral }}
              />
              <div className={styles.entryContent}>
                <Text size={200} weight="semibold">
                  {typeLabels?.[entry.type] ?? entry.type}
                </Text>
                <br />
                <Text size={200}>{entry.title}</Text>
                <br />
                <Text size={100} className={styles.entryMeta}>
                  {entry.actor ?? entry.source} · {new Date(entry.timestamp).toLocaleDateString()}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { HbcActivityStripProps, ActivityStripEntry } from '../layouts/multi-column-types.js';

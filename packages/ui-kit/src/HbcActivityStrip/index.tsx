/**
 * HbcActivityStrip — generic collapsible timeline strip.
 *
 * Renders a horizontal scrolling timeline of typed entries.
 * Collapsed by default, showing only a count badge.
 * All styling uses HBC_* tokens. No domain logic.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { makeStyles } from '@griffel/react';

import { HBC_SPACE_SM, HBC_SPACE_XS } from '../theme/grid.js';
import { HBC_SURFACE_LIGHT, HBC_STATUS_COLORS } from '../theme/tokens.js';
import { Text } from '@fluentui/react-components';
import type { HbcActivityStripProps, ActivityStripEntry } from '../layouts/multi-column-types.js';

// ── Default type display ────────────────────────────────────────────

const DEFAULT_TYPE_COLORS: Readonly<Record<string, string>> = {
  decision: HBC_STATUS_COLORS.info,
  milestone: HBC_STATUS_COLORS.success,
  escalation: HBC_STATUS_COLORS.error,
  publication: HBC_STATUS_COLORS.inProgress,
  blocker: HBC_STATUS_COLORS.critical,
  handoff: HBC_STATUS_COLORS.warning,
  'state-change': HBC_STATUS_COLORS.neutral,
};

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  summaryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
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
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
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
  chevron: {
    fontSize: '12px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

// ── Component ───────────────────────────────────────────────────────

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
          <Text size={200} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>
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
                <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>
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

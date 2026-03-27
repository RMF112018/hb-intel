import type { ReactNode } from 'react';
import { useState } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_SPACE_SM,
  HBC_SPACE_XS,
  Text,
} from '@hbc/ui-kit';

import type { ProjectHubActivitySummary } from '../types.js';

// ── Event type display ──────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, string> = {
  decision: 'Decision',
  milestone: 'Milestone',
  escalation: 'Escalation',
  publication: 'Publication',
  blocker: 'Blocker',
  handoff: 'Handoff',
  'state-change': 'Update',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  decision: '#0078D4',
  milestone: '#107C10',
  escalation: '#D83B01',
  publication: '#8764B8',
  blocker: '#A4262C',
  handoff: '#CA5010',
  'state-change': '#8A8886',
};

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    borderTop: '1px solid #edebe9',
    backgroundColor: '#faf9f8',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f3f2f1',
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
    backgroundColor: '#ffffff',
    border: '1px solid #edebe9',
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
    color: '#605e5c',
  },
});

// ── Component ───────────────────────────────────────────────────────

export interface ActivityStripProps {
  readonly activity: ProjectHubActivitySummary;
  readonly defaultCollapsed?: boolean;
}

export function ActivityStrip({
  activity,
  defaultCollapsed = true,
}: ActivityStripProps): ReactNode {
  const styles = useStyles();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const recentCount = activity.entries.length;

  return (
    <div data-testid="activity-strip" data-collapsed={collapsed} className={styles.root}>
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
          <Text size={200} style={{ color: '#605e5c' }}>{recentCount} recent events</Text>
        </div>
        <span className={styles.chevron}>{collapsed ? '\u25B6' : '\u25BC'}</span>
      </div>
      {!collapsed && (
        <div className={styles.timeline} data-testid="activity-strip-timeline">
          {activity.entries.map((entry) => (
            <div key={entry.id} className={styles.entry}>
              <span
                className={styles.typeDot}
                style={{ backgroundColor: EVENT_TYPE_COLORS[entry.type] ?? '#8A8886' }}
              />
              <div className={styles.entryContent}>
                <Text size={200} weight="semibold">
                  {EVENT_TYPE_LABELS[entry.type] ?? entry.type}
                </Text>
                <br />
                <Text size={200}>{entry.title}</Text>
                <br />
                <Text size={100} style={{ color: '#605e5c' }}>
                  {entry.actor ?? entry.sourceModule} · {new Date(entry.timestamp).toLocaleDateString()}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

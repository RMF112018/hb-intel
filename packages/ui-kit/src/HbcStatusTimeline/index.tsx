/**
 * HbcStatusTimeline — Standard-gated status timeline
 * D-SF03-T07 / D-08: internal default gate + complexityMinTier/maxTier override props
 *
 * Vertical timeline with colored status dots and connector lines.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useComplexityGate } from '@hbc/complexity';
import { HBC_STATUS_COLORS, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_RADIUS_FULL } from '../theme/radii.js';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcStatusTimelineProps } from './types.js';

const STATUS_COLOR_MAP: Record<string, string> = {
  approved: HBC_STATUS_COLORS.success,
  completed: HBC_STATUS_COLORS.completed,
  rejected: HBC_STATUS_COLORS.error,
  pending: HBC_STATUS_COLORS.pending,
  'in-progress': HBC_STATUS_COLORS.inProgress,
  draft: HBC_STATUS_COLORS.draft,
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  entry: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    position: 'relative',
  },
  entryLast: {
    paddingBottom: '0',
  },
  dotColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: '12px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: HBC_RADIUS_FULL,
    flexShrink: 0,
  },
  connector: {
    flex: '1 1 auto',
    width: '2px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
    marginTop: `${HBC_SPACE_XS}px`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    minWidth: 0,
  },
  status: {
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    fontWeight: 500,
  },
  meta: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

export function HbcStatusTimeline({
  statuses,
  showFuture = false,
  complexityMinTier = 'standard',
  complexityMaxTier,
}: HbcStatusTimelineProps): React.ReactElement | null {
  const styles = useStyles();
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div
      data-hbc-ui="HbcStatusTimeline"
      data-show-future={showFuture}
      className={styles.root}
      role="list"
      aria-label="Status timeline"
    >
      {statuses.map((entry, i) => {
        const isLast = i === statuses.length - 1;
        const dotColor = STATUS_COLOR_MAP[entry.status] ?? HBC_STATUS_COLORS.neutral;

        return (
          <div
            key={i}
            className={mergeClasses(styles.entry, isLast ? styles.entryLast : undefined)}
            data-status={entry.status}
            role="listitem"
          >
            <div className={styles.dotColumn}>
              <div className={styles.dot} style={{ backgroundColor: dotColor }} />
              {!isLast && <div className={styles.connector} />}
            </div>
            <div className={styles.content}>
              <span className={styles.status}>{entry.status}</span>
              <span className={styles.meta}>
                {entry.timestamp}
                {entry.actor ? ` — ${entry.actor}` : null}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { HbcStatusTimelineProps, IStatusEntry } from './types.js';

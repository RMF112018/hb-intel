import React from 'react';
import { makeStyles } from '@griffel/react';
import {
  HBC_RADIUS_MD,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
} from '@hbc/ui-kit/theme';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import {
  useProjectActivity,
  registerActivityAdapters,
} from '../activity/index.js';

registerActivityAdapters();

const useStyles = makeStyles({
  container: {
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_MD,
    padding: `${HBC_SPACE_MD}px`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_SM}px`,
    gap: `${HBC_SPACE_SM}px`,
  },
  metaText: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    textTransform: 'capitalize',
  },
  event: {
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  eventRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  eventContent: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_MD,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  badgeCritical: {
    backgroundColor: `${HBC_STATUS_COLORS.error}18`,
    color: HBC_STATUS_COLORS.error,
  },
  badgeNotable: {
    backgroundColor: `${HBC_STATUS_COLORS.warning}18`,
    color: HBC_STATUS_COLORS.warning,
  },
  badgeRoutine: {
    backgroundColor: `${HBC_STATUS_COLORS.neutral}18`,
    color: HBC_STATUS_COLORS.neutral,
  },
  mutedState: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontStyle: 'italic',
  },
  errorState: {
    color: HBC_STATUS_COLORS.error,
  },
  time: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
  },
  module: {
    display: 'block',
    marginTop: `${HBC_SPACE_XS}px`,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  scrollRegion: {
    flex: 1,
    overflow: 'auto',
  },
  footerSummary: {
    marginTop: `${HBC_SPACE_XS}px`,
    color: HBC_SURFACE_LIGHT['text-muted'],
    textAlign: 'center',
  },
  refreshButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: HBC_STATUS_COLORS.info,
    cursor: 'pointer',
    padding: 0,
    fontWeight: 600,
  },
});

function getBadgeClass(
  styles: ReturnType<typeof useStyles>,
  significance: string,
): string {
  if (significance === 'critical') return `${styles.badge} ${styles.badgeCritical}`;
  if (significance === 'notable') return `${styles.badge} ${styles.badgeNotable}`;
  return `${styles.badge} ${styles.badgeRoutine}`;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  } catch {
    return '';
  }
}

export function ProjectActivityTileEssential(props: ICanvasTileProps): React.ReactElement {
  const styles = useStyles();
  const { feed, isLoading, error } = useProjectActivity({
    projectId: props.projectId,
    significance: ['critical', 'notable'],
    limit: 1,
  });

  const latest = feed?.events[0];

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" className={styles.container}>
      <div className={styles.header}>
        <strong>Activity</strong>
        {feed && <span className={styles.metaText}>{feed.totalCount} events</span>}
      </div>
      {isLoading ? (
        <div className={styles.metaText}>Loading activity...</div>
      ) : error ? (
        <div className={styles.errorState}>Activity unavailable</div>
      ) : latest ? (
        <div className={styles.event}>
          <span className={getBadgeClass(styles, latest.significance)}>{latest.significance}</span>
          <div>{latest.summary}</div>
          <span className={styles.module}>{latest.sourceModule}</span>
        </div>
      ) : (
        <div className={styles.mutedState}>No notable activity</div>
      )}
    </div>
  );
}
ProjectActivityTileEssential.displayName = 'ProjectActivityTile[essential]';

export function ProjectActivityTileStandard(props: ICanvasTileProps): React.ReactElement {
  const styles = useStyles();
  const { feed, isLoading, error } = useProjectActivity({
    projectId: props.projectId,
    limit: 3,
  });

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" className={styles.container}>
      <div className={styles.header}>
        <strong>Activity</strong>
        {props.dataSource && <span className={styles.metaText}>{props.dataSource}</span>}
      </div>
      {isLoading ? (
        <div className={styles.metaText}>Loading events...</div>
      ) : error ? (
        <div className={styles.errorState}>Activity unavailable</div>
      ) : feed && feed.events.length > 0 ? (
        <>
          {feed.events.map((event) => (
            <div key={event.eventId} className={styles.event}>
              <div className={styles.eventRow}>
                <span className={getBadgeClass(styles, event.significance)}>{event.significance}</span>
                <span className={styles.eventContent}>{event.summary}</span>
                <span className={styles.time}>{formatTime(event.occurredAt)}</span>
              </div>
            </div>
          ))}
          {feed.hasMore && (
            <div className={styles.metaText}>+{feed.totalCount - feed.events.length} more</div>
          )}
        </>
      ) : (
        <div className={styles.mutedState}>No activity recorded</div>
      )}
    </div>
  );
}
ProjectActivityTileStandard.displayName = 'ProjectActivityTile[standard]';

export function ProjectActivityTileExpert(props: ICanvasTileProps): React.ReactElement {
  const styles = useStyles();
  const { feed, isLoading, error, refresh } = useProjectActivity({
    projectId: props.projectId,
    limit: 8,
  });

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" className={styles.container}>
      <div className={styles.header}>
        <strong>Activity</strong>
        <div className={styles.eventRow}>
          {feed && (
            <span className={styles.metaText}>
              {feed.criticalCount > 0 && `${feed.criticalCount} critical · `}
              {feed.notableCount > 0 && `${feed.notableCount} notable · `}
              {feed.totalCount} total
            </span>
          )}
          <button type="button" onClick={refresh} className={styles.refreshButton}>
            Refresh
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className={styles.metaText}>Loading activity timeline...</div>
      ) : error ? (
        <div className={styles.errorState}>Activity unavailable — {error}</div>
      ) : feed && feed.events.length > 0 ? (
        <div className={styles.scrollRegion}>
          {feed.events.map((event) => (
            <div key={event.eventId} className={styles.event}>
              <div className={styles.eventRow}>
                <span className={getBadgeClass(styles, event.significance)}>{event.significance}</span>
                <span className={styles.eventContent}>{event.summary}</span>
                <span className={styles.time}>{formatTime(event.occurredAt)}</span>
              </div>
              <span className={styles.module}>
                {event.sourceModule} · {event.changedByName}
              </span>
            </div>
          ))}
          {feed.hasMore && (
            <div className={styles.footerSummary}>
              Showing {feed.events.length} of {feed.totalCount}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.mutedState}>No activity recorded for this project</div>
      )}
    </div>
  );
}
ProjectActivityTileExpert.displayName = 'ProjectActivityTile[expert]';

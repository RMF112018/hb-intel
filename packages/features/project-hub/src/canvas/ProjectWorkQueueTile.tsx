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
import { useWorkQueueSummary } from '../layout-family/index.js';

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
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  countUrgent: {
    color: HBC_STATUS_COLORS.error,
    fontWeight: 700,
  },
  countStandard: {
    color: HBC_STATUS_COLORS.info,
    fontWeight: 700,
  },
  metaText: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  item: {
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  itemContent: {
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
  badgeUrgent: {
    backgroundColor: `${HBC_STATUS_COLORS.error}18`,
    color: HBC_STATUS_COLORS.error,
  },
  badgeStandard: {
    backgroundColor: `${HBC_STATUS_COLORS.warning}18`,
    color: HBC_STATUS_COLORS.warning,
  },
  badgeRoutine: {
    backgroundColor: `${HBC_STATUS_COLORS.neutral}18`,
    color: HBC_STATUS_COLORS.neutral,
  },
  module: {
    display: 'block',
    marginTop: `${HBC_SPACE_XS}px`,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  mutedState: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontStyle: 'italic',
  },
  locked: {
    marginTop: `${HBC_SPACE_SM}px`,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  scrollRegion: {
    flex: 1,
    overflow: 'auto',
  },
  overdue: {
    color: HBC_STATUS_COLORS.error,
    whiteSpace: 'nowrap',
  },
});

function getUrgencyClass(
  styles: ReturnType<typeof useStyles>,
  urgency: string,
): string {
  if (urgency === 'urgent') return `${styles.badge} ${styles.badgeUrgent}`;
  if (urgency === 'standard') return `${styles.badge} ${styles.badgeStandard}`;
  return `${styles.badge} ${styles.badgeRoutine}`;
}

export function ProjectWorkQueueTileEssential(props: ICanvasTileProps): React.ReactElement {
  const styles = useStyles();
  const summary = useWorkQueueSummary(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" className={styles.container}>
      <div className={styles.header}>
        <strong>Work Queue</strong>
        <span className={summary.urgentItems > 0 ? styles.countUrgent : styles.countStandard}>
          {summary.totalItems}
        </span>
      </div>
      {summary.totalItems === 0 ? (
        <div className={styles.mutedState}>No work items</div>
      ) : (
        <div className={styles.item}>
          <span className={getUrgencyClass(styles, summary.items[0]?.urgency ?? 'standard')}>
            {summary.items[0]?.urgency}
          </span>
          <div>{summary.items[0]?.title}</div>
        </div>
      )}
      {props.isLocked && <div data-testid="locked-indicator" className={styles.locked}>Mandatory</div>}
    </div>
  );
}
ProjectWorkQueueTileEssential.displayName = 'ProjectWorkQueueTile[essential]';

export function ProjectWorkQueueTileStandard(props: ICanvasTileProps): React.ReactElement {
  const styles = useStyles();
  const summary = useWorkQueueSummary(props.projectId);
  const preview = summary.items.slice(0, 3);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" className={styles.container}>
      <div className={styles.header}>
        <strong>Work Queue</strong>
        <span className={styles.metaText}>
          {summary.urgentItems > 0 && `${summary.urgentItems} urgent`}
          {summary.urgentItems > 0 && summary.overdueItems > 0 && ' · '}
          {summary.overdueItems > 0 && `${summary.overdueItems} overdue`}
        </span>
      </div>
      {preview.length === 0 ? (
        <div className={styles.mutedState}>No work items</div>
      ) : (
        <>
          {preview.map((item) => (
            <div key={item.id} className={styles.item}>
              <span className={getUrgencyClass(styles, item.urgency)}>{item.urgency}</span>
              <div>{item.title}</div>
              <span className={styles.module}>{item.sourceModule} · {item.owner}</span>
            </div>
          ))}
          {summary.totalItems > 3 && (
            <div className={styles.metaText}>+{summary.totalItems - 3} more</div>
          )}
        </>
      )}
      {props.isLocked && <div data-testid="locked-indicator" className={styles.locked}>Mandatory</div>}
    </div>
  );
}
ProjectWorkQueueTileStandard.displayName = 'ProjectWorkQueueTile[standard]';

export function ProjectWorkQueueTileExpert(props: ICanvasTileProps): React.ReactElement {
  const styles = useStyles();
  const summary = useWorkQueueSummary(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" className={styles.container}>
      <div className={styles.header}>
        <strong>Work Queue</strong>
        <span className={styles.metaText}>
          {summary.totalItems} items
          {summary.urgentItems > 0 && ` · ${summary.urgentItems} urgent`}
          {summary.overdueItems > 0 && ` · ${summary.overdueItems} overdue`}
        </span>
      </div>
      {summary.items.length === 0 ? (
        <div className={styles.mutedState}>No work items for this project</div>
      ) : (
        <div className={styles.scrollRegion}>
          {summary.items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemRow}>
                <span className={getUrgencyClass(styles, item.urgency)}>{item.urgency}</span>
                <span className={styles.itemContent}>{item.title}</span>
                {item.aging != null && item.aging > 3 && (
                  <span className={styles.overdue}>{item.aging}d aging</span>
                )}
              </div>
              <span className={styles.module}>
                {item.sourceModule} · {item.owner}
                {item.dueDate ? ` · Due ${item.dueDate}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      {props.isLocked && <div data-testid="locked-indicator" className={styles.locked}>Mandatory</div>}
    </div>
  );
}
ProjectWorkQueueTileExpert.displayName = 'ProjectWorkQueueTile[expert]';

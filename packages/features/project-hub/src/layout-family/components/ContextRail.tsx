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

import type {
  ProjectHubNextMoveSummary,
  ProjectHubRelatedItemsSummary,
  ProjectHubWorkQueueSummary,
} from '../types.js';

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    overflowY: 'auto',
    overflowX: 'hidden',
    borderLeft: '1px solid #edebe9',
    backgroundColor: '#faf9f8',
    padding: `${HBC_SPACE_SM}px`,
  },
  rootComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
    padding: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px`,
  },
  rootTouch: {
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_XS}px 0`,
    borderBottom: '1px solid #f3f2f1',
  },
  itemRowComfortable: {
    minHeight: `${HBC_DENSITY_TOKENS.comfortable.touchTargetMin}px`,
    padding: `${HBC_SPACE_XS}px 0`,
  },
  itemRowTouch: {
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    padding: `${HBC_SPACE_SM}px 0`,
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '5px',
  },
  urgencyBadge: {
    display: 'inline-flex',
    fontSize: '10px',
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  urgencyUrgent: {
    backgroundColor: '#FDE7E9',
    color: '#A4262C',
  },
  urgencyStandard: {
    backgroundColor: '#EDEBE9',
    color: '#323130',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: '#edebe9',
    fontSize: '11px',
    fontWeight: 600,
    padding: '0 4px',
  },
});

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#A4262C',
  high: '#D83B01',
  standard: '#0078D4',
};

// ── Component ───────────────────────────────────────────────────────

export interface ContextRailProps {
  readonly nextMoves: ProjectHubNextMoveSummary;
  readonly workQueue: ProjectHubWorkQueueSummary;
  readonly relatedItems?: ProjectHubRelatedItemsSummary;
  readonly selectedModuleSlug: string | null;
}

export function ContextRail({
  nextMoves,
  workQueue,
  relatedItems,
  selectedModuleSlug,
}: ContextRailProps): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();

  const filteredMoves = selectedModuleSlug
    ? nextMoves.items.filter((i) => i.sourceModule === selectedModuleSlug)
    : nextMoves.items;

  const filteredQueue = selectedModuleSlug
    ? workQueue.items.filter((i) => i.sourceModule === selectedModuleSlug)
    : workQueue.items;

  const blockers = filteredQueue.filter((i) => i.urgency === 'urgent');

  const filteredRelated = selectedModuleSlug && relatedItems
    ? relatedItems.items.filter((i) => i.sourceModule === selectedModuleSlug)
    : relatedItems?.items ?? [];

  return (
    <aside
      data-testid="context-rail"
      data-selected-module={selectedModuleSlug ?? 'all'}
      className={mergeClasses(
        styles.root,
        densityTier === 'comfortable' && styles.rootComfortable,
        densityTier === 'touch' && styles.rootTouch,
      )}
    >
      {/* Next Moves */}
      <Card size="small">
        <CardHeader
          header={
            <div className={styles.sectionTitle}>
              <Text weight="semibold" size={200}>My Next Moves</Text>
              <span className={styles.countBadge}>{filteredMoves.length}</span>
            </div>
          }
        />
        <div className={styles.itemList} data-testid="context-rail-next-moves">
          {filteredMoves.map((item) => (
            <div
              key={item.id}
              className={mergeClasses(
                styles.itemRow,
                densityTier === 'comfortable' && styles.itemRowComfortable,
                densityTier === 'touch' && styles.itemRowTouch,
              )}
            >
              <span
                className={styles.priorityDot}
                style={{ backgroundColor: PRIORITY_COLORS[item.priority] ?? '#8A8886' }}
              />
              <div className={styles.itemContent}>
                <Text size={200}>{item.title}</Text>
                <br />
                <Text size={100} style={{ color: '#605e5c' }}>{item.action} · {item.owner}</Text>
              </div>
            </div>
          ))}
          {filteredMoves.length === 0 && (
            <Text size={200} style={{ color: '#8A8886', padding: `${HBC_SPACE_XS}px 0` }}>No next moves</Text>
          )}
        </div>
      </Card>

      {/* Blockers */}
      {blockers.length > 0 && (
        <Card size="small">
          <CardHeader
            header={
              <div className={styles.sectionTitle}>
                <Text weight="semibold" size={200}>Blockers</Text>
                <span className={styles.countBadge}>{blockers.length}</span>
              </div>
            }
          />
          <div className={styles.itemList} data-testid="context-rail-blockers">
            {blockers.map((item) => (
              <div
                key={item.id}
                className={mergeClasses(
                  styles.itemRow,
                  densityTier === 'comfortable' && styles.itemRowComfortable,
                  densityTier === 'touch' && styles.itemRowTouch,
                )}
              >
                <span className={mergeClasses(styles.urgencyBadge, styles.urgencyUrgent)}>URGENT</span>
                <div className={styles.itemContent}>
                  <Text size={200}>{item.title}</Text>
                  <br />
                  <Text size={100} style={{ color: '#605e5c' }}>{item.owner}{item.aging != null ? ` · ${item.aging}d overdue` : ''}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Team Queue */}
      <Card size="small">
        <CardHeader
          header={
            <div className={styles.sectionTitle}>
              <Text weight="semibold" size={200}>Team Queue</Text>
              <span className={styles.countBadge}>{filteredQueue.length}</span>
            </div>
          }
        />
        <div className={styles.itemList} data-testid="context-rail-work-queue">
          {filteredQueue.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className={mergeClasses(
                styles.itemRow,
                densityTier === 'comfortable' && styles.itemRowComfortable,
                densityTier === 'touch' && styles.itemRowTouch,
              )}
            >
              <span
                className={mergeClasses(
                  styles.urgencyBadge,
                  item.urgency === 'urgent' ? styles.urgencyUrgent : styles.urgencyStandard,
                )}
              >
                {item.urgency === 'urgent' ? 'URGENT' : item.urgency.toUpperCase()}
              </span>
              <div className={styles.itemContent}>
                <Text size={200}>{item.title}</Text>
                <br />
                <Text size={100} style={{ color: '#605e5c' }}>{item.owner} · {item.sourceModule}</Text>
              </div>
            </div>
          ))}
          {filteredQueue.length === 0 && (
            <Text size={200} style={{ color: '#8A8886', padding: `${HBC_SPACE_XS}px 0` }}>No items in queue</Text>
          )}
        </div>
      </Card>

      {/* Related Records */}
      {filteredRelated.length > 0 && (
        <Card size="small">
          <CardHeader
            header={
              <div className={styles.sectionTitle}>
                <Text weight="semibold" size={200}>Related Records</Text>
                <span className={styles.countBadge}>{filteredRelated.length}</span>
              </div>
            }
          />
          <div className={styles.itemList} data-testid="context-rail-related">
            {filteredRelated.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.itemContent}>
                  <Text size={200}>{item.title}</Text>
                  <br />
                  <Text size={100} style={{ color: '#605e5c' }}>{item.relationship} · {item.status}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </aside>
  );
}

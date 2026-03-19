/**
 * HbcRelatedItemsTile — D-SF14-T07, D-01, D-07
 *
 * Compact canvas tile variant showing top-3 priority items
 * with "View all" overlay trigger. Complexity-aware: hidden for essential tier.
 *
 * Depends on:
 * - SF14-T04 useRelatedItems hook
 * - @hbc/complexity for tier-aware rendering
 * - @hbc/auth for current user role fallback
 */
import type { FC, ReactElement } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { useCurrentUser } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import {
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_RADIUS_LG,
  HBC_RADIUS_FULL,
} from '@hbc/ui-kit/theme';
import { MAX_TILE_ITEMS } from '../constants/index.js';
import { useRelatedItems } from '../hooks/index.js';

export interface HbcRelatedItemsTileProps {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  currentUserRole?: string;
  onViewAll?: () => void;
}

const useStyles = makeStyles({
  moduleIcon: {
    display: 'inline-flex',
    width: '20px',
    height: '20px',
    borderRadius: HBC_RADIUS_FULL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    color: HBC_PRIMARY_BLUE,
    fontSize: '9px',
    fontWeight: 700,
  },
  cardList: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
  },
  card: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_LG,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    fontSize: '12px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
  },
  badge: {
    fontSize: '10px',
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_FULL,
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: '6px',
    paddingRight: '6px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  viewAllButton: {
    marginTop: '6px',
    fontSize: '12px',
    backgroundColor: 'transparent',
    ...shorthands.borderWidth('0'),
    color: HBC_PRIMARY_BLUE,
    cursor: 'pointer',
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
  },
});

function RenderModuleIcon({ moduleIcon }: { moduleIcon: string }): ReactElement {
  const styles = useStyles();
  const iconToken = (moduleIcon || '?').trim().slice(0, 2).toUpperCase();
  return (
    <span aria-label={`Module ${moduleIcon}`} className={styles.moduleIcon}>
      {iconToken}
    </span>
  );
}

/** Compact canvas tile for related items (top-3 priority view). */
export const HbcRelatedItemsTile: FC<HbcRelatedItemsTileProps> = ({
  sourceRecordType,
  sourceRecordId,
  sourceRecord,
  currentUserRole,
  onViewAll,
}) => {
  const styles = useStyles();
  const user = useCurrentUser();
  const { tier } = useComplexity();
  const resolvedRole = currentUserRole ?? (user?.type === 'internal' ? user.roles[0]?.name : undefined) ?? 'Unknown';

  const { items, isLoading, error } = useRelatedItems({
    sourceRecordType,
    sourceRecordId,
    sourceRecord,
    currentUserRole: resolvedRole,
  });

  if (tier === 'essential') {
    return null;
  }

  if (isLoading) {
    return (
      <div data-testid="related-items-tile-loading" role="status">
        Loading related items...
      </div>
    );
  }

  if (items.length === 0 && !error) {
    return null;
  }

  const visibleItems = items.slice(0, MAX_TILE_ITEMS);
  const hasMore = items.length > MAX_TILE_ITEMS;
  const shouldRenderDegradedBanner = Boolean(error) && items.length > 0;

  return (
    <div data-testid="related-items-tile">
      {shouldRenderDegradedBanner ? (
        <div data-testid="related-items-tile-degraded" role="status">
          Some related items could not be loaded.
        </div>
      ) : null}

      <div className={styles.cardList}>
        {visibleItems.map((item) => (
          <div
            key={`${item.recordType}:${item.recordId}`}
            data-testid="related-items-tile-card"
            className={styles.card}
          >
            <RenderModuleIcon moduleIcon={item.moduleIcon} />
            <span data-testid="related-items-tile-card-label">{item.label}</span>
            <span
              data-testid="related-items-tile-card-badge"
              className={styles.badge}
            >
              {item.relationshipLabel}
            </span>
          </div>
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          data-testid="related-items-tile-view-all"
          onClick={onViewAll}
          className={styles.viewAllButton}
        >
          View all ({items.length})
        </button>
      ) : null}
    </div>
  );
};

HbcRelatedItemsTile.displayName = 'HbcRelatedItemsTile';

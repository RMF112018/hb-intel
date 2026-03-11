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
import { useCurrentUser } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { MAX_TILE_ITEMS } from '../constants/index.js';
import { useRelatedItems } from '../hooks/index.js';

export interface HbcRelatedItemsTileProps {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  currentUserRole?: string;
  onViewAll?: () => void;
}

function renderModuleIcon(moduleIcon: string): ReactElement {
  const iconToken = (moduleIcon || '?').trim().slice(0, 2).toUpperCase();
  return (
    <span
      aria-label={`Module ${moduleIcon}`}
      style={{
        display: 'inline-flex',
        width: 20,
        height: 20,
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e6edf4',
        color: '#004b87',
        fontSize: 9,
        fontWeight: 700,
      }}
    >
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
  const user = useCurrentUser();
  const { tier } = useComplexity();
  const resolvedRole = currentUserRole ?? user?.roles[0]?.name ?? 'Unknown';

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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {visibleItems.map((item) => (
          <div
            key={`${item.recordType}:${item.recordId}`}
            data-testid="related-items-tile-card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid #d0d7de',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              background: '#fff',
            }}
          >
            {renderModuleIcon(item.moduleIcon)}
            <span data-testid="related-items-tile-card-label">{item.label}</span>
            <span
              data-testid="related-items-tile-card-badge"
              style={{
                fontSize: 10,
                border: '1px solid #d0d7de',
                borderRadius: 999,
                padding: '1px 6px',
                color: '#57606a',
              }}
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
          style={{
            marginTop: 6,
            fontSize: 12,
            background: 'none',
            border: 'none',
            color: '#0969da',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          View all ({items.length})
        </button>
      ) : null}
    </div>
  );
};

HbcRelatedItemsTile.displayName = 'HbcRelatedItemsTile';

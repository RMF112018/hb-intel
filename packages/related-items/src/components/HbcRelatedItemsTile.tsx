/**
 * HbcRelatedItemsTile — D-SF14-T01, D-01, D-07
 *
 * Compact canvas tile variant showing top priority items
 * with "View all" overlay for the full relationship panel.
 *
 * TODO: SF14-T06 — Implement compact tile with horizontal scroll,
 * top-3 priority items, and canvas overlay.
 */
import type { FC } from 'react';

export interface HbcRelatedItemsTileProps {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
}

/** Compact canvas tile for related items (top-3 priority view). */
export const HbcRelatedItemsTile: FC<HbcRelatedItemsTileProps> = () => {
  // TODO: SF14-T06
  return null;
};

HbcRelatedItemsTile.displayName = 'HbcRelatedItemsTile';

/**
 * HbcRelatedItemCard — D-SF14-T01, D-01, D-07
 *
 * Individual related item row with module icon, status badge,
 * BIC state, version-history chip, and relationship direction chip.
 *
 * TODO: SF14-T06 — Implement card with version popover and AI suggest button.
 */
import type { FC } from 'react';
import type { IRelatedItem } from '../types/index.js';

export interface HbcRelatedItemCardProps {
  item: IRelatedItem;
  showBicState?: boolean;
}

/** Clickable card representing a single related item. */
export const HbcRelatedItemCard: FC<HbcRelatedItemCardProps> = () => {
  // TODO: SF14-T06
  return null;
};

HbcRelatedItemCard.displayName = 'HbcRelatedItemCard';

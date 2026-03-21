/**
 * RecentContextTile — canvas tile adapter for RecentContextCard.
 *
 * Essential variant returns null (zone hidden at essential tier).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { RecentContextCard } from '../cards/RecentContextCard.js';

function RecentContextTileStandard(_props: ICanvasTileProps): ReactNode {
  return <RecentContextCard />;
}

function RecentContextTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

export { RecentContextTileEssential, RecentContextTileStandard };
export { RecentContextTileStandard as RecentContextTileExpert };

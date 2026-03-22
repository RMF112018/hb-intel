/**
 * RecentActivityTile — canvas tile adapter for RecentActivityCard.
 *
 * UIF-047-addl: Updated import from RecentContextCard → RecentActivityCard.
 * Essential variant returns null (zone hidden at essential tier).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { RecentActivityCard } from '../cards/RecentActivityCard.js';

function RecentContextTileStandard(_props: ICanvasTileProps): ReactNode {
  return <RecentActivityCard />;
}

function RecentContextTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

export { RecentContextTileEssential, RecentContextTileStandard };
export { RecentContextTileStandard as RecentContextTileExpert };

/**
 * RecentActivityTile — canvas tile adapter for RecentActivityCard.
 *
 * P2-D2 §6.1: `hub:recent-context` — tertiary zone tile.
 * Three genuine complexity variants per CRD-05.
 * Essential: returns null (zone hidden at essential tier).
 * Standard/Expert: renders RecentActivityCard (stub content — real data Phase 3+).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { RecentActivityCard } from '../cards/RecentActivityCard.js';

function RecentActivityTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

function RecentActivityTileStandard(_props: ICanvasTileProps): ReactNode {
  return <RecentActivityCard />;
}

function RecentActivityTileExpert(_props: ICanvasTileProps): ReactNode {
  return <RecentActivityCard />;
}

export { RecentActivityTileEssential, RecentActivityTileStandard, RecentActivityTileExpert };

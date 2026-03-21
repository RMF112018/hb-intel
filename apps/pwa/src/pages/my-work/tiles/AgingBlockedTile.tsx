/**
 * AgingBlockedTile — canvas tile adapter for AgingBlockedCard.
 *
 * Card retains its internal RoleGate (Executive-only).
 * Essential variant returns null (zone hidden at essential tier).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { AgingBlockedCard } from '../cards/AgingBlockedCard.js';

function AgingBlockedTileStandard(_props: ICanvasTileProps): ReactNode {
  return <AgingBlockedCard />;
}

function AgingBlockedTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

export { AgingBlockedTileEssential, AgingBlockedTileStandard };
export { AgingBlockedTileStandard as AgingBlockedTileExpert };

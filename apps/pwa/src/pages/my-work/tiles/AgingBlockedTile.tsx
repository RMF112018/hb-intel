/**
 * AgingBlockedTile — canvas tile adapter for AgingBlockedCard.
 *
 * Card retains its internal RoleGate (Executive-only).
 * Essential variant returns null (zone hidden at essential tier).
 * UIF-013-addl: Passes filter context for click-to-filter interactivity.
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { AgingBlockedCard } from '../cards/AgingBlockedCard.js';
import { useMyWorkHubTileContext } from './MyWorkHubTileContext.js';

function AgingBlockedTileStandard(_props: ICanvasTileProps): ReactNode {
  const { activeFilter, onFilterChange } = useMyWorkHubTileContext();
  return <AgingBlockedCard activeFilter={activeFilter} onFilterChange={onFilterChange} />;
}

function AgingBlockedTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

export { AgingBlockedTileEssential, AgingBlockedTileStandard };
export { AgingBlockedTileStandard as AgingBlockedTileExpert };

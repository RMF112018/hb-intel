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

// CRD-05: Genuine expert variant (distinct function, not alias).
function AgingBlockedTileExpert(_props: ICanvasTileProps): ReactNode {
  const { activeFilter, onFilterChange } = useMyWorkHubTileContext();
  return <div data-complexity="expert"><AgingBlockedCard activeFilter={activeFilter} onFilterChange={onFilterChange} /></div>;
}

export { AgingBlockedTileEssential, AgingBlockedTileStandard, AgingBlockedTileExpert };

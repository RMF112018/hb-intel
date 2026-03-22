/**
 * LaneSummaryTile — canvas tile adapter for LaneSummaryCard.
 *
 * P2-D3 §8: pilot-REQUIRED, locked. Three genuine complexity variants (CRD-05).
 * Reads UIF-008 filter state from MyWorkHubTileContext.
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { LaneSummaryCard } from '../cards/LaneSummaryCard.js';
import { useMyWorkHubTileContext } from './MyWorkHubTileContext.js';

function LaneSummaryTileEssential(_props: ICanvasTileProps): ReactNode {
  const { activeFilter, onFilterChange } = useMyWorkHubTileContext();
  return <LaneSummaryCard variant="essential" activeFilter={activeFilter} onFilterChange={onFilterChange} />;
}

function LaneSummaryTileStandard(_props: ICanvasTileProps): ReactNode {
  const { activeFilter, onFilterChange } = useMyWorkHubTileContext();
  return <LaneSummaryCard variant="standard" activeFilter={activeFilter} onFilterChange={onFilterChange} />;
}

function LaneSummaryTileExpert(_props: ICanvasTileProps): ReactNode {
  const { activeFilter, onFilterChange } = useMyWorkHubTileContext();
  return <LaneSummaryCard variant="expert" activeFilter={activeFilter} onFilterChange={onFilterChange} />;
}

export { LaneSummaryTileEssential, LaneSummaryTileStandard, LaneSummaryTileExpert };

/**
 * PersonalAnalyticsTile — canvas tile adapter for PersonalAnalyticsCard.
 *
 * Reads UIF-008 filter state from MyWorkHubTileContext and passes to the card.
 * Essential variant returns null (zone hidden at essential tier).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { PersonalAnalyticsCard } from '../cards/PersonalAnalyticsCard.js';
import { useMyWorkHubTileContext } from './MyWorkHubTileContext.js';

function PersonalAnalyticsTileStandard(_props: ICanvasTileProps): ReactNode {
  const { activeFilter, onFilterChange } = useMyWorkHubTileContext();
  return <PersonalAnalyticsCard activeFilter={activeFilter} onFilterChange={onFilterChange} />;
}

function PersonalAnalyticsTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

// CRD-05: Genuine expert variant (distinct function, not alias).
function PersonalAnalyticsTileExpert(_props: ICanvasTileProps): ReactNode {
  const { activeFilter, onFilterChange } = useMyWorkHubTileContext();
  return <div data-complexity="expert"><PersonalAnalyticsCard activeFilter={activeFilter} onFilterChange={onFilterChange} /></div>;
}

export { PersonalAnalyticsTileEssential, PersonalAnalyticsTileStandard, PersonalAnalyticsTileExpert };

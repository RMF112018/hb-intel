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

export { PersonalAnalyticsTileEssential, PersonalAnalyticsTileStandard };
export { PersonalAnalyticsTileStandard as PersonalAnalyticsTileExpert };

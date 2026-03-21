/**
 * TeamPortfolioTile — canvas tile adapter for TeamPortfolioCard.
 *
 * Reads teamMode from MyWorkHubTileContext and passes to the card.
 * Card retains its internal RoleGate (Executive-only).
 * Essential variant returns null (zone hidden at essential tier).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { TeamPortfolioCard } from '../cards/TeamPortfolioCard.js';
import { useMyWorkHubTileContext } from './MyWorkHubTileContext.js';

function TeamPortfolioTileStandard(_props: ICanvasTileProps): ReactNode {
  const { teamMode } = useMyWorkHubTileContext();
  return <TeamPortfolioCard teamMode={teamMode} />;
}

function TeamPortfolioTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

export { TeamPortfolioTileEssential, TeamPortfolioTileStandard };
export { TeamPortfolioTileStandard as TeamPortfolioTileExpert };

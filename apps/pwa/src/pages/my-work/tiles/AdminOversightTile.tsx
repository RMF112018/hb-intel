/**
 * AdminOversightTile — canvas tile adapter for AdminOversightCard.
 *
 * Card retains its internal RoleGate (Administrator-only).
 * Essential variant returns null (zone hidden at essential tier).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { AdminOversightCard } from '../cards/AdminOversightCard.js';

function AdminOversightTileStandard(_props: ICanvasTileProps): ReactNode {
  return <AdminOversightCard />;
}

function AdminOversightTileEssential(_props: ICanvasTileProps): ReactNode {
  return null;
}

export { AdminOversightTileEssential, AdminOversightTileStandard };
export { AdminOversightTileStandard as AdminOversightTileExpert };

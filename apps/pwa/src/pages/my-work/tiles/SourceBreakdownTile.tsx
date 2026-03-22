/**
 * SourceBreakdownTile — canvas tile adapter for SourceBreakdownCard.
 *
 * P2-D3 §8: pilot-REQUIRED. Three genuine complexity variants (CRD-05).
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { SourceBreakdownCard } from '../cards/SourceBreakdownCard.js';

function SourceBreakdownTileEssential(_props: ICanvasTileProps): ReactNode {
  return <SourceBreakdownCard variant="essential" />;
}

function SourceBreakdownTileStandard(_props: ICanvasTileProps): ReactNode {
  return <SourceBreakdownCard variant="standard" />;
}

function SourceBreakdownTileExpert(_props: ICanvasTileProps): ReactNode {
  return <SourceBreakdownCard variant="expert" />;
}

export { SourceBreakdownTileEssential, SourceBreakdownTileStandard, SourceBreakdownTileExpert };

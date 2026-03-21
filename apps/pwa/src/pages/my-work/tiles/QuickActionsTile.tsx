/**
 * QuickActionsTile — canvas tile adapter for QuickActionsCard.
 *
 * minComplexity is 'essential' so all 3 variants render the card.
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { QuickActionsCard } from '../cards/QuickActionsCard.js';

function QuickActionsTileStandard(_props: ICanvasTileProps): ReactNode {
  return <QuickActionsCard />;
}

export { QuickActionsTileStandard as QuickActionsTileEssential };
export { QuickActionsTileStandard };
export { QuickActionsTileStandard as QuickActionsTileExpert };

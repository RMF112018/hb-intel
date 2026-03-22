/**
 * QuickActionsTile — canvas tile adapter for QuickActionsMenu.
 *
 * UIF-047-addl: Updated import from QuickActionsCard → QuickActionsMenu.
 * minComplexity is 'essential' so all 3 variants render the menu.
 */
import type { ReactNode } from 'react';
import type { ICanvasTileProps } from '@hbc/project-canvas';
import { QuickActionsMenu } from '../cards/QuickActionsMenu.js';

function QuickActionsTileStandard(_props: ICanvasTileProps): ReactNode {
  return <QuickActionsMenu />;
}

export { QuickActionsTileStandard as QuickActionsTileEssential };
export { QuickActionsTileStandard };
export { QuickActionsTileStandard as QuickActionsTileExpert };

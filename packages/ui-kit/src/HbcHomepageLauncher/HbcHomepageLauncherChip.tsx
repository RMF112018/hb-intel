import * as React from 'react';
import { HbcHomepageLauncherTile } from './HbcHomepageLauncherTile.js';
import type { HbcHomepageLauncherChipProps } from './types.js';

/**
 * Backward-compatible export during chip -> tile migration.
 */
export function HbcHomepageLauncherChip({
  chip,
  className,
}: HbcHomepageLauncherChipProps): React.JSX.Element {
  return <HbcHomepageLauncherTile tile={chip} className={className} />;
}

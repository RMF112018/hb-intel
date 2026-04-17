/**
 * HbcPriorityRailPreviewSurface — Admin preview wrapper.
 *
 * Renders through the same visual primitives as the public surface
 * with an additional preview banner to distinguish admin preview
 * from live production rendering.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { Eye } from 'lucide-react';
import { HbcPriorityRailSurface } from './HbcPriorityRailSurface.js';
import type { HbcPriorityRailPreviewSurfaceProps } from './types.js';
import styles from './priority-rail.module.css';

export function HbcPriorityRailPreviewSurface({
  previewLabel = 'Admin Preview',
  className,
  ...surfaceProps
}: HbcPriorityRailPreviewSurfaceProps): React.JSX.Element {
  return (
    <div className={className}>
      <div className={styles.previewBanner}>
        <Eye size={12} aria-hidden="true" />
        <span>{previewLabel}</span>
      </div>
      <HbcPriorityRailSurface {...surfaceProps} />
    </div>
  );
}

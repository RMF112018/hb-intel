/**
 * MultiColumnLayout — generic responsive multi-column grid.
 *
 * Renders a CSS grid with configurable left/center/right columns and
 * an optional bottom region. Supports collapsible rails and responsive
 * breakpoint-driven column hiding.
 *
 * Uses only HBC_* tokens for spacing and breakpoints. No domain logic.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';

import {
  HBC_BREAKPOINT_DESKTOP,
  HBC_BREAKPOINT_SIDEBAR,
} from '../theme/breakpoints.js';
import type { MultiColumnLayoutProps } from './multi-column-types.js';

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'grid',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    gridTemplateRows: '1fr auto',
  },
  left: {
    gridArea: 'left',
    minHeight: 0,
    overflow: 'hidden',
  },
  center: {
    gridArea: 'center',
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  right: {
    gridArea: 'right',
    minHeight: 0,
    overflow: 'hidden',
  },
  bottom: {
    gridArea: 'bottom',
  },
});

// ── Viewport detection ──────────────────────────────────────────────

type ViewportTier = 'desktop' | 'tablet' | 'mobile';

function detectViewportTier(): ViewportTier {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width >= HBC_BREAKPOINT_DESKTOP) return 'desktop';
  if (width >= HBC_BREAKPOINT_SIDEBAR) return 'tablet';
  return 'mobile';
}

// ── Component ───────────────────────────────────────────────────────

export function MultiColumnLayout({
  config,
  leftSlot,
  centerSlot,
  rightSlot,
  bottomSlot,
  testId,
}: MultiColumnLayoutProps): ReactNode {
  const styles = useStyles();
  const viewportTier = detectViewportTier();

  const leftConfig = config.left;
  const rightConfig = config.right;

  // Collapse state
  const [leftCollapsed, setLeftCollapsed] = useState(
    leftConfig?.defaultCollapsed ?? viewportTier !== 'desktop',
  );

  // Determine which regions are visible
  const showLeft =
    leftSlot != null &&
    !(viewportTier === 'mobile' && leftConfig?.hideOnMobile !== false) &&
    !(viewportTier === 'tablet' && leftConfig?.hideOnTablet);

  const showRight =
    rightSlot != null &&
    !(viewportTier === 'mobile' && rightConfig?.hideOnMobile !== false) &&
    !(viewportTier === 'tablet' && rightConfig?.hideOnTablet !== false);

  const showBottom = bottomSlot != null;

  // Compute column widths
  const leftWidth = showLeft
    ? leftCollapsed && leftConfig?.collapsible
      ? `${leftConfig.collapsedWidth ?? 48}px`
      : `${leftConfig?.width ?? 260}px`
    : '0';

  const rightWidth = showRight
    ? `${rightConfig?.width ?? 300}px`
    : '0';

  // Build grid template
  const hasLeftAndRight = showLeft && showRight;
  const gridTemplateAreas = hasLeftAndRight
    ? `"left center right" "bottom bottom bottom"`
    : showLeft
      ? `"left center" "bottom bottom"`
      : showRight
        ? `"center right" "bottom bottom"`
        : `"center" "bottom"`;

  const gridTemplateColumns = hasLeftAndRight
    ? `${leftWidth} 1fr ${rightWidth}`
    : showLeft
      ? `${leftWidth} 1fr`
      : showRight
        ? `1fr ${rightWidth}`
        : '1fr';

  return (
    <div
      data-testid={testId ?? 'multi-column-layout'}
      data-viewport={viewportTier}
      className={styles.root}
      style={{
        gridTemplateAreas,
        gridTemplateColumns,
      }}
    >
      {showLeft && (
        <div className={styles.left} data-collapsed={leftCollapsed}>
          {leftSlot}
        </div>
      )}

      <div className={styles.center}>
        {centerSlot}
      </div>

      {showRight && (
        <div className={styles.right}>
          {rightSlot}
        </div>
      )}

      {showBottom && (
        <div className={styles.bottom}>
          {bottomSlot}
        </div>
      )}
    </div>
  );
}

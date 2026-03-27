import type { ReactNode } from 'react';
import { useState } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_BREAKPOINT_DESKTOP,
  HBC_BREAKPOINT_SIDEBAR,
} from '@hbc/ui-kit';

import { useWatchlistSummary } from '../hooks/useWatchlistSummary.js';
import { useRiskExposureSummary } from '../hooks/useRiskExposureSummary.js';
import { useInterventionQueue } from '../hooks/useInterventionQueue.js';
import { useActivitySummary } from '../hooks/useActivitySummary.js';
import { WatchlistPanel } from './WatchlistPanel.js';
import { RiskExposureCanvas } from './RiskExposureCanvas.js';
import { InterventionRail } from './InterventionRail.js';
import { ActivityStrip } from './ActivityStrip.js';

// ── Layout constants ────────────────────────────────────────────────

const WATCHLIST_WIDTH = 280;
const INTERVENTION_WIDTH = 320;

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'grid',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    gridTemplateAreas: '"left center right" "bottom bottom bottom"',
    gridTemplateRows: '1fr auto',
  },
  rootDesktop: {
    gridTemplateColumns: `${WATCHLIST_WIDTH}px 1fr ${INTERVENTION_WIDTH}px`,
  },
  rootTablet: {
    gridTemplateColumns: `1fr`,
    gridTemplateAreas: '"center" "bottom"',
  },
  rootMobile: {
    gridTemplateColumns: '1fr',
    gridTemplateAreas: '"center" "bottom"',
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

function useViewportTier(): ViewportTier {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width >= HBC_BREAKPOINT_DESKTOP) return 'desktop';
  if (width >= HBC_BREAKPOINT_SIDEBAR) return 'tablet';
  return 'mobile';
}

// ── Component ───────────────────────────────────────────────────────

export interface ExecutiveCockpitSurfaceProps {
  /** The currently focused project ID (null for portfolio-level view). */
  readonly projectId: string | null;
  /** Called when user opens a module from an intervention action. */
  readonly onOpenModule: (slug: string) => void;
}

/**
 * Executive Cockpit Surface — intervention-first leadership layout.
 *
 * Orchestrates: WatchlistPanel (left), RiskExposureCanvas (center),
 * InterventionRail (right), ActivityStrip (bottom).
 *
 * Composes inside WorkspacePageShell as children, same as
 * ProjectOperatingSurface. No new shell or route required.
 */
export function ExecutiveCockpitSurface({
  projectId,
  onOpenModule,
}: ExecutiveCockpitSurfaceProps): ReactNode {
  const styles = useStyles();
  const viewportTier = useViewportTier();

  // Data hooks
  const watchlist = useWatchlistSummary();
  const riskExposure = useRiskExposureSummary(projectId);
  const interventionQueue = useInterventionQueue();
  const activity = useActivitySummary();

  // Watchlist selection state
  const [selectedWatchItemId, setSelectedWatchItemId] = useState<string | null>(null);

  const gridClass =
    viewportTier === 'mobile'
      ? styles.rootMobile
      : viewportTier === 'tablet'
        ? styles.rootTablet
        : styles.rootDesktop;

  return (
    <div
      data-testid="executive-cockpit-surface"
      data-viewport={viewportTier}
      className={mergeClasses(styles.root, gridClass)}
    >
      {/* Left: Watchlist Panel (desktop only) */}
      {viewportTier === 'desktop' && (
        <div className={styles.left}>
          <WatchlistPanel
            watchlist={watchlist}
            selectedItemId={selectedWatchItemId}
            onSelectItem={setSelectedWatchItemId}
          />
        </div>
      )}

      {/* Center: Risk and Exposure Canvas */}
      <div className={styles.center}>
        <RiskExposureCanvas
          data={riskExposure}
          onOpenModule={onOpenModule}
        />
      </div>

      {/* Right: Intervention Rail (desktop only) */}
      {viewportTier === 'desktop' && (
        <div className={styles.right}>
          <InterventionRail
            queue={interventionQueue}
            onOpenModule={onOpenModule}
          />
        </div>
      )}

      {/* Bottom: Activity/Trend Strip */}
      <div className={styles.bottom}>
        <ActivityStrip activity={activity} />
      </div>
    </div>
  );
}

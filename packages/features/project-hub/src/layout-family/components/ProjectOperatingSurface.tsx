import type { ReactNode } from 'react';
import { useState } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_BREAKPOINT_DESKTOP,
  HBC_BREAKPOINT_SIDEBAR,
  HBC_SPACE_MD,
} from '@hbc/ui-kit';

import {
  useModulePostureSummaries,
  useWorkQueueSummary,
  useNextMoveSummary,
  useActivitySummary,
  useSelectedModule,
} from '../hooks/index.js';
import { CommandRail } from './CommandRail.js';
import { CanvasCenter } from './CanvasCenter.js';
import { ContextRail } from './ContextRail.js';
import { ActivityStrip } from './ActivityStrip.js';

// ── Styles ──────────────────────────────────────────────────────────

const RAIL_WIDTH_EXPANDED = 260;
const RAIL_WIDTH_COLLAPSED = 48;
const CONTEXT_RAIL_WIDTH = 300;

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
    gridTemplateColumns: `${RAIL_WIDTH_EXPANDED}px 1fr ${CONTEXT_RAIL_WIDTH}px`,
  },
  rootDesktopLeftCollapsed: {
    gridTemplateColumns: `${RAIL_WIDTH_COLLAPSED}px 1fr ${CONTEXT_RAIL_WIDTH}px`,
  },
  rootTablet: {
    gridTemplateColumns: `${RAIL_WIDTH_COLLAPSED}px 1fr`,
    gridTemplateAreas: '"left center" "bottom bottom"',
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
  // Use matchMedia for responsive behavior.
  // In SSR or test environments, default to desktop.
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width >= HBC_BREAKPOINT_DESKTOP) return 'desktop';
  if (width >= HBC_BREAKPOINT_SIDEBAR) return 'tablet';
  return 'mobile';
}

// ── Component ───────────────────────────────────────────────────────

export interface ProjectOperatingSurfaceProps {
  /** Injected canvas content (HbcProjectCanvas or project metadata cards). */
  readonly canvasSlot: ReactNode;
  /** Called when the user opens a full module surface. */
  readonly onModuleOpen: (slug: string) => void;
}

/**
 * Project Operating Surface — the three-column operating layout.
 *
 * Orchestrates: CommandRail (left), CanvasCenter (center),
 * ContextRail (right), ActivityStrip (bottom).
 *
 * Composes inside WorkspacePageShell as children of the DashboardLayout
 * data zone. No new shell or route required.
 */
export function ProjectOperatingSurface({
  canvasSlot,
  onModuleOpen,
}: ProjectOperatingSurfaceProps): ReactNode {
  const styles = useStyles();
  const viewportTier = useViewportTier();

  // Data hooks
  const modules = useModulePostureSummaries();
  const workQueue = useWorkQueueSummary();
  const nextMoves = useNextMoveSummary();
  const activity = useActivitySummary();
  const { selectedSlug, setSelectedSlug } = useSelectedModule();

  // Rail collapse state
  const [leftCollapsed, setLeftCollapsed] = useState(viewportTier !== 'desktop');

  // Resolve selected module posture data
  const selectedModule = selectedSlug
    ? modules.find((m) => m.moduleSlug === selectedSlug) ?? null
    : null;

  // Responsive grid class
  const gridClass =
    viewportTier === 'mobile'
      ? styles.rootMobile
      : viewportTier === 'tablet'
        ? styles.rootTablet
        : leftCollapsed
          ? styles.rootDesktopLeftCollapsed
          : styles.rootDesktop;

  return (
    <div
      data-testid="project-operating-surface"
      data-viewport={viewportTier}
      className={mergeClasses(styles.root, gridClass)}
    >
      {/* Left: Command Rail (hidden on mobile) */}
      {viewportTier !== 'mobile' && (
        <div className={styles.left}>
          <CommandRail
            modules={modules}
            selectedModuleSlug={selectedSlug}
            onModuleSelect={setSelectedSlug}
            collapsed={leftCollapsed || viewportTier === 'tablet'}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
          />
        </div>
      )}

      {/* Center: Canvas or Module Preview */}
      <div className={styles.center}>
        <CanvasCenter
          canvasSlot={canvasSlot}
          selectedModule={selectedModule}
          onModuleOpen={onModuleOpen}
        />
      </div>

      {/* Right: Context Rail (desktop only) */}
      {viewportTier === 'desktop' && (
        <div className={styles.right}>
          <ContextRail
            nextMoves={nextMoves}
            workQueue={workQueue}
            selectedModuleSlug={selectedSlug}
          />
        </div>
      )}

      {/* Bottom: Activity Strip */}
      <div className={styles.bottom}>
        <ActivityStrip activity={activity} />
      </div>
    </div>
  );
}

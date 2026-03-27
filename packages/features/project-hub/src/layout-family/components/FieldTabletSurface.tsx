import type { ReactNode } from 'react';
import { useState } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_BREAKPOINT_SIDEBAR,
} from '@hbc/ui-kit';

import {
  useFieldFocusAreas,
  useFieldActionStack,
  useFieldSyncStatus,
} from '../hooks/useFieldFocusSummary.js';
import { FieldFocusRail } from './FieldFocusRail.js';
import { FieldActionStack } from './FieldActionStack.js';
import { FieldQuickActionBar } from './FieldQuickActionBar.js';
import { FieldSyncStatusBar } from './FieldSyncStatusBar.js';

// ── Layout constants ────────────────────────────────────────────────

const FOCUS_RAIL_WIDTH = 240;

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'grid',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    gridTemplateRows: '1fr auto auto',
  },
  rootSplit: {
    gridTemplateAreas: '"left right" "bar bar" "sync sync"',
    gridTemplateColumns: `${FOCUS_RAIL_WIDTH}px 1fr`,
  },
  rootStacked: {
    gridTemplateAreas: '"right" "bar" "sync"',
    gridTemplateColumns: '1fr',
  },
  left: {
    gridArea: 'left',
    minHeight: 0,
    overflow: 'hidden',
  },
  right: {
    gridArea: 'right',
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  bar: {
    gridArea: 'bar',
  },
  sync: {
    gridArea: 'sync',
  },
});

// ── Viewport detection ──────────────────────────────────────────────

function useIsSplitPaneEligible(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= HBC_BREAKPOINT_SIDEBAR;
}

// ── Component ───────────────────────────────────────────────────────

export interface FieldTabletSurfaceProps {
  /** Called when user opens a module from an action card. */
  readonly onOpenModule: (slug: string) => void;
  /** Called when user triggers a quick action. */
  readonly onQuickAction?: (actionId: string) => void;
}

/**
 * Field Tablet Surface — touch-first, area-driven split-pane layout.
 *
 * Orchestrates: FieldFocusRail (left), FieldActionStack (right),
 * FieldQuickActionBar (bottom persistent), FieldSyncStatusBar (footer).
 *
 * Composes inside WorkspacePageShell as children, same pattern as
 * ProjectOperatingSurface and ExecutiveCockpitSurface.
 *
 * NOTE: This family uses touch-density defaults. The area/location
 * data is derived from module categories (the closest repo-truth
 * analog to field areas). Plan-sheet-native and photo-capture
 * behaviors are honest placeholders pending field runtime.
 */
export function FieldTabletSurface({
  onOpenModule,
  onQuickAction,
}: FieldTabletSurfaceProps): ReactNode {
  const styles = useStyles();
  const isSplitPane = useIsSplitPaneEligible();

  // Data hooks
  const focusAreas = useFieldFocusAreas();
  const actionStack = useFieldActionStack();
  const syncStatus = useFieldSyncStatus();

  // Area selection state
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const handleQuickAction = (actionId: string): void => {
    if (actionId === 'full-surface') {
      // "Open Full Surface" just clears selection to show all areas
      setSelectedAreaId(null);
      return;
    }
    onQuickAction?.(actionId);
  };

  return (
    <div
      data-testid="field-tablet-surface"
      data-split-pane={isSplitPane}
      data-density-tier="touch"
      className={mergeClasses(
        styles.root,
        isSplitPane ? styles.rootSplit : styles.rootStacked,
      )}
    >
      {/* Left: Focus Rail (split-pane only) */}
      {isSplitPane && (
        <div className={styles.left}>
          <FieldFocusRail
            areas={focusAreas.areas}
            selectedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
          />
        </div>
      )}

      {/* Right: Action Stack (always visible) */}
      <div className={styles.right}>
        <FieldActionStack
          items={actionStack.items}
          selectedAreaId={selectedAreaId}
          onOpenModule={onOpenModule}
        />
      </div>

      {/* Bottom: Quick Action Bar (always visible, touch-safe) */}
      <div className={styles.bar}>
        <FieldQuickActionBar onAction={handleQuickAction} />
      </div>

      {/* Footer: Sync Status (always visible for field trust) */}
      <div className={styles.sync}>
        <FieldSyncStatusBar syncStatus={syncStatus} />
      </div>
    </div>
  );
}

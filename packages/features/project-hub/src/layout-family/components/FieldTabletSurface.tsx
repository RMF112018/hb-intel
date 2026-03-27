/**
 * FieldTabletSurface — Project Hub field-tablet family orchestrator.
 *
 * Thin wrapper that wires field domain hooks to generic @hbc/ui-kit
 * layout primitives. FieldFocusRail and FieldActionStack remain as
 * PH-domain components (they use PH-specific area/action contracts).
 * HbcQuickActionBar and HbcSyncStatusBar use ui-kit generics.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  MultiColumnLayout,
  HbcQuickActionBar,
  HbcSyncStatusBar,
} from '@hbc/ui-kit';
import type { QuickAction } from '@hbc/ui-kit';

import {
  useFieldFocusAreas,
  useFieldActionStack,
  useFieldSyncStatus,
} from '../hooks/useFieldFocusSummary.js';
import { FieldFocusRail } from './FieldFocusRail.js';
import { FieldActionStack } from './FieldActionStack.js';

// ── Quick action definitions ────────────────────────────────────────

const FIELD_QUICK_ACTIONS: QuickAction[] = [
  { id: 'capture', label: 'Capture', available: false, unavailableLabel: 'Coming soon' },
  { id: 'markup', label: 'Markup', available: false, unavailableLabel: 'Coming soon' },
  { id: 'issue', label: 'Issue', available: true },
  { id: 'checklist', label: 'Checklist', available: true },
  { id: 'review', label: 'Review', available: true },
  { id: 'full-surface', label: 'Full Surface', available: true },
];

// ── Component ───────────────────────────────────────────────────────

export interface FieldTabletSurfaceProps {
  readonly onOpenModule: (slug: string) => void;
  readonly onQuickAction?: (actionId: string) => void;
}

export function FieldTabletSurface({
  onOpenModule,
  onQuickAction,
}: FieldTabletSurfaceProps): ReactNode {
  const focusAreas = useFieldFocusAreas();
  const actionStack = useFieldActionStack();
  const syncStatus = useFieldSyncStatus();

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const handleQuickAction = (actionId: string): void => {
    if (actionId === 'full-surface') {
      setSelectedAreaId(null);
      return;
    }
    onQuickAction?.(actionId);
  };

  return (
    <MultiColumnLayout
      testId="field-tablet-surface"
      config={{
        left: { width: 240, hideOnMobile: true },
      }}
      leftSlot={
        <FieldFocusRail
          areas={focusAreas.areas}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
        />
      }
      centerSlot={
        <FieldActionStack
          items={actionStack.items}
          selectedAreaId={selectedAreaId}
          onOpenModule={onOpenModule}
        />
      }
      bottomSlot={
        <>
          <HbcQuickActionBar
            actions={FIELD_QUICK_ACTIONS}
            onAction={handleQuickAction}
            testId="field-quick-action-bar"
          />
          <HbcSyncStatusBar
            state={syncStatus.state}
            pendingCount={syncStatus.pendingUploads}
            failedCount={syncStatus.failedUploads}
            lastSyncLabel={syncStatus.lastSyncLabel}
            testId="field-sync-status-bar"
          />
        </>
      }
    />
  );
}

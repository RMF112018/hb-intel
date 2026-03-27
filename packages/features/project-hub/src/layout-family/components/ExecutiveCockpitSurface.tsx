/**
 * ExecutiveCockpitSurface — Project Hub executive family orchestrator.
 *
 * Thin wrapper that wires executive domain hooks to MultiColumnLayout
 * from @hbc/ui-kit. WatchlistPanel, RiskExposureCanvas, and
 * InterventionRail remain PH-domain components (not generic).
 * ActivityStrip uses the generic HbcActivityStrip from ui-kit.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  MultiColumnLayout,
  HbcActivityStrip,
} from '@hbc/ui-kit';
import type { ActivityStripEntry } from '@hbc/ui-kit';

import { useWatchlistSummary } from '../hooks/useWatchlistSummary.js';
import { useRiskExposureSummary } from '../hooks/useRiskExposureSummary.js';
import { useInterventionQueue } from '../hooks/useInterventionQueue.js';
import { useActivitySummary } from '../hooks/useActivitySummary.js';
import { WatchlistPanel } from './WatchlistPanel.js';
import { RiskExposureCanvas } from './RiskExposureCanvas.js';
import { InterventionRail } from './InterventionRail.js';

// ── Component ───────────────────────────────────────────────────────

export interface ExecutiveCockpitSurfaceProps {
  readonly projectId: string | null;
  readonly onOpenModule: (slug: string) => void;
}

export function ExecutiveCockpitSurface({
  projectId,
  onOpenModule,
}: ExecutiveCockpitSurfaceProps): ReactNode {
  const watchlist = useWatchlistSummary();
  const riskExposure = useRiskExposureSummary(projectId);
  const interventionQueue = useInterventionQueue();
  const activity = useActivitySummary();

  const [selectedWatchItemId, setSelectedWatchItemId] = useState<string | null>(null);

  const activityEntries: ActivityStripEntry[] = activity.entries.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    type: e.type,
    title: e.title,
    source: e.sourceModule,
    actor: e.actor,
  }));

  return (
    <MultiColumnLayout
      testId="executive-cockpit-surface"
      config={{
        left: { width: 280, hideOnTablet: true, hideOnMobile: true },
        right: { width: 320, hideOnTablet: true, hideOnMobile: true },
      }}
      leftSlot={
        <WatchlistPanel
          watchlist={watchlist}
          selectedItemId={selectedWatchItemId}
          onSelectItem={setSelectedWatchItemId}
        />
      }
      centerSlot={
        <RiskExposureCanvas
          data={riskExposure}
          onOpenModule={onOpenModule}
        />
      }
      rightSlot={
        <InterventionRail
          queue={interventionQueue}
          onOpenModule={onOpenModule}
        />
      }
      bottomSlot={
        <HbcActivityStrip
          entries={activityEntries}
          testId="activity-strip"
        />
      }
    />
  );
}

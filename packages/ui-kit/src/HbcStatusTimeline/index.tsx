/**
 * HbcStatusTimeline — Standard-gated status timeline stub
 * D-SF03-T07 / D-08: internal default gate + complexityMinTier/maxTier override props
 *
 * Stub component — full implementation deferred to module phases.
 */
import * as React from 'react';
import { useComplexityGate } from '@hbc/complexity';
import type { HbcStatusTimelineProps } from './types.js';

export function HbcStatusTimeline({
  statuses,
  showFuture = false,
  complexityMinTier = 'standard',
  complexityMaxTier,
}: HbcStatusTimelineProps): React.ReactElement | null {
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div data-hbc-ui="HbcStatusTimeline" data-show-future={showFuture}>
      {statuses.map((entry, i) => (
        <div key={i} data-status={entry.status}>
          {entry.status} — {entry.timestamp}
          {entry.actor ? ` (${entry.actor})` : null}
        </div>
      ))}
    </div>
  );
}

export type { HbcStatusTimelineProps, IStatusEntry } from './types.js';

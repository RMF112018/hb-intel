/**
 * HbcCoachingCallout — Coaching prompt, Essential–Standard by default
 * D-SF03-T07 / D-08: internal default gate with maxTier='standard' (Expert users see no coaching).
 * D-07: also checks showCoaching from IComplexityContext.
 *
 * Stub component — full implementation deferred to module phases.
 */
import * as React from 'react';
import { useComplexity, useComplexityGate } from '@hbc/complexity';
import type { HbcCoachingCalloutProps } from './types.js';

export function HbcCoachingCallout({
  message,
  actionLabel,
  onAction,
  complexityMinTier = 'essential',
  complexityMaxTier = 'standard',
}: HbcCoachingCalloutProps): React.ReactElement | null {
  const { showCoaching } = useComplexity();
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible || !showCoaching) return null;

  return (
    <div data-hbc-ui="HbcCoachingCallout" role="note" aria-label="Guidance">
      <p>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export type { HbcCoachingCalloutProps } from './types.js';

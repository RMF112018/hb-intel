/**
 * HbcAuditTrailPanel — Expert-gated audit trail stub
 * D-SF03-T07 / D-08: internal default gate + complexityMinTier/maxTier override props
 *
 * Stub component — full implementation deferred to module phases.
 */
import * as React from 'react';
import { useComplexityGate } from '@hbc/complexity';
import type { HbcAuditTrailPanelProps } from './types.js';

export function HbcAuditTrailPanel({
  itemId,
  maxItems = 20,
  complexityMinTier = 'expert',
  complexityMaxTier,
}: HbcAuditTrailPanelProps): React.ReactElement | null {
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div data-hbc-ui="HbcAuditTrailPanel" data-item-id={itemId} data-max-items={maxItems}>
      {/* T07 stub — full audit trail implementation in module phases */}
    </div>
  );
}

export type { HbcAuditTrailPanelProps } from './types.js';

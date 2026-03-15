/**
 * HbcMyWorkSourceHealth — SF29-T06
 *
 * Expert-only diagnostic surface showing feed health state:
 * freshness badge, degraded source count, superseded count, warning message.
 * Returns null at essential and standard tiers, or when no healthState provided.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcBanner, HbcTypography, HbcStatusBadge } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import type { IMyWorkHealthState, MyWorkSyncStatus } from '../../types/index.js';

export interface IHbcMyWorkSourceHealthProps {
  healthState?: IMyWorkHealthState;
  className?: string;
}

const FRESHNESS_VARIANT: Record<MyWorkSyncStatus, StatusVariant> = {
  live: 'success',
  cached: 'info',
  partial: 'warning',
  queued: 'warning',
};

const FRESHNESS_LABEL: Record<MyWorkSyncStatus, string> = {
  live: 'Live',
  cached: 'Cached',
  partial: 'Partial',
  queued: 'Queued',
};

export function HbcMyWorkSourceHealth({
  healthState,
  className,
}: IHbcMyWorkSourceHealthProps): JSX.Element | null {
  const { tier } = useComplexity();

  if (tier !== 'expert') return null;
  if (!healthState) return null;

  const { freshness, degradedSourceCount, hiddenSupersededCount, warningMessage } = healthState;

  return (
    <div className={`hbc-my-work-source-health${className ? ` ${className}` : ''}`}>
      <HbcStatusBadge
        variant={FRESHNESS_VARIANT[freshness]}
        label={FRESHNESS_LABEL[freshness]}
      />

      {(degradedSourceCount ?? 0) > 0 && (
        <HbcTypography intent="bodySmall">
          {degradedSourceCount} degraded {degradedSourceCount === 1 ? 'source' : 'sources'}
        </HbcTypography>
      )}

      {(hiddenSupersededCount ?? 0) > 0 && (
        <HbcTypography intent="bodySmall">
          {hiddenSupersededCount} hidden superseded
        </HbcTypography>
      )}

      {warningMessage && (
        <HbcBanner variant="warning">{warningMessage}</HbcBanner>
      )}
    </div>
  );
}

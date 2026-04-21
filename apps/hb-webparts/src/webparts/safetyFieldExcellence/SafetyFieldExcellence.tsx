/**
 * SafetyFieldExcellence — Safety-critical field intelligence surface.
 *
 * W02-P01 — rebuild on `HbcSafetyHomepageSurface`:
 *   - Top-line safety posture band with status + cadence
 *   - Dominant primary signal lane with decisive action posture
 *   - Bounded secondary signal lane with severity treatment
 *   - Explicit compact/minimal behavior for shell-fit states
 *
 * The webpart consumer owns only non-visual concerns:
 *   - manifest-config fallback
 *   - normalization + audience filtering
 *   - loading / empty / invalid state handling
 *   - mapping the normalized output into the surface view-model
 *
 * No inline styling. All safety typography, severity accents, and
 * spacing live in the shared surface family.
 */
import * as React from 'react';
import {
  HbcSafetyHomepageSurface,
  Shield,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import {
  coerceSafetyFieldExcellenceConfig,
  normalizeSafetyFieldExcellenceConfig,
} from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { SafetyFieldExcellenceConfigInput } from '../../homepage/webparts/operationalAwarenessContracts.js';
import {
  mapSafetySurfaceModel,
  resolveConsumerState,
  resolveOperationalMode,
} from './safetyFieldExcellenceConsumerModel.js';

export interface SafetyFieldExcellenceProps {
  config?: SafetyFieldExcellenceConfigInput;
  activeAudience?: string;
  isLoading?: boolean;
  shellRenderMode?: 'standard' | 'compact' | 'summary-collapsed';
}

export function SafetyFieldExcellence({
  config,
  activeAudience,
  isLoading = false,
  shellRenderMode = 'standard',
}: SafetyFieldExcellenceProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading safety and field excellence" />;
  }

  try {
    const canonicalConfig = coerceSafetyFieldExcellenceConfig(config);
    const normalized = normalizeSafetyFieldExcellenceConfig(canonicalConfig, activeAudience);
    const state = resolveConsumerState(canonicalConfig, normalized);
    if (state.state !== 'valid') {
      const message = resolveAuthoringMessage(
        'safetyFieldExcellence',
        state.state === 'invalid' ? 'invalid' : 'noData',
      );
      return <HomepageEmptyState title={message.title} description={message.description} />;
    }

    const operationalMode = resolveOperationalMode(shellRenderMode);
    const surfaceModel = mapSafetySurfaceModel(normalized, operationalMode);
    return (
      <HbcSafetyHomepageSurface
        title={normalized.heading}
        icon={Shield}
        {...surfaceModel}
      />
    );
  } catch (error) {
    const message = resolveAuthoringMessage(
      'safetyFieldExcellence',
      'fetchError',
    );
    const runtimeDescription =
      error instanceof Error && error.message
        ? `${message.description} (${error.message})`
        : message.description;
    return <HomepageEmptyState title={message.title} description={runtimeDescription} />;
  }
}

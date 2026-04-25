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
import type {
  SafetyFieldExcellenceConfig,
  SafetyFieldExcellenceConfigInput,
  SafetyFieldExcellenceDataSource,
  SafetyFieldExcellenceDynamicState,
  SafetyFieldExcellenceSourceMode,
} from '../../homepage/webparts/operationalAwarenessContracts.js';
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
  /**
   * Wave 05: dynamic source mode. Defaults to `curated-only` so existing
   * curated authoring continues to render unchanged.
   */
  sourceMode?: SafetyFieldExcellenceSourceMode;
  /**
   * Wave 05: dynamic config produced by the data adapter. When present
   * and the source mode permits, this replaces the curated input.
   */
  dynamicConfig?: SafetyFieldExcellenceConfig;
  /**
   * Wave 05: data-adapter state machine. Used to render stale/error
   * states without exposing raw backend errors.
   */
  dynamicState?: SafetyFieldExcellenceDynamicState;
  /**
   * Wave 05: classification of which data path actually rendered.
   * Recorded in the runtime-proof object; never shown to users.
   */
  dynamicDataSource?: SafetyFieldExcellenceDataSource;
  dynamicErrorMessage?: string;
  fallbackReason?: string;
}

export function SafetyFieldExcellence({
  config,
  activeAudience,
  isLoading = false,
  shellRenderMode = 'standard',
  sourceMode = 'curated-only',
  dynamicConfig,
  dynamicState,
  dynamicDataSource,
  dynamicErrorMessage,
  fallbackReason: _fallbackReason,
}: SafetyFieldExcellenceProps): React.JSX.Element {
  if (isLoading || dynamicState === 'loading') {
    return <HomepageLoadingState label="Loading safety and field excellence" />;
  }

  // Decide which input the renderer consumes. The dynamic provider has
  // already resolved fallback semantics; we honor its choice via
  // `dynamicDataSource`. When source mode is curated-only, dynamicConfig
  // is never used.
  const inputForRender: SafetyFieldExcellenceConfigInput | undefined =
    sourceMode === 'curated-only'
      ? config
      : pickDynamicOrCurated(dynamicConfig, config, dynamicDataSource);

  // When the dynamic provider chose `error-fallback` and we have no
  // dynamic config (preview suppressed by config), we still want to fail
  // safe rather than render an empty surface.
  void dynamicErrorMessage;

  try {
    const canonicalConfig = coerceSafetyFieldExcellenceConfig(inputForRender);
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

function pickDynamicOrCurated(
  dynamicConfig: SafetyFieldExcellenceConfig | undefined,
  curated: SafetyFieldExcellenceConfigInput | undefined,
  dataSource: SafetyFieldExcellenceDataSource | undefined,
): SafetyFieldExcellenceConfigInput | undefined {
  // The provider sets `dataSource` to indicate which path won. Honor
  // that signal so callers don't need to recompute the decision.
  if (dataSource === 'dynamic' || dataSource === 'preview-fallback' || dataSource === 'error-fallback') {
    return dynamicConfig ?? curated;
  }
  return curated;
}

/**
 * Safety Field Excellence dynamic provider.
 *
 * Owns: source-mode resolution, data fetch, payload validation, fallback
 * decision, and runtime-proof publication. Emits a `DynamicResolution`
 * shape that `SafetyFieldExcellence` renders.
 */

import * as React from 'react';
import {
  fetchSafetyFieldExcellenceCurrent,
  buildHomepageCurrentUrl,
  type SafetyFieldExcellenceFetchOutcome,
} from './SafetyFieldExcellenceDataAdapter.js';
import { mapBackendPublishedToConfig } from './safetyFieldExcellencePayloadMapper.js';
import { buildSafetyExcellencePreviewFallbackConfig } from './safetyFieldExcellencePreviewFallback.js';
import {
  publishSafetyFieldExcellenceRuntimeProof,
  type SafetyFieldExcellenceRuntimeProof,
} from './safetyFieldExcellenceRuntimeProof.js';
import type {
  SafetyFieldExcellenceConfig,
  SafetyFieldExcellenceDataSource,
  SafetyFieldExcellenceDynamicState,
  SafetyFieldExcellenceSourceMode,
} from '../../homepage/webparts/operationalAwarenessContracts.js';

export interface SafetyFieldExcellenceDynamicResolution {
  readonly state: SafetyFieldExcellenceDynamicState;
  readonly dataSource: SafetyFieldExcellenceDataSource;
  readonly config?: SafetyFieldExcellenceConfig;
  readonly errorMessage?: string;
  readonly fallbackReason?: string;
  readonly isStale: boolean;
}

export interface SafetyFieldExcellenceDynamicProviderProps {
  readonly sourceMode: SafetyFieldExcellenceSourceMode;
  readonly functionAppBaseUrl?: string;
  readonly includeStale?: boolean;
  readonly diagnosticsEnabled?: boolean;
  readonly emergencyUseCuratedFallback?: boolean;
  readonly safetyHubUrl?: string;
  readonly hasCuratedConfig: boolean;
  readonly getFunctionAppToken?: () => Promise<string>;
  readonly fetchImpl?: typeof fetch;
  readonly packageVersion?: string;
  readonly expectedPackageVersion?: string;
  /**
   * Wave 07.1 diagnostic. Forwarded onto the runtime proof object so
   * operators can distinguish "the page config did not include the
   * `safetyFieldExcellenceDynamic` key" from later failure modes.
   */
  readonly safetyFieldExcellenceDynamicConfigSeen?: boolean;
  /**
   * Wave 07.1 diagnostic. Forwarded onto the runtime proof object so
   * operators can distinguish "the key exists but its value did not
   * resolve to a usable dynamic config" from "the dynamic config was
   * resolved but downstream wiring is incomplete".
   */
  readonly safetyFieldExcellenceDynamicConfigResolved?: boolean;
  readonly children: (resolution: SafetyFieldExcellenceDynamicResolution) => React.ReactNode;
}

export function SafetyFieldExcellenceDynamicProvider(
  props: SafetyFieldExcellenceDynamicProviderProps,
): React.JSX.Element {
  const [resolution, setResolution] = React.useState<SafetyFieldExcellenceDynamicResolution>(() => initialResolution(props));

  React.useEffect(() => {
    if (props.sourceMode === 'curated-only') {
      const curatedResolution: SafetyFieldExcellenceDynamicResolution = {
        state: 'idle',
        dataSource: 'curated',
        isStale: false,
      };
      setResolution(curatedResolution);
      publishProof(props, curatedResolution, {});
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const startedAt = new Date().toISOString();

    setResolution((prev) => ({ ...prev, state: 'loading' }));

    void (async () => {
      const baseUrl = props.functionAppBaseUrl?.trim();
      const tokenFn = props.getFunctionAppToken;

      if (!baseUrl || !tokenFn) {
        if (cancelled) return;
        const next = decideUnconfigured(props);
        setResolution(next);
        publishProof(props, next, {
          backendFunctionAppUrlConfigured: Boolean(baseUrl),
          currentEndpointUrl: baseUrl
            ? buildHomepageCurrentUrl(baseUrl, Boolean(props.includeStale))
            : undefined,
          fallbackReason: next.fallbackReason,
          lastFetchStartedAt: startedAt,
        });
        return;
      }

      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: baseUrl,
        includeStale: Boolean(props.includeStale),
        getToken: tokenFn,
        fetchImpl: props.fetchImpl,
        abortSignal: controller.signal,
      });
      const completedAt = new Date().toISOString();
      if (cancelled) return;

      const next = decideFromOutcome(props, outcome);
      setResolution(next);
      publishProof(props, next, {
        backendFunctionAppUrlConfigured: true,
        currentEndpointUrl: buildHomepageCurrentUrl(baseUrl, Boolean(props.includeStale)),
        currentEndpointStatus: 'status' in outcome ? outcome.status : undefined,
        publishedHighlightId:
          outcome.kind === 'published'
            ? outcome.current.highlightItemId ?? outcome.current.itemId
            : undefined,
        reportingPeriodId:
          outcome.kind === 'published' ? outcome.current.reportingPeriodId : undefined,
        reportingPeriodSpItemId:
          outcome.kind === 'published'
            ? outcome.current.reportingPeriodSpItemId
            : undefined,
        periodLabel:
          outcome.kind === 'published' ? outcome.current.periodLabel : undefined,
        publishStatus: outcome.kind === 'published' ? 'published' : undefined,
        freshUntil: outcome.kind === 'published' ? outcome.current.freshUntil ?? undefined : undefined,
        isStale: outcome.kind === 'published' ? Boolean(outcome.current.isStale) : undefined,
        dataConfidence:
          outcome.kind === 'published' ? outcome.current.dataConfidence ?? undefined : undefined,
        primaryProjectNumber: undefined,
        secondaryCount: countSecondary(next.config),
        fallbackReason: next.fallbackReason,
        lastFetchStartedAt: startedAt,
        lastFetchCompletedAt: completedAt,
      });
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.sourceMode,
    props.functionAppBaseUrl,
    props.includeStale,
    props.getFunctionAppToken,
  ]);

  return <>{props.children(resolution)}</>;
}

function initialResolution(
  props: SafetyFieldExcellenceDynamicProviderProps,
): SafetyFieldExcellenceDynamicResolution {
  if (props.sourceMode === 'curated-only') {
    return { state: 'idle', dataSource: 'curated', isStale: false };
  }
  return { state: 'loading', dataSource: 'curated', isStale: false };
}

function decideUnconfigured(
  props: SafetyFieldExcellenceDynamicProviderProps,
): SafetyFieldExcellenceDynamicResolution {
  const fallbackReason = props.functionAppBaseUrl
    ? 'function-app-token-not-configured'
    : 'function-app-base-url-not-configured';
  if (props.sourceMode === 'dynamic-only') {
    return {
      state: 'preview',
      dataSource: 'preview-fallback',
      config: buildPreview(props),
      fallbackReason,
      isStale: false,
    };
  }
  if (props.sourceMode === 'dynamic-with-curated-fallback') {
    if (props.hasCuratedConfig) {
      return {
        state: 'no-published-highlight',
        dataSource: 'curated-fallback',
        fallbackReason,
        isStale: false,
      };
    }
    return {
      state: 'preview',
      dataSource: 'preview-fallback',
      config: buildPreview(props),
      fallbackReason,
      isStale: false,
    };
  }
  // dynamic-preview: keep curated default render; record proof only.
  return {
    state: 'idle',
    dataSource: 'curated',
    fallbackReason,
    isStale: false,
  };
}

function decideFromOutcome(
  props: SafetyFieldExcellenceDynamicProviderProps,
  outcome: SafetyFieldExcellenceFetchOutcome,
): SafetyFieldExcellenceDynamicResolution {
  if (outcome.kind === 'published') {
    const mapped = mapBackendPublishedToConfig(outcome.current);
    if (!mapped.success || !mapped.config) {
      return decideOnFailure(props, 'invalid-payload', outcome.status, mapped.invalidReason ?? 'mapping-failed');
    }
    if (props.sourceMode === 'dynamic-preview') {
      return {
        state: 'idle',
        dataSource: 'curated',
        isStale: Boolean(outcome.current.isStale),
        fallbackReason: undefined,
      };
    }
    const isStale = Boolean(outcome.current.isStale);
    return {
      state: isStale ? 'stale' : 'ready',
      dataSource: 'dynamic',
      config: mapped.config,
      isStale,
    };
  }

  if (outcome.kind === 'no-published') {
    if (props.sourceMode === 'dynamic-preview') {
      return {
        state: 'idle',
        dataSource: 'curated',
        isStale: false,
        fallbackReason: 'no-published-highlight',
      };
    }
    if (props.sourceMode === 'dynamic-with-curated-fallback') {
      if (props.hasCuratedConfig) {
        return {
          state: 'no-published-highlight',
          dataSource: 'curated-fallback',
          isStale: false,
          fallbackReason: 'no-published-highlight',
        };
      }
      return {
        state: 'preview',
        dataSource: 'preview-fallback',
        config: buildPreview(props),
        isStale: false,
        fallbackReason: 'no-published-highlight',
      };
    }
    // dynamic-only
    return {
      state: 'preview',
      dataSource: 'preview-fallback',
      config: buildPreview(props),
      isStale: false,
      fallbackReason: 'no-published-highlight',
    };
  }

  if (outcome.kind === 'auth-error') {
    return decideOnFailure(props, 'auth-error', outcome.status, `auth-error-${outcome.status}`);
  }
  if (outcome.kind === 'network-error') {
    return decideOnFailure(props, 'network-error', outcome.status, outcome.message);
  }
  // invalid-payload
  return decideOnFailure(props, 'invalid-payload', outcome.status, outcome.reason);
}

function decideOnFailure(
  props: SafetyFieldExcellenceDynamicProviderProps,
  state: SafetyFieldExcellenceDynamicState,
  _status: number | undefined,
  fallbackReason: string,
): SafetyFieldExcellenceDynamicResolution {
  if (props.sourceMode === 'dynamic-preview') {
    return {
      state: 'idle',
      dataSource: 'curated',
      isStale: false,
      fallbackReason,
    };
  }
  if (props.sourceMode === 'dynamic-with-curated-fallback') {
    if (props.hasCuratedConfig) {
      return {
        state,
        dataSource: 'curated-fallback',
        isStale: false,
        errorMessage: humanizeError(state),
        fallbackReason,
      };
    }
  }
  if (props.emergencyUseCuratedFallback && props.hasCuratedConfig) {
    return {
      state,
      dataSource: 'curated-fallback',
      isStale: false,
      errorMessage: humanizeError(state),
      fallbackReason: `${fallbackReason} (emergency-fallback)`,
    };
  }
  return {
    state,
    dataSource: 'error-fallback',
    config: buildPreview(props),
    isStale: false,
    errorMessage: humanizeError(state),
    fallbackReason,
  };
}

function buildPreview(
  props: SafetyFieldExcellenceDynamicProviderProps,
): SafetyFieldExcellenceConfig {
  return buildSafetyExcellencePreviewFallbackConfig({ safetyHubUrl: props.safetyHubUrl });
}

function humanizeError(state: SafetyFieldExcellenceDynamicState): string | undefined {
  if (state === 'auth-error') {
    return 'You may not have access to live Safety Excellence data right now.';
  }
  if (state === 'network-error') {
    return 'Live Safety Excellence data is temporarily unavailable.';
  }
  if (state === 'invalid-payload') {
    return 'Live Safety Excellence data is temporarily unavailable.';
  }
  return undefined;
}

function countSecondary(config: SafetyFieldExcellenceConfig | undefined): number {
  return config?.secondarySignals?.length ?? 0;
}

function publishProof(
  props: SafetyFieldExcellenceDynamicProviderProps,
  resolution: SafetyFieldExcellenceDynamicResolution,
  extra: Partial<SafetyFieldExcellenceRuntimeProof>,
): void {
  publishSafetyFieldExcellenceRuntimeProof({
    generatedAt: new Date().toISOString(),
    sourceMode: props.sourceMode,
    dataSource: resolution.dataSource,
    state: resolution.state,
    backendFunctionAppUrlConfigured: Boolean(props.functionAppBaseUrl),
    currentEndpointConfigured:
      Boolean(props.functionAppBaseUrl) && Boolean(props.getFunctionAppToken),
    secondaryCount: extra.secondaryCount ?? countSecondary(resolution.config),
    fallbackReason: resolution.fallbackReason,
    isStale: resolution.isStale,
    packageVersion: props.packageVersion,
    expectedPackageVersion: props.expectedPackageVersion,
    // Wave 06: non-sensitive UI/UX cues for evidence + hosted proof.
    previewFallbackRendered:
      resolution.dataSource === 'preview-fallback' || resolution.dataSource === 'error-fallback',
    staleTreatment: resolution.state === 'stale' || resolution.isStale,
    // Wave 07.1: dynamic-config diagnostic visibility for hosted self-diagnosis.
    safetyFieldExcellenceDynamicConfigSeen: props.safetyFieldExcellenceDynamicConfigSeen,
    safetyFieldExcellenceDynamicConfigResolved: props.safetyFieldExcellenceDynamicConfigResolved,
    ...extra,
  });
}

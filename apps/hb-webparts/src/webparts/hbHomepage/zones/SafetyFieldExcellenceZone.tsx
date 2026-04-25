import * as React from 'react';
import { SafetyFieldExcellence } from '../../safetyFieldExcellence/SafetyFieldExcellence.js';
import { SafetyFieldExcellenceDynamicProvider } from '../../safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';
import type {
  SafetyFieldExcellenceDynamicConfig,
  SafetyFieldExcellenceSourceMode,
} from '../../../homepage/webparts/operationalAwarenessContracts.js';

/**
 * Thin shell-owned zone wrapper:
 * - shell owns placement and render mode
 * - child owns safety model/state/rendering
 *
 * Wave 05: when dynamic source modes are enabled via config, the zone
 * also owns the dynamic provider that fetches the published homepage
 * artifact from the Safety Function App. The provider sits between the
 * shell and the renderer to keep `SafetyFieldExcellence` itself a pure
 * consumer.
 */
export function SafetyFieldExcellenceZone({
  moduleConfig,
  shellRenderMode,
  functionAppBaseUrl,
  getFunctionAppToken,
}: HbHomepageZoneProps): React.JSX.Element {
  const dynamicConfig = readDynamicConfig(moduleConfig);
  const sourceMode: SafetyFieldExcellenceSourceMode =
    dynamicConfig?.sourceMode ?? 'curated-only';
  const hasCuratedConfig = Boolean(moduleConfig.safetyFieldExcellence);

  return (
    <ZoneErrorBoundary zoneName="safety-field-excellence">
      <section aria-label="Safety and Field Excellence">
        <SafetyFieldExcellenceDynamicProvider
          sourceMode={sourceMode}
          functionAppBaseUrl={dynamicConfig?.functionAppBaseUrl ?? functionAppBaseUrl}
          includeStale={dynamicConfig?.includeStale}
          diagnosticsEnabled={dynamicConfig?.diagnosticsEnabled}
          emergencyUseCuratedFallback={dynamicConfig?.emergencyUseCuratedFallback}
          safetyHubUrl={dynamicConfig?.safetyHubUrl}
          hasCuratedConfig={hasCuratedConfig}
          getFunctionAppToken={getFunctionAppToken}
        >
          {(resolution) => (
            <SafetyFieldExcellence
              config={moduleConfig.safetyFieldExcellence}
              activeAudience={moduleConfig.activeAudience}
              shellRenderMode={shellRenderMode}
              sourceMode={sourceMode}
              dynamicConfig={resolution.config}
              dynamicState={resolution.state}
              dynamicDataSource={resolution.dataSource}
              dynamicErrorMessage={resolution.errorMessage}
              fallbackReason={resolution.fallbackReason}
            />
          )}
        </SafetyFieldExcellenceDynamicProvider>
      </section>
    </ZoneErrorBoundary>
  );
}

function readDynamicConfig(
  moduleConfig: HbHomepageZoneProps['moduleConfig'],
): SafetyFieldExcellenceDynamicConfig | undefined {
  const candidate = (moduleConfig as Record<string, unknown>).safetyFieldExcellenceDynamic;
  if (!candidate || typeof candidate !== 'object') return undefined;
  return candidate as SafetyFieldExcellenceDynamicConfig;
}

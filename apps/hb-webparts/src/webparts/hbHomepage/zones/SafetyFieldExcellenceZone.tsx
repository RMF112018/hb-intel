import * as React from 'react';
import { SafetyFieldExcellence } from '../../safetyFieldExcellence/SafetyFieldExcellence.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

/**
 * Thin shell-owned zone wrapper:
 * - shell owns placement and render mode
 * - child owns safety model/state/rendering
 */
export function SafetyFieldExcellenceZone({ moduleConfig, shellRenderMode }: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="safety-field-excellence">
      <section aria-label="Safety and Field Excellence">
        <SafetyFieldExcellence
          config={moduleConfig.safetyFieldExcellence}
          activeAudience={moduleConfig.activeAudience}
          shellRenderMode={shellRenderMode}
        />
      </section>
    </ZoneErrorBoundary>
  );
}

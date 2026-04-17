import * as React from 'react';
import { SafetyFieldExcellence } from '../../safetyFieldExcellence/SafetyFieldExcellence.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function SafetyFieldExcellenceZone({ moduleConfig }: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="safety-field-excellence">
      <section aria-label="Safety and Field Excellence">
        <SafetyFieldExcellence
          config={moduleConfig.safetyFieldExcellence}
          activeAudience={moduleConfig.activeAudience}
        />
      </section>
    </ZoneErrorBoundary>
  );
}

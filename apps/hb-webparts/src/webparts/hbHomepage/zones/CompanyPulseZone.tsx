import * as React from 'react';
import { CompanyPulse } from '../../companyPulse/CompanyPulse.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function CompanyPulseZone({ config }: HbHomepageZoneProps): React.JSX.Element {
  const zoneConfig = config?.companyPulse as Record<string, unknown> | undefined;
  const activeAudience = typeof config?.activeAudience === 'string' ? config.activeAudience : undefined;

  return (
    <ZoneErrorBoundary zoneName="company-pulse">
      <section aria-label="Company Pulse">
        <CompanyPulse config={zoneConfig} activeAudience={activeAudience} />
      </section>
    </ZoneErrorBoundary>
  );
}

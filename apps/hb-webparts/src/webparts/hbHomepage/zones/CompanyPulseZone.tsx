import * as React from 'react';
import { CompanyPulse } from '../../companyPulse/CompanyPulse.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function CompanyPulseZone({ moduleConfig }: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="company-pulse">
      <section aria-label="Company Pulse">
        <CompanyPulse config={moduleConfig.companyPulse} activeAudience={moduleConfig.activeAudience} />
      </section>
    </ZoneErrorBoundary>
  );
}

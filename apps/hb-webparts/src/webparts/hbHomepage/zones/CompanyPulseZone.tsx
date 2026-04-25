import * as React from 'react';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';
import { FoleonHomepageLaneHost } from './FoleonHomepageLaneHost.js';

export function CompanyPulseZone(props: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="company-pulse">
      <section aria-label="Company Pulse">
        <FoleonHomepageLaneHost
          {...props}
          lane="companyPulse"
          occupantId="company-pulse"
        />
      </section>
    </ZoneErrorBoundary>
  );
}

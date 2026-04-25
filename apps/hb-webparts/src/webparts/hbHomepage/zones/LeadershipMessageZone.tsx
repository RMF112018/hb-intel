import * as React from 'react';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';
import { FoleonHomepageLaneHost } from './FoleonHomepageLaneHost.js';

export function LeadershipMessageZone(props: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="leadership-message">
      <section aria-label="Leadership Message">
        <FoleonHomepageLaneHost
          {...props}
          lane="leadershipMessage"
          occupantId="leadership-message"
        />
      </section>
    </ZoneErrorBoundary>
  );
}

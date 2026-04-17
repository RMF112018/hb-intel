import * as React from 'react';
import { LeadershipMessage } from '../../leadershipMessage/LeadershipMessage.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function LeadershipMessageZone({ config }: HbHomepageZoneProps): React.JSX.Element {
  const zoneConfig = config?.leadershipMessage as Record<string, unknown> | undefined;

  return (
    <ZoneErrorBoundary zoneName="leadership-message">
      <section aria-label="Leadership Message">
        <LeadershipMessage config={zoneConfig} />
      </section>
    </ZoneErrorBoundary>
  );
}
